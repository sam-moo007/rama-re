import { Injectable, type OnModuleDestroy } from "@nestjs/common";
import {
  EvidenceWorkItemSchema,
  type EvidenceWorkflowStatus,
  type EvidenceWorkItem,
} from "@rama/contracts";
import { createHash, randomUUID } from "node:crypto";
import { Pool, type PoolClient, type QueryResultRow } from "pg";

import {
  EvidenceRepositoryConflictError,
  type EvidenceOperationsRepository,
} from "./evidence-operations.repository";

type WorkItemRow = QueryResultRow & {
  id: string;
  property_slug: string;
  property_name: unknown;
  workflow_status: EvidenceWorkflowStatus;
  version: number;
  assigned_to: string | null;
  work_created_at: Date | string;
  work_updated_at: Date | string;
  claim_key: string;
  claim_label: unknown;
  display_value: unknown;
  evidence_class: EvidenceWorkItem["claim"]["evidenceClass"];
  claim_status: EvidenceWorkItem["claim"]["status"];
  source_snapshot: unknown;
  method: unknown;
  observed_at: Date | string | null;
  retrieved_at: Date | string;
  valid_to: Date | string | null;
  confidence: string | number | null;
  artifact_reference: string | null;
  supersedes_reference: string | null;
  is_critical: boolean;
  next_verification_step: unknown | null;
};

type ReviewRow = QueryResultRow & {
  claim_id: string;
  id: string;
  decision: EvidenceWorkItem["reviews"][number]["decision"];
  reason: string;
  reviewer_id: string;
  created_at: Date | string;
};

type CorrectionRow = QueryResultRow & {
  claim_id: string;
  id: string;
  submitted_by: string;
  reason: string;
  status: EvidenceWorkItem["corrections"][number]["status"];
  created_at: Date | string;
  resolved_at: Date | string | null;
  resolution_note: string | null;
};

type AuditRow = QueryResultRow & {
  evidence_work_item_id: string;
  id: string;
  action: EvidenceWorkItem["auditTrail"][number]["action"];
  actor_id: string;
  reason: string | null;
  from_status: EvidenceWorkflowStatus | null;
  to_status: EvidenceWorkflowStatus;
  version: number;
  created_at: Date | string;
};

const baseSelect = `
  SELECT
    wi.id,
    pu.canonical_slug AS property_slug,
    pu.name AS property_name,
    wi.workflow_status,
    wi.version,
    wi.assigned_to,
    wi.created_at AS work_created_at,
    wi.updated_at AS work_updated_at,
    c.claim_key,
    c.label AS claim_label,
    c.value AS display_value,
    c.evidence_class,
    c.status AS claim_status,
    c.source_snapshot,
    c.method,
    c.observed_at,
    c.retrieved_at,
    c.valid_to,
    c.confidence,
    c.artifact_reference,
    COALESCE(c.supersedes_reference, c.supersedes_claim_id::text) AS supersedes_reference,
    c.is_critical,
    c.next_verification_step
  FROM evidence_work_items wi
  JOIN claims c ON c.id = wi.id
  JOIN property_units pu ON pu.id = c.property_unit_id
`;

const toIso = (value: Date | string): string =>
  value instanceof Date ? value.toISOString() : new Date(value).toISOString();

const toNullableIso = (value: Date | string | null): string | null =>
  value === null ? null : toIso(value);

const placeholders = (count: number): string =>
  Array.from({ length: count }, (_, index) => `$${index + 1}`).join(", ");

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class PostgresEvidenceOperationsRepository
  implements EvidenceOperationsRepository, OnModuleDestroy
{
  constructor(private readonly pool: Pool) {}

  async checkConnection(): Promise<void> {
    await this.pool.query("SELECT 1");
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }

  async list(): Promise<EvidenceWorkItem[]> {
    const result = await this.pool.query<WorkItemRow>(`${baseSelect} ORDER BY wi.updated_at DESC, wi.id`);
    return this.hydrate(result.rows);
  }

  async findById(id: string): Promise<EvidenceWorkItem | null> {
    const result = await this.pool.query<WorkItemRow>(`${baseSelect} WHERE wi.id = $1`, [id]);
    const [item] = await this.hydrate(result.rows);
    return item ?? null;
  }

  async save(item: EvidenceWorkItem, expectedVersion: number | null): Promise<EvidenceWorkItem> {
    const validated = EvidenceWorkItemSchema.parse(item);
    if (validated.version !== (expectedVersion ?? 0) + 1) {
      throw new EvidenceRepositoryConflictError(validated.id, expectedVersion, null);
    }

    const newAuditEvents = validated.auditTrail.filter(
      (event) => expectedVersion === null || event.version > expectedVersion,
    );
    if (newAuditEvents.length !== 1 || newAuditEvents[0]?.version !== validated.version) {
      throw new Error("Each evidence save must append exactly one audit event for the new version.");
    }

    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const currentResult = await client.query<{ version: number }>(
        "SELECT version FROM evidence_work_items WHERE id = $1 FOR UPDATE",
        [validated.id],
      );
      const currentVersion = currentResult.rows[0]?.version ?? null;
      if (currentVersion !== expectedVersion) {
        throw new EvidenceRepositoryConflictError(validated.id, expectedVersion, currentVersion);
      }

      const propertyUnitId = await this.ensurePropertyUnit(client, validated);
      const sourceId = await this.ensureEvidenceSource(client, validated);

      if (expectedVersion === null) {
        await this.insertClaim(client, validated, propertyUnitId, sourceId);
        await client.query(
          `INSERT INTO evidence_work_items
            (id, workflow_status, version, assigned_to, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            validated.id,
            validated.workflowStatus,
            validated.version,
            validated.assignedTo,
            validated.createdAt,
            validated.updatedAt,
          ],
        );
      } else {
        const updated = await client.query(
          `UPDATE evidence_work_items
             SET workflow_status = $2, version = $3, assigned_to = $4, updated_at = $5
           WHERE id = $1 AND version = $6`,
          [
            validated.id,
            validated.workflowStatus,
            validated.version,
            validated.assignedTo,
            validated.updatedAt,
            expectedVersion,
          ],
        );
        if (updated.rowCount !== 1) {
          throw new EvidenceRepositoryConflictError(validated.id, expectedVersion, currentVersion);
        }
        await this.updateClaim(client, validated, propertyUnitId, sourceId);
      }

      await this.persistReviews(client, validated);
      await this.persistCorrections(client, validated);
      await this.appendAuditEvents(client, validated.id, newAuditEvents);
      await client.query("COMMIT");
      return EvidenceWorkItemSchema.parse(validated);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async seedIfEmpty(items: EvidenceWorkItem[]): Promise<number> {
    const result = await this.pool.query<{ count: string }>("SELECT count(*)::text AS count FROM evidence_work_items");
    if (Number(result.rows[0]?.count ?? 0) > 0) return 0;
    for (const item of items) await this.save(item, null);
    return items.length;
  }

  private async hydrate(rows: WorkItemRow[]): Promise<EvidenceWorkItem[]> {
    if (rows.length === 0) return [];
    const ids = rows.map(({ id }) => id);
    const inClause = placeholders(ids.length);
    const [reviewResult, correctionResult, auditResult] = await Promise.all([
      this.pool.query<ReviewRow>(
        `SELECT claim_id, id, decision, reason, reviewer_id, created_at
           FROM claim_reviews WHERE claim_id IN (${inClause}) ORDER BY created_at, id`,
        ids,
      ),
      this.pool.query<CorrectionRow>(
        `SELECT claim_id, id, submitted_by, reason, status, created_at, resolved_at, resolution_note
           FROM corrections WHERE claim_id IN (${inClause}) ORDER BY created_at, id`,
        ids,
      ),
      this.pool.query<AuditRow>(
        `SELECT evidence_work_item_id, id, action, actor_id, reason, from_status, to_status, version, created_at
           FROM evidence_audit_events WHERE evidence_work_item_id IN (${inClause}) ORDER BY version, id`,
        ids,
      ),
    ]);

    return rows.map((row) =>
      EvidenceWorkItemSchema.parse({
        id: row.id,
        propertySlug: row.property_slug,
        propertyName: row.property_name,
        workflowStatus: row.workflow_status,
        version: Number(row.version),
        assignedTo: row.assigned_to,
        createdAt: toIso(row.work_created_at),
        updatedAt: toIso(row.work_updated_at),
        claim: {
          id: row.id,
          key: row.claim_key,
          label: row.claim_label,
          displayValue: row.display_value,
          evidenceClass: row.evidence_class,
          status: row.claim_status,
          source: row.source_snapshot,
          method: row.method,
          observedAt: toNullableIso(row.observed_at),
          retrievedAt: toIso(row.retrieved_at),
          validTo: toNullableIso(row.valid_to),
          confidence: row.confidence === null ? null : Number(row.confidence),
          artifactReference: row.artifact_reference,
          supersedes: row.supersedes_reference,
          isCritical: row.is_critical,
          nextVerificationStep: row.next_verification_step,
        },
        reviews: reviewResult.rows
          .filter(({ claim_id }) => claim_id === row.id)
          .map((review) => ({
            id: review.id,
            decision: review.decision,
            reason: review.reason,
            reviewerId: review.reviewer_id,
            createdAt: toIso(review.created_at),
          })),
        corrections: correctionResult.rows
          .filter(({ claim_id }) => claim_id === row.id)
          .map((correction) => ({
            id: correction.id,
            submittedBy: correction.submitted_by,
            reason: correction.reason,
            status: correction.status,
            createdAt: toIso(correction.created_at),
            resolvedAt: toNullableIso(correction.resolved_at),
            resolutionNote: correction.resolution_note,
          })),
        auditTrail: auditResult.rows
          .filter(({ evidence_work_item_id }) => evidence_work_item_id === row.id)
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
      }),
    );
  }

  private async ensurePropertyUnit(client: PoolClient, item: EvidenceWorkItem): Promise<string> {
    const candidateId = randomUUID();
    const result = await client.query<{ id: string }>(
      `INSERT INTO property_units (id, canonical_slug, name, updated_at)
       VALUES ($1, $2, $3::jsonb, $4)
       ON CONFLICT (canonical_slug) DO UPDATE SET name = EXCLUDED.name, updated_at = EXCLUDED.updated_at
       RETURNING id`,
      [candidateId, item.propertySlug, JSON.stringify(item.propertyName), item.updatedAt],
    );
    const id = result.rows[0]?.id;
    if (!id) throw new Error(`Unable to resolve property unit '${item.propertySlug}'.`);
    return id;
  }

  private async ensureEvidenceSource(client: PoolClient, item: EvidenceWorkItem): Promise<string> {
    const serialized = JSON.stringify(item.claim.source);
    const sourceKey = `snapshot:${createHash("sha256").update(serialized).digest("hex")}`;
    const candidateId = randomUUID();
    const result = await client.query<{ id: string }>(
      `INSERT INTO evidence_sources (id, source_key, display_name, retrieval_policy)
       VALUES ($1, $2, $3::jsonb, '{"mode":"claim_snapshot"}'::jsonb)
       ON CONFLICT (source_key) DO UPDATE SET display_name = EXCLUDED.display_name
       RETURNING id`,
      [candidateId, sourceKey, serialized],
    );
    const id = result.rows[0]?.id;
    if (!id) throw new Error(`Unable to resolve evidence source for claim '${item.claim.key}'.`);
    return id;
  }

  private claimValues(
    item: EvidenceWorkItem,
    propertyUnitId: string,
    sourceId: string,
  ): unknown[] {
    return [
      item.id,
      propertyUnitId,
      item.claim.key,
      JSON.stringify(item.claim.displayValue),
      item.claim.evidenceClass,
      item.claim.status,
      JSON.stringify(item.claim.method),
      sourceId,
      item.claim.confidence,
      item.assignedTo,
      item.claim.observedAt,
      item.claim.retrievedAt,
      item.claim.retrievedAt,
      item.claim.validTo,
      item.createdAt,
      item.claim.supersedes && uuidPattern.test(item.claim.supersedes) ? item.claim.supersedes : null,
      item.workflowStatus === "published" ? item.updatedAt : null,
      item.workflowStatus === "superseded" ? item.updatedAt : null,
      JSON.stringify(item.claim.label),
      JSON.stringify(item.claim.source),
      item.claim.nextVerificationStep === null ? null : JSON.stringify(item.claim.nextVerificationStep),
      item.claim.artifactReference,
      item.claim.isCritical,
      item.claim.supersedes && !uuidPattern.test(item.claim.supersedes) ? item.claim.supersedes : null,
    ];
  }

  private async insertClaim(
    client: PoolClient,
    item: EvidenceWorkItem,
    propertyUnitId: string,
    sourceId: string,
  ): Promise<void> {
    await client.query(
      `INSERT INTO claims (
         id, property_unit_id, claim_key, value, evidence_class, status, method, source_id,
         confidence, verifier_id, observed_at, retrieved_at, valid_from, valid_to, recorded_at,
         supersedes_claim_id, published_at, superseded_at, label, source_snapshot,
         next_verification_step, artifact_reference, is_critical, supersedes_reference
       ) VALUES (
         $1, $2, $3, $4::jsonb, $5, $6, $7::jsonb, $8,
         $9, $10, $11, $12, $13, $14, $15,
         $16, $17, $18, $19::jsonb, $20::jsonb,
         $21::jsonb, $22, $23, $24
       )`,
      this.claimValues(item, propertyUnitId, sourceId),
    );
  }

  private async updateClaim(
    client: PoolClient,
    item: EvidenceWorkItem,
    propertyUnitId: string,
    sourceId: string,
  ): Promise<void> {
    const values = this.claimValues(item, propertyUnitId, sourceId);
    await client.query(
      `UPDATE claims SET
         property_unit_id = $2,
         claim_key = $3,
         value = $4::jsonb,
         evidence_class = $5,
         status = $6,
         method = $7::jsonb,
         source_id = $8,
         confidence = $9,
         verifier_id = $10,
         observed_at = $11,
         retrieved_at = $12,
         valid_from = $13,
         valid_to = $14,
         supersedes_claim_id = $16,
         supersedes_reference = $24,
         published_at = CASE WHEN $25 = 'published' THEN COALESCE(published_at, $26) ELSE published_at END,
         superseded_at = CASE WHEN $25 = 'superseded' THEN $26 ELSE superseded_at END,
         label = $19::jsonb,
         source_snapshot = $20::jsonb,
         next_verification_step = $21::jsonb,
         artifact_reference = $22,
         is_critical = $23
       WHERE id = $1`,
      [...values, item.workflowStatus, item.updatedAt],
    );
  }

  private async persistReviews(client: PoolClient, item: EvidenceWorkItem): Promise<void> {
    for (const review of item.reviews) {
      await client.query(
        `INSERT INTO claim_reviews (id, claim_id, reviewer_id, decision, reason, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING`,
        [review.id, item.id, review.reviewerId, review.decision, review.reason, review.createdAt],
      );
    }
  }

  private async persistCorrections(client: PoolClient, item: EvidenceWorkItem): Promise<void> {
    for (const correction of item.corrections) {
      await client.query(
        `INSERT INTO corrections
          (id, claim_id, submitted_by, reason, status, created_at, resolved_at, resolution_note)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE SET
           status = EXCLUDED.status,
           resolved_at = EXCLUDED.resolved_at,
           resolution_note = EXCLUDED.resolution_note`,
        [
          correction.id,
          item.id,
          correction.submittedBy,
          correction.reason,
          correction.status,
          correction.createdAt,
          correction.resolvedAt,
          correction.resolutionNote,
        ],
      );
    }
  }

  private async appendAuditEvents(
    client: PoolClient,
    itemId: string,
    events: EvidenceWorkItem["auditTrail"],
  ): Promise<void> {
    for (const event of events) {
      await client.query(
        `INSERT INTO evidence_audit_events
          (id, evidence_work_item_id, action, actor_id, reason, from_status, to_status, version, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
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
  }
}
