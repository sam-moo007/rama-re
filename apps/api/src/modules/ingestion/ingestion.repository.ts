import type {
  EntityResolutionWorkItem,
  IngestionSource,
  ManualIngestionResult,
  PartnerFileImportResult,
  PartnerIngestionBatch,
  RawIngestionRecord,
} from "@rama/contracts";

export const INGESTION_REPOSITORY = Symbol("INGESTION_REPOSITORY");

export class IngestionRepositoryConflictError extends Error {
  constructor(
    readonly entityKey: string,
    readonly expectedVersion: number | null,
    readonly currentVersion: number | null,
  ) {
    super(`Ingestion entity '${entityKey}' changed while it was being saved.`);
    this.name = "IngestionRepositoryConflictError";
  }
}

export class IngestionSourceUnavailableError extends Error {
  constructor(readonly sourceKey: string) {
    super(`Ingestion source '${sourceKey}' is unavailable.`);
    this.name = "IngestionSourceUnavailableError";
  }
}

export interface IngestionRepository {
  listSources(): Promise<IngestionSource[]>;
  findSource(key: string): Promise<IngestionSource | null>;
  saveSource(source: IngestionSource, expectedVersion: number | null): Promise<IngestionSource>;
  listRecords(limit: number): Promise<RawIngestionRecord[]>;
  ingest(record: RawIngestionRecord, expectedSourceVersion: number): Promise<ManualIngestionResult>;
  ingestPartnerBatch(
    batch: PartnerIngestionBatch,
    rawContent: Buffer,
    records: RawIngestionRecord[],
    resolutionItems: EntityResolutionWorkItem[],
    expectedSourceVersion: number,
  ): Promise<PartnerFileImportResult>;
  listResolutionItems(): Promise<EntityResolutionWorkItem[]>;
  findResolutionItem(id: string): Promise<EntityResolutionWorkItem | null>;
  saveResolutionItem(
    item: EntityResolutionWorkItem,
    expectedVersion: number,
  ): Promise<EntityResolutionWorkItem>;
}
