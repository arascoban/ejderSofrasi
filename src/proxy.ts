import type { NextRequest } from "next/server";
import { updateSupabaseSession } from "@/lib/supabase/session";

export async function proxy(request: NextRequest) {
  return updateSupabaseSession(request);
}

export const config = {
  matcher: ["/editor/:path*", "/auth/:path*"],
};
