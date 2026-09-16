"use server";

import { revalidatePath } from "next/cache";
import { getEntityById } from "@/lib/data/repository";
import { getEditorSession } from "@/lib/editorial/auth";
import { assertArticleDocument } from "@/lib/editorial/document";
import type { EditorialActionResult, ProcessMediaInput, SaveDraftInput } from "@/lib/editorial/editor-state";
import { ALLOWED_MEDIA_TYPES, processWikiImage } from "@/lib/editorial/media-processing";
import { entityHref } from "@/lib/routing/entity";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function requireAuthorizedEditor() {
  const session = await getEditorSession();
  if (!session.configured || !session.user) {
    throw new Error("Bu işlem için doğrulanmış editör oturumu gerekiyor.");
  }
  return createSupabaseServerClient();
}

function messageForError(error: { code?: string; message: string }): EditorialActionResult {
  const conflict = error.code === "40001" || error.message.includes("değiştirildi") || error.message.includes("değişti");
  return {
    ok: false,
    conflict,
    message: conflict
      ? "Başka bir editör bu içeriği değiştirdi. Değişikliklerinizi kopyalayıp sayfayı yenileyin."
      : error.message,
  };
}

export async function saveDraftAction(input: SaveDraftInput): Promise<EditorialActionResult> {
  try {
    assertArticleDocument(input.document);
    const entity = await getEntityById(input.entityId);
    if (!entity || entity.id !== input.entityId) return { ok: false, message: "Geçerli varlık bulunamadı." };
    if (input.changeNote.length > 500) return { ok: false, message: "Değişiklik notu 500 karakteri aşamaz." };

    const supabase = await requireAuthorizedEditor();
    const { data, error } = await supabase.rpc("save_wiki_draft", {
      p_entity_id: input.entityId,
      p_document: input.document,
      p_base_core_release_id: input.baseCoreReleaseId,
      p_period: input.period,
      p_change_note: input.changeNote,
      p_expected_lock_version: input.expectedLockVersion,
    });
    if (error) return messageForError(error);
    const record = Array.isArray(data) ? data[0] : null;
    if (!record || typeof record.lock_version !== "number") {
      return { ok: false, message: "Taslak kaydı doğrulanamadı." };
    }

    revalidatePath(`/editor/${input.entityId}`);
    return {
      ok: true,
      message: "Taslak kaydedildi.",
      lockVersion: record.lock_version,
      updatedAt: String(record.updated_at),
    };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Taslak kaydedilemedi." };
  }
}

export async function publishDraftAction(
  entityId: string,
  expectedLockVersion: number,
  changeNote: string,
): Promise<EditorialActionResult> {
  try {
    const entity = await getEntityById(entityId);
    if (!entity || entity.id !== entityId) return { ok: false, message: "Geçerli varlık bulunamadı." };
    const supabase = await requireAuthorizedEditor();
    const { data, error } = await supabase.rpc("publish_wiki_draft", {
      p_entity_id: entityId,
      p_expected_lock_version: expectedLockVersion,
      p_change_note: changeNote,
    });
    if (error) return messageForError(error);

    revalidatePath(entityHref(entity.slug));
    revalidatePath(`/editor/${entityId}`);
    return { ok: true, message: "Makale yayımlandı.", revisionId: String(data) };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Makale yayımlanamadı." };
  }
}

export async function rollbackArticleAction(formData: FormData) {
  const entityId = String(formData.get("entityId") ?? "");
  const sourceRevisionId = String(formData.get("sourceRevisionId") ?? "");
  const expectedRevisionId = String(formData.get("expectedRevisionId") ?? "");
  const changeNote = String(formData.get("changeNote") ?? "Önceki sürüm geri getirildi.");
  const entity = await getEntityById(entityId);
  if (!entity || entity.id !== entityId) throw new Error("Geçerli varlık bulunamadı.");

  const supabase = await requireAuthorizedEditor();
  const { error } = await supabase.rpc("rollback_wiki_article", {
    p_entity_id: entityId,
    p_source_revision_id: sourceRevisionId,
    p_expected_published_revision_id: expectedRevisionId,
    p_change_note: changeNote,
  });
  if (error) throw new Error(messageForError(error).message);
  revalidatePath(entityHref(entity.slug));
  revalidatePath(`/editor/${entityId}`);
}

export async function processMediaAction(input: ProcessMediaInput): Promise<EditorialActionResult> {
  try {
    const session = await getEditorSession();
    if (!session.configured || !session.user) {
      return { ok: false, message: "Bu işlem için doğrulanmış editör oturumu gerekiyor." };
    }
    const entity = await getEntityById(input.entityId);
    if (!entity || entity.id !== input.entityId) return { ok: false, message: "Geçerli varlık bulunamadı." };
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.mediaId)) {
      return { ok: false, message: "Geçersiz medya kimliği." };
    }
    if (!ALLOWED_MEDIA_TYPES.includes(input.declaredMimeType as (typeof ALLOWED_MEDIA_TYPES)[number])) {
      return { ok: false, message: "Desteklenmeyen görsel türü." };
    }
    for (const [label, value, max] of [
      ["Alternatif metin", input.alternativeTextTr, 500],
      ["Açıklama", input.captionTr, 1000],
      ["Kaynak", input.sourceLabel, 300],
      ["Üretici/kredi", input.creatorCredit, 300],
      ["Kullanım bilgisi", input.rightsNote, 1000],
    ] as const) {
      if ((label !== "Açıklama" && value.trim().length === 0) || value.length > max) {
        return { ok: false, message: `${label} alanı geçersiz.` };
      }
    }

    const extensionByMime: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/avif": "avif",
    };
    const expectedPath = `${session.user.id}/${input.mediaId}/original.${extensionByMime[input.declaredMimeType]}`;
    if (input.originalPath !== expectedPath) return { ok: false, message: "Özgün görsel yolu geçersiz." };

    const supabase = await createSupabaseServerClient();
    const downloaded = await supabase.storage.from("wiki-originals").download(input.originalPath);
    if (downloaded.error || !downloaded.data) {
      return { ok: false, message: `Özgün görsel okunamadı: ${downloaded.error?.message ?? "dosya yok"}` };
    }
    const original = Buffer.from(await downloaded.data.arrayBuffer());
    const processed = await processWikiImage(original, input.declaredMimeType);

    const derivativeRecords: Array<{
      kind: string;
      object_path: string;
      width: number;
      height: number;
      byte_size: number;
      mime_type: "image/webp";
    }> = [];
    for (const variant of processed.variants) {
      const objectPath = `${session.user.id}/${input.mediaId}/${variant.kind}.webp`;
      const uploaded = await supabase.storage.from("wiki-published").upload(objectPath, variant.buffer, {
        contentType: variant.mimeType,
        upsert: false,
        cacheControl: "31536000",
      });
      if (uploaded.error && !uploaded.error.message.toLocaleLowerCase("tr-TR").includes("already exists")) {
        return { ok: false, message: `Görsel türevi yüklenemedi: ${uploaded.error.message}` };
      }
      derivativeRecords.push({
        kind: variant.kind,
        object_path: objectPath,
        width: variant.width,
        height: variant.height,
        byte_size: variant.buffer.byteLength,
        mime_type: variant.mimeType,
      });
    }

    const registered = await supabase.rpc("register_processed_media", {
      p_media_id: input.mediaId,
      p_content_hash_sha256: processed.contentHashSha256,
      p_mime_type: processed.mimeType,
      p_width: processed.width,
      p_height: processed.height,
      p_byte_size: processed.byteSize,
      p_alternative_text_tr: input.alternativeTextTr.trim(),
      p_caption_tr: input.captionTr.trim(),
      p_source_label: input.sourceLabel.trim(),
      p_creator_credit: input.creatorCredit.trim(),
      p_rights_note: input.rightsNote.trim(),
      p_visual_kind: input.visualKind.trim() || "illüstrasyon",
      p_period: input.period,
      p_original_path: input.originalPath,
      p_files: derivativeRecords,
    });
    if (registered.error) return messageForError(registered.error);

    const attached = await supabase.rpc("attach_media_to_wiki_draft", {
      p_entity_id: input.entityId,
      p_media_id: input.mediaId,
      p_role: input.role,
      p_period: input.period,
    });
    if (attached.error) return messageForError(attached.error);

    revalidatePath(`/editor/${input.entityId}`);
    return { ok: true, message: "Görsel işlendi ve taslağa eklendi." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Görsel işlenemedi." };
  }
}

export async function removeDraftMediaAction(entityId: string, mediaId: string): Promise<EditorialActionResult> {
  try {
    const supabase = await requireAuthorizedEditor();
    const { error } = await supabase.rpc("remove_media_from_wiki_draft", {
      p_entity_id: entityId,
      p_media_id: mediaId,
    });
    if (error) return messageForError(error);
    revalidatePath(`/editor/${entityId}`);
    return { ok: true, message: "Görsel taslaktan kaldırıldı." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Görsel kaldırılamadı." };
  }
}

export async function reorderDraftMediaAction(entityId: string, mediaIds: string[]): Promise<EditorialActionResult> {
  try {
    if (new Set(mediaIds).size !== mediaIds.length) return { ok: false, message: "Galeri sırası tekrarlı kimlik içeriyor." };
    const supabase = await requireAuthorizedEditor();
    const { error } = await supabase.rpc("reorder_wiki_draft_media", {
      p_entity_id: entityId,
      p_media_ids: mediaIds,
    });
    if (error) return messageForError(error);
    revalidatePath(`/editor/${entityId}`);
    return { ok: true, message: "Galeri sırası kaydedildi." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Galeri sırası kaydedilemedi." };
  }
}
