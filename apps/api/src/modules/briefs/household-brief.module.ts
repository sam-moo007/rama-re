import { Module } from "@nestjs/common";

import { HouseholdBriefController } from "./household-brief.controller";
import { createHouseholdBriefRepository } from "./household-brief-repository.factory";
import { HOUSEHOLD_BRIEF_REPOSITORY } from "./household-brief.repository";
import { HouseholdBriefService } from "./household-brief.service";

@Module({
  controllers: [HouseholdBriefController],
  providers: [
    HouseholdBriefService,
    { provide: HOUSEHOLD_BRIEF_REPOSITORY, useFactory: createHouseholdBriefRepository },
  ],
  exports: [HouseholdBriefService],
})
export class HouseholdBriefModule {}
