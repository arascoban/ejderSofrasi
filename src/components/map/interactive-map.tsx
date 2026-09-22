"use client";

import {
  Component,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ErrorInfo,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import type { Route } from "next";
import { usePathname, useSearchParams } from "next/navigation";
import { Canvas, useThree } from "@react-three/fiber";
import { CameraControls, Html } from "@react-three/drei";
import CameraControlsImpl from "camera-controls";
import { Box3, DoubleSide, OrthographicCamera, Shape, ShapeGeometry, Vector3 } from "three";

import { periodLabel, periodLabels, relationLabel } from "@/lib/domain/labels";
import type { MapInventoryRelease, MapLandform, MapLocationMarker } from "@/lib/presentation/contracts";
import { IsolatedScene } from "./isolated-scene";

type AtlasView = "inventory" | "silver-god-1673" | "present";

interface CameraAdapter {
  pan: (horizontal: number, vertical: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
  restore: (snapshot: CameraSnapshot) => void;
}

interface CameraSnapshot { targetX: number; targetZ: number; zoom: number }

class MapErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Harita yüzeyi oluşturulamadı", error, info.componentStack);
  }

  render() {
    if (this.state.failed) return <MapFallback message="Harita yüzeyi bu tarayıcıda açılamadı. Konum listesi kullanılabilir durumda." />;
    return this.props.children;
  }
}

function MapFallback({ message }: { message: string }) {
  return (
    <div className="atlas-fallback" role="status">
      <span aria-hidden="true">◇</span>
      <p>{message}</p>
    </div>
  );
}

function LandformMesh({ landform, onSelect }: { landform: MapLandform; onSelect: (entityId: string) => void }) {
  const geometry = useMemo(() => {
    const [first, ...rest] = landform.worldPoints;
    const shape = new Shape();
    shape.moveTo(first[0], -first[1]);
    for (const [x, z] of rest) shape.lineTo(x, -z);
    shape.closePath();
    return new ShapeGeometry(shape);
  }, [landform]);

  useEffect(() => () => geometry.dispose(), [geometry]);
  const color = landform.entityType === "CONTINENT" ? "#8d7546" : "#a89058";
  return (
    <group>
      <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.22, 0]}>
        <meshBasicMaterial color={color} side={DoubleSide} />
      </mesh>
      <lineSegments rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.3, 0]}>
        <edgesGeometry args={[geometry]} />
        <lineBasicMaterial color="#52745c" />
      </lineSegments>
      <Html position={[landform.worldCenter[0], 0.7, landform.worldCenter[1]]} center zIndexRange={[20, 0]}>
        <button
          type="button"
          className="landform-label"
          data-map-marker-id={landform.entityId}
          aria-label={`${landform.name}, ${landform.preview.typeLabel}`}
          onClick={() => onSelect(landform.entityId)}
        >
          <strong>{landform.name}</strong>
          <span>{landform.periodStatus === "unknown" ? "Dönemi bilinmiyor" : periodLabels(landform.periods)}</span>
        </button>
      </Html>
    </group>
  );
}

function MarkerButton({
  marker,
  selected,
  onSelect,
}: {
  marker: MapLocationMarker;
  selected: boolean;
  onSelect: (entityId: string) => void;
}) {
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const dragged = useRef(false);

  function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
    pointerStart.current = { x: event.clientX, y: event.clientY };
    dragged.current = false;
  }

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (!pointerStart.current) return;
    const distance = Math.hypot(event.clientX - pointerStart.current.x, event.clientY - pointerStart.current.y);
    if (distance > 6) dragged.current = true;
  }

  return (
    <Html position={[marker.worldPosition[0], 1.2, marker.worldPosition[1]]} center zIndexRange={[40, 21]}>
      <button
        type="button"
        className="map-marker"
        data-selected={selected}
        data-map-marker-id={marker.entityId}
        aria-pressed={selected}
        aria-label={`${marker.preview.name}, ${marker.preview.typeLabel}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerCancel={() => { pointerStart.current = null; }}
        onClick={(event) => {
          pointerStart.current = null;
          if (dragged.current) {
            event.preventDefault();
            return;
          }
          onSelect(marker.entityId);
        }}
      >
        <span className="map-marker__dot" aria-hidden="true" />
        <span className="map-marker__label">{marker.preview.name}</span>
      </button>
    </Html>
  );
}

function AtlasScene({
  landforms,
  markers,
  selectedEntityId,
  onSelect,
  onReady,
  onCameraSettled,
}: {
  landforms: MapLandform[];
  markers: MapLocationMarker[];
  selectedEntityId: string | null;
  onSelect: (entityId: string) => void;
  onReady: (adapter: CameraAdapter) => void;
  onCameraSettled: (snapshot: CameraSnapshot) => void;
}) {
  const controlsRef = useRef<CameraControlsImpl>(null);
  const camera = useThree((state) => state.camera) as OrthographicCamera;
  const invalidate = useThree((state) => state.invalidate);
  const viewportSize = useThree((state) => state.size);
  const visibleBounds = useMemo(
    () => new Box3().setFromPoints(landforms.flatMap((landform) => landform.worldPoints.map(([x, z]) => new Vector3(x, 0, z)))),
    [landforms],
  );

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    controls.mouseButtons.left = CameraControlsImpl.ACTION.TRUCK;
    controls.mouseButtons.right = CameraControlsImpl.ACTION.NONE;
    controls.mouseButtons.middle = CameraControlsImpl.ACTION.ZOOM;
    controls.mouseButtons.wheel = CameraControlsImpl.ACTION.ZOOM;
    controls.touches.one = CameraControlsImpl.ACTION.TOUCH_TRUCK;
    controls.touches.two = CameraControlsImpl.ACTION.TOUCH_ZOOM_TRUCK;
    const center = visibleBounds.getCenter(new Vector3());
    const dimensions = visibleBounds.getSize(new Vector3());
    const fitZoom = Math.min(viewportSize.width / (dimensions.x + 12), viewportSize.height / (dimensions.z + 10));
    void controls
      .setLookAt(center.x, 100, center.z, center.x, 0, center.z, false)
      .then(() => controls.zoomTo(Math.max(1.8, Math.min(18, fitZoom)), false))
      .then(() => {
        controls.saveState();
        invalidate();
      });
    onReady({
      pan: (horizontal, vertical) => void controls.truck(horizontal, vertical, true),
      zoomIn: () => void controls.zoomTo(Math.min(camera.zoom * 1.3, 18), true),
      zoomOut: () => void controls.zoomTo(Math.max(camera.zoom / 1.3, 1.8), true),
      reset: () => void controls.reset(true),
      restore: (snapshot) => {
        void controls
          .setLookAt(snapshot.targetX, 100, snapshot.targetZ, snapshot.targetX, 0, snapshot.targetZ, false)
          .then(() => controls.zoomTo(snapshot.zoom, false))
          .then(() => invalidate());
      },
    });
  }, [camera, invalidate, onReady, viewportSize, visibleBounds]);

  return (
    <>
      <color attach="background" args={["#071210"]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[230, 160]} />
        <meshBasicMaterial color="#0b2524" />
      </mesh>
      <gridHelper args={[220, 22, "#1f4740", "#13322e"]} position={[0, 0, 0]} />
      {landforms.map((landform) => <LandformMesh key={landform.featureId} landform={landform} onSelect={onSelect} />)}
      {markers.map((marker) => (
        <MarkerButton key={marker.placementId} marker={marker} selected={marker.entityId === selectedEntityId} onSelect={onSelect} />
      ))}
      <CameraControls
        ref={controlsRef}
        makeDefault
        minZoom={1.8}
        maxZoom={18}
        minPolarAngle={0}
        maxPolarAngle={0}
        minAzimuthAngle={0}
        maxAzimuthAngle={0}
        smoothTime={0.35}
        onControlEnd={() => {
          const controls = controlsRef.current;
          if (!controls) return;
          const target = controls.getTarget(new Vector3());
          onCameraSettled({ targetX: target.x, targetZ: target.z, zoom: camera.zoom });
        }}
      />
    </>
  );
}

function EntityPreviewPanel({
  location,
  visibleInEra,
  period,
  wikiHref,
  onClose,
}: {
  location: MapLocationMarker | MapLandform;
  visibleInEra: boolean;
  period: "1300 civarı" | "1600 civarı" | null;
  wikiHref: Route;
  onClose: () => void;
}) {
  const preview = location.preview;
  const eraState = period ? preview.eraStates[period] : undefined;
  const eraStateMessage = eraState?.state === "reported_lost"
    ? "Bu varlığın seçili dönemde kayıp olduğu bildiriliyor."
    : eraState?.state === "conflicted"
      ? "Bu dönem için çelişkili kayıt var; harita görünümü kesin kabul edilmemeli."
      : eraState?.state === "unknown"
        ? "Bu dönem için kaynakta varlık kanıtı bulunmuyor."
        : null;
  const placementNote = "placementNote" in location
    ? location.placementNote
    : "Kara şekli sunum verisidir; kanonik koordinat iddiası taşımaz.";
  return (
    <aside className="entity-preview-panel" aria-labelledby="map-preview-title">
      <div className="entity-preview-panel__header">
        <div>
          <p className="eyebrow">{preview.typeLabel} · {preview.entityId}</p>
          <h2 id="map-preview-title">{preview.name}</h2>
        </div>
        <button type="button" className="preview-close" onClick={onClose} aria-label={`${preview.name} bilgi panelini kapat`}>×</button>
      </div>
      {!visibleInEra && <p className="preview-era-note">Bu konum seçili dönem görünümünde haritada gösterilmiyor.</p>}
      {eraStateMessage && <p className="preview-era-note">{eraStateMessage}</p>}
      <dl className="preview-facts">
        <div><dt>Dönem</dt><dd>{periodLabels(preview.periods)}</dd></div>
        {preview.aliases.length > 0 && <div><dt>Diğer adları</dt><dd>{preview.aliases.join(" · ")}</dd></div>}
        {preview.context.map((item) => (
          <div key={`${item.relation}-${item.id}`}>
            <dt>{relationLabel(item.relation)}</dt>
            <dd><Link href={`/wiki/${item.slug}`}>{item.name}</Link></dd>
          </div>
        ))}
      </dl>
      {preview.facts.length > 0 && (
        <section className="preview-section">
          <h3>Hakkında</h3>
          {preview.facts.slice(0, 3).map((fact) => <p key={fact}>{fact}</p>)}
        </section>
      )}
      {preview.relatedLocations.length > 0 && (
        <section className="preview-section">
          <h3>Bağlı yerler</h3>
          <ul>
            {preview.relatedLocations.slice(0, 8).map((item) => (
              <li key={`${item.relation}-${item.id}`}><Link href={`/wiki/${item.slug}`}>{item.name}</Link></li>
            ))}
          </ul>
        </section>
      )}
      <section className="preview-section">
        <h3>Bölümler</h3>
        <p>{preview.episodes.length ? preview.episodes.join(" · ") : "Bölüm bağlantısı yok"}</p>
      </section>
      <p className="preview-placement-note"><strong>Harita konumu:</strong> {placementNote}</p>
      <Link className="button button--primary preview-wiki-link" href={wikiHref}>Tam wiki sayfasını aç</Link>
    </aside>
  );
}

export function InteractiveMap({ release }: { release: MapInventoryRelease }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const era = searchParams.get("era");
  const view: AtlasView = era === "silver-god-1673" || era === "1300"
    ? "silver-god-1673"
    : era === "present" || era === "1600"
      ? "present"
      : "inventory";
  const selectedEntityId = searchParams.get("entity");
  const selectedMarker = release.markers.find((marker) => marker.entityId === selectedEntityId) ?? null;
  const selectedLandform = release.landforms.find((landform) => landform.entityId === selectedEntityId) ?? null;
  const selectedLocation = selectedMarker ?? selectedLandform;
  const previousSelectedId = useRef<string | null>(selectedEntityId);
  const lastTriggerId = useRef<string | null>(null);
  const [webgl, setWebgl] = useState<"checking" | "available" | "unavailable">("checking");
  const [camera, setCamera] = useState<CameraAdapter | null>(null);
  const cameraStorageKey = `ejder-map-camera:${release.mapId}:${view}`;
  const onCameraReady = useCallback((adapter: CameraAdapter) => {
    setCamera(() => adapter);
    try {
      const stored = window.sessionStorage.getItem(cameraStorageKey);
      if (!stored) return;
      const snapshot = JSON.parse(stored) as CameraSnapshot;
      if ([snapshot.targetX, snapshot.targetZ, snapshot.zoom].every(Number.isFinite)) {
        adapter.restore({ ...snapshot, zoom: Math.max(1.8, Math.min(18, snapshot.zoom)) });
      }
    } catch {
      window.sessionStorage.removeItem(cameraStorageKey);
    }
  }, [cameraStorageKey]);
  const saveCamera = useCallback((snapshot: CameraSnapshot) => {
    try {
      window.sessionStorage.setItem(cameraStorageKey, JSON.stringify(snapshot));
    } catch {
      // Harita sessionStorage olmadan da çalışır; yalnızca dönüş görünümü korunmaz.
    }
  }, [cameraStorageKey]);

  const updateRoute = useCallback((changes: { era?: AtlasView; entity?: string | null }) => {
    const next = new URLSearchParams(searchParams.toString());
    if (changes.era !== undefined) {
      if (changes.era === "inventory") next.delete("era");
      else next.set("era", changes.era);
    }
    if (changes.entity !== undefined) {
      if (changes.entity) next.set("entity", changes.entity);
      else next.delete("entity");
    }
    const query = next.toString();
    // These filters only affect the client scene. Avoid an RSC navigation and
    // its transition across the separate WebGL renderer; Back/Forward still work.
    const href = query ? `${pathname}?${query}` : pathname;
    if (href !== `${window.location.pathname}${window.location.search}`) {
      window.history.pushState(null, "", href);
    }
  }, [pathname, searchParams]);

  const selectMarker = useCallback((entityId: string) => {
    lastTriggerId.current = entityId;
    updateRoute({ entity: entityId });
  }, [updateRoute]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const canvas = document.createElement("canvas");
      setWebgl(canvas.getContext("webgl2") || canvas.getContext("webgl") ? "available" : "unavailable");
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const previous = previousSelectedId.current;
    previousSelectedId.current = selectedEntityId;
    if (!previous || selectedEntityId || !lastTriggerId.current) return;
    const triggerId = lastTriggerId.current;
    window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>(`[data-map-marker-id="${triggerId}"]`)?.focus();
    });
  }, [selectedEntityId]);

  const visibleLandforms = useMemo(() => {
    if (view === "inventory") return release.landforms;
    const period = view === "silver-god-1673" ? "1300 civarı" : "1600 civarı";
    return release.landforms.filter((landform) => landform.periods.includes(period));
  }, [release.landforms, view]);
  const visibleMarkers = useMemo(() => {
    if (view === "inventory") return release.markers;
    const period = view === "silver-god-1673" ? "1300 civarı" : "1600 civarı";
    return release.markers.filter((marker) => marker.periods.includes(period));
  }, [release.markers, view]);
  const selectedVisible = selectedLocation
    ? (selectedMarker
      ? visibleMarkers.some((marker) => marker.entityId === selectedMarker.entityId)
      : visibleLandforms.some((landform) => landform.entityId === selectedLocation.entityId))
    : false;
  const unmappedLocations = release.coverage.filter((record) => record.status !== "mapped");
  const selectedWikiHref = selectedLocation
    ? (`/wiki/${selectedLocation.preview.slug}?from=map&entity=${selectedLocation.entityId}${view === "inventory" ? "" : `&era=${view}`}` as Route)
    : null;
  const selectedPeriod = view === "silver-god-1673" ? "1300 civarı" : view === "present" ? "1600 civarı" : null;

  function handleKeyboard(event: KeyboardEvent<HTMLDivElement>) {
    if (!camera) return;
    const actions: Partial<Record<string, () => void>> = {
      ArrowLeft: () => camera.pan(-7, 0),
      ArrowRight: () => camera.pan(7, 0),
      ArrowUp: () => camera.pan(0, 7),
      ArrowDown: () => camera.pan(0, -7),
      "+": camera.zoomIn,
      "=": camera.zoomIn,
      "-": camera.zoomOut,
      "0": camera.reset,
    };
    const action = actions[event.key];
    if (!action) return;
    event.preventDefault();
    action();
  }

  return (
    <div className="atlas-workspace">
      <section className="atlas-stage" aria-labelledby="atlas-stage-title">
        <div className="atlas-toolbar">
          <div>
            <p className="eyebrow">Dünyayı keşfet</p>
            <h1 id="atlas-stage-title">{release.label}</h1>
          </div>
          <div className="era-switch" aria-label="Harita görünümü">
            {([ ["inventory", "Envanter"], ["present", periodLabel("1600 civarı")], ["silver-god-1673", periodLabel("1300 civarı")] ] as const).map(([value, label]) => (
              <button key={value} type="button" aria-pressed={view === value} onClick={() => updateRoute({ era: value })}>{label}</button>
            ))}
          </div>
        </div>

        {view !== "inventory" && release.eraArtStatus[selectedPeriod ?? "1600 civarı"] === "unavailable" && (
          <div className="map-art-unavailable" role="status">
            <strong>{periodLabel(selectedPeriod ?? "1600 civarı")} için onaylı harita görseli henüz hazır değil.</strong>
            <span>Gösterilen kara şekilleri sunum taslağıdır; dönem kanıtı ve wiki bağlantıları kullanılabilir.</span>
          </div>
        )}

        <div
          className="atlas-canvas"
          tabIndex={0}
          onKeyDown={handleKeyboard}
          aria-label="Etkileşimli dünya haritası. Ok tuşlarıyla kaydır, artı ve eksiyle yakınlaştır, sıfırla başlangıç görünümüne dön."
        >
          {webgl === "checking" && <MapFallback message="Harita yüzeyi hazırlanıyor…" />}
          {webgl === "unavailable" && <MapFallback message="WebGL kullanılamıyor. Konum listesi kullanılabilir durumda." />}
          {webgl === "available" && (
            <IsolatedScene renderScene={(eventSource) => <MapErrorBoundary>
              <Canvas
                key={view}
                eventSource={eventSource}
                orthographic
                frameloop="demand"
                dpr={[1, 1.6]}
                camera={{ position: [0, 100, 0], up: [0, 0, -1], zoom: release.defaultView.zoom, near: 0.1, far: 300 }}
                gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
              >
                <AtlasScene
                  landforms={visibleLandforms}
                  markers={visibleMarkers}
                  selectedEntityId={selectedEntityId}
                  onSelect={selectMarker}
                  onReady={onCameraReady}
                  onCameraSettled={saveCamera}
                />
              </Canvas>
            </MapErrorBoundary>} />
          )}
          <div className="camera-controls" aria-label="Harita kamera kontrolleri">
            <button type="button" onClick={() => camera?.zoomIn()} aria-label="Yakınlaştır">+</button>
            <button type="button" onClick={() => camera?.zoomOut()} aria-label="Uzaklaştır">−</button>
            <button type="button" onClick={() => camera?.reset()}>Sıfırla</button>
          </div>
          <p className="atlas-live-status" aria-live="polite">
            {visibleLandforms.length} kara parçası ve {visibleMarkers.length} konum işareti gösteriliyor.
          </p>
          {selectedLocation && selectedWikiHref && <EntityPreviewPanel location={selectedLocation} period={selectedPeriod} visibleInEra={selectedVisible} wikiHref={selectedWikiHref} onClose={() => updateRoute({ entity: null })} />}
        </div>
      </section>

      <aside className="atlas-inventory" aria-labelledby="inventory-title">
        <p className="eyebrow">Harita kapsamı</p>
        <h2 id="inventory-title">Dünya konumları</h2>
        <p>{release.counts.islands} ada ve {release.counts.continents} kıta ayrı şekildir. İşaret koordinatları kanondan ayrılmış sunum verisidir.</p>
        <div className="coverage-summary" aria-label="Konum kapsam özeti">
          <span><strong>{release.coverageCounts.mapped}</strong> haritada</span>
          <span><strong>{release.coverageCounts.local_map}</strong> yerel haritada</span>
          <span><strong>{release.coverageCounts.unplaced}</strong> yerleştirilmemiş</span>
          <span><strong>{release.coverageCounts.supernatural_or_uncertain}</strong> mekânı belirsiz</span>
        </div>
        <h3 className="inventory-subheading">Seçilebilir konumlar</h3>
        <ul className="marker-directory">
          {release.markers.map((marker) => {
            const visible = visibleMarkers.some((candidate) => candidate.entityId === marker.entityId);
            return (
              <li key={marker.entityId} data-visible={visible}>
                <button
                  type="button"
                  data-map-marker-id={marker.entityId}
                  aria-pressed={selectedEntityId === marker.entityId}
                  onClick={() => selectMarker(marker.entityId)}
                >
                  <span>{marker.preview.name}</span>
                  <small>{marker.preview.typeLabel} · {marker.reviewStatus === "draft" ? "sunum taslağı" : "incelenmiş konum"}</small>
                </button>
              </li>
            );
          })}
        </ul>
        <details className="unmapped-directory">
          <summary>Koordinatı olmayan {unmappedLocations.length} konumu aç</summary>
          <ul>
            {unmappedLocations.map((location) => (
              <li key={location.entityId}>
                <Link href={`/wiki/${location.slug}`}>
                  <span>{location.name}</span>
                  <small>{location.status === "local_map" ? "Yerel harita kaydı" : location.status === "supernatural_or_uncertain" ? "Mekânsal niteliği belirsiz" : "Dünya konumu belirlenmedi"}</small>
                </Link>
              </li>
            ))}
          </ul>
        </details>
        <div className="presentation-notice">
          <strong>Sunum verisi</strong>
          <p>{release.presentationNotice}</p>
        </div>
      </aside>
    </div>
  );
}
