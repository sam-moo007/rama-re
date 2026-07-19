import { Logger } from "@nestjs/common";

import { createPostgresPool } from "../../common/database/postgres-pool";
import type { DecisionCaseRepository } from "./decision-case.repository";
import { InMemoryDecisionCaseRepository } from "./in-memory-decision-case.repository";
import { PostgresDecisionCaseRepository } from "./postgres-decision-case.repository";

export const resolveDecisionCaseRepositoryDriver = (environment: NodeJS.ProcessEnv = process.env): "memory" | "postgres" => {
  const configured = environment.DECISION_CASE_REPOSITORY?.trim().toLowerCase();
  if (configured === "memory" || configured === "postgres") return configured;
  if (configured) throw new Error("DECISION_CASE_REPOSITORY must be 'memory' or 'postgres'.");
  return "postgres";
};

export const createDecisionCaseRepository = async (environment: NodeJS.ProcessEnv = process.env): Promise<DecisionCaseRepository> => {
  if (resolveDecisionCaseRepositoryDriver(environment) === "memory") {
    if (environment.NODE_ENV === "production") throw new Error("Volatile decision-case persistence is forbidden in production.");
    Logger.warn("Decision cases are using volatile in-memory persistence.", "DecisionCaseRepository");
    return new InMemoryDecisionCaseRepository();
  }
  const repository = new PostgresDecisionCaseRepository(createPostgresPool(environment, "rama-api-decision-cases"));
  try { await repository.checkConnection(); Logger.log("Decision cases are using PostgreSQL persistence.", "DecisionCaseRepository"); return repository; }
  catch (error) { await repository.onModuleDestroy(); throw error; }
};

