"use client";

import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import type { EntitySummary, Period } from "@/lib/domain/types";
import { editorialExtensions } from "@/lib/editorial/extensions";
import type { EditorArticleState } from "@/lib/editorial/editor-state";
import { MAX_MEDIA_BYTES } from "@/lib/editorial/media-processing";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { processMediaAction, publishDraftAction, saveDraftAction } from "./actions";

type SaveStatus = "idle" | "dirty" | "saving" | "saved" | "error" | "conflict";

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
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [message, setMessage] = useState("");
  const [selectedEntityId, setSelectedEntityId] = useState("");
  const [isPublishing, startPublishing] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const lockVersion = useRef<number | null>(state.lockVersion);
  const lastSaved = useRef(JSON.stringify(state.document));
  const saveQueue = useRef(Promise.resolve<number | null>(state.lockVersion));

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      ...editorialExtensions,
      Placeholder.configure({ placeholder: "Bu varlık için wiki makalesini Türkçe yazın…" }),
    ],
    content: state.document,
    editorProps: {
      attributes: {
        class: "wiki-editor-content",
        "aria-label": "Wiki makalesi",
      },
    },
    onUpdate: () => setStatus("dirty"),
  });

  const enqueueSave = useCallback(() => {
    if (!editor) return Promise.resolve(lockVersion.current);
    const document = editor.getJSON();
    const serialized = JSON.stringify(document);
    if (serialized === lastSaved.current && status !== "dirty" && lockVersion.current !== null) {
      return Promise.resolve(lockVersion.current);
    }

    setStatus("saving");
    saveQueue.current = saveQueue.current.then(async () => {
      const result = await saveDraftAction({
        entityId: state.entityId,
        document,
        baseCoreReleaseId: state.baseCoreReleaseId,
        period: period || null,
        changeNote,
        expectedLockVersion: lockVersion.current,
      });
      setMessage(result.message);
      if (!result.ok || result.lockVersion === undefined) {
        setStatus(result.conflict ? "conflict" : "error");
        return null;
      }
      lockVersion.current = result.lockVersion;
      lastSaved.current = serialized;
      setStatus("saved");
      return result.lockVersion;
    });
    return saveQueue.current;
  }, [changeNote, editor, period, state.baseCoreReleaseId, state.entityId, status]);

  useEffect(() => {
    if (status !== "dirty") return;
    const timer = window.setTimeout(() => void enqueueSave(), 1_600);
    return () => window.clearTimeout(timer);
  }, [enqueueSave, status]);

  function addEntityLink() {
    if (!editor || !selectedEntityId) return;
    editor.chain().focus().extendMarkRange("link").setMark("link", {
      href: `/entity/${selectedEntityId}`,
      entityId: selectedEntityId,
    }).run();
  }

  function publish() {
    startPublishing(async () => {
      const savedLock = await enqueueSave();
      if (savedLock === null || status === "conflict") return;
      const result = await publishDraftAction(state.entityId, savedLock, changeNote);
      setMessage(result.message);
      setStatus(result.ok ? "saved" : result.conflict ? "conflict" : "error");
      if (result.ok) window.location.reload();
    });
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

    setUploading(true);
    setUploadMessage("Önce taslak kaydediliyor…");
    const savedLock = await enqueueSave();
    if (savedLock === null) {
      setUploading(false);
      setUploadMessage("Taslak kaydedilemediği için görsel yüklenmedi.");
      return;
    }

    const mediaId = crypto.randomUUID();
    const originalPath = `${userId}/${mediaId}/original.${extension}`;
    const supabase = createSupabaseBrowserClient();
    setUploadMessage("Özgün görsel özel depoya yükleniyor…");
    const uploaded = await supabase.storage.from("wiki-originals").upload(originalPath, file, {
      contentType: file.type,
      upsert: false,
    });
    if (uploaded.error) {
      setUploading(false);
      setUploadMessage(`Yükleme başarısız: ${uploaded.error.message}`);
      return;
    }

    const role = String(formData.get("role") ?? "gallery") as "cover" | "portrait" | "gallery" | "inline";
    setUploadMessage("Görsel doğrulanıyor ve yayın boyutları hazırlanıyor…");
    const result = await processMediaAction({
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
      period: period || null,
    });
    if (!result.ok) {
      setUploading(false);
      setUploadMessage(result.message);
      return;
    }

    if (role === "inline") {
      editor.chain().focus().insertContent({ type: "image", attrs: { mediaId } }).run();
      setStatus("dirty");
      await enqueueSave();
    }
    setUploadMessage(result.message);
    setUploading(false);
    form.reset();
    window.location.reload();
  }

  if (!editor) return <p className="editor-loading">Düzenleyici hazırlanıyor…</p>;

  return (
    <div className="wiki-editor-frame">
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

      <EditorContent editor={editor} />

      <div className="wiki-editor-meta">
        <label>
          <span>Dönem kapsamı</span>
          <select value={period} onChange={(event) => { setPeriod(event.target.value as Period | ""); setStatus("dirty"); }}>
            <option value="">Dönemi belirtilmemiş</option>
            <option value="1300 civarı">1300 civarı</option>
            <option value="1600 civarı">1600 civarı</option>
          </select>
        </label>
        <label>
          <span>Değişiklik notu</span>
          <input value={changeNote} maxLength={500} onChange={(event) => { setChangeNote(event.target.value); setStatus("dirty"); }} />
        </label>
      </div>

      <div className="wiki-editor-actions">
        <p className={`save-status save-status--${status}`} role="status">{SAVE_LABELS[status]}{message ? ` · ${message}` : ""}</p>
        <div>
          <button className="button" type="button" onClick={() => void enqueueSave()} disabled={status === "saving" || status === "conflict"}>Taslağı kaydet</button>
          <button className="button button--primary" type="button" onClick={publish} disabled={isPublishing || status === "saving" || status === "conflict"}>
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
    </div>
  );
}
