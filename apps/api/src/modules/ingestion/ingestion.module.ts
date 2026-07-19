import { Module } from "@nestjs/common";

import { PropertiesModule } from "../properties/properties.module";
import { ArtifactSecurityModule } from "../artifact-security/artifact-security.module";
import { IngestionController } from "./ingestion.controller";
import { createIngestionRepository } from "./ingestion-repository.factory";
import { INGESTION_REPOSITORY } from "./ingestion.repository";
import { IngestionService } from "./ingestion.service";
import { PartnerIngestionService } from "./partner-ingestion.service";

@Module({
  imports: [PropertiesModule, ArtifactSecurityModule],
  controllers: [IngestionController],
  providers: [
    IngestionService,
    PartnerIngestionService,
    {
      provide: INGESTION_REPOSITORY,
      useFactory: createIngestionRepository,
    },
  ],
  exports: [IngestionService, PartnerIngestionService],
})
export class IngestionModule {}
