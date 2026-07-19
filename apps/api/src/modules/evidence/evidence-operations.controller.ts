import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import type { EvidenceQueueResponse, EvidenceWorkItem } from "@rama/contracts";

import { CurrentActor } from "../../common/auth/current-actor.decorator";
import type { RamaActor } from "../../common/auth/rama-actor";
import { Roles } from "../../common/auth/roles.decorator";
import { EvidenceOperationsService } from "./evidence-operations.service";

@Controller("evidence")
@Roles("evidence_analyst", "evidence_lead")
export class EvidenceOperationsController {
  constructor(private readonly evidenceService: EvidenceOperationsService) {}

  @Get("queue")
  getQueue(): Promise<EvidenceQueueResponse> {
    return this.evidenceService.getQueue();
  }

  @Get(":id")
  getById(@Param("id") id: string): Promise<EvidenceWorkItem> {
    return this.evidenceService.getById(id);
  }

  @Post(":id/reviews")
  review(
    @Param("id") id: string,
    @Body() command: unknown,
    @CurrentActor() actor: RamaActor,
  ): Promise<EvidenceWorkItem> {
    return this.evidenceService.review(id, command, actor);
  }

  @Post(":id/publish")
  @Roles("evidence_lead")
  publish(
    @Param("id") id: string,
    @Body() command: unknown,
    @CurrentActor() actor: RamaActor,
  ): Promise<EvidenceWorkItem> {
    return this.evidenceService.publish(id, command, actor);
  }

  @Post(":id/expire")
  @Roles("evidence_lead")
  expire(
    @Param("id") id: string,
    @Body() command: unknown,
    @CurrentActor() actor: RamaActor,
  ): Promise<EvidenceWorkItem> {
    return this.evidenceService.expire(id, command, actor);
  }

  @Post(":id/corrections")
  requestCorrection(
    @Param("id") id: string,
    @Body() command: unknown,
    @CurrentActor() actor: RamaActor,
  ): Promise<EvidenceWorkItem> {
    return this.evidenceService.requestCorrection(id, command, actor);
  }

  @Post(":id/supersede")
  @Roles("evidence_lead")
  supersede(
    @Param("id") id: string,
    @Body() command: unknown,
    @CurrentActor() actor: RamaActor,
  ): Promise<EvidenceWorkItem> {
    return this.evidenceService.supersede(id, command, actor);
  }
}
