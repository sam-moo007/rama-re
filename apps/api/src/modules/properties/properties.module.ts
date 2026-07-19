import { Module } from "@nestjs/common";

import { HouseholdBriefModule } from "../briefs/household-brief.module";
import { createCatalogueRepository } from "./catalogue-repository.factory";
import { CATALOGUE_CURSOR_CODEC } from "./catalogue-cursor.codec";
import { createCatalogueCursorCodec } from "./catalogue-cursor.factory";
import { CatalogueIndexReconciliationService } from "./catalogue-index-reconciliation.service";
import { CatalogueIndexReconciliationWorker } from "./catalogue-index-reconciliation.worker";
import {CatalogueIndexController} from "./catalogue-index.controller";
import { CATALOGUE_SEARCH_INDEX } from "./catalogue-search-index.port";
import { createCatalogueSearchIndex } from "./catalogue-search-index.factory";
import { CATALOGUE_REPOSITORY } from "./catalogue.repository";
import { CatalogueSearchService } from "./catalogue-search.service";
import { CatalogueCandidateRetrievalService } from "./catalogue-candidate-retrieval.service";
import { PropertiesController } from "./properties.controller";
import { PropertiesService } from "./properties.service";
import { BullModule } from "@nestjs/bullmq";
import { PostgresPropertiesRepository } from "./postgres-properties.repository";

@Module({
  imports: [
    HouseholdBriefModule,
    BullModule.registerQueue({
      name: "catalogue-reconciliation",
    }),
  ],
  controllers: [PropertiesController,CatalogueIndexController],
  providers: [PropertiesService, PostgresPropertiesRepository, CatalogueSearchService,CatalogueCandidateRetrievalService,CatalogueIndexReconciliationService,CatalogueIndexReconciliationWorker,{ provide: CATALOGUE_REPOSITORY, useFactory: createCatalogueRepository }, { provide: CATALOGUE_CURSOR_CODEC, useFactory: createCatalogueCursorCodec },{provide:CATALOGUE_SEARCH_INDEX,useFactory:createCatalogueSearchIndex}],
  exports: [PropertiesService, CATALOGUE_REPOSITORY],
})
export class PropertiesModule {}
