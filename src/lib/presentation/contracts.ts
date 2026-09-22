import type { Entity, EntityEraState, EntityType, Period } from "@/lib/domain/types";

export interface MapFrame {
  frameId: string;
  parentFrameId: string | null;
  width: number;
  height: number;
  version: string;
  transform: {
    x: number;
    z: number;
    scale: number;
    rotationDegrees: number;
  };
}

export interface FrameLocalPosition {
  frameId: MapFrame["frameId"];
  u: number;
  v: number;
}

export interface MapFeature {
  featureId: string;
  entityId: Entity["id"];
  periods: Period[];
  position: FrameLocalPosition | null;
  reviewStatus: "unplaced" | "draft" | "reviewed";
  placementSource: "PRESENTATION";
}

export interface MapLandform {
  featureId: string;
  entityId: Entity["id"];
  slug: Entity["slug"];
  name: Entity["name"];
  entityType: "ISLAND" | "CONTINENT";
  frameId: MapFrame["frameId"];
  periods: Period[];
  periodStatus: "source_attested" | "unknown";
  reviewStatus: "draft";
  placementSource: "PRESENTATION";
  canonBasis: "CANONICAL" | "CANON_CONSTRAINED" | "UNKNOWN";
  worldPoints: Array<[number, number]>;
  worldCenter: [number, number];
  preview: MapEntityPreview;
}

export type LocationCoverageStatus = "mapped" | "local_map" | "unplaced" | "supernatural_or_uncertain";

export interface LocationCoverageRecord {
  entityId: Entity["id"];
  slug: Entity["slug"];
  name: Entity["name"];
  entityType: EntityType;
  status: LocationCoverageStatus;
  reason: "DRAFT_WORLD_MARKER" | "DRAFT_LANDFORM_SHAPE" | "PARENT_DETAIL_WITHOUT_LOCAL_ANCHOR" | "NO_REVIEWED_WORLD_ANCHOR" | "NON_ORDINARY_SPATIAL_DOMAIN";
}

export interface MapPreviewRelation {
  id: Entity["id"];
  slug: Entity["slug"];
  name: Entity["name"];
  type: EntityType;
  relation: string;
}

export interface MapEntityPreview {
  entityId: Entity["id"];
  slug: Entity["slug"];
  name: Entity["name"];
  type: EntityType;
  typeLabel: string;
  aliases: string[];
  periods: Period[];
  episodes: string[];
  firstAppearance: string | null;
  facts: string[];
  context: MapPreviewRelation[];
  relatedLocations: MapPreviewRelation[];
  eraStates: Partial<Record<Period, EntityEraState>>;
}

export interface MapLocationMarker {
  placementId: string;
  entityId: Entity["id"];
  frameId: MapFrame["frameId"];
  worldPosition: [number, number];
  periods: Period[];
  reviewStatus: "draft" | "reviewed";
  placementSource: "PRESENTATION";
  canonBasis: "CANONICAL" | "CANON_CONSTRAINED" | "UNKNOWN";
  placementNote: string;
  preview: MapEntityPreview;
}

export interface MapInventoryRelease {
  releaseId: string;
  mapId: string;
  label: string;
  presentationNotice: string;
  eraArtStatus: Record<Period, "approved" | "unavailable">;
  defaultView: { targetX: number; targetZ: number; zoom: number };
  landforms: MapLandform[];
  counts: { islands: number; continents: number; total: number };
  markers: MapLocationMarker[];
  coverage: LocationCoverageRecord[];
  coverageCounts: Record<LocationCoverageStatus, number>;
}

export interface MapPresentationRepository {
  getFeatures(period: Period): Promise<readonly MapFeature[]>;
}

/** Kanonik coğrafya bu arayüzü doldurmaz; sunum yerleşimleri B aşamasında eklenir. */
export const emptyMapPresentationRepository: MapPresentationRepository = {
  async getFeatures() {
    return [];
  },
};
