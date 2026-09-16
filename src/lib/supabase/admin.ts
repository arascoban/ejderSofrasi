import "server-only";

import { createClient } from "@supabase/supabase-js";
import { requirePublicSupabaseConfig } from "./config";

export function createSupabaseAdminClient() {
  const { url } = requirePublicSupabaseConfig();
  const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();
  if (!secretKey) throw new Error("SUPABASE_SECRET_KEY yalnızca sunucu ortamında yapılandırılmalıdır.");
  return createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
