import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getAllLore, getEntityById, getLoreById } from "@/lib/data/repository";
import { entityTypeLabel, temporalBasisLabel } from "@/lib/domain/labels";
import { entityHref, episodeHref } from "@/lib/routing/entity";

interface LorePageProps { params: Promise<{ id: string }> }

export async function generateStaticParams() {
  return (await getAllLore()).map(({ id }) => ({ id }));
}

export async function generateMetadata({ params }: LorePageProps): Promise<Metadata> {
  const record = await getLoreById((await params).id);
  return record ? { title: record.subject, description: record.text } : {};
}

export default async function LorePage({ params }: LorePageProps) {
  const record = await getLoreById((await params).id);
  if (!record) notFound();
  const subject = record.subject_id ? await getEntityById(record.subject_id) : null;
  return (
    <main id="ana-icerik" className="wiki-shell lore-page">
      <nav className="breadcrumb" aria-label="İçerik yolu">
        <Link href="/lore">Lore arşivi</Link><span aria-hidden="true">/</span><span>{record.id}</span>
      </nav>
      <article className="standalone-lore">
        <p className="eyebrow">{record.id} · {record.episode}</p>
        <h1>{record.subject}</h1>
        <p className="standalone-lore__text">{record.text}</p>
        <dl className="entity-infobox">
          <div><dt>Dönem</dt><dd>{record.period ?? "Dönemi belirtilmemiş"}</dd></div>
          <div><dt>Kaynak bölüm</dt><dd><Link href={episodeHref(record.episode)}>{record.episode}</Link></dd></div>
          <div><dt>Zamansal dayanak</dt><dd>{temporalBasisLabel(record.temporal_basis)}</dd></div>
          {subject && <div><dt>Bağlı kayıt</dt><dd><Link href={entityHref(subject.slug)}>{subject.name} · {entityTypeLabel(subject.type)}</Link></dd></div>}
        </dl>
        <details className="evidence-details" open>
          <summary>Kaynak izi</summary>
          <ul>{record.source_refs.map((source, index) => <li key={`${source.source_id}-${index}`}>{source.source_id}{source.pointer ? ` · ${source.pointer}` : source.line ? ` · satır ${source.line}` : ""}</li>)}</ul>
        </details>
      </article>
    </main>
  );
}
