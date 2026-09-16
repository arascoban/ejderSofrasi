import { NextResponse, type NextRequest } from "next/server";
import { getPublicSupabaseConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function safeNext(value: string | null): string {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/editor";
}

export async function GET(request: NextRequest) {
  const target = new URL(safeNext(request.nextUrl.searchParams.get("next")), request.url);
  const code = request.nextUrl.searchParams.get("code");
  if (!getPublicSupabaseConfig() || !code) {
    target.pathname = "/editor/login";
    target.searchParams.set("hata", "Davet bağlantısı doğrulanamadı.");
    return NextResponse.redirect(target);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    target.pathname = "/editor/login";
    target.searchParams.set("hata", "Davet bağlantısının süresi dolmuş veya bağlantı daha önce kullanılmış olabilir.");
  }
  return NextResponse.redirect(target);
}
