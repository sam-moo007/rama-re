import { Logger } from "@nestjs/common";

import { createPostgresPool } from "../../common/database/postgres-pool";
import type { CatalogueRepository } from "./catalogue.repository";
import { InMemoryCatalogueRepository } from "./in-memory-catalogue.repository";
import { PostgresCatalogueRepository } from "./postgres-catalogue.repository";

type CatalogueRepositoryDriver = "memory" | "postgres";

export const resolveCatalogueRepositoryDriver = (environment: NodeJS.ProcessEnv = process.env): CatalogueRepositoryDriver => {
  const configured = environment.CATALOGUE_REPOSITORY?.trim().toLowerCase();
  if (configured === "memory" || configured === "postgres") return configured;
  if (configured) throw new Error("CATALOGUE_REPOSITORY must be 'memory' or 'postgres'.");
  return "postgres";
};

export const createCatalogueRepository = async (environment: NodeJS.ProcessEnv = process.env): Promise<CatalogueRepository> => {
  if (resolveCatalogueRepositoryDriver(environment) === "memory") {
    if (environment.NODE_ENV === "production") throw new Error("Volatile catalogue persistence is forbidden in production.");
    Logger.warn("Catalogue search is using explicit Phase 1 development fixtures.", "CatalogueRepository");
    return new InMemoryCatalogueRepository();
  }
  const repository = new PostgresCatalogueRepository(createPostgresPool(environment, "rama-api-catalogue"));
  try {
    await repository.checkConnection();
    Logger.log("Catalogue search is using PostgreSQL projection persistence.", "CatalogueRepository");
    return repository;
  } catch (error) {
    await repository.onModuleDestroy();
    throw error;
  }
};

