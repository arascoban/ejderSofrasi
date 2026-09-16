import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { getPublicSupabaseConfig } from "@/lib/supabase/config";

const root = process.cwd();
const core = readFileSync(
  resolve(root, "supabase/migrations/202609160001_editorial_core.sql"),
  "utf8",
);
const security = readFileSync(
  resolve(root, "supabase/migrations/202609160002_editorial_security_and_workflow.sql"),
  "utf8",
);
const storage = readFileSync(
  resolve(root, "supabase/migrations/202609160003_editorial_storage.sql"),
  "utf8",
);
const publicProjection = readFileSync(
  resolve(root, "supabase/migrations/202609160004_public_article_projection.sql"),
  "utf8",
);
const mediaWorkflow = readFileSync(
  resolve(root, "supabase/migrations/202609160005_media_workflow.sql"),
  "utf8",
);
const identitySeed = readFileSync(resolve(root, "supabase/generated/entity_identities.sql"), "utf8");

describe("Supabase editoryal sözleşmesi", () => {
  it("bulut değişkenleri olmadan güvenli biçimde devre dışı kalır", () => {
    const previousUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const previousKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    expect(getPublicSupabaseConfig()).toBeNull();

    if (previousUrl) process.env.NEXT_PUBLIC_SUPABASE_URL = previousUrl;
    if (previousKey) process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = previousKey;
  });

  it("kanon kimliği, makale, değişmez revizyon, taslak ve medya tablolarını ayırır", () => {
    for (const table of [
      "world_entity_identities",
      "editor_profiles",
      "wiki_articles",
      "wiki_revisions",
      "wiki_drafts",
      "media_assets",
      "media_files",
      "wiki_draft_media",
      "wiki_revision_media",
    ]) {
      expect(core).toContain(`create table public.${table}`);
      expect(security).toContain(`alter table public.${table} enable row level security`);
      expect(security).toContain(`revoke all on table public.${table} from anon, authenticated`);
    }
  });

  it("aktif varlıklarla emekli kimlik yönlendirmelerini aynı köprüye aktarır", () => {
    expect(identitySeed.match(/, true, null, 'core-[a-f0-9]{16}'\)/g)).toHaveLength(403);
    expect(identitySeed.match(/, false, '[A-Z]{3}-[0-9]{4}', 'core-[a-f0-9]{16}'\)/g)).toHaveLength(13);
  });

  it("istemci rollerine doğrudan tablo yazma yetkisi vermez", () => {
    expect(security).not.toMatch(/grant\s+(?:insert|update|delete|all)[^;]+to\s+(?:anon|authenticated)/i);
    expect(security).toContain("grant execute on function public.save_wiki_draft");
    expect(security).toContain("grant execute on function public.publish_wiki_draft");
    expect(security).toContain("grant execute on function public.rollback_wiki_article");
  });

  it("okuyucu projeksiyonundan taslakları ve özel orijinalleri çıkarır", () => {
    expect(publicProjection).toContain("security invoker");
    expect(publicProjection).toContain("article.published_revision_id");
    expect(publicProjection).toContain("media.state = 'published'");
    expect(publicProjection).toContain("file.bucket_id = 'wiki-published'");
    expect(publicProjection).not.toContain("wiki_drafts");
    expect(publicProjection).not.toContain("wiki-originals");
  });

  it("eşzamanlı kayıt ve geri alma işlemlerini geçmişi silmeden tanımlar", () => {
    expect(core).toContain("lock_version bigint not null default 1");
    expect(security).toContain("p_expected_lock_version");
    expect(security).toContain("p_expected_published_revision_id");
    expect(security).toContain("source_revision_id");
    expect(security).not.toMatch(/delete\s+from\s+public\.wiki_revisions/i);
  });

  it("doğrudan RPC kullanımında da makale düğümlerini, entity bağlantılarını ve medya bağlarını doğrular", () => {
    expect(security).toContain("private.is_valid_wiki_document");
    expect(security).toContain("Makale etkin olmayan bir dünya varlığına bağlantı içeriyor");
    expect(security).toContain("Makale taslağa bağlı olmayan bir görsel içeriyor");
    expect(security).toContain("core_release_id = p_base_core_release_id");
  });

  it("özgün ve yayımlanmış görselleri ayrı bucketlarda, değişmez yollarla tutar", () => {
    expect(storage).toContain("'wiki-originals'");
    expect(storage).toContain("'wiki-published'");
    expect(storage).not.toMatch(/for\s+update/i);
    expect(core).toContain("kind = 'original' and bucket_id = 'wiki-originals'");
    expect(core).toContain("kind <> 'original' and bucket_id = 'wiki-published'");
  });

  it("medya kaydı, taslak bağlantısı, kaldırma ve sıralama RPC'lerini tanımlar", () => {
    expect(mediaWorkflow).toContain("public.register_processed_media");
    expect(mediaWorkflow).toContain("public.attach_media_to_wiki_draft");
    expect(mediaWorkflow).toContain("public.remove_media_from_wiki_draft");
    expect(mediaWorkflow).toContain("public.reorder_wiki_draft_media");
    expect(mediaWorkflow).toContain("jsonb_array_length(p_files) < 3");
    expect(mediaWorkflow).toContain("media.state in ('ready'");
  });
});
