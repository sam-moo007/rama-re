import { Logger } from "@nestjs/common";

import { createPostgresPool } from "../../common/database/postgres-pool";
import { InMemoryShortlistRepository } from "./in-memory-shortlist.repository";
import { PostgresShortlistRepository } from "./postgres-shortlist.repository";
import type { ShortlistRepository } from "./shortlist.repository";

export type ShortlistRepositoryDriver = "memory" | "postgres";

export const resolveShortlistRepositoryDriver = (environment: NodeJS.ProcessEnv = process.env): ShortlistRepositoryDriver => {
  const configured = environment.SHORTLIST_REPOSITORY?.trim().toLowerCase();
  if (configured === "memory" || configured === "postgres") return configured;
  if (configured) throw new Error("SHORTLIST_REPOSITORY must be 'memory' or 'postgres'.");
  return "postgres";
};

export const createShortlistRepository = async (environment: NodeJS.ProcessEnv = process.env): Promise<ShortlistRepository> => {
  if (resolveShortlistRepositoryDriver(environment) === "memory") {
    if (environment.NODE_ENV === "production") throw new Error("Volatile shortlist persistence is forbidden in production.");
    Logger.warn("Customer shortlists are using volatile in-memory persistence.", "ShortlistRepository");
    return new InMemoryShortlistRepository();
  }
  const repository = new PostgresShortlistRepository(createPostgresPool(environment, "rama-api-shortlists"));
  try {
    await repository.checkConnection();
    Logger.log("Customer shortlists are using PostgreSQL persistence.", "ShortlistRepository");
    return repository;
  } catch (error) {
    await repository.onModuleDestroy();
    throw error;
  }
};

