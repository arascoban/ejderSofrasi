/* eslint-disable @next/next/no-img-element -- Önizleme URL'si bağlı Supabase Storage projesinden gelir. */
"use client";

import { useState } from "react";
import type { EditorDraftMedia, EditorialActionResult } from "@/lib/editorial/editor-state";
import { removeDraftMediaAction, reorderDraftMediaAction } from "./actions";

const MEDIA_ROLE_LABELS: Record<EditorDraftMedia["role"], string> = {
  cover: "Kapak", portrait: "Portre", gallery: "Galeri", map_thumbnail: "Harita görseli", inline: "Makale içi",
};

export function DraftMediaManager({
  entityId,
  initialMedia,
  disabled,
  mutate,
}: {
  entityId: string;
  initialMedia: readonly EditorDraftMedia[];
  disabled: boolean;
  mutate: (operation: (token: { draftId: string; lockVersion: number }) => Promise<EditorialActionResult>) => Promise<{ ok: boolean; message: string }>;
}) {
  const [media, setMedia] = useState([...initialMedia]);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function move(index: number, offset: -1 | 1) {
    const target = index + offset;
    if (disabled || pending || target < 0 || target >= media.length) return;
    const next = [...media];
    [next[index], next[target]] = [next[target], next[index]];
    setPending(true);
      try {
        const result = await mutate((token) => reorderDraftMediaAction(entityId, next.map((entry) => entry.mediaId), token.draftId, token.lockVersion));
        setMessage(result.message);
        if (result.ok) setMedia(next);
      } catch {
        setMessage("Galeri sırası doğrulanamadı. Mevcut sıra korundu.");
      } finally {
        setPending(false);
      }
  }

  async function remove(mediaId: string) {
    if (disabled || pending) return;
    setPending(true);
      try {
        const result = await mutate((token) => removeDraftMediaAction(entityId, mediaId, token.draftId, token.lockVersion));
        setMessage(result.message);
        if (result.ok) {
          setMedia((current) => current.filter((entry) => entry.mediaId !== mediaId));
        }
      } catch {
        setMessage("Görselin kaldırıldığı doğrulanamadı. Galeri korundu.");
      } finally {
        setPending(false);
      }
  }

  return (
    <section className="draft-media-manager" aria-labelledby="taslak-gorselleri">
      <div className="section-heading"><p className="eyebrow">Taslak galerisi</p><h2 id="taslak-gorselleri">Bağlı görseller</h2></div>
      <div>
        <ul>
          {media.map((entry, index) => (
            <li key={entry.mediaId}>
              <img src={entry.previewUrl} alt={entry.alternativeTextTr} />
              <div><strong>{entry.captionTr || entry.alternativeTextTr}</strong><small>{MEDIA_ROLE_LABELS[entry.role]} · {entry.period ?? "Dönemi belirtilmemiş"}</small></div>
              <div className="draft-media-controls">
                <button type="button" onClick={() => move(index, -1)} disabled={pending || disabled || index === 0} aria-label="Görseli öne taşı">↑</button>
                <button type="button" onClick={() => move(index, 1)} disabled={pending || disabled || index === media.length - 1} aria-label="Görseli geriye taşı">↓</button>
                <button type="button" onClick={() => remove(entry.mediaId)} disabled={pending || disabled}>Kaldır</button>
              </div>
            </li>
          ))}
        </ul>
        <p className="save-status" role="status">{message}</p>
      </div>
    </section>
  );
}
