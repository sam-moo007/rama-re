import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import type { CatalogueSearchResponse, PropertyCompareResponse, PropertyDecisionRoom } from "@rama/contracts";

import { CurrentActor } from "../../common/auth/current-actor.decorator";
import type { RamaActor } from "../../common/auth/rama-actor";
import { Roles } from "../../common/auth/roles.decorator";
import { CatalogueSearchService } from "./catalogue-search.service";

import { PropertiesService } from "./properties.service";

@Controller("properties")
export class PropertiesController {
  constructor(
    private readonly propertiesService: PropertiesService,
    private readonly catalogueSearch: CatalogueSearchService,
  ) {}

  @Get("search")
  @Roles("customer")
  search(@Query() query: Record<string, unknown>, @CurrentActor() actor: RamaActor): Promise<CatalogueSearchResponse> {
    return this.catalogueSearch.search(query, actor);
  }

  @Post("compare")
  @Roles("customer")
  compare(@Body() input: unknown, @CurrentActor() actor: RamaActor): Promise<PropertyCompareResponse> {
    return this.catalogueSearch.compare(input, actor);
  }

  @Get(":slug")
  getBySlug(@Param("slug") slug: string): Promise<PropertyDecisionRoom> {
    return this.propertiesService.getBySlug(slug);
  }
}
