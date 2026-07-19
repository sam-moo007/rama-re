import { Injectable, Logger } from "@nestjs/common";

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  // In a real application, this would interface with a Vector DB (e.g. pgvector)
  // and an LLM provider (e.g. OpenAI or Anthropic via @ai-sdk).
  // For MVP, we simulate bounded retrieval.
  
  async queryWithRetrieval(messages: ChatMessage[], propertyId: string) {
    this.logger.log(`Performing retrieval-augmented query for property ${propertyId}`);
    
    const lastUserMessage = messages.filter(m => m.role === "user").pop();
    const queryText = lastUserMessage?.content.toLowerCase() || "";
    
    // Simulate bounds checking (if they ask about something unrelated)
    if (queryText.includes("weather") || queryText.includes("recipe") || queryText.includes("bitcoin")) {
      return {
        reply: "I am a dedicated property assistant. I can only answer questions related to the verified facts, costs, and evidence of this specific property. Would you like to speak to a human advisor?",
        citations: [],
        escalate: true
      };
    }
    
    // Simulate a valid RAG response
    if (queryText.includes("cost") || queryText.includes("fee")) {
      return {
        reply: "Based on the verified cost schedule, the reservation fee is 200,000 AED and the DLD fee is approximately 4% of the transaction value. These are legally required and collected prior to transfer.",
        citations: [
          { id: "doc-1", title: "Cost Breakdown (Verified)", link: "#costs" }
        ],
        escalate: false
      };
    }
    
    // Simulate Multi-modal Vision AI 
    if (messages.some(m => m.content.includes("[IMAGE]"))) {
      this.logger.log(`Processing multi-modal vision query`);
      return {
        reply: "Based on the uploaded image, I can confirm the kitchen features integrated Miele appliances and absolute black granite countertops. This matches the Phase 1 handover specifications.",
        citations: [
          { id: "vis-1", title: "Visual Analysis Match", link: "#image-verification" }
        ],
        escalate: false
      };
    }

    return {
      reply: "Based on the verified evidence, this property features 3 bedrooms, an area of 2,400 sqft, and is situated in a highly sought-after community. Can I provide specific details on any aspect?",
      citations: [
        { id: "doc-2", title: "Property Fact Sheet", link: "#facts" }
      ],
      escalate: false
    };
  }
}
