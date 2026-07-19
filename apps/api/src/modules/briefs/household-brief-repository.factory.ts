import { Logger } from "@nestjs/common";

import { createPostgresPool } from "../../common/database/postgres-pool";
import type { HouseholdBriefRepository } from "./household-brief.repository";
import { InMemoryHouseholdBriefRepository } from "./in-memory-household-brief.repository";
import { PostgresHouseholdBriefRepository } from "./postgres-household-brief.repository";

export type HouseholdBriefRepositoryDriver = "memory" | "postgres";

export const resolveHouseholdBriefRepositoryDriver = (
  environment: NodeJS.ProcessEnv = process.env,
): HouseholdBriefRepositoryDriver => {
  const configured = (environment.BRIEF_REPOSITORY ?? environment.EVIDENCE_REPOSITORY)
    ?.trim()
    .toLowerCase();
  if (configured === "memory" || configured === "postgres") return configured;
  if (configured) throw new Error("BRIEF_REPOSITORY must be 'memory' or 'postgres'.");
  return "postgres";
};

export const createHouseholdBriefRepository = async (
  environment: NodeJS.ProcessEnv = process.env,
): Promise<HouseholdBriefRepository> => {
  if (resolveHouseholdBriefRepositoryDriver(environment) === "memory") {
    if (environment.NODE_ENV === "production") {
      throw new Error("Volatile household brief persistence is forbidden in production.");
    }
    Logger.warn("Household briefs are using volatile in-memory persistence.", "HouseholdBriefRepository");
    return new InMemoryHouseholdBriefRepository();
  }
  const repository = new PostgresHouseholdBriefRepository(
    createPostgresPool(environment, "rama-api-household-briefs"),
  );
  try {
    await repository.checkConnection();
    Logger.log("Household briefs are using PostgreSQL persistence.", "HouseholdBriefRepository");
    return repository;
  } catch (error) {
    await repository.onModuleDestroy();
    throw error;
  }
};
