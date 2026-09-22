import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { validateArticleDocument } from "@/lib/editorial/document";

const root = process.cwd();
const readJson = <T>(path: string) => JSON.parse(readFileSync(join(root, path), "utf8")) as T;
const stableStringify = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;

type PilotDraft = {
  language: string;
  review_status: string;
  publication_status: string;
  existing_editorial_state: string;
  editorial_import: string;
  document_hash: string;
  document: { content: Array<{ type: string }> };
  claims: Array<{ block_path: string; evidence: Array<{ kind: string; id: string; source_refs: Array<{ source_id: string }> }> }>;
};

describe("M2 pilot drafts", () => {
  const manifest = readJson<{ stage: string; draft_count: number; drafts: Array<{ entity_id: string }>; publication_status: string }>("editorial_work/manifest.json");
  const entities = readJson<Array<{ id: string }>>("data/entities.json");
  const sourceInventory = readJson<{ files: Array<{ source_id: string }> }>("data/source_inventory.json");
  const entityIds = new Set(entities.map((entity) => entity.id));
  const sourceIds = new Set(sourceInventory.files.map((source) => source.source_id));
  const expectedIds = ["DEI-0001", "ITM-0012", "KNG-0008", "NPC-0006", "NPC-0051", "ORG-0001"];

  test("manifest contains exactly the six pilot records", () => {
    expect(manifest.stage).toBe("M2");
    expect(manifest.draft_count).toBe(6);
    expect(manifest.drafts.map((draft: { entity_id: string }) => draft.entity_id).sort()).toEqual(expectedIds);
    expect(manifest.publication_status).toBe("none");
  });

  for (const entityId of expectedIds) {
    test(`${entityId} is a valid unpublished Turkish document with evidence`, () => {
      const draft = readJson<PilotDraft>(`editorial_work/drafts/${entityId}.json`);
      const validation = validateArticleDocument(draft.document);
      expect(validation.valid, JSON.stringify(validation.issues)).toBe(true);
      expect(draft.language).toBe("tr");
      expect(draft.review_status).toBe("pilot_review");
      expect(draft.publication_status).toBe("not_published");
      expect(draft.existing_editorial_state).toBe("not_checked");
      expect(draft.editorial_import).toBe("dry_run_only");
      expect(draft.document_hash).toBe(createHash("sha256").update(stableStringify(draft.document)).digest("hex"));
      expect(draft.claims.length).toBeGreaterThan(0);
      expect(new Set(draft.claims.map((claim: { block_path: string }) => claim.block_path)).size).toBe(draft.claims.length);

      for (const claim of draft.claims) {
        const match = /^\/content\/(\d+)$/.exec(claim.block_path);
        expect(match).not.toBeNull();
        const block = draft.document.content[Number(match?.[1])];
        expect(block.type).toBe("paragraph");
        expect(claim.evidence.length).toBeGreaterThan(0);
        for (const evidence of claim.evidence) {
          expect(evidence.source_refs.length).toBeGreaterThan(0);
          for (const sourceRef of evidence.source_refs) expect(sourceIds.has(sourceRef.source_id)).toBe(true);
          if (evidence.kind === "fact") expect(evidence.id.startsWith("FCT-")).toBe(true);
          if (evidence.kind === "relationship") expect(evidence.id.startsWith("REL-")).toBe(true);
          if (evidence.kind === "event") expect(evidence.id.startsWith("EVT-")).toBe(true);
          if (evidence.kind === "conflict") expect(evidence.id.startsWith("CNF-")).toBe(true);
        }
      }

      const walk = (node: unknown) => {
        if (!node || typeof node !== "object") return;
        const value = node as Record<string, unknown>;
        const marks = Array.isArray(value.marks) ? value.marks : [];
        for (const mark of marks) {
          if (!mark || typeof mark !== "object") continue;
          const markValue = mark as Record<string, unknown>;
          const attrs = markValue.attrs && typeof markValue.attrs === "object"
            ? markValue.attrs as Record<string, unknown>
            : {};
          if (markValue.type !== "link" || typeof attrs.entityId !== "string") continue;
          expect(entityIds.has(attrs.entityId)).toBe(true);
          expect(attrs.href).toBe(`/entity/${attrs.entityId}`);
        }
        const content = Array.isArray(value.content) ? value.content : [];
        for (const child of content) walk(child);
      };
      walk(draft.document);
    });
  }

  test("only the six generated pilot files are present", () => {
    expect(readdirSync(join(root, "editorial_work", "drafts")).sort()).toEqual(expectedIds.map((id) => `${id}.json`).sort());
  });
});
