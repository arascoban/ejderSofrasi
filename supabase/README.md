# Supabase editoryal katmanı

Bu klasör D2 wiki yazımı ve görselleri için sürümlü PostgreSQL, RLS ve Storage sözleşmelerini içerir. `/data` içindeki yapılandırılmış kanon burada düzenlenmez. Supabase yalnızca yazılmış makalelerin, değişmez revizyonların, taslakların, editör yetkilerinin ve medya bağlantılarının sahibidir.

## Kurulum sırası

1. Supabase projesini oluşturun veya yerel Supabase'i başlatın.
2. `.env.example` dosyasını `.env.local` olarak kopyalayıp proje URL'si ile publishable key'i girin.
3. Migration dosyalarını sırayla uygulayın.
4. Doğrulanmış entity kimliklerini `world_entity_identities` tablosuna aktarın. Bu işlem `scripts/export_supabase_identity_seed.mjs` ile üretilecek SQL üzerinden yapılır.
5. Supabase Auth'ta ilk sahibi oluşturun ve kullanıcının UUID'sini aşağıdaki sorguda kullanın:

```sql
insert into public.editor_profiles(user_id, role, display_name)
values ('AUTH_USER_UUID', 'owner', 'Site Sahibi');
```

Bu bootstrap sorgusu yalnızca proje yöneticisi tarafından SQL Editor veya migration erişimiyle çalıştırılır. Uygulama içinden rol yükseltme yolu yoktur.

`.env.local` içinde `NEXT_PUBLIC_SITE_URL` gerçek yerel/önizleme/canlı adresi göstermelidir. `SUPABASE_SECRET_KEY` yalnızca sahibin davet e-postası gönderen sunucu eylemi için gerekir; istemci paketine girmez. Supabase Auth URL Configuration içinde `/auth/callback` adresini içeren yerel, önizleme ve canlı dönüş adresleri izinli olmalıdır.

## Güvenlik modeli

- `anon` ve `authenticated` rollerinden tablo yazma yetkileri geri alınır.
- Ziyaretçiler yalnızca etkin yayımlanmış revizyonları ve bunlara bağlı yayımlanmış görselleri okuyabilir.
- Editörler taslak ve geçmiş sürümleri okuyabilir; yazma işlemleri yetki ve optimistic-lock kontrolü yapan RPC fonksiyonlarından geçer.
- `publish_wiki_draft` makale metniyle galeri bağlantılarını aynı PostgreSQL işlemi içinde yayımlar.
- `rollback_wiki_article` eski satırı değiştirmez; eski içeriği yeni bir yayımlanmış revizyona kopyalar.
- Özgün dosyalar `wiki-originals` özel bucket'ında, yayımlanan türevler `wiki-published` bucket'ında tutulur.
- Storage için UPDATE politikası yoktur. Bir görseli değiştirmek yeni değişmez nesne anahtarı gerektirir.

Gerçek Supabase projesi bağlandığında `supabase test db` ile `supabase/tests/editorial_schema.test.sql` ve ardından uçtan uca anon/editör testleri geçmeden D2 tamamlanmış sayılmaz. Veritabanı ve gerçek Storage dosyaları birlikte dışa aktarılmalıdır.
