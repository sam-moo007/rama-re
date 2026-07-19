import {
  ConflictException,
  Inject,
  Injectable,
  UnprocessableEntityException,
} from "@nestjs/common";
import {
  SecuredArtifactListResponseSchema,
  type IngestionArtifact,
  type SecuredArtifact,
  type SecuredArtifactListResponse,
} from "@rama/contracts";
import { randomUUID } from "node:crypto";

import {
  ARTIFACT_OBJECT_STORE,
  MALWARE_SCANNER,
  ArtifactObjectConflictError,
  type ArtifactObjectStore,
  type MalwareScanner,
} from "./artifact-security.ports";

@Injectable()
export class ArtifactSecurityService {
  constructor(
    @Inject(ARTIFACT_OBJECT_STORE) private readonly store: ArtifactObjectStore,
    @Inject(MALWARE_SCANNER) private readonly scanner: MalwareScanner,
  ) {}

  async inspectAndStore(input: {
    sourceKey: string;
    batchIdempotencyKey: string;
    artifact: IngestionArtifact;
    bytes: Buffer;
    submittedBy: string;
  }): Promise<SecuredArtifact> {
    const scan = await this.scanner.scan(input.bytes);
    let record: SecuredArtifact;
    try {
      record = await this.store.putImmutable({ id: randomUUID(), ...input }, scan);
    } catch (error) {
      if (error instanceof ArtifactObjectConflictError) {
        throw new ConflictException({
          code: "ARTIFACT_IMMUTABILITY_CONFLICT",
          message: error.message,
          objectKey: error.objectKey,
        });
      }
      throw error;
    }
    if (scan.verdict === "malicious") {
      throw new UnprocessableEntityException({
        code: "PARTNER_FILE_MALWARE_DETECTED",
        message: "The partner file was isolated in quarantine and was not ingested.",
        artifactId: record.id,
        signature: scan.signature,
      });
    }
    return record;
  }

  async list(): Promise<SecuredArtifactListResponse> {
    return SecuredArtifactListResponseSchema.parse({
      items: await this.store.list(),
      generatedAt: new Date().toISOString(),
    });
  }
}
