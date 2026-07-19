import { PropertyCatalogueRecordSchema, catalogueFixtures, type PropertyCatalogueRecord } from "@rama/contracts";

import type { CatalogueRepository } from "./catalogue.repository";

export class InMemoryCatalogueRepository implements CatalogueRepository {
  private readonly records = new Map(
    catalogueFixtures.map((record) => {
      const parsed = PropertyCatalogueRecordSchema.parse(record);
      return [parsed.slug, parsed] as const;
    }),
  );

  async list(): Promise<PropertyCatalogueRecord[]> {
    return structuredClone([...this.records.values()]);
  }

  async findBySlug(slug: string): Promise<PropertyCatalogueRecord | null> {
    const record = this.records.get(slug);
    return record ? structuredClone(record) : null;
  }

  async findManyBySlugs(slugs: string[]): Promise<PropertyCatalogueRecord[]> {
    return structuredClone(slugs.flatMap((slug) => {
      const record = this.records.get(slug);
      return record ? [record] : [];
    }));
  }

  async listIndexBatch(afterSlug:string|null,limit:number):Promise<PropertyCatalogueRecord[]>{
    return structuredClone([...this.records.values()].filter((record)=>afterSlug===null||record.slug>afterSlug).sort((left,right)=>left.slug.localeCompare(right.slug)).slice(0,limit));
  }
}
