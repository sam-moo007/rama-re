import { Logger } from "@nestjs/common";

import { createPostgresPool } from "../../common/database/postgres-pool";
import type { EvidenceOperationsRepository } from "./evidence-operations.repository";
import { InMemoryEvidenceOperationsRepository } from "./in-memory-evidence-operations.repository";
import { PostgresEvidenceOperationsRepository } from "./postgres-evidence-operations.repository";

export type EvidenceRepositoryDriver = "memory" | "postgres";

export function resolveEvidenceRepositoryDriver(
  environment: NodeJS.ProcessEnv = process.env,
): EvidenceRepositoryDriver {
  const configured = environment.EVIDENCE_REPOSITORY?.trim().toLowerCase();
  if (configured === "memory" || configured === "postgres") return configured;
  if (configured) {
    throw new Error("EVIDENCE_REPOSITORY must be either 'memory' or 'postgres'.");
  }
  return "postgres";
}

export async function createEvidenceOperationsRepository(
  environment: NodeJS.ProcessEnv = process.env,
): Promise<EvidenceOperationsRepository> {
  const driver = resolveEvidenceRepositoryDriver(environment);
  if (driver === "memory") {
    Logger.warn(
      "Evidence operations are using volatile in-memory persistence.",
      "EvidenceRepository",
    );
    return new InMemoryEvidenceOperationsRepository();
  }

  const seedFixtures = environment.EVIDENCE_SEED_FIXTURES === "true";
  if (seedFixtures && environment.NODE_ENV === "production") {
    throw new Error("EVIDENCE_SEED_FIXTURES cannot be enabled in production.");
  }

  const repository = new PostgresEvidenceOperationsRepository(
    createPostgresPool(environment, "rama-api-evidence"),
  );
  try {
    await repository.checkConnection();
    if (seedFixtures) {
      const fixtureRepository = new InMemoryEvidenceOperationsRepository();
      const seeded = await repository.seedIfEmpty(await fixtureRepository.list());
      Logger.log(`Seeded ${seeded} evidence work items.`, "EvidenceRepository");
    }
    Logger.log("Evidence operations are using PostgreSQL persistence.", "EvidenceRepository");
    return repository;
  } catch (error) {
    await repository.onModuleDestroy();
    throw error;
  }
}
