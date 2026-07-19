import { Injectable, NotFoundException } from "@nestjs/common";
import {
  PropertyDecisionRoomSchema,
  residence1204,
  type PropertyDecisionRoom,
} from "@rama/contracts";
import { PostgresPropertiesRepository } from "./postgres-properties.repository";

@Injectable()
export class PropertiesService {
  private readonly memoryFallback = new Map<string, PropertyDecisionRoom>([
    [residence1204.slug, PropertyDecisionRoomSchema.parse(residence1204)],
  ]);

  constructor(private readonly postgresRepo: PostgresPropertiesRepository) {}

  async getBySlug(slug: string): Promise<PropertyDecisionRoom> {
    const useMemory = process.env.CATALOGUE_REPOSITORY?.trim().toLowerCase() === "memory" || 
                      (!process.env.CATALOGUE_REPOSITORY && process.env.NODE_ENV !== "production");
    
    if (useMemory) {
      const property = this.memoryFallback.get(slug);
      if (!property) {
        throw new NotFoundException({
          code: "PROPERTY_NOT_FOUND",
          message: `No published decision room exists for canonical slug '${slug}'.`,
        });
      }
      return property;
    }

    return this.postgresRepo.findBySlug(slug);
  }
}
