import type { Metadata } from "next";
import Link from "next/link";

import { getAllEpisodes } from "@/lib/data/repository";
import { episodeHref } from "@/lib/routing/entity";

export const metadata: Metadata = { title: "Bölümler" };

export default async function EpisodesPage() {
  const episodes = await getAllEpisodes();
  return (
    <main id="ana-icerik" className="page-shell">
      <header className="page-heading">
        <p className="eyebrow">Ana zaman çizgisi · EP00–EP24</p>
        <h1>Bölümler</h1>
        <p>Her bölümün önemli olaylarını, seyahat kayıtlarını, lore notlarını ve bağlantılı dünya varlıklarını birlikte incele.</p>
      </header>
      <ol className="episode-directory">
        {episodes.map((episode) => (
          <li key={episode.id}>
            <Link href={episodeHref(episode.id)}>
              <span className="episode-directory__id">{episode.id}</span>
              <strong>{episode.title}</strong>
              <small>
                {episode.narrative_periods.length ? episode.narrative_periods.join(" · ") : "Anlatı dönemi belirtilmemiş"}
                {` · ${episode.timeline_event_ids.length} olay · ${episode.travel_ids.length} seyahat`}
              </small>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
