import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { MapReturnLink } from "@/components/map-return-link";
import { WikiArticle } from "@/components/wiki-article";
import { getAllEntitySummaries, getEntityById, getEntityBySlug, getEntityEraState } from "@/lib/data/repository";
import { getEntityPage } from "@/lib/domain/entity-page";
import { confidenceLabel, entityTypeLabel, incomingRelationLabel, periodLabel, periodLabels, relationLabel, temporalBasisLabel } from "@/lib/domain/labels";
import type { Fact, Period, Relationship } from "@/lib/domain/types";
import { getPublishedEditorialContent } from "@/lib/editorial/repository";
import { entityHref, episodeHref } from "@/lib/routing/entity";

interface EntityPageProps {
  params: Promise<{ slug: string }>;
}

// Published editorial text is read from Supabase at request time. Keeping
// this route dynamic prevents a build from depending on a reachable database
// and avoids baking one revision into a static HTML artifact.
export const dynamic = "force-dynamic";

const ERA_STATE_LABELS = {
  attested: "Bu dönemde kaynakla destekleniyor",
  reported_lost: "Bu dönemde kayıp olduğu bildiriliyor",
  unknown: "Bu dönem için bilgi yok",
  conflicted: "Bu dönem için çelişkili kayıt var",
} as const;

export async function generateStaticParams() {
  return (await getAllEntitySummaries()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: EntityPageProps): Promise<Metadata> {
  const entity = await getEntityBySlug((await params).slug);
  return entity ? { title: entity.name, description: `${entity.name} — ${entityTypeLabel(entity.type)}` } : {};
}

function factPeriods(fact: Fact): string {
  const periods = [...new Set(fact.assertions.map((assertion) => assertion.period).filter(Boolean))] as Period[];
  return periodLabels(periods);
}

async function RelationItem({ relationship, direction }: { relationship: Relationship; direction: "incoming" | "outgoing" }) {
  const relatedId = direction === "outgoing" ? relationship.object_id : relationship.subject_id;
  const related = await getEntityById(relatedId);
  if (!related) return null;
  return (
    <li>
      <span>{direction === "outgoing" ? relationLabel(relationship.relation) : incomingRelationLabel(relationship.relation)}</span>
      <Link href={entityHref(related.slug)}>{related.name}</Link>
      <small>{periodLabel(relationship.period)} · {relationship.episodes.join(", ") || "Bölüm belirtilmemiş"}</small>
      <details className="evidence-details relation-evidence">
        <summary>İlişki kanıtı</summary>
        {relationship.assertions.map((assertion, index) => (
          <p key={`${relationship.id}-${index}`}>{assertion.evidence} <span>({assertion.source_refs.map((source) => source.source_id).join(" · ")})</span></p>
        ))}
      </details>
    </li>
  );
}

export default async function EntityWikiPage({ params }: EntityPageProps) {
  const { slug } = await params;
  const resolved = await getEntityBySlug(slug);
  if (!resolved) notFound();
  const page = await getEntityPage(resolved.id);
  if (!page) notFound();
  const publishedEditorial = await getPublishedEditorialContent(page.entity.id);

  const eraStates = await Promise.all(
    (["1300 civarı", "1600 civarı"] as const).map(async (period) => ({
      period,
      result: await getEntityEraState(page.entity.id, period),
    })),
  );
  const datedFacts = page.facts.filter((fact) => fact.assertions.some((assertion) => assertion.period));
  const undatedFacts = page.facts.filter((fact) => fact.assertions.every((assertion) => !assertion.period));

  return (
    <main id="ana-icerik" className="wiki-shell">
      <nav className="breadcrumb" aria-label="İçerik yolu">
        <Link href="/wiki">Dünya arşivi</Link><span aria-hidden="true">/</span><span>{page.entity.name}</span>
        <Suspense fallback={null}><MapReturnLink /></Suspense>
      </nav>

      <header className="entity-hero">
        <div>
          <p className="eyebrow">{entityTypeLabel(page.entity.type)} · {page.entity.id}</p>
          <h1>{page.entity.name}</h1>
          {page.entity.aliases.length > 0 && <p className="aliases">Diğer adlar: {page.entity.aliases.join(", ")}</p>}
        </div>
        <dl className="entity-infobox">
          <div><dt>Tür</dt><dd>{entityTypeLabel(page.entity.type)}</dd></div>
          <div><dt>Kaynak durumu</dt><dd>{confidenceLabel(page.entity.confidence)}</dd></div>
          <div><dt>İlk kaynak kaydı</dt><dd>{page.entity.first_appearance ?? "Bölüm kaydı yok"}</dd></div>
          <div><dt>Bölüm sayısı</dt><dd>{page.entity.episodes.length.toLocaleString("tr-TR")}</dd></div>
        </dl>
      </header>

      {publishedEditorial ? <WikiArticle content={publishedEditorial} /> : null}

      <section className="era-evidence" aria-labelledby="donem-baslik">
        <div>
          <p className="eyebrow">Tarihsel bağlam</p>
          <h2 id="donem-baslik">Dönem kanıtı</h2>
        </div>
        <div className="era-grid">
          {eraStates.map(({ period, result }) => (
            <article key={period} data-state={result.state}>
              <strong>{periodLabel(period)}</strong>
              <span>{ERA_STATE_LABELS[result.state]}</span>
            </article>
          ))}
        </div>
      </section>

      {datedFacts.length > 0 && (
        <section className="lore-section" aria-labelledby="tarihli-olgular">
          <div className="section-heading"><p className="eyebrow">Kaynak destekli</p><h2 id="tarihli-olgular">Dönemi belirtilen bilgiler</h2></div>
          <ul className="fact-list">
            {datedFacts.map((fact) => <FactItem key={fact.id} fact={fact} />)}
          </ul>
        </section>
      )}

      {undatedFacts.length > 0 && (
        <section className="lore-section lore-section--undated" aria-labelledby="tarihsiz-olgular">
          <div className="section-heading">
            <p className="eyebrow">Tarihsel konumu bilinmiyor</p>
            <h2 id="tarihsiz-olgular">Dönemi belirtilmemiş bilgiler</h2>
            <p>Bu kayıtlar Günümüz ve Gümüş Tanrısının 1673 yılı görünümlerine otomatik olarak aktarılmaz.</p>
          </div>
          <ul className="fact-list">
            {undatedFacts.map((fact) => <FactItem key={fact.id} fact={fact} />)}
          </ul>
        </section>
      )}

      {page.facts.length === 0 && (
        <section className="empty-state">
          <p className="eyebrow">Kanonik kayıt</p>
          <h2>Bu varlık için henüz ayrıntılı lore bulunmuyor.</h2>
          <p>Adı ve türü doğrulanmış olabilir; kaynakta bulunmayan bir biyografi üretilmedi.</p>
        </section>
      )}

      {(page.relations.outgoing.length > 0 || page.relations.incoming.length > 0) && (
        <section className="lore-section" aria-labelledby="iliski-baslik">
          <div className="section-heading"><p className="eyebrow">Bilgi ağı</p><h2 id="iliski-baslik">Bağlantılı kayıtlar</h2></div>
          <ul className="relation-list">
            {page.relations.outgoing.map((relationship) => (
              <RelationItem key={relationship.id} relationship={relationship} direction="outgoing" />
            ))}
            {page.relations.incoming.map((relationship) => (
              <RelationItem key={relationship.id} relationship={relationship} direction="incoming" />
            ))}
          </ul>
        </section>
      )}

      <section className="episode-strip" aria-labelledby="bolum-baslik">
        <div><p className="eyebrow">Kaynak izi</p><h2 id="bolum-baslik">Bölüm kayıtları</h2></div>
        {page.entity.episodes.length ? (
          <ul>{page.entity.episodes.map((episode) => <li key={episode}><Link href={episodeHref(episode)}>{episode}</Link></li>)}</ul>
        ) : <p>Bu kanonik ad için bölüm referansı bulunmuyor.</p>}
      </section>

      {page.entity.conflict_ids?.length ? (
        <aside className="review-note">
          <strong>İnceleme notu</strong>
          <p>Bu kayıtla bağlantılı {page.entity.conflict_ids.length} açık kaynak belirsizliği bulunuyor. İlgili iddialar kesin bilgi gibi sunulmamalıdır.</p>
        </aside>
      ) : null}
    </main>
  );
}

function FactItem({ fact }: { fact: Fact }) {
  const sourceCount = new Set(fact.assertions.flatMap((assertion) => assertion.source_refs.map((source) => source.source_id))).size;
  return (
    <li>
      <p>{fact.text}</p>
      <div><span>{factPeriods(fact)}</span><span>{sourceCount} kaynak kaydı</span></div>
      <details className="evidence-details">
        <summary>Kanıt ayrıntıları</summary>
        <ul>
          {fact.assertions.map((assertion, index) => (
            <li key={`${fact.id}-${index}`}>
              <strong>{periodLabel(assertion.period)}</strong>
              <span>{temporalBasisLabel(assertion.temporal_basis)} · {confidenceLabel(assertion.confidence)}</span>
              <span>{assertion.source_refs.map((source) => source.source_id).join(" · ")}</span>
            </li>
          ))}
        </ul>
      </details>
    </li>
  );
}
