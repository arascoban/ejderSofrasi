import type { Metadata } from "next";
import Link from "next/link";

import { getAllEpisodes, getAllLore } from "@/lib/data/repository";
import { loreHref } from "@/lib/routing/entity";

export const metadata: Metadata = { title: "Lore arşivi" };

interface LoreDirectoryProps {
  searchParams: Promise<{ q?: string; episode?: string }>;
}

export default async function LoreDirectory({ searchParams }: LoreDirectoryProps) {
  const parameters = await searchParams;
  const query = (parameters.q ?? "").trim();
  const episodes = await getAllEpisodes();
  const episodeIds = new Set(episodes.map((episode) => episode.id));
  const requestedEpisode = episodeIds.has((parameters.episode ?? "").toUpperCase()) ? parameters.episode?.toUpperCase() ?? null : null;
  const normalizedQuery = query.toLocaleLowerCase("tr-TR");
  const records = (await getAllLore()).filter((record) => {
    if (requestedEpisode && record.episode !== requestedEpisode) return false;
    if (!normalizedQuery) return true;
    return [record.id, record.subject, record.text].some((value) => value.toLocaleLowerCase("tr-TR").includes(normalizedQuery));
  });

  return (
    <main id="ana-icerik" className="page-shell">
      <header className="page-heading">
        <p className="eyebrow">Kaynaklardan ayrıştırılmış dünya bilgisi</p>
        <h1>Lore arşivi</h1>
        <p>Varlık biyografilerine sığmayan tarih, kültür, büyü ve dünya düzeni kayıtlarını kaynak bölümleriyle birlikte keşfet.</p>
      </header>
      <form className="directory-controls directory-controls--compact" action="/lore" role="search">
        <label><span>Lore içinde ara</span><input name="q" type="search" defaultValue={query} placeholder="Konu, metin veya LOR kimliği" /></label>
        <label>
          <span>Bölüm</span>
          <select name="episode" defaultValue={requestedEpisode ?? ""}>
            <option value="">Bütün bölümler</option>
            {episodes.map((episode) => <option key={episode.id} value={episode.id}>{episode.id}</option>)}
          </select>
        </label>
        <button className="button button--primary" type="submit">Göster</button>
      </form>
      <div className="directory-result" aria-live="polite"><strong>{records.length}</strong> lore kaydı gösteriliyor</div>
      {records.length > 0 ? (
        <ul className="lore-directory">
          {records.map((record) => (
            <li key={record.id}>
              <Link href={loreHref(record.id)}>
                <span className="record-kicker">{record.id} · {record.episode} · {record.period ?? "Dönemi belirtilmemiş"}</span>
                <strong>{record.subject}</strong>
                <p>{record.text}</p>
              </Link>
            </li>
          ))}
        </ul>
      ) : <section className="empty-state"><h2>Kayıt bulunamadı</h2><p>Arama metnini veya bölüm filtresini değiştir.</p></section>}
    </main>
  );
}
