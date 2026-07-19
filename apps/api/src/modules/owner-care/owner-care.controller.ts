import { Body, Controller, Get, Param, Patch, Post, Request } from "@nestjs/common";
import { OwnerCareService } from "./owner-care.service";

@Controller("owner-care")
export class OwnerCareController {
  constructor(private readonly ownerCareService: OwnerCareService) {}

  @Get("properties/:propertyId/snags")
  getSnags(@Param("propertyId") propertyId: string) {
    return this.ownerCareService.getTicketsByProperty(propertyId);
  }

  @Post("properties/:propertyId/snags")
  createSnag(
    @Param("propertyId") propertyId: string,
    @Body() body: { title: string; description: string; photoUrl?: string },
    @Request() req: any
  ) {
    return this.ownerCareService.createTicket({
      propertyId,
      userId: req.user.id,
      title: body.title,
      description: body.description,
      photoUrl: body.photoUrl,
    });
  }

  @Patch("snags/:ticketId/status")
  updateSnagStatus(
    @Param("ticketId") ticketId: string,
    @Body() body: { status: "open" | "in_progress" | "resolved" }
  ) {
    return this.ownerCareService.updateTicketStatus(ticketId, body.status);
  }
}
