# Interactive fantasy atlas and lore wiki — implementation plan

Planning only. No application scaffold, packages, frontend files, map placements, database edits or cloud resources have been created in this phase. This plan is based on the actual workspace and database inspected on 15 September 2026.

Updated requirements: the entire site is Turkish; authorized editors can write normal wiki articles and upload entity images; the map's landforms follow the actual location inventory; ongoing episode and map updates preserve existing content and links. The detailed, implementation-binding Turkish specification is [WIKI_VE_HARITA_PLANI.md](/Users/arascoban/Desktop/Ejder/WIKI_VE_HARITA_PLANI.md). These requirements are included in the phases below, not deferred to an unspecified future version. This update authorizes planning only.

Execution update: the owner will implement with **GPT-5.6 Luna / Max**. Read [AGENTS.md](/Users/arascoban/Desktop/Ejder/AGENTS.md) and [LUNA_UYGULAMA_REHBERI.md](/Users/arascoban/Desktop/Ejder/LUNA_UYGULAMA_REHBERI.md) before implementation. They define small work steps, persistent progress and mandatory context-rich problem records for the owner to consult GPT-6 Astra manually when technical uncertainty remains or a second verified fix attempt fails. Luna retains implementation ownership. Section 16 records the binding protocol; this document does not itself switch models or start development.

**Dönem adlandırması güncellemesi — 22 Eylül 2026:** Ziyaretçiye gösterilen iki dönem artık **Günümüz** ve **Gümüş Tanrısının 1673 yılı**dır. Mevcut kaynak/DB anahtarları (`1600 civarı` ve `1300 civarı`) geriye dönük veri, makale ve URL uyumluluğu için korunur; uygulama katmanı bunları merkezi Türkçe etiketlere çevirir. F–I planındaki dönem geçişi bu yeni görünen adları kullanır. 7. bölüm sonundaki tapınak geçişi, aynı dünyanın 1673 yılına temporal geçişi olarak ele alınır.

**1. Recommended architecture and current starting point**

Build a Next.js application with a server-rendered wiki and a client-rendered interactive atlas. Keep the previously selected Three.js / React Three Fiber direction, but make the first map an illustrated, flat surface viewed from above. Use the artwork, typography, markers, camera motion and integrated reading experience to establish quality. Add selected 3D landmarks later when assets exist and measurements justify them.

The repository currently contains data, Python consolidation/validation scripts and documentation. There is no package.json, frontend scaffold, dependency lockfile, map artwork, map-layout file or Git repository. Preserve the existing project at this root; do not generate a second nested application.

| Inspected data | Actual state | Consequence for implementation |
| --- | --- | --- |
| Master registry | 411 entities; 28 populated types | One reusable entity page system must cover more than NPCs and locations. |
| Locations | 83 | A modest first marker layer is sufficient; clustering is not a prerequisite. |
| Geographic constraints | 47 CANON_CONSTRAINED; 36 UNKNOWN | Constraints do not provide drawable coordinates. |
| Map geometry/art | Initial inventory draft targets the current 4 islands and 2 continents | Build separate inventory-linked landform drafts, then produce or adapt reviewed artwork to them. |
| Relationships | 422 edges, with individual evidence assertions | Index both directions; preserve predicate meaning and date. |
| Facts | 1,250, including event summaries | Facts are objects with assertion arrays, not simple strings. |
| Undated facts | 1,160 have only null-period assertions | A naive era filter would hide most content; provide an explicitly undated section. |
| Entity periods | 195 unknown; 140 only 1300; 70 only 1600; 6 both | Missing era evidence is not nonexistence. |
| Canon-only entries | 84 | Show sparse, honest wiki pages without invented biographies. |
| Timeline | 90 entries: 72 occurred, 12 revealed, 5 historical, 1 planned | Distinguish occurrences from disclosures, plans and undated history. |
| Travel | 56 records; only 24 have exact origin and destination IDs | Do not promise 56 drawable complete routes. Intermediate stops can still be unresolved. |
| World states | Two explicit entries, both for Helvanar | The dataset is not a complete historical-state simulation. |
| Review queue | 162 open items | Resolve uncertainty at claim level rather than treating an entire entity as unusable. |
| Validation | Existing QA passes; original source hashes still match | Extend validation for presentation files and client outputs. |

The architecture has five responsibilities:

1. **Source data:** existing `/data`, its schemas and evidence, produced through the existing reviewed workflow.
2. **Domain queries:** validated, immutable indexes and shared rules for identity, eras, presence, geography and uncertainty.
3. **Editorial content:** entity-linked wiki articles, revision history and media metadata, authored separately from imported evidence. Supabase owns these records once authoring is enabled; episode consolidation must never overwrite them.
4. **Presentation data:** versioned landform geometry, coordinate frames, artwork manifests, normalized anchors, label placement and illustrative polygons/paths; kept explicitly separate from canon.
5. **Application views:** atlas, previews, wiki, editor, search, timeline and episodes, all consuming shared projections rather than importing arbitrary JSON in components.

The dependency direction is source data → validation/indexing → domain projections → interface. Map rendering must not decide what is canon, who visited a place, or which historical period a fact belongs to.

**2. Recommended technology stack**

| Area | Recommendation | Reason |
| --- | --- | --- |
| Framework | Next.js App Router + React | Server-rendered entity pages and a focused interactive map boundary. |
| Language | TypeScript, strict mode | Explicit IDs, discriminated result states and safe JSON projections. |
| Styling | Tailwind CSS with project-owned design tokens | Consistent responsive surfaces without adopting a dashboard template. |
| Map | Three.js + React Three Fiber | Preserves the chosen 3D direction and supports an image-first atlas in arbitrary world coordinates. |
| Camera | drei CameraControls, top-down orthographic configuration | Smooth constrained pan/zoom; rotation and tilt disabled initially. |
| Interface motion | CSS transitions initially; CameraControls for camera motion | Avoid competing animation systems. Add a motion library only for an interaction that needs it. |
| Dialogs/sheets | Accessible headless primitives, such as Radix Dialog | Reliable focus, keyboard and dismissal behavior with a custom visual identity. |
| Client state | Small Zustand store scoped to the application provider | Selector subscriptions for map UI, without putting all source data in mutable state. |
| Search | MiniSearch, loaded when search is used | Local entity-name, alias, prefix and controlled fuzzy search. |
| Canon data | Validated JSON; optional versioned Supabase read model | The existing data remains authoritative for structured canon; editorial content has its own explicitly separate ownership. |
| Wiki authoring | Tiptap JSON documents, server-rendered published content | Familiar rich-text editing, internal entity links and images without loading the editor for readers. |
| Schema validation | Existing Python QA + Ajv draft-2020-12 | Preserve semantic checks and validate the published JSON Schema with a standard JS engine. |
| Testing | Vitest for domain behavior; Playwright for journeys and browser checks; axe checks for accessibility | Test the difficult semantics and actual interaction paths. |
| Asset hosting | Local map assets initially; Supabase Storage in D2 | Private drafts/originals, published image variants and immutable map assets with independent backups. |
| Database and authentication | Supabase PostgreSQL + Auth in D2 | Authoritative articles/revisions/media and explicit editor access; core canon imports remain a separate read model. |
| Deployment | Vercel connected to the eventual GitHub repository | Preview deployments and application hosting. |

Select stable, mutually compatible package versions during Phase A and commit the lockfile. Do not select experimental React/R3F releases merely for novelty. There is currently no version constraint from an existing application.

Use Server Components for wiki content and data access, with client boundaries around map, search and other interaction. Keep the R3F dependency out of the wiki-only client bundle. This follows Next.js guidance to restrict client components to the interactive portions of an application. [Next.js server/client boundaries](https://nextjs.org/docs/app/getting-started/server-and-client-components).

**3. Map renderer comparison and decision**

| Option | Strength for this project | Cost or limitation | Decision |
| --- | --- | --- | --- |
| Custom DOM/SVG transforms | Direct image space, semantic controls, flexible labels | We would own gesture handling, camera constraints, inertia and later tiling | Avoid as the main camera engine. Use DOM for accessible overlays. |
| Leaflet with CRS.Simple | Arbitrary flat coordinates; established markers, paths and interaction | Requires custom visual treatment; no direct continuation into the chosen GLB/R3F experience | Strong alternative if the product commits to a flat atlas. |
| MapLibre | Sophisticated map layers and large vector datasets | Standard image sources use geographic corner coordinates; unnecessary projection/tile semantics for this small fictional dataset | Do not choose it just because this product is called a map. |
| OpenSeadragon | Excellent fit for huge illustrated images, image pyramids and image overlays | World-feature styling, graph integration and semantic routes remain application work; separate path to full 3D | Best fallback if deep-zoom illustration becomes the sole map direction. |
| R3F + Three.js | Arbitrary world space; camera animation; image surface now and selective 3D later | GPU budget, tile streaming and accessible interaction need deliberate engineering | Recommended given the earlier stack selection and long-term 3D ambition. |

Leaflet's own non-geographical example supports images, markers and paths with CRS.Simple, so it is a valid option rather than a GIS-only choice. [Leaflet non-geographical maps](https://leafletjs.com/examples/crs-simple/crs-simple.html). MapLibre's standard ImageSource is structured around geographic image coordinates. [MapLibre ImageSource](https://maplibre.org/maplibre-gl-js/docs/API/classes/ImageSource/). OpenSeadragon explicitly recommends a pyramid for large source images and supports HTML overlays. [OpenSeadragon image sources](https://openseadragon.github.io/examples/tilesource-image/), [overlays](https://openseadragon.github.io/examples/ui-overlays/).

This is a project-specific judgment: for a permanently flat illustration with no 3D goal, OpenSeadragon or Leaflet would reduce initial rendering work. R3F is justified here by retaining the requested future direction, not by claiming an image requires 3D.

The initial renderer will contain a sea/background surface, independently addressable flat landform shapes or textured patches, an orthographic camera, constrained CameraControls and a DOM overlay for marker buttons/labels. Each island/continent shape is linked to its own entity ID. These can later be baked into render tiles for performance while the editable geometry remains separate. It will preserve artwork color rather than applying dramatic lighting to the illustration. There will be no free orbit, invented terrain elevation, heavy post-processing or mandatory GLB asset in the first atlas.

Keep a small `MapTransform` and `CameraAdapter` boundary for world/screen conversion and camera commands. Do not build a generic framework supporting all five renderers. If Phase B measurements show that the approved artwork requires substantial tile-streaming work and 3D is no longer a priority, revisit the renderer before building many layers around it.

For large images, prepare a low-resolution overview plus an offline image pyramid. A later `RasterLayer` implementation can choose visible levels/tiles in the same normalized coordinate frame. Do not decode a giant original image and call it optimized because its download is compressed. Three.js exposes device texture limits; query them and honor a stricter application memory budget. [Three.js renderer capabilities](https://threejs.org/docs/pages/WebGLRenderer.html).

**4. Application routes and navigation**

| Route | Purpose |
| --- | --- |
| `/` | Redirect to `/map`; the atlas is the entry experience. |
| `/map` | Main explorer. |
| `/map?era=1300&map=world-1300&entity=CIT-0006` | Proposed deep link to the actual Çöl Şehri entity, once this map asset/layout exists. |
| `/wiki` | Entity directory with type, era-evidence and search controls. |
| `/wiki/[slug]` | One canonical entity page across all 28 types. |
| `/entity/[id]` | Stable ID resolver redirecting to the entity's current canonical wiki URL. |
| `/timeline` | Timeline, with optional `era`, `episode`, `event` and event-mode query parameters. |
| `/episodes` | EP00–EP24 directory. |
| `/episodes/[episodeId]` | Episode title, references, events and travel records. |
| `/lore/[loreId]` | Standalone source lore, including records that have no subject entity ID. |
| `/search?q=...` | Shareable global search results. |
| `/giris` | Turkish editor sign-in. Public reading requires no account. |
| `/wiki/[slug]/duzenle` | Authorized rich-text editing, media, preview and revision history for the resolved entity ID. |
| `/yonetim` | Private editorial drafts, publication and media management; separate from the public atlas. |

Use the existing globally unique slugs: Akmer is currently `/wiki/akmer-sutcuoglu`, Çöl Şehri is `/wiki/col-sehri`. Do not manufacture the shorter `/wiki/akmer` as the canonical slug. Category-specific paths can be added as redirects if desired, but the canonical URL should not break when an entity classification changes. Maintain reviewed slug history on future renames; aliases do not automatically become unique URL redirects.

The preview stays on `/map` and can change from a location to a related person or faction. Opening the full wiki navigates to its canonical route. Preserve the last map camera/filter state in the session, offer a “Haritaya dön” action, and restore it on return. Unmount the GPU scene while reading a full wiki page rather than keeping an invisible renderer alive indefinitely.

Closing a preview removes selection without resetting the map. Browser Back/Forward restores semantic selections and era changes. Closing a direct-linked panel must work even without a prior in-app navigation entry.

**5. Central data-access architecture**

Create a server-only loader and a shared domain module. The loader parses the existing files once per build/server cache scope, validates them, and constructs immutable indexes:

- `entityById`, `entityBySlug`, `factsById`, and alias → set of entity IDs.
- Relationships indexed by subject, object, predicate and period.
- Geographic parent/child indexes from `map_canon.states`, with uncertainty retained.
- Events indexed by ID, episode, period, participant and location.
- Travel indexed by ID, episode and traveler.
- Conflict lookups by ID and source reference, alongside explicit fact/entity conflict links.
- Map-layout anchors indexed by map ID, layout version and location ID when those files exist.

Use the following domain functions as implementation contracts:

| Query | Required behavior |
| --- | --- |
| `getEntity(id)` / `getEntityBySlug(slug)` | Return an entity or a typed not-found result. Apply reviewed ID/slug redirects. |
| `getEntityFacts(id, context)` | Resolve both inline `facts` and shared `fact_ids`; group by dated/undated evidence and review status. |
| `getRelationships(id, context)` | Return incoming and outgoing assertions with direction, period and provenance. |
| `getLocationChildren(id, context)` | Use supported hierarchy for that period; do not guess parents from names. |
| `getPresenceEvidence(locationId, context)` | Distinguish presence, visits, residence, work, remote participation and mentions. |
| `getEntityEraState(id, era)` | Return attested, reported lost, unknown or conflicted, with evidence. |
| `getMapFeatures(mapId, context)` | Return separately placed features, unplaced entities and unavailable/uncertain candidates. |
| `getTimelineEvents(context)` | Return event summaries through `summary_fact_id`, preserving event mode and unknown dates. |
| `getTravelForEpisode(episodeId)` | Preserve record sequence, party branches, partial endpoints and temporal transitions. |
| `getRelatedLore(id)` | Use explicit subject/source links; do not infer relationships from loose word matching. |
| `searchEntities(query, context)` | Return ranked identity results and map availability, never merge fuzzy matches. |

Avoid a function named `getNPCsAtLocation` that returns anyone ever mentioned with a location. The current corpus cannot give a universally reliable “currently here” answer. A panel can accurately show “Burada bulunduğu kaydedilen kişiler” with episode evidence. Multiple historical visits must not turn into simultaneous live NPC positions.

Do not confuse actual schema structures: `npcs.json` is an ID view; a fact has `assertions`; a campus may use `fact_ids`; a timeline summary is stored on the event entity; a travel endpoint can be null but have a descriptive `context_id`; a lore record can have `subject_id: null`.

Build small presentation DTOs: `EntitySummary`, `EntityDetail`, `MapFeature`, `SearchDocument`, `TimelineCard`, `TravelView`. This is derived data, not another manually maintained lore source. Cache keys include dataset version and relevant map-layout version. Components cannot import the full source registry directly.

The initial atlas payload should include a compact entity catalog and only the selected map/era's feature metadata. Fetch detailed entity DTOs from a read-only application endpoint when a preview opens; deduplicate/cancel requests and cache results for the session. Full wiki routes read the domain layer on the server. Client responses carry schema/dataset version and are validated at the boundary. Do not ship `source_coverage.json`, consolidation scripts or the entire QA report in the initial browser bundle.

When Supabase integration begins in D2, preserve the same repository/query interface. JSON remains authoritative for imported structured canon. Supabase is authoritative for separately authored article revisions, media attachments and editor permissions; these are never generated by the episode consolidation script. If core canon is mirrored into PostgreSQL, import validated releases into text-ID tables with explicit foreign keys and JSONB for assertions/facts. Use a stable identity table independent of core release membership so imports cannot cascade-delete articles or images. Activate each core release atomically. Store presentation placements separately from canonical constraints. There is one authoring authority per field/domain, not two editable copies of the same facts.

Add `getEntityPage(id, context)` to combine source facts with the published article and applicable media. Public readers never receive drafts. Article publication/rollback updates server caches and the published search projection without requiring a site redeploy. Keep article revision, core release and map release identifiers distinct. The detailed editing and migration contracts are in the Turkish specification.

**6. Component and layer architecture**

| Area | Main components | Responsibility |
| --- | --- | --- |
| Shared shell | `AppShell`, `PrimaryNavigation`, `GlobalSearchTrigger`, `WorldSessionProvider` | Navigation, persistent serializable session state, shared visual tokens. |
| Explorer | `MapPage`, `WorldExplorer`, `MapViewport`, `MapCameraController` | Compose the map and manage camera commands. |
| Raster | `BaseMapLayer`, `MapAssetLoader`, optional later `RasterTileLayer` | Load/resident-budget artwork and show loading/failure states. |
| Spatial overlays | `RegionLayer`, `PoliticalBoundaryLayer`, `TravelRouteLayer`, `EventLayer` | Render only approved, available features. |
| DOM overlays | `MarkerButtonLayer`, `MapLabelLayer`, `SelectedFeatureRing`, `MarkerTooltip` | Crisp labels, accessible actions and selected state. |
| Map controls | `EraSelector`, `MapLayerControls`, `ZoomControls`, `VisiblePlacesList` | Accessible discovery and layer control. |
| Preview | `EntityPreviewPanel`, `EntityPreviewContent`, `MobileEntitySheet` | One data projection presented as side panel or bottom sheet. |
| Wiki | `WikiLayout`, `EntityWikiPage`, `EntityHeader`, `FactSections`, `RelationshipLinks`, `EpisodeReferences`, `EvidenceDisclosure`, `ReviewNote` | Type-aware, source-driven reading. |
| Editorial | `WikiArticleRenderer`, `WikiEditor`, `EntityLinkPicker`, `RevisionHistory`, `PublishControls`, `MediaPicker`, `EntityGallery` | Structured articles, stable links, draft/public separation and images for every entity type. |
| Discovery | `GlobalSearchDialog`, `SearchResults`, `EntityDirectory` | Ranked search and category browsing. |
| History | `WorldTimeline`, `TimelineEventCard`, `EpisodePage`, `TravelDetails` | Occurrence/revelation distinctions and cross-links. |
| Resilience | `MapFallback`, `UnknownEntity`, `UnavailableMapAction`, `AssetErrorState` | Recoverable, readable failure handling. |

Define a small declarative layer registry containing ID, label key, feature resolver, renderer, drawing order, visibility policy, detail band and default visibility. This is UI configuration; it must not contain lore or hardcoded named entities.

Initial layers: base artwork, placed locations, labels and selected feature. Add hierarchy-based region/kingdom labels and settlement/landmark/temple categories next. Events and travel are opt-in overlays. Political boundaries require reviewed polygon geometry. NPC/faction/dragon layers require explicit spatial evidence; a temple dedicated to a dragon is not the dragon's physical position.

Support large-area anchors separately from polygons. A kingdom can have a label without an invented border. Source containment of a city within a kingdom does not establish the kingdom's exact outline. Institutions can appear through an explicitly linked campus, as Arifler Okulu `ORG-0001` and its site `BLD-0023` demonstrate.

Use stable zoom/detail bands: world → region → settlement → local. A world map need not display every building. A child building without its own approved anchor is listed in its parent's panel; do not place it at the city center. Later city maps get their own coordinate frames and explicit parent-map navigation.

Initially use visible DOM marker buttons, with screen-space label priority and collision suppression. Update projected positions from the camera without setting global React state every frame. Cull offscreen elements. Add screen-space clustering only when density tests require it; retain an accessible list for clustered or hidden labels.

**7. State and deep-link behavior**

| State | Owner | URL policy |
| --- | --- | --- |
| Selected era | Typed route state | `era=1300` or `1600`, resolved through metadata. |
| Selected map | Typed route state | `map=...` when needed, validated against map manifest. |
| Selected preview entity | Typed route state | `entity=...`; stable ID, not display name. |
| Layer/filter selection | Route state | Compact, sorted stable filter IDs; omit defaults. |
| Selected route/event/episode context | Route state | Include when a shared view needs it. |
| Camera center/scale | Camera controller + session store | Normally session-only; explicit “Share this view” serializes normalized viewport parameters. |
| Hover, tooltip, drag state | Local component state | Never in URL. |
| Search draft, highlighted result | Search component state | Only committed `/search?q=...` is shareable. |
| Bottom-sheet snap position | Local/session state | Never in URL. |
| Reduced motion / display preferences | Preference state | Local preference and system settings. |
| Parsed data and indexes | Immutable data layer | Never copied into Zustand as editable state. |

Initialize state with precedence: valid explicit URL → same-map/version session state → map manifest defaults. Create client stores through the provider rather than using a mutable server-wide singleton. Treat parsing as a boundary: clamp finite viewport numbers, validate IDs and filter values, and ignore unsupported parameters with a recoverable message.

Era changes and entity selections create meaningful history entries. Camera motion does not produce dozens of Back steps. Interrupt a running camera flight when the user pans, closes a selection or navigates Back. Keep viewport restoration scoped to map/layout version; a redesigned map must not restore a stale camera into unrelated geography.

**8. Era switching and historical meaning**

Use a compact two-choice selector, initially “1300 civarı” and “1600 civarı”, generated from metadata. Do not create an interpolating year slider: the supplied data does not support continuous historical simulation. Recommend circa 1300 as the initial view because most supplied episodes occur there. The URL always takes precedence over that default.

Separate the era identifier from its localized label and from `map_id`. An era may eventually have a world map, city maps and interior maps; one map could also be reused across eras if its artwork/registration is genuinely compatible.

The era resolver returns one of these states:

| Result | Meaning | Default map behavior |
| --- | --- | --- |
| Attested | Evidence positively supports the entity in this period | May show if a reviewed map anchor exists. |
| Reported lost | Explicit world-state evidence says it is lost/absent | Exclude from ordinary active features; an optional historical-remains view needs its own evidence/placement. |
| Unknown | No applicable positive or negative evidence | Keep accessible in wiki/search and an unplaced/undated list; do not silently assign it to both maps. |
| Conflicted | Applicable evidence disagrees | Display an explanation or an explicitly uncertain feature; do not choose silently. |

Use explicit state evidence, dated assertions, entity attestations and related placement evidence together. Detect contradictory evidence rather than enforcing a simplistic precedence that hides it. A future negative state on a continent must trigger review of descendant placements; it must not fabricate individual destruction dates for every settlement.

For Helvanar `CON-0001`, the supplied world-state records support existence circa 1300 and reported loss circa 1600. The later owner confirmation establishes Helva Adası as another name for the same large landmass; retired `ISL-0002` redirects to `CON-0001`. Implement era behavior and redirects through generic data rules, not hardcoded ID exceptions.

Wiki content is grouped into selected-era claims, explicitly undated claims, and other-period information. Undated information remains readable under “Dönemi belirtilmemiş” rather than being presented as contemporaneous. Fact confidence and entity name confirmation remain separate concepts. The 162 conflicts are resolved to relevant claims using `conflict_ids` and source references; one unrelated conflict must not hide an entire biography.

An era change is a transaction: resolve the target map and content → start asset loading → retain a labeled loading state → commit artwork and corresponding overlays together. Cancel stale requests on rapid switches. Keep only a low-resolution outgoing preview for a crossfade if two full textures would exceed the memory budget.

Retain camera position only when maps share an explicitly registered coordinate frame. Otherwise focus the selected entity if it has a target-era anchor, or use the target map's home view. Keep a selected entity's panel open with an explanation if it is not mapped in the new era. Never jump silently to another entity or another era.

Era selection is contextual browsing, not a guaranteed current-state snapshot within a century. Leadership, deaths and item transfers occur within the circa-1300 episodes. Where those matter, show episode-scoped evidence and event order instead of claiming one permanent owner or ruler for the whole era.

**9. Search architecture**

Build a derived name index from all 411 IDs, canonical names, aliases, types, slugs and availability summaries. Use MiniSearch for prefix matching and restrained typo tolerance, with exact canonical names first, exact aliases next, then prefixes and fuzzy matches. A short query should not produce an uncontrolled set of approximate matches. MiniSearch supports these local-memory search capabilities. [MiniSearch documentation](https://lucaong.github.io/minisearch/).

Normalize Turkish Unicode consistently: retain the original display string; create a Turkish-locale lowercase key and a secondary diacritic/ASCII-folded search key. Test dotted/dotless I explicitly. “Çöl Şehri”, “çöl”, and “col sehri” should find the same entity. “Akmer” should match `NPC-0006` via its alias while displaying the canonical name. Searching “Gümüş Sıçan” must allow both matching people rather than resolving the shared title to one identity.

Global search always covers the universe; selected-era evidence can boost/filter results when explicitly requested, but it must not make a canon-only entity disappear unexpectedly. Show a compact type and era-evidence hint. Selecting a result opens its wiki/preview; a separate “Haritada göster” action appears only when a compatible placement exists. Faction/deity/dragon results may offer evidence-backed related sites, clearly labeled as related sites.

Load the name index on search intent rather than bundling all biographies at startup. Phase E also indexes published article text, with lower ranking than names; source fact text and the 86 standalone lore records can extend that projection. Publication, withdrawal and rollback refresh its version and invalidate stale result caches. Drafts and private media metadata never enter a public index. For the present corpus, a local index is sufficient; a worker is introduced if measured indexing/query time interrupts interaction. Move behind a hosted search adapter only when corpus size or authorization requires it.

The search dialog supports Ctrl/Cmd+K, keyboard results, Enter, Escape, visible focus and result count announcements. The `/search` route works independently of the dialog. Zero results retain the query and offer directory browsing.

**10. Map-coordinate and asset strategy**

Add these presentation files only during implementation after their schema is approved:

| Proposed file | Contents |
| --- | --- |
| `data/map_assets.json` | Immutable asset hashes, image/overview/tile manifests, pixel dimensions, artwork bounds within declared frames and registration metadata. |
| `data/map_frames.json` | Stable world and local frame IDs, versioned parent transforms, fixed local extents and explicit frame compatibility. |
| `data/map_features.json` | Stable feature ID, entity ID, shape geometry revision, frame ID, era applicability and presentation/evidence classification. |
| `data/map_layout.json` | Stable entity/location ID, map ID, layout version, frame-local normalized anchor, label offset, review status and cited canon constraints. |
| `data/map_overlays.json` | Optional reviewed boundary polygons and illustrative route paths, referencing canonical entity/relationship/travel IDs. |
| `data/map_releases.json` | Compatible core release, layout/frame/geometry versions, asset manifest, era maps and activation/rollback history. |
| Derived map coverage report | Inventory-to-feature coverage, missing landforms/anchors and explicit scope/era exceptions; counts are computed from the current registry. |

Existing `map_canon.json` remains canonical constraints only. Extend the build workflow explicitly so it preserves these separately authored presentation files and validates their cross-references. They must not be generated by guessing from lore.

Keep a stable world frame in arbitrary visual units, independent of the overall artwork's pixel dimensions or changing canvas bounds. Give each island/continent a stable local frame; use normalized `u,v` in `[0,1]` relative to that frame, with origin at its declared top-left. `u` increases right and `v` increases downward. Store one authoritative anchor as frame ID plus local position; derive world/screen positions. Do not store independently editable world and local positions. Track label offsets in screen pixels separately from anchors.

For a declared local frame with fixed width W and height H, convert `Xlocal=(u−0.5)W`, `Zlocal=(v−0.5)H`, then apply its registered parent transform to reach world space. W/H are frame properties, not recalculated from every replacement image. Artwork has an explicit transform/bounds within its frame. Elevation is zero initially. The camera looks down with north/up orientation declared by the map. World units are visual units, not canon kilometers. Test frame corners and a center reference through local → world → screen → world round trips, including nested frames.

A location placement record should carry `location_id`, `map_id`, `position`, `coordinate_frame_id`, `layout_version`, `placement_source: PRESENTATION`, `canon_basis`, `constraint_relationship_ids`, and `review_status`. The actual Çöl Şehri ID is `CIT-0006`; its position remains unassigned until artwork review. No numerical coordinates are proposed in this document.

`canon_basis: CANON_CONSTRAINED` describes the evidence used to guide a creative placement. It does not turn the resulting coordinate into canon. Unknown-placement draft records may exist with null position and `review_status: unplaced`; only reviewed finite coordinates can render as ordinary markers.

Expanding the ocean/camera bounds or adding another island frame must not renormalize existing anchors. Moving an island intentionally changes its versioned frame transform and carries its attached settlements with it. Visual frame parenting is separate from canonical geographic containment; do not invent a kingdom or continent parent just to attach a marker. Resizing/re-encoding an image without changing framing preserves anchors. Cropping or redrawing requires a new asset/geometry/layout revision and reviewed registration or anchor migration; create a new frame identity only when the coordinate contract becomes incompatible. Do not reuse placements merely because an image has the same dimensions. Different-era maps can share a frame only through explicit registration.

Phase B produces one distinct presentation landform per known island and continent across the inventory: currently 4 islands and 2 continents after the owner-confirmed Helva Adası/Helvanar merge. Two islands have unknown era evidence, so complete inventory coverage is demonstrated in an explicitly labeled cartographic draft/undated overview, not by asserting all six landforms coexist in both eras. Era views apply the evidence rules in section 8. Every future island added to the registry creates a coverage requirement for a separate shape; ten island markers over fewer shapes do not pass. Settlements, districts and buildings use appropriate markers, areas or local maps instead of all becoming landmasses. Initial contours and unsupported relative positions are creative presentation, visibly distinguished from canonical constraints. Review the shape inventory before final illustration; artwork must follow it.

Core and map releases are staged, validated and activated through a coherent release manifest. New episodes do not reset layout, articles or media. Preserve identity tombstones and reviewed redirects on retirement/merge; preserve old revisions and immutable assets for rollback. A migration must preview added/moved/removed features, verify unchanged anchors and links, and support restoring the previous map release. Public article edits use independent revision pointers and do not require republishing the map. Details and acceptance scenarios are in the Turkish specification.

Validate containment constraints where useful, but do not pretend every constraint can be checked geometrically before polygons exist. The two BETWEEN edges for Gizemler Adası describe a paired relation to Revania and Vhelin; interpret that pair together rather than drawing two independent one-target “between” relationships. Travel route curves are illustrative and must cite travel IDs. They do not establish exact roads or distances.

Store optional future GLB anchors in this same presentation layer, with map-specific visual transforms. Draco/KTX2 assets and any height data remain presentation assets. They never overwrite entity facts or source-supported geography.

**11. Reading, timeline, travel, responsiveness and visual behavior**

The desktop atlas occupies the primary viewport. A quiet top navigation, an era selector, compact layer controls and a restrained information panel support the art. Use original map artwork, muted ink/stone surfaces, one controlled accent color, and a display serif paired with a highly readable body face that covers Turkish characters. Lore paragraphs should not sit directly on busy artwork. Avoid decorative textures that reduce contrast.

Opening Çöl Şehri `CIT-0006` resolves the actual source-backed parent `KNG-0008`, its districts, available facts, linked places, episode references and evidenced people through queries. Do not put those names in a component constant. Show only sections with content. Resolve campus shared facts, and keep institution membership distinct from physical buildings.

Biographies do not yet have neatly tagged occupation/personality/architecture fields. Start with evidence-aware facts and relation-driven sections, then add an editable article body in D2. Editors can write headings, paragraphs, lists, tables and internal links, add portraits/covers/galleries, save drafts, preview, publish and restore revisions. New episode imports preserve this writing. Source-derived infoboxes and facts remain independently traceable; editing prose does not automatically change canonical relationships or dates. Do not automatically invent biographies for empty pages. Public wiki pages render article content on the server and load neither the rich-text editor nor R3F for ordinary reading.

Turkish is mandatory throughout the public site and editor: navigation, type labels, buttons, dialogs, validation errors, authentication messages, captions, accessible names and empty states. Set document language to `tr`, format and sort with `tr-TR`, preserve canonical Turkish spelling, and test `I/İ/ı/i`. Internal IDs/enums and URL path tokens may remain technical; render human-readable Turkish labels. There is no English fallback UI in the first release.

Use “İlk kaynak kaydı” for the current `first_appearance` semantics, not “first seen on screen”. Episode pages can show recorded references and actual event/travel evidence separately. Episode video links and timestamps must wait for supplied/verified metadata; titles alone are insufficient to create accurate playback links.

The timeline defaults to episode/narrative order within an era, with separately labeled undated historical/revelation entries. Exact event dates are largely absent. Do not distribute events evenly on a calendar axis or infer within-episode order from EVT numbering. A world-history view can group eras and unknown-date history, but cannot imply precise years. Every event connects to its event entity, participants, places and source episode.

Travel has an episode selector, route details and optional map overlay. Draw only segments whose endpoints can be transformed into the same declared map/world frame; endpoints on different islands can use their registered local-to-world transforms. If an intermediate waypoint is unknown, break the path; an optional dashed connector must be labeled “şematik bağlantı”, never an exact route. Context anchors can focus the broader location but cannot establish an exact room position. Avoid zero-length loops when several rooms share one parent site. In-progress routes remain in progress, EP22 branches remain separate, and EP07's time transition is a portal/era connection rather than a line across two unrelated artworks.

On laptops, allow the side panel to overlay the map when width is limited. On tablets/mobile, use a bottom sheet with compact and reading states. At the compact state, map movement is still available; when the reading sheet is modal, manage focus appropriately and prevent the background map from capturing scrolling. Closing restores focus to the marker/list item. Sheet size, browser chrome and safe-area insets must not hide controls.

Provide a semantic list of visible/available locations and keyboard zoom/reset controls. Markers are real buttons with accessible names; tooltips repeat rather than exclusively hold essential information. Do not require hover or drag for navigation. Use visible focus, sufficient contrast, approximately 44px primary touch targets, reduced-motion alternatives and screen-reader announcements for selection/loading. A canvas failure leaves the directory, wiki, search and event/travel details usable.

**12. Phased roadmap and acceptance criteria**

Each phase is a reviewable increment, and each reuses the same domain rules. Accessibility and correctness begin immediately; the last phases are not a place to postpone them.

| Phase | Working increment | Concrete acceptance criteria |
| --- | --- | --- |
| **A — Application foundation and domain layer** | Next.js/TypeScript/Tailwind scaffold, Turkish UI foundation, data adapters, schema integration, editorial/media contracts, basic directory and diagnostic map state | Existing Python QA still passes. All 411 IDs and existing slugs resolve through the central layer; all core references validate. Campus `BLD-0023` resolves its shared facts. A malformed fixture fails with file and pointer. Canon-only and undated records render honestly. No source IDs/slugs are changed. Turkish labels, `tr` document language and Turkish search/sort primitives work. Core/editorial/presentation ownership is explicit. App starts without cloud credentials. `/map` explains missing artwork and links to the working directory. |
| **B — Map surface, landform inventory and coordinate contract** | R3F viewport, camera controls, versioned frames/features, calibration surface and a location-driven geographic draft | Pan/zoom/reset work by mouse, touch and keyboard. Rotation is locked. Transform round trips are within 1 CSS pixel at tested zooms. Inventory draft has 4 distinct island shapes and 2 continent shapes linked to the current IDs; unknown eras are labeled rather than assigned to both periods. Counts derive from data. Expanding bounds leaves existing anchors unchanged. Fit view respects panel padding. Unsupported textures/context loss have useful fallbacks. Draft geography is explicitly presentation. Benchmark approved art before high-resolution streaming. |
| **C — Mapped locations and previews** | Reviewed starter placements, location categories, labels, selected state and responsive preview | Every displayed marker resolves by stable ID to the correct entity. Clicking placed `CIT-0006` shows Çöl Şehri and its source-backed kingdom when that placement has been approved. Unplaced locations remain discoverable without a fake coordinate. Closing/reopening preserves view. Dragging does not trigger clicks. Deep-linked selection and browser history work. Markers and panel controls are keyboard accessible. |
| **D1 — Full interconnected wiki and episodes** | All-type entity pages, relationship navigation, evidence, episode pages and standalone lore | Every entity has a canonical page, including creatures, plants, ships and OTHER. Incoming/outgoing links retain meaning; using an item is not displayed as ownership. Sparse canon-only pages do not contain invented details. Event summaries and campus shared facts resolve. Every internal entity/episode/lore link is valid. Return-to-map restores session view. Wiki reading downloads neither R3F nor the editor bundle. |
| **D2 — Wiki writing, photographs and publishing** | Supabase Auth/PostgreSQL/Storage, Turkish Tiptap editor, drafts, entity links, image upload/gallery, preview, publish and revision history | An authorized editor creates, saves, reopens and publishes an article with an image and an ID-backed link. Visitors see only published content; direct unauthorized writes and private draft reads fail. Concurrent saves detect revision conflicts. Rollback creates a new published revision. Images have Turkish alt text and credits; galleries work for NPCs, items and locations. A core reimport preserves article revisions and media links. Publishing updates the page without redeployment. Original assets and editorial metadata can be exported. |
| **E — Global search and scalable filters** | Search dialog/results, published article text and declarative map layers | “Akmer”, “Pastırman”, “Helvanar”, “Çöl Şehri”, “col sehri” and “Karapancar” find their actual IDs. Shared alias searches return multiple identities. Unknown-era entities stay searchable. Published article text becomes searchable; drafts do not. Withdrawal/rollback refreshes the public index. Filters restore from a shared URL. No-coordinate results open wiki instead of a placeholder point. Keyboard search selection works. |
| **F — Complete era experience** | Era selector, target-map loading, context-aware previews/wiki/articles/media and state transitions | Helvanar / Helva Adası is attested in **Gümüş Tanrısının 1673 yılı** and reported lost in **Günümüz** from generic state data. Retired `ISL-0002` resolves to `CON-0001`. Null-period facts, article blocks and images are not assigned to both eras. An entity without target-era placement keeps an explanatory panel. Rapid switches cannot display old markers on new artwork. Camera restoration respects frame compatibility. An era with no approved art gets an honest unavailable-art view. |
| **G — Timeline and travel overlays** | Timeline/event linking, episode travel browsing, partial route drawing | All 90 timeline entries are accessible with their four event modes. All 56 travel records remain accessible; only supported mapped segments are drawn. EP01 is not treated as arrived; EP07 changes eras; EP22 has four separate first-route branches. Unresolved intermediate points break or clearly qualify paths. Clicking a route/event returns its correct episode, participants and linked wiki entities. |
| **H — Visual finish and asset optimization** | Approved inventory-matched art, refined typography/labels, transition timing, mobile treatment, image variants, quality tiers and optional tiles | Map → preview → wiki → return and editor/media journeys work at 360px, tablet and desktop widths. All required landforms have reviewed shapes; no island disappears under the final illustration. Unknown-era coverage remains explicit. Reduced motion works. Turkish text and focus states remain readable. Agreed device tests meet the budgets below. Repeated era switches do not grow resident textures. No large source/QA JSON or editor bundle is in the initial map payload. |
| **I — Release, updates and recovery** | GitHub/Vercel setup, production Supabase configuration, import/map migrations, backup and rollback rehearsals | Typecheck, schema/domain and browser checks pass. Core import matches JSON counts/version. Readers cannot write; editor permissions are enforced server-side and with RLS; no privileged key enters the client. A synthetic new-island release preserves existing anchors, article revisions, images and deep links, and can be rolled back. Database plus Storage restoration is demonstrated. Map release activation never mixes incompatible assets/frames/data. Deployment smoke checks pass before public launch. |

Era parameters and uncertainty contracts are implemented in **A**, although the complete visual switching experience arrives in **F**. Mobile and keyboard interactions start in **B/C**, with design refinement in **H**. This avoids rebuilding a single-era, mouse-only implementation later.

Phase B must cover the complete known island/continent inventory in its labeled draft. Phase C may begin with a reviewed settlement/landmark subset; all current 85 locations need an explicit coverage state, but unknown positions need not be invented. Wiki work can proceed while final artwork is prepared. No development fixture is promoted into canonical geography. D2 is required for the requested editable wiki, even though A through D1 can run without cloud services.

For each phase, finish its acceptance checks and show the working increment. Continue within the scope the user has already authorized; do not repeatedly ask for the same permission. If the user authorizes only Phase A, complete A and report before starting B. Plan approval starts A unless the user specifies a different scope; it does not silently authorize public deployment. Use the Luna guide's A1–A6 steps and progress record to resume rather than restarting a phase.

**13. Validation, error handling, performance and technical risks**

Keep the existing Python validator for source coverage and semantic regressions. Add Ajv's draft-2020-12 validator for the core schemas and for new DTO/layout contracts. The existing schema contains a `fileSchemas` catalog annotation and `$defs`; compile the per-file definition with its referenced definitions, registering/removing the catalog annotation as appropriate rather than disabling strict validation globally. Several auxiliary files lack published record schemas today; add those contracts in Phase A before the application relies on them. [Ajv JSON Schema versions](https://ajv.js.org/json-schema.html).

Build validation fails on malformed JSON, broken IDs, invalid slugs, invalid placements or incompatible schema versions. Open lore conflicts remain warnings, not a reason to demand zero uncertainty. Runtime validation of URL parameters and fetched DTOs produces local recoverable failures rather than blank pages. Do not rerun corpus validation on every camera frame or every React render.

| Failure or missing information | User-facing behavior |
| --- | --- |
| Unknown entity/slug | Genuine not-found page with search and directory links. |
| Known entity without coordinate | Wiki/preview works; “Haritada konumu henüz belirlenmedi.” |
| Related site exists but exact anchor does not | Offer “İlgili bölgeyi göster”, explicitly distinguish it from the exact entity position. |
| No target-era evidence | Explain that the period is unknown; retain access to undated/reference information. |
| Unresolved relation or conflicting fact | Show a concise claim-level note and optional evidence details. |
| Invalid reference introduced during a release | Fail validation; at runtime isolate that relation and log a structured diagnostic. |
| Artwork missing or failed | Keep controls/navigation and location list usable; retry asset loading. |
| WebGL unavailable/context lost | Static overview if available plus accessible location directory and wiki. |
| Unsupported map or extreme URL viewport | Use validated defaults and explain an unavailable target without crashing. |

Performance targets are acceptance budgets to measure, not claims about an application that exists yet:

- Initial catalog/feature metadata target: at most 200 KB compressed, excluding artwork and route-specific details.
- Initial usable map overview target: at most 1.5 MB transferred; full-resolution detail arrives later.
- Warm name-search target: p95 below 50 ms on the agreed reference mobile device.
- Interaction target on the agreed desktop: approximately 60 fps during ordinary pan/zoom, p95 frame time below 20 ms. On the reference mobile device, sustained 30 fps with p95 below 33 ms at the reduced quality tier.
- Representative cold-load target: usable shell/overview within 3 seconds under the agreed throttled test profile; report actual asset sizes and measured conditions.
- Start with a 128 MB budget for resident map textures on the mobile tier; this excludes browser/render-target overhead, which must also be profiled. A 4096² RGBA texture is approximately 64 MiB before mipmaps and roughly 85 MiB with a full mip chain. Two simultaneous high-resolution era textures can exceed a practical budget despite small compressed downloads.
- Demand rendering while idle, capped DPR and no continuous decorative animation by default. Explicitly invalidate during camera animation or asset/selection changes. R3F supports demand rendering for this purpose. [R3F performance guidance](https://r3f.docs.pmnd.rs/advanced/scaling-performance).
- Benchmark with the real 83-location catalog and a separate synthetic 1,000-marker stress fixture. Synthetic records never enter `/data/entities.json`. Cap mounted labels by visibility/detail; cluster only when needed. No algorithm should scan all relationships on every frame.
- Lazy-load R3F only on map routes, overview/detail images by need, search on intent, and GLBs on interaction. Dispose replaced GPU resources and cancel abandoned fetches. Use hashed asset URLs and immutable caching.

| Principal risk | Mitigation |
| --- | --- |
| Unknown era evidence mistaken for complete history | Shared explicit era-result states and undated sections; episode-based qualification. |
| High-resolution illustration exceeds GPU limits | Overview-first loading, per-device budgets, early renderer benchmark and tiles when required. |
| R3F costs outweigh future 3D benefits | Revisit at Phase B before broad layer investment; OpenSeadragon remains the identified image-first alternative. |
| Art is redrawn after placement | Versioned coordinate frames; no automatic anchor reuse across changed geography. |
| Canon-only entities create apparent dead ends | Honest sparse pages, type directory and available source links; no invented relationships. |
| Imports erase manually written wiki pages | Keep articles/revisions/media outside generated core data; verify preservation on every import. |
| Editors overwrite each other's drafts | Optimistic revision checks, recoverable conflicts, autosave status and immutable history. |
| Public search or images expose drafts | Server authorization, RLS, private draft storage and published-only projections. |
| New islands require redrawing/repositioning the entire world | Inventory-linked modular shapes, fixed local frames, versioned transforms and tested release rollback. |
| NPC routes/temples imply live positions | Evidence-kind aware marker resolvers; no location inference from mentions or worship. |
| Historical ownership/leadership looks simultaneous | Episode-aware assertions and events; do not claim a universal “current” state for an era. |
| 162 open conflicts overwhelm the interface | Concise relevant claim-level disclosure; full editorial QA stays outside the main atlas. |
| A spoiler filter leaks future identity revelations | Default to a clearly spoiler-containing atlas. Do not advertise episode-safe mode until aliases, identities and claims support it. |
| Supabase and JSON drift | One-way core import; separate editorial ownership; compatible releases and recoverable exports. |
| Canvas prevents access on small/assistive devices | Semantic DOM markers, list navigation, focus-managed sheet and non-WebGL fallback. |

**14. Decisions before implementation**

The following defaults make approval actionable. They are recommendations, not new canon facts:

| Decision | Recommended default | Needed when |
| --- | --- | --- |
| Renderer | R3F flat illustrated atlas initially; retain selective 3D path | Plan approval / before B. |
| Initial era | 1300 civarı, with URL overrides | A. |
| UI language | Turkish throughout public pages and editor; required by the owner | A onward. |
| Wiki routing | One `/wiki/[slug]` route plus stable `/entity/[id]` resolver | A. |
| Content authority | JSON for structured canon; Supabase for authored articles/media; separate versioned presentation files | Contracts in A; persistence in D2. |
| Wiki permissions | Owner and invited editors; public read-only. Clarification requested; this remains the planning default unless changed | Before D2 permissions are implemented. |
| Spoilers | Full-canon atlas with clear spoiler notice; no claimed spoiler-safe cutoff | Before public content review. |
| Uncertainty | Undated claims separately labeled; unknown-era placements excluded from ordinary era markers | A. |
| Map artwork | Distinct draft shapes for all known islands/continents, then original reviewed illustration matching that inventory; dynamic labels | Draft in B, final art in H. |
| Placements | Presentation-only local-frame anchors, full coverage report and explicit unknown states | Contracts in B, placements in C. |
| Device support | Modern evergreen browsers, responsive mobile and explicit no-WebGL fallback; choose concrete test devices | B. |
| Cloud access | None for A–D1; Supabase for persistent editing/media in D2; GitHub/Vercel for hosting in I | D2 and I. |

The asset direction and renderer are the most consequential product choices. Region boundaries, city inset maps, optional GLBs, audio atmosphere, advanced clustering and a full network-graph visualization can be decided after the core exploration loop is working. Cross-linked wiki browsing is required; a force-directed graph view is optional.

For later integration, use the access list in [SETUP_REQUIREMENTS.md](/Users/arascoban/Desktop/Ejder/SETUP_REQUIREMENTS.md). No keys are needed to approve this plan or begin Phase A.

**15. First implementation phase and proposed workspace organization**

Implement **Phase A first**. Its deliverable is a runnable application with validated access to the existing registry, a usable basic entity directory, stable identity routing, and explicit empty-map handling. It establishes the contracts that every subsequent feature depends on. Do not start by building a cinematic map over a hardcoded sample database.

The proposed new application structure is shown below for planning only; these files do not exist yet:

```text
src/
  app/                  Next.js routes and layouts
  components/
    shell/              shared navigation and layout
    map/                renderer, camera, overlays and controls
    entity/             previews, wiki sections and relationships
    editorial/          rich-text editor, publication, revisions and media controls
    search/             dialog and results
    history/            timeline, episode and travel views
    ui/                 accessible project-styled primitives
  lib/
    data/               server-only loaders, validation and indexes
    domain/             identity, eras, presence, geography and query rules
    presentation/       map transforms, feature projection and asset contracts
    editorial/          article repository, authorization, publication and revision rules
    media/              upload validation, asset variants and entity attachments
    search/             derived indexing and Turkish query normalization
    routing/            validated URL and redirect helpers
    state/              provider-scoped session store
  styles/               visual tokens and global styles
public/
  maps/                 approved overviews/art and optional later tiles
scripts/
  existing Python tools retained
  future validation/build projection tools
tests/
  domain/               semantic regression tests
  e2e/                  exploration and accessibility journeys
data/
  existing canon-derived JSON retained
  future presentation files added under separate schemas
```

Phase A's first review should demonstrate the real records for Çöl Şehri `CIT-0006`, Akmer `NPC-0006`, the institution/campus pair, undated Helva Adası and the Helvanar world-state evidence. These are acceptance fixtures from the database, not special-case production logic.

Plan approval is the point to begin implementation. Until then, the workspace remains data and planning documents only.

**16. Luna Max execution and manual Astra problem records**

The implementation owner is GPT-5.6 Luna with the user's Max setting. Technical English in this plan is intentional; the Turkish guide defines read order, phase boundaries and the first-phase checklist. User-facing application text remains Turkish. Alternative renderer comparisons are decision context, not instructions to install multiple renderers.

The owner's latest instruction replaces automatic Astra consultation with a manual workflow. Luna must record unresolved work in [ASTRA_SORUN_KAYITLARI.md](/Users/arascoban/Desktop/Ejder/ASTRA_SORUN_KAYITLARI.md); the owner copies the relevant self-contained packet into Astra. Do not automatically call an adviser, send messages, transfer the project or switch models.

Create an open record at the first failed correction. If the second evidence-based correction also fails, mark it as awaiting manual consultation before a third speculative fix. Material technical uncertainty or an external blocker is recorded immediately without manufacturing two attempts. Preserve the stable problem ID and attempt history across sessions. Missing access, incomplete work and blocked acceptance criteria must be recorded honestly, not omitted from completion reports.

Each record includes the active phase, intended outcome, actual behavior/error, reproducible steps, relevant versions, file paths plus necessary code/schema excerpts, attempted fixes and observed results, applicable constraints, affected work and one precise question. The copyable packet must make sense without access to the prior conversation or local repository. Omit secrets and unrelated project material. The log provides the record template and status vocabulary.

When the owner returns Astra's answer, Luna records, evaluates, applies and verifies the scoped recommendation. Only successful verification resolves a problem; retain resolved records and their history. If unsuccessful, update the same packet with new evidence for another manual consultation. While awaiting input, continue only independent authorized work; do not bypass the blocked criterion or rewrite the project.

During implementation, `IMPLEMENTATION_STATUS.md` records authorized scope, active step, completed checks and next action, linking to problem IDs instead of duplicating their detail. The technical issue log remains separate from canonical lore conflicts in `data/unresolved_conflicts.json`. The full workflow is in [LUNA_UYGULAMA_REHBERI.md](/Users/arascoban/Desktop/Ejder/LUNA_UYGULAMA_REHBERI.md).
