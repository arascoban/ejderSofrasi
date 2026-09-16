import type { FrameLocalPosition, MapFrame } from "./contracts";

export interface WorldPoint {
  x: number;
  z: number;
}

export interface OrthographicViewport {
  width: number;
  height: number;
  zoom: number;
  targetX: number;
  targetZ: number;
}

export interface ScreenPoint {
  x: number;
  y: number;
}

export function indexFrames(frames: readonly MapFrame[]): Map<string, MapFrame> {
  const index = new Map<string, MapFrame>();
  for (const frame of frames) {
    if (index.has(frame.frameId)) throw new Error(`Yinelenen harita alanı: ${frame.frameId}`);
    index.set(frame.frameId, frame);
  }
  return index;
}

function requireFrame(frames: ReadonlyMap<string, MapFrame>, frameId: string): MapFrame {
  const frame = frames.get(frameId);
  if (!frame) throw new Error(`Harita alanı bulunamadı: ${frameId}`);
  return frame;
}

function applyTransform(point: WorldPoint, frame: MapFrame): WorldPoint {
  const radians = frame.transform.rotationDegrees * Math.PI / 180;
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  return {
    x: frame.transform.x + frame.transform.scale * (point.x * cosine - point.z * sine),
    z: frame.transform.z + frame.transform.scale * (point.x * sine + point.z * cosine),
  };
}

function invertTransform(point: WorldPoint, frame: MapFrame): WorldPoint {
  const radians = -frame.transform.rotationDegrees * Math.PI / 180;
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  const x = (point.x - frame.transform.x) / frame.transform.scale;
  const z = (point.z - frame.transform.z) / frame.transform.scale;
  return { x: x * cosine - z * sine, z: x * sine + z * cosine };
}

function ancestry(frames: ReadonlyMap<string, MapFrame>, frameId: string): MapFrame[] {
  const chain: MapFrame[] = [];
  const visited = new Set<string>();
  let frame: MapFrame | undefined = requireFrame(frames, frameId);
  while (frame) {
    if (visited.has(frame.frameId)) throw new Error(`Harita alanı döngüsü: ${frame.frameId}`);
    visited.add(frame.frameId);
    chain.push(frame);
    frame = frame.parentFrameId ? requireFrame(frames, frame.parentFrameId) : undefined;
  }
  return chain;
}

export function frameLocalToWorld(
  position: FrameLocalPosition,
  frames: ReadonlyMap<string, MapFrame>,
): WorldPoint {
  const frame = requireFrame(frames, position.frameId);
  let point = { x: (position.u - 0.5) * frame.width, z: (position.v - 0.5) * frame.height };
  for (const current of ancestry(frames, position.frameId)) point = applyTransform(point, current);
  return point;
}

export function worldToFrameLocal(
  point: WorldPoint,
  frameId: string,
  frames: ReadonlyMap<string, MapFrame>,
): FrameLocalPosition {
  const frame = requireFrame(frames, frameId);
  let local = point;
  for (const current of ancestry(frames, frameId).reverse()) local = invertTransform(local, current);
  return {
    frameId,
    u: local.x / frame.width + 0.5,
    v: local.z / frame.height + 0.5,
  };
}

export function worldToScreen(point: WorldPoint, viewport: OrthographicViewport): ScreenPoint {
  return {
    x: viewport.width / 2 + (point.x - viewport.targetX) * viewport.zoom,
    y: viewport.height / 2 + (point.z - viewport.targetZ) * viewport.zoom,
  };
}

export function screenToWorld(point: ScreenPoint, viewport: OrthographicViewport): WorldPoint {
  return {
    x: (point.x - viewport.width / 2) / viewport.zoom + viewport.targetX,
    z: (point.y - viewport.height / 2) / viewport.zoom + viewport.targetZ,
  };
}
