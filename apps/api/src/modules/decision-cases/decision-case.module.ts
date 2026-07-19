import { Module } from "@nestjs/common";

import { HouseholdBriefModule } from "../briefs/household-brief.module";
import { ShortlistModule } from "../shortlists/shortlist.module";
import { AdvisorDecisionCaseController } from "./advisor-decision-case.controller";
import { CustomerDecisionCaseController } from "./customer-decision-case.controller";
import { CustomerPrivacyController } from "./customer-privacy.controller";
import { createDecisionCaseRepository } from "./decision-case-repository.factory";
import { DECISION_CASE_REPOSITORY } from "./decision-case.repository";
import { DecisionCaseRetentionWorker } from "./decision-case-retention.worker";
import { DecisionCaseService } from "./decision-case.service";

@Module({
  imports: [HouseholdBriefModule, ShortlistModule],
  controllers: [CustomerDecisionCaseController, CustomerPrivacyController, AdvisorDecisionCaseController],
  providers: [DecisionCaseService, DecisionCaseRetentionWorker, { provide: DECISION_CASE_REPOSITORY, useFactory: createDecisionCaseRepository }],
  exports: [DecisionCaseService],
})
export class DecisionCaseModule {}
