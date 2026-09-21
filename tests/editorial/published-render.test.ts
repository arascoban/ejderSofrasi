import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { WikiArticle } from "@/components/wiki-article";
import type { PublishedEditorialContent } from "@/lib/editorial/contracts";

describe("ortak NPC/eşya/konum makale görünümü", () => {
  it.each(["NPC-0006", "ITM-0012", "CIT-0006"])("%s galeri, Türkçe alt/kredi ve ID bağlantısını sunar", entityId => {
    const content: PublishedEditorialContent = {
      article: { articleId: "article", entityId, language: "tr", state: "published", publishedRevisionId: "revision" },
      revision: { revisionId: "revision", articleId: "article", revisionNumber: 1, schemaVersion: "tiptap-v1", baseCoreReleaseId: "core", period: null, changeNote: "test", publishedAt: "2026-09-21T00:00:00Z",
        document: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Kalender", marks: [{ type: "link", attrs: { entityId: "NPC-0051", href: "/entity/NPC-0051" } }] }] }] } },
      media: [0, 1].map(position => ({ mediaId: `fixture-${position}`, role: "gallery", position, period: null, alternativeTextTr: `Türkçe görsel ${position}`, captionTr: "Kanon dışı test", sourceLabel: "Test kaynağı", creatorCredit: "Test üreticisi", rightsNote: "Test hakkı", visualKind: "illüstrasyon", publicUrl: `/fixture-${position}.webp`, width: 10, height: 10 })),
    };
    const html = renderToStaticMarkup(createElement(WikiArticle, { content }));
    expect(html).toContain('href="/entity/NPC-0051"');
    expect(html).toContain('data-entity-id="NPC-0051"');
    expect(html).toContain('alt="Türkçe görsel 0"');
    expect(html).toContain("Test üreticisi");
    expect(html).toContain("Test kaynağı");
    expect(html.indexOf('alt="Türkçe görsel 0"')).toBeLessThan(html.indexOf('alt="Türkçe görsel 1"'));
  });
});
