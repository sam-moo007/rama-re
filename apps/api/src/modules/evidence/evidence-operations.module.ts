import { Module } from "@nestjs/common";

import { createEvidenceOperationsRepository } from "./evidence-repository.factory";
import { EvidenceOperationsController } from "./evidence-operations.controller";
import {
  EVIDENCE_OPERATIONS_REPOSITORY,
} from "./evidence-operations.repository";
import { EvidenceOperationsService } from "./evidence-operations.service";
import { EvidenceFreshnessWorker } from "./evidence-freshness.worker";

@Module({
  controllers: [EvidenceOperationsController],
  providers: [
    EvidenceOperationsService,
    EvidenceFreshnessWorker,
    {
      provide: EVIDENCE_OPERATIONS_REPOSITORY,
      useFactory: createEvidenceOperationsRepository,
    },
  ],
  exports: [EvidenceOperationsService],
})
export class EvidenceOperationsModule {}
