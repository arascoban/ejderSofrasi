"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPublicSupabaseConfig } from "@/lib/supabase/config";

export interface LoginState {
  error: string | null;
}

export async function loginAction(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  if (!getPublicSupabaseConfig()) {
    return { error: "Supabase bağlantısı henüz yapılandırılmadı." };
  }

  const email = String(formData.get("email") ?? "").trim().toLocaleLowerCase("tr-TR");
  const password = String(formData.get("password") ?? "");
  if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 8) {
    return { error: "Geçerli e-posta adresinizi ve en az 8 karakterli parolanızı girin." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    return { error: "Giriş bilgileri doğrulanamadı." };
  }

  const profile = await supabase
    .from("editor_profiles")
    .select("role")
    .eq("user_id", data.user.id)
    .maybeSingle();
  if (profile.error || !profile.data || !["owner", "editor"].includes(profile.data.role)) {
    await supabase.auth.signOut();
    return { error: "Bu hesabın wiki düzenleme yetkisi yok." };
  }

  redirect("/editor");
}

export async function logoutAction() {
  if (getPublicSupabaseConfig()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}
