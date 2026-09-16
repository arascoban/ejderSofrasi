import { describe, expect, it } from "vitest";

import { emptyEditorialRepository } from "@/lib/editorial/contracts";
import { emptyMapPresentationRepository } from "@/lib/presentation/contracts";
import type { MapFrame } from "@/lib/presentation/contracts";
import { getMapInventoryRelease } from "@/lib/presentation/map-repository";
import { frameLocalToWorld, indexFrames, screenToWorld, worldToFrameLocal, worldToScreen } from "@/lib/presentation/transform";

describe("katman sınırları", () => {
  it("A aşamasında editoryal içeriği uydurmaz", async () => {
    await expect(emptyEditorialRepository.getPublishedContent("NPC-0006")).resolves.toBeNull();
  });

  it("kanonik coğrafyadan sunum koordinatı üretmez", async () => {
    await expect(emptyMapPresentationRepository.getFeatures("1300 civarı")).resolves.toEqual([]);
  });

  it("güncel ada ve kıta envanterinin her kaydı için ayrı şekil üretir", async () => {
    const release = await getMapInventoryRelease();
    expect(release.counts).toEqual({ islands: 4, continents: 2, total: 6 });
    expect(new Set(release.landforms.map((feature) => feature.entityId)).size).toBe(6);
    expect(release.landforms.filter((feature) => feature.periodStatus === "unknown")).toHaveLength(2);
    expect(release.landforms.every((feature) => feature.placementSource === "PRESENTATION")).toBe(true);
  });

  it("bütün konumları sahte koordinat üretmeden kapsam durumuna bağlar", async () => {
    const release = await getMapInventoryRelease();
    expect(release.coverage).toHaveLength(85);
    expect(new Set(release.coverage.map((record) => record.entityId)).size).toBe(85);
    expect(release.coverageCounts).toEqual({
      mapped: 7,
      local_map: 38,
      unplaced: 36,
      supernatural_or_uncertain: 4,
    });
    expect(release.markers).toHaveLength(1);
    expect(release.coverage.filter((record) => record.status === "mapped")).toHaveLength(
      release.landforms.length + release.markers.length,
    );
  });

  it("Yaz Helvası Şehri işaretini merkezi kimlik ve krallık ilişkisiyle çözer", async () => {
    const release = await getMapInventoryRelease();
    const marker = release.markers.find((candidate) => candidate.entityId === "CIT-0006");
    expect(marker).toMatchObject({
      reviewStatus: "draft",
      placementSource: "PRESENTATION",
      canonBasis: "CANON_CONSTRAINED",
      preview: {
        name: "Yaz Helvası Şehri",
        aliases: expect.arrayContaining(["Çöl Şehri"]),
      },
    });
    expect(marker?.preview.context).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "KNG-0008", name: "Yaz Helvası Krallığı", relation: "CAPITAL_OF" }),
    ]));
  });

  it("yerel alan konumunu dünya koordinatına kayıpsız dönüştürür", () => {
    const frames: MapFrame[] = [
      {
        frameId: "FRM-WORLD-TEST",
        parentFrameId: null,
        width: 200,
        height: 100,
        version: "1.0.0",
        transform: { x: 0, z: 0, scale: 1, rotationDegrees: 0 },
      },
      {
        frameId: "FRM-ISLAND-TEST",
        parentFrameId: "FRM-WORLD-TEST",
        width: 40,
        height: 20,
        version: "1.0.0",
        transform: { x: 30, z: -10, scale: 1.25, rotationDegrees: 18 },
      },
    ];
    const index = indexFrames(frames);
    const local = { frameId: "FRM-ISLAND-TEST", u: 0.27, v: 0.81 };
    const world = frameLocalToWorld(local, index);
    const restored = worldToFrameLocal(world, local.frameId, index);
    expect(restored.u).toBeCloseTo(local.u, 10);
    expect(restored.v).toBeCloseTo(local.v, 10);
  });

  it("dünya alanı büyüdüğünde mevcut yerel çapaları taşımaz", () => {
    const island: MapFrame = {
      frameId: "FRM-ISLAND-STABLE",
      parentFrameId: "FRM-WORLD-STABLE",
      width: 30,
      height: 18,
      version: "1.0.0",
      transform: { x: 42, z: 11, scale: 1, rotationDegrees: 0 },
    };
    const before = indexFrames([
      { frameId: "FRM-WORLD-STABLE", parentFrameId: null, width: 160, height: 100, version: "1.0.0", transform: { x: 0, z: 0, scale: 1, rotationDegrees: 0 } },
      island,
    ]);
    const after = indexFrames([
      { frameId: "FRM-WORLD-STABLE", parentFrameId: null, width: 260, height: 180, version: "1.1.0", transform: { x: 0, z: 0, scale: 1, rotationDegrees: 0 } },
      island,
    ]);
    const anchor = { frameId: island.frameId, u: 0.7, v: 0.25 };
    expect(frameLocalToWorld(anchor, after)).toEqual(frameLocalToWorld(anchor, before));
  });

  it.each([2.2, 5.1, 12])("dünya ve ekran dönüşümünü %s yakınlaştırmada bir piksel içinde korur", (zoom) => {
    const viewport = { width: 982, height: 611, zoom, targetX: -3.5, targetZ: 8.25 };
    const world = { x: 47.125, z: -21.875 };
    const screen = worldToScreen(world, viewport);
    const restored = screenToWorld(screen, viewport);
    const projectedAgain = worldToScreen(restored, viewport);
    expect(Math.abs(projectedAgain.x - screen.x)).toBeLessThan(1);
    expect(Math.abs(projectedAgain.y - screen.y)).toBeLessThan(1);
    expect(restored.x).toBeCloseTo(world.x, 10);
    expect(restored.z).toBeCloseTo(world.z, 10);
  });
});
