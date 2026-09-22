import type { Metadata } from "next";
import Link from "next/link";

import { EntityCard } from "@/components/entity-card";
import { getAllEntitySummaries } from "@/lib/data/repository";
import { getPublishedEditorialSearchText } from "@/lib/editorial/repository";
import { entityTypeLabel, PERIOD_OPTIONS, periodFromUrl } from "@/lib/domain/labels";
import { filterEntitySummaries } from "@/lib/domain/search";
import { ENTITY_TYPES, type EntityType } from "@/lib/domain/types";

export const metadata: Metadata = { title: "Global arama" };

interface SearchPageProps {
  searchParams: Promise<{ q?: string; type?: string; period?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const parameters = await searchParams;
  const query = (parameters.q ?? "").trim();
  const type = ENTITY_TYPES.includes(parameters.type as EntityType) ? parameters.type as EntityType : null;
  const period = periodFromUrl(parameters.period);
  const [summaries, editorialTextByEntity] = await Promise.all([
    getAllEntitySummaries(),
    getPublishedEditorialSearchText(),
  ]);
  const results = filterEntitySummaries(summaries, { query, type, period, editorialTextByEntity });

  return (
    <main id="ana-icerik" className="page-shell">
      <header className="page-heading">
        <p className="eyebrow">Türkçe bilgi ağı</p>
        <h1>Global arama</h1>
        <p>Ad, takma ad, eski kimlik, slug veya yayımlanmış makale metniyle dünyayı ara.</p>
      </header>
      <form className="directory-controls" action="/search" role="search">
        <label>
          <span>Arama</span>
          <input autoFocus name="q" type="search" defaultValue={query} placeholder="Akmer, col sehri, NPC-0059…" />
        </label>
        <label>
          <span>Tür</span>
          <select name="type" defaultValue={type ?? ""}>
            <option value="">Bütün türler</option>
            {ENTITY_TYPES.map((item) => <option key={item} value={item}>{entityTypeLabel(item)}</option>)}
          </select>
        </label>
        <label>
          <span>Dönem</span>
          <select name="period" defaultValue={period ?? ""}>
            <option value="">Bütün dönemler</option>
            {PERIOD_OPTIONS.map((option) => <option key={option.value} value={option.urlToken}>{option.label}</option>)}
          </select>
        </label>
        <button className="button button--primary" type="submit">Ara</button>
      </form>
      <div className="directory-result" aria-live="polite">
        <strong>{results.length.toLocaleString("tr-TR")}</strong> kayıt bulundu
        {(query || type || period) && <Link className="clear-filters" href="/search">Filtreleri temizle</Link>}
      </div>
      {results.length ? (
        <section className="entity-grid" aria-label="Arama sonuçları">
          {results.map((entity) => <EntityCard key={entity.id} entity={entity} />)}
        </section>
      ) : (
        <section className="empty-state"><h2>Sonuç bulunamadı</h2><p>Yazımı, türü veya dönemi değiştirerek yeniden dene.</p></section>
      )}
    </main>
  );
}
