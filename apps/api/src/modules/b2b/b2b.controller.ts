import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { ApiKeyGuard } from "../../common/auth/api-key.guard";
import { ThrottlerGuard } from "@nestjs/throttler";

@Controller("b2b")
@UseGuards(ApiKeyGuard, ThrottlerGuard)
export class B2bController {
  constructor() {}

  @Get("properties/:propertyId/evidence")
  getEvidence(@Param("propertyId") propertyId: string) {
    // This endpoint should be strictly rate-limited
    // Return verified claims for the property (Mocked)
    return {
      propertyId,
      status: "certified",
      evidenceCoverage: 98.5,
      claims: [
        {
          key: "area_sqft",
          value: 2400,
          status: "verified",
          evidenceClass: "document_verified",
          retrievedAt: new Date().toISOString()
        }
      ]
    };
  }

  @Get("properties/:propertyId/tour-link")
  getTourLink(@Param("propertyId") propertyId: string) {
    return {
      propertyId,
      tourLink: `https://app.rama.com/en/property/${propertyId}/tour?b2b=true`,
      tier: "spatial",
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
  }
}
