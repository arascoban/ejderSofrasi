import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const root = resolve(process.cwd());
const dataDir = join(root, 'data');
const outputDir = join(root, 'editorial_work');
const evidenceDir = join(outputDir, 'evidence');

const readJson = async (name) => JSON.parse(await readFile(join(dataDir, name), 'utf8'));
const stableStringify = (value) => JSON.stringify(value, null, 2) + '\n';
function uniqueByJson(values) {
  const seen = new Set();
  return values.filter((value) => {
    const key = JSON.stringify(value);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function collectSourceRefs(values) {
  const refs = [];
  const visit = (value) => {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (!value || typeof value !== 'object') return;
    if (typeof value.source_id === 'string') {
      const ref = { source_id: value.source_id };
      if (value.pointer !== undefined && value.pointer !== '') ref.pointer = value.pointer;
      if (value.line !== undefined) ref.line = value.line;
      refs.push(ref);
    }
    Object.values(value).forEach(visit);
  };
  values.forEach(visit);
  return uniqueByJson(refs).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
}

function sourceRefsOverlap(left, right) {
  if (left.source_id !== right.source_id) return false;
  if (left.line !== undefined || right.line !== undefined) return left.line === right.line;
  const a = left.pointer ?? '';
  const b = right.pointer ?? '';
  return a === b || a.startsWith(`${b}/`) || b.startsWith(`${a}/`);
}

function containsExactId(value, entityId) {
  if (Array.isArray(value)) return value.some((item) => containsExactId(item, entityId));
  if (!value || typeof value !== 'object') return value === entityId;
  return Object.values(value).some((item) => containsExactId(item, entityId));
}

function hasOwnerMarker(value) {
  if (Array.isArray(value)) return value.some(hasOwnerMarker);
  if (typeof value === 'string') return value.toLowerCase().includes('owner');
  if (!value || typeof value !== 'object') return false;
  return Object.entries(value).some(([key, item]) =>
    key.toLowerCase().includes('owner') || hasOwnerMarker(item),
  );
}

function matchingTravel(record, entityId) {
  const endpointIds = [
    ...(record.traveler_ids ?? []),
    ...(record.via_ids ?? []),
    record.from_id,
    record.to_id,
    record.origin?.entity_id,
    record.destination?.entity_id,
    ...(record.waypoints ?? []).map((waypoint) => waypoint?.entity_id),
  ];
  return endpointIds.includes(entityId);
}

function matchingMapCanon(record, entityId) {
  if (record.location_id === entityId || record.parent_id === entityId) return true;
  return (record.states ?? []).some((state) => {
    if (state.parent_id === entityId || (state.parent_candidate_ids ?? []).includes(entityId)) return true;
    return (state.spatial_relations ?? []).some((relation) =>
      relation.target_id === entityId || relation.entity_id === entityId,
    );
  });
}

function linkedEntity(entityById, entityId) {
  const entity = entityById.get(entityId);
  if (!entity) return { id: entityId, unresolved: true };
  return {
    id: entity.id,
    slug: entity.slug,
    name: entity.name,
    type: entity.type,
    aliases: entity.aliases ?? [],
    periods: entity.periods ?? [],
    record_status: entity.record_status,
  };
}

function relatedEntityIds(entityId, relationships, timeline, travel, mapCanon, worldStates) {
  const ids = new Set();
  for (const relation of relationships) {
    if (relation.subject_id === entityId) ids.add(relation.object_id);
    if (relation.object_id === entityId) ids.add(relation.subject_id);
  }
  for (const event of timeline) {
    if (event.participant_ids?.includes(entityId)) event.location_ids?.forEach((id) => ids.add(id));
    if (event.location_ids?.includes(entityId)) event.participant_ids?.forEach((id) => ids.add(id));
    if (event.related_entity_ids?.includes(entityId)) {
      event.participant_ids?.forEach((id) => ids.add(id));
      event.location_ids?.forEach((id) => ids.add(id));
    }
  }
  for (const route of travel) {
    if (!matchingTravel(route, entityId)) continue;
    [route.from_id, route.to_id, ...(route.via_ids ?? [])].filter(Boolean).forEach((id) => ids.add(id));
  }
  for (const map of mapCanon) {
    if (!matchingMapCanon(map, entityId)) continue;
    if (map.location_id !== entityId) ids.add(map.location_id);
    for (const state of map.states ?? []) {
      [state.parent_id, ...(state.parent_candidate_ids ?? [])]
        .filter(Boolean)
        .forEach((id) => ids.add(id));
      for (const spatial of state.spatial_relations ?? []) {
        [spatial.target_id, spatial.entity_id].filter(Boolean).forEach((id) => ids.add(id));
      }
    }
  }
  for (const state of worldStates) {
    if (state.entity_id === entityId) continue;
  }
  ids.delete(entityId);
  return [...ids].sort();
}

function packageFor(entity, context) {
  const {
    entityById,
    relationships,
    timeline,
    travel,
    lore,
    episodes,
    mapCanon,
    worldStates,
    conflicts,
    decisions,
    sourceHash,
    metadata,
  } = context;
  const entityId = entity.id;
  const outgoing = relationships.filter((item) => item.subject_id === entityId);
  const incoming = relationships.filter((item) => item.object_id === entityId);
  const events = timeline.filter((item) =>
    [...(item.participant_ids ?? []), ...(item.location_ids ?? []), ...(item.related_entity_ids ?? [])].includes(entityId),
  );
  const routes = travel.filter((item) => matchingTravel(item, entityId));
  const loreRecords = lore.filter((item) => item.subject_id === entityId);
  const episodeRecords = episodes.filter((item) => item.entity_ids?.includes(entityId));
  const mapRecords = mapCanon.filter((item) => matchingMapCanon(item, entityId));
  const stateRecords = worldStates.filter((item) => item.entity_id === entityId);
  const conflictRecords = conflicts.filter((item) => item.entity_ids?.includes(entityId));
  const entitySourceRefs = collectSourceRefs([entity]);
  const matchingDecisions = decisions.filter((item) => {
    if (containsExactId(item, entityId)) return true;
    return collectSourceRefs([item]).some((decisionRef) =>
      entitySourceRefs.some((entityRef) => sourceRefsOverlap(decisionRef, entityRef)),
    );
  });
  const ownerConfirmations = matchingDecisions.filter((item) => hasOwnerMarker(item));
  const summaryFacts = events
    .map((event) => event.summary_fact_id)
    .filter(Boolean)
    .map((factId) => {
      for (const owner of entityById.values()) {
        const fact = owner.facts?.find((item) => item.id === factId);
        if (fact) return { fact_id: factId, entity_id: owner.id, fact };
      }
      return { fact_id: factId, unresolved: true };
    });
  const linkedIds = relatedEntityIds(entityId, relationships, timeline, travel, mapCanon, worldStates);
  const linkedEntities = linkedIds.map((id) => linkedEntity(entityById, id));
  const facts = entity.facts ?? [];
  const sourceRefs = collectSourceRefs([
    entity,
    outgoing,
    incoming,
    events,
    routes,
    loreRecords,
    episodeRecords,
    mapRecords,
    stateRecords,
    conflictRecords,
    matchingDecisions,
  ]);
  const reviewStatus = conflictRecords.length > 0
    ? 'source_review_required'
    : facts.length === 0 && events.length === 0 && routes.length === 0 && loreRecords.length === 0
      ? 'short_entry'
      : 'sufficient_narrative';

  return {
    schema_version: 'editorial-evidence-v1',
    entity: {
      id: entity.id,
      slug: entity.slug,
      name: entity.name,
      type: entity.type,
      aliases: entity.aliases ?? [],
      titles: entity.titles ?? [],
      periods: entity.periods ?? [],
      episodes: entity.episodes ?? [],
      first_appearance: entity.first_appearance ?? null,
      continuity_scope: entity.continuity_scope,
      confidence: entity.confidence,
      name_status: entity.name_status,
      record_status: entity.record_status,
      source_refs: entity.source_refs ?? [],
      alias_assertions: entity.alias_assertions ?? [],
      episode_connections: entity.episode_connections ?? [],
    },
    source_version: {
      database_schema_version: metadata.schema_version,
      source_episode_range: metadata.source_episode_range,
      source_inventory_sha256: sourceHash,
    },
    facts,
    fact_ids: facts.map((fact) => fact.id),
    relationships: { outgoing, incoming },
    timeline: { events, summary_facts: summaryFacts },
    travel: routes,
    lore: loreRecords,
    episodes: episodeRecords.map((episode) => ({
      id: episode.id,
      number: episode.number,
      title: episode.title,
      source_periods: episode.source_periods ?? [],
      narrative_periods: episode.narrative_periods ?? [],
      source_refs: episode.source_refs ?? [],
    })),
    map_canon: mapRecords,
    world_states: stateRecords,
    conflicts: conflictRecords,
    normalization_decisions: matchingDecisions,
    owner_confirmations: ownerConfirmations,
    linked_entities: linkedEntities,
    evidence: {
      review_status: reviewStatus,
      source_refs: sourceRefs,
      counts: {
        facts: facts.length,
        relationships_outgoing: outgoing.length,
        relationships_incoming: incoming.length,
        timeline_events: events.length,
        travel_records: routes.length,
        lore_records: loreRecords.length,
        episode_records: episodeRecords.length,
        map_constraints: mapRecords.length,
        world_states: stateRecords.length,
        conflicts: conflictRecords.length,
        normalization_decisions: matchingDecisions.length,
        owner_confirmations: ownerConfirmations.length,
        linked_entities: linkedEntities.length,
      },
    },
  };
}

async function loadContext() {
  const [metadata, sourceInventoryRaw, entities, relationships, timeline, travel, lore, episodes, mapCanon, worldStates, conflicts, decisions] = await Promise.all([
    readJson('world_metadata.json'),
    readFile(join(dataDir, 'source_inventory.json')),
    readJson('entities.json'),
    readJson('relationships.json'),
    readJson('timeline.json'),
    readJson('travel.json'),
    readJson('lore.json'),
    readJson('episodes.json'),
    readJson('map_canon.json'),
    readJson('world_states.json'),
    readJson('unresolved_conflicts.json'),
    readJson('normalization_decisions.json'),
  ]);
  return {
    metadata,
    sourceHash: createHash('sha256').update(sourceInventoryRaw).digest('hex'),
    entities,
    entityById: new Map(entities.map((entity) => [entity.id, entity])),
    relationships,
    timeline,
    travel,
    lore,
    episodes,
    mapCanon,
    worldStates,
    conflicts,
    decisions,
  };
}

async function expectedOutput(context) {
  const activeEntities = context.entities
    .filter((entity) => entity.record_status !== 'retired')
    .sort((a, b) => a.id.localeCompare(b.id));
  const packages = activeEntities.map((entity) => packageFor(entity, context));
  const records = packages.map((item) => ({
    entity_id: item.entity.id,
    slug: item.entity.slug,
    name: item.entity.name,
    type: item.entity.type,
    record_status: item.entity.record_status,
    package_path: `evidence/${item.entity.id}.json`,
    review_status: item.evidence.review_status,
    source_ref_count: item.evidence.source_refs.length,
    ...item.evidence.counts,
  }));
  const coverage = {
    schema_version: 'editorial-coverage-v1',
    database_schema_version: context.metadata.schema_version,
    source_episode_range: context.metadata.source_episode_range,
    source_inventory_sha256: context.sourceHash,
    entity_count: activeEntities.length,
    entity_ids: activeEntities.map((entity) => entity.id),
    counts: records.reduce((result, record) => {
      result[record.review_status] = (result[record.review_status] ?? 0) + 1;
      return result;
    }, {}),
    records,
  };
  return { packages, coverage };
}

async function writeOrCheck(context, checkOnly) {
  const { packages, coverage } = await expectedOutput(context);
  if (!checkOnly) {
    await mkdir(evidenceDir, { recursive: true });
    await Promise.all(packages.map((item) => writeFile(join(evidenceDir, `${item.entity.id}.json`), stableStringify(item), 'utf8')));
    await writeFile(join(outputDir, 'coverage.json'), stableStringify(coverage), 'utf8');
    return { entity_count: packages.length, coverage_path: 'editorial_work/coverage.json' };
  }
  const mismatches = [];
  for (const item of packages) {
    const file = join(evidenceDir, `${item.entity.id}.json`);
    try {
      const actual = await readFile(file, 'utf8');
      if (actual !== stableStringify(item)) mismatches.push(`editorial_work/evidence/${item.entity.id}.json`);
    } catch {
      mismatches.push(`editorial_work/evidence/${item.entity.id}.json`);
    }
  }
  try {
    const expectedNames = new Set(packages.map((item) => `${item.entity.id}.json`));
    const actualNames = (await readdir(evidenceDir)).filter((name) => name.endsWith('.json'));
    for (const name of actualNames) {
      if (!expectedNames.has(name)) mismatches.push(`editorial_work/evidence/${name}`);
    }
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
  try {
    const actualCoverage = await readFile(join(outputDir, 'coverage.json'), 'utf8');
    if (actualCoverage !== stableStringify(coverage)) mismatches.push('editorial_work/coverage.json');
  } catch {
    mismatches.push('editorial_work/coverage.json');
  }
  if (mismatches.length) throw new Error(`Kanıt çıktısı güncel değil: ${mismatches.slice(0, 5).join(', ')}`);
  return { entity_count: packages.length, status: 'deterministic' };
}

const context = await loadContext();
const checkOnly = process.argv.includes('--check');
try {
  const result = await writeOrCheck(context, checkOnly);
  console.log(JSON.stringify({ status: 'ok', ...result }, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Kanıt paketi üretilemedi.');
  process.exitCode = 1;
}

export { expectedOutput, loadContext, packageFor };
