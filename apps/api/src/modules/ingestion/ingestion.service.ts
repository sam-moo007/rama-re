import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  PayloadTooLargeException,
} from "@nestjs/common";
import {
  CreateIngestionSourceCommandSchema,
  IngestionRecordListResponseSchema,
  IngestionSourceSchema,
  ManualIngestionCommandSchema,
  ManualIngestionResultSchema,
  SetIngestionSourceStateCommandSchema,
  type IngestionRecordListResponse,
  type IngestionSource,
  type ManualIngestionCommand,
  type ManualIngestionResult,
  type RawIngestionRecord,
} from "@rama/contracts";
import { createHash, randomUUID } from "node:crypto";
import type { ZodType } from "zod";

import type { RamaActor } from "../../common/auth/rama-actor";
import { canonicalJson } from "./canonical-json";
import {
  INGESTION_REPOSITORY,
  IngestionRepositoryConflictError,
  IngestionSourceUnavailableError,
  type IngestionRepository,
} from "./ingestion.repository";

const payloadLimit = (): number => {
  const configured = process.env.INGESTION_MAX_PAYLOAD_BYTES;
  if (!configured) return 262_144;
  const parsed = Number(configured);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error("INGESTION_MAX_PAYLOAD_BYTES must be a positive integer.");
  }
  return parsed;
};

@Injectable()
export class IngestionService {
  constructor(
    @Inject(INGESTION_REPOSITORY)
    private readonly repository: IngestionRepository,
  ) {}

  listSources(): Promise<IngestionSource[]> {
    return this.repository.listSources();
  }

  async createSource(input: unknown, actor: RamaActor): Promise<IngestionSource> {
    const command = this.parse(CreateIngestionSourceCommandSchema, input);
    const now = new Date().toISOString();
    const source = IngestionSourceSchema.parse({
      id: randomUUID(),
      key: command.key,
      displayName: command.displayName,
      adapterKind: command.adapterKind,
      entitlementReference: command.entitlementReference,
      allowedEvidenceClasses: [...new Set(command.allowedEvidenceClasses)],
      active: true,
      version: 1,
      createdAt: now,
      updatedAt: now,
      disabledAt: null,
      disabledBy: null,
      disabledReason: null,
      auditTrail: [
        {
          id: randomUUID(),
          action: "created",
          actorId: actor.id,
          reason: command.reason,
          version: 1,
          createdAt: now,
        },
      ],
    });
    return this.persistSource(source, null);
  }

  disableSource(key: string, input: unknown, actor: RamaActor): Promise<IngestionSource> {
    return this.setSourceState(key, false, input, actor);
  }

  enableSource(key: string, input: unknown, actor: RamaActor): Promise<IngestionSource> {
    return this.setSourceState(key, true, input, actor);
  }

  async ingestManual(input: unknown, actor: RamaActor): Promise<ManualIngestionResult> {
    const command = this.parse(ManualIngestionCommandSchema, input);
    const source = await this.repository.findSource(command.sourceKey);
    if (!source) throw new NotFoundException(`Ingestion source '${command.sourceKey}' was not found.`);
    if (!source.active) {
      throw new ConflictException({
        code: "INGESTION_SOURCE_DISABLED",
        message: `Ingestion source '${command.sourceKey}' is disabled.`,
      });
    }
    if (source.adapterKind !== "manual") {
      throw new BadRequestException({
        code: "INGESTION_ADAPTER_MISMATCH",
        message: `Source '${source.key}' does not accept manual envelopes.`,
      });
    }
    if (!source.allowedEvidenceClasses.includes(command.evidenceClass)) {
      throw new BadRequestException({
        code: "INGESTION_EVIDENCE_CLASS_NOT_ALLOWED",
        message: `Source '${source.key}' is not approved for '${command.evidenceClass}' evidence.`,
      });
    }

    const serializedPayload = canonicalJson(command.payload);
    const payloadBytes = Buffer.byteLength(serializedPayload, "utf8");
    if (payloadBytes > payloadLimit()) {
      throw new PayloadTooLargeException({
        code: "INGESTION_PAYLOAD_TOO_LARGE",
        maximumBytes: payloadLimit(),
        actualBytes: payloadBytes,
      });
    }
    const payloadSha256 = createHash("sha256").update(serializedPayload).digest("hex");
    const record: RawIngestionRecord = {
      id: randomUUID(),
      sourceKey: source.key,
      adapterKind: source.adapterKind,
      idempotencyKey: command.idempotencyKey,
      schemaVersion: command.schemaVersion,
      propertySlug: command.propertySlug,
      claimKey: command.claimKey,
      evidenceClass: command.evidenceClass,
      retrievedAt: command.retrievedAt,
      receivedAt: new Date().toISOString(),
      submittedBy: actor.id,
      externalEntityId: null,
      partnerBatchId: null,
      payload: command.payload,
      payloadSha256,
      artifact: command.artifact,
      status: "accepted",
    };

    try {
      const result = await this.repository.ingest(record, source.version);
      if (result.replayed && !this.isSameEnvelope(result.record, command, payloadSha256)) {
        throw new ConflictException({
          code: "INGESTION_IDEMPOTENCY_KEY_REUSED",
          message: "The idempotency key is already bound to a different ingestion envelope.",
        });
      }
      return ManualIngestionResultSchema.parse(result);
    } catch (error) {
      if (error instanceof IngestionSourceUnavailableError) {
        throw new ConflictException({
          code: "INGESTION_SOURCE_DISABLED",
          message: `Ingestion source '${error.sourceKey}' was disabled before the envelope landed.`,
        });
      }
      if (error instanceof IngestionRepositoryConflictError) throw this.versionConflict(error);
      throw error;
    }
  }

  async listRecords(limitInput: string | undefined): Promise<IngestionRecordListResponse> {
    const limit = limitInput === undefined ? 50 : Number(limitInput);
    if (!Number.isInteger(limit) || limit < 1 || limit > 200) {
      throw new BadRequestException("limit must be an integer between 1 and 200.");
    }
    return IngestionRecordListResponseSchema.parse({
      items: await this.repository.listRecords(limit),
      generatedAt: new Date().toISOString(),
    });
  }

  private async setSourceState(
    key: string,
    active: boolean,
    input: unknown,
    actor: RamaActor,
  ): Promise<IngestionSource> {
    const command = this.parse(SetIngestionSourceStateCommandSchema, input);
    const current = await this.repository.findSource(key);
    if (!current) throw new NotFoundException(`Ingestion source '${key}' was not found.`);
    if (current.version !== command.expectedVersion) {
      throw this.versionConflict(
        new IngestionRepositoryConflictError(key, command.expectedVersion, current.version),
      );
    }
    if (current.active === active) {
      throw new ConflictException({
        code: active ? "INGESTION_SOURCE_ALREADY_ACTIVE" : "INGESTION_SOURCE_ALREADY_DISABLED",
        message: `Ingestion source '${key}' is already ${active ? "active" : "disabled"}.`,
      });
    }

    const now = new Date().toISOString();
    const next = IngestionSourceSchema.parse({
      ...current,
      active,
      version: current.version + 1,
      updatedAt: now,
      disabledAt: active ? null : now,
      disabledBy: active ? null : actor.id,
      disabledReason: active ? null : command.reason,
      auditTrail: [
        ...current.auditTrail,
        {
          id: randomUUID(),
          action: active ? "enabled" : "disabled",
          actorId: actor.id,
          reason: command.reason,
          version: current.version + 1,
          createdAt: now,
        },
      ],
    });
    return this.persistSource(next, current.version);
  }

  private async persistSource(
    source: IngestionSource,
    expectedVersion: number | null,
  ): Promise<IngestionSource> {
    try {
      return await this.repository.saveSource(source, expectedVersion);
    } catch (error) {
      if (error instanceof IngestionRepositoryConflictError) throw this.versionConflict(error);
      throw error;
    }
  }

  private versionConflict(error: IngestionRepositoryConflictError): ConflictException {
    return new ConflictException({
      code: "INGESTION_VERSION_CONFLICT",
      message: "The ingestion source changed after this view was loaded.",
      expectedVersion: error.expectedVersion,
      currentVersion: error.currentVersion,
    });
  }

  private isSameEnvelope(
    existing: RawIngestionRecord,
    command: ManualIngestionCommand,
    payloadSha256: string,
  ): boolean {
    return (
      existing.payloadSha256 === payloadSha256 &&
      existing.schemaVersion === command.schemaVersion &&
      existing.propertySlug === command.propertySlug &&
      existing.claimKey === command.claimKey &&
      existing.evidenceClass === command.evidenceClass &&
      existing.retrievedAt === command.retrievedAt &&
      canonicalJson(existing.artifact) === canonicalJson(command.artifact)
    );
  }

  private parse<T>(schema: ZodType<T>, input: unknown): T {
    const result = schema.safeParse(input);
    if (!result.success) {
      throw new BadRequestException({
        code: "INVALID_INGESTION_COMMAND",
        issues: result.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
      });
    }
    return result.data;
  }
}
