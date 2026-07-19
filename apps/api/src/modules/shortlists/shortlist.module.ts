import { Module } from "@nestjs/common";

import { PropertiesModule } from "../properties/properties.module";
import { ShortlistController } from "./shortlist.controller";
import { createShortlistRepository } from "./shortlist-repository.factory";
import { SHORTLIST_REPOSITORY } from "./shortlist.repository";
import { ShortlistService } from "./shortlist.service";

@Module({
  imports: [PropertiesModule],
  controllers: [ShortlistController],
  providers: [ShortlistService, { provide: SHORTLIST_REPOSITORY, useFactory: createShortlistRepository }],
  exports: [ShortlistService],
})
export class ShortlistModule {}
