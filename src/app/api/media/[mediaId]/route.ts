import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getPublicSupabaseConfig, isEditorialEnabled } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MEDIA_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MEDIA_KINDS = new Set(["thumbnail", "small", "medium", "large"]);

interface MediaRouteContext {
  params: Promise<{ mediaId: string }>;
}

export async function GET(request: Request, { params }: MediaRouteContext) {
  const { mediaId } = await params;
  const kind = new URL(request.url).searchParams.get("kind") ?? "medium";
  if (!MEDIA_ID_PATTERN.test(mediaId) || !MEDIA_KINDS.has(kind)) {
    return NextResponse.json({ error: "Geçersiz medya adresi." }, { status: 400 });
  }

  const config = getPublicSupabaseConfig();
  if (!config || !isEditorialEnabled()) {
    return NextResponse.json({ error: "Medya servisi yapılandırılmadı." }, { status: 503 });
  }

  try {
    // RLS limits this lookup to files attached to an active published revision.
    const publicClient = createClient(config.url, config.publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const fileResult = await publicClient
      .from("media_files")
      .select("object_path, mime_type")
      .eq("media_id", mediaId)
      .eq("kind", kind)
      .eq("bucket_id", "wiki-published")
      .maybeSingle();
    if (fileResult.error) throw new Error(fileResult.error.message);
    if (!fileResult.data) return NextResponse.json({ error: "Yayımlanmış görsel bulunamadı." }, { status: 404 });

    const admin = createSupabaseAdminClient();
    const downloaded = await admin.storage.from("wiki-published").download(fileResult.data.object_path);
    if (downloaded.error || !downloaded.data) {
      return NextResponse.json({ error: "Yayımlanmış görsel okunamadı." }, { status: 404 });
    }
    return new NextResponse(downloaded.data, {
      headers: {
        "Content-Type": fileResult.data.mime_type,
        // Publication access can be revoked; recheck RLS on every request.
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Yayımlanmış medya sunulamadı", error);
    return NextResponse.json({ error: "Medya servisi hazır değil." }, { status: 503 });
  }
}
