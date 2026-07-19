import { Body, Controller, Post, Param } from "@nestjs/common";
import { AiService } from "./ai.service";

@Controller("ai")
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post("chat/:propertyId")
  async chat(
    @Param("propertyId") propertyId: string,
    @Body() body: { messages: { role: "user" | "assistant" | "system"; content: string }[] }
  ) {
    // In a real RAG scenario, this would ideally return a Streaming Text Response
    // For this MVP, we return a simple JSON payload
    const result = await this.aiService.queryWithRetrieval(body.messages, propertyId);
    return result;
  }
}
