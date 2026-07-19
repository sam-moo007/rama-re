import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import type {
  EntityResolutionQueueResponse,
  EntityResolutionWorkItem,
  IngestionRecordListResponse,
  IngestionSource,
  ManualIngestionResult,
  PartnerFileImportResult,
  SecuredArtifactListResponse,
} from "@rama/contracts";

import { CurrentActor } from "../../common/auth/current-actor.decorator";
import type { RamaActor } from "../../common/auth/rama-actor";
import { Roles } from "../../common/auth/roles.decorator";
import { IngestionService } from "./ingestion.service";
import { PartnerIngestionService } from "./partner-ingestion.service";
import { ArtifactSecurityService } from "../artifact-security/artifact-security.service";

@Controller("ingestion")
@Roles("evidence_analyst", "evidence_lead")
export class IngestionController {
  constructor(
    private readonly ingestionService: IngestionService,
    private readonly partnerIngestionService: PartnerIngestionService,
    private readonly artifactSecurityService: ArtifactSecurityService,
  ) {}

  @Get("sources")
  listSources(): Promise<IngestionSource[]> {
    return this.ingestionService.listSources();
  }

  @Post("sources")
  @Roles("evidence_lead")
  createSource(@Body() command: unknown, @CurrentActor() actor: RamaActor): Promise<IngestionSource> {
    return this.ingestionService.createSource(command, actor);
  }

  @Post("sources/:key/disable")
  @Roles("evidence_lead")
  disableSource(
    @Param("key") key: string,
    @Body() command: unknown,
    @CurrentActor() actor: RamaActor,
  ): Promise<IngestionSource> {
    return this.ingestionService.disableSource(key, command, actor);
  }

  @Post("sources/:key/enable")
  @Roles("evidence_lead")
  enableSource(
    @Param("key") key: string,
    @Body() command: unknown,
    @CurrentActor() actor: RamaActor,
  ): Promise<IngestionSource> {
    return this.ingestionService.enableSource(key, command, actor);
  }

  @Post("manual")
  ingestManual(
    @Body() command: unknown,
    @CurrentActor() actor: RamaActor,
  ): Promise<ManualIngestionResult> {
    return this.ingestionService.ingestManual(command, actor);
  }

  @Post("partner-file")
  importPartnerFile(
    @Body() command: unknown,
    @CurrentActor() actor: RamaActor,
  ): Promise<PartnerFileImportResult> {
    return this.partnerIngestionService.importCsv(command, actor);
  }

  @Get("resolution-queue")
  getResolutionQueue(): Promise<EntityResolutionQueueResponse> {
    return this.partnerIngestionService.getResolutionQueue();
  }

  @Post("resolution-queue/:id/resolve")
  resolveEntity(
    @Param("id") id: string,
    @Body() command: unknown,
    @CurrentActor() actor: RamaActor,
  ): Promise<EntityResolutionWorkItem> {
    return this.partnerIngestionService.resolveEntity(id, command, actor);
  }

  @Get("records")
  listRecords(@Query("limit") limit?: string): Promise<IngestionRecordListResponse> {
    return this.ingestionService.listRecords(limit);
  }

  @Get("artifacts")
  @Roles("evidence_lead")
  listArtifacts(): Promise<SecuredArtifactListResponse> {
    return this.artifactSecurityService.list();
  }
}
