import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAllEntitySummaries, getEntityById } from "@/lib/data/repository";
import { entityTypeLabel } from "@/lib/domain/labels";
import { getEditorSession } from "@/lib/editorial/auth";
import { getEditorArticleState } from "@/lib/editorial/editor-repository";
import { entityHref } from "@/lib/routing/entity";
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

    </main>
  );
}
