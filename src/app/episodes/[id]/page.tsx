import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getAllEpisodes,
  getEntityById,
  getEpisodeById,
  getEpisodeLore,
  getEpisodeTimeline,
  getEpisodeTravel,
  getFactById,
} from "@/lib/data/repository";
import { entityTypeLabel } from "@/lib/domain/labels";
import type { Entity, TimelineEventStatus, TravelPlace, TravelRecord } from "@/lib/domain/types";
import { entityHref, episodeHref, loreHref } from "@/lib/routing/entity";

interface EpisodePageProps {
  params: Promise<{ id: string }>;
}

const EVENT_STATUS_LABELS: Record<TimelineEventStatus, string> = {
  occurred: "Gerçekleşen olay",
  historical: "Tarihsel anlatı",
  planned: "Planlanan olay",
  revealed: "Açığa çıkan bilgi",
};

const TRAVEL_STATUS_LABELS: Record<TravelRecord["status"], string> = {
  source_reported: "Kaynakta aktarılan hareket",
  in_progress: "Devam eden yolculuk",
  completed: "Tamamlanan yolculuk",
  temporal_transition: "Zamansal geçiş",
  reviewed_split_route: "Ayrı güzergâh",
};

export async function generateStaticParams() {
  return (await getAllEpisodes()).map(({ id }) => ({ id }));
}

export async function generateMetadata({ params }: EpisodePageProps): Promise<Metadata> {
  const episode = await getEpisodeById((await params).id);
  return episode ? { title: `${episode.id} · ${episode.title}` } : {};
}

async function resolveEntities(ids: string[]): Promise<Entity[]> {
  const records = await Promise.all(ids.map((id) => getEntityById(id)));
  return records.filter((entity): entity is Entity => entity !== null);
}

async function EntityLinks({ ids }: { ids: string[] }) {
  const entities = await resolveEntities(ids);
  if (!entities.length) return <span className="muted-copy">Kayıt yok</span>;
  return (
    <ul className="entity-chip-list">
      {entities.map((entity) => (
        <li key={entity.id}><Link href={entityHref(entity.slug)}>{entity.name}<small>{entityTypeLabel(entity.type)}</small></Link></li>
      ))}
    </ul>
  );
}

async function TravelPlaceView({ place }: { place: TravelPlace }) {
  const entityId = place.entity_id ?? place.reviewed_context_id ?? place.context_id ?? null;
  const entity = entityId ? await getEntityById(entityId) : null;
  if (entity) return <Link href={entityHref(entity.slug)}>{place.label ?? entity.name}</Link>;
  return <span>{place.label ?? "Konum belirlenmemiş"}</span>;
}

export default async function EpisodeDetailPage({ params }: EpisodePageProps) {
  const id = (await params).id.toUpperCase();
  const episode = await getEpisodeById(id);
  if (!episode) notFound();
  const [events, travels, loreRecords, allEpisodes] = await Promise.all([
    getEpisodeTimeline(id),
    getEpisodeTravel(id),
    getEpisodeLore(id),
    getAllEpisodes(),
  ]);
  const currentIndex = allEpisodes.findIndex((candidate) => candidate.id === episode.id);
  const previous = currentIndex > 0 ? allEpisodes[currentIndex - 1] : null;
  const next = currentIndex < allEpisodes.length - 1 ? allEpisodes[currentIndex + 1] : null;

  return (
    <main id="ana-icerik" className="wiki-shell">
      <nav className="breadcrumb" aria-label="İçerik yolu">
        <Link href="/episodes">Bölümler</Link><span aria-hidden="true">/</span><span>{episode.id}</span>
      </nav>
      <header className="episode-hero">
        <div>
          <p className="eyebrow">Ana zaman çizgisi · bölüm {episode.number}</p>
          <h1>{episode.title}</h1>
        </div>
        <dl className="entity-infobox">
          <div><dt>Bölüm</dt><dd>{episode.id}</dd></div>
          <div><dt>Anlatı dönemi</dt><dd>{episode.narrative_periods.join(" · ") || "Belirtilmemiş"}</dd></div>
          <div><dt>Önemli olay</dt><dd>{events.length}</dd></div>
          <div><dt>Seyahat kaydı</dt><dd>{travels.length}</dd></div>
        </dl>
      </header>

      {events.length > 0 && (
        <section className="archive-section" aria-labelledby="olaylar-baslik">
          <div className="section-heading"><p className="eyebrow">Zaman çizgisi</p><h2 id="olaylar-baslik">Önemli olaylar</h2></div>
          <div className="event-list">
            {await Promise.all(events.map(async (event) => {
              const [summary, eventEntity] = await Promise.all([getFactById(event.summary_fact_id), getEntityById(event.event_id)]);
              return (
                <article key={event.event_id}>
                  <p className="record-kicker">{EVENT_STATUS_LABELS[event.event_status]} · {event.period ?? "Dönemi belirtilmemiş"}</p>
                  <h3>{eventEntity ? <Link href={entityHref(eventEntity.slug)}>{event.title}</Link> : event.title}</h3>
                  {summary && <p>{summary.text}</p>}
                  {event.participant_ids.length > 0 && <div><strong>Katılımcılar</strong><EntityLinks ids={event.participant_ids} /></div>}
                  {event.location_ids.length > 0 && <div><strong>Yerler</strong><EntityLinks ids={event.location_ids} /></div>}
                  {event.related_entity_ids.length > 0 && <div><strong>İlgili kayıtlar</strong><EntityLinks ids={event.related_entity_ids} /></div>}
                  <details className="evidence-details"><summary>Kaynak izini göster</summary><p>{event.source_refs.map((source) => source.source_id).join(" · ")}</p></details>
                </article>
              );
            }))}
          </div>
        </section>
      )}

      {travels.length > 0 && (
        <section className="archive-section" aria-labelledby="seyahat-baslik">
          <div className="section-heading"><p className="eyebrow">Hareket kayıtları</p><h2 id="seyahat-baslik">Seyahatler</h2></div>
          <ol className="travel-list">
            {travels.map((travel) => (
              <li key={travel.id}>
                <div className="travel-heading"><span>{travel.id}</span><strong>{TRAVEL_STATUS_LABELS[travel.status]}</strong></div>
                <div className="travel-route">
                  <TravelPlaceView place={travel.origin} />
                  <span aria-hidden="true">→</span>
                  <TravelPlaceView place={travel.destination} />
                </div>
                {travel.branch && <p><strong>Güzergâh kolu:</strong> {travel.branch}</p>}
                <div><strong>Yolcular</strong><EntityLinks ids={travel.traveler_ids} /></div>
                {travel.waypoints.length > 0 && (
                  <p className="travel-waypoints"><strong>Ara duraklar:</strong> {travel.waypoints.map((place) => place.label ?? "belirsiz durak").join(" · ")}</p>
                )}
                <details className="evidence-details"><summary>Kaynak izini göster</summary><p>{travel.source_refs.map((source) => source.source_id).join(" · ")}</p></details>
              </li>
            ))}
          </ol>
        </section>
      )}

      {loreRecords.length > 0 && (
        <section className="archive-section" aria-labelledby="lore-baslik">
          <div className="section-heading"><p className="eyebrow">Dünya bilgisi</p><h2 id="lore-baslik">Bu bölümdeki lore</h2></div>
          <ul className="lore-record-list">
            {loreRecords.map((record) => (
              <li key={record.id}>
                <Link href={loreHref(record.id)}><strong>{record.subject}</strong><span>{record.text}</span></Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="archive-section" aria-labelledby="kayitlar-baslik">
        <div className="section-heading"><p className="eyebrow">Bilgi ağı</p><h2 id="kayitlar-baslik">Bölümde geçen kayıtlar</h2></div>
        <EntityLinks ids={episode.entity_ids} />
      </section>

      <nav className="episode-pagination" aria-label="Bölümler arasında gezinme">
        {previous ? <Link href={episodeHref(previous.id)}>← {previous.id}</Link> : <span />}
        <Link href="/episodes">Bütün bölümler</Link>
        {next ? <Link href={episodeHref(next.id)}>{next.id} →</Link> : <span />}
      </nav>
    </main>
  );
}
