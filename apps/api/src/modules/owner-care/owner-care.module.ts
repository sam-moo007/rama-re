import { Module } from "@nestjs/common";
import { OwnerCareController } from "./owner-care.controller";
import { OwnerCareService } from "./owner-care.service";

@Module({
  controllers: [OwnerCareController],
  providers: [OwnerCareService],
  exports: [OwnerCareService],
})
export class OwnerCareModule {}
