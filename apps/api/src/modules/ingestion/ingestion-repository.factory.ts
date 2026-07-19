import { Logger } from "@nestjs/common";
import {
  EntityResolutionWorkItemSchema,
  IngestionSourceSchema,
  PartnerIngestionBatchSchema,
  RawIngestionRecordSchema,
  type EntityResolutionWorkItem,
  type IngestionSource,
  type RawIngestionRecord,
} from "@rama/contracts";
import { createHash, randomUUID } from "node:crypto";

import { createPostgresPool } from "../../common/database/postgres-pool";
import { canonicalJson } from "./canonical-json";
import { InMemoryIngestionRepository } from "./in-memory-ingestion.repository";
import type { IngestionRepository } from "./ingestion.repository";
import { PostgresIngestionRepository } from "./postgres-ingestion.repository";

export type IngestionRepositoryDriver = "memory" | "postgres";

export function resolveIngestionRepositoryDriver(
  environment: NodeJS.ProcessEnv = process.env,
): IngestionRepositoryDriver {
  const configured = (environment.INGESTION_REPOSITORY ?? environment.EVIDENCE_REPOSITORY)
    ?.trim()
    .toLowerCase();
  if (configured === "memory" || configured === "postgres") return configured;
  if (configured) throw new Error("INGESTION_REPOSITORY must be either 'memory' or 'postgres'.");
  return "postgres";
}

const developmentSources = (): IngestionSource[] => {
  const now = new Date().toISOString();
  const source = (
    key: string,
    displayName: IngestionSource["displayName"],
    adapterKind: IngestionSource["adapterKind"],
    reason: string,
  ): IngestionSource =>
    IngestionSourceSchema.parse({
      id: randomUUID(),
      key,
      displayName,
      adapterKind,
      entitlementReference: "DEVELOPMENT-ONLY-PHASE-0",
      allowedEvidenceClasses: [
        "registry_regulator",
        "document_verified",
        "on_site_observed",
        "provider_attested",
        "modelled",
        "unverified_unknown",
      ],
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
          actorId: "phase-0-seed",
          reason,
          version: 1,
          createdAt: now,
        },
      ],
    });

  return [
    source(
      "rama.manual.phase-0",
      { en: "RAMA controlled manual intake", ar: "الإدخال اليدوي المنضبط لراما" },
      "manual",
      "Development-only controlled manual source.",
    ),
    source(
      "rama.partner.phase-0",
      { en: "RAMA partner fixture feed", ar: "تغذية شركاء راما التجريبية" },
      "partner_file",
      "Development-only partner feed for entity-resolution operations.",
    ),
  ];
};

const sha256 = (value: Buffer | string): string =>
  createHash("sha256").update(value).digest("hex");

const seedDevelopmentData = async (repository: IngestionRepository): Promise<boolean> => {
  let seeded = false;
  for (const source of developmentSources()) {
    if (await repository.findSource(source.key)) continue;
    await repository.saveSource(source, null);
    seeded = true;
  }

  const partnerSource = await repository.findSource("rama.partner.phase-0");
  if (!partnerSource) throw new Error("Development partner source could not be seeded.");
  if ((await repository.listResolutionItems()).length > 0) return seeded;

  const now = new Date().toISOString();
  const rawContent = Buffer.from(
    "external_id,property_slug,claim_key,evidence_class,retrieved_at,payload_json\nDEV-1204,residence-1204,service_charge,document_verified,2026-07-18T00:00:00.000Z,{fixture}\nDEV-1204-B,residence-1204,title_status,registry_regulator,2026-07-18T00:00:00.000Z,{fixture}\n",
    "utf8",
  );
  const batchId = randomUUID();
  const batch = PartnerIngestionBatchSchema.parse({
    id: batchId,
    sourceKey: partnerSource.key,
    batchIdempotencyKey: "phase-0-fixture",
    schemaVersion: "rama.partner.csv.v1",
    retrievedAt: now,
    receivedAt: now,
    submittedBy: "phase-0-seed",
    artifact: {
      objectKey: "development/partner/phase-0-fixture.csv",
      sha256: sha256(rawContent),
      mimeType: "text/csv",
      byteSize: rawContent.byteLength,
      capturedAt: now,
    },
    contentSha256: sha256(rawContent),
    rowCount: 2,
  });
  const fixtures = [
    {
      externalEntityId: "DEV-1204",
      claimKey: "service_charge",
      evidenceClass: "document_verified" as const,
      status: "accepted" as const,
      payload: { annualAedPerSqFt: 18.5, sourceDocument: "2026 service-charge schedule" },
    },
    {
      externalEntityId: "DEV-1204-B",
      claimKey: "title_status",
      evidenceClass: "registry_regulator" as const,
      status: "quarantined" as const,
      payload: { titleStatus: "registered", sourceReference: "DLD-DEMO-1204" },
    },
  ];
  const records: RawIngestionRecord[] = [];
  const resolutionItems: EntityResolutionWorkItem[] = [];
  for (const fixture of fixtures) {
    const rawRecord = RawIngestionRecordSchema.parse({
      id: randomUUID(),
      sourceKey: partnerSource.key,
      adapterKind: "partner_file",
      idempotencyKey: `phase-0-fixture:${fixture.externalEntityId}`,
      schemaVersion: batch.schemaVersion,
      propertySlug: "residence-1204",
      claimKey: fixture.claimKey,
      evidenceClass: fixture.evidenceClass,
      retrievedAt: now,
      receivedAt: now,
      submittedBy: "phase-0-seed",
      externalEntityId: fixture.externalEntityId,
      partnerBatchId: batchId,
      payload: fixture.payload,
      payloadSha256: sha256(canonicalJson(fixture.payload)),
      artifact: batch.artifact,
      status: fixture.status,
    });
    records.push(rawRecord);
    resolutionItems.push(
      EntityResolutionWorkItemSchema.parse({
        id: randomUUID(),
        rawRecordId: rawRecord.id,
        sourceKey: partnerSource.key,
        externalEntityId: fixture.externalEntityId,
        submittedPropertySlug: rawRecord.propertySlug,
        status: "pending",
        canonicalPropertySlug: null,
        version: 1,
        assignedTo: "entity-resolution-queue",
        createdAt: now,
        updatedAt: now,
        rawRecord,
        auditTrail: [
          {
            id: randomUUID(),
            action: "queued",
            actorId: "phase-0-seed",
            reason: "Development fixture queued for canonical property resolution.",
            fromStatus: null,
            toStatus: "pending",
            version: 1,
            createdAt: now,
          },
        ],
      }),
    );
  }
  await repository.ingestPartnerBatch(
    batch,
    rawContent,
    records,
    resolutionItems,
    partnerSource.version,
  );
  return true;
};

export async function createIngestionRepository(
  environment: NodeJS.ProcessEnv = process.env,
): Promise<IngestionRepository> {
  const driver = resolveIngestionRepositoryDriver(environment);
  if (driver === "memory") {
    const repository = new InMemoryIngestionRepository();
    await seedDevelopmentData(repository);
    Logger.warn("Raw ingestion is using volatile in-memory persistence.", "IngestionRepository");
    return repository;
  }

  const seedFixtures = environment.INGESTION_SEED_FIXTURES === "true";
  if (seedFixtures && environment.NODE_ENV === "production") {
    throw new Error("INGESTION_SEED_FIXTURES cannot be enabled in production.");
  }

  const repository = new PostgresIngestionRepository(
    createPostgresPool(environment, "rama-api-ingestion"),
  );
  try {
    await repository.checkConnection();
    if (seedFixtures) await seedDevelopmentData(repository);
    Logger.log("Raw ingestion is using PostgreSQL persistence.", "IngestionRepository");
    return repository;
  } catch (error) {
    await repository.onModuleDestroy();
    throw error;
  }
}
