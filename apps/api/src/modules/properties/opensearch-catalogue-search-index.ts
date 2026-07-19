import type { PropertyCatalogueRecord } from "@rama/contracts";
import type { CatalogueSearchQuery } from "@rama/contracts";

import { catalogueCanonicalFingerprint, type CatalogueIndexCandidateResult, type CatalogueSearchIndexPort } from "./catalogue-search-index.port";

export const catalogueIndexDefinition={
  settings:{analysis:{
    filter:{rama_arabic_stop:{type:"stop",stopwords:"_arabic_"},rama_arabic_stemmer:{type:"stemmer",language:"arabic"},rama_english_stemmer:{type:"stemmer",language:"possessive_english"}},
    analyzer:{rama_arabic:{type:"custom",tokenizer:"standard",filter:["lowercase","decimal_digit","arabic_normalization","rama_arabic_stop","rama_arabic_stemmer"]},rama_english:{type:"custom",tokenizer:"standard",filter:["lowercase","asciifolding","rama_english_stemmer"]}},
  }},
  mappings:{dynamic:"strict",properties:{
    canonicalSlug:{type:"keyword"},canonicalFingerprint:{type:"keyword"},syncGeneration:{type:"keyword"},recordKind:{type:"keyword"},
    name:{properties:{en:{type:"text",analyzer:"rama_english",fields:{raw:{type:"keyword"}}},ar:{type:"text",analyzer:"rama_arabic",fields:{raw:{type:"keyword"}}}}},
    community:{properties:{en:{type:"text",analyzer:"rama_english",fields:{raw:{type:"keyword"}}},ar:{type:"text",analyzer:"rama_arabic",fields:{raw:{type:"keyword"}}}}},
    priceAed:{type:"long"},bedrooms:{type:"short"},bathrooms:{type:"half_float"},internalAreaSqFt:{type:"integer"},tenure:{type:"keyword"},evidenceCoverage:{type:"short"},freshness:{type:"keyword"},publishedAt:{type:"date"},mediaRepresentation:{type:"keyword"},stepFreeAccess:{type:"keyword"},decisionRoomAvailable:{type:"boolean"},sponsored:{type:"boolean"},location:{type:"geo_point"},geoEvidenceState:{type:"keyword"},
    mobility:{type:"nested",properties:{destination:{type:"keyword"},mode:{type:"keyword"},infrastructureState:{type:"keyword"},durationMinutes:{type:"short"},distanceKm:{type:"half_float"},methodVersion:{type:"keyword"},observedAt:{type:"date"},retrievedAt:{type:"date"}}},
  }},
} as const;

type FetchLike=typeof fetch;
export class OpenSearchCatalogueSearchIndex implements CatalogueSearchIndexPort{
  readonly durable=true;
  constructor(private readonly baseUrl:string,private readonly indexName:string,private readonly apiKey:string,private readonly fetcher:FetchLike=fetch,private readonly readAlias:string=indexName){}
  async startReconciliation(_generation:string){const head=await this.fetcher(this.url(`/${this.indexName}`),{method:"HEAD",headers:this.headers(),signal:AbortSignal.timeout(8_000)});if(head.status===404){const created=await this.request(`/${this.indexName}`,{method:"PUT",body:JSON.stringify(catalogueIndexDefinition)});if(!created.ok)throw new Error(`OpenSearch index creation returned ${created.status}.`)}else if(!head.ok)throw new Error(`OpenSearch index check returned ${head.status}.`)}
  async indexBatch(generation:string,records:PropertyCatalogueRecord[]){if(!records.length)return;const lines=records.flatMap((record)=>[JSON.stringify({index:{_index:this.indexName,_id:record.id}}),JSON.stringify(this.document(generation,record))]);const response=await this.request("/_bulk",{method:"POST",headers:{"content-type":"application/x-ndjson"},body:`${lines.join("\n")}\n`});if(!response.ok)throw new Error(`OpenSearch bulk indexing returned ${response.status}.`);const result=await response.json() as {errors?:boolean;items?:Array<{index?:{status?:number;error?:{type?:string}}}>};if(result.errors){const failed=result.items?.find((item)=>(item.index?.status??200)>=300)?.index;throw new Error(`OpenSearch rejected a catalogue document (${failed?.status??"unknown"}:${failed?.error?.type??"unknown"}).`)}}
  async finishReconciliation(generation:string){const response=await this.request(`/${this.indexName}/_delete_by_query?refresh=true&conflicts=proceed`,{method:"POST",body:JSON.stringify({query:{bool:{must_not:[{term:{syncGeneration:generation}}]}}})});if(!response.ok)throw new Error(`OpenSearch stale-document cleanup returned ${response.status}.`);const result=await response.json() as {deleted?:number};await this.promoteReadAlias();return result.deleted??0}
  async documentCount(){const response=await this.request(`/${this.indexName}/_count`,{method:"GET"});if(!response.ok)throw new Error(`OpenSearch count returned ${response.status}.`);const result=await response.json() as {count?:number};return result.count??0}
  async searchCandidates(query: CatalogueSearchQuery, cap: number): Promise<CatalogueIndexCandidateResult> {
    const opened = await this.request(`/${this.readAlias}/_search/point_in_time?keep_alive=1m&allow_partial_pit_creation=false`, { method: "POST", body: "{}" });
    if (!opened.ok) throw new Error(`OpenSearch PIT creation returned ${opened.status}.`);
    const openedBody = await opened.json() as { pit_id?: string; id?: string };
    let pitId = openedBody.pit_id ?? openedBody.id;
    if (!pitId) throw new Error("OpenSearch PIT creation did not return an identifier.");
    const candidates: CatalogueIndexCandidateResult["candidates"] = [];
    let searchAfter: unknown[] | undefined;
    let total = 0;
    let pages = 0;
    let primaryError: unknown = null;
    try {
      while (true) {
        const response = await this.request("/_search", { method: "POST", body: JSON.stringify({
          size: Math.min(250, cap),
          track_total_hits: true,
          _source: ["canonicalSlug", "canonicalFingerprint"],
          pit: { id: pitId, keep_alive: "1m" },
          query: this.candidateQuery(query),
          sort: [{ canonicalSlug: { order: "asc" } }],
          ...(searchAfter ? { search_after: searchAfter } : {}),
        }) });
        if (!response.ok) throw new Error(`OpenSearch candidate search returned ${response.status}.`);
        const result = await response.json() as {
          pit_id?: string;
          hits?: { total?: { value?: number }; hits?: Array<{ _source?: { canonicalSlug?: string; canonicalFingerprint?: string }; sort?: unknown[] }> };
        };
        pitId = result.pit_id ?? pitId;
        total = result.hits?.total?.value ?? total;
        if (total > cap) throw new Error(`Catalogue candidate count ${total} exceeds the configured cap of ${cap}.`);
        const hits = result.hits?.hits ?? [];
        pages += 1;
        for (const hit of hits) {
          const slug = hit._source?.canonicalSlug;
          const canonicalFingerprint = hit._source?.canonicalFingerprint;
          if (!slug || !canonicalFingerprint) throw new Error("OpenSearch candidate hit is missing its canonical identity or fingerprint.");
          candidates.push({ slug, canonicalFingerprint });
        }
        if (!hits.length || candidates.length >= total) break;
        searchAfter = hits.at(-1)?.sort;
        if (!searchAfter) throw new Error("OpenSearch candidate search did not return a search_after sort value.");
      }
      return { candidates, total, pages };
    } catch (error) {
      primaryError = error;
      throw error;
    } finally {
      try {
        const closed = await this.request("/_search/point_in_time", { method: "DELETE", body: JSON.stringify({ pit_id: [pitId] }) });
        if (!closed.ok) throw new Error(`OpenSearch PIT cleanup returned ${closed.status}.`);
        const result = await closed.json() as { pits?: Array<{ successful?: boolean }> };
        if (result.pits?.some((pit) => pit.successful === false)) throw new Error("OpenSearch PIT cleanup reported a partial failure.");
      } catch (cleanupError) {
        if (!primaryError) throw cleanupError;
      }
    }
  }
  private document(generation:string,record:PropertyCatalogueRecord){return{canonicalSlug:record.slug,canonicalFingerprint:catalogueCanonicalFingerprint(record),syncGeneration:generation,recordKind:record.recordKind,name:record.name,community:record.community,priceAed:record.priceAed,bedrooms:record.bedrooms,bathrooms:record.bathrooms,internalAreaSqFt:record.internalAreaSqFt,tenure:record.tenure,evidenceCoverage:record.evidenceCoverage,freshness:record.freshness,publishedAt:record.publishedAt,mediaRepresentation:record.mediaRepresentation,stepFreeAccess:record.stepFreeAccess,decisionRoomAvailable:record.decisionRoomAvailable,sponsored:record.sponsored,location:record.geo?{lat:record.geo.latitude,lon:record.geo.longitude}:null,geoEvidenceState:record.geo?.evidenceState??null,mobility:record.mobility.map((item)=>({destination:item.destination,mode:item.mode,infrastructureState:item.infrastructureState,durationMinutes:item.durationMinutes,distanceKm:item.distanceKm,methodVersion:item.methodVersion,observedAt:item.observedAt,retrievedAt:item.retrievedAt}))}}
  private async promoteReadAlias(): Promise<void> {
    if (this.readAlias === this.indexName) return;
    const response = await this.request("/_aliases", { method: "POST", body: JSON.stringify({ actions: [
      { remove: { index: "*", alias: this.readAlias, must_exist: false } },
      { add: { index: this.indexName, alias: this.readAlias, is_write_index: false } },
    ] }) });
    if (!response.ok) throw new Error(`OpenSearch read-alias promotion returned ${response.status}.`);
    const result = await response.json() as { acknowledged?: boolean };
    if (result.acknowledged !== true) throw new Error("OpenSearch read-alias promotion was not acknowledged.");
  }
  private candidateQuery(query: CatalogueSearchQuery): Record<string, unknown> {
    const filters: Record<string, unknown>[] = [];
    if (query.minPriceAed !== undefined || query.maxPriceAed !== undefined) filters.push({ range: { priceAed: { ...(query.minPriceAed !== undefined ? { gte: query.minPriceAed } : {}), ...(query.maxPriceAed !== undefined ? { lte: query.maxPriceAed } : {}) } } });
    if (query.minBedrooms !== undefined) filters.push({ bool: { should: [{ range: { bedrooms: { gte: query.minBedrooms } } }, { bool: { must_not: [{ exists: { field: "bedrooms" } }] } }], minimum_should_match: 1 } });
    if (query.tenure.length) filters.push({ terms: { tenure: query.tenure } });
    if (query.minEvidenceCoverage !== undefined) filters.push({ range: { evidenceCoverage: { gte: query.minEvidenceCoverage } } });
    if (query.freshness.length) filters.push({ terms: { freshness: query.freshness } });
    if (query.northLatitude !== undefined) filters.push({ bool: { should: [
      { geo_bounding_box: { location: { top_left: { lat: query.northLatitude, lon: query.westLongitude }, bottom_right: { lat: query.southLatitude, lon: query.eastLongitude } } } },
      { bool: { must_not: [{ exists: { field: "location" } }] } },
    ], minimum_should_match: 1 } });
    const must = query.q ? [{ multi_match: { query: query.q, fields: ["name.en^3", "name.ar^3", "community.en^2", "community.ar^2", "canonicalSlug"], type: "best_fields" } }] : [];
    return { bool: { must, filter: filters } };
  }
  private request(path:string,init:RequestInit){return this.fetcher(this.url(path),{...init,headers:{...this.headers(),"content-type":"application/json",...(init.headers??{})},signal:AbortSignal.timeout(15_000)})}
  private headers(){return{authorization:`ApiKey ${this.apiKey}`,accept:"application/json"}}
  private url(path:string){return `${this.baseUrl.replace(/\/$/,"")}${path}`}
}
