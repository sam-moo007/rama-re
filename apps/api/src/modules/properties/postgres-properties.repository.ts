import { Injectable, NotFoundException, OnModuleDestroy, Logger } from "@nestjs/common";
import { PropertyDecisionRoomSchema, type PropertyDecisionRoom } from "@rama/contracts";
import type { Pool } from "pg";
import { createPostgresPool } from "../../common/database/postgres-pool";

@Injectable()
export class PostgresPropertiesRepository implements OnModuleDestroy {
  private readonly pool: Pool;

  constructor() {
    this.pool = createPostgresPool(process.env, "rama-api-properties");
    this.checkConnection().catch(err => {
      Logger.error("Failed to connect to properties projection DB", err, "PostgresPropertiesRepository");
    });
  }

  async checkConnection(): Promise<void> {
    await this.pool.query("SELECT 1");
  }

  async findBySlug(slug: string): Promise<PropertyDecisionRoom> {
    const result = await this.pool.query(
      "SELECT room_payload FROM property_decision_room_projection WHERE canonical_slug = $1",
      [slug]
    );

    if (result.rows.length === 0) {
      throw new NotFoundException({
        code: "PROPERTY_NOT_FOUND",
        message: `No published decision room exists for canonical slug '${slug}'.`,
      });
    }

    // Parse it through the Zod schema to ensure full contract safety
    return PropertyDecisionRoomSchema.parse(result.rows[0].room_payload);
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
