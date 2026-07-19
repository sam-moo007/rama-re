import { Pool, type PoolConfig } from "pg";

const positiveInteger = (value: string | undefined, fallback: number, name: string): number => {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) throw new Error(`${name} must be a positive integer.`);
  return parsed;
};

export function postgresPoolConfig(
  environment: NodeJS.ProcessEnv,
  applicationName: string,
): PoolConfig {
  let connectionString = environment.DATABASE_URL?.trim();
  if (!connectionString) {
    if (environment.NODE_ENV === "test") {
      connectionString = "postgresql://test:test@localhost:5432/test";
    } else {
      throw new Error("DATABASE_URL is required for PostgreSQL persistence.");
    }
  }

  const sslMode = environment.DATABASE_SSL_MODE?.trim().toLowerCase() ?? "disable";
  if (!new Set(["disable", "require", "verify-full"]).has(sslMode)) {
    throw new Error("DATABASE_SSL_MODE must be 'disable', 'require', or 'verify-full'.");
  }
  if (environment.NODE_ENV === "production" && sslMode === "disable") {
    throw new Error("DATABASE_SSL_MODE cannot be 'disable' in production.");
  }

  return {
    connectionString,
    application_name: applicationName,
    max: positiveInteger(environment.DATABASE_POOL_MAX, 10, "DATABASE_POOL_MAX"),
    idleTimeoutMillis: positiveInteger(
      environment.DATABASE_IDLE_TIMEOUT_MS,
      30_000,
      "DATABASE_IDLE_TIMEOUT_MS",
    ),
    connectionTimeoutMillis: positiveInteger(
      environment.DATABASE_CONNECT_TIMEOUT_MS,
      5_000,
      "DATABASE_CONNECT_TIMEOUT_MS",
    ),
    statement_timeout: positiveInteger(
      environment.DATABASE_STATEMENT_TIMEOUT_MS,
      10_000,
      "DATABASE_STATEMENT_TIMEOUT_MS",
    ),
    ssl:
      sslMode === "disable"
        ? false
        : {
            rejectUnauthorized: true,
            ...(environment.DATABASE_SSL_CA ? { ca: environment.DATABASE_SSL_CA } : {}),
          },
  };
}

export const createPostgresPool = (
  environment: NodeJS.ProcessEnv,
  applicationName: string,
): Pool => new Pool(postgresPoolConfig(environment, applicationName));
