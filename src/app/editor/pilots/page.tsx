import type { Metadata } from "next";
import Link from "next/link";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { redirect } from "next/navigation";
import { getEntityById } from "@/lib/data/repository";
import { getEditorSession } from "@/lib/editorial/auth";
import { renderPublishedArticle } from "@/lib/editorial/render";

export const metadata: Metadata = { title: "Pilot taslak inceleme" };

const PILOT_IDS = ["NPC-0006", "NPC-0051", "KNG-0008", "ITM-0012", "ORG-0001", "DEI-0001"] as const;

interface PilotDraft {
  entity_id: string;
  language: string;
  period: string | null;
  review_status: string;
  publication_status: string;
  editorial_import: string;
  document: unknown;
  claims: readonly unknown[];
}

async function readPilotDraft(entityId: string): Promise<PilotDraft> {
  const filePath = path.join(process.cwd(), "editorial_work", "drafts", `${entityId}.json`);
  const raw = await readFile(filePath, "utf8");
  const draft = JSON.parse(raw) as PilotDraft;
  if (draft.entity_id !== entityId || draft.language !== "tr") {
    throw new Error(`Pilot taslak doğrulanamadı: ${entityId}`);
  }
  return draft;
}

export default async function PilotReviewPage() {
  const session = await getEditorSession();
  if (!session.configured || !session.user) redirect("/editor/login");

  const drafts = await Promise.all(PILOT_IDS.map(async (entityId) => {
    const [draft, entity] = await Promise.all([readPilotDraft(entityId), getEntityById(entityId)]);
    if (!entity) throw new Error(`Pilot varlığı bulunamadı: ${entityId}`);
    return { draft, entity };
  }));

  return (
    <main id="ana-icerik" className="editor-shell pilot-review-shell">
      <nav className="breadcrumb" aria-label="Editör içerik yolu">
        <Link href="/editor">Wiki editörü</Link><span aria-hidden="true">/</span><span>Pilot taslak inceleme</span>
      </nav>
      <header className="editor-detail-header">
        <div>
          <p className="eyebrow">M2 · {session.profile.displayName}</p>
          <h1>Pilot taslak inceleme</h1>
          <p>Bu altı makale kanıt paketlerinden üretildi. Yayımlanmadılar; yalnızca owner/editör oturumunda kaynak ve anlatım incelemesi için gösteriliyorlar.</p>
        </div>
        <Link className="button" href="/editor">Editör ana sayfası</Link>
      </header>

      <section className="pilot-review-notice" aria-label="Taslak durumu">
        <strong>İnceleme durumu</strong>
        <p>Değişiklik yapmak için ilgili varlığın düzenleme ekranını açabilirsin. Bu görünümdeki metinler Supabase’e aktarılmadı ve public wiki’de görünmez.</p>
      </section>

      <section className="pilot-review-grid" aria-label="Pilot makaleler">
        {drafts.map(({ draft, entity }) => (
          <article className="pilot-review-card" key={draft.entity_id}>
            <header>
              <div>
                <p className="eyebrow">{draft.entity_id}</p>
                <h2>{entity.name}</h2>
              </div>
              <Link className="button" href={`/editor/${draft.entity_id}`}>Düzenleme ekranı</Link>
            </header>
            <div className="pilot-review-meta" aria-label="Taslak bilgileri">
              <span><strong>Dil</strong>{draft.language}</span>
              <span><strong>Dönem</strong>{draft.period ?? "Belirtilmemiş"}</span>
              <span><strong>Kanıt kaydı</strong>{draft.claims.length}</span>
              <span><strong>Durum</strong>{draft.review_status} · {draft.publication_status}</span>
            </div>
            <div className="wiki-prose pilot-review-document" dangerouslySetInnerHTML={{ __html: renderPublishedArticle(draft.document) }} />
          </article>
        ))}
      </section>
    </main>
  );
}
