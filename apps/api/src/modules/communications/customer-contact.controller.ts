import { Body, Controller, Get, Post, Put } from "@nestjs/common";
import type { ContactProfile } from "@rama/contracts";

import { CurrentActor } from "../../common/auth/current-actor.decorator";
import type { RamaActor } from "../../common/auth/rama-actor";
import { Roles } from "../../common/auth/roles.decorator";
import { ContactProfileService } from "./contact-profile.service";

@Controller("contact-profile")
@Roles("customer")
export class CustomerContactController {
  constructor(private readonly service: ContactProfileService) {}
  @Get("mine") mine(@CurrentActor() actor: RamaActor) { return this.service.mine(actor); }
  @Put("points") replace(@Body() input: unknown, @CurrentActor() actor: RamaActor): Promise<ContactProfile> { return this.service.replaceContactPoints(input, actor); }
  @Put("preferences") preferences(@Body() input: unknown, @CurrentActor() actor: RamaActor): Promise<ContactProfile> { return this.service.updatePreferences(input, actor); }
  @Post("verification/request") request(@Body() input: unknown, @CurrentActor() actor: RamaActor) { return this.service.requestVerification(input, actor); }
  @Post("verification/confirm") confirm(@Body() input: unknown, @CurrentActor() actor: RamaActor): Promise<ContactProfile> { return this.service.confirmVerification(input, actor); }
}
