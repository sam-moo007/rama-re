import {CatalogueIndexReconciliationResultSchema,CatalogueIndexStatusResponseSchema,type CatalogueIndexReconciliationResult,type CatalogueIndexStatusResponse} from "@rama/contracts";
import { Inject, Injectable, Optional } from "@nestjs/common";
import { randomUUID } from "node:crypto";

import { CATALOGUE_REPOSITORY, type CatalogueRepository } from "./catalogue.repository";
import { CatalogueCandidateRetrievalService } from "./catalogue-candidate-retrieval.service";
import { CATALOGUE_SEARCH_INDEX, type CatalogueSearchIndexPort } from "./catalogue-search-index.port";

@Injectable()
export class CatalogueIndexReconciliationService{
  private active:Promise<CatalogueIndexReconciliationResult>|null=null;private lastResult:CatalogueIndexReconciliationResult|null=null;
  constructor(@Inject(CATALOGUE_REPOSITORY)private readonly catalogue:CatalogueRepository,@Inject(CATALOGUE_SEARCH_INDEX)private readonly index:CatalogueSearchIndexPort,@Optional() private readonly retrieval?:CatalogueCandidateRetrievalService){}
  reconcile():Promise<CatalogueIndexReconciliationResult>{if(this.active)return this.active;this.active=this.run().finally(()=>{this.active=null});return this.active}
  async status():Promise<CatalogueIndexStatusResponse>{return CatalogueIndexStatusResponseSchema.parse({durable:this.index.durable,documentCount:await this.index.documentCount(),...(this.retrieval?.status()??{readSource:"repository",lastCandidateRead:null}),lastReconciliation:this.lastResult,generatedAt:new Date().toISOString()})}
  private async run(){const generation=randomUUID();await this.index.startReconciliation(generation);let afterSlug:string|null=null;let indexed=0;const batchSize=250;
    while(true){const records=await this.catalogue.listIndexBatch(afterSlug,batchSize);if(!records.length)break;await this.index.indexBatch(generation,records);indexed+=records.length;afterSlug=records.at(-1)!.slug;if(records.length<batchSize)break}
    const removed=await this.index.finishReconciliation(generation);const documentCount=await this.index.documentCount();const result=CatalogueIndexReconciliationResultSchema.parse({generation,indexed,removed,documentCount,completedAt:new Date().toISOString()});this.lastResult=result;return result}
}
