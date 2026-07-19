import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import {
  PropertyShortlistMineResponseSchema,
  PropertyShortlistSchema,
  UpdatePropertyShortlistCommandSchema,
  type PropertyShortlist,
  type PropertyShortlistMineResponse,
} from "@rama/contracts";
import { randomUUID } from "node:crypto";

import type { RamaActor } from "../../common/auth/rama-actor";
import { CATALOGUE_REPOSITORY, type CatalogueRepository } from "../properties/catalogue.repository";
import { SHORTLIST_REPOSITORY, ShortlistConflictError, type ShortlistRepository } from "./shortlist.repository";

@Injectable()
export class ShortlistService {
  constructor(
    @Inject(SHORTLIST_REPOSITORY) private readonly repository: ShortlistRepository,
    @Inject(CATALOGUE_REPOSITORY) private readonly catalogue: CatalogueRepository,
  ) {}

  async getMine(actor: RamaActor): Promise<PropertyShortlistMineResponse> {
    return PropertyShortlistMineResponseSchema.parse({
      shortlist: await this.repository.findByOwner(actor.id),
      generatedAt: new Date().toISOString(),
    });
  }

  async update(input: unknown, actor: RamaActor): Promise<PropertyShortlist> {
    const parsed = UpdatePropertyShortlistCommandSchema.safeParse(input);
    if (!parsed.success) {
      throw new BadRequestException({
        code: "INVALID_SHORTLIST",
        issues: parsed.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
      });
    }
    const current = await this.repository.findByOwner(actor.id);
    if ((current?.version ?? null) !== parsed.data.expectedVersion) throw this.conflict(parsed.data.expectedVersion, current?.version ?? null);
    const records = await Promise.all(parsed.data.propertySlugs.map((slug) => this.catalogue.findBySlug(slug)));
    const missing = parsed.data.propertySlugs.filter((_slug, index) => !records[index]);
    if (missing.length) throw new NotFoundException({ code: "SHORTLIST_PROPERTY_NOT_FOUND", missing });
    const now = new Date().toISOString();
    const nextVersion = (current?.version ?? 0) + 1;
    const shortlist = PropertyShortlistSchema.parse({
      id: current?.id ?? randomUUID(),
      ownerSubject: actor.id,
      version: nextVersion,
      propertySlugs: parsed.data.propertySlugs,
      createdAt: current?.createdAt ?? now,
      updatedAt: now,
      auditTrail: [
        ...(current?.auditTrail ?? []),
        { id: randomUUID(), action: current ? "updated" : "created", actorId: actor.id, version: nextVersion, createdAt: now },
      ],
    });
    try {
      return await this.repository.save(shortlist, parsed.data.expectedVersion);
    } catch (error) {
      if (error instanceof ShortlistConflictError) throw this.conflict(error.expectedVersion, error.currentVersion);
      throw error;
    }
  }

  private conflict(expectedVersion: number | null, currentVersion: number | null): ConflictException {
    return new ConflictException({
      code: "SHORTLIST_VERSION_CONFLICT",
      message: "The shortlist changed after this view was loaded.",
      expectedVersion,
      currentVersion,
    });
  }
}

