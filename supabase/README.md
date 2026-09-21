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

`.env.local` içinde `NEXT_PUBLIC_SITE_URL` gerçek yerel/önizleme/canlı adresi göstermelidir. Migration öncesi salt-okuma yayını için `SUPABASE_EDITORIAL_MODE=disabled` kullanılır; migration ve seed sonrası `enabled` yapılır. `SUPABASE_SECRET_KEY` özel yayımlanmış medya rotası ve sahibin davet e-postası gönderen sunucu eylemi için gerekir; istemci paketine girmez. Supabase Auth URL Configuration içinde `/auth/callback` adresini içeren yerel, önizleme ve canlı dönüş adresleri izinli olmalıdır.

## Güvenlik modeli

- `anon` ve `authenticated` rollerinden tablo yazma yetkileri geri alınır.
- Ziyaretçiler yalnızca etkin yayımlanmış revizyonları ve bunlara bağlı yayımlanmış görselleri okuyabilir.
- Editörler taslak ve geçmiş sürümleri okuyabilir; yazma işlemleri yetki ve optimistic-lock kontrolü yapan RPC fonksiyonlarından geçer.
- `publish_wiki_draft` makale metniyle galeri bağlantılarını aynı PostgreSQL işlemi içinde yayımlar.
- `rollback_wiki_article` eski satırı değiştirmez; eski içeriği yeni bir yayımlanmış revizyona kopyalar.
- Özgün dosyalar `wiki-originals` özel bucket'ında, yayımlanan türevler `wiki-published` bucket'ında tutulur.
- Storage için UPDATE politikası yoktur. Bir görseli değiştirmek yeni değişmez nesne anahtarı gerektirir.

22 Eylül Astra kabulü `D2_KABUL_RAPORU.md` içindedir. D2 için yerel gerçek PostgreSQL davranış testleri + gerçek Supabase owner/anon Auth/Storage kabulü birlikte kullanıldı. `supabase test db`/pgTAP bulutta çalıştırılmış gibi raporlanmaz; CLI/yerel Supabase kurulunca ek regresyon yolu olarak korunur. Veritabanı ve gerçek Storage dosyaları birlikte dışa aktarılmalıdır.

## İlk kurulum paketi ve Astra teslimi (16 Eylül 2026)

Güncel kurulum sırası ve yayın engelleri `LUNA_DEPLOY_TALIMATLARI.md` içindedir. `generated/bootstrap_editorial.sql` altı migration ve kimlik seed'ini SQL Editor için tek transaction olarak birleştirir; mevcut Ejder şemasında durur, owner ataması içermez. `node scripts/export_supabase_bootstrap.mjs` ile yeniden üretilir. `generated/verify_installation.sql` kurulum sonrası salt-okuma kontrolüdür. SQL Editor kurulumu CLI geçmişini güncellemez; belgede açıklanan doğrulama ve history eşleştirmesini yapmadan `db push` kullanmayın.

`scripts/verify_editorial_pglite.mjs` izole PostgreSQL motorunda davranış testidir; gerçek Supabase Auth/Storage veya eşzamanlı oturum kabulünün yerini tutmaz. 16 Eylül kontrolünde migration dosyalarıyla 17, birleşik paketle 18 denetim geçti. Bu16 Eylül sonucu tarihseldir; bulut kurulumu ve D2 kabulü22 Eylül raporunda tamamlandı.


## Editoryal metadata ve dosya dışa aktarımı

`npm run editorial:export`, `.env.local` içindeki mevcut URL ve server secret ile salt okunur çalışır. Yeni `.local-backups/editorial-<zaman>/` klasörüne dokuz tabloyu, geçmiş revizyonlara ait olanlar dahil kayıtlı tüm özgün/türev dosyaların byte'larını ve SHA-256 manifestini yazar. Klasör Git dışında, dizinler700/dosyalar600 izinlidir. Yedek özel taslak ve hesap kimlikleri içerir; repoya/sohbete eklenmez.

Düzenlemelerin durduğu aralıkta çalıştırın. Başlangıç/son metadata farklıysa, dosya eksikse veya boyut/original hash yanlışsa başarılı manifest üretilmez. Var olan çıktı klasörü ezilmez. **`manifest.json` olmayan klasör tamamlanmış export değildir.** Yerel byte'lar manifestten önce tekrar okunarak doğrulanır;6 otomatik test eksiklik/bozulma/değişim/yol/sayfalama senaryolarını kapsar.

Bu, transaction snapshot veya tüm Supabase proje yedeği değildir. Auth kullanıcıları/parolaları, şema ve DB'ye kaydedilmemiş Storage nesneleri dışarı aktarılmaz. Export içeriği karşılaştırılarak kayıt/dosya koruması doğrulandı; yeni projeye tam restore provası I aşamasına aittir. Çalışan bulut kurulumuna bootstrap veya identity seed tekrar uygulanmaz.
