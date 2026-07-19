import { BadRequestException, Inject, Injectable, NotFoundException, Optional } from "@nestjs/common";
import {
  CatalogueSearchQuerySchema,
  CatalogueSearchResponseSchema,
  PropertyCompareRequestSchema,
  PropertyCompareResponseSchema,
  type CatalogueSearchQuery,
  type CatalogueSearchResponse,
  type HouseholdBrief,
  type PropertyCatalogueRecord,
  type PropertyCompareResponse,
  type PropertyFitSignal,
  type PropertyMobilityEstimate,
  type PropertySearchResultItem,
} from "@rama/contracts";

import type { RamaActor } from "../../common/auth/rama-actor";
import { HouseholdBriefService } from "../briefs/household-brief.service";
import { CATALOGUE_REPOSITORY, type CatalogueRepository } from "./catalogue.repository";
import { CatalogueCandidateRetrievalService } from "./catalogue-candidate-retrieval.service";
import { CATALOGUE_CURSOR_CODEC, CatalogueCursorCodec, CatalogueCursorError } from "./catalogue-cursor.codec";

@Injectable()
export class CatalogueSearchService {
  constructor(
    @Inject(CATALOGUE_REPOSITORY) private readonly catalogue: CatalogueRepository,
    private readonly briefs: HouseholdBriefService,
    @Inject(CATALOGUE_CURSOR_CODEC) private readonly cursors: CatalogueCursorCodec,
    @Optional() private readonly candidateRetrieval?: CatalogueCandidateRetrievalService,
  ) {}

  async search(rawQuery: Record<string, unknown>, actor: RamaActor): Promise<CatalogueSearchResponse> {
    const query = this.parseQuery(rawQuery);
    const candidateResult = this.candidateRetrieval
      ? await this.candidateRetrieval.retrieve(query)
      : { records: await this.catalogue.list(), source: "repository" as const };
    const records = candidateResult.records;
    const facetRecords = candidateResult.source === "repository" ? records : await this.catalogue.list();
    const brief = await this.latestBrief(actor);
    const filtered = records.filter((record) => this.matchesQuery(record, query));
    const ranked = filtered.map((record) => this.toResult(record, brief, query)).sort(this.sorter(query.sort));
    const { cursor: _cursor, limit: _limit, ...cursorQuery } = query;
    const fingerprint = this.cursors.fingerprint({ searchVersion: "rama.catalogue.phase1.v2", briefVersion: brief?.version ?? null, query: cursorQuery });
    let start = 0;
    if (query.cursor) {
      try {
        const lastSlug = this.cursors.decode(query.cursor, fingerprint);
        const index = ranked.findIndex((item) => item.slug === lastSlug);
        if (index < 0) throw new CatalogueCursorError();
        start = index + 1;
      } catch (error) {
        if (error instanceof CatalogueCursorError) throw new BadRequestException({ code: "INVALID_CATALOGUE_CURSOR", message: error.message });
        throw error;
      }
    }
    const window = ranked.slice(start, start + query.limit + 1);
    const items = window.slice(0, query.limit); const hasNextPage = window.length > query.limit;
    return CatalogueSearchResponseSchema.parse({
      items,
      total: ranked.length,
      generatedAt: new Date().toISOString(),
      searchVersion: "rama.catalogue.phase1.v2",
      briefVersionApplied: brief?.version ?? null,
      appliedQuery: query,
      facets: this.facets(facetRecords),
      pageInfo: { hasNextPage, nextCursor: hasNextPage && items.length ? this.cursors.encode(fingerprint, items.at(-1)!.slug) : null },
    });
  }

  async compare(input: unknown, actor: RamaActor): Promise<PropertyCompareResponse> {
    const parsed = PropertyCompareRequestSchema.safeParse(input);
    if (!parsed.success) throw this.invalid("INVALID_COMPARE_REQUEST", parsed.error.issues);
    const brief = await this.latestBrief(actor);
    const records = await Promise.all(parsed.data.slugs.map((slug) => this.catalogue.findBySlug(slug)));
    const missing = parsed.data.slugs.filter((_slug, index) => !records[index]);
    if (missing.length) {
      throw new NotFoundException({ code: "COMPARE_PROPERTY_NOT_FOUND", missing });
    }
    return PropertyCompareResponseSchema.parse({
      items: records.map((record) => this.toResult(record!, brief)),
      generatedAt: new Date().toISOString(),
      briefVersionApplied: brief?.version ?? null,
      searchVersion: "rama.catalogue.phase1.v2",
    });
  }

  private async latestBrief(actor: RamaActor): Promise<HouseholdBrief | null> {
    return (await this.briefs.listMine(actor)).items[0] ?? null;
  }

  private parseQuery(raw: Record<string, unknown>): CatalogueSearchQuery {
    const array = (value: unknown): string[] => {
      if (Array.isArray(value)) return value.flatMap((item) => String(item).split(",")).filter(Boolean);
      return value === undefined || value === "" ? [] : String(value).split(",").filter(Boolean);
    };
    const number = (value: unknown): number | undefined => value === undefined || value === "" ? undefined : Number(value);
    const parsed = CatalogueSearchQuerySchema.safeParse({
      q: raw.q === undefined || raw.q === "" ? undefined : String(raw.q),
      communities: array(raw.communities),
      minPriceAed: number(raw.minPriceAed),
      maxPriceAed: number(raw.maxPriceAed),
      minBedrooms: number(raw.minBedrooms),
      tenure: array(raw.tenure),
      minEvidenceCoverage: number(raw.minEvidenceCoverage),
      freshness: array(raw.freshness),
      destination: raw.destination === undefined || raw.destination === "" ? undefined : String(raw.destination),
      travelMode: raw.travelMode === undefined || raw.travelMode === "" ? undefined : String(raw.travelMode),
      maxTravelMinutes: number(raw.maxTravelMinutes),
      infrastructureStates: array(raw.infrastructureStates),
      northLatitude:number(raw.northLatitude),southLatitude:number(raw.southLatitude),eastLongitude:number(raw.eastLongitude),westLongitude:number(raw.westLongitude),
      sort: raw.sort === undefined || raw.sort === "" ? undefined : String(raw.sort),
      limit: number(raw.limit),
      cursor: raw.cursor === undefined || raw.cursor === "" ? undefined : String(raw.cursor),
    });
    if (!parsed.success) throw this.invalid("INVALID_CATALOGUE_QUERY", parsed.error.issues);
    return parsed.data;
  }

  private matchesQuery(record: PropertyCatalogueRecord, query: CatalogueSearchQuery): boolean {
    const term = query.q?.toLocaleLowerCase();
    if (term && ![record.name.en, record.name.ar, record.community.en, record.community.ar, record.slug]
      .some((value) => value.toLocaleLowerCase().includes(term))) return false;
    if (query.communities.length && !query.communities.some((community) =>
      community.toLocaleLowerCase() === record.community.en.toLocaleLowerCase() ||
      community.toLocaleLowerCase() === record.community.ar.toLocaleLowerCase())) return false;
    if (query.minPriceAed !== undefined && record.priceAed < query.minPriceAed) return false;
    if (query.maxPriceAed !== undefined && record.priceAed > query.maxPriceAed) return false;
    // An unknown bedroom count stays visible so a filter cannot manufacture false certainty.
    if (query.minBedrooms !== undefined && record.bedrooms !== null && record.bedrooms < query.minBedrooms) return false;
    if (query.tenure.length && !query.tenure.includes(record.tenure)) return false;
    if (query.minEvidenceCoverage !== undefined && record.evidenceCoverage < query.minEvidenceCoverage) return false;
    if (query.freshness.length && !query.freshness.includes(record.freshness)) return false;
    if (query.destination) {
      const mobility = this.selectMobility(record, query);
      // Unknown routing evidence remains visible; a known contradictory state or duration can be filtered.
      if (mobility && query.infrastructureStates.length && !query.infrastructureStates.includes(mobility.infrastructureState)) return false;
      if (mobility?.durationMinutes !== null && mobility?.durationMinutes !== undefined && query.maxTravelMinutes !== undefined && mobility.durationMinutes > query.maxTravelMinutes) return false;
    }
    if (query.northLatitude!==undefined&&record.geo) {
      if(record.geo.latitude>query.northLatitude||record.geo.latitude<query.southLatitude!||record.geo.longitude>query.eastLongitude!||record.geo.longitude<query.westLongitude!)return false;
    }
    return true;
  }

  private toResult(record: PropertyCatalogueRecord, brief: HouseholdBrief | null, query?: CatalogueSearchQuery): PropertySearchResultItem {
    const signals: PropertyFitSignal[] = [];
    let points = 0;
    let possible = 0;
    const add = (signal: PropertyFitSignal, weight: number, earned: number) => {
      signals.push(signal);
      possible += weight;
      points += earned;
    };
    if (!brief) {
      add({
        key: "brief_missing",
        category: "assumption",
        outcome: "unknown",
        label: { en: "No household brief applied", ar: "لم يتم تطبيق ملخص أسري" },
        explanation: {
          en: "Ranking uses evidence coverage and freshness until a brief is saved.",
          ar: "يعتمد الترتيب على اكتمال الأدلة وحداثتها حتى يتم حفظ ملخص.",
        },
      }, 0, 0);
    } else {
      const input = brief.input;
      const priceMatch = record.priceAed <= input.maxPurchasePriceAed;
      add({
        key: "maximum_price",
        category: "hard_constraint",
        outcome: priceMatch ? "match" : "review",
        label: { en: "Maximum purchase price", ar: "الحد الأقصى لسعر الشراء" },
        explanation: priceMatch
          ? { en: "The asking price is within the saved maximum.", ar: "السعر المطلوب ضمن الحد الأقصى المحفوظ." }
          : { en: "The asking price exceeds the saved maximum.", ar: "السعر المطلوب يتجاوز الحد الأقصى المحفوظ." },
      }, 30, priceMatch ? 30 : 0);
      const bedroomsUnknown = record.bedrooms === null;
      const bedroomsMatch = record.bedrooms !== null && record.bedrooms >= input.minBedrooms;
      add({
        key: "minimum_bedrooms",
        category: bedroomsUnknown ? "unavailable_evidence" : "hard_constraint",
        outcome: bedroomsUnknown ? "unknown" : bedroomsMatch ? "match" : "review",
        label: { en: "Minimum bedrooms", ar: "الحد الأدنى لغرف النوم" },
        explanation: bedroomsUnknown
          ? { en: "Bedroom evidence is unavailable; the property remains visible for review.", ar: "دليل غرف النوم غير متاح؛ يبقى العقار ظاهراً للمراجعة." }
          : bedroomsMatch
            ? { en: "The documented bedroom count meets the saved minimum.", ar: "عدد غرف النوم الموثق يفي بالحد الأدنى المحفوظ." }
            : { en: "The documented bedroom count is below the saved minimum.", ar: "عدد غرف النوم الموثق أقل من الحد الأدنى المحفوظ." },
      }, 25, bedroomsMatch ? 25 : 0);
      const communityMatch = input.preferredCommunities.some((community) => community.toLocaleLowerCase() === record.community.en.toLocaleLowerCase());
      add({
        key: "preferred_community",
        category: "preference",
        outcome: communityMatch ? "match" : "review",
        label: { en: "Preferred community", ar: "المنطقة المفضلة" },
        explanation: communityMatch
          ? { en: "The property is in a saved preferred community.", ar: "العقار في إحدى المناطق المفضلة المحفوظة." }
          : { en: "The community is outside the saved preference list.", ar: "المنطقة خارج قائمة التفضيلات المحفوظة." },
      }, 15, communityMatch ? 15 : 0);
      const tenureMatch = input.tenurePreference === "either" || input.tenurePreference === record.tenure;
      add({
        key: "tenure",
        category: "preference",
        outcome: tenureMatch ? "match" : "review",
        label: { en: "Tenure preference", ar: "تفضيل حالة العقار" },
        explanation: tenureMatch
          ? { en: "The property status matches the saved tenure preference.", ar: "حالة العقار تطابق التفضيل المحفوظ." }
          : { en: "The property status differs from the saved tenure preference.", ar: "حالة العقار تختلف عن التفضيل المحفوظ." },
      }, 10, tenureMatch ? 10 : 0);
      if (input.accessibility.stepFreeAccess) {
        const verified = record.stepFreeAccess === "verified";
        add({
          key: "step_free_access",
          category: record.stepFreeAccess === "unknown" ? "unavailable_evidence" : "hard_constraint",
          outcome: verified ? "match" : record.stepFreeAccess === "unknown" ? "unknown" : "review",
          label: { en: "Step-free access", ar: "دخول بلا درجات" },
          explanation: verified
            ? { en: "A step-free route is verified.", ar: "تم التحقق من مسار خالٍ من الدرج." }
            : record.stepFreeAccess === "unknown"
              ? { en: "No reliable step-free access evidence is available.", ar: "لا يتوفر دليل موثوق لمسار خالٍ من الدرج." }
              : { en: "Step-free access evidence is still under review.", ar: "دليل المسار الخالي من الدرج لا يزال قيد المراجعة." },
        }, 10, verified ? 10 : 0);
      }
    }
    const evidencePoints = Math.round(record.evidenceCoverage / 10);
    add({
      key: "evidence_coverage",
      category: "assumption",
      outcome: record.evidenceCoverage >= 80 ? "match" : "review",
      label: { en: "Evidence coverage", ar: "اكتمال الأدلة" },
      explanation: {
        en: `${record.evidenceCoverage}% of the current evidence requirement template is covered; this is not a quality score.`,
        ar: `تمت تغطية ${record.evidenceCoverage}% من قالب متطلبات الأدلة الحالي؛ وهذه ليست درجة جودة.`,
      },
    }, 10, evidencePoints);
    const selectedMobility = query?.destination ? this.selectMobility(record, query) : null;
    if (query?.destination) {
      const knownDuration = selectedMobility?.durationMinutes !== null && selectedMobility?.durationMinutes !== undefined;
      const withinTarget = knownDuration && (query.maxTravelMinutes === undefined || selectedMobility.durationMinutes! <= query.maxTravelMinutes);
      const present = selectedMobility?.infrastructureState === "present";
      add({
        key: "mobility_evidence",
        category: !selectedMobility || !knownDuration ? "unavailable_evidence" : present ? "preference" : "assumption",
        outcome: !selectedMobility || !knownDuration ? "unknown" : withinTarget && present ? "match" : "review",
        label: { en: "Travel-time evidence", ar: "دليل زمن التنقل" },
        explanation: !selectedMobility
          ? { en: "No route evidence is available for this destination and mode; the home remains visible for review.", ar: "لا يتوفر دليل مسار لهذه الوجهة ووسيلة التنقل؛ يبقى العقار ظاهراً للمراجعة." }
          : !knownDuration
            ? { en: `The ${selectedMobility.infrastructureState} route is documented, but its duration is unknown.`, ar: `المسار ${selectedMobility.infrastructureState} موثق، لكن مدته غير معروفة.` }
            : selectedMobility.infrastructureState !== "present"
              ? { en: `${selectedMobility.durationMinutes} minutes is a ${selectedMobility.infrastructureState} scenario, not present infrastructure.`, ar: `${selectedMobility.durationMinutes} دقيقة هي سيناريو ${selectedMobility.infrastructureState} وليست بنية تحتية قائمة.` }
              : { en: `${selectedMobility.durationMinutes} minutes under the documented method and assumptions.`, ar: `${selectedMobility.durationMinutes} دقيقة وفق المنهج والافتراضات الموثقة.` },
      }, 10, withinTarget && present ? 10 : 0);
    }
    const fitScore = possible === 0 ? 0 : Math.round((points / possible) * 100);
    return {
      ...record,
      selectedMobility,
      fitSignals: signals,
      fitScore,
      rankingExplanation: brief
        ? query?.destination ? {
            en: `Ranked from saved constraints (${fitScore}/100), evidence coverage and the selected travel evidence. Present routes may add match credit; committed, modelled and unknown routes do not.`,
            ar: `تم الترتيب وفق القيود المحفوظة (${fitScore}/100) واكتمال الأدلة ودليل التنقل المحدد. قد تضيف المسارات القائمة نقاط مطابقة؛ ولا تضيف المسارات الملتزم بها أو النمذجة أو المجهولة نقاطاً.`,
          } : {
            en: `Ranked from saved constraints (${fitScore}/100), then evidence coverage and freshness. Unknown evidence receives no match credit and remains visible.`,
            ar: `تم الترتيب وفق القيود المحفوظة (${fitScore}/100)، ثم اكتمال الأدلة وحداثتها. لا تحصل الأدلة المجهولة على نقاط مطابقة وتبقى ظاهرة.`,
          }
        : query?.destination ? {
            en: `No household brief was applied. The ${fitScore}/100 score combines evidence coverage with the selected travel evidence; committed, modelled and unknown routes receive no match credit.`,
            ar: `لم يتم تطبيق ملخص أسري. تجمع درجة ${fitScore}/100 بين اكتمال الأدلة ودليل التنقل المحدد؛ ولا تحصل المسارات الملتزم بها أو النمذجة أو المجهولة على نقاط مطابقة.`,
          } : {
            en: `No household brief was applied. The ${fitScore}/100 ranking score reflects evidence coverage; freshness breaks ties. Unknown evidence remains visible.`,
            ar: `لم يتم تطبيق ملخص أسري. تعكس درجة الترتيب ${fitScore}/100 اكتمال الأدلة، وتفصل الحداثة عند التعادل. تبقى الأدلة المجهولة ظاهرة.`,
          },
    };
  }

  private sorter(sort: CatalogueSearchQuery["sort"]): (left: PropertySearchResultItem, right: PropertySearchResultItem) => number {
    const stable = (left: PropertySearchResultItem, right: PropertySearchResultItem) => left.slug.localeCompare(right.slug);
    if (sort === "price_asc") return (left, right) => left.priceAed - right.priceAed || stable(left, right);
    if (sort === "price_desc") return (left, right) => right.priceAed - left.priceAed || stable(left, right);
    if (sort === "newest") return (left, right) => right.publishedAt.localeCompare(left.publishedAt) || stable(left, right);
    if (sort === "evidence_desc") return (left, right) => right.evidenceCoverage - left.evidenceCoverage || stable(left, right);
    return (left, right) => right.fitScore - left.fitScore || right.evidenceCoverage - left.evidenceCoverage || stable(left, right);
  }

  private facets(records: PropertyCatalogueRecord[]) {
    const localized = (values: Array<{ value: string; en: string; ar: string }>) => values.map((item) => ({
      value: item.value,
      label: { en: item.en, ar: item.ar },
      count: records.filter((record) => item.value === record.tenure || item.value === record.freshness).length,
    }));
    const communities = [...new Map(records.map((record) => [record.community.en, record.community])).entries()]
      .map(([value, label]) => ({ value, label, count: records.filter((record) => record.community.en === value).length }));
    return {
      communities,
      tenure: localized([{ value: "ready", en: "Ready", ar: "جاهز" }, { value: "off_plan", en: "Off-plan", ar: "على المخطط" }]),
      freshness: localized([{ value: "fresh", en: "Fresh", ar: "حديث" }, { value: "review", en: "Review", ar: "مراجعة" }, { value: "stale", en: "Stale", ar: "قديم" }]),
      unknownBedrooms: records.filter((record) => record.bedrooms === null).length,
      destinations: [
        { value: "difc", label: { en: "DIFC", ar: "مركز دبي المالي العالمي" } },
        { value: "downtown_dubai", label: { en: "Downtown Dubai", ar: "وسط مدينة دبي" } },
        { value: "dxb_airport", label: { en: "Dubai International Airport", ar: "مطار دبي الدولي" } },
      ].map((item) => ({ ...item, count: records.filter((record) => record.mobility.some((estimate) => estimate.destination === item.value)).length })),
      infrastructureStates: [
        { value: "present", label: { en: "Present", ar: "قائم" } },
        { value: "committed", label: { en: "Committed", ar: "ملتزم به" } },
        { value: "modelled", label: { en: "Modelled", ar: "نمذجي" } },
      ].map((item) => ({ ...item, count: records.filter((record) => record.mobility.some((estimate) => estimate.infrastructureState === item.value)).length })),
      unknownMobility: records.filter((record) => record.mobility.length === 0).length,
    };
  }

  private selectMobility(record: PropertyCatalogueRecord, query: Pick<CatalogueSearchQuery,"destination"|"travelMode"|"infrastructureStates">): PropertyMobilityEstimate | null {
    if (!query.destination) return null;
    const candidates = record.mobility.filter((estimate) => estimate.destination === query.destination && estimate.mode === query.travelMode);
    if (!candidates.length) return null;
    if (query.infrastructureStates.length) return candidates.find((estimate) => query.infrastructureStates.includes(estimate.infrastructureState)) ?? candidates[0]!;
    const priority = { present: 0, committed: 1, modelled: 2 } as const;
    return [...candidates].sort((left,right)=>priority[left.infrastructureState]-priority[right.infrastructureState])[0]!;
  }

  private invalid(code: string, issues: Array<{ path: PropertyKey[]; message: string }>): BadRequestException {
    return new BadRequestException({ code, issues: issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })) });
  }
}

type PropertyKey = string | number | symbol;
