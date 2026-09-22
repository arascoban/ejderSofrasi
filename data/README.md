# Master world database

This is the local, versioned data foundation for the Ejder Sofrası map and wiki. It contains MAIN_TIMELINE only. The visitor-facing labels are **Günümüz** and **Gümüş Tanrısının 1673 yılı**, describing different periods of the same world. Existing `1300 civarı` and `1600 civarı` values remain storage/source keys for backward compatibility and are translated by the application layer.

The original 25 episode JSON documents and six canon name lists remain unchanged. Source filenames end in `.md`, but episode file contents are JSON. Canon files are plain-text lists, not additional episode extractions.

## Files and ownership

| File | Purpose |
| --- | --- |
| `entities.json` | Authoritative normalized entities, names, aliases, facts, episode connections and source references. |
| `relationships.json` | Directed, typed, period-aware edges with evidence assertions. |
| `episodes.json` | EP00–EP24 titles, original period tags, reviewed narrative context and entity/event/travel indexes. |
| `lore.json` | All 86 source lore passages, retained separately from entity biographies. |
| `timeline.json` | Significant events linked to HISTORICAL_EVENT entities. `summary_fact_id` points to the summary stored once on that entity. |
| `travel.json` | Ordered routes, separate party branches, exact or descriptive endpoints, transport and temporal transitions. |
| `map_canon.json` | Geographic constraints and period-specific parent candidates. No creative coordinates. |
| `world_states.json` | Explicit positive existence/loss claims; absence is never inferred from missing mentions. |
| `unresolved_conflicts.json` | Source uncertainties, quarantined edges and editorial issues. |
| `world_metadata.json` | Database semantics, continuity and build information. |
| `vocabulary.json` | Entity types, relation vocabulary, extensions and confidence meanings. |
| `schema.json` | Reusable JSON Schema definitions for core records and derived views. |
| `map_frames.json`, `map_features.json` | Versioned presentation-only coordinate frames and one draft shape per current island/continent entity. These are not canon geography. |
| `map_layout.json` | Versioned presentation-only marker anchors. Draft coordinates remain separate from canon and retain stable entity IDs across later art revisions. |
| `map_location_coverage.json` | Explicit coverage state for all 85 location entities: world-mapped, local-map detail, unplaced or supernatural/uncertain. |
| `map_assets.json`, `map_releases.json` | Immutable-artwork catalog and the compatible active map release. The initial asset catalog is intentionally empty. |
| `map_presentation_schema.json` | Application-owned schema for the separately authored map presentation files. |
| `source_inventory.json` | Content-based source inventory, schemas, counts, source IDs and original SHA-256 hashes. |
| `source_coverage.json` | Every source entity/link/travel record mapped to its normalized result or quarantine. |
| `normalization_decisions.json` | Evidence and reasons for merges, corrections, classification changes and route splits. |
| `id_redirects.json` | Redirects for retired entity IDs when an already registered identity is subsequently merged. Empty if none are required. |
| `qa_report.json` | Counts, validation results, corrections, warnings and review queue. |

The following files are **derived ID indexes**, not copies of full records: `npcs.json`, `locations.json`, `factions.json`, `families.json`, `deities.json`, `dragons.json`, `items.json`, `creatures.json`, `historical_events.json`. Resolve their `entity_ids` against `entities.json`. `npcs.json` indexes PERSON, including player characters; named animals and monsters are in `creatures.json`. `factions.json` includes FACTION, ORGANIZATION and MILITARY_UNIT. `families.json` includes FAMILY and DYNASTY.

## Evidence and uncertainty

Each normalized fact retains its source wording and evidence. Repeated identical wording is collapsed while preserving separate source assertions. Similar but meaningfully different details are not aggressively summarized away. The 1,290 source fact occurrences are represented by 1,160 unique source-derived facts; 90 editorial event summaries bring the stored fact count to 1,250.

Episode references use a source ID and RFC 6901 JSON pointer, for example `SRC-EP12` plus `/entities/0/facts/2`. Canon references use a source ID and one-based line number. Resolve source IDs using `source_inventory.json`. Evidence remains traceable to the unmodified original files. Applications can display the normalized fact/evidence text without shipping the entire source corpus.

`name_status: canon_confirmed` confirms spelling/identity as explicitly established by the name list; it does not certify every biographical statement. `confidence: source_supported` means the extraction contains evidence. The original recordings/transcripts were not independently verified. Canon-only entries have no fabricated episodes, dates, biography or relationships.

Facts and entities link to relevant `conflict_ids`. A conflict is an open review record, not an instruction to discard all associated information. Review the cited claim. Eight unsupported source relationships are quarantined rather than emitted as active edges. Claims preserved in prose may remain disputed even after an incorrect structured edge is removed.

No identity is merged solely by phonetic similarity, surname or occupation. Explicit aliases and source-established identity revelations support merges. Similar but unproven candidates remain separate. Shared character titles such as Gümüş Sıçan can resolve to multiple IDs; search must allow disambiguation. Canon lists Helva Adası and Helvanar Kıtası separately, and Metal, Bronz and Kahverengi as separate dragons.

## Time and appearances

`episodes` and `first_appearance` refer to the first evidenced reference in the supplied episodes. They include mentions; they are **not** birth dates, first physical appearances or proof of presence. Use `episode_connections`, actual presence edges, travel and event evidence when making a stronger claim.

An entity's `periods` contains positive dated attestations, not an inferred lifespan. An empty array means its period is not established. A claim's `period: null` means its date is unknown. It must not be silently copied into both historical states. Original episode period labels are available in `episodes.json`; they are narrative context, not dates for every remembered or historical fact.

EP07 reaches the earlier city after the temple exit. Its travel record therefore retains a temporal transition. EP08 and EP09 mix present action in the circa-1300 storyline with references to the party's circa-1600 origin. The Silver Dragon calendar year 1673 is preserved in lore; no numerical calendar conversion is invented.

Event modalities are distinct: `occurred`, `historical`, `planned`, `revealed`. A prophecy, dream or historical revelation is not an event proven to occur on the date it was narrated. Events preserve their source episode and evidence.

Relationships group identical subject/predicate/object/period assertions. Different episode assertions remain available. Do not interpret every circa-1300 ownership or leadership edge as simultaneously current: objects change custody and leaders die within that period. Episode order, event summaries and conflicting assertions are necessary to reconstruct finer state.

## Geography and travel

Geographic containment and spatial constraints use entity IDs. `parent_id` selects the narrowest parent only when comparable source-supported containment proves it. Incomparable candidate parents remain unresolved. A kingdom and city are not merged because the source casually reuses a place name.

`CANON_CONSTRAINED` means source evidence constrains placement; it does not mean exact geometry exists. `UNKNOWN` means no usable constraint is established. `CANONICAL` is allowed for future authoritative geometry but is not assigned to an invented placement. Canon records contain no X/Y/Z or artwork labels. Creative anchors in `map_layout.json` are explicitly labeled `PRESENTATION` and carry their own review status.

Arifler Okulu has separate ORGANIZATION and BUILDING identities. Membership targets the institution; physical travel and location edges target the campus. The campus references shared architectural facts by ID, rather than duplicating a full institution record.

Supernatural, trial and memory locations are marked `supernatural_or_uncertain`. The recreated Sütçüoğlu kitchen is not placed as the real childhood kitchen inside the ruins. Uncertain trial geography does not establish a continent parent.

Travel's `from_id`/`to_id` are exact identities only. A room or landmark description can retain a `context_id` for its named broader location while its exact `entity_id` remains null. `waypoints` preserves every source stop and order; `via_ids` contains only exactly resolved entities. Context labels are not invented aliases. `unresolved_travelers` preserves unnamed groups without inventing personal identities.

EP01's sailing is `in_progress`, not a confirmed island arrival. EP14 preserves the split party and removes an animal from a leg before the source says it was found. EP22's combined route is replaced by four separate supported character branches. The 53 original travel records therefore become 56 normalized records.

## Rebuild and review

Run from the project root using Python 3.10 or newer, with no third-party packages:

```sh
python3 scripts/build_database.py
python3 scripts/validate_database.py
```

`scripts/reviews/*.json` records the semantic reviews. The builder applies those decisions and the documented cross-source normalization rules. `scripts/id_registry.json` persists IDs: keep it under version control and never regenerate it to close numbering gaps. IDs are independent of display slugs; classification changes preserve already allocated identities. A new canonical name/merge needs an explicit reviewed migration, with redirects if an old ID was published.

The build verifies source hashes before processing. If the owner intentionally supplies new or revised source files, review and explicitly update the source inventory; do not disable this check. Existing entity IDs must survive that process. Direct edits to generated entity/relationship files will be overwritten by a rebuild; update reviewed decisions and rebuild instead.

Validation checks JSON, published schema constraints, source hashes/pointers, complete source coverage, unique IDs/slugs, endpoint types, exact duplicates, alias conflicts, kinship direction, ownership direction, geography cycles, reference completeness, date/appearance rules, party splits and protected identity distinctions. The included schema evaluator implements the constraint keywords used by this repository's schema, not arbitrary third-party schemas.

The data is structurally ready for frontend development with uncertainty-aware rendering. It is not a declaration that all open lore questions are resolved. Review the flagged claims before publishing them as settled canon. Keep `/data` as the current source of truth; if later imported into Supabase, initially treat PostgreSQL as a derived serving layer. Any future database editing workflow must explicitly replace this ownership model to avoid two competing sources of truth.
