import { PropertyShortlistSchema, type PropertyShortlist } from "@rama/contracts";
import type { OnModuleDestroy } from "@nestjs/common";
import type { Pool, PoolClient } from "pg";

import { ShortlistConflictError, type ShortlistRepository } from "./shortlist.repository";

type ShortlistRow = {
  id: string;
  owner_subject: string;
  version: number;
  property_slugs: string[];
  created_at: Date;
  updated_at: Date;
};

type EventRow = { id: string; action: "created" | "updated"; actor_id: string; version: number; created_at: Date };

export class PostgresShortlistRepository implements ShortlistRepository, OnModuleDestroy {
  constructor(private readonly pool: Pool) {}

  async checkConnection(): Promise<void> { await this.pool.query("SELECT 1"); }
  async onModuleDestroy(): Promise<void> { await this.pool.end(); }

  async findByOwner(ownerSubject: string): Promise<PropertyShortlist | null> {
    const result = await this.pool.query<ShortlistRow>("SELECT * FROM customer_shortlists WHERE owner_subject = $1", [ownerSubject]);
    return result.rows[0] ? this.hydrate(this.pool, result.rows[0]) : null;
  }

  async save(shortlist: PropertyShortlist, expectedVersion: number | null): Promise<PropertyShortlist> {
    const parsed = PropertyShortlistSchema.parse(shortlist);
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const current = await client.query<ShortlistRow>("SELECT * FROM customer_shortlists WHERE owner_subject = $1 FOR UPDATE", [parsed.ownerSubject]);
      const currentVersion = current.rows[0]?.version ?? null;
      if (currentVersion !== expectedVersion || parsed.version !== (expectedVersion ?? 0) + 1) {
        throw new ShortlistConflictError(expectedVersion, currentVersion);
      }
      if (expectedVersion === null) {
        await client.query(
          `INSERT INTO customer_shortlists (id, owner_subject, version, property_slugs, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [parsed.id, parsed.ownerSubject, parsed.version, parsed.propertySlugs, parsed.createdAt, parsed.updatedAt],
        );
      } else {
        const updated = await client.query(
          `UPDATE customer_shortlists SET version = $1, property_slugs = $2, updated_at = $3
           WHERE owner_subject = $4 AND version = $5`,
          [parsed.version, parsed.propertySlugs, parsed.updatedAt, parsed.ownerSubject, expectedVersion],
        );
        if (updated.rowCount !== 1) throw new ShortlistConflictError(expectedVersion, currentVersion);
      }
      const event = parsed.auditTrail.at(-1)!;
      await client.query(
        `INSERT INTO customer_shortlist_events (id, shortlist_id, action, actor_id, version, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [event.id, parsed.id, event.action, event.actorId, event.version, event.createdAt],
      );
      await client.query("COMMIT");
      return this.hydrate(this.pool, {
        id: parsed.id,
        owner_subject: parsed.ownerSubject,
        version: parsed.version,
        property_slugs: parsed.propertySlugs,
        created_at: new Date(parsed.createdAt),
        updated_at: new Date(parsed.updatedAt),
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  private async hydrate(queryable: Pick<Pool | PoolClient, "query">, row: ShortlistRow): Promise<PropertyShortlist> {
    const events = await queryable.query<EventRow>(
      "SELECT id, action, actor_id, version, created_at FROM customer_shortlist_events WHERE shortlist_id = $1 ORDER BY version",
      [row.id],
    );
    return PropertyShortlistSchema.parse({
      id: row.id,
      ownerSubject: row.owner_subject,
      version: row.version,
      propertySlugs: row.property_slugs,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
      auditTrail: events.rows.map((event) => ({
        id: event.id,
        action: event.action,
        actorId: event.actor_id,
        version: event.version,
        createdAt: event.created_at.toISOString(),
      })),
    });
  }
}

