import { Injectable, type OnModuleDestroy } from "@nestjs/common";
import {
  EntityResolutionWorkItemSchema,
  IngestionSourceSchema,
  ManualIngestionResultSchema,
  PartnerFileImportResultSchema,
  PartnerIngestionBatchSchema,
  RawIngestionRecordSchema,
  type EntityResolutionWorkItem,
  type IngestionSource,
  type ManualIngestionResult,
  type PartnerFileImportResult,
  type PartnerIngestionBatch,
  type RawIngestionRecord,
} from "@rama/contracts";
import { Pool, type PoolClient, type QueryResultRow } from "pg";

import {
  IngestionRepositoryConflictError,
  IngestionSourceUnavailableError,
  type IngestionRepository,
} from "./ingestion.repository";

type SourceRow = QueryResultRow & {
  id: string;
  source_key: string;
  display_name: unknown;
  adapter_kind: IngestionSource["adapterKind"];
  entitlement_reference: string;
  allowed_evidence_classes: unknown;
  active: boolean;
  version: number;
  created_at: Date | string;
  updated_at: Date | string;
  disabled_at: Date | string | null;
  disabled_by: string | null;
  disabled_reason: string | null;
};

type SourceEventRow = QueryResultRow & {
  source_id: string;
  id: string;
  action: IngestionSource["auditTrail"][number]["action"];
  actor_id: string;
  reason: string;
  version: number;
  created_at: Date | string;
};

type RecordRow = QueryResultRow & {
  id: string;
  source_key: string;
  adapter_kind: RawIngestionRecord["adapterKind"];
  idempotency_key: string;
  schema_version: string;
  property_slug: string;
  claim_key: string;
  evidence_class: RawIngestionRecord["evidenceClass"];
  retrieved_at: Date | string;
  received_at: Date | string;
  submitted_by: string;
  external_entity_id: string | null;
  partner_batch_id: string | null;
  payload: Record<string, unknown>;
  payload_sha256: string;
  artifact_object_key: string;
  artifact_sha256: string;
  artifact_mime_type: string;
  artifact_byte_size: string | number;
  artifact_captured_at: Date | string | null;
  status: RawIngestionRecord["status"];
};

type BatchRow = QueryResultRow & {
  id: string;
  source_key: string;
  batch_idempotency_key: string;
  schema_version: string;
  retrieved_at: Date | string;
  received_at: Date | string;
  submitted_by: string;
  artifact_object_key: string;
  artifact_sha256: string;
  artifact_mime_type: string;
  artifact_byte_size: string | number;
  artifact_captured_at: Date | string | null;
  content_sha256: string;
  row_count: number;
};

type ResolutionRow = QueryResultRow & {
  id: string;
  raw_record_id: string;
  source_key: string;
  external_entity_id: string;
  submitted_property_slug: string;
  status: EntityResolutionWorkItem["status"];
  canonical_property_slug: string | null;
  version: number;
  assigned_to: string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

type ResolutionEventRow = QueryResultRow & {
  work_item_id: string;
  id: string;
  action: EntityResolutionWorkItem["auditTrail"][number]["action"];
  actor_id: string;
  reason: string;
  from_status: EntityResolutionWorkItem["status"] | null;
  to_status: EntityResolutionWorkItem["status"];
  version: number;
  created_at: Date | string;
};

const sourceSelect = `
  SELECT id, source_key, display_name, adapter_kind, entitlement_reference,
    allowed_evidence_classes, active, version, created_at, updated_at,
    disabled_at, disabled_by, disabled_reason
  FROM ingestion_sources
`;

const recordSelect = `
  SELECT r.id, s.source_key, r.adapter_kind, r.idempotency_key, r.schema_version,
    r.property_slug, r.claim_key, r.evidence_class, r.retrieved_at, r.received_at,
    r.submitted_by, r.external_entity_id, r.partner_batch_id,
    r.payload, r.payload_sha256, r.artifact_object_key,
    r.artifact_sha256, r.artifact_mime_type, r.artifact_byte_size,
    r.artifact_captured_at, r.status
  FROM raw_ingestion_records r
  JOIN ingestion_sources s ON s.id = r.source_id
`;

const batchSelect = `
  SELECT b.id, s.source_key, b.batch_idempotency_key, b.schema_version,
    b.retrieved_at, b.received_at, b.submitted_by, b.artifact_object_key,
    b.artifact_sha256, b.artifact_mime_type, b.artifact_byte_size,
    b.artifact_captured_at, b.content_sha256, b.row_count
  FROM partner_ingestion_batches b
  JOIN ingestion_sources s ON s.id = b.source_id
`;

const resolutionSelect = `
  SELECT w.id, w.raw_record_id, s.source_key, w.external_entity_id,
    w.submitted_property_slug, w.status, w.canonical_property_slug,
    w.version, w.assigned_to, w.created_at, w.updated_at
  FROM entity_resolution_work_items w
  JOIN raw_ingestion_records r ON r.id = w.raw_record_id
  JOIN ingestion_sources s ON s.id = r.source_id
`;

const toIso = (value: Date | string): string =>
  value instanceof Date ? value.toISOString() : new Date(value).toISOString();

const toNullableIso = (value: Date | string | null): string | null =>
  value === null ? null : toIso(value);

const placeholders = (count: number): string =>
  Array.from({ length: count }, (_, index) => `$${index + 1}`).join(", ");

const parsePostgresArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string" && value.startsWith("{") && value.endsWith("}")) {
    const body = value.slice(1, -1);
    return body ? body.split(",").map((item) => item.replace(/^"|"$/g, "")) : [];
  }
  throw new Error("PostgreSQL returned an invalid evidence-class array.");
};

@Injectable()
export class PostgresIngestionRepository implements IngestionRepository, OnModuleDestroy {
  constructor(private readonly pool: Pool) {}

  async checkConnection(): Promise<void> {
    await this.pool.query("SELECT 1");
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }

  async listSources(): Promise<IngestionSource[]> {
    const result = await this.pool.query<SourceRow>(`${sourceSelect} ORDER BY source_key`);
    return this.hydrateSources(result.rows);
  }

  async findSource(key: string): Promise<IngestionSource | null> {
    const result = await this.pool.query<SourceRow>(`${sourceSelect} WHERE source_key = $1`, [key]);
    const [source] = await this.hydrateSources(result.rows);
    return source ?? null;
  }

  async saveSource(source: IngestionSource, expectedVersion: number | null): Promise<IngestionSource> {
    const validated = IngestionSourceSchema.parse(source);
    if (validated.version !== (expectedVersion ?? 0) + 1) {
      throw new IngestionRepositoryConflictError(validated.key, expectedVersion, null);
    }
    const newEvents = validated.auditTrail.filter(
      (event) => expectedVersion === null || event.version > expectedVersion,
    );
    if (newEvents.length !== 1 || newEvents[0]?.version !== validated.version) {
      throw new Error("Each source save must append exactly one audit event for the new version.");
    }

    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const current = await client.query<{ id: string; version: number }>(
        "SELECT id, version FROM ingestion_sources WHERE source_key = $1 FOR UPDATE",
        [validated.key],
      );
      const currentVersion = current.rows[0]?.version ?? null;
      if (currentVersion !== expectedVersion) {
        throw new IngestionRepositoryConflictError(validated.key, expectedVersion, currentVersion);
      }

      if (expectedVersion === null) {
        await client.query(
          `INSERT INTO ingestion_sources (
             id, source_key, display_name, adapter_kind, entitlement_reference,
             allowed_evidence_classes, active, version, created_at, updated_at,
             disabled_at, disabled_by, disabled_reason
           ) VALUES ($1, $2, $3::jsonb, $4, $5, $6::evidence_class[], $7, $8, $9, $10, $11, $12, $13)`,
          this.sourceValues(validated),
        );
      } else {
        const updated = await client.query(
          `UPDATE ingestion_sources SET
             display_name = $3::jsonb,
             adapter_kind = $4,
             entitlement_reference = $5,
             allowed_evidence_classes = $6::evidence_class[],
             active = $7,
             version = $8,
             updated_at = $10,
             disabled_at = $11,
             disabled_by = $12,
             disabled_reason = $13
           WHERE source_key = $2 AND version = $14`,
          [...this.sourceValues(validated), expectedVersion],
        );
        if (updated.rowCount !== 1) {
          throw new IngestionRepositoryConflictError(validated.key, expectedVersion, currentVersion);
        }
      }

      for (const event of newEvents) {
        await client.query(
          `INSERT INTO ingestion_source_events
            (id, source_id, action, actor_id, reason, version, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            event.id,
            validated.id,
            event.action,
            event.actorId,
            event.reason,
            event.version,
            event.createdAt,
          ],
        );
      }
      await client.query("COMMIT");
      return validated;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async listRecords(limit: number): Promise<RawIngestionRecord[]> {
    const result = await this.pool.query<RecordRow>(
      `${recordSelect} ORDER BY r.received_at DESC, r.id LIMIT $1`,
      [limit],
    );
    return result.rows.map((row) => this.mapRecord(row));
  }

  async ingest(
    record: RawIngestionRecord,
    expectedSourceVersion: number,
  ): Promise<ManualIngestionResult> {
    const validated = RawIngestionRecordSchema.parse(record);
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const sourceId = await this.lockSource(client, validated.sourceKey, expectedSourceVersion);
      const result = await this.landRecord(client, sourceId, validated);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async ingestPartnerBatch(
    batch: PartnerIngestionBatch,
    rawContent: Buffer,
    records: RawIngestionRecord[],
    resolutionItems: EntityResolutionWorkItem[],
    expectedSourceVersion: number,
  ): Promise<PartnerFileImportResult> {
    const validatedBatch = PartnerIngestionBatchSchema.parse(batch);
    if (records.length !== validatedBatch.rowCount || resolutionItems.length !== records.length) {
      throw new Error("Partner batch row, record and resolution counts must match.");
    }
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const sourceId = await this.lockSource(
        client,
        validatedBatch.sourceKey,
        expectedSourceVersion,
      );
      const existing = await client.query<BatchRow>(
        `${batchSelect} WHERE b.source_id = $1 AND b.batch_idempotency_key = $2`,
        [sourceId, validatedBatch.batchIdempotencyKey],
      );
      if (existing.rows[0]) {
        const result = await this.loadBatchResult(client, existing.rows[0], true);
        await client.query("COMMIT");
        return result;
      }

      await client.query(
        `INSERT INTO partner_ingestion_batches (
           id, source_id, batch_idempotency_key, schema_version, retrieved_at,
           received_at, submitted_by, artifact_object_key, artifact_sha256,
           artifact_mime_type, artifact_byte_size, artifact_captured_at,
           content_sha256, raw_content, row_count
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          validatedBatch.id,
          sourceId,
          validatedBatch.batchIdempotencyKey,
          validatedBatch.schemaVersion,
          validatedBatch.retrievedAt,
          validatedBatch.receivedAt,
          validatedBatch.submittedBy,
          validatedBatch.artifact.objectKey,
          validatedBatch.artifact.sha256,
          validatedBatch.artifact.mimeType,
          validatedBatch.artifact.byteSize,
          validatedBatch.artifact.capturedAt,
          validatedBatch.contentSha256,
          rawContent,
          validatedBatch.rowCount,
        ],
      );

      const results: ManualIngestionResult[] = [];
      const landedResolution: EntityResolutionWorkItem[] = [];
      for (const [index, inputRecord] of records.entries()) {
        const record = RawIngestionRecordSchema.parse(inputRecord);
        if (record.partnerBatchId !== validatedBatch.id) {
          throw new Error("Partner record batch identity does not match its batch.");
        }
        const result = await this.landRecord(client, sourceId, record);
        results.push(result);
        await client.query(
          `INSERT INTO partner_batch_records (batch_id, row_index, raw_record_id, replayed)
           VALUES ($1, $2, $3, $4)`,
          [validatedBatch.id, index, result.record.id, result.replayed],
        );
        if (!result.replayed) {
          const candidate = this.resolutionForLanding(
            EntityResolutionWorkItemSchema.parse(resolutionItems[index]),
            result.record,
          );
          await this.insertResolutionItem(client, candidate);
          landedResolution.push(candidate);
        } else {
          const existingResolution = await client.query<ResolutionRow>(
            `${resolutionSelect} WHERE w.raw_record_id = $1`,
            [result.record.id],
          );
          const [item] = await this.hydrateResolutionItems(client, existingResolution.rows);
          if (item) landedResolution.push(item);
        }
      }

      await client.query("COMMIT");
      return this.partnerResult(validatedBatch, false, results, landedResolution);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async listResolutionItems(): Promise<EntityResolutionWorkItem[]> {
    const result = await this.pool.query<ResolutionRow>(
      `${resolutionSelect} ORDER BY w.updated_at DESC, w.id`,
    );
    return this.hydrateResolutionItems(this.pool, result.rows);
  }

  async findResolutionItem(id: string): Promise<EntityResolutionWorkItem | null> {
    const result = await this.pool.query<ResolutionRow>(`${resolutionSelect} WHERE w.id = $1`, [id]);
    const [item] = await this.hydrateResolutionItems(this.pool, result.rows);
    return item ?? null;
  }

  async saveResolutionItem(
    item: EntityResolutionWorkItem,
    expectedVersion: number,
  ): Promise<EntityResolutionWorkItem> {
    const validated = EntityResolutionWorkItemSchema.parse(item);
    if (validated.version !== expectedVersion + 1) {
      throw new IngestionRepositoryConflictError(validated.id, expectedVersion, null);
    }
    const events = validated.auditTrail.filter((event) => event.version > expectedVersion);
    if (events.length !== 1 || events[0]?.version !== validated.version) {
      throw new Error("Each resolution save must append exactly one audit event.");
    }
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const updated = await client.query(
        `UPDATE entity_resolution_work_items SET
           status = $2, canonical_property_slug = $3, version = $4,
           assigned_to = $5, updated_at = $6
         WHERE id = $1 AND version = $7`,
        [
          validated.id,
          validated.status,
          validated.canonicalPropertySlug,
          validated.version,
          validated.assignedTo,
          validated.updatedAt,
          expectedVersion,
        ],
      );
      if (updated.rowCount !== 1) {
        const current = await client.query<{ version: number }>(
          "SELECT version FROM entity_resolution_work_items WHERE id = $1",
          [validated.id],
        );
        throw new IngestionRepositoryConflictError(
          validated.id,
          expectedVersion,
          current.rows[0]?.version ?? null,
        );
      }
      await this.insertResolutionEvent(client, validated.id, events[0]);
      await client.query("COMMIT");
      return validated;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  private async lockSource(
    client: PoolClient,
    sourceKey: string,
    expectedVersion: number,
  ): Promise<string> {
    const result = await client.query<{ id: string; active: boolean; version: number }>(
      "SELECT id, active, version FROM ingestion_sources WHERE source_key = $1 FOR UPDATE",
      [sourceKey],
    );
    const source = result.rows[0];
    if (!source?.active) throw new IngestionSourceUnavailableError(sourceKey);
    if (source.version !== expectedVersion) {
      throw new IngestionRepositoryConflictError(sourceKey, expectedVersion, source.version);
    }
    return source.id;
  }

  private async landRecord(
    client: PoolClient,
    sourceId: string,
    validated: RawIngestionRecord,
  ): Promise<ManualIngestionResult> {
    const idempotent = await client.query<RecordRow>(
      `${recordSelect} WHERE r.source_id = $1 AND r.idempotency_key = $2`,
      [sourceId, validated.idempotencyKey],
    );
    if (idempotent.rows[0]) {
      return ManualIngestionResultSchema.parse({
        record: this.mapRecord(idempotent.rows[0]),
        replayed: true,
      });
    }

    const checksumMatch = await client.query<RecordRow>(
      `${recordSelect}
       WHERE r.source_id = $1 AND r.property_slug = $2 AND r.claim_key = $3 AND r.artifact_sha256 = $4
       ORDER BY r.received_at LIMIT 1`,
      [sourceId, validated.propertySlug, validated.claimKey, validated.artifact.sha256],
    );
    if (checksumMatch.rows[0]?.payload_sha256 === validated.payloadSha256) {
      return ManualIngestionResultSchema.parse({
        record: this.mapRecord(checksumMatch.rows[0]),
        replayed: true,
      });
    }

    const status = checksumMatch.rows[0] ? "quarantined" : validated.status;
    await client.query(
      `INSERT INTO raw_ingestion_records (
         id, source_id, adapter_kind, idempotency_key, schema_version, property_slug,
         claim_key, evidence_class, retrieved_at, received_at, submitted_by,
         external_entity_id, partner_batch_id, payload, payload_sha256,
         artifact_object_key, artifact_sha256, artifact_mime_type,
         artifact_byte_size, artifact_captured_at, status
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14::jsonb,
         $15, $16, $17, $18, $19, $20, $21
       )`,
      [
        validated.id,
        sourceId,
        validated.adapterKind,
        validated.idempotencyKey,
        validated.schemaVersion,
        validated.propertySlug,
        validated.claimKey,
        validated.evidenceClass,
        validated.retrievedAt,
        validated.receivedAt,
        validated.submittedBy,
        validated.externalEntityId,
        validated.partnerBatchId,
        JSON.stringify(validated.payload),
        validated.payloadSha256,
        validated.artifact.objectKey,
        validated.artifact.sha256,
        validated.artifact.mimeType,
        validated.artifact.byteSize,
        validated.artifact.capturedAt,
        status,
      ],
    );
    return ManualIngestionResultSchema.parse({
      record: { ...validated, status },
      replayed: false,
    });
  }

  private async loadBatchResult(
    client: PoolClient,
    row: BatchRow,
    replayedBatch: boolean,
  ): Promise<PartnerFileImportResult> {
    const associations = await client.query<{
      row_index: number;
      raw_record_id: string;
      replayed: boolean;
    }>(
      `SELECT row_index, raw_record_id, replayed
       FROM partner_batch_records WHERE batch_id = $1 ORDER BY row_index`,
      [row.id],
    );
    const ids = associations.rows.map(({ raw_record_id }) => raw_record_id);
    if (ids.length === 0) throw new Error(`Partner batch '${row.id}' has no row associations.`);
    const records = await client.query<RecordRow>(
      `${recordSelect} WHERE r.id IN (${placeholders(ids.length)})`,
      ids,
    );
    const byId = new Map(records.rows.map((record) => [record.id, this.mapRecord(record)]));
    const results = associations.rows.map((association) => {
      const record = byId.get(association.raw_record_id);
      if (!record) throw new Error("Partner batch references a missing raw ingestion record.");
      return ManualIngestionResultSchema.parse({ record, replayed: true });
    });
    const resolutionRows = await client.query<ResolutionRow>(
      `${resolutionSelect} WHERE w.raw_record_id IN (${placeholders(ids.length)})`,
      ids,
    );
    const resolution = await this.hydrateResolutionItems(client, resolutionRows.rows);
    return this.partnerResult(this.mapBatch(row), replayedBatch, results, resolution);
  }

  private resolutionForLanding(
    candidate: EntityResolutionWorkItem,
    record: RawIngestionRecord,
  ): EntityResolutionWorkItem {
    const [event] = candidate.auditTrail;
    if (!event) throw new Error("Resolution work requires its queued audit event.");
    return EntityResolutionWorkItemSchema.parse({
      ...candidate,
      rawRecord: record,
      ...(record.status === "quarantined"
        ? {
            status: "conflict",
            auditTrail: [
              {
                ...event,
                reason: `Checksum conflict detected during landing. ${event.reason}`,
                toStatus: "conflict",
              },
            ],
          }
        : {}),
    });
  }

  private async insertResolutionItem(
    client: PoolClient,
    item: EntityResolutionWorkItem,
  ): Promise<void> {
    await client.query(
      `INSERT INTO entity_resolution_work_items (
         id, raw_record_id, external_entity_id, submitted_property_slug, status,
         canonical_property_slug, version, assigned_to, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        item.id,
        item.rawRecordId,
        item.externalEntityId,
        item.submittedPropertySlug,
        item.status,
        item.canonicalPropertySlug,
        item.version,
        item.assignedTo,
        item.createdAt,
        item.updatedAt,
      ],
    );
    const [event] = item.auditTrail;
    if (!event) throw new Error("Resolution work requires an initial audit event.");
    await this.insertResolutionEvent(client, item.id, event);
  }

  private async insertResolutionEvent(
    client: PoolClient,
    itemId: string,
    event: EntityResolutionWorkItem["auditTrail"][number],
  ): Promise<void> {
    await client.query(
      `INSERT INTO entity_resolution_events (
         id, work_item_id, action, actor_id, reason, from_status,
         to_status, version, created_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        event.id,
        itemId,
        event.action,
        event.actorId,
        event.reason,
        event.fromStatus,
        event.toStatus,
        event.version,
        event.createdAt,
      ],
    );
  }

  private async hydrateResolutionItems(
    queryable: Pool | PoolClient,
    rows: ResolutionRow[],
  ): Promise<EntityResolutionWorkItem[]> {
    if (rows.length === 0) return [];
    const ids = rows.map(({ id }) => id);
    const rawRecordIds = rows.map(({ raw_record_id }) => raw_record_id);
    const rawRecords = await queryable.query<RecordRow>(
      `${recordSelect} WHERE r.id IN (${placeholders(rawRecordIds.length)})`,
      rawRecordIds,
    );
    const rawRecordsById = new Map(
      rawRecords.rows.map((record) => [record.id, this.mapRecord(record)]),
    );
    const events = await queryable.query<ResolutionEventRow>(
      `SELECT work_item_id, id, action, actor_id, reason, from_status,
        to_status, version, created_at
       FROM entity_resolution_events
       WHERE work_item_id IN (${placeholders(ids.length)})
       ORDER BY version, id`,
      ids,
    );
    return rows.map((row) => {
      const rawRecord = rawRecordsById.get(row.raw_record_id);
      if (!rawRecord) throw new Error("Entity-resolution work references a missing raw record.");
      return EntityResolutionWorkItemSchema.parse({
        id: row.id,
        rawRecordId: row.raw_record_id,
        sourceKey: row.source_key,
        externalEntityId: row.external_entity_id,
        submittedPropertySlug: row.submitted_property_slug,
        status: row.status,
        canonicalPropertySlug: row.canonical_property_slug,
        version: Number(row.version),
        assignedTo: row.assigned_to,
        createdAt: toIso(row.created_at),
        updatedAt: toIso(row.updated_at),
        rawRecord,
        auditTrail: events.rows
          .filter(({ work_item_id }) => work_item_id === row.id)
          .map((event) => ({
            id: event.id,
            action: event.action,
            actorId: event.actor_id,
            reason: event.reason,
            fromStatus: event.from_status,
            toStatus: event.to_status,
            version: Number(event.version),
            createdAt: toIso(event.created_at),
          })),
      });
    });
  }

  private partnerResult(
    batch: PartnerIngestionBatch,
    replayedBatch: boolean,
    records: ManualIngestionResult[],
    resolutionItems: EntityResolutionWorkItem[],
  ): PartnerFileImportResult {
    return PartnerFileImportResultSchema.parse({
      batch,
      replayedBatch,
      records,
      resolutionItems,
      counts: {
        accepted: records.filter(({ record, replayed }) => !replayed && record.status === "accepted").length,
        quarantined: records.filter(({ record, replayed }) => !replayed && record.status === "quarantined").length,
        replayed: records.filter(({ replayed }) => replayed).length,
      },
    });
  }

  private mapBatch(row: BatchRow): PartnerIngestionBatch {
    return PartnerIngestionBatchSchema.parse({
      id: row.id,
      sourceKey: row.source_key,
      batchIdempotencyKey: row.batch_idempotency_key,
      schemaVersion: row.schema_version,
      retrievedAt: toIso(row.retrieved_at),
      receivedAt: toIso(row.received_at),
      submittedBy: row.submitted_by,
      artifact: {
        objectKey: row.artifact_object_key,
        sha256: row.artifact_sha256,
        mimeType: row.artifact_mime_type,
        byteSize: Number(row.artifact_byte_size),
        capturedAt: toNullableIso(row.artifact_captured_at),
      },
      contentSha256: row.content_sha256,
      rowCount: Number(row.row_count),
    });
  }

  private sourceValues(source: IngestionSource): unknown[] {
    return [
      source.id,
      source.key,
      JSON.stringify(source.displayName),
      source.adapterKind,
      source.entitlementReference,
      source.allowedEvidenceClasses,
      source.active,
      source.version,
      source.createdAt,
      source.updatedAt,
      source.disabledAt,
      source.disabledBy,
      source.disabledReason,
    ];
  }

  private async hydrateSources(rows: SourceRow[]): Promise<IngestionSource[]> {
    if (rows.length === 0) return [];
    const ids = rows.map(({ id }) => id);
    const events = await this.pool.query<SourceEventRow>(
      `SELECT source_id, id, action, actor_id, reason, version, created_at
       FROM ingestion_source_events
       WHERE source_id IN (${placeholders(ids.length)})
       ORDER BY version, id`,
      ids,
    );
    return rows.map((row) =>
      IngestionSourceSchema.parse({
        id: row.id,
        key: row.source_key,
        displayName: row.display_name,
        adapterKind: row.adapter_kind,
        entitlementReference: row.entitlement_reference,
        allowedEvidenceClasses: parsePostgresArray(row.allowed_evidence_classes),
        active: row.active,
        version: Number(row.version),
        createdAt: toIso(row.created_at),
        updatedAt: toIso(row.updated_at),
        disabledAt: toNullableIso(row.disabled_at),
        disabledBy: row.disabled_by,
        disabledReason: row.disabled_reason,
        auditTrail: events.rows
          .filter(({ source_id }) => source_id === row.id)
          .map((event) => ({
            id: event.id,
            action: event.action,
            actorId: event.actor_id,
            reason: event.reason,
            version: Number(event.version),
            createdAt: toIso(event.created_at),
          })),
      }),
    );
  }

  private mapRecord(row: RecordRow): RawIngestionRecord {
    return RawIngestionRecordSchema.parse({
      id: row.id,
      sourceKey: row.source_key,
      adapterKind: row.adapter_kind,
      idempotencyKey: row.idempotency_key,
      schemaVersion: row.schema_version,
      propertySlug: row.property_slug,
      claimKey: row.claim_key,
      evidenceClass: row.evidence_class,
      retrievedAt: toIso(row.retrieved_at),
      receivedAt: toIso(row.received_at),
      submittedBy: row.submitted_by,
      externalEntityId: row.external_entity_id,
      partnerBatchId: row.partner_batch_id,
      payload: row.payload,
      payloadSha256: row.payload_sha256,
      artifact: {
        objectKey: row.artifact_object_key,
        sha256: row.artifact_sha256,
        mimeType: row.artifact_mime_type,
        byteSize: Number(row.artifact_byte_size),
        capturedAt: toNullableIso(row.artifact_captured_at),
      },
      status: row.status,
    });
  }
}
