import { S3Client } from "@aws-sdk/client-s3";

import type { ArtifactObjectStore, MalwareScanner } from "./artifact-security.ports";
import { ClamAvMalwareScanner } from "./clamav-malware.scanner";
import { DeterministicMalwareScanner } from "./deterministic-malware.scanner";
import { InMemoryArtifactObjectStore } from "./in-memory-artifact-object.store";
import { S3ArtifactObjectStore } from "./s3-artifact-object.store";

export type ArtifactStoreDriver = "memory" | "s3";
export type MalwareScannerDriver = "deterministic" | "clamav";

export const resolveArtifactStoreDriver = (
  environment: NodeJS.ProcessEnv = process.env,
): ArtifactStoreDriver => {
  const configured = environment.ARTIFACT_STORE?.trim().toLowerCase();
  if (configured === "memory" || configured === "s3") return configured;
  if (configured) throw new Error("ARTIFACT_STORE must be either 'memory' or 's3'.");
  return environment.NODE_ENV === "production" ? "s3" : "memory";
};

export const resolveMalwareScannerDriver = (
  environment: NodeJS.ProcessEnv = process.env,
): MalwareScannerDriver => {
  const configured = environment.MALWARE_SCANNER?.trim().toLowerCase();
  if (configured === "deterministic" || configured === "clamav") return configured;
  if (configured) throw new Error("MALWARE_SCANNER must be either 'deterministic' or 'clamav'.");
  return environment.NODE_ENV === "production" ? "clamav" : "deterministic";
};

const required = (environment: NodeJS.ProcessEnv, key: string): string => {
  const value = environment[key]?.trim();
  if (!value) throw new Error(`${key} is required for secure artifact processing.`);
  return value;
};

export const createArtifactObjectStore = (
  environment: NodeJS.ProcessEnv = process.env,
): ArtifactObjectStore => {
  if (resolveArtifactStoreDriver(environment) === "memory") {
    if (environment.NODE_ENV === "production") {
      throw new Error("Volatile artifact storage is forbidden in production.");
    }
    return new InMemoryArtifactObjectStore();
  }
  const bucket = required(environment, "OBJECT_STORAGE_BUCKET");
  const quarantineBucket = required(environment, "OBJECT_STORAGE_QUARANTINE_BUCKET");
  if (bucket === quarantineBucket) {
    throw new Error("The clean and quarantine object-storage buckets must be different.");
  }
  const accessKeyId = environment.OBJECT_STORAGE_ACCESS_KEY?.trim();
  const secretAccessKey = environment.OBJECT_STORAGE_SECRET_KEY?.trim();
  if (Boolean(accessKeyId) !== Boolean(secretAccessKey)) {
    throw new Error("Object-storage access key and secret must be configured together.");
  }
  return new S3ArtifactObjectStore(
    new S3Client({
      region: environment.OBJECT_STORAGE_REGION?.trim() || "me-central-1",
      endpoint: environment.OBJECT_STORAGE_ENDPOINT?.trim() || undefined,
      forcePathStyle: environment.OBJECT_STORAGE_FORCE_PATH_STYLE === "true",
      credentials:
        accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : undefined,
    }),
    bucket,
    quarantineBucket,
  );
};

export const createMalwareScanner = (
  environment: NodeJS.ProcessEnv = process.env,
): MalwareScanner => {
  if (resolveMalwareScannerDriver(environment) === "deterministic") {
    if (environment.NODE_ENV === "production") {
      throw new Error("The deterministic development scanner is forbidden in production.");
    }
    return new DeterministicMalwareScanner();
  }
  const port = Number(environment.CLAMAV_PORT ?? "3310");
  const timeoutMs = Number(environment.CLAMAV_TIMEOUT_MS ?? "15000");
  if (!Number.isInteger(port) || port < 1 || port > 65_535) throw new Error("CLAMAV_PORT is invalid.");
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1_000) throw new Error("CLAMAV_TIMEOUT_MS is invalid.");
  return new ClamAvMalwareScanner(required(environment, "CLAMAV_HOST"), port, timeoutMs);
};
