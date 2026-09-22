import { describe, expect, it } from "vitest";

import { entityMatchesSearch, filterEntitySummaries, normalizeSearchText } from "@/lib/domain/search";
import type { EntitySummary } from "@/lib/domain/types";

const entities: EntitySummary[] = [
  { id: "CIT-0006", slug: "col-sehri", name: "Yaz Helvası Şehri", aliases: ["Çöl Şehri"], type: "CITY", periods: ["1300 civarı"], firstAppearance: "EP08", recordStatus: "active" },
  { id: "NPC-0004", slug: "o-rusbu-adnan", name: "Adnan Körkapak", aliases: ["O'Rusbu Adnan"], type: "PERSON", periods: ["1600 civarı"], firstAppearance: "EP01", recordStatus: "active", legacyIds: ["NPC-0059"] },
  { id: "SHP-0001", slug: "karapancar-gemisi", name: "Karapancar Gemisi", aliases: ["Karapancar"], type: "SHIP", periods: ["1600 civarı"], firstAppearance: "EP01", recordStatus: "active" },
];

describe("Türkçe global arama", () => {
  it("Türkçe karakterleri ASCII arama anahtarına çevirir", () => {
    expect(normalizeSearchText("Çöl Şehri")).toBe("col sehri");
    expect(entityMatchesSearch(entities[0], "col sehri")).toBe(true);
  });

  it("eski kimlik, alias ve slug alanlarını korur", () => {
    expect(entityMatchesSearch(entities[1], "NPC-0059")).toBe(true);
    expect(entityMatchesSearch(entities[1], "o rusbu adnan")).toBe(true);
    expect(entityMatchesSearch(entities[2], "karapancar")).toBe(true);
  });

  it("tür ve dönem filtrelerini birlikte uygular", () => {
    expect(filterEntitySummaries(entities, { query: "col sehri", type: "CITY", period: "1300 civarı" }).map((item) => item.id)).toEqual(["CIT-0006"]);
    expect(filterEntitySummaries(entities, { query: "col sehri", period: "1600 civarı" })).toEqual([]);
  });

  it("yalnızca verilen yayımlanmış editoryal metni eşleştirir", () => {
    const editorial = new Map([["SHP-0001", "Kaptanın günlüğünde Karapancar rotası"]]);
    expect(filterEntitySummaries(entities, { query: "kaptanın günlüğü", editorialTextByEntity: editorial }).map((item) => item.id)).toEqual(["SHP-0001"]);
    expect(filterEntitySummaries(entities, { query: "gizli taslak", editorialTextByEntity: new Map() })).toEqual([]);
  });
});
