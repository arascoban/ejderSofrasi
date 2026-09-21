import sharp from "sharp";
import { describe, expect, it, vi } from "vitest";
import { processWikiImage } from "@/lib/editorial/media-processing";

// This suite executes the server processor in Node; Next enforces the import boundary in build.
vi.mock("server-only", () => ({}));

describe("wiki görsel işleme", () => {
  it("PNG dosyasını hashleyip dört WebP türevine dönüştürür", async () => {
    const original = await sharp({
      create: { width: 480, height: 320, channels: 4, background: "#7d4d2f" },
    }).png().toBuffer();
    const result = await processWikiImage(original, "image/png");

    expect(result.mimeType).toBe("image/png");
    expect(result.width).toBe(480);
    expect(result.height).toBe(320);
    expect(result.contentHashSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(result.variants.map((variant) => variant.kind)).toEqual([
      "thumbnail",
      "small",
      "medium",
      "large",
    ]);
    expect(result.variants.every((variant) => variant.mimeType === "image/webp")).toBe(true);
    expect(result.variants.every((variant) => variant.width <= 480 && variant.height <= 320)).toBe(true);
  });

  it("dosya imzasıyla uyuşmayan MIME bildirimini reddeder", async () => {
    const original = await sharp({
      create: { width: 20, height: 20, channels: 3, background: "#000000" },
    }).jpeg().toBuffer();
    await expect(processWikiImage(original, "image/png")).rejects.toThrow("MIME");
  });
});
