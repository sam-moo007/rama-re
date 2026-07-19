import { Body, Controller, Get, Put } from "@nestjs/common";
import type { PropertyShortlist, PropertyShortlistMineResponse } from "@rama/contracts";

import { CurrentActor } from "../../common/auth/current-actor.decorator";
import type { RamaActor } from "../../common/auth/rama-actor";
import { Roles } from "../../common/auth/roles.decorator";
import { ShortlistService } from "./shortlist.service";

@Controller("shortlists")
@Roles("customer")
export class ShortlistController {
  constructor(private readonly service: ShortlistService) {}

  @Get("mine")
  getMine(@CurrentActor() actor: RamaActor): Promise<PropertyShortlistMineResponse> {
    return this.service.getMine(actor);
  }

  @Put("mine")
  update(@Body() input: unknown, @CurrentActor() actor: RamaActor): Promise<PropertyShortlist> {
    return this.service.update(input, actor);
  }
}

