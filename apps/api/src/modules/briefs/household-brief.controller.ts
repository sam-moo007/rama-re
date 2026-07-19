import { Body, Controller, Get, Param, Post, Put } from "@nestjs/common";
import type { HouseholdBrief, HouseholdBriefListResponse } from "@rama/contracts";

import { CurrentActor } from "../../common/auth/current-actor.decorator";
import type { RamaActor } from "../../common/auth/rama-actor";
import { Roles } from "../../common/auth/roles.decorator";
import { HouseholdBriefService } from "./household-brief.service";

@Controller("briefs")
@Roles("customer")
export class HouseholdBriefController {
  constructor(private readonly service: HouseholdBriefService) {}

  @Post()
  create(@Body() command: unknown, @CurrentActor() actor: RamaActor): Promise<HouseholdBrief> {
    return this.service.create(command, actor);
  }

  @Get("mine")
  listMine(@CurrentActor() actor: RamaActor): Promise<HouseholdBriefListResponse> {
    return this.service.listMine(actor);
  }

  @Get(":id")
  get(@Param("id") id: string, @CurrentActor() actor: RamaActor): Promise<HouseholdBrief> {
    return this.service.get(id, actor);
  }

  @Put(":id")
  update(
    @Param("id") id: string,
    @Body() command: unknown,
    @CurrentActor() actor: RamaActor,
  ): Promise<HouseholdBrief> {
    return this.service.update(id, command, actor);
  }

  @Post(":id/submit")
  submit(
    @Param("id") id: string,
    @Body() command: unknown,
    @CurrentActor() actor: RamaActor,
  ): Promise<HouseholdBrief> {
    return this.service.submit(id, command, actor);
  }

  @Post(":id/consent")
  amendConsent(
    @Param("id") id: string,
    @Body() command: unknown,
    @CurrentActor() actor: RamaActor,
  ): Promise<HouseholdBrief> {
    return this.service.amendConsent(id, command, actor);
  }
}
