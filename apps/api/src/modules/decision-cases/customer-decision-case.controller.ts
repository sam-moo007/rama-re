import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import type { DecisionCase, DecisionCaseListResponse } from "@rama/contracts";

import { CurrentActor } from "../../common/auth/current-actor.decorator";
import type { RamaActor } from "../../common/auth/rama-actor";
import { Roles } from "../../common/auth/roles.decorator";
import { DecisionCaseService } from "./decision-case.service";

@Controller("decision-cases")
@Roles("customer")
export class CustomerDecisionCaseController {
  constructor(private readonly service: DecisionCaseService) {}

  @Get("mine") listMine(@CurrentActor() actor: RamaActor): Promise<DecisionCaseListResponse> { return this.service.listMine(actor); }
  @Post() create(@Body() input: unknown, @CurrentActor() actor: RamaActor): Promise<DecisionCase> { return this.service.create(input, actor); }
  @Post(":id/cancel") cancel(@Param("id") id: string, @Body() input: unknown, @CurrentActor() actor: RamaActor): Promise<DecisionCase> { return this.service.cancel(id, input, actor); }
}

