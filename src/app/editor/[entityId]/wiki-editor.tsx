"use client";

import Placeholder from "@tiptap/extension-placeholder";
import type { JSONContent } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { EntitySummary, Period } from "@/lib/domain/types";
import type { EditorArticleState, EditorialActionResult, EditorRevisionSummary } from "@/lib/editorial/editor-state";
import { MAX_MEDIA_BYTES } from "@/lib/editorial/media-limits";
import { SaveCoordinator, type SaveCoordinatorResult, type SaveCoordinatorResponse } from "@/lib/editorial/save-coordinator";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { DraftMediaManager } from "./draft-media-manager";
import { EditorMediaContext, editorPreviewExtensions } from "./inline-media-preview";
import { processMediaAction, publishDraftAction, rollbackArticleAction, saveDraftAction } from "./actions";

type SaveStatus = "idle" | "dirty" | "saving" | "saved" | "error" | "conflict";
type SaveToken = { lockVersion: number; draftId: string };
type SavePayload = { document: JSONContent; period: Period | null; changeNote: string };

function mediaResponse(result: EditorialActionResult): SaveCoordinatorResponse<SaveToken> {
  if (!result.ok) return result;
  if (!result.draftId || result.lockVersion === undefined) {
    return { ok: false, conflict: true, message: "İşlemin yeni sürümü doğrulanamadı. Yazınızı kopyalayıp yeniden açın." };
  }
  return { ok: true, message: result.message, token: { draftId: result.draftId, lockVersion: result.lockVersion } };
}

const SAVE_LABELS: Record<SaveStatus, string> = {
  idle: "Hazır",
  dirty: "Kaydedilmemiş değişiklik",
  saving: "Taslak kaydediliyor…",
  saved: "Taslak kaydedildi",
  error: "Kayıt başarısız",
  conflict: "Sürüm çakışması",
};

export function WikiEditor({
  state,
  entityOptions,
  userId,
}: {
  state: EditorArticleState;
  entityOptions: readonly EntitySummary[];
  userId: string;
}) {
  const [period, setPeriod] = useState<Period | "">(state.period ?? "");
  const [changeNote, setChangeNote] = useState(state.changeNote);
  const staleDraft = Boolean(state.draftId && state.basedOnRevisionId !== state.publishedRevisionId);
  const [status, setStatus] = useState<SaveStatus>(staleDraft ? "conflict" : "idle");
  const [message, setMessage] = useState("");
  const [selectedEntityId, setSelectedEntityId] = useState("");
  const [isPublishing, setPublishing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [mutationBusy, setMutationBusy] = useState(false);
  const publishedRevisionId = useRef(state.publishedRevisionId);
  const periodRef = useRef<Period | "">(state.period ?? "");
  const changeNoteRef = useRef(state.changeNote);
  const editSequence = useRef(0);
  const mutationBusyRef = useRef(false);
  const conflictRef = useRef(staleDraft);
  const router = useRouter();

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      ...editorPreviewExtensions,
      Placeholder.configure({ placeholder: "Bu varlık için wiki makalesini Türkçe yazın…" }),
    ],
    content: state.document,
    editorProps: {
      attributes: {
        class: "wiki-editor-content",
        "aria-label": "Wiki makalesi",
      },
    },
    onUpdate: () => {
      editSequence.current += 1;
      setStatus(conflictRef.current ? "conflict" : "dirty");
    },
  });

  const [coordinator, setCoordinator] = useState<SaveCoordinator<string, SavePayload, SaveToken> | null>(null);
  useEffect(() => {
    if (!editor || coordinator) return;
    const initialValue = JSON.stringify({ document: state.document, period: state.period ?? "", changeNote: state.changeNote });
    setCoordinator(new SaveCoordinator<string, SavePayload, SaveToken>({
      initialSavedValue: initialValue,
      initialToken: state.lockVersion === null || !state.draftId ? null : { lockVersion: state.lockVersion, draftId: state.draftId },
      equals: (left, right) => left === right,
      getSnapshot: () => {
        if (!editor) return null;
        // ProseMirror attrs have a null prototype. React Server Actions treats
        // them as opaque client references, so send a detached plain-JSON tree.
        const document: JSONContent = JSON.parse(JSON.stringify(editor.getJSON()));
        const payload: SavePayload = { document, period: periodRef.current || null, changeNote: changeNoteRef.current };
        return { sequence: editSequence.current, value: JSON.stringify({ document, period: periodRef.current || "", changeNote: changeNoteRef.current }), payload };
      },
      send: async (snapshot, token) => {
        const result = await saveDraftAction({
          entityId: state.entityId,
          document: snapshot.payload.document,
          baseCoreReleaseId: state.baseCoreReleaseId,
          period: snapshot.payload.period,
          changeNote: snapshot.payload.changeNote,
          expectedLockVersion: token?.lockVersion ?? null,
          expectedDraftId: token?.draftId ?? null,
          expectedPublishedRevisionId: publishedRevisionId.current,
        });
        setMessage(result.message);
        return mediaResponse(result);
      },
    }));
  }, [coordinator, editor, state.baseCoreReleaseId, state.document, state.entityId, state.lockVersion, state.period, state.publishedRevisionId, state.changeNote, state.draftId]);

  const applyResult = useCallback((result: SaveCoordinatorResult<SaveToken>) => {
    setMessage(result.message ?? "");
    if (result.conflict) conflictRef.current = true;
    if (conflictRef.current) setStatus("conflict");
    else if (!result.ok) setStatus("error");
    else setStatus(result.sequence === editSequence.current ? "saved" : "dirty");
  }, []);

  const enqueueSave = useCallback(async () => {
    if (!editor || !coordinator) return { ok: false, token: null, sequence: editSequence.current };
    if (conflictRef.current) return { ok: false, token: null, sequence: editSequence.current, conflict: true, message: "Çakışma çözülmeden otomatik kayıt durduruldu." };
    if (mutationBusyRef.current) return { ok: false, token: null, sequence: editSequence.current, message: "İşlem sürüyor." };
    setStatus("saving");
    const result = await coordinator.enqueue();
    if (!mutationBusyRef.current) applyResult(result);
    return result;
  }, [applyResult, coordinator, editor]);

  async function runMutation(operation: (token: SaveToken) => Promise<SaveCoordinatorResponse<SaveToken>>) {
    if (!editor || !coordinator || mutationBusyRef.current || conflictRef.current) {
      return { ok: false, token: null, sequence: editSequence.current, message: "İşlem başlatılamadı." };
    }
    mutationBusyRef.current = true;
    setMutationBusy(true);
    // Tiptap emits an update by default even when only editability changes.
    // Locking must not mark unchanged content dirty or recreate a published draft.
    editor.setEditable(false, false);
    try {
      const result = await coordinator.mutate(operation);
      applyResult(result);
      return result;
    } finally {
      mutationBusyRef.current = false;
      setMutationBusy(false);
      editor.setEditable(true, false);
    }
  }

  useEffect(() => {
    if (status !== "dirty" || mutationBusy || conflictRef.current) return;
    const timer = window.setTimeout(() => void enqueueSave(), 1_600);
    return () => window.clearTimeout(timer);
  }, [enqueueSave, status, mutationBusy]);

  function addEntityLink() {
    if (!editor || !selectedEntityId) return;
    editor.chain().focus().extendMarkRange("link").setMark("link", {
      href: `/entity/${selectedEntityId}`,
      entityId: selectedEntityId,
    }).run();
  }

  async function publish() {
    if (mutationBusyRef.current || conflictRef.current) return;
    setPublishing(true);
    try {
      const result = await runMutation(async (token) => {
        const published = await publishDraftAction(state.entityId, token.lockVersion, token.draftId, changeNoteRef.current);
        if (!published.ok) return published;
        if (!published.revisionId) throw new Error("Yayımlanan sürüm doğrulanamadı; yazınızı kopyalayıp yeniden açın.");
        publishedRevisionId.current = published.revisionId;
        return { ok: true, token: null, message: published.message };
      });
      if (result.ok) router.refresh();
    } finally {
      setPublishing(false);
    }
  }

  async function rollback(revision: EditorRevisionSummary) {
    if (!editor || !coordinator || mutationBusyRef.current || conflictRef.current || !publishedRevisionId.current) return;
    // Rollback changes the publication underneath a draft. Preserve unfinished
    // work and require it to be published first, rather than silently rebasing it.
    if (coordinator.hasPendingDraft || status === "dirty" || status === "saving") {
      setMessage("Önce mevcut taslağı yayımlayın; ardından geçmiş sürümü geri getirebilirsiniz. Yazınız korunuyor.");
      return;
    }
    mutationBusyRef.current = true;
    setMutationBusy(true);
    editor.setEditable(false, false);
    let reloading = false;
    try {
      const result = await rollbackArticleAction(state.entityId, revision.revisionId, publishedRevisionId.current, `Sürüm ${revision.revisionNumber} geri getirildi.`);
      if (!result.ok) {
        applyResult({ ...result, token: null, sequence: editSequence.current });
        return;
      }
      // There is no unsaved local draft here. A full load initializes document,
      // media, publication base and coordinator together from the restored state.
      reloading = true;
      window.location.reload();
    } catch {
      applyResult({ ok: false, conflict: true, token: null, sequence: editSequence.current, message: "Geri alma sonucu doğrulanamadı. Sunucudaki sürümü yeni sekmede açın." });
    } finally {
      if (!reloading) {
        mutationBusyRef.current = false;
        setMutationBusy(false);
        editor.setEditable(true, false);
      }
    }
  }

  async function uploadMedia(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editor) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      setUploadMessage("Bir görsel dosyası seçin.");
      return;
    }
    if (file.size > MAX_MEDIA_BYTES) {
      setUploadMessage("Görsel dosyası 12 MB sınırını aşıyor.");
      return;
    }
    const extensionByMime: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/avif": "avif",
    };
    const extension = extensionByMime[file.type];
    if (!extension) {
      setUploadMessage("Yalnızca JPEG, PNG, WebP ve AVIF görselleri kabul edilir.");
      return;
    }

    if (mutationBusyRef.current || conflictRef.current) return;
    setUploading(true);
    const mediaId = crypto.randomUUID();
    const originalPath = `${userId}/${mediaId}/original.${extension}`;
    const role = String(formData.get("role") ?? "gallery") as "cover" | "portrait" | "gallery" | "inline";
    try {
      setUploadMessage("Önce taslak kaydediliyor…");
      const result = await runMutation(async (token) => {
        const supabase = createSupabaseBrowserClient();
        setUploadMessage("Özgün görsel özel depoya yükleniyor…");
        const uploaded = await supabase.storage.from("wiki-originals").upload(originalPath, file, {
          contentType: file.type,
          upsert: false,
        });
        if (uploaded.error) return { ok: false, message: `Yükleme başarısız: ${uploaded.error.message}` };
        setUploadMessage("Görsel doğrulanıyor ve yayın boyutları hazırlanıyor…");
        return mediaResponse(await processMediaAction({
          entityId: state.entityId,
          mediaId,
          originalPath,
          declaredMimeType: file.type,
          alternativeTextTr: String(formData.get("alternativeTextTr") ?? ""),
          captionTr: String(formData.get("captionTr") ?? ""),
          sourceLabel: String(formData.get("sourceLabel") ?? ""),
          creatorCredit: String(formData.get("creatorCredit") ?? ""),
          rightsNote: String(formData.get("rightsNote") ?? ""),
          visualKind: String(formData.get("visualKind") ?? "illüstrasyon"),
          role,
          period: periodRef.current || null,
          expectedDraftId: token.draftId,
          expectedLockVersion: token.lockVersion,
        }));
      });
      setUploadMessage(result.message ?? "Görsel işlemi tamamlanamadı.");
      if (!result.ok) return;
      if (role === "inline") {
        editor.chain().focus().insertContent({ type: "image", attrs: { mediaId } }).run();
        const saved = await enqueueSave();
        if (!saved.ok) setUploadMessage("Görsel eklendi ancak makale içindeki konumu kaydedilemedi. Metniniz bu ekranda korunuyor.");
      }
      form.reset();
      router.refresh();
    } catch (error) {
      setUploadMessage(error instanceof Error ? error.message : "Görsel işlemi tamamlanamadı.");
    } finally {
      setUploading(false);
    }
  }

  if (!editor) return <p className="editor-loading">Düzenleyici hazırlanıyor…</p>;

  return (
    <div className="wiki-editor-frame">
      {mutationBusy ? <p role="status">İşlem tamamlanana kadar düzenleme geçici olarak duraklatıldı.</p> : null}
      {status === "conflict" ? (
        <div role="alert">
          <p>Yazınız bu ekranda korunuyor. Kaydetme ve yayın durduruldu. Yeniden açmadan önce yazınızı kopyalayın.</p>
          <button type="button" onClick={() => {
            const blob = new Blob([JSON.stringify({ document: editor.getJSON(), period: periodRef.current || null, changeNote: changeNoteRef.current }, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url; link.download = `${state.entityId}-yerel-taslak.json`; link.click(); URL.revokeObjectURL(url);
          }}>Yerel taslağı indir</button>
          <a href={`/editor/${state.entityId}`} target="_blank" rel="noopener noreferrer">Sunucudaki sürümü yeni sekmede aç</a>
        </div>
      ) : null}
      <fieldset disabled={mutationBusy || !coordinator} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
      <div className="wiki-editor-toolbar" role="toolbar" aria-label="Metin biçimlendirme">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} aria-pressed={editor.isActive("bold")}>Kalın</button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} aria-pressed={editor.isActive("italic")}>İtalik</button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} aria-pressed={editor.isActive("heading", { level: 2 })}>Başlık</button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} aria-pressed={editor.isActive("bulletList")}>Liste</button>
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} aria-pressed={editor.isActive("blockquote")}>Alıntı</button>
        <button type="button" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>Tablo</button>
        <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>Geri al</button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>Yinele</button>
      </div>

      <div className="entity-link-control">
        <label htmlFor="entity-link">Seçili metni varlığa bağla</label>
        <div>
          <select id="entity-link" value={selectedEntityId} onChange={(event) => setSelectedEntityId(event.target.value)}>
            <option value="">Varlık seçin</option>
            {entityOptions.map((entity) => <option key={entity.id} value={entity.id}>{entity.name} · {entity.id}</option>)}
          </select>
          <button type="button" onClick={addEntityLink} disabled={!selectedEntityId}>Bağlantı ekle</button>
          <button type="button" onClick={() => editor.chain().focus().unsetLink().run()} disabled={!editor.isActive("link")}>Bağlantıyı kaldır</button>
        </div>
      </div>

      <EditorMediaContext.Provider value={state.draftMedia}>
        <EditorContent editor={editor} />
      </EditorMediaContext.Provider>

      <div className="wiki-editor-meta">
        <label>
          <span>Dönem kapsamı</span>
          <select value={period} onChange={(event) => { const next = event.target.value as Period | ""; editSequence.current += 1; periodRef.current = next; setPeriod(next); setStatus(conflictRef.current ? "conflict" : "dirty"); }}>
            <option value="">Dönemi belirtilmemiş</option>
            <option value="1300 civarı">1300 civarı</option>
            <option value="1600 civarı">1600 civarı</option>
          </select>
        </label>
        <label>
          <span>Değişiklik notu</span>
          <input value={changeNote} maxLength={500} onChange={(event) => { const next = event.target.value; editSequence.current += 1; changeNoteRef.current = next; setChangeNote(next); setStatus(conflictRef.current ? "conflict" : "dirty"); }} />
        </label>
      </div>

      <div className="wiki-editor-actions">
        <p className={`save-status save-status--${status}`} role="status">{SAVE_LABELS[status]}{message ? ` · ${message}` : ""}</p>
        <div>
          <button className="button" type="button" onClick={() => void enqueueSave()} disabled={status === "saving" || status === "conflict"}>Taslağı kaydet</button>
          <button className="button button--primary" type="button" onClick={publish} disabled={isPublishing || uploading || status === "saving" || status === "conflict"}>
            {isPublishing ? "Yayımlanıyor…" : "Yayımla"}
          </button>
        </div>
      </div>

      <form className="media-upload-form" onSubmit={uploadMedia}>
        <div className="media-upload-heading">
          <div><p className="eyebrow">Görsel sistemi</p><h3>Fotoğraf veya illüstrasyon ekle</h3></div>
          <p>Özgün dosya özel tutulur; küçük, orta ve büyük WebP sürümleri yayıma hazırlanır.</p>
        </div>
        <div className="media-upload-grid">
          <label><span>Dosya</span><input name="file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" required /></label>
          <label><span>Kullanım yeri</span><select name="role" defaultValue="gallery"><option value="gallery">Galeri</option><option value="cover">Kapak</option><option value="portrait">Portre</option><option value="inline">Makale içi</option></select></label>
          <label className="media-field-wide"><span>Türkçe alternatif metin</span><input name="alternativeTextTr" maxLength={500} required /></label>
          <label className="media-field-wide"><span>Açıklama</span><input name="captionTr" maxLength={1000} /></label>
          <label><span>Kaynak</span><input name="sourceLabel" maxLength={300} required /></label>
          <label><span>Üretici / kredi</span><input name="creatorCredit" maxLength={300} required /></label>
          <label><span>Kullanım / hak bilgisi</span><input name="rightsNote" maxLength={1000} required /></label>
          <label><span>Görsel niteliği</span><select name="visualKind" defaultValue="illüstrasyon"><option value="illüstrasyon">İllüstrasyon</option><option value="bölüm görüntüsü">Bölüm görüntüsü</option><option value="harita detayı">Harita detayı</option><option value="fotoğraf">Fotoğraf</option></select></label>
        </div>
        <div className="media-upload-actions">
          <p role="status">{uploadMessage}</p>
          <button className="button" type="submit" disabled={uploading || status === "conflict"}>{uploading ? "İşleniyor…" : "Görseli ekle"}</button>
        </div>
      </form>

      {state.draftMedia.length > 0 ? (
        <DraftMediaManager
          key={state.draftMedia.map((entry) => entry.mediaId).join(",")}
          entityId={state.entityId}
          initialMedia={state.draftMedia}
          disabled={status === "conflict"}
          mutate={async (operation) => {
            const result = await runMutation(async (token) => mediaResponse(await operation(token)));
            return { ok: result.ok, message: result.message ?? "İşlem tamamlanamadı." };
          }}
        />
      ) : null}

      <section className="revision-history" aria-labelledby="surum-gecmisi">
        <div className="section-heading"><p className="eyebrow">Değişmez kayıtlar</p><h2 id="surum-gecmisi">Sürüm geçmişi</h2></div>
        {state.revisions.length ? (
          <>
            {coordinator?.hasPendingDraft || status === "dirty" || status === "saving" ? <p>Önce mevcut taslağı yayımlayın; ardından geçmiş sürümü geri getirebilirsiniz. Taslağınız silinmez.</p> : null}
            <ol>
              {state.revisions.map((revision) => (
                <li key={revision.revisionId}>
                  <div>
                    <strong>Sürüm {revision.revisionNumber.toLocaleString("tr-TR")}</strong>
                    <span>{new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(revision.publishedAt))}</span>
                    <p>{revision.changeNote || "Değişiklik notu yok."}</p>
                  </div>
                  {state.publishedRevisionId !== revision.revisionId && state.publishedRevisionId ? (
                    <button className="button" type="button" onClick={() => void rollback(revision)} disabled={status === "conflict" || status === "dirty" || status === "saving" || coordinator?.hasPendingDraft}>Bu sürümü geri getir</button>
                  ) : <span className="current-revision">Yayında</span>}
                </li>
              ))}
            </ol>
          </>
        ) : <p>Henüz yayımlanmış sürüm yok.</p>}
      </section>
      </fieldset>
    </div>
  );
}
