import type { CatalogueIndexReadTelemetry, CatalogueSearchQuery, PropertyCatalogueRecord } from "@rama/contracts";
import { Inject, Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";

import { CATALOGUE_REPOSITORY, type CatalogueRepository } from "./catalogue.repository";
import { CATALOGUE_SEARCH_INDEX, catalogueCanonicalFingerprint, type CatalogueIndexCandidateResult, type CatalogueSearchIndexPort } from "./catalogue-search-index.port";

export type CatalogueSearchReadSource = "repository" | "index";

export const resolveCatalogueSearchReadSource = (environment: NodeJS.ProcessEnv = process.env): CatalogueSearchReadSource => {
  const configured = environment.CATALOGUE_SEARCH_READ_SOURCE?.trim().toLowerCase();
  if (configured === "repository" || configured === "index") return configured;
  if (configured) throw new Error("CATALOGUE_SEARCH_READ_SOURCE must be 'repository' or 'index'.");
  return environment.NODE_ENV === "production" ? "index" : "repository";
};

export type CatalogueCandidateRetrievalResult = {
  records: PropertyCatalogueRecord[];
  source: CatalogueSearchReadSource;
};

@Injectable()
export class CatalogueCandidateRetrievalService {
  readonly source = resolveCatalogueSearchReadSource();
  private readonly logger = new Logger(CatalogueCandidateRetrievalService.name);
  private readonly cap: number;
  private lastRead: CatalogueIndexReadTelemetry | null = null;

  constructor(
    @Inject(CATALOGUE_REPOSITORY) private readonly catalogue: CatalogueRepository,
    @Inject(CATALOGUE_SEARCH_INDEX) private readonly index: CatalogueSearchIndexPort,
  ) {
    const requested = Number(process.env.CATALOGUE_SEARCH_CANDIDATE_CAP ?? 2_000);
    if (!Number.isInteger(requested) || requested < 100 || requested > 5_000) {
      throw new Error("CATALOGUE_SEARCH_CANDIDATE_CAP must be an integer between 100 and 5000.");
    }
    this.cap = requested;
  }

  async retrieve(query: CatalogueSearchQuery): Promise<CatalogueCandidateRetrievalResult> {
    const started = performance.now();
    if (this.source === "repository") {
      const records = await this.catalogue.list();
      this.lastRead = this.telemetry(records.length, records.length, 0, 0, 0, 0, started);
      return { records, source: this.source };
    }

    let result: CatalogueIndexCandidateResult;
    try {
      result = await this.index.searchCandidates(query, this.cap);
    } catch (error) {
      this.logger.error("Catalogue index candidate retrieval failed; repository fallback is disabled.", error instanceof Error ? error.stack : undefined);
      throw new ServiceUnavailableException({ code: "CATALOGUE_SEARCH_UNAVAILABLE", message: "Catalogue search is temporarily unavailable." });
    }
    const unique = new Map(result.candidates.map((candidate) => [candidate.slug, candidate]));
    const duplicateCandidates = result.candidates.length - unique.size;
    const records = await this.catalogue.findManyBySlugs([...unique.keys()]);
    const bySlug = new Map(records.map((record) => [record.slug, record]));
    let fingerprintMismatches = 0;
    for (const candidate of unique.values()) {
      const record = bySlug.get(candidate.slug);
      if (record && catalogueCanonicalFingerprint(record) !== candidate.canonicalFingerprint) fingerprintMismatches += 1;
    }
    const missingCanonical = unique.size - records.length;
    this.lastRead = this.telemetry(unique.size, records.length, missingCanonical, fingerprintMismatches, duplicateCandidates, result.pages, started);
    if (missingCanonical || fingerprintMismatches || duplicateCandidates) {
      this.logger.warn(`Catalogue index drift detected: ${missingCanonical} missing canonical, ${fingerprintMismatches} fingerprint mismatch(es), ${duplicateCandidates} duplicate candidate(s).`);
    }
    return { records, source: this.source };
  }

  status(): { readSource: CatalogueSearchReadSource; lastCandidateRead: CatalogueIndexReadTelemetry | null } {
    return { readSource: this.source, lastCandidateRead: this.lastRead };
  }

  private telemetry(candidateCount: number, hydratedCount: number, missingCanonical: number, fingerprintMismatches: number, duplicateCandidates: number, pages: number, started: number): CatalogueIndexReadTelemetry {
    return {
      source: this.source,
      candidateCount,
      hydratedCount,
      missingCanonical,
      fingerprintMismatches,
      duplicateCandidates,
      pages,
      durationMs: Math.max(0, Math.round(performance.now() - started)),
      completedAt: new Date().toISOString(),
    };
  }
}
