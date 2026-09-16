import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAllEntitySummaries, getEntityById } from "@/lib/data/repository";
import { entityTypeLabel } from "@/lib/domain/labels";
import { getEditorSession } from "@/lib/editorial/auth";
import { getEditorArticleState } from "@/lib/editorial/editor-repository";
import { entityHref } from "@/lib/routing/entity";
import { rollbackArticleAction } from "./actions";
import { DraftMediaManager } from "./draft-media-manager";
import { WikiEditor } from "./wiki-editor";

interface EditorEntityPageProps {
  params: Promise<{ entityId: string }>;
}

export async function generateMetadata({ params }: EditorEntityPageProps): Promise<Metadata> {
  const entity = await getEntityById((await params).entityId);
  return entity ? { title: `${entity.name} düzenle` } : {};
}

export default async function EditorEntityPage({ params }: EditorEntityPageProps) {
  const session = await getEditorSession();
  if (!session.configured || !session.user) redirect("/editor/login");

  const entity = await getEntityById((await params).entityId);
  if (!entity || entity.id !== (await params).entityId) notFound();
  const [state, entityOptions] = await Promise.all([
    getEditorArticleState(entity.id),
    getAllEntitySummaries(),
  ]);

  return (
    <main id="ana-icerik" className="editor-shell editor-detail-shell">
      <nav className="breadcrumb" aria-label="Editör içerik yolu">
        <Link href="/editor">Wiki editörü</Link><span aria-hidden="true">/</span><span>{entity.name}</span>
      </nav>
      <header className="editor-detail-header">
        <div>
          <p className="eyebrow">{entityTypeLabel(entity.type)} · {entity.id}</p>
          <h1>{entity.name}</h1>
          <p>Kanonik bilgi kutusu ayrı kalır; bu ekran yalnızca editoryal makaleyi düzenler.</p>
        </div>
        <Link className="button" href={entityHref(entity.slug)} target="_blank">Yayımlanan sayfayı aç</Link>
      </header>

      <WikiEditor state={state} entityOptions={entityOptions} userId={session.user.id} />

      {state.draftMedia.length > 0 ? (
        <DraftMediaManager entityId={entity.id} initialMedia={state.draftMedia} />
      ) : null}

      <section className="revision-history" aria-labelledby="surum-gecmisi">
        <div className="section-heading"><p className="eyebrow">Değişmez kayıtlar</p><h2 id="surum-gecmisi">Sürüm geçmişi</h2></div>
        {state.revisions.length ? (
          <ol>
            {state.revisions.map((revision) => (
              <li key={revision.revisionId}>
                <div>
                  <strong>Sürüm {revision.revisionNumber.toLocaleString("tr-TR")}</strong>
                  <span>{new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(revision.publishedAt))}</span>
                  <p>{revision.changeNote || "Değişiklik notu yok."}</p>
                </div>
                {state.publishedRevisionId !== revision.revisionId && state.publishedRevisionId ? (
                  <form action={rollbackArticleAction}>
                    <input type="hidden" name="entityId" value={entity.id} />
                    <input type="hidden" name="sourceRevisionId" value={revision.revisionId} />
                    <input type="hidden" name="expectedRevisionId" value={state.publishedRevisionId} />
                    <input type="hidden" name="changeNote" value={`Sürüm ${revision.revisionNumber} geri getirildi.`} />
                    <button className="button" type="submit">Bu sürümü geri getir</button>
                  </form>
                ) : <span className="current-revision">Yayında</span>}
              </li>
            ))}
          </ol>
        ) : <p>Henüz yayımlanmış sürüm yok.</p>}
      </section>
    </main>
  );
}
