import { Body, Controller, Param, Post } from "@nestjs/common";
import type { CustomerNotification } from "@rama/contracts";

import { CurrentActor } from "../../common/auth/current-actor.decorator";
import type { RamaActor } from "../../common/auth/rama-actor";
import { Roles } from "../../common/auth/roles.decorator";
import { CommunicationsService } from "./communications.service";

@Controller("advisor/cases")
@Roles("advisor")
export class AdvisorMessagesController {
  constructor(private readonly service: CommunicationsService) {}
  @Post(":id/messages") send(@Param("id") id: string, @Body() input: unknown, @CurrentActor() actor: RamaActor): Promise<CustomerNotification> { return this.service.sendAdvisorMessage(id, input, actor); }
}
