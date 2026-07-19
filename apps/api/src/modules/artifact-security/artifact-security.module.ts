import { Module } from "@nestjs/common";

import { createArtifactObjectStore, createMalwareScanner } from "./artifact-security.factory";
import { ARTIFACT_OBJECT_STORE, MALWARE_SCANNER } from "./artifact-security.ports";
import { ArtifactSecurityService } from "./artifact-security.service";

@Module({
  providers: [
    ArtifactSecurityService,
    { provide: ARTIFACT_OBJECT_STORE, useFactory: createArtifactObjectStore },
    { provide: MALWARE_SCANNER, useFactory: createMalwareScanner },
  ],
  exports: [ArtifactSecurityService],
})
export class ArtifactSecurityModule {}
