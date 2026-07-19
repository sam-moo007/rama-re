import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  PayloadTooLargeException,
} from "@nestjs/common";
import {
  EntityResolutionQueueResponseSchema,
  EntityResolutionWorkItemSchema,
  PartnerFileImportCommandSchema,
  PartnerFileImportResultSchema,
  PartnerIngestionBatchSchema,
  ResolveEntityCommandSchema,
  type EntityResolutionQueueResponse,
  type EntityResolutionStatus,
  type EntityResolutionWorkItem,
  type PartnerFileImportResult,
  type RawIngestionRecord,
} from "@rama/contracts";
import { createHash, randomUUID } from "node:crypto";
import type { ZodType } from "zod";

import type { RamaActor } from "../../common/auth/rama-actor";
import { ArtifactSecurityService } from "../artifact-security/artifact-security.service";
import { PropertiesService } from "../properties/properties.service";
import { canonicalJson } from "./canonical-json";
import {
  INGESTION_REPOSITORY,
  IngestionRepositoryConflictError,
  IngestionSourceUnavailableError,
  type IngestionRepository,
} from "./ingestion.repository";
import { parsePartnerCsv, PartnerFileValidationError } from "./partner-csv.adapter";

const positiveLimit = (name: string, fallback: number): number => {
  const value = process.env[name];
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) throw new Error(`${name} must be a positive integer.`);
  return parsed;
};

const decodeBase64 = (value: string): Buffer => {
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(value) || value.length % 4 !== 0) {
    throw new BadRequestException({
      code: "PARTNER_FILE_INVALID_BASE64",
      message: "contentBase64 must contain canonical base64 without whitespace.",
    });
  }
  const bytes = Buffer.from(value, "base64");
  if (bytes.toString("base64") !== value) {
    throw new BadRequestException({
      code: "PARTNER_FILE_INVALID_BASE64",
      message: "contentBase64 is not canonical base64.",
    });
  }
  return bytes;
};

const resolutionStatuses: EntityResolutionStatus[] = ["pending", "matched", "conflict", "rejected"];

@Injectable()
export class PartnerIngestionService {
  constructor(
    @Inject(INGESTION_REPOSITORY)
    private readonly repository: IngestionRepository,
    private readonly propertiesService: PropertiesService,
    private readonly artifactSecurityService: ArtifactSecurityService,
  ) {}

  async importCsv(input: unknown, actor: RamaActor): Promise<PartnerFileImportResult> {
    const command = this.parse(PartnerFileImportCommandSchema, input);
    if (command.schemaVersion !== "rama.partner.csv.v1") {
      throw new BadRequestException({
        code: "PARTNER_SCHEMA_UNSUPPORTED",
        message: `Unsupported partner schema '${command.schemaVersion}'.`,
      });
    }
    if (!new Set(["text/csv", "application/csv"]).has(command.artifact.mimeType.toLowerCase())) {
      throw new BadRequestException({
        code: "PARTNER_FILE_TYPE_UNSUPPORTED",
        message: "The partner CSV adapter accepts only text/csv or application/csv.",
      });
    }

    const bytes = decodeBase64(command.contentBase64);
    const maximumBytes = positiveLimit("PARTNER_FILE_MAX_BYTES", 5_000_000);
    if (bytes.length > maximumBytes) {
      throw new PayloadTooLargeException({
        code: "PARTNER_FILE_TOO_LARGE",
        maximumBytes,
        actualBytes: bytes.length,
      });
    }
    if (bytes.length !== command.artifact.byteSize) {
      throw new BadRequestException({
        code: "PARTNER_FILE_SIZE_MISMATCH",
        declaredBytes: command.artifact.byteSize,
        actualBytes: bytes.length,
      });
    }
    const contentSha256 = createHash("sha256").update(bytes).digest("hex");
    if (contentSha256 !== command.artifact.sha256.toLowerCase()) {
      throw new BadRequestException({
        code: "PARTNER_FILE_CHECKSUM_MISMATCH",
        message: "The partner file bytes do not match the declared artifact checksum.",
      });
    }

    await this.artifactSecurityService.inspectAndStore({
      sourceKey: command.sourceKey,
      batchIdempotencyKey: command.batchIdempotencyKey,
      artifact: { ...command.artifact, sha256: contentSha256 },
      bytes,
      submittedBy: actor.id,
    });

    let rows;
    try {
      rows = parsePartnerCsv(bytes, positiveLimit("PARTNER_FILE_MAX_ROWS", 1_000));
    } catch (error) {
      if (error instanceof PartnerFileValidationError) {
        throw new BadRequestException({
          code: "PARTNER_FILE_INVALID",
          message: error.message,
          row: error.row,
          column: error.column,
        });
      }
      throw error;
    }

    const source = await this.repository.findSource(command.sourceKey);
    if (!source) throw new NotFoundException(`Ingestion source '${command.sourceKey}' was not found.`);
    if (!source.active) throw this.sourceDisabled(source.key);
    if (source.adapterKind !== "partner_file") {
      throw new BadRequestException({
        code: "INGESTION_ADAPTER_MISMATCH",
        message: `Source '${source.key}' does not accept partner files.`,
      });
    }
    const disallowed = rows.find((row) => !source.allowedEvidenceClasses.includes(row.evidenceClass));
    if (disallowed) {
      throw new BadRequestException({
        code: "INGESTION_EVIDENCE_CLASS_NOT_ALLOWED",
        message: `Source '${source.key}' is not approved for '${disallowed.evidenceClass}' evidence.`,
        externalId: disallowed.externalId,
      });
    }

    const maximumPayloadBytes = positiveLimit("INGESTION_MAX_PAYLOAD_BYTES", 262_144);
    for (const row of rows) {
      const size = Buffer.byteLength(canonicalJson(row.payload), "utf8");
      if (size > maximumPayloadBytes) {
        throw new PayloadTooLargeException({
          code: "INGESTION_PAYLOAD_TOO_LARGE",
          externalId: row.externalId,
          maximumBytes: maximumPayloadBytes,
          actualBytes: size,
        });
      }
    }

    const receivedAt = new Date().toISOString();
    const batch = PartnerIngestionBatchSchema.parse({
      id: randomUUID(),
      sourceKey: source.key,
      batchIdempotencyKey: command.batchIdempotencyKey,
      schemaVersion: command.schemaVersion,
      retrievedAt: command.retrievedAt,
      receivedAt,
      submittedBy: actor.id,
      artifact: { ...command.artifact, sha256: contentSha256 },
      contentSha256,
      rowCount: rows.length,
    });
    const records: RawIngestionRecord[] = [];
    const resolutionItems: EntityResolutionWorkItem[] = [];
    for (const row of rows) {
      const rawId = randomUUID();
      const payloadSha256 = createHash("sha256").update(canonicalJson(row.payload)).digest("hex");
      const rawRecord: RawIngestionRecord = {
        id: rawId,
        sourceKey: source.key,
        adapterKind: "partner_file",
        idempotencyKey: `${command.batchIdempotencyKey}:${row.externalId}`,
        schemaVersion: command.schemaVersion,
        propertySlug: row.propertySlug,
        claimKey: row.claimKey,
        evidenceClass: row.evidenceClass,
        retrievedAt: row.retrievedAt,
        receivedAt,
        submittedBy: actor.id,
        externalEntityId: row.externalId,
        partnerBatchId: batch.id,
        payload: row.payload,
        payloadSha256,
        artifact: batch.artifact,
        status: "accepted",
      };
      records.push(rawRecord);
      resolutionItems.push(
        EntityResolutionWorkItemSchema.parse({
          id: randomUUID(),
          rawRecordId: rawId,
          sourceKey: source.key,
          externalEntityId: row.externalId,
          submittedPropertySlug: row.propertySlug,
          status: "pending",
          canonicalPropertySlug: null,
          version: 1,
          assignedTo: "entity-resolution-queue",
          createdAt: receivedAt,
          updatedAt: receivedAt,
          rawRecord,
          auditTrail: [
            {
              id: randomUUID(),
              action: "queued",
              actorId: actor.id,
              reason: "Partner row queued for canonical property resolution.",
              fromStatus: null,
              toStatus: "pending",
              version: 1,
              createdAt: receivedAt,
            },
          ],
        }),
      );
    }

    try {
      const result = await this.repository.ingestPartnerBatch(
        batch,
        bytes,
        records,
        resolutionItems,
        source.version,
      );
      if (
        result.replayedBatch &&
        (result.batch.contentSha256 !== contentSha256 ||
          result.batch.schemaVersion !== batch.schemaVersion ||
          canonicalJson(result.batch.artifact) !== canonicalJson(batch.artifact))
      ) {
        throw new ConflictException({
          code: "PARTNER_BATCH_IDEMPOTENCY_KEY_REUSED",
          message: "The batch idempotency key is already bound to a different partner file.",
        });
      }
      return PartnerFileImportResultSchema.parse(result);
    } catch (error) {
      if (error instanceof IngestionSourceUnavailableError) throw this.sourceDisabled(error.sourceKey);
      if (error instanceof IngestionRepositoryConflictError) throw this.versionConflict(error);
      throw error;
    }
  }

  async getResolutionQueue(): Promise<EntityResolutionQueueResponse> {
    const items = await this.repository.listResolutionItems();
    const counts = Object.fromEntries(resolutionStatuses.map((status) => [status, 0])) as Record<
      EntityResolutionStatus,
      number
    >;
    for (const item of items) counts[item.status] += 1;
    return EntityResolutionQueueResponseSchema.parse({
      items,
      counts,
      generatedAt: new Date().toISOString(),
    });
  }

  async resolveEntity(id: string, input: unknown, actor: RamaActor): Promise<EntityResolutionWorkItem> {
    const command = this.parse(ResolveEntityCommandSchema, input);
    const current = await this.repository.findResolutionItem(id);
    if (!current) throw new NotFoundException(`Entity-resolution item '${id}' was not found.`);
    if (current.version !== command.expectedVersion) {
      throw this.versionConflict(
        new IngestionRepositoryConflictError(id, command.expectedVersion, current.version),
      );
    }
    if (["matched", "rejected"].includes(current.status)) {
      throw new ConflictException({
        code: "ENTITY_RESOLUTION_TERMINAL",
        message: `Entity-resolution item is already '${current.status}'.`,
      });
    }
    if (current.status === command.decision) {
      throw new ConflictException({
        code: "ENTITY_RESOLUTION_NO_CHANGE",
        message: `Entity-resolution item is already '${current.status}'.`,
      });
    }
    if (command.decision === "matched" && command.canonicalPropertySlug) {
      await this.propertiesService.getBySlug(command.canonicalPropertySlug);
    }

    const now = new Date().toISOString();
    const nextVersion = current.version + 1;
    const action =
      command.decision === "matched"
        ? "matched"
        : command.decision === "rejected"
          ? "rejected"
          : "conflict_marked";
    const next = EntityResolutionWorkItemSchema.parse({
      ...current,
      status: command.decision,
      canonicalPropertySlug: command.canonicalPropertySlug,
      version: nextVersion,
      assignedTo: actor.id,
      updatedAt: now,
      auditTrail: [
        ...current.auditTrail,
        {
          id: randomUUID(),
          action,
          actorId: actor.id,
          reason: command.reason,
          fromStatus: current.status,
          toStatus: command.decision,
          version: nextVersion,
          createdAt: now,
        },
      ],
    });
    try {
      return await this.repository.saveResolutionItem(next, current.version);
    } catch (error) {
      if (error instanceof IngestionRepositoryConflictError) throw this.versionConflict(error);
      throw error;
    }
  }

  private sourceDisabled(key: string): ConflictException {
    return new ConflictException({
      code: "INGESTION_SOURCE_DISABLED",
      message: `Ingestion source '${key}' is disabled.`,
    });
  }

  private versionConflict(error: IngestionRepositoryConflictError): ConflictException {
    return new ConflictException({
      code: "INGESTION_VERSION_CONFLICT",
      message: "The ingestion work changed after this view was loaded.",
      expectedVersion: error.expectedVersion,
      currentVersion: error.currentVersion,
    });
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
