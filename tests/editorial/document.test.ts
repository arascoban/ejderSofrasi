import { describe, expect, it } from "vitest";
import { validateArticleDocument } from "@/lib/editorial/document";

describe("Tiptap makale belgesi", () => {
  it("Türkçe metin, tablo ve sabit entity bağlantısını kabul eder", () => {
    const result = validateArticleDocument({
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Geçmişi" }] },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Akmer",
              marks: [
                {
                  type: "link",
                  attrs: { entityId: "NPC-0004", href: "/entity/NPC-0004" },
                },
              ],
            },
          ],
        },
        {
          type: "table",
          content: [
            {
              type: "tableRow",
              content: [
                {
                  type: "tableCell",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "Bilgi" }] }],
                },
              ],
            },
          ],
        },
      ],
    });

    expect(result.valid).toBe(true);
    expect(result.textLength).toBeGreaterThan(0);
  });

  it("script düğümü, javascript bağlantısı ve ham görsel adresini reddeder", () => {
    const result = validateArticleDocument({
      type: "doc",
      content: [
        { type: "script", content: [] },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "sakıncalı",
              marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }],
            },
          ],
        },
        {
          type: "image",
          attrs: {
            mediaId: "28c5dc72-2072-4ef1-85bb-b9dd22d3adea",
            src: "https://example.com/raw.png",
          },
        },
      ],
    });

    expect(result.valid).toBe(false);
    expect(result.issues.map((entry) => entry.message).join(" ")).toContain("Desteklenmeyen");
    expect(result.issues.map((entry) => entry.message).join(" ")).toContain("http/https");
    expect(result.issues.map((entry) => entry.message).join(" ")).toContain("Ham görsel adresi");
  });

  it("görseli sabit medya kimliğine bağlar", () => {
    expect(
      validateArticleDocument({
        type: "doc",
        content: [
          {
            type: "image",
            attrs: { mediaId: "28c5dc72-2072-4ef1-85bb-b9dd22d3adea" },
          },
        ],
      }).valid,
    ).toBe(true);
  });
});
