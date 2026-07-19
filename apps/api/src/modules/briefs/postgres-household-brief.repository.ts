import { Injectable, type OnModuleDestroy } from "@nestjs/common";
import {
  HouseholdBriefSchema,
  type HouseholdBrief,
  type HouseholdBriefEvent,
} from "@rama/contracts";
import { Pool, type PoolClient, type QueryResultRow } from "pg";

import {
  HouseholdBriefConflictError,
  type HouseholdBriefRepository,
} from "./household-brief.repository";

type BriefRow = QueryResultRow & {
  id: string;
  owner_subject: string;
  status: HouseholdBrief["status"];
  version: number;
  input: unknown;
  readiness: unknown;
  created_at: Date | string;
  updated_at: Date | string;
  submitted_at: Date | string | null;
};

type EventRow = QueryResultRow & {
  brief_id: string;
  id: string;
  action: HouseholdBriefEvent["action"];
  actor_id: string;
  reason: string;
  version: number;
  created_at: Date | string;
};

const briefSelect = `
  SELECT id, owner_subject, status, version, input, readiness,
    created_at, updated_at, submitted_at
  FROM household_briefs
`;
const toIso = (value: Date | string): string =>
  value instanceof Date ? value.toISOString() : new Date(value).toISOString();

@Injectable()
export class PostgresHouseholdBriefRepository implements HouseholdBriefRepository, OnModuleDestroy {
  constructor(private readonly pool: Pool) {}

  async checkConnection(): Promise<void> {
    await this.pool.query("SELECT 1");
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }

  async listByOwner(ownerSubject: string): Promise<HouseholdBrief[]> {
    const rows = await this.pool.query<BriefRow>(
      `${briefSelect} WHERE owner_subject = $1 ORDER BY updated_at DESC, id`,
      [ownerSubject],
    );
    return this.hydrate(this.pool, rows.rows);
  }

  async find(id: string): Promise<HouseholdBrief | null> {
    const rows = await this.pool.query<BriefRow>(`${briefSelect} WHERE id = $1`, [id]);
    const [brief] = await this.hydrate(this.pool, rows.rows);
    return brief ?? null;
  }

  async save(brief: HouseholdBrief, expectedVersion: number | null): Promise<HouseholdBrief> {
    const validated = HouseholdBriefSchema.parse(brief);
    if (validated.version !== (expectedVersion ?? 0) + 1) {
      throw new HouseholdBriefConflictError(validated.id, expectedVersion, null);
    }
    const events = validated.auditTrail.filter(
      (event) => expectedVersion === null || event.version > expectedVersion,
    );
    if (events.length !== 1 || events[0]?.version !== validated.version) {
      throw new Error("Each household brief save must append exactly one audit event.");
    }
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const current = await client.query<{ version: number }>(
        "SELECT version FROM household_briefs WHERE id = $1 FOR UPDATE",
        [validated.id],
      );
      const currentVersion = current.rows[0]?.version ?? null;
      if (currentVersion !== expectedVersion) {
        throw new HouseholdBriefConflictError(validated.id, expectedVersion, currentVersion);
      }
      if (expectedVersion === null) {
        await client.query(
          `INSERT INTO household_briefs (
             id, owner_subject, status, version, input, readiness,
             created_at, updated_at, submitted_at
           ) VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7, $8, $9)`,
          this.values(validated),
        );
      } else {
        const updated = await client.query(
          `UPDATE household_briefs SET status = $3, version = $4,
             input = $5::jsonb, readiness = $6::jsonb, updated_at = $8,
             submitted_at = $9
           WHERE id = $1 AND owner_subject = $2 AND version = $10`,
          [...this.values(validated), expectedVersion],
        );
        if (updated.rowCount !== 1) {
          throw new HouseholdBriefConflictError(validated.id, expectedVersion, currentVersion);
        }
      }
      await this.insertEvent(client, validated.id, events[0]);
      await client.query("COMMIT");
      return validated;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  private values(brief: HouseholdBrief): unknown[] {
    return [
      brief.id,
      brief.ownerSubject,
      brief.status,
      brief.version,
      JSON.stringify(brief.input),
      JSON.stringify(brief.readiness),
      brief.createdAt,
      brief.updatedAt,
      brief.submittedAt,
    ];
  }

  private async insertEvent(
    client: PoolClient,
    briefId: string,
    event: HouseholdBriefEvent | undefined,
  ): Promise<void> {
    if (!event) throw new Error("Household brief save requires an audit event.");
    await client.query(
      `INSERT INTO household_brief_events
        (id, brief_id, action, actor_id, reason, version, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [event.id, briefId, event.action, event.actorId, event.reason, event.version, event.createdAt],
    );
  }

  private async hydrate(
    queryable: Pool | PoolClient,
    rows: BriefRow[],
  ): Promise<HouseholdBrief[]> {
    if (rows.length === 0) return [];
    const ids = rows.map(({ id }) => id);
    const placeholders = ids.map((_, index) => `$${index + 1}`).join(", ");
    const events = await queryable.query<EventRow>(
      `SELECT brief_id, id, action, actor_id, reason, version, created_at
       FROM household_brief_events WHERE brief_id IN (${placeholders})
       ORDER BY version, id`,
      ids,
    );
    return rows.map((row) =>
      HouseholdBriefSchema.parse({
        id: row.id,
        ownerSubject: row.owner_subject,
        status: row.status,
        version: Number(row.version),
        input: row.input,
        readiness: row.readiness,
        createdAt: toIso(row.created_at),
        updatedAt: toIso(row.updated_at),
        submittedAt: row.submitted_at === null ? null : toIso(row.submitted_at),
        auditTrail: events.rows
          .filter(({ brief_id }) => brief_id === row.id)
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
}
