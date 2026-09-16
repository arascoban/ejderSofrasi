import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";
import { getEditorSession } from "@/lib/editorial/auth";

export const metadata: Metadata = { title: "Editör girişi" };

export default async function EditorLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ hata?: string }>;
}) {
  const session = await getEditorSession();
  if (session.user) redirect("/editor");
  const callbackError = (await searchParams).hata;

  return (
    <main id="ana-icerik" className="editor-auth-shell">
      <section className="editor-auth-card">
        <p className="eyebrow">Yetkili alan</p>
        <h1>Wiki editör girişi</h1>
        {callbackError ? <p className="form-error" role="alert">{callbackError}</p> : null}
        {!session.configured ? (
          <div className="editor-setup-note" role="status">
            <strong>Supabase bağlantısı bekleniyor</strong>
            <p>Proje URL’si ve publishable key `.env.local` dosyasına eklendikten sonra giriş kullanılabilir olacak.</p>
          </div>
        ) : (
          <>
            <p>Bu alan yalnızca site sahibi ve davet edilmiş editörler içindir.</p>
            <LoginForm />
          </>
        )}
      </section>
    </main>
  );
}
