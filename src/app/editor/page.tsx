import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAllEntitySummaries } from "@/lib/data/repository";
import { entityTypeLabel } from "@/lib/domain/labels";
import { getEditorSession } from "@/lib/editorial/auth";
import { logoutAction } from "./login/actions";

export const metadata: Metadata = { title: "Wiki editörü" };

interface EditorHomeProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function EditorHome({ searchParams }: EditorHomeProps) {
  const session = await getEditorSession();
  if (!session.configured) redirect("/editor/login");
  if (!session.user) redirect("/editor/login");

  const query = (await searchParams).q?.trim() ?? "";
  const normalized = query.toLocaleLowerCase("tr-TR");
  const entities = (await getAllEntitySummaries())
    .filter((entity) =>
      !normalized ||
      entity.name.toLocaleLowerCase("tr-TR").includes(normalized) ||
      entity.id.toLocaleLowerCase("tr-TR").includes(normalized),
    )
    .slice(0, 50);

  return (
    <main id="ana-icerik" className="editor-shell">
      <header className="editor-dashboard-header">
        <div>
          <p className="eyebrow">Yetkili wiki alanı</p>
          <h1>İçerik düzenleme</h1>
          <p>{session.profile.displayName} · {session.profile.role === "owner" ? "Site sahibi" : "Editör"}</p>
        </div>
        <div className="editor-header-actions">
          {session.profile.role === "owner" ? <Link className="button" href="/editor/team">Editör ekibi</Link> : null}
          <form action={logoutAction}><button className="button" type="submit">Çıkış yap</button></form>
        </div>
      </header>

      <section className="editor-entity-picker" aria-labelledby="varlik-secimi">
        <div className="section-heading">
          <p className="eyebrow">Sabit kimlikler</p>
          <h2 id="varlik-secimi">Düzenlenecek varlık</h2>
        </div>
        <div>
          <form className="editor-search" action="/editor">
            <label htmlFor="editor-search">Ad veya ID</label>
            <div><input id="editor-search" name="q" defaultValue={query} /><button className="button" type="submit">Ara</button></div>
          </form>
          <ul className="editor-entity-list">
            {entities.map((entity) => (
              <li key={entity.id}>
                <Link href={`/editor/${entity.id}`}>
                  <span><strong>{entity.name}</strong><small>{entity.id} · {entityTypeLabel(entity.type)}</small></span>
                  <span aria-hidden="true">Düzenle →</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
