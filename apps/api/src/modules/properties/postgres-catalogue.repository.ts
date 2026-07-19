import { PropertyCatalogueRecordSchema, type PropertyCatalogueRecord } from "@rama/contracts";
import type { OnModuleDestroy } from "@nestjs/common";
import type { Pool } from "pg";

import type { CatalogueRepository } from "./catalogue.repository";

type CatalogueRow = {
  id: string;
  canonical_slug: string;
  record_kind: string;
  name: unknown;
  community: unknown;
  price_aed: string;
  bedrooms: number | null;
  bathrooms: string | null;
  internal_area_sq_ft: number | null;
  tenure: string;
  evidence_coverage: number;
  freshness: string;
  published_at: Date;
  media_representation: string;
  step_free_access: string;
  decision_room_available: boolean;
  sponsored: boolean;
  missing_critical_evidence: unknown;
  geo: unknown | null;
  mobility: unknown;
};

export class PostgresCatalogueRepository implements CatalogueRepository, OnModuleDestroy {
  constructor(private readonly pool: Pool) {}

  async checkConnection(): Promise<void> {
    await this.pool.query("SELECT 1");
  }

  async list(): Promise<PropertyCatalogueRecord[]> {
    const result = await this.pool.query<CatalogueRow>(`${this.selectSql()} ORDER BY published_at DESC LIMIT 1000`);
    return result.rows.map((row) => this.map(row));
  }

  async findBySlug(slug: string): Promise<PropertyCatalogueRecord | null> {
    const result = await this.pool.query<CatalogueRow>(`${this.selectSql()} WHERE canonical_slug = $1`, [slug]);
    return result.rows[0] ? this.map(result.rows[0]) : null;
  }

  async findManyBySlugs(slugs: string[]): Promise<PropertyCatalogueRecord[]> {
    if (!slugs.length) return [];
    const placeholders = slugs.map((_slug, index) => `$${index + 1}`).join(", ");
    const result = await this.pool.query<CatalogueRow>(`${this.selectSql()} WHERE canonical_slug IN (${placeholders})`, slugs);
    const bySlug = new Map(result.rows.map((row) => [row.canonical_slug, this.map(row)]));
    return slugs.flatMap((slug) => {
      const record = bySlug.get(slug);
      return record ? [record] : [];
    });
  }

  async listIndexBatch(afterSlug:string|null,limit:number):Promise<PropertyCatalogueRecord[]>{
    const bounded=Math.max(1,Math.min(500,limit));const result=afterSlug===null
      ?await this.pool.query<CatalogueRow>(`${this.selectSql()} ORDER BY canonical_slug LIMIT $1`,[bounded])
      :await this.pool.query<CatalogueRow>(`${this.selectSql()} WHERE canonical_slug > $1 ORDER BY canonical_slug LIMIT $2`,[afterSlug,bounded]);
    return result.rows.map((row)=>this.map(row));
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }

  private selectSql(): string {
    return `SELECT id, canonical_slug, record_kind, name, community, price_aed, bedrooms,
      bathrooms, internal_area_sq_ft, tenure, evidence_coverage, freshness, published_at,
      media_representation, step_free_access, decision_room_available, sponsored,
      missing_critical_evidence, geo, mobility
      FROM property_catalogue_projection`;
  }

  private map(row: CatalogueRow): PropertyCatalogueRecord {
    return PropertyCatalogueRecordSchema.parse({
      id: row.id,
      slug: row.canonical_slug,
      recordKind: row.record_kind,
      name: row.name,
      community: row.community,
      priceAed: Number(row.price_aed),
      bedrooms: row.bedrooms,
      bathrooms: row.bathrooms === null ? null : Number(row.bathrooms),
      internalAreaSqFt: row.internal_area_sq_ft,
      tenure: row.tenure,
      evidenceCoverage: row.evidence_coverage,
      freshness: row.freshness,
      publishedAt: row.published_at.toISOString(),
      mediaRepresentation: row.media_representation,
      stepFreeAccess: row.step_free_access,
      decisionRoomAvailable: row.decision_room_available,
      sponsored: row.sponsored,
      missingCriticalEvidence: row.missing_critical_evidence,
      geo: row.geo,
      mobility: row.mobility,
    });
  }
}
