import { Body, Controller, Post } from "@nestjs/common";
import type { AdvisorConsentWithdrawalResponse } from "@rama/contracts";

import { CurrentActor } from "../../common/auth/current-actor.decorator";
import type { RamaActor } from "../../common/auth/rama-actor";
import { Roles } from "../../common/auth/roles.decorator";
import { DecisionCaseService } from "./decision-case.service";

@Controller("privacy")
@Roles("customer")
export class CustomerPrivacyController {
  constructor(private readonly service: DecisionCaseService) {}

  @Post("advisor-consent/withdraw")
  withdrawAdvisorConsent(
    @Body() input: unknown,
    @CurrentActor() actor: RamaActor,
  ): Promise<AdvisorConsentWithdrawalResponse> {
    return this.service.withdrawAdvisorConsent(input, actor);
  }
}
