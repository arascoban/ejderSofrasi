import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getEditorSession } from "@/lib/editorial/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { InviteForm } from "./invite-form";

export const metadata: Metadata = { title: "Editör ekibi" };

export default async function EditorTeamPage() {
  const session = await getEditorSession();
  if (!session.configured || !session.user) redirect("/editor/login");
  if (session.profile.role !== "owner") notFound();

  const supabase = await createSupabaseServerClient();
  const profiles = await supabase
    .from("editor_profiles")
    .select("user_id, role, display_name, created_at")
    .order("created_at", { ascending: true });
  if (profiles.error) throw new Error(`Editör listesi alınamadı: ${profiles.error.message}`);

  return (
    <main id="ana-icerik" className="editor-shell">
      <nav className="breadcrumb"><Link href="/editor">Wiki editörü</Link><span aria-hidden="true">/</span><span>Editör ekibi</span></nav>
      <header className="editor-detail-header"><div><p className="eyebrow">Sahip yönetimi</p><h1>Editör ekibi</h1><p>Davet edilen kullanıcılar içerik düzenleyebilir ve yayımlayabilir; yeni editör davet edemez.</p></div></header>
      <section className="editor-team-grid">
        <div><h2>Yeni davet</h2><InviteForm /></div>
        <div><h2>Yetkili hesaplar</h2><ul>{(profiles.data ?? []).map((profile) => <li key={profile.user_id}><strong>{profile.display_name}</strong><span>{profile.role === "owner" ? "Site sahibi" : "Editör"}</span></li>)}</ul></div>
      </section>
    </main>
  );
}
