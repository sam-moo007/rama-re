import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import type { CustomerNotification } from "@rama/contracts";

import { CurrentActor } from "../../common/auth/current-actor.decorator";
import type { RamaActor } from "../../common/auth/rama-actor";
import { Roles } from "../../common/auth/roles.decorator";
import { CommunicationsService } from "./communications.service";

@Controller("notifications")
@Roles("customer")
export class CustomerNotificationsController {
  constructor(private readonly service: CommunicationsService) {}
  @Get("mine") mine(@CurrentActor() actor: RamaActor) { return this.service.mine(actor); }
  @Post(":id/read") read(@Param("id") id: string, @Body() input: unknown, @CurrentActor() actor: RamaActor): Promise<CustomerNotification> { return this.service.markRead(id, input, actor); }
}
