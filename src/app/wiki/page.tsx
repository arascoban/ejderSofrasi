import type { Metadata } from "next";
import Link from "next/link";

import { EntityCard } from "@/components/entity-card";
import { getAllEntitySummaries } from "@/lib/data/repository";
import { getPublishedEditorialSearchText } from "@/lib/editorial/repository";
import { filterEntitySummaries } from "@/lib/domain/search";
import { ENTITY_TYPES, type EntityType, type Period } from "@/lib/domain/types";
import { entityTypeLabel } from "@/lib/domain/labels";

export const metadata: Metadata = { title: "Dünya arşivi" };

interface WikiDirectoryProps {
  searchParams: Promise<{ q?: string; type?: string; period?: string }>;
}

export default async function WikiDirectory({ searchParams }: WikiDirectoryProps) {
  const parameters = await searchParams;
  const query = (parameters.q ?? "").trim();
  const requestedType = ENTITY_TYPES.includes(parameters.type as EntityType)
    ? (parameters.type as EntityType)
    : null;
  const requestedPeriod = (["1300 civarı", "1600 civarı"] as const).includes(parameters.period as Period)
    ? (parameters.period as Period)
    : null;
  const [summaries, editorialTextByEntity] = await Promise.all([
    getAllEntitySummaries(),
    getPublishedEditorialSearchText(),
  ]);
  const entities = filterEntitySummaries(summaries, {
    query,
    type: requestedType,
    period: requestedPeriod,
    editorialTextByEntity,
  });
  const hasFilters = Boolean(query || requestedType || requestedPeriod);

  return (
    <main id="ana-icerik" className="page-shell">
      <header className="page-heading">
        <p className="eyebrow">Sabit kimlikli kayıtlar · ana zaman çizgisi</p>
        <h1>Dünya arşivi</h1>
        <p>Kişilerden kıtalara, eşyalardan tarihsel olaylara kadar doğrulanmış bütün kayıtları keşfet.</p>
      </header>

      <form className="directory-controls" action="/wiki" role="search">
        <label>
          <span>Arşivde ara</span>
          <input name="q" type="search" defaultValue={query} placeholder="Ad, takma ad veya sabit kimlik" />
        </label>
        <label>
          <span>Tür</span>
          <select name="type" defaultValue={requestedType ?? ""}>
            <option value="">Bütün türler</option>
            {ENTITY_TYPES.map((type) => <option key={type} value={type}>{entityTypeLabel(type)}</option>)}
          </select>
        </label>
        <label>
          <span>Dönem</span>
          <select name="period" defaultValue={requestedPeriod ?? ""}>
            <option value="">Bütün dönemler</option>
            <option value="1300 civarı">1300 civarı</option>
            <option value="1600 civarı">1600 civarı</option>
          </select>
        </label>
        <button className="button button--primary" type="submit">Göster</button>
      </form>

      <div className="directory-result" aria-live="polite">
        <strong>{entities.length.toLocaleString("tr-TR")}</strong> kayıt gösteriliyor
        {hasFilters && <Link className="clear-filters" href="/wiki">Filtreleri temizle</Link>}
      </div>
      {entities.length ? (
        <section className="entity-grid" aria-label="Varlık kayıtları">
          {entities.map((entity) => <EntityCard key={entity.id} entity={entity} />)}
        </section>
      ) : (
        <section className="empty-state">
          <h2>Kayıt bulunamadı</h2>
          <p>Yazımı veya tür filtresini değiştirerek yeniden deneyebilirsin.</p>
        </section>
      )}
    </main>
  );
}
