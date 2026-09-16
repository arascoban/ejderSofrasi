import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { JSONContent } from "@tiptap/core";
import type {
  MediaAttachment,
  PublishedEditorialContent,
} from "./contracts";
import { assertArticleDocument } from "./document";
import { getPublicSupabaseConfig } from "@/lib/supabase/config";

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

function storagePublicUrl(baseUrl: string, bucketId: string, objectPath: string): string {
  const path = objectPath.split("/").map(encodeURIComponent).join("/");
  return `${baseUrl}/storage/v1/object/public/${encodeURIComponent(bucketId)}/${path}`;
}

function parseMedia(baseUrl: string, value: unknown): MediaAttachment {
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
    publicUrl: storagePublicUrl(
      baseUrl,
      requiredString(file, "bucket_id"),
      requiredString(file, "object_path"),
    ),
    width: typeof file.width === "number" ? file.width : null,
    height: typeof file.height === "number" ? file.height : null,
  };
}

function parsePublishedContent(baseUrl: string, value: unknown): PublishedEditorialContent | null {
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
      .map((entry) => parseMedia(baseUrl, entry))
      .sort((left, right) => left.position - right.position),
  };
}

export async function getPublishedEditorialContent(
  entityId: string,
): Promise<PublishedEditorialContent | null> {
  const config = getPublicSupabaseConfig();
  if (!config) return null;

  const supabase = createClient(config.url, config.publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { data, error } = await supabase.rpc("get_published_wiki_article", {
    p_entity_id: entityId,
  });
  if (error) throw new Error(`Yayımlanmış wiki makalesi alınamadı: ${error.message}`);
  return parsePublishedContent(config.url, data);
}
