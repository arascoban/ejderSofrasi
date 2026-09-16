/* eslint-disable @next/next/no-img-element -- Önizleme URL'si bağlı Supabase Storage projesinden gelir. */
"use client";

import { useState, useTransition } from "react";
import type { EditorDraftMedia } from "@/lib/editorial/editor-state";
import { removeDraftMediaAction, reorderDraftMediaAction } from "./actions";

export function DraftMediaManager({
  entityId,
  initialMedia,
}: {
  entityId: string;
  initialMedia: readonly EditorDraftMedia[];
}) {
  const [media, setMedia] = useState([...initialMedia]);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function move(index: number, offset: -1 | 1) {
    const target = index + offset;
    if (target < 0 || target >= media.length) return;
    const next = [...media];
    [next[index], next[target]] = [next[target], next[index]];
    setMedia(next);
    startTransition(async () => {
      const result = await reorderDraftMediaAction(entityId, next.map((entry) => entry.mediaId));
      setMessage(result.message);
      if (!result.ok) setMedia([...initialMedia]);
    });
  }

  function remove(mediaId: string) {
    startTransition(async () => {
      const result = await removeDraftMediaAction(entityId, mediaId);
      setMessage(result.message);
      if (result.ok) setMedia((current) => current.filter((entry) => entry.mediaId !== mediaId));
    });
  }

  return (
    <section className="draft-media-manager" aria-labelledby="taslak-gorselleri">
      <div className="section-heading"><p className="eyebrow">Taslak galerisi</p><h2 id="taslak-gorselleri">Bağlı görseller</h2></div>
      <div>
        <ul>
          {media.map((entry, index) => (
            <li key={entry.mediaId}>
              <img src={entry.previewUrl} alt={entry.alternativeTextTr} />
              <div><strong>{entry.captionTr || entry.alternativeTextTr}</strong><small>{entry.role} · {entry.period ?? "Dönemi belirtilmemiş"}</small></div>
              <div className="draft-media-controls">
                <button type="button" onClick={() => move(index, -1)} disabled={pending || index === 0} aria-label="Görseli öne taşı">↑</button>
                <button type="button" onClick={() => move(index, 1)} disabled={pending || index === media.length - 1} aria-label="Görseli geriye taşı">↓</button>
                <button type="button" onClick={() => remove(entry.mediaId)} disabled={pending}>Kaldır</button>
              </div>
            </li>
          ))}
        </ul>
        <p className="save-status" role="status">{message}</p>
      </div>
    </section>
  );
}
