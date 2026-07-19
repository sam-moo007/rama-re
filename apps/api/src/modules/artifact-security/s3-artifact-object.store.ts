import {
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { SecuredArtifactSchema, type ArtifactScan, type SecuredArtifact } from "@rama/contracts";

import {
  ArtifactObjectConflictError,
  type ArtifactObjectStore,
  type SecureArtifactInput,
} from "./artifact-security.ports";

export class S3ArtifactObjectStore implements ArtifactObjectStore {
  constructor(
    private readonly client: S3Client,
    private readonly cleanBucket: string,
    private readonly quarantineBucket: string,
  ) {}

  async putImmutable(input: SecureArtifactInput, scan: ArtifactScan): Promise<SecuredArtifact> {
    const bucket = scan.verdict === "malicious" ? this.quarantineBucket : this.cleanBucket;
    const key = input.artifact.objectKey;
    try {
      const existing = await this.client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
      if (existing.Metadata?.sha256 !== input.artifact.sha256) {
        throw new ArtifactObjectConflictError(key);
      }
      return this.record(input, scan, bucket, existing.Metadata ?? {}, existing.LastModified, true);
    } catch (error) {
      if (error instanceof ArtifactObjectConflictError) throw error;
      const status = (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode;
      if (status !== 404 && (error as { name?: string }).name !== "NotFound") throw error;
    }

    const storedAt = new Date().toISOString();
    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: input.bytes,
          ContentLength: input.bytes.byteLength,
          ContentType: input.artifact.mimeType,
          IfNoneMatch: "*",
          ServerSideEncryption: "AES256",
          Metadata: {
            "record-id": input.id,
            sha256: input.artifact.sha256,
            "source-key": input.sourceKey,
            "batch-idempotency-key": input.batchIdempotencyKey,
            "scan-engine": scan.engine,
            "scan-verdict": scan.verdict,
            "scan-signature": scan.signature ?? "",
            "scanned-at": scan.scannedAt,
            "submitted-by": input.submittedBy,
            "stored-at": storedAt,
            immutable: "true",
          },
          Tagging: `scan=${encodeURIComponent(scan.verdict)}&source=${encodeURIComponent(input.sourceKey)}`,
        }),
      );
    } catch (error) {
      const status = (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode;
      if (status === 409 || status === 412) throw new ArtifactObjectConflictError(key);
      throw error;
    }
    return SecuredArtifactSchema.parse({
      id: input.id,
      sourceKey: input.sourceKey,
      batchIdempotencyKey: input.batchIdempotencyKey,
      storageDriver: "s3",
      bucket,
      artifact: input.artifact,
      scan,
      immutable: true,
      submittedBy: input.submittedBy,
      storedAt,
      replayed: false,
    });
  }

  async list(): Promise<SecuredArtifact[]> {
    const records: SecuredArtifact[] = [];
    for (const bucket of [this.cleanBucket, this.quarantineBucket]) {
      const listed = await this.client.send(new ListObjectsV2Command({ Bucket: bucket }));
      for (const object of listed.Contents ?? []) {
        if (!object.Key) continue;
        const head = await this.client.send(new HeadObjectCommand({ Bucket: bucket, Key: object.Key }));
        const metadata = head.Metadata ?? {};
        if (!metadata.sha256 || !metadata["record-id"] || !metadata["source-key"]) continue;
        records.push(
          SecuredArtifactSchema.parse({
            id: metadata["record-id"],
            sourceKey: metadata["source-key"],
            batchIdempotencyKey: metadata["batch-idempotency-key"],
            storageDriver: "s3",
            bucket,
            artifact: {
              objectKey: object.Key,
              sha256: metadata.sha256,
              mimeType: head.ContentType,
              byteSize: head.ContentLength,
              capturedAt: null,
            },
            scan: {
              engine: metadata["scan-engine"],
              verdict: metadata["scan-verdict"],
              signature: metadata["scan-signature"] || null,
              scannedAt: metadata["scanned-at"],
            },
            immutable: true,
            submittedBy: metadata["submitted-by"],
            storedAt: metadata["stored-at"] ?? object.LastModified?.toISOString(),
            replayed: false,
          }),
        );
      }
    }
    return records.sort((left, right) => right.storedAt.localeCompare(left.storedAt));
  }

  private record(
    input: SecureArtifactInput,
    scan: ArtifactScan,
    bucket: string,
    metadata: Record<string, string>,
    lastModified: Date | undefined,
    replayed: boolean,
  ): SecuredArtifact {
    return SecuredArtifactSchema.parse({
      id: metadata["record-id"] ?? input.id,
      sourceKey: input.sourceKey,
      batchIdempotencyKey: input.batchIdempotencyKey,
      storageDriver: "s3",
      bucket,
      artifact: input.artifact,
      scan,
      immutable: true,
      submittedBy: input.submittedBy,
      storedAt: metadata["stored-at"] ?? lastModified?.toISOString() ?? new Date().toISOString(),
      replayed,
    });
  }
}
