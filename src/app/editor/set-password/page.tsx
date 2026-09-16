import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getEditorSession } from "@/lib/editorial/auth";
import { PasswordForm } from "./password-form";

export const metadata: Metadata = { title: "Editör parolası" };

export default async function SetPasswordPage() {
  const session = await getEditorSession();
  if (!session.configured || !session.user) redirect("/editor/login");
  return (
    <main id="ana-icerik" className="editor-auth-shell">
      <section className="editor-auth-card">
        <p className="eyebrow">Davetli editör</p>
        <h1>Parolanızı belirleyin</h1>
        <p>Daha sonraki girişlerinizde kullanacağınız parolayı oluşturun.</p>
        <PasswordForm />
      </section>
    </main>
  );
}
