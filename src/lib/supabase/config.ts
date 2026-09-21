export interface PublicSupabaseConfig {
  url: string;
  publishableKey: string;
}

/** Set to "disabled" for a deliberate read-only deployment before D2 migrations run. */
export function isEditorialEnabled(): boolean {
  return process.env.SUPABASE_EDITORIAL_MODE?.trim().toLowerCase() !== "disabled";
}

export function getPublicSupabaseConfig(): PublicSupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!url || !publishableKey) return null;

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.hostname !== "127.0.0.1" && parsed.hostname !== "localhost") {
      return null;
    }
  } catch {
    return null;
  }

  return { url, publishableKey };
}

export function requirePublicSupabaseConfig(): PublicSupabaseConfig {
  const config = getPublicSupabaseConfig();
  if (!config) {
    throw new Error(
      "Supabase bağlantısı yapılandırılmadı. NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY gerekli.",
    );
  }
  return config;
}
