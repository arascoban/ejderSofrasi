"use server";

import { redirect } from "next/navigation";
import { getEditorSession } from "@/lib/editorial/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface PasswordState { error: string | null }

export async function setPasswordAction(
  _previous: PasswordState,
  formData: FormData,
): Promise<PasswordState> {
  const session = await getEditorSession();
  if (!session.configured || !session.user) return { error: "Davet oturumu doğrulanamadı." };
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "");
  if (password.length < 12) return { error: "Parola en az 12 karakter olmalıdır." };
  if (password !== confirmation) return { error: "Parola tekrarı eşleşmiyor." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "Parola kaydedilemedi. Davet bağlantısını yeniden açın." };
  redirect("/editor");
}
