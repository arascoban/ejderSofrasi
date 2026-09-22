import { readFile } from "node:fs/promises";
import path from "node:path";

import { getDatabase } from "@/lib/data/repository";
import { createDatabaseValidator, DataValidationError, parseJsonDocument } from "@/lib/data/validation";
import { entityTypeLabel } from "@/lib/domain/labels";
import type { Entity, EntityType, Period, Relationship } from "@/lib/domain/types";
import type {
  LocationCoverageRecord,
  LocationCoverageStatus,
  MapEntityPreview,
  MapFrame,
  MapInventoryRelease,
  MapLandform,
  MapLocationMarker,
  MapPreviewRelation,
} from "./contracts";
import { frameLocalToWorld, indexFrames } from "./transform";

const LOCATION_TYPES = new Set<EntityType>([
  "CONTINENT", "KINGDOM", "STATE", "REGION", "DISTRICT", "CITY", "TOWN", "VILLAGE", "ISLAND",
  "PORT", "BUILDING", "TAVERN", "TEMPLE", "NATURAL_FEATURE",
]);

interface FrameDocument {
  schema_version: string;
  frames: Array<{
    frame_id: string;
    parent_frame_id: string | null;
    width: number;
    height: number;
    version: string;
    transform: { x: number; z: number; scale: number; rotation_degrees: number };
  }>;
}

interface FeatureDocument {
  schema_version: string;
  features: Array<{
    feature_id: string;
    entity_id: string;
    frame_id: string;
    periods: Period[];
    period_status: "source_attested" | "unknown";
    review_status: "draft";
    placement_source: "PRESENTATION";
    canon_basis: "CANONICAL" | "CANON_CONSTRAINED" | "UNKNOWN";
    constraint_relationship_ids?: string[];
    geometry: { type: "Polygon"; points: Array<[number, number]> };
  }>;
}

interface LayoutDocument {
  schema_version: string;
  layout_revision: string;
  placements: Array<{
    placement_id: string;
    entity_id: string;
    frame_id: string;
    position: { u: number; v: number };
    periods: Period[];
    review_status: "draft" | "reviewed";
    placement_source: "PRESENTATION";
    canon_basis: "CANONICAL" | "CANON_CONSTRAINED" | "UNKNOWN";
    constraint_relationship_ids?: string[];
    placement_note: string;
  }>;
}

interface CoverageDocument {
  schema_version: string;
  coverage_revision: string;
  records: Array<{
    entity_id: string;
    coverage_status: LocationCoverageStatus;
    reason: LocationCoverageRecord["reason"];
  }>;
}

interface ReleaseDocument {
  active_release_id: string;
  releases: Array<{
    release_id: string;
    map_id: string;
    label: string;
    root_frame_id: string;
    layout_version: string;
    coverage_version: string;
    presentation_notice: string;
    default_view: { target_x: number; target_z: number; zoom: number };
  }>;
}

let releasePromise: Promise<MapInventoryRelease> | undefined;

async function readPresentationJson<T>(fileName: string): Promise<T> {
  const content = await readFile(path.join(process.cwd(), "data", fileName), "utf8");
  return parseJsonDocument<T>(fileName, content);
}

function fail(fileName: string, pointer: string, message: string): never {
  throw new DataValidationError(`${fileName}${pointer}: ${message}`, fileName, pointer);
}

function toMapFrames(document: FrameDocument): MapFrame[] {
  return document.frames.map((frame) => ({
    frameId: frame.frame_id,
    parentFrameId: frame.parent_frame_id,
    width: frame.width,
    height: frame.height,
    version: frame.version,
    transform: {
      x: frame.transform.x,
      z: frame.transform.z,
      scale: frame.transform.scale,
      rotationDegrees: frame.transform.rotation_degrees,
    },
  }));
}

function relationProjection(relation: Relationship, entity: Entity): MapPreviewRelation {
  return {
    id: entity.id,
    slug: entity.slug,
    name: entity.name,
    type: entity.type,
    relation: relation.relation,
  };
}

function buildPreview(entity: Entity, database: Awaited<ReturnType<typeof getDatabase>>): MapEntityPreview {
  const outgoing = database.outgoingByEntity.get(entity.id) ?? [];
  const incoming = database.incomingByEntity.get(entity.id) ?? [];
  const contextRelations = new Set(["CAPITAL_OF", "LOCATED_IN", "PART_OF", "INSIDE"]);
  const context = outgoing
    .filter((relation) => contextRelations.has(relation.relation))
    .map((relation) => {
      const target = database.entityById.get(relation.object_id);
      return target && LOCATION_TYPES.has(target.type) ? relationProjection(relation, target) : null;
    })
    .filter((item): item is MapPreviewRelation => item !== null);
  const relatedLocations = incoming
    .filter((relation) => contextRelations.has(relation.relation))
    .map((relation) => {
      const subject = database.entityById.get(relation.subject_id);
      return subject && LOCATION_TYPES.has(subject.type) ? relationProjection(relation, subject) : null;
    })
    .filter((item): item is MapPreviewRelation => item !== null)
    .sort((a, b) => a.name.localeCompare(b.name, "tr-TR"));
  const facts = [...(entity.facts ?? [])];
  for (const factId of entity.fact_ids ?? []) {
    const fact = database.factById.get(factId);
    if (fact && !facts.some((candidate) => candidate.id === fact.id)) facts.push(fact);
  }
  return {
    entityId: entity.id,
    slug: entity.slug,
    name: entity.name,
    type: entity.type,
    typeLabel: entityTypeLabel(entity.type),
    aliases: entity.aliases,
    periods: entity.periods,
    episodes: entity.episodes,
    firstAppearance: entity.first_appearance,
    facts: facts.map((fact) => fact.text),
    context,
    relatedLocations,
    eraStates: Object.fromEntries((["1300 civarı", "1600 civarı"] as const).map((period) => {
      const evidence = database.worldStates.filter((item) => item.entity_id === entity.id && item.period === period);
      const hasPositive = entity.periods.includes(period) || evidence.some((item) => item.state === "exists");
      const hasNegative = evidence.some((item) => item.state === "reported_lost");
      const state = hasPositive && hasNegative
        ? "conflicted"
        : hasNegative
          ? "reported_lost"
          : hasPositive
            ? "attested"
            : "unknown";
      return [period, { state, evidence }] as const;
    })) as MapEntityPreview["eraStates"],
  };
}

function hasApprovedArt(assetDocument: unknown, period: Period): boolean {
  if (!assetDocument || typeof assetDocument !== "object") return false;
  const assets = (assetDocument as { assets?: unknown }).assets;
  if (!Array.isArray(assets)) return false;
  return assets.some((asset) => {
    if (!asset || typeof asset !== "object") return false;
    const candidate = asset as { status?: unknown; periods?: unknown };
    if (candidate.status !== "approved") return false;
    return Array.isArray(candidate.periods) && candidate.periods.includes(period);
  });
}

async function buildInventoryRelease(): Promise<MapInventoryRelease> {
  const [schema, frameDocument, featureDocument, layoutDocument, coverageDocument, assetDocument, releaseDocument, database] = await Promise.all([
    readPresentationJson<Record<string, unknown> & { $id: string; fileSchemas: Record<string, string> }>("map_presentation_schema.json"),
    readPresentationJson<FrameDocument>("map_frames.json"),
    readPresentationJson<FeatureDocument>("map_features.json"),
    readPresentationJson<LayoutDocument>("map_layout.json"),
    readPresentationJson<CoverageDocument>("map_location_coverage.json"),
    readPresentationJson<unknown>("map_assets.json"),
    readPresentationJson<ReleaseDocument>("map_releases.json"),
    getDatabase(),
  ]);
  const validate = createDatabaseValidator(schema);
  validate("map_frames.json", frameDocument);
  validate("map_features.json", featureDocument);
  validate("map_layout.json", layoutDocument);
  validate("map_location_coverage.json", coverageDocument);
  validate("map_assets.json", assetDocument);
  validate("map_releases.json", releaseDocument);

  const release = releaseDocument.releases.find((candidate) => candidate.release_id === releaseDocument.active_release_id);
  if (!release) fail("map_releases.json", "/active_release_id", "etkin harita yayını bulunamadı");
  if (release.layout_version !== layoutDocument.layout_revision) fail("map_releases.json", "/releases", "yayın ile yerleşim revizyonu uyuşmuyor");
  if (release.coverage_version !== coverageDocument.coverage_revision) fail("map_releases.json", "/releases", "yayın ile kapsam revizyonu uyuşmuyor");

  const frames = toMapFrames(frameDocument);
  const frameIndex = indexFrames(frames);
  if (!frameIndex.has(release.root_frame_id)) fail("map_releases.json", "/releases", "kök alan bulunamadı");
  const expectedLandforms = database.entities.filter((entity) => entity.type === "ISLAND" || entity.type === "CONTINENT");
  const landformEntityById = new Map<string, Entity>(expectedLandforms.map((entity) => [entity.id, entity]));
  const seenEntities = new Set<string>();
  const seenFeatures = new Set<string>();

  const landforms: MapLandform[] = featureDocument.features.map((feature, index) => {
    if (seenFeatures.has(feature.feature_id)) fail("map_features.json", `/features/${index}/feature_id`, "yinelenen şekil kimliği");
    if (seenEntities.has(feature.entity_id)) fail("map_features.json", `/features/${index}/entity_id`, "varlık için birden fazla kara şekli");
    seenFeatures.add(feature.feature_id);
    seenEntities.add(feature.entity_id);
    const entity = landformEntityById.get(feature.entity_id);
    if (!entity || (entity.type !== "ISLAND" && entity.type !== "CONTINENT")) fail("map_features.json", `/features/${index}/entity_id`, "ada veya kıta kaydı bulunamadı");
    if (!frameIndex.has(feature.frame_id)) fail("map_features.json", `/features/${index}/frame_id`, "alan bulunamadı");
    const worldPoints = feature.geometry.points.map(([u, v]) => {
      const point = frameLocalToWorld({ frameId: feature.frame_id, u, v }, frameIndex);
      return [point.x, point.z] as [number, number];
    });
    const center = frameLocalToWorld({ frameId: feature.frame_id, u: 0.5, v: 0.5 }, frameIndex);
    return {
      featureId: feature.feature_id,
      entityId: entity.id,
      slug: entity.slug,
      name: entity.name,
      entityType: entity.type,
      frameId: feature.frame_id,
      periods: feature.periods,
      periodStatus: feature.period_status,
      reviewStatus: feature.review_status,
      placementSource: feature.placement_source,
      canonBasis: feature.canon_basis,
      worldPoints,
      worldCenter: [center.x, center.z],
      preview: buildPreview(entity, database),
    };
  });

  const missingLandforms = expectedLandforms.filter((entity) => !seenEntities.has(entity.id));
  if (missingLandforms.length) fail("map_features.json", "/features", `kara şekli eksik: ${missingLandforms.map((entity) => entity.id).join(", ")}`);

  const relationshipIds = new Set(database.relationships.map((relationship) => relationship.id));
  const seenPlacements = new Set<string>();
  const placedEntities = new Set<string>();
  const markers: MapLocationMarker[] = layoutDocument.placements.map((placement, index) => {
    if (seenPlacements.has(placement.placement_id)) fail("map_layout.json", `/placements/${index}/placement_id`, "yinelenen yerleşim kimliği");
    if (placedEntities.has(placement.entity_id)) fail("map_layout.json", `/placements/${index}/entity_id`, "varlık için birden fazla dünya işareti");
    seenPlacements.add(placement.placement_id);
    placedEntities.add(placement.entity_id);
    const entity = database.entityById.get(placement.entity_id);
    if (!entity || !LOCATION_TYPES.has(entity.type)) fail("map_layout.json", `/placements/${index}/entity_id`, "konum varlığı bulunamadı");
    if (!frameIndex.has(placement.frame_id)) fail("map_layout.json", `/placements/${index}/frame_id`, "alan bulunamadı");
    placement.constraint_relationship_ids?.forEach((id, relationIndex) => {
      if (!relationshipIds.has(id)) fail("map_layout.json", `/placements/${index}/constraint_relationship_ids/${relationIndex}`, "ilişki bulunamadı");
    });
    const point = frameLocalToWorld({ frameId: placement.frame_id, ...placement.position }, frameIndex);
    return {
      placementId: placement.placement_id,
      entityId: entity.id,
      frameId: placement.frame_id,
      worldPosition: [point.x, point.z],
      periods: placement.periods,
      reviewStatus: placement.review_status,
      placementSource: placement.placement_source,
      canonBasis: placement.canon_basis,
      placementNote: placement.placement_note,
      preview: buildPreview(entity, database),
    };
  });

  const expectedLocations = database.entities.filter((entity) => LOCATION_TYPES.has(entity.type));
  const seenCoverage = new Set<string>();
  const coverage: LocationCoverageRecord[] = coverageDocument.records.map((record, index) => {
    if (seenCoverage.has(record.entity_id)) fail("map_location_coverage.json", `/records/${index}/entity_id`, "yinelenen kapsam kaydı");
    seenCoverage.add(record.entity_id);
    const entity = database.entityById.get(record.entity_id);
    if (!entity || !LOCATION_TYPES.has(entity.type)) fail("map_location_coverage.json", `/records/${index}/entity_id`, "konum varlığı bulunamadı");
    const hasPresentation = seenEntities.has(entity.id) || placedEntities.has(entity.id);
    if ((record.coverage_status === "mapped") !== hasPresentation) fail("map_location_coverage.json", `/records/${index}/coverage_status`, "mapped durumu sunum şekli veya işaretiyle uyuşmuyor");
    return {
      entityId: entity.id,
      slug: entity.slug,
      name: entity.name,
      entityType: entity.type,
      status: record.coverage_status,
      reason: record.reason,
    };
  });
  const missingCoverage = expectedLocations.filter((entity) => !seenCoverage.has(entity.id));
  if (missingCoverage.length) fail("map_location_coverage.json", "/records", `kapsam kaydı eksik: ${missingCoverage.map((entity) => entity.id).join(", ")}`);

  const coverageCounts: Record<LocationCoverageStatus, number> = { mapped: 0, local_map: 0, unplaced: 0, supernatural_or_uncertain: 0 };
  coverage.forEach((record) => { coverageCounts[record.status] += 1; });
  const islands = landforms.filter((feature) => feature.entityType === "ISLAND").length;
  const continents = landforms.filter((feature) => feature.entityType === "CONTINENT").length;
  return {
    releaseId: release.release_id,
    mapId: release.map_id,
    label: release.label,
    presentationNotice: release.presentation_notice,
    eraArtStatus: {
      "1300 civarı": hasApprovedArt(assetDocument, "1300 civarı") ? "approved" : "unavailable",
      "1600 civarı": hasApprovedArt(assetDocument, "1600 civarı") ? "approved" : "unavailable",
    },
    defaultView: { targetX: release.default_view.target_x, targetZ: release.default_view.target_z, zoom: release.default_view.zoom },
    landforms: landforms.sort((a, b) => a.name.localeCompare(b.name, "tr-TR")),
    counts: { islands, continents, total: landforms.length },
    markers: markers.sort((a, b) => a.preview.name.localeCompare(b.preview.name, "tr-TR")),
    coverage: coverage.sort((a, b) => a.name.localeCompare(b.name, "tr-TR")),
    coverageCounts,
  };
}

export function getMapInventoryRelease(): Promise<MapInventoryRelease> {
  releasePromise ??= buildInventoryRelease();
  return releasePromise;
}
