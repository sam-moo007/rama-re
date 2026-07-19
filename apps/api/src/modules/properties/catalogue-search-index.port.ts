import type { CatalogueSearchQuery, PropertyCatalogueRecord } from "@rama/contracts";
import { createHash } from "node:crypto";

export const CATALOGUE_SEARCH_INDEX = Symbol("CATALOGUE_SEARCH_INDEX");

export type CatalogueIndexCandidate = { slug: string; canonicalFingerprint: string };
export type CatalogueIndexCandidateResult = {
  candidates: CatalogueIndexCandidate[];
  total: number;
  pages: number;
};

export const catalogueCanonicalFingerprint = (record: PropertyCatalogueRecord): string =>
  createHash("sha256").update(JSON.stringify(record)).digest("hex");

export interface CatalogueSearchIndexPort {
  readonly durable: boolean;
  startReconciliation(generation:string):Promise<void>;
  indexBatch(generation:string,records:PropertyCatalogueRecord[]):Promise<void>;
  finishReconciliation(generation:string):Promise<number>;
  documentCount():Promise<number>;
  searchCandidates(query: CatalogueSearchQuery, cap: number): Promise<CatalogueIndexCandidateResult>;
}

export class InMemoryCatalogueSearchIndex implements CatalogueSearchIndexPort {
  readonly durable=false;private readonly documents=new Map<string,{generation:string;record:PropertyCatalogueRecord}>();
  async startReconciliation(_generation:string){}
  async indexBatch(generation:string,records:PropertyCatalogueRecord[]){for(const record of records)this.documents.set(record.slug,{generation,record:structuredClone(record)})}
  async finishReconciliation(generation:string){let removed=0;for(const[slug,value]of this.documents)if(value.generation!==generation){this.documents.delete(slug);removed++}return removed}
  async documentCount(){return this.documents.size}
  async searchCandidates(_query: CatalogueSearchQuery, cap: number): Promise<CatalogueIndexCandidateResult> {
    const records = [...this.documents.values()].map((value) => value.record);
    if (records.length > cap) throw new Error(`Catalogue candidate count exceeds the configured cap of ${cap}.`);
    return {
      candidates: records.map((record) => ({ slug: record.slug, canonicalFingerprint: catalogueCanonicalFingerprint(record) })),
      total: records.length,
      pages: records.length ? 1 : 0,
    };
  }
  snapshot(){return structuredClone([...this.documents.values()].map((value)=>value.record))}
}
