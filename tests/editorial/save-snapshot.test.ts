import { describe, expect, it } from "vitest";
import { isSaveSnapshotCurrent } from "@/lib/editorial/save-snapshot";

describe("otomatik kayıt snapshot sırası", () => {
  it("aynı sıra numarasını güncel kabul eder", () => {
    expect(isSaveSnapshotCurrent(4, 4)).toBe(true);
  });

  it("eski yanıtı daha yeni düzenlemenin onayı saymaz", () => {
    expect(isSaveSnapshotCurrent(4, 5)).toBe(false);
  });
});
