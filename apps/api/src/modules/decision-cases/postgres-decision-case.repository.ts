import { DecisionCaseSchema, type DecisionCase } from "@rama/contracts";
import type { OnModuleDestroy } from "@nestjs/common";
import type { Pool, PoolClient } from "pg";

import { DecisionCaseConflictError, type DecisionCaseRepository } from "./decision-case.repository";

type CaseRow = {
  id: string; owner_subject: string; status: string; version: number; brief_id: string; brief_version: number;
  shortlist_id: string; shortlist_version: number; property_slugs: string[]; reason: string; topics: string[];
  preferred_contact_channel: string; advisor_id: string | null; response_sla_hours: number; response_due_at: Date;
  assigned_at: Date | null; closed_at: Date | null; retention_until: Date; data_policy_version: string;
  advisor_context: unknown | null; created_at: Date; updated_at: Date;
};
type EventRow = { id: string; action: string; actor_id: string; actor_role: string; version: number; reason_code: string; created_at: Date };

export class PostgresDecisionCaseRepository implements DecisionCaseRepository, OnModuleDestroy {
  constructor(private readonly pool: Pool) {}
  async checkConnection(): Promise<void> { await this.pool.query("SELECT 1"); }
  async onModuleDestroy(): Promise<void> { await this.pool.end(); }

  async find(id: string): Promise<DecisionCase | null> {
    const result = await this.pool.query<CaseRow>("SELECT * FROM decision_cases WHERE id = $1", [id]);
    return result.rows[0] ? this.hydrate(this.pool, result.rows[0]) : null;
  }

  async listByOwner(ownerSubject: string): Promise<DecisionCase[]> {
    const result = await this.pool.query<CaseRow>("SELECT * FROM decision_cases WHERE owner_subject = $1 ORDER BY updated_at DESC", [ownerSubject]);
    return Promise.all(result.rows.map((row) => this.hydrate(this.pool, row)));
  }

  async listAdvisorQueue(advisorId: string): Promise<DecisionCase[]> {
    const result = await this.pool.query<CaseRow>(
      "SELECT * FROM decision_cases WHERE status = 'requested' OR (status = 'assigned' AND advisor_id = $1) ORDER BY response_due_at",
      [advisorId],
    );
    return Promise.all(result.rows.map((row) => this.hydrate(this.pool, row)));
  }

  async save(item: DecisionCase, expectedVersion: number | null): Promise<DecisionCase> {
    const parsed = DecisionCaseSchema.parse(item);
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const current = await client.query<CaseRow>("SELECT * FROM decision_cases WHERE id = $1 FOR UPDATE", [parsed.id]);
      const currentVersion = current.rows[0]?.version ?? null;
      if (currentVersion !== expectedVersion || parsed.version !== (expectedVersion ?? 0) + 1) throw new DecisionCaseConflictError(parsed.id, expectedVersion, currentVersion);
      const values = [parsed.id, parsed.ownerSubject, parsed.status, parsed.version, parsed.briefId, parsed.briefVersion,
        parsed.shortlistId, parsed.shortlistVersion, parsed.propertySlugs, parsed.reason, parsed.topics,
        parsed.preferredContactChannel, parsed.advisorId, parsed.responseSlaHours, parsed.responseDueAt,
        parsed.assignedAt, parsed.closedAt, parsed.retentionUntil, parsed.dataPolicyVersion, parsed.advisorContext, parsed.createdAt, parsed.updatedAt];
      if (expectedVersion === null) {
        await client.query(`INSERT INTO decision_cases (
          id, owner_subject, status, version, brief_id, brief_version, shortlist_id, shortlist_version,
          property_slugs, reason, topics, preferred_contact_channel, advisor_id, response_sla_hours,
          response_due_at, assigned_at, closed_at, retention_until, data_policy_version, advisor_context, created_at, updated_at
        ) VALUES (${values.map((_value, index) => `$${index + 1}`).join(",")})`, values);
      } else {
        const updated = await client.query(`UPDATE decision_cases SET status=$1, version=$2, advisor_id=$3,
          assigned_at=$4, closed_at=$5, updated_at=$6 WHERE id=$7 AND version=$8`,
          [parsed.status, parsed.version, parsed.advisorId, parsed.assignedAt, parsed.closedAt, parsed.updatedAt, parsed.id, expectedVersion]);
        if (updated.rowCount !== 1) throw new DecisionCaseConflictError(parsed.id, expectedVersion, currentVersion);
      }
      const event = parsed.auditTrail.at(-1)!;
      await client.query(`INSERT INTO decision_case_events
        (id, case_id, action, actor_id, actor_role, version, reason_code, created_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [event.id, parsed.id, event.action, event.actorId, event.actorRole, event.version, event.reasonCode, event.createdAt]);
      await client.query("COMMIT");
      return parsed;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally { client.release(); }
  }

  async purgeExpired(before: string, limit: number): Promise<number> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const expired = await client.query<{ id: string }>(
        "SELECT id FROM decision_cases WHERE retention_until <= $1 ORDER BY retention_until LIMIT $2 FOR UPDATE",
        [before, limit],
      );
      const ids = expired.rows.map((row) => row.id);
      if (ids.length) {
        await client.query("SELECT set_config('rama.retention_purge', 'on', true)");
        const placeholders = ids.map((_id, index) => `$${index + 1}`).join(",");
        await client.query(`DELETE FROM decision_case_events WHERE case_id IN (${placeholders})`, ids);
        await client.query(`DELETE FROM decision_cases WHERE id IN (${placeholders})`, ids);
      }
      await client.query("COMMIT");
      return ids.length;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally { client.release(); }
  }

  private async hydrate(queryable: Pick<Pool | PoolClient, "query">, row: CaseRow): Promise<DecisionCase> {
    const events = await queryable.query<EventRow>("SELECT * FROM decision_case_events WHERE case_id = $1 ORDER BY version", [row.id]);
    return DecisionCaseSchema.parse({
      id: row.id, ownerSubject: row.owner_subject, status: row.status, version: row.version,
      briefId: row.brief_id, briefVersion: row.brief_version, shortlistId: row.shortlist_id,
      shortlistVersion: row.shortlist_version, propertySlugs: row.property_slugs, reason: row.reason,
      topics: row.topics, preferredContactChannel: row.preferred_contact_channel, advisorId: row.advisor_id,
      responseSlaHours: row.response_sla_hours, responseDueAt: row.response_due_at.toISOString(),
      assignedAt: row.assigned_at?.toISOString() ?? null, closedAt: row.closed_at?.toISOString() ?? null,
      retentionUntil: row.retention_until.toISOString(), dataPolicyVersion: row.data_policy_version,
      advisorContext: row.advisor_context,
      createdAt: row.created_at.toISOString(), updatedAt: row.updated_at.toISOString(),
      auditTrail: events.rows.map((event) => ({ id: event.id, action: event.action, actorId: event.actor_id,
        actorRole: event.actor_role, version: event.version, reasonCode: event.reason_code, createdAt: event.created_at.toISOString() })),
    });
  }
}
