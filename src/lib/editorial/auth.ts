import "server-only";

import type { User } from "@supabase/supabase-js";
import { getPublicSupabaseConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type EditorRole = "owner" | "editor";

export interface EditorSession {
  configured: true;
  user: User;
  profile: {
    role: EditorRole;
    displayName: string;
  };
}

export interface MissingEditorSession {
  configured: boolean;
  user: null;
  profile: null;
}

export type EditorSessionResult = EditorSession | MissingEditorSession;

export async function getEditorSession(): Promise<EditorSessionResult> {
  if (!getPublicSupabaseConfig()) {
    return { configured: false, user: null, profile: null };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { configured: true, user: null, profile: null };

  const profileResult = await supabase
    .from("editor_profiles")
    .select("role, display_name")
    .eq("user_id", data.user.id)
    .maybeSingle();
  if (profileResult.error || !profileResult.data) {
    return { configured: true, user: null, profile: null };
  }

  const role = profileResult.data.role;
  if (role !== "owner" && role !== "editor") {
    return { configured: true, user: null, profile: null };
  }

  return {
    configured: true,
    user: data.user,
    profile: {
      role,
      displayName:
        typeof profileResult.data.display_name === "string"
          ? profileResult.data.display_name
          : data.user.email ?? "Editör",
    },
  };
}
