import { describe, expect, it } from "vitest";

import {
  getAllEpisodes,
  getAllLore,
  getAllEntitySummaries,
  getDatabase,
  getDatabaseStats,
  getEntityById,
  getEntityBySlug,
  getEntityEraState,
  getEntityFacts,
  getEntityRelations,
  getEpisodeById,
  getEpisodeLore,
  getEpisodeTimeline,
  getEpisodeTravel,
  getFactById,
  getLoreById,
} from "@/lib/data/repository";
import { getEntityPage } from "@/lib/domain/entity-page";
import { incomingRelationLabel } from "@/lib/domain/labels";

describe("merkezi dünya verisi", () => {
  it("bütün sabit kimlikleri ve slugları tekil olarak çözer", async () => {
    const database = await getDatabase();
    const summaries = await getAllEntitySummaries();
    expect(summaries).toHaveLength(403);
    await Promise.all(
      summaries.map(async (summary) => {
        expect((await getEntityById(summary.id))?.slug).toBe(summary.slug);
        expect((await getEntityBySlug(summary.slug))?.id).toBe(summary.id);
      }),
    );
    expect(database.relationships).toHaveLength(435);
  });

  it("gerçek veri sayılarını türetir", async () => {
    const stats = await getDatabaseStats();
    expect(stats).toMatchObject({ entityCount: 403, relationshipCount: 435, episodeCount: 25 });
    expect(stats.typeCounts.find(({ type }) => type === "PERSON")?.count).toBe(104);
  });

  it("owner-confirmed Adnan merge preserves the legacy ID and slug", async () => {
    const adnan = await getEntityById("NPC-0004");
    const legacy = await getEntityById("NPC-0059");
    const kara = await getEntityById("NPC-0052");
    expect(adnan).toMatchObject({ name: "Adnan Körkapak", slug: "o-rusbu-adnan" });
    expect(adnan?.aliases).toContain("O'Rusbu Adnan");
    expect(legacy?.id).toBe("NPC-0004");
    expect(kara?.id).toBe("NPC-0052");
    expect(kara?.id).not.toBe(adnan?.id);
  });

  it("owner-confirmed Güllaç classification keeps the canonical kasaba wording", async () => {
    const gullac = await getEntityById("TWN-0003");
    expect(gullac).toMatchObject({ name: "Güllaç Kasabası", type: "TOWN" });
    expect(gullac?.facts?.[0]?.text).toBe("Şeker madenlerinin ve Sütçüoğlu tesislerinin bulunduğu kasaba.");
    expect(gullac?.conflict_ids ?? []).not.toContain("CNF-0019");
  });

  it("owner-confirmed Şalgam geography links the town to the island", async () => {
    const town = await getEntityById("TWN-0011");
    const island = await getEntityById("ISL-0005");
    const relations = await getEntityRelations("TWN-0011");
    expect(town?.name).toBe("Şalgam Kasabası");
    expect(island?.name).toBe("Şalgam Adası");
    expect(relations.outgoing).toEqual(expect.arrayContaining([
      expect.objectContaining({ relation: "LOCATED_IN", object_id: "ISL-0005" }),
    ]));
  });

  it("owner-confirmed identity merges preserve legacy IDs", async () => {
    await expect(getEntityById("CRE-0020")).resolves.toMatchObject({ id: "CRE-0008", name: "Dev Timsah" });
    await expect(getEntityById("CRE-0005")).resolves.toMatchObject({ id: "CRE-0002", name: "Boyut Avcısı Fener Balığı" });
    await expect(getEntityById("NPC-0048")).resolves.toMatchObject({ id: "NPC-0050", name: "Jiwong" });
    await expect(getEntityById("ITM-0033")).resolves.toMatchObject({ id: "ITM-0031", name: "Yeniden Yaşam Yüzüğü" });
    await expect(getEntityById("ITM-0006")).resolves.toMatchObject({ id: "ITM-0036", name: "Işık Tacı" });
  });

  it("owner-confirmed Dingi identity keeps the full name and short name", async () => {
    const dingi = await getEntityById("NPC-0024");
    expect(dingi).toMatchObject({ name: "Dingi Sandalı", type: "PERSON" });
    expect(dingi?.aliases).toEqual(expect.arrayContaining(["Dingi", "Dingil"]));
    await expect(getEntityById("ITM-0007")).resolves.toMatchObject({ id: "NPC-0024", name: "Dingi Sandalı" });
  });

  it("Arifler Okulu yerleşkesinin paylaşılan olgularını çözer", async () => {
    const campus = await getEntityById("BLD-0023");
    const institution = await getEntityById("ORG-0001");
    const facts = await getEntityFacts("BLD-0023");
    expect(campus?.name).toBe("Arifler Okulu Yerleşkesi");
    expect(institution?.name).toBe("Arifler Okulu");
    expect(campus?.fact_ids).toHaveLength(10);
    expect(facts).toHaveLength(10);
    expect(facts.every((fact) => campus?.fact_ids?.includes(fact.id))).toBe(true);
  });

  it("dönem kanıtını yokluktan türetmez", async () => {
    await expect(getEntityEraState("ISL-0002", "1300 civarı")).resolves.toMatchObject({ state: "unknown" });
    await expect(getEntityEraState("ISL-0002", "1600 civarı")).resolves.toMatchObject({ state: "unknown" });
    await expect(getEntityEraState("CON-0001", "1300 civarı")).resolves.toMatchObject({ state: "attested" });
    await expect(getEntityEraState("CON-0001", "1600 civarı")).resolves.toMatchObject({ state: "reported_lost" });
  });

  it("sayfa projeksiyonunda editoryal ve kanonik alanları ayrı tutar", async () => {
    const page = await getEntityPage("CIT-0006");
    expect(page?.entity.name).toBe("Yaz Helvası Şehri");
    expect(page?.facts.length).toBeGreaterThan(0);
    expect(page?.article).toBeNull();
    expect(page?.media).toEqual([]);
  });

  it("bölüm, olay, seyahat ve lore rotalarının bütün kayıtlarını çözer", async () => {
    const [database, episodes, lore] = await Promise.all([getDatabase(), getAllEpisodes(), getAllLore()]);
    expect(episodes).toHaveLength(25);
    expect(database.timeline).toHaveLength(90);
    expect(database.travel).toHaveLength(56);
    expect(lore).toHaveLength(86);
    for (const episode of episodes) {
      await expect(getEpisodeById(episode.id)).resolves.toMatchObject({ id: episode.id });
      await expect(getEpisodeTimeline(episode.id)).resolves.toHaveLength(episode.timeline_event_ids.length);
      await expect(getEpisodeTravel(episode.id)).resolves.toHaveLength(episode.travel_ids.length);
      const episodeLore = await getEpisodeLore(episode.id);
      expect(episodeLore.every((record) => record.episode === episode.id)).toBe(true);
    }
    for (const event of database.timeline) {
      await expect(getFactById(event.summary_fact_id)).resolves.not.toBeNull();
    }
    for (const record of lore) {
      await expect(getLoreById(record.id)).resolves.toMatchObject({ id: record.id });
    }
  });

  it("gelen eşya ilişkilerini sahiplik uydurmadan adlandırır", () => {
    expect(incomingRelationLabel("USES")).toBe("Kullanan");
    expect(incomingRelationLabel("OWNS")).toBe("Sahibi");
    expect(incomingRelationLabel("LOCATED_IN")).toBe("İçinde bulunan");
  });
});
