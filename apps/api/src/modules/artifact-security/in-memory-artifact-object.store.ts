import { SecuredArtifactSchema, type ArtifactScan, type SecuredArtifact } from "@rama/contracts";

import {
  ArtifactObjectConflictError,
  type ArtifactObjectStore,
  type SecureArtifactInput,
} from "./artifact-security.ports";

export class InMemoryArtifactObjectStore implements ArtifactObjectStore {
  private readonly objects = new Map<string, { bytes: Buffer; record: SecuredArtifact }>();

  async putImmutable(input: SecureArtifactInput, scan: ArtifactScan): Promise<SecuredArtifact> {
    const bucket = scan.verdict === "malicious" ? "rama-development-quarantine" : "rama-development";
    const key = `${bucket}:${input.artifact.objectKey}`;
    const existing = this.objects.get(key);
    if (existing) {
      if (existing.record.artifact.sha256 !== input.artifact.sha256) {
        throw new ArtifactObjectConflictError(input.artifact.objectKey);
      }
      return SecuredArtifactSchema.parse({ ...existing.record, replayed: true });
    }
    const record = SecuredArtifactSchema.parse({
      id: input.id,
      sourceKey: input.sourceKey,
      batchIdempotencyKey: input.batchIdempotencyKey,
      storageDriver: "memory",
      bucket,
      artifact: input.artifact,
      scan,
      immutable: true,
      submittedBy: input.submittedBy,
      storedAt: new Date().toISOString(),
      replayed: false,
    });
    this.objects.set(key, { bytes: Buffer.from(input.bytes), record });
    return structuredClone(record);
  }

  async list(): Promise<SecuredArtifact[]> {
    return structuredClone(
      [...this.objects.values()]
        .map(({ record }) => record)
        .sort((left, right) => right.storedAt.localeCompare(left.storedAt)),
    );
  }
}
