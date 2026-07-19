import type { PropertyCatalogueRecord } from "@rama/contracts";

export const CATALOGUE_REPOSITORY = Symbol("CATALOGUE_REPOSITORY");

export interface CatalogueRepository {
  list(): Promise<PropertyCatalogueRecord[]>;
  listIndexBatch(afterSlug: string | null, limit: number): Promise<PropertyCatalogueRecord[]>;
  findBySlug(slug: string): Promise<PropertyCatalogueRecord | null>;
  findManyBySlugs(slugs: string[]): Promise<PropertyCatalogueRecord[]>;
}
