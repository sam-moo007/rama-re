import type { ArtifactScan, IngestionArtifact, SecuredArtifact } from "@rama/contracts";

export const ARTIFACT_OBJECT_STORE = Symbol("ARTIFACT_OBJECT_STORE");
export const MALWARE_SCANNER = Symbol("MALWARE_SCANNER");

export type SecureArtifactInput = {
  id: string;
  sourceKey: string;
  batchIdempotencyKey: string;
  artifact: IngestionArtifact;
  bytes: Buffer;
  submittedBy: string;
};

export interface ArtifactObjectStore {
  putImmutable(input: SecureArtifactInput, scan: ArtifactScan): Promise<SecuredArtifact>;
  list(): Promise<SecuredArtifact[]>;
}

export interface MalwareScanner {
  scan(bytes: Buffer): Promise<ArtifactScan>;
}

export class ArtifactObjectConflictError extends Error {
  constructor(readonly objectKey: string) {
    super(`Artifact object '${objectKey}' already exists with different immutable content.`);
    this.name = "ArtifactObjectConflictError";
  }
}
