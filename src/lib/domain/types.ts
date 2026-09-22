export type Period = "1300 civarı" | "1600 civarı";
/** Stable URL tokens for the visitor-facing period selector. */
export type PeriodUrlToken = "silver-god-1673" | "present";
export type Confidence = "canon_name_only" | "source_supported" | "disputed";

export const ENTITY_TYPES = [
  "PERSON",
  "FAMILY",
  "DYNASTY",
  "FACTION",
  "ORGANIZATION",
  "MILITARY_UNIT",
  "CONTINENT",
  "KINGDOM",
  "STATE",
  "REGION",
  "DISTRICT",
  "CITY",
  "TOWN",
  "VILLAGE",
  "ISLAND",
  "PORT",
  "BUILDING",
  "TAVERN",
  "TEMPLE",
  "NATURAL_FEATURE",
  "SHIP",
  "CREATURE",
  "DEITY",
  "DRAGON",
  "PLANT",
  "ITEM",
  "HISTORICAL_EVENT",
  "HISTORICAL_ERA",
  "OTHER",
] as const;

export type EntityType = (typeof ENTITY_TYPES)[number];

export interface SourceReference {
  source_id: string;
  pointer?: string;
  line?: number;
}

export interface FactAssertion {
  period: Period | null;
  temporal_basis: string;
  confidence: Confidence;
  source_refs: SourceReference[];
}

export interface Fact {
  id: string;
  text: string;
  assertions: FactAssertion[];
  conflict_ids?: string[];
}

export interface Entity {
  id: string;
  slug: string;
  name: string;
  type: EntityType;
  aliases: string[];
  periods: Period[];
  episodes: string[];
  first_appearance: string | null;
  continuity_scope: "MAIN_TIMELINE";
  confidence: Confidence;
  source_refs: SourceReference[];
  name_status: string;
  record_status: string;
  episode_connections: Array<{ episode: string; kinds: string[] }>;
  facts?: Fact[];
  fact_ids?: string[];
  conflict_ids?: string[];
  institution_id?: string;
  member_ids?: string[];
  subtype?: string;
}

export interface RelationshipAssertion {
  evidence: string;
  temporal_basis: string;
  source_refs: SourceReference[];
  confidence: Confidence;
}

export interface Relationship {
  id: string;
  subject_id: string;
  relation: string;
  object_id: string;
  period: Period | null;
  episodes: string[];
  confidence: Confidence;
  assertions: RelationshipAssertion[];
  continuity_scope: "MAIN_TIMELINE";
}

export interface Episode {
  id: string;
  number: number;
  title: string;
  source_periods: Period[];
  narrative_periods: Period[];
  continuity_scope: "MAIN_TIMELINE";
  source_refs: SourceReference[];
  entity_ids: string[];
  timeline_event_ids: string[];
  travel_ids: string[];
}

export type TimelineEventStatus = "occurred" | "historical" | "planned" | "revealed";

export interface TimelineRecord {
  event_id: string;
  episode: string;
  period: Period | null;
  title: string;
  summary_fact_id: string;
  event_status: TimelineEventStatus;
  source_refs: SourceReference[];
  continuity_scope: "MAIN_TIMELINE";
  participant_ids: string[];
  location_ids: string[];
  related_entity_ids: string[];
}

export interface TravelPlace {
  label: string | null;
  entity_id: string | null;
  resolution: "unknown" | "exact" | "within_named_location" | "location_description" | "unresolved_description";
  context_id?: string;
  reviewed_context_id?: string | null;
  sequence?: number;
}

export interface TravelRecord {
  id: string;
  episode: string;
  sequence: number;
  branch?: string;
  period: Period | null;
  from_period?: Period | null;
  to_period?: Period | null;
  temporal_basis: string;
  traveler_ids: string[];
  from_id: string | null;
  to_id: string | null;
  via_ids: string[];
  origin: TravelPlace;
  destination: TravelPlace;
  waypoints: TravelPlace[];
  status: "source_reported" | "in_progress" | "completed" | "temporal_transition" | "reviewed_split_route";
  confidence: Confidence;
  source_refs: SourceReference[];
  continuity_scope: "MAIN_TIMELINE";
  reason?: string;
  unresolved_travelers?: Array<{ label: string; entity_id: null }>;
  transport?: { description: string; entity_ids: string[] };
}

export interface LoreRecord {
  id: string;
  subject: string;
  text: string;
  episode: string;
  period: Period | null;
  temporal_basis: string;
  subject_id: string | null;
  source_refs: SourceReference[];
  continuity_scope: "MAIN_TIMELINE";
}

export interface WorldState {
  id: string;
  entity_id: string;
  period: Period;
  state: "exists" | "reported_lost";
  confidence: Confidence;
  source_refs: SourceReference[];
  owner_confirmation?: string;
  qualification?: string;
}

export interface WorldMetadata {
  schema_version: string;
  database_name: string;
  continuity_scope: "MAIN_TIMELINE";
  language: "tr";
  source_episode_range: [string, string];
  historical_periods: Array<{
    id: string;
    label: Period;
    approximate_year: number;
  }>;
}

export interface EntitySummary {
  id: string;
  slug: string;
  name: string;
  aliases: string[];
  type: EntityType;
  periods: Period[];
  firstAppearance: string | null;
  recordStatus: string;
  /** IDs retired by a confirmed merge; retained for search and old links. */
  legacyIds?: string[];
}

export type EraState = "attested" | "reported_lost" | "unknown" | "conflicted";

export interface EntityEraState {
  state: EraState;
  evidence: WorldState[];
}

export interface EntityRelations {
  incoming: Relationship[];
  outgoing: Relationship[];
}
