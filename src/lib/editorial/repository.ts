import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { JSONContent } from "@tiptap/core";
import type {
  MediaAttachment,
  PublishedEditorialContent,
} from "./contracts";
import { assertArticleDocument } from "./document";
import { getPublicSupabaseConfig, isEditorialEnabled } from "@/lib/supabase/config";

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(record: JsonObject, key: string): string {
  const value = record[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Yayımlanmış makale projeksiyonunda ${key} eksik.`);
  }
  return value;
}

function optionalPeriod(value: unknown): "1300 civarı" | "1600 civarı" | null {
  if (value === null || value === undefined) return null;
  if (value === "1300 civarı" || value === "1600 civarı") return value;
  throw new Error("Yayımlanmış makalede geçersiz dönem değeri var.");
}

function publishedMediaUrl(mediaId: string, kind: string): string {
  return `/api/media/${encodeURIComponent(mediaId)}?kind=${encodeURIComponent(kind)}`;
}

function parseMedia(value: unknown): MediaAttachment {
  if (!isObject(value)) throw new Error("Yayımlanmış medya kaydı geçersiz.");
  const files = Array.isArray(value.files) ? value.files.filter(isObject) : [];
  const preferredKinds = ["medium", "large", "small", "thumbnail"];
  const file = preferredKinds
    .map((kind) => files.find((candidate) => candidate.kind === kind))
    .find(Boolean);
  if (!file) throw new Error(`Yayımlanmış medya türevi bulunamadı: ${String(value.media_id)}`);

  const role = value.role;
  if (!["cover", "portrait", "gallery", "map_thumbnail", "inline"].includes(String(role))) {
    throw new Error("Yayımlanmış medya rolü geçersiz.");
  }

  return {
    mediaId: requiredString(value, "media_id"),
    role: role as MediaAttachment["role"],
    position: typeof value.position === "number" ? value.position : 0,
    period: optionalPeriod(value.period),
    alternativeTextTr: requiredString(value, "alternative_text_tr"),
    captionTr: typeof value.caption_tr === "string" ? value.caption_tr : "",
    sourceLabel: requiredString(value, "source_label"),
    creatorCredit: requiredString(value, "creator_credit"),
    rightsNote: requiredString(value, "rights_note"),
    visualKind: requiredString(value, "visual_kind"),
    publicUrl: publishedMediaUrl(requiredString(value, "media_id"), String(file.kind)),
    width: typeof file.width === "number" ? file.width : null,
    height: typeof file.height === "number" ? file.height : null,
  };
}

function parsePublishedContent(value: unknown): PublishedEditorialContent | null {
  if (value === null) return null;
  if (!isObject(value) || !isObject(value.revision)) {
    throw new Error("Yayımlanmış makale projeksiyonu geçersiz.");
  }

  const revision = value.revision;
  const document = revision.document;
  assertArticleDocument(document);
  const articleId = requiredString(value, "article_id");
  const revisionId = requiredString(revision, "revision_id");

  return {
    article: {
      articleId,
      entityId: requiredString(value, "entity_id"),
      language: "tr",
      state: "published",
      publishedRevisionId: revisionId,
    },
    revision: {
      revisionId,
      articleId,
      revisionNumber:
        typeof revision.revision_number === "number" ? revision.revision_number : 0,
      schemaVersion: requiredString(revision, "schema_version"),
      baseCoreReleaseId: requiredString(revision, "base_core_release_id"),
      period: optionalPeriod(revision.period),
      document: document as JSONContent,
      changeNote: typeof revision.change_note === "string" ? revision.change_note : "",
      publishedAt: requiredString(revision, "published_at"),
    },
    media: (Array.isArray(value.media) ? value.media : [])
      .map((entry) => parseMedia(entry))
      .sort((left, right) => left.position - right.position),
  };
}

function documentText(value: unknown): string {
  if (Array.isArray(value)) return value.map(documentText).filter(Boolean).join(" ");
  if (!isObject(value)) return "";
  const ownText = typeof value.text === "string" ? value.text : "";
  return [ownText, ...Object.values(value).map(documentText)].filter(Boolean).join(" ");
}

/**
 * Returns only the current published revision of each public article. Drafts
 * and historical revisions never enter this index. A missing editorial
 * service leaves the core archive searchable and does not break the directory.
 */
export async function getPublishedEditorialSearchText(): Promise<ReadonlyMap<string, string>> {
  const config = getPublicSupabaseConfig();
  if (!config || !isEditorialEnabled()) return new Map();

  try {
    // One deadline covers both reads; optional editorial search must not
    // leave a public archive request waiting indefinitely.
    const signal = AbortSignal.timeout(3000);
    const supabase = createClient(config.url, config.publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const articles = await supabase
      .from("wiki_articles")
      .select("entity_id, published_revision_id")
      .not("published_revision_id", "is", null)
      .abortSignal(signal);
    if (articles.error) return new Map();
    const revisionIds = (articles.data ?? [])
      .map((row) => typeof row.published_revision_id === "string" ? row.published_revision_id : null)
      .filter((id): id is string => Boolean(id));
    if (!revisionIds.length) return new Map();
    const revisions = await supabase.from("wiki_revisions").select("revision_id, document").in("revision_id", revisionIds).abortSignal(signal);
    if (revisions.error) return new Map();
    const documents = new Map((revisions.data ?? []).map((row) => [String(row.revision_id), documentText(row.document)]));
    return new Map((articles.data ?? []).flatMap((row) => {
      const entityId = typeof row.entity_id === "string" ? row.entity_id : null;
      const revisionId = typeof row.published_revision_id === "string" ? row.published_revision_id : null;
      const text = revisionId ? documents.get(revisionId) : "";
      return entityId && text ? [[entityId, text] as const] : [];
    }));
  } catch {
    return new Map();
  }
}

export async function getPublishedEditorialContent(
  entityId: string,
): Promise<PublishedEditorialContent | null> {
  const config = getPublicSupabaseConfig();
  if (!config || !isEditorialEnabled()) return null;

  const supabase = createClient(config.url, config.publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { data, error } = await supabase.rpc("get_published_wiki_article", {
    p_entity_id: entityId,
  });
  if (error) throw new Error(`Yayımlanmış wiki makalesi alınamadı: ${error.message}`);
  return parsePublishedContent(data);
}
