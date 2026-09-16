import { readFile } from "node:fs/promises";
import path from "node:path";

import type {
  Entity,
  EntityEraState,
  EntityRelations,
  EntitySummary,
  Episode,
  Fact,
  LoreRecord,
  Period,
  Relationship,
  SourceReference,
  TimelineRecord,
  TravelRecord,
  WorldMetadata,
  WorldState,
} from "@/lib/domain/types";
import { AUXILIARY_FILE_NAMES, auxiliaryDatabaseSchema } from "./auxiliary-schema";
import { createDatabaseValidator, DataValidationError, parseJsonDocument } from "./validation";

interface DatabaseSchema {
  $id: string;
  fileSchemas: Record<string, string>;
  [key: string]: unknown;
}

interface MapCanonRecord {
  location_id: string;
  states: Array<{
    parent_id: string | null;
    parent_candidate_ids: string[];
    containment_relationship_ids: string[];
    spatial_relations: Array<{ target_id: string; relationship_id: string }>;
  }>;
}

interface ConflictRecord {
  id: string;
  entity_ids: string[];
}

interface SourceInventory {
  files: Array<{ source_id: string }>;
}

interface IdRedirect {
  from_id: string;
  to_id: string;
}

interface DatabaseIndex {
  metadata: WorldMetadata;
  entities: Entity[];
  relationships: Relationship[];
  episodes: Episode[];
  lore: LoreRecord[];
  timeline: TimelineRecord[];
  travel: TravelRecord[];
  worldStates: WorldState[];
  entityById: Map<string, Entity>;
  entityBySlug: Map<string, Entity>;
  factById: Map<string, Fact>;
  incomingByEntity: Map<string, Relationship[]>;
  outgoingByEntity: Map<string, Relationship[]>;
  episodeById: Map<string, Episode>;
  loreById: Map<string, LoreRecord>;
  timelineById: Map<string, TimelineRecord>;
  travelById: Map<string, TravelRecord>;
  redirectById: Map<string, string>;
}

const DATA_ROOT = path.join(process.cwd(), "data");
let databasePromise: Promise<DatabaseIndex> | undefined;

async function readJson<T>(fileName: string): Promise<T> {
  const content = await readFile(path.join(DATA_ROOT, fileName), "utf8");
  return parseJsonDocument<T>(fileName, content);
}

function fail(fileName: string, pointer: string, message: string): never {
  throw new DataValidationError(`${fileName}${pointer}: ${message}`, fileName, pointer);
}

function addReference(map: Map<string, Relationship[]>, id: string, relation: Relationship): void {
  const current = map.get(id);
  if (current) current.push(relation);
  else map.set(id, [relation]);
}

function sourceReferencesIn(value: unknown): SourceReference[] {
  const references: SourceReference[] = [];
  const visit = (candidate: unknown): void => {
    if (Array.isArray(candidate)) {
      candidate.forEach(visit);
      return;
    }
    if (!candidate || typeof candidate !== "object") return;
    const object = candidate as Record<string, unknown>;
    if (Array.isArray(object.source_refs)) {
      references.push(...(object.source_refs as SourceReference[]));
    }
    for (const [key, child] of Object.entries(object)) {
      if (key !== "source_refs") visit(child);
    }
  };
  visit(value);
  return references;
}

function assertKnownEntity(
  entityIds: Set<string>,
  id: string | null | undefined,
  fileName: string,
  pointer: string,
): void {
  if (id && !entityIds.has(id)) fail(fileName, pointer, `bilinmeyen varlık kimliği: ${id}`);
}

function assertIntegrity(input: {
  entities: Entity[];
  relationships: Relationship[];
  episodes: Episode[];
  lore: LoreRecord[];
  worldStates: WorldState[];
  timeline: TimelineRecord[];
  travel: TravelRecord[];
  mapCanon: MapCanonRecord[];
  conflicts: ConflictRecord[];
  redirects: IdRedirect[];
  sourceInventory: SourceInventory;
  validatedDocuments: unknown[];
}): Omit<DatabaseIndex, "metadata"> {
  const entityById = new Map<string, Entity>();
  const entityBySlug = new Map<string, Entity>();
  const factById = new Map<string, Fact>();

  input.entities.forEach((entity, entityIndex) => {
    if (entityById.has(entity.id)) fail("entities.json", `/${entityIndex}/id`, `yinelenen ID: ${entity.id}`);
    if (entityBySlug.has(entity.slug)) fail("entities.json", `/${entityIndex}/slug`, `yinelenen slug: ${entity.slug}`);
    entityById.set(entity.id, entity);
    entityBySlug.set(entity.slug, entity);

    for (const fact of entity.facts ?? []) {
      const existing = factById.get(fact.id);
      if (existing && JSON.stringify(existing) !== JSON.stringify(fact)) {
        fail("entities.json", `/${entityIndex}/facts`, `aynı ID farklı olguya bağlı: ${fact.id}`);
      }
      factById.set(fact.id, fact);
    }
  });

  const entityIds = new Set(entityById.keys());
  const episodeIds = new Set(input.episodes.map((episode) => episode.id));
  const relationIds = new Set(input.relationships.map((relation) => relation.id));
  const timelineIds = new Set(input.timeline.map((event) => event.event_id));
  const travelIds = new Set(input.travel.map((record) => record.id));
  const loreIds = new Set(input.lore.map((record) => record.id));
  const conflictIds = new Set(input.conflicts.map((conflict) => conflict.id));
  const sourceIds = new Set(input.sourceInventory.files.map((source) => source.source_id));
  const incomingByEntity = new Map<string, Relationship[]>();
  const outgoingByEntity = new Map<string, Relationship[]>();

  if (timelineIds.size !== input.timeline.length) fail("timeline.json", "/", "yinelenen olay kimliği");
  if (travelIds.size !== input.travel.length) fail("travel.json", "/", "yinelenen seyahat kimliği");
  if (loreIds.size !== input.lore.length) fail("lore.json", "/", "yinelenen lore kimliği");

  input.entities.forEach((entity, index) => {
    entity.fact_ids?.forEach((factId, factIndex) => {
      if (!factById.has(factId)) fail("entities.json", `/${index}/fact_ids/${factIndex}`, `bilinmeyen olgu: ${factId}`);
    });
    entity.member_ids?.forEach((id, memberIndex) =>
      assertKnownEntity(entityIds, id, "entities.json", `/${index}/member_ids/${memberIndex}`),
    );
    assertKnownEntity(entityIds, entity.institution_id, "entities.json", `/${index}/institution_id`);
    if (entity.first_appearance && !episodeIds.has(entity.first_appearance)) {
      fail("entities.json", `/${index}/first_appearance`, `bilinmeyen bölüm: ${entity.first_appearance}`);
    }
    if (entity.first_appearance && !entity.episodes.includes(entity.first_appearance)) {
      fail("entities.json", `/${index}/first_appearance`, "ilk kaynak kaydı bölüm listesinde yok");
    }
    entity.episodes.forEach((episode, episodeIndex) => {
      if (!episodeIds.has(episode)) fail("entities.json", `/${index}/episodes/${episodeIndex}`, `bilinmeyen bölüm: ${episode}`);
    });
    entity.conflict_ids?.forEach((id, conflictIndex) => {
      if (!conflictIds.has(id)) fail("entities.json", `/${index}/conflict_ids/${conflictIndex}`, `bilinmeyen çelişki: ${id}`);
    });
  });

  input.relationships.forEach((relationship, index) => {
    assertKnownEntity(entityIds, relationship.subject_id, "relationships.json", `/${index}/subject_id`);
    assertKnownEntity(entityIds, relationship.object_id, "relationships.json", `/${index}/object_id`);
    addReference(outgoingByEntity, relationship.subject_id, relationship);
    addReference(incomingByEntity, relationship.object_id, relationship);
  });

  input.timeline.forEach((event, index) => {
    assertKnownEntity(entityIds, event.event_id, "timeline.json", `/${index}/event_id`);
    if (!factById.has(event.summary_fact_id)) {
      fail("timeline.json", `/${index}/summary_fact_id`, `bilinmeyen özet olgusu: ${event.summary_fact_id}`);
    }
    [...event.participant_ids, ...event.location_ids, ...event.related_entity_ids].forEach((id) =>
      assertKnownEntity(entityIds, id, "timeline.json", `/${index}`),
    );
  });

  input.travel.forEach((record, index) => {
    const ids = [
      ...record.traveler_ids,
      record.from_id,
      record.to_id,
      ...record.via_ids,
      record.origin.entity_id,
      record.origin.context_id,
      record.origin.reviewed_context_id,
      record.destination.entity_id,
      record.destination.context_id,
      record.destination.reviewed_context_id,
      ...record.waypoints.flatMap((place) => [place.entity_id, place.context_id, place.reviewed_context_id]),
      ...(record.transport?.entity_ids ?? []),
    ];
    ids.forEach((id) => assertKnownEntity(entityIds, id, "travel.json", `/${index}`));
  });

  input.mapCanon.forEach((record, index) => {
    assertKnownEntity(entityIds, record.location_id, "map_canon.json", `/${index}/location_id`);
    record.states.forEach((state, stateIndex) => {
      [state.parent_id, ...state.parent_candidate_ids].forEach((id) =>
        assertKnownEntity(entityIds, id, "map_canon.json", `/${index}/states/${stateIndex}`),
      );
      [...state.containment_relationship_ids, ...state.spatial_relations.map((item) => item.relationship_id)].forEach(
        (id) => {
          if (!relationIds.has(id)) fail("map_canon.json", `/${index}/states/${stateIndex}`, `bilinmeyen ilişki: ${id}`);
        },
      );
      state.spatial_relations.forEach((item) =>
        assertKnownEntity(entityIds, item.target_id, "map_canon.json", `/${index}/states/${stateIndex}`),
      );
    });
  });

  input.worldStates.forEach((state, index) =>
    assertKnownEntity(entityIds, state.entity_id, "world_states.json", `/${index}/entity_id`),
  );
  input.conflicts.forEach((conflict, index) =>
    conflict.entity_ids.forEach((id) => assertKnownEntity(entityIds, id, "unresolved_conflicts.json", `/${index}/entity_ids`)),
  );
  input.redirects.forEach((redirect, index) => {
    if (entityIds.has(redirect.from_id)) fail("id_redirects.json", `/${index}/from_id`, "etkin bir ID yönlendirme kaynağı olamaz");
    assertKnownEntity(entityIds, redirect.to_id, "id_redirects.json", `/${index}/to_id`);
  });

  input.episodes.forEach((episode, index) => {
    episode.entity_ids.forEach((id) => assertKnownEntity(entityIds, id, "episodes.json", `/${index}/entity_ids`));
    episode.timeline_event_ids.forEach((id) => {
      if (!timelineIds.has(id)) fail("episodes.json", `/${index}/timeline_event_ids`, `bilinmeyen olay: ${id}`);
    });
    episode.travel_ids.forEach((id) => {
      if (!travelIds.has(id)) fail("episodes.json", `/${index}/travel_ids`, `bilinmeyen seyahat: ${id}`);
    });
  });

  input.lore.forEach((record, index) => {
    if (!episodeIds.has(record.episode)) fail("lore.json", `/${index}/episode`, `bilinmeyen bölüm: ${record.episode}`);
    assertKnownEntity(entityIds, record.subject_id, "lore.json", `/${index}/subject_id`);
  });

  input.validatedDocuments.flatMap(sourceReferencesIn).forEach((reference) => {
    if (!sourceIds.has(reference.source_id)) {
      fail("source_inventory.json", "/files", `kayıtlı olmayan kaynak: ${reference.source_id}`);
    }
  });

  return {
    entities: input.entities,
    relationships: input.relationships,
    episodes: input.episodes,
    lore: input.lore,
    timeline: input.timeline,
    travel: input.travel,
    worldStates: input.worldStates,
    entityById,
    entityBySlug,
    factById,
    incomingByEntity,
    outgoingByEntity,
    episodeById: new Map(input.episodes.map((episode) => [episode.id, episode])),
    loreById: new Map(input.lore.map((record) => [record.id, record])),
    timelineById: new Map(input.timeline.map((event) => [event.event_id, event])),
    travelById: new Map(input.travel.map((record) => [record.id, record])),
    redirectById: new Map(input.redirects.map((redirect) => [redirect.from_id, redirect.to_id])),
  };
}

async function buildDatabase(): Promise<DatabaseIndex> {
  const schema = await readJson<DatabaseSchema>("schema.json");
  const validateFile = createDatabaseValidator(schema);
  const validatedEntries = await Promise.all(
    Object.keys(schema.fileSchemas).map(async (fileName) => {
      const value = await readJson<unknown>(fileName);
      validateFile(fileName, value);
      return [fileName, value] as const;
    }),
  );
  const validated = Object.fromEntries(validatedEntries) as Record<string, unknown>;

  const validateAuxiliaryFile = createDatabaseValidator(auxiliaryDatabaseSchema);
  const auxiliaryEntries = await Promise.all(
    AUXILIARY_FILE_NAMES.map(async (fileName) => {
      const value = await readJson<unknown>(fileName);
      validateAuxiliaryFile(fileName, value);
      return [fileName, value] as const;
    }),
  );
  const auxiliary = Object.fromEntries(auxiliaryEntries);
  const metadata = auxiliary["world_metadata.json"] as WorldMetadata;
  const episodes = auxiliary["episodes.json"] as Episode[];
  const lore = auxiliary["lore.json"] as LoreRecord[];
  const worldStates = auxiliary["world_states.json"] as WorldState[];
  const redirects = auxiliary["id_redirects.json"] as IdRedirect[];
  const sourceInventory = auxiliary["source_inventory.json"] as SourceInventory;

  if (metadata.language !== "tr" || metadata.continuity_scope !== "MAIN_TIMELINE") {
    fail("world_metadata.json", "/", "desteklenmeyen dil veya devamlılık kapsamı");
  }
  if (!Array.isArray(episodes) || !Array.isArray(lore) || !Array.isArray(worldStates) || !Array.isArray(redirects)) {
    fail("world_metadata.json", "/", "yardımcı veri dosyalarından biri dizi değil");
  }
  if (!Array.isArray(sourceInventory.files)) fail("source_inventory.json", "/files", "kaynak listesi bulunamadı");

  const indexed = assertIntegrity({
    entities: validated["entities.json"] as Entity[],
    relationships: validated["relationships.json"] as Relationship[],
    timeline: validated["timeline.json"] as TimelineRecord[],
    travel: validated["travel.json"] as TravelRecord[],
    mapCanon: validated["map_canon.json"] as MapCanonRecord[],
    conflicts: validated["unresolved_conflicts.json"] as ConflictRecord[],
    episodes,
    lore,
    worldStates,
    redirects,
    sourceInventory,
    validatedDocuments: [...Object.values(validated), episodes, lore, worldStates],
  });
  return { metadata, ...indexed };
}

export function getDatabase(): Promise<DatabaseIndex> {
  databasePromise ??= buildDatabase();
  return databasePromise;
}

export async function getEntityById(id: string): Promise<Entity | null> {
  const database = await getDatabase();
  const resolvedId = database.redirectById.get(id) ?? id;
  return database.entityById.get(resolvedId) ?? null;
}

export async function getEntityBySlug(slug: string): Promise<Entity | null> {
  return (await getDatabase()).entityBySlug.get(slug) ?? null;
}

export async function getEntityFacts(id: string): Promise<Fact[]> {
  const database = await getDatabase();
  const entity = database.entityById.get(id);
  if (!entity) return [];
  const facts = [...(entity.facts ?? [])];
  for (const factId of entity.fact_ids ?? []) {
    const fact = database.factById.get(factId);
    if (fact && !facts.some((candidate) => candidate.id === fact.id)) facts.push(fact);
  }
  return facts;
}

export async function getEntityRelations(id: string): Promise<EntityRelations> {
  const database = await getDatabase();
  return {
    incoming: database.incomingByEntity.get(id) ?? [],
    outgoing: database.outgoingByEntity.get(id) ?? [],
  };
}

export async function getEntityEraState(id: string, period: Period): Promise<EntityEraState> {
  const database = await getDatabase();
  const entity = database.entityById.get(id);
  if (!entity) return { state: "unknown", evidence: [] };
  const evidence = database.worldStates.filter((item) => item.entity_id === id && item.period === period);
  const hasPositive = entity.periods.includes(period) || evidence.some((item) => item.state === "exists");
  const hasNegative = evidence.some((item) => item.state === "reported_lost");
  if (hasPositive && hasNegative) return { state: "conflicted", evidence };
  if (hasNegative) return { state: "reported_lost", evidence };
  if (hasPositive) return { state: "attested", evidence };
  return { state: "unknown", evidence };
}

export async function getAllEntitySummaries(): Promise<EntitySummary[]> {
  const database = await getDatabase();
  return database.entities
    .map((entity) => ({
      id: entity.id,
      slug: entity.slug,
      name: entity.name,
      aliases: entity.aliases,
      type: entity.type,
      periods: entity.periods,
      firstAppearance: entity.first_appearance,
      recordStatus: entity.record_status,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "tr-TR"));
}

export async function getDatabaseStats(): Promise<{
  entityCount: number;
  relationshipCount: number;
  episodeCount: number;
  typeCounts: Array<{ type: Entity["type"]; count: number }>;
}> {
  const database = await getDatabase();
  const counts = new Map<Entity["type"], number>();
  for (const entity of database.entities) counts.set(entity.type, (counts.get(entity.type) ?? 0) + 1);
  return {
    entityCount: database.entities.length,
    relationshipCount: database.relationships.length,
    episodeCount: database.episodes.length,
    typeCounts: [...counts.entries()]
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count),
  };
}

export async function getAllEpisodes(): Promise<Episode[]> {
  return [...(await getDatabase()).episodes].sort((a, b) => a.number - b.number);
}

export async function getEpisodeById(id: string): Promise<Episode | null> {
  return (await getDatabase()).episodeById.get(id.toUpperCase()) ?? null;
}

export async function getEpisodeTimeline(id: string): Promise<TimelineRecord[]> {
  const episode = await getEpisodeById(id);
  if (!episode) return [];
  const database = await getDatabase();
  return episode.timeline_event_ids
    .map((eventId) => database.timelineById.get(eventId))
    .filter((event): event is TimelineRecord => Boolean(event));
}

export async function getEpisodeTravel(id: string): Promise<TravelRecord[]> {
  const episode = await getEpisodeById(id);
  if (!episode) return [];
  const database = await getDatabase();
  return episode.travel_ids
    .map((travelId) => database.travelById.get(travelId))
    .filter((record): record is TravelRecord => Boolean(record))
    .sort((a, b) => a.sequence - b.sequence);
}

export async function getAllLore(): Promise<LoreRecord[]> {
  return [...(await getDatabase()).lore].sort((a, b) => a.id.localeCompare(b.id));
}

export async function getLoreById(id: string): Promise<LoreRecord | null> {
  return (await getDatabase()).loreById.get(id.toUpperCase()) ?? null;
}

export async function getEpisodeLore(id: string): Promise<LoreRecord[]> {
  const normalized = id.toUpperCase();
  return (await getDatabase()).lore.filter((record) => record.episode === normalized);
}

export async function getFactById(id: string): Promise<Fact | null> {
  return (await getDatabase()).factById.get(id) ?? null;
}
