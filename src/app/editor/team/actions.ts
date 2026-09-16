"use server";

import { revalidatePath } from "next/cache";
import { getEditorSession } from "@/lib/editorial/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface InviteState { error: string | null; success: string | null }

export async function inviteEditorAction(
  _previous: InviteState,
  formData: FormData,
): Promise<InviteState> {
  const session = await getEditorSession();
  if (!session.configured || !session.user || session.profile.role !== "owner") {
    return { error: "Yalnızca site sahibi editör davet edebilir.", success: null };
  }
  const email = String(formData.get("email") ?? "").trim().toLocaleLowerCase("tr-TR");
  const displayName = String(formData.get("displayName") ?? "").trim();
  if (!/^\S+@\S+\.\S+$/.test(email) || displayName.length < 1 || displayName.length > 100) {
    return { error: "Geçerli e-posta ve 1–100 karakterlik görünen ad girin.", success: null };
  }

  try {
    const admin = createSupabaseAdminClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";
    const invited = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${siteUrl}/auth/callback?next=/editor/set-password`,
    });
    if (invited.error || !invited.data.user) {
      return { error: invited.error?.message ?? "Davet oluşturulamadı.", success: null };
    }
    const profile = await admin.from("editor_profiles").upsert({
      user_id: invited.data.user.id,
      role: "editor",
      display_name: displayName,
      invited_by: session.user.id,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
    if (profile.error) return { error: `Davet oluşturuldu fakat editör rolü kaydedilemedi: ${profile.error.message}`, success: null };

    revalidatePath("/editor/team");
    return { error: null, success: `${displayName} için davet gönderildi.` };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Davet gönderilemedi.", success: null };
  }
}
