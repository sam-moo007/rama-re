import { describe, expect, it } from "vitest";

import {
  CatalogueSearchQuerySchema,
  PropertyCatalogueRecordSchema,
  PropertyCompareRequestSchema,
  UpdatePropertyShortlistCommandSchema,
} from "./catalogue";
import { catalogueFixtures } from "./fixtures/catalogue";

describe("catalogue contracts", () => {
  it("accepts curated and explicitly synthetic catalogue records", () => {
    expect(catalogueFixtures.map((record) => PropertyCatalogueRecordSchema.parse(record))).toHaveLength(4);
    expect(catalogueFixtures.filter((record) => record.recordKind === "synthetic_demo")).toHaveLength(3);
  });

  it("rejects contradictory price filters", () => {
    expect(() => CatalogueSearchQuerySchema.parse({ minPriceAed: 2_000_000, maxPriceAed: 1_000_000 })).toThrow();
  });

  it("requires a destination for travel-time filtering and accepts signed-cursor shape",()=>{
    expect(()=>CatalogueSearchQuerySchema.parse({maxTravelMinutes:30})).toThrow();
    expect(CatalogueSearchQuerySchema.parse({destination:"difc",travelMode:"drive",maxTravelMinutes:30,cursor:"a".repeat(32)})).toMatchObject({destination:"difc",maxTravelMinutes:30});
  });

  it("requires a complete, ordered map bounding box",()=>{
    expect(()=>CatalogueSearchQuerySchema.parse({northLatitude:25.3})).toThrow();
    expect(()=>CatalogueSearchQuerySchema.parse({northLatitude:25,southLatitude:25.3,eastLongitude:55.4,westLongitude:55.1})).toThrow();
    expect(CatalogueSearchQuerySchema.parse({northLatitude:25.3,southLatitude:25,eastLongitude:55.4,westLongitude:55.1})).toMatchObject({northLatitude:25.3});
  });

  it("rejects duplicate shortlist and compare entries", () => {
    expect(() => UpdatePropertyShortlistCommandSchema.parse({ expectedVersion: null, propertySlugs: ["one", "one"] })).toThrow();
    expect(() => PropertyCompareRequestSchema.parse({ slugs: ["one", "one"] })).toThrow();
  });
});
