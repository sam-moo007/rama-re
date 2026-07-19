import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import type { AdvisorCaseContextResponse, AdvisorCaseQueueResponse, AdvisorDecisionCase } from "@rama/contracts";

import { CurrentActor } from "../../common/auth/current-actor.decorator";
import type { RamaActor } from "../../common/auth/rama-actor";
import { Roles } from "../../common/auth/roles.decorator";
import { DecisionCaseService } from "./decision-case.service";

@Controller("advisor/cases")
@Roles("advisor")
export class AdvisorDecisionCaseController {
  constructor(private readonly service: DecisionCaseService) {}

  @Get("queue") queue(@CurrentActor() actor: RamaActor): Promise<AdvisorCaseQueueResponse> { return this.service.advisorQueue(actor); }
  @Get(":id/context") context(@Param("id") id: string, @CurrentActor() actor: RamaActor): Promise<AdvisorCaseContextResponse> { return this.service.advisorContext(id, actor); }
  @Post(":id/claim") claim(@Param("id") id: string, @Body() input: unknown, @CurrentActor() actor: RamaActor): Promise<AdvisorDecisionCase> { return this.service.claim(id, input, actor); }
  @Post(":id/close") close(@Param("id") id: string, @Body() input: unknown, @CurrentActor() actor: RamaActor): Promise<AdvisorDecisionCase> { return this.service.close(id, input, actor); }
}
