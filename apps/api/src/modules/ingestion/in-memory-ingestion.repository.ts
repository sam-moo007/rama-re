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

import {
  IngestionRepositoryConflictError,
  IngestionSourceUnavailableError,
  type IngestionRepository,
} from "./ingestion.repository";

export class InMemoryIngestionRepository implements IngestionRepository {
  private readonly sources = new Map<string, IngestionSource>();
  private readonly records = new Map<string, RawIngestionRecord>();
  private readonly idempotency = new Map<string, string>();
  private readonly batches = new Map<string, PartnerIngestionBatch>();
  private readonly batchIdempotency = new Map<string, string>();
  private readonly batchResults = new Map<string, Array<{ recordId: string; replayed: boolean }>>();
  private readonly resolutionItems = new Map<string, EntityResolutionWorkItem>();

  async listSources(): Promise<IngestionSource[]> {
    return structuredClone([...this.sources.values()]);
  }

  async findSource(key: string): Promise<IngestionSource | null> {
    const source = this.sources.get(key);
    return source ? structuredClone(source) : null;
  }

  async saveSource(source: IngestionSource, expectedVersion: number | null): Promise<IngestionSource> {
    const validated = IngestionSourceSchema.parse(source);
    const current = this.sources.get(validated.key);
    const currentVersion = current?.version ?? null;
    if (currentVersion !== expectedVersion || validated.version !== (expectedVersion ?? 0) + 1) {
      throw new IngestionRepositoryConflictError(validated.key, expectedVersion, currentVersion);
    }
    const newEvents = validated.auditTrail.filter(
      (event) => expectedVersion === null || event.version > expectedVersion,
    );
    if (newEvents.length !== 1 || newEvents[0]?.version !== validated.version) {
      throw new Error("Each source save must append exactly one audit event for the new version.");
    }
    this.sources.set(validated.key, structuredClone(validated));
    return structuredClone(validated);
  }

  async listRecords(limit: number): Promise<RawIngestionRecord[]> {
    return structuredClone(
      [...this.records.values()]
        .sort((left, right) => right.receivedAt.localeCompare(left.receivedAt))
        .slice(0, limit),
    );
  }

  async ingest(
    record: RawIngestionRecord,
    expectedSourceVersion: number,
  ): Promise<ManualIngestionResult> {
    const validated = RawIngestionRecordSchema.parse(record);
    this.requireSource(validated.sourceKey, expectedSourceVersion);
    return this.landRecord(validated, this.records, this.idempotency);
  }

  async ingestPartnerBatch(
    batch: PartnerIngestionBatch,
    _rawContent: Buffer,
    records: RawIngestionRecord[],
    resolutionItems: EntityResolutionWorkItem[],
    expectedSourceVersion: number,
  ): Promise<PartnerFileImportResult> {
    const validatedBatch = PartnerIngestionBatchSchema.parse(batch);
    this.requireSource(validatedBatch.sourceKey, expectedSourceVersion);
    const batchKey = `${validatedBatch.sourceKey}:${validatedBatch.batchIdempotencyKey}`;
    const existingBatchId = this.batchIdempotency.get(batchKey);
    if (existingBatchId) {
      const existingBatch = this.batches.get(existingBatchId);
      if (!existingBatch) throw new Error("In-memory batch idempotency index is inconsistent.");
      const associations = this.batchResults.get(existingBatch.id);
      if (!associations) throw new Error("In-memory partner batch associations are missing.");
      const existingRecords = associations.map(({ recordId }) => {
        const record = this.records.get(recordId);
        if (!record) throw new Error("In-memory partner batch references a missing record.");
        return record;
      });
      const results = existingRecords.map((record) => ({ record, replayed: true }));
      const existingResolution = [...this.resolutionItems.values()].filter(({ rawRecordId }) =>
        existingRecords.some(({ id }) => id === rawRecordId),
      );
      return this.partnerResult(existingBatch, true, results, existingResolution);
    }

    if (records.length !== validatedBatch.rowCount || resolutionItems.length !== records.length) {
      throw new Error("Partner batch row, record and resolution counts must match.");
    }
    const nextRecords = new Map(
      [...this.records].map(([key, value]) => [key, structuredClone(value)]),
    );
    const nextIdempotency = new Map(this.idempotency);
    const nextResolution = new Map(
      [...this.resolutionItems].map(([key, value]) => [key, structuredClone(value)]),
    );
    const results: ManualIngestionResult[] = [];
    const landedResolution: EntityResolutionWorkItem[] = [];
    for (const [index, record] of records.entries()) {
      const validatedRecord = RawIngestionRecordSchema.parse(record);
      if (validatedRecord.partnerBatchId !== validatedBatch.id) {
        throw new Error("Partner record batch identity does not match its batch.");
      }
      const result = this.landRecord(validatedRecord, nextRecords, nextIdempotency);
      results.push(result);
      const candidate = EntityResolutionWorkItemSchema.parse(resolutionItems[index]);
      if (!result.replayed) {
        if (candidate.rawRecordId !== result.record.id) {
          throw new Error("Resolution work must reference its landed raw record.");
        }
        const landedCandidate = this.resolutionForLanding(candidate, result.record);
        nextResolution.set(landedCandidate.id, structuredClone(landedCandidate));
        landedResolution.push(landedCandidate);
      } else {
        const existing = [...nextResolution.values()].find(
          ({ rawRecordId }) => rawRecordId === result.record.id,
        );
        if (existing) landedResolution.push(existing);
      }
    }

    this.records.clear();
    for (const [key, value] of nextRecords) this.records.set(key, value);
    this.idempotency.clear();
    for (const [key, value] of nextIdempotency) this.idempotency.set(key, value);
    this.resolutionItems.clear();
    for (const [key, value] of nextResolution) this.resolutionItems.set(key, value);
    this.batches.set(validatedBatch.id, structuredClone(validatedBatch));
    this.batchIdempotency.set(batchKey, validatedBatch.id);
    this.batchResults.set(
      validatedBatch.id,
      results.map(({ record, replayed }) => ({ recordId: record.id, replayed })),
    );
    return this.partnerResult(validatedBatch, false, results, landedResolution);
  }

  async listResolutionItems(): Promise<EntityResolutionWorkItem[]> {
    return structuredClone(
      [...this.resolutionItems.values()].sort((left, right) =>
        right.updatedAt.localeCompare(left.updatedAt),
      ),
    );
  }

  async findResolutionItem(id: string): Promise<EntityResolutionWorkItem | null> {
    const item = this.resolutionItems.get(id);
    return item ? structuredClone(item) : null;
  }

  async saveResolutionItem(
    item: EntityResolutionWorkItem,
    expectedVersion: number,
  ): Promise<EntityResolutionWorkItem> {
    const validated = EntityResolutionWorkItemSchema.parse(item);
    const current = this.resolutionItems.get(validated.id);
    const currentVersion = current?.version ?? null;
    if (currentVersion !== expectedVersion || validated.version !== expectedVersion + 1) {
      throw new IngestionRepositoryConflictError(validated.id, expectedVersion, currentVersion);
    }
    const events = validated.auditTrail.filter((event) => event.version > expectedVersion);
    if (events.length !== 1 || events[0]?.version !== validated.version) {
      throw new Error("Each resolution save must append exactly one audit event.");
    }
    this.resolutionItems.set(validated.id, structuredClone(validated));
    return structuredClone(validated);
  }

  private requireSource(sourceKey: string, expectedVersion: number): IngestionSource {
    const source = this.sources.get(sourceKey);
    if (!source?.active) throw new IngestionSourceUnavailableError(sourceKey);
    if (source.version !== expectedVersion) {
      throw new IngestionRepositoryConflictError(
        sourceKey,
        expectedVersion,
        source.version,
      );
    }
    return source;
  }

  private landRecord(
    validated: RawIngestionRecord,
    records: Map<string, RawIngestionRecord>,
    idempotency: Map<string, string>,
  ): ManualIngestionResult {
    const idempotencyKey = `${validated.sourceKey}:${validated.idempotencyKey}`;
    const existingId = idempotency.get(idempotencyKey);
    if (existingId) {
      const existing = records.get(existingId);
      if (!existing) throw new Error("In-memory ingestion idempotency index is inconsistent.");
      return ManualIngestionResultSchema.parse({ record: structuredClone(existing), replayed: true });
    }

    const checksumMatch = [...records.values()].find(
      (candidate) =>
        candidate.sourceKey === validated.sourceKey &&
        candidate.propertySlug === validated.propertySlug &&
        candidate.claimKey === validated.claimKey &&
        candidate.artifact.sha256 === validated.artifact.sha256,
    );
    if (checksumMatch?.payloadSha256 === validated.payloadSha256) {
      return ManualIngestionResultSchema.parse({
        record: structuredClone(checksumMatch),
        replayed: true,
      });
    }

    const landed = RawIngestionRecordSchema.parse({
      ...validated,
      status: checksumMatch ? "quarantined" : validated.status,
    });
    records.set(landed.id, structuredClone(landed));
    idempotency.set(idempotencyKey, landed.id);
    return ManualIngestionResultSchema.parse({ record: structuredClone(landed), replayed: false });
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
}
