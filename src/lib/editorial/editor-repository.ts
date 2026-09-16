import "server-only";

import type { JSONContent } from "@tiptap/core";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { assertArticleDocument, EMPTY_ARTICLE_DOCUMENT } from "./document";
import type { EditorArticleState, EditorDraftMedia, EditorRevisionSummary } from "./editor-state";

function period(value: unknown): "1300 civarı" | "1600 civarı" | null {
  return value === "1300 civarı" || value === "1600 civarı" ? value : null;
}

export async function getEditorArticleState(entityId: string): Promise<EditorArticleState> {
  const supabase = await createSupabaseServerClient();
  const identity = await supabase
    .from("world_entity_identities")
    .select("entity_id, core_release_id")
    .eq("entity_id", entityId)
    .eq("active", true)
    .maybeSingle();
  if (identity.error || !identity.data) {
    throw new Error("Supabase kimlik köprüsünde etkin varlık bulunamadı.");
  }

  const articleResult = await supabase
    .from("wiki_articles")
    .select("article_id, published_revision_id")
    .eq("entity_id", entityId)
    .maybeSingle();
  if (articleResult.error) throw new Error(`Makale durumu alınamadı: ${articleResult.error.message}`);

  const articleId = articleResult.data?.article_id ?? null;
  const publishedRevisionId = articleResult.data?.published_revision_id ?? null;
  let document: JSONContent = structuredClone(EMPTY_ARTICLE_DOCUMENT);
  let articlePeriod: "1300 civarı" | "1600 civarı" | null = null;
  let changeNote = "";
  let lockVersion: number | null = null;
  let basedOnRevisionId: string | null = publishedRevisionId;
  let revisions: EditorRevisionSummary[] = [];
  let draftMedia: EditorDraftMedia[] = [];

  if (articleId) {
    const [draftResult, revisionResult, mediaLinkResult] = await Promise.all([
      supabase
        .from("wiki_drafts")
        .select("document, period, change_note, lock_version, based_on_revision_id")
        .eq("article_id", articleId)
        .maybeSingle(),
      supabase
        .from("wiki_revisions")
        .select("revision_id, revision_number, document, period, change_note, published_at, created_by, source_revision_id")
        .eq("article_id", articleId)
        .order("revision_number", { ascending: false }),
      supabase
        .from("wiki_draft_media")
        .select("media_id, role, position, period")
        .eq("article_id", articleId)
        .order("position", { ascending: true }),
    ]);
    if (draftResult.error) throw new Error(`Taslak alınamadı: ${draftResult.error.message}`);
    if (revisionResult.error) throw new Error(`Sürüm geçmişi alınamadı: ${revisionResult.error.message}`);
    if (mediaLinkResult.error) throw new Error(`Taslak görselleri alınamadı: ${mediaLinkResult.error.message}`);

    revisions = (revisionResult.data ?? []).map((entry) => ({
      revisionId: String(entry.revision_id),
      revisionNumber: Number(entry.revision_number),
      changeNote: typeof entry.change_note === "string" ? entry.change_note : "",
      publishedAt: String(entry.published_at),
      createdBy: String(entry.created_by),
      sourceRevisionId: typeof entry.source_revision_id === "string" ? entry.source_revision_id : null,
    }));

    const published = (revisionResult.data ?? []).find(
      (entry) => entry.revision_id === publishedRevisionId,
    );
    const source = draftResult.data ?? published;
    if (source) {
      assertArticleDocument(source.document);
      document = source.document as JSONContent;
      articlePeriod = period(source.period);
      changeNote = typeof source.change_note === "string" ? source.change_note : "";
    }
    if (draftResult.data) {
      lockVersion = Number(draftResult.data.lock_version);
      basedOnRevisionId =
        typeof draftResult.data.based_on_revision_id === "string"
          ? draftResult.data.based_on_revision_id
          : null;
    }

    const mediaIds = (mediaLinkResult.data ?? []).map((link) => String(link.media_id));
    if (mediaIds.length > 0) {
      const [assetsResult, filesResult] = await Promise.all([
        supabase
          .from("media_assets")
          .select("media_id, alternative_text_tr, caption_tr")
          .in("media_id", mediaIds),
        supabase
          .from("media_files")
          .select("media_id, kind, bucket_id, object_path")
          .in("media_id", mediaIds)
          .eq("bucket_id", "wiki-published")
          .in("kind", ["thumbnail", "small"]),
      ]);
      if (assetsResult.error) throw new Error(`Medya bilgileri alınamadı: ${assetsResult.error.message}`);
      if (filesResult.error) throw new Error(`Medya önizlemeleri alınamadı: ${filesResult.error.message}`);
      const assetById = new Map((assetsResult.data ?? []).map((asset) => [String(asset.media_id), asset]));
      const fileById = new Map<string, (typeof filesResult.data)[number]>();
      for (const file of filesResult.data ?? []) {
        const id = String(file.media_id);
        const current = fileById.get(id);
        if (!current || file.kind === "small") fileById.set(id, file);
      }
      draftMedia = (mediaLinkResult.data ?? []).flatMap((link) => {
        const mediaId = String(link.media_id);
        const asset = assetById.get(mediaId);
        const file = fileById.get(mediaId);
        if (!asset || !file) return [];
        const preview = supabase.storage.from(String(file.bucket_id)).getPublicUrl(String(file.object_path));
        return [{
          mediaId,
          role: link.role as EditorDraftMedia["role"],
          position: Number(link.position),
          period: period(link.period),
          alternativeTextTr: String(asset.alternative_text_tr),
          captionTr: typeof asset.caption_tr === "string" ? asset.caption_tr : "",
          previewUrl: preview.data.publicUrl,
        }];
      });
    }
  }

  return {
    articleId,
    entityId,
    baseCoreReleaseId: String(identity.data.core_release_id),
    document,
    period: articlePeriod,
    changeNote,
    lockVersion,
    basedOnRevisionId,
    publishedRevisionId,
    revisions,
    draftMedia,
  };
}
