import type{CatalogueIndexReconciliationResult,CatalogueIndexStatusResponse}from "@rama/contracts";
import{Controller,Get,Post}from "@nestjs/common";

import{Roles}from "../../common/auth/roles.decorator";
import{CatalogueIndexReconciliationService}from "./catalogue-index-reconciliation.service";

@Controller("catalogue-index")
@Roles("evidence_analyst","evidence_lead")
export class CatalogueIndexController{
  constructor(private readonly reconciliation:CatalogueIndexReconciliationService){}
  @Get("status")status():Promise<CatalogueIndexStatusResponse>{return this.reconciliation.status()}
  @Post("reconcile")@Roles("evidence_lead")reconcile():Promise<CatalogueIndexReconciliationResult>{return this.reconciliation.reconcile()}
}
