# Çözülemeyen işler ve manuel Astra danışma kayıtları

Luna, tamamlayamadığı işleri ve çözülmeden kalan problemleri burada bağlamıyla tutar. Kullanıcı ilgili kaydın **Astra'ya kopyalanacak paket** bölümünü manuel olarak Astra'ya iletir. Otomatik danışma yapılmaz.

**En güncel durum:** PRB-0019 yerel üretim kabulüyle çözüldü; ayrıntısı dosya sonunda. F sonrası arama tek Dünya Arşivi yüzeyinde. Makale ara planı M hazır, uygulanmadı.

**Tarihsel E kabulü (22 Eylül 2026, Europe/Berlin):** D2 kabulü tamamlandı; PRB-0013 ve PRB-0014 `COZULDU`. Kanıt ve sınırlar `D2_KABUL_RAPORU.md` içinde. CPU PRB-0017 kullanıcı isteğiyle ertelendi; E'yi engellemiyor. E1–E3 yerel ve canlı kabulü tamamlandı. 78+6 test, lint/typecheck, build527/527; gerçek ID bağlantısı ve temiz V17; canlı metadata/25 dosya export'u başarılı. `cb6bb4b` GitHub main'e gönderildi, Vercel Production success ve üç canlı `/search` smoke kontrolü HTTP 200 verdi. E kapandı; sonraki aşama F.

**Tarihsel durum (21 Eylül 2026, Europe/Berlin):** PRB-0003, PRB-0009, PRB-0011, PRB-0012 ve PRB-0016 doğrulanarak çözüldü. Gerçek owner oturumunda inline kayıt/yeniden açma, yayın, yeniden düzenleme, rollback ve anonim medya kabulü geçti. NPC-0006 son canlı temizlikten sonra boş V15 yayınına döndü, draft yok; public sayfada test görseli yok. Kullanıcının seçtiği kanon dışı `deneme` görseli yüklenip reload sonrası doğrulandı, UI'den kaldırıldı ve boş V15 yayımlandı. Public sayfadaki geniş `deneme` eşleşmesi yalnızca kanonik “ritüel denemesi” cümlesidir; görsel/alt metin eşleşmesi yoktur. PRB-0014 hayalet taslak alt sorunu çözüldü; stale save canlıda hızlı PT409 verdi. Bu turda eşzamanlı save/publish başlatıldı; save başarılı olurken diğer sekme yerel metni koruyan çakışma durumuna geçti. Exact publish HTTP durumu tarayıcı UI'sinden görünmediği için doğrudan HTTP409 olarak raporlanmadı. Kullanıcının talimatıyla PRB-0017 CPU teşhisi ve tekrarlı canlı yarış/yük testleri rafa kaldırıldı. `pg_stat_statements` erişilebilir olduğu bildirildi ancak sonuç satırları Luna'ya görünmediği için belirli sorgu veya indeks tespit edilmedi. Lint/typecheck/64 test, enabled build526/526; PGlite23 ve bootstrap24 denetim başarılı. PRB-0013/0014 ve D2, kontrollü ağ gecikmesi, bağımsız publish HTTP kanıtı ve core reimport/export gibi kalan tam kabul maddeleri nedeniyle açık. Kanon ve önceden uygulanmış migration dosyaları bu tur değiştirilmedi. Yeni bootstrap paketi yalnızca yeni kurulum içindir. Commit/push/deploy yapılmadı.

Bu dosyada her kaydın en yeni tarihli Astra eki önceki teşhislerin önüne geçer. Tarihsel “migration uygulanmadı / owner yok / henüz yayın yapılmadı” cümlelerini yeniden kurulum talimatı olarak kullanma.

**Son kullanıcı güncellemesi:** PT409 migration SQL Editor'de çalıştırıldı; tekrar uygulama isteme. Yeni yüksek CPU bildirimi PRB-0017 altında; kullanıcı bu tur CPU testini rafa kaldırdı. Aynı owner oturumunda tek stale save isteği canlıda hızlı HTTP409 ile doğrulandı. Eşzamanlı save/publish yarışında B sekmesi yerel metni koruyarak çakışma durumuna geçti; exact publish HTTP kodu UI'de görünmedi. CPU istikrarı için tekrarlı yük testi başlatılmadı.

## Kayıt kuralları

- İlk başarısız düzeltmede kayıt aç; ikinci başarısız düzeltmede manuel danışma bekleyen duruma geçir. Teknik belirsizlik, eksik erişim veya tamamlanamayan bir iş için iki denemeyi bekleme; nedeni açıkça yaz.
- Kimlikler `PRB-0001`, `PRB-0002` şeklinde artar; tekrar kullanılmaz. Aynı sorunu yeni oturumda yeniden açmak yerine mevcut kaydı güncelle.
- Durumlar: `ACIK`, `MANUEL_DANISMA_BEKLIYOR`, `GIRDI_BEKLIYOR`, `ONERI_UYGULANIYOR`, `COZULDU`. Kullanıcı yanıtı gelmesi tek başına çözüm değildir.
- İndeks ve ayrıntı aynı anda güncellenir. Çözülen kayıt silinmez; sonuç ve doğrulama kanıtı eklenir. İlgili işi tamamlandı göstermeden önce kabul ölçütü doğrulanır.
- Her kayıtta tarih/saat ve saat dilimi, aktif aşama, son deneme sonucu ve sonraki adım bulunur. Bilinmeyen bilgi “bilinmiyor”, yapılmayan deneme “yapılmadı” olarak belirtilir; bilgi uydurulmaz.
- Paket, başka bir oturumun projeye erişimi olmadan da anlaşılabilmeli. İlgili küçük kod/şema alıntısı ve gerçek hata metni eklenir; büyük dosya gerçekten gerekiyorsa paylaşılması gereken dosya açıkça belirtilir. Anahtarlar, şifreler ve oturum token'ları çıkarılır.
- Kullanıcı Astra yanıtını getirince orijinal öneri veya anlamını koruyan özeti, uygulanan değişiklik ve gerçek kontrol sonucu aynı kayda eklenir. Başarısızsa kayıt açık kalır ve paket yeni kanıtla güncellenir.
- `IMPLEMENTATION_STATUS.md` yalnızca buradaki problem kimliklerine referans verir. İki ayrı ayrıntılı sorun listesi oluşturulmaz.

## Problem indeksi

| Kimlik | Kısa başlık | Aşama | Durum | Deneme sayısı | Engellediği iş | Son güncelleme |
| --- | --- | --- | --- | --- | --- | --- |
| PRB-0001 | Ajv doğrulayıcı kurulumu 60 saniyeyi aşıyor | A4 | COZULDU | 2 | Veri doğrulama ve bütün veri tabanlı sayfalar | 15 Eylül 2026, Europe/Istanbul |
| PRB-0002 | ESLint sınırlı kaynak kümesinde tamamlanmıyor | A6 | COZULDU | 2 | A aşaması lint kabul kontrolü | 15 Eylül 2026, Europe/Istanbul |
| PRB-0003 | Yerel dosya erişimi araç ve kontrolleri sessizce bekletiyor | D2 | COZULDU | 3 | Güncel lint/typecheck/test/build tamamlandı | 21 Eylül 2026 |
| PRB-0004 | Turbopack yerel port açamıyor | A6 | COZULDU | 1 | Üretim derlemesi | 15 Eylül 2026, Europe/Istanbul |
| PRB-0005 | npm lockfile exact sürüm yenilemesi tamamlanmıyor | D2 | COZULDU | 2 | Yalnızca lockfile kök sürüm biçimi | 16 Eylül 2026, Europe/Istanbul |
| PRB-0006 | Tiptap Table modülünde varsayılan export yok | D2 | COZULDU | 1 | Editoryal belge typecheck kontrolü | 16 Eylül 2026, Europe/Istanbul |
| PRB-0007 | Editoryal depo arayüzü eski iki metotta kaldı | D2 | COZULDU | 1 | Wiki sayfa projeksiyonu ve iki test | 16 Eylül 2026, Europe/Istanbul |
| PRB-0008 | Tiptap setLink tipi özel entityId alanını kabul etmiyor | D2 | COZULDU | 1 | ID tabanlı editör bağlantıları | 16 Eylül 2026, Europe/Istanbul |
| PRB-0009 | Yerel medya ortamı ve gerçek Auth/Storage kabulü | D2 | COZULDU | 1 | Owner Auth/Storage E2E ve anonim medya erişimi doğrulandı | 21 Eylül 2026 |
| PRB-0010 | Sharp tarayıcı paketine giriyor, üretim derlenmiyor | D2/I | COZULDU | 1 | Derleyici ve TypeScript artık geçiyor; tam deploy PRB-0009'a bağlı | 16 Eylül 2026, Europe/Istanbul |
| PRB-0011 | Taslak görsel türevleri yayımlanmadan public depoya çıkıyor | D2 | COZULDU | 1 | Canlı anonim Storage ve yayın/geri alma kabulü geçti | 21 Eylül 2026 |
| PRB-0012 | Yayımlanan galeriler sonraki taslağa taşınmıyor | D2 | COZULDU | 1 | Canlı yeni taslak/rollback medya kümesi korundu | 21 Eylül 2026 |
| PRB-0013 | Devam eden kaydın yanıtı daha yeni yazıyı kaydedildi gösteriyor | D2 | COZULDU | 1 + Astra kabulü | Gecikmeli DOM/SDK ve gerçek owner kabulü geçti | 22 Eylül 2026 |
| PRB-0014 | Taslak/medya eşzamanlılık sözleşmesi eksik | D2 | COZULDU | 2 + Astra düzeltmeleri | SQL/SDK/UI sözleşmesi, canlı rollback ve temizlik geçti | 22 Eylül 2026 |
| PRB-0015 | Editoryal wiki route'u build sırasında Supabase'e bağlanarak statik üretimi durduruyor | I | COZULDU | 1 | Enabled build ve canlı reader kontrolü geçti; Vercel deploy gözlemi ayrı | 16 Eylül 2026, Europe/Istanbul |
| PRB-0016 | Makale içi görsel editörde önizlenmiyor | D2 | COZULDU | 1 + Astra düzeltmesi | Canlı inline upload/save/reload/publish geçti | 21 Eylül 2026 |
| PRB-0017 | Ücretsiz Supabase projesinde yüksek CPU uyarısı | D2/I | GIRDI_BEKLIYOR | 0 | Kullanıcı isteğiyle ertelendi; D2/E engeli değil | 21 Eylül 2026 |

| PRB-0018 | Davet dönüş adresi yerel yapılandırmada şemasız | I | GIRDI_BEKLIYOR | 0 | Yeni editör daveti öncesi ortam doğrulaması; D2/E engeli değil | 22 Eylül 2026 |

| PRB-0019 | Haritada istemci gezinmesi sekmeyi kilitliyor | F sonrası | COZULDU | 2 | Üretim tarayıcı kabulü ve regresyonlar geçti | 22 Eylül 2026 |

Aşağıdaki şablon gerçek problem veya tamamlanmış iş değildir.

## Yeni kayıt şablonu

Yeni problemi bu şablondan oluşturup **Problem kayıtları** bölümüne ekle. Köşeli yer tutucuları gerçek gözlemlerle doldur.

````markdown
### PRB-0001 — [Kısa başlık]

- Durum: [ACIK / MANUEL_DANISMA_BEKLIYOR / GIRDI_BEKLIYOR / ONERI_UYGULANIYOR / COZULDU]
- Oluşturulma / son güncelleme: [Tarih, saat, saat dilimi]
- Aktif aşama ve adım: [Örn. B — yerel koordinat dönüşümü]
- Tür: [Hata / teknik belirsizlik / tamamlanamayan iş / eksik erişim veya girdi]
- Deneme sayısı: [Sayı; oturumlar boyunca korunur]
- Engellenen iş ve kabul ölçütü: [...]
- Bağımsız devam edilebilecek işler: [...]
- Mevcut çalışma durumu: [Kalan yama, geri alınan değişiklik, çalışan kısım]

#### Astra'ya kopyalanacak paket

```text
Yalnızca aşağıdaki probleme teknik danışmanlık istiyorum.
Tüm projeyi yeniden tasarlama. Eksik bilgi varsa onu belirt.

Problem: [PRB kimliği ve tek cümle problem]
Gerekli proje bağlamı: [İlgili teknoloji, veri akışı, aktif aşama]
Amaç / beklenen davranış / kabul ölçütü: [...]
Gerçek davranış ve tam ilgili hata: [...]
Yeniden üretme: [Komut, adımlar, girdiler, çalışma dizini]
Ortam: [İlgili paket/runtime sürümleri; bilinmiyorsa belirt]
İlgili dosyalar/fonksiyonlar: [...]
Gerekli kod veya veri şeması alıntısı: [...]
Deneme 1: [Hipotez → değişiklik → kontrol → gerçek sonuç]
Deneme 2: [Hipotez → değişiklik → kontrol → gerçek sonuç / yapılmadı]
Korunması gereken kurallar: [Yalnızca bu problemle ilgili olanlar]
Mevcut yama durumu / bilinenler / belirsiz kalanlar: [...]
Varsa paylaşılması gereken ek dosya: [...]

Soru: Bu sorunu giderecek en küçük güvenilir düzeltme nedir?
Olası nedeni, ilgili dosya/fonksiyon değişikliğini ve çözümü
doğrulayacak kontrolü beklenen sonucuyla birlikte açıkla.
```

#### Deneme geçmişi ve yeni kanıtlar

- [Tarih] [Deneme numarası, gözlenen sonuç, gerekirse kısa log]

#### Kullanıcının getirdiği Astra yanıtı

Henüz gelmedi.

#### Uygulama ve doğrulama

- Uygulanan değişiklik: Henüz yok.
- Çalıştırılan kontrol ve gerçek sonuç: Henüz yok.
- Çözülme tarihi: Henüz çözülmedi.
- Sonraki adım / gereken girdi: [...]
````

## Problem kayıtları

### PRB-0018 — Davet dönüş adresi yapılandırması

- Durum: `GIRDI_BEKLIYOR`;22 Eylül 2026, Europe/Berlin. Aşama I, yeni editör daveti hazırlığı. Deneme0; e-posta gönderilmedi.
- Amaç: `inviteEditorAction` içindeki redirectTo geçerli ve izinli mutlak origin kullanmalı.
- Gözlem: yerel `.env.local` içindeki yalnızca genel site adresi kontrolünde `NEXT_PUBLIC_SITE_URL=ejder-map.vercel.app` görüldü; `new URL(value)` `ERR_INVALID_URL` verdi. Secret değerleri okunup raporlanmadı. Vercel'deki aynı değişkenin değeri bilinmiyor; bunu yerel değerle aynı varsayma.
- İlgili kod: `src/app/editor/team/actions.ts`: `const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";` ardından `redirectTo: siteUrl + "/auth/callback?next=/editor/set-password"`. Şemasız değer yanlış davet dönüş adresi üretebilir. Mevcut owner login/save/publish çalışmaktadır.
- Beklenen: üretimde `https://ejder-map.vercel.app`, yerel davet kabulü yapılacaksa `http://127.0.0.1:3001`; ilgili `/auth/callback` adresi Supabase izin listesiyle eşleşmeli.
- Erişim sınırı: Vercel dashboard Codex tarayıcısında login istedi; GitHub deployment status ve public HTTPS smoke başarıyla alınabildi. Dashboard ayarı değiştirilmedi, SSO koruması kaldırılmadı. Var olan kullanıcı oturumu/cookie dışarı çıkarılmadı.
- Sonraki adım: yeni editör davetinden önce doğru ortam değerini ve Supabase callback listesini doğrula/düzelt; public env build'e gömüldüğünden ilgili ortamda yeniden build/deploy et. Kullanıcının belirttiği alıcı için açık gönderim yetkisi yokken test e-postası yollama.
- Korunacaklar: mevcut owner yetkileri, private Storage, sırlar, tamamlanan D2 kanıtları. D2 kapanışı yeni kullanıcıya davet teslimatı/SMTP kabulü değildir; bu işletim kontrolü E'yi engellemez.
- Astra'ya kopyalanacak soru: “Next16.3.5 wiki uygulamasında davet action'ı NEXT_PUBLIC_SITE_URL değerine /auth/callback?next=/editor/set-password ekliyor. Yerel değer şemasız ejder-map.vercel.app, Vercel değeri henüz görülmedi. Mevcut owner Auth/Storage E2E ve Production81e63d0 HTTPS smoke geçti. Davet göndermeden mutlak origin ve Supabase redirect allowlist eşleşmesini nasıl doğrulayalım? Yetki/token değiştirmeyelim ve e-posta göndermeyelim.”


### PRB-0017 — Supabase yüksek CPU bildirimi

#### Supabase AI istatistik bildirimi — 21 Eylül 2026

- Supabase AI, `pg_stat_statements` görünümünün erişilebilir olduğunu ve toplam süre, ortalama süre, çağrı sayısı, blok okuma, geçici blok yazımı ve WAL miktarıyla aday sorguların sıralanabileceğini bildirdi. Sonuç satırları yetki nedeniyle Luna'ya görünmedi; bu nedenle henüz belirli bir sorgu, indeks eksikliği veya CPU nedeni kanıtlanmadı.
- `total_exec_time` kümülatif iş yükü göstergesidir ve tek başına anlık CPU tüketimi değildir. İstatistik sıfırlanma zaman aralığı ve aktif CPU grafiğiyle birlikte değerlendirilmelidir. Sonuçlar paylaşılmadan indeks, sorgu yeniden yazımı veya `work_mem` değişikliği yapılmayacak.
- Sonraki güvenli adım: kullanıcı üst adayların `queryid`, `total_exec_time`, `mean_exec_time`, `calls`, `shared_blks_read`, `read_ratio_pct`, `temp_blks_written`, `wal_bytes` ve mümkünse sorgu metni sütunlarını paylaşır. Sorgu metnindeki gizli değerler redakte edilebilir. Aday SELECT'ler önce düz `EXPLAIN` ile incelenir; üretimde `EXPLAIN ANALYZE` ve mutation/RPC çalıştırılması CPU istikrarı kanıtlanmadan başlatılmaz.

#### Ekran görüntüsü incelemesi — 21 Eylül 2026

- Kullanıcının ilk görüntüsü altı fonksiyonun tamamında `old_retry_code=false`, `http_conflict_code=true` gösteriyor. Migration uygulaması kanıtlandı; tek canlı stale save isteği hızlı PT409 verdi ve yerel metin korundu. Stale publish sekmesi sunucu isteği öncesi guard'a takıldı; gerçek publish HTTP409 testi hâlâ yapılmadı. İkinci SQL sorgusunun aktif PID sonucu paylaşılmadı.
- Database Health görüntüsü, 21 Eylül16:06–19:06 aralığı: CPU kartı%2,04; önce yaklaşık%75 yatay seyir, en sonda keskin düşüş. Düzeltmeyle uyumlu iyileşme, fakat uzun dönem normalleşme veya hangi backend'in durduğu bu görüntüyle kanıtlanmaz.
- Bellek kartı406,51 MB, Memory commitment1,24 GB. Used/cache/swap alanları yaklaşık yatay; sürekli artan sızıntı kanıtı yok. Pembe swap mevcut. Committed çizgisi kesikli Commit limit'e yakın/yer yer üstünde görünüyor; kesin limit/tooltip ve fiziksel kapasite görünmüyor. Eksenin üst sınırını toplam RAM kabul etme, commitment'ı fiziksel tüketim diye raporlama.
- Resmi açıklama: commitment kernel'in süreçlere verdiği bellek tahsis taahhüdü; henüz fiziksel sayfaya dönüşmemiş tahsisleri de içerir. Cache faydalı olabilir; swap miktarı tek başına o anda yoğun swap I/O yapıldığını göstermez. Sınıra yakın commitment, bağlantı ve eşzamanlı sorgularla birlikte incelenmeli. Kaynaklar: https://supabase.com/docs/guides/observability/reports ve https://supabase.com/docs/guides/troubleshooting/exhaust-swap .
- Yeni dar salt-okuma yardımcı dosya: `supabase/diagnostics/editorial_memory_state.sql`; backend/state grupları, uzun aktif bağlantılar ve mevcut bellek ayarları. RAM/swap ölçmez; query metni/istemci adresi/gizli bilgi göstermez, mutasyon yok. İstenen sonraki kanıt: bu sonuçlar ve CPU düşüşünden sonraki son15 dakika Memory/Commitment/Disk I/O ile yanıt süresi/hata durumu.
- Durum `GIRDI_BEKLIYOR`: CPU yüksekliğinde iyileşme gözlendi; RAM baskısı ve kararlılık henüz kesinleşmedi. Mevcut snapshot için otomatik restart/terminate, cache temizliği, swap kapatma veya kaynak yükseltmesi yapılmadı. Sürdürülen commit-limit aşımı/503/OOM varsa yoğun kabul bekler; düşük yükte istikrar doğrulanınca küçük ardışık testlere geçilebilir.
- Kullanıcının yeni gözlemi: 03:00–06:00 arasında CPU yaklaşık %100'e çıkan geçici bir dalga görüldü; son 15 dakikada grafik olağan düzeyde seyretti. Bu, tekil stabilite penceresi olarak canlı save/PT409 kabulüne geçişi destekledi; uzun dönem neden ve `pg_stat_statements` adayları hâlâ belirlenmedi. Kullanıcının son talimatıyla PRB-0017 CPU teşhisi ve yeni canlı yük/tekrarlı yarış testleri rafa kaldırıldı; bu kayda yeni CPU denemesi eklenmeyecek.

- Durum: `GIRDI_BEKLIYOR`; 21 Eylül 2026, Europe/Berlin. Aşama D2/I. Tür: üretim kaynağı/erişim teşhisi. Deneme0: ölçüm olmadan optimizasyon yaması veya plan yükseltmesi yapılmadı.
- Gerçek bilgi: kullanıcı ücretsiz Supabase projesinde yüksek CPU uyarısı bildirdi; PT409 ileri migration'ını çalıştırdığını onayladı. CPU yüzdesi, süre, aktif PID ve PostgREST sürümü bilinmiyor. Data API secret mevcut, yönetim SQL/telemetri erişimi yok.
- Güçlü hipotez, henüz kesin teşhis değil: önceki iki-sekme testinde eski RPC `upstream request timeout` vermişti. Altı RPC'nin kalıcı sürüm çakışmaları40001 üretiyordu. Supabase resmi belgesi eski PostgREST'te bunun tekrar döngüsü/CPU artışına yol açtığını; fonksiyon düzeltmesinin başlamış döngüleri tek başına durdurmadığını söylüyor. Bu nedenle önceki test istekleri katkıda bulunmuş olabilir. Kaynak: https://supabase.com/docs/guides/troubleshooting/high-cpu-and-infinite-transaction-retries-when-using-custom-error-codes-in-rpc-functions-77326b
- İstenen girdi: Database Health CPU yüzdesi ve zaman aralığı; `supabase/diagnostics/editorial_conflict_state.sql` iki sonuç kümesi. Salt-okuma tanı altı fonksiyonun kodunu ve30 saniyeden eski aktif editör RPC oturumlarını gösterir. Tüm backend'leri döndürmez; boş sonuç CPU sorununu dışlamaz. Logs Explorer tekrar eden40001 process_id ile eşleşme gerekir.
- Karar: tekrarlayan canlı stale/yük testi yapılmadı. CPU dalgası sonrası tek save/PT409 ve tek eşzamanlı save/publish UI yarışı yapıldı; önceki test sekmeleri kapatıldı. Kullanıcı CPU çalışmasını rafa kaldırdı. Tarayıcı kapatmanın sunucu döngüsünü durdurduğu varsayılmadı. RLS, yayın yetkisi ve cache erişim iptali gevşetilmeyecek. Secret/API anahtarı rapora konmayacak.
- Kod incelemesi: `src/proxy.ts` yalnızca editor/auth yollarını eşliyor; public tüm sayfalarda oturum sorgusu yok. `src` içinde setInterval/Realtime subscribe bulunmadı. Kanon/harita/bölüm JSON'dan geliyor. Public wiki detayında bir editoryal RPC, her medya isteğinde yayın erişimi kontrolü var. Bunlar gelecekte ölçülecek maliyetler; mevcut yüksek CPU'nun kanıtlanmış nedeni değildir. Sharp ve Three.js işi Supabase PostgreSQL CPU'su değildir.
- Sonraki adım: önce altı PT409 tanımını doğrula, ardından varsa yalnızca logla eşleşen eski test backend'ini sonlandır. Kısa kesinti yaratan panel restart alternatifini kullanıcı onayı olmadan uygulama. Sonra10–15 dakikalık düşük trafik CPU/bağlantı/hata ölçümü; gerekirse Query Performance'da yoğun sorgu incelemesi. Ücretsiz plan yeterliliğine ölçümsüz garanti veya ücretli yükseltme kararı verilmez.
- Bağımsız iş: mevcut prototip ile final kapsam farkı ve Luna E aşaması talimatı güncellendi; veri/mimari yeniden kurulmadı.

#### Astra'ya kopyalanacak paket

```text
PRB-0017, D2/I: Next16.3.5 + Supabase JS2.116.0 uygulaması, ücretsiz Supabase projesinde yüksek CPU bildirimi. Owner iki-sekme stale save testinde önce uzun bekleme ve upstream request timeout vardı; PT409 migration sonrası tek stale save hızlı reddedildi ve yerel metin korundu. Altı PL/pgSQL RPC'deki dokuz kalıcı eski-token hatası40001'di; yeni202609210001 migration PT409'a çevirdi, kullanıcı çalıştırdı. Stale publish sekmesi sunucu isteği öncesi guard'a geçti; gerçek publish HTTP409 hâlâ yapılmadı. Yerel23 PGlite/24 bootstrap denetimi geçti; CPU yüzdesi/log PID/pg_stat_activity sonucu eksik. 03:00–06:00 dalgası sonrası 15 dakika normal gözlendi; tekrarlı yarış/yük testi yok. Nasıl yalnızca eski test döngüsünü doğrulayıp durdurabilir, ardından ücretsiz planda gerçek boşta CPU tabanını ölçebiliriz? RLS/grant gevşetme, toplu terminate/reset, bootstrap tekrar uygulama, gerçek veri silme veya kanıtsız compute yükseltmesi önerme. CPU düşmediyse yoğun sorgu kanıtıyla dar sonraki teşhisi ver.
```

### PRB-0016 — Makale içi görsel editörde önizlenmiyor

#### Güncel kabul — 21 Eylül 2026, Europe/Berlin

- Durum: `COZULDU`. 64×64 teknik PNG gerçek owner tarayıcısından yüklendi; makale içi önizleme, ardından metin kaydı, reload, yayın ve anonim200 WebP doğrulandı. Sabit medya ID `b303f43c-cd34-4292-9d55-8e35e84bda3f` korunuyor; dokümanda imzalı URL/token yok, src null. Hatalı önceki inline bağ kaldırıldı; dosya özel depoda korunur.
- Yeni testteki null-prototype dönüşümü kaldırılmamalı. Diğer D2 kabul eksikleri bu kaydı yeniden açmayı gerektirmez.

#### Astra canlı teşhisi — 20 Eylül 2026

- Önizleme çalışırken canlı kayıtta `$/content/0/attrs/mediaId: Görsel geçerli ve sabit bir medya ID'sine bağlanmalıdır.` hatası görüldü. UUID doğrulaması gevşetilmedi.
- Geçici, yalnızca yerel tanı ile sunucu girdisinin gerçek sorunu doğrulandı: `Cannot access mediaId on the server. You cannot dot into a temporary client reference from a server component.` ProseMirror `attrs` nesneleri null prototype taşıyor; React Server Actions bunları düz JSON yerine geçici istemci referansı olarak taşıyor. Kurulu React Flight kodu bu davranışı doğruluyor. Geçici tanı kodu kaldırıldı.
- `wiki-editor.tsx` snapshot sınırında `JSON.parse(JSON.stringify(editor.getJSON()))` ile ayrık, düz JSON belge gönderiliyor. Kanon, UUID doğrulaması ve SQL değişmedi. Bu dönüşüm bütün node/mark özniteliklerini kapsar.
- Yeni gerçek Tiptap testi, gönderilen görsel attrs prototipinin düz nesne olmasını ve medya ID'sinin geçerli kalmasını denetliyor. Yama öncesi `expected null to be Object.prototype` ile başarısız; yama sonrası 12/12 editör testi başarılı. Canlı kabul sonucu aşağıdaki güncel ekle tamamlanacak; yalnızca bu test sonucu D2 kapanışı değildir.

- Durum: `ONERI_UYGULANIYOR`. 17 Eylül 2026, Europe/Istanbul. Aşama D2. Deneme 1.
- Amaç: Makale içi görsel düzenleme sırasında görülsün; JSON yalnızca sabit `mediaId` tutsun. Geçici imzalı adres makaleye veya kanona yazılmasın.
- Kanıt: `wiki-editor.tsx` image düğümüne yalnızca `mediaId` ekliyor, ortak `EditorialImage` varsayılan Image render'ını kullanıyor. `src` bulunmadığından editörde görsel çözümlenmiyordu; `document.ts` haklı olarak ham `src` saklanmasını reddediyor.
- Uygulama: `inline-media-preview.tsx` yalnızca editöre ait React NodeView ile yetkili `draftMedia` context'inden önizlemeyi çözüyor. Ortak sunucu renderer ve saklanan belge değişmiyor.
- İlk kontrol: TypeScript TS2349, karışık mark/node dizisinden alınan `extension.extend` union imzasını çağıramadı. Doğrudan tipli `EditorialImage` export edilip onun üzerinden extend edilerek düzeltildi. Tiptap 3.31.3 / React 19.2.8 / TypeScript 5.9.3.
- Doğrulama: gerçek Tiptap DOM'unda görsel src/alt ve takip eden kayıtta imzalı URL'nin yokluğu testi geçti. Lint/typecheck, 61 test ve enabled build 526/526 başarılı. Canlı inline görsel E2E henüz tamamlanmadı.
- Sonraki adım / dar soru: “PRB-0016 için tipli image NodeView'ın geçici önizlemeyi JSON'a yazmadan gösterdiğini, upload sonrası ve yeniden açılışta test et; editor/gallery/server renderer mimarisini yeniden kurma.”

### PRB-0010 — Sharp tarayıcı paketine giriyor


- Durum: `COZULDU`; kapsam derleyici hatasıdır, tüm Vercel deploy'u değildir.
- Tarih: 16 Eylül 2026, Europe/Istanbul. Aşama: D2/I. Deneme: 1.
- Yeniden üretme: `npm run build`, main `2cb0d5e` kaynakları, Next.js 16.3.5, Sharp 0.35.4, yerel Node 26.0.0.
- Hata: `Module not found: Can't resolve 'child_process'`, `Can't resolve 'fs'`, `UnhandledSchemeError: node:crypto`.
- Import izi: `wiki-editor.tsx` (`use client`) → `media-processing.ts` → `sharp` / `node:crypto`. İstemci yalnızca `MAX_MEDIA_BYTES` sabitini kullanıyordu.
- Astra çözümü ve uygulanan yama: sabit bağımlılıksız `src/lib/editorial/media-limits.ts` dosyasına taşındı; tarayıcı buradan alıyor. İşleme dosyasına `import "server-only"` eklendi. Sunucu testinde yalnızca bu Next sınır işareti mocklandı; gerçek Sharp işlemesi aynen test ediliyor.
- Doğrulama: Webpack `Compiled successfully`, Next TypeScript başarılı; lint ve 43/43 test başarılı. Bu kaydın ilk build bulgusu tarihsel olarak PRB-0009'a bağlanmıştı; güncel build PRB-0015 ile çözüldü.
- Yerel ayrı engel: eski `.next/server/.DS_Store` ile `ENOTEMPTY` görüldü. Eski önbellek silinmeden `/tmp/ejder-build-cache.w4Hi2R/next` konumuna taşındı; yeni derleme derleyici/TypeScript aşamalarını geçti. Bu macOS hatası Vercel hatası diye yorumlanmamalı.
- Vercel sınırı: kullanıcı logu `Detected Next.js version` satırında bitiyor. Gerçek son hata satırları istenmiştir; yerel yeniden üretim ile Vercel'in son hata satırının aynı olduğu henüz kanıtlanmadı. Değişiklikler GitHub'a gönderilmedi.

### PRB-0011 — Taslak görsel türevleri public depoya yükleniyor

#### Güncel kabul — 21 Eylül 2026, Europe/Berlin

- Durum: `COZULDU`. Node HTTP istemcisi owner cookie göndermeden kullanıldı. Yeni inline medya uygulama URL'si yayın öncesi404, V4 sonrası200/image-webp/84bytes/`private, no-store`; galeri82bytes. Her iki medyanın original/medium private Storage public ve authenticated yolları kullanıcı JWT'si olmadan400 verdi; bytes alınmadı. İmzalı önizleme adresleri bu teste dahil edilmedi.
- V5'e özel `7680a650-90e1-4f45-9e04-c4cd663c393b` V5'te200, V4'ü geri getiren V6'dan sonra404; V4 medyaları200. V7 temizlik sonrası dört test medya uygulama adresi404. RLS'ye dayalı erişimin kaldırılması canlı doğrulandı.

- 17 Eylül canlı kabulü: `NPC-0006` üzerinde açıkça teknik test olarak işaretlenmiş özel taslağa 64×64 mor PNG yüklendi. Gerçek Storage upload, sunucuda Sharp işleme ve imzalı editör önizlemesi başarılı. Anonim özgün/türev erişimi ve yayımlanmış medya route'u kabulü henüz tamamlanmadı. Test nesnesi gerçek lore görseli değildir.

- Astra ek kontrolü: medya route'undaki bir yıllık immutable cache geri çekilmiş erişimi sürdürebilirdi. `private, no-store` uygulandı. Storage platform tablo yorumunu değiştiren SQL kaldırıldı. Yerel RLS rollback testi geçti; gerçek Storage/CDN kabulü hâlâ gerekli.

- Durum: `ONERI_UYGULANIYOR`; Astra önerisi yerel kod ve Storage migration'ına uygulandı. Gerçek Storage kabulü bekleniyor. Tarih: 16 Eylül 2026, Europe/Istanbul. D2. Deneme: 1.
- Önem: yüksek; canlı medya kabulünü engeller. Supabase boş olduğu için mevcut kullanıcı görselinin sızdığı iddia edilmiyor.
- Önceki kanıt (düzeltme öncesi): `processMediaAction` içindeki `storage.from("wiki-published").upload(...)` yayın düğmesinden önce çalışıyordu. Migration 003 bu bucket'ı `public=true` kuruyordu. `editor-repository.ts` taslak önizlemesini `getPublicUrl` ile oluşturuyordu. Metadata RLS, public dosya URL'sini gizlemiyordu.
- Kaynak: https://supabase.com/docs/guides/storage/buckets/fundamentals — public dosya sunumunda okuma erişim denetimi atlanır.
- Beklenen: taslak dosya URL'sini bilen anonim ziyaretçi bile dosyayı okuyamamalı; yayın öncesi türevler özel kalmalı.

#### Astra çözümü — Luna uygulama paketi

Orijinaller ve hazırlanmış türevleri özel bucketlarda tut. Editör önizlemesini kısa ömürlü, yetkili imzalı URL ile ver. İki aşamalı yayın tasarla: özel dosyaları hazırla/doğrula, ardından DB revizyonunu atomik etkinleştir. Kesin yayın öncesi gizlilik için türevleri de private tutup ziyaretçiye yalnızca etkin yayımlanmış revizyonda referanslı dosyayı yetkilendirerek sunmak tercih edilir. Public bucket'a önceden kopyalamak SQL transaction ile atomik olamaz; bu yaklaşımı gizlilik çözümü sayma. Sunum erişimini tek repository sınırında değiştir; mevcut kanon ID'leri ve revizyon geçmişini koru. Dosya indirme/yükleme, signed URL/cache ve rollback davranışını birlikte test et. Anonim taslak okuma 403/404, yayın sonrası erişim 200 olmalı; özel orijinal hiçbir zaman anonim açılmamalı. Bugünkü SQL sözleşme testleri yalnızca dosya metni arıyor; bunu gerçek Storage isteğiyle doğrula. Migration'lar henüz uygulanmadı; uzak şemayı düzeltilmeden kurma. Soru/sonraki iş: bu erişim modelini uygulayıp gerçek anonim/editör testlerini kanıtla. Henüz uzakta veya yerelde SQL uygulanmadı.

- Uygulama kanıtı: `wiki-originals` ve `wiki-published` private bucket olarak tanımlandı; `src/app/api/media/[mediaId]/route.ts` yalnızca etkin yayımlanmış revizyona bağlı medya için dosyayı sunuyor; editör önizlemeleri imzalı URL kullanıyor. Lint, typecheck ve 43/43 test başarılı.
- Açık kabul: Migration'lar Supabase'e uygulanmadığı için anonim taslak 404, yayımlanmış görsel 200 ve özel orijinal erişim reddi gerçek isteklerle doğrulanmadı.

### PRB-0012 — Yeniden düzenlemede yayımlanmış görseller kayboluyor

#### Güncel kabul — 21 Eylül 2026, Europe/Berlin

- Durum: `COZULDU`. V4 → yeni taslak → V5 akışında galeri/inline sırası0/1 korundu; ikinci galeri2 olarak eklendi. V4'e rollback mevcut V5'i silmeden yeni V6 oluşturdu, V4'ün dokümanı ve iki medya bağı aynen döndü. Sonra tekrar düzenlenebildi; yeni temizlik taslağı V6'yı temel aldı.
- Yayınlar: V4 `e176c701-c0fe-4e1a-84a7-a69180581262`, V5 `fd760594-dea6-437d-ba7c-42d578464879`, V6 `5c71be68-cb2e-4106-b5aa-e6cfc736fd48`. Geçmiş korundu.
- Temizlik UI üzerinden yapıldı: boş paragraf + medya bağı yok → V7 `de108f81-a136-4ba1-a1e2-3963314fa614`. Public200 içinde teknik metin/görsel yok; draft yok. V1–V6 ve private test dosyaları silinmedi. Başlangıçtaki makalesiz duruma dönüldüğü iddia edilmez.

- Durum: `ONERI_UYGULANIYOR`; Astra çözümü yerel SQL ve editör repository'sine uygulandı. Gerçek yayın/rollback kabulü bekleniyor. Tarih: 16 Eylül 2026, Europe/Istanbul. D2. Deneme: 1.
- Önceki kanıt (düzeltme öncesi): migration 001 `wiki_draft_media.article_id → wiki_drafts ON DELETE CASCADE`. Migration 002 yayın sonunda taslağı siliyordu. Sonraki `save_wiki_draft` yeni taslak oluştururken `wiki_revision_media` bağlarını kopyalamıyordu. Editör repository'si de yalnızca `wiki_draft_media` sorguluyordu.
- Sonuç: galeri/kapak sonraki yayında kaybolur. Metin içi görsel varsa `Makale taslağa bağlı olmayan bir görsel içeriyor` kontrolü yeniden yayını engeller. Eski revizyonlar silinmez; sorun yeni revizyonun eksik oluşmasıdır.
- Yeniden üretme: görselli V1 yayımla → editörü yeniden aç → sadece bir kelime değiştir → tekrar yayımla.

#### Astra çözümü — Luna uygulama paketi

Yeni taslağı mevcut yayımlanmış revizyondan oluşturan DB işlemi, makale kilidi altında belge ve tüm medya bağlarını (role, position, period dahil) aynı transaction'da kopyalamalı. Yalnızca yeni taslak oluştururken kopyala; var olan taslağa tekrar kopyalayarak silinen fotoğrafı geri getirme. Editörde taslak yokken belgeyle birlikte yayımlanmış galeriyi göster. Rollback sonrası yeni taslak da artık etkin olan revizyonun galerisiyle başlamalı. V1(galeri+inline) → metin değişikliği → V2 → V1'e rollback → yeniden düzenleme testinde fotoğraflar/roller/sıra korunmalı, eski kayıtlar değişmemeli. İlgili dosyalar: migration 001/002 ve `src/lib/editorial/editor-repository.ts`. Kanon JSON değişmeyecek. Canlı SQL/E2E henüz çalıştırılmadı; bu bulgu FK ve sorgu incelemesine dayanır.

- Uygulama kanıtı: Yeni taslak oluşturulurken etkin revizyonun tüm medya bağları aynı transaction içinde (`role`, `position`, `period` ile) kopyalanıyor. Taslak yokken editör yayımlanmış galeriyi okuyor; rollback de yeni revizyona medya bağlarını kopyalıyor.
- Açık kabul: Supabase migration'ları uygulanmadığı için V1/V2/rollback senaryosu gerçek PostgreSQL üzerinde henüz çalıştırılmadı.

### PRB-0013 — Otomatik kayıtta daha yeni düzenlemeler kaydedildi sayılıyor

#### Kapanış — 22 Eylül 2026, Astra

- Durum: `COZULDU`. Gerçek Tiptap/React DOM'da gecikmeli belge+dönem+not, uçuşta geri dönüş, ağ hatası sonrası kurtarma ve kalıcı conflict doğrulandı. Gerçek SDK kontrollü gecikmeli yanıt testi isteğin erken tamamlanmadığını doğrular. Önceki canlı owner uçuşta düzenleme/reload ve stale-save kanıtı korunur. Controlled browser network emulation yapılmadı; aynı durum gerçek bileşen/transport testlerinde deterministik olarak sınandı.
- `npm run check`:74 Vitest +6 export testi, lint/typecheck ve build526/526 başarılı. İzole SQL35, bootstrap36 denetim geçti. Özgün D2 maddeleri `D2_KABUL_RAPORU.md` matrisinde karşılandı.
- Astra kabul kararı: önceki sonradan eklenen canlı ağ emülasyonu/ayrı publish HTTP gözlemi zorunluluğu katmanlı doğrulama ile karşılandı. Guard/test gevşetilmedi; başarısız test silinmedi. CPU testleri kullanıcı talimatıyla kapsam dışında. Yeni hata kanıtı yoksa eski açık durumları yeniden uygulama.

Aşağıdaki teşhis ve denemeler tarihsel kayıttır.

#### Güncel kabul sınırı — 21 Eylül 2026

- 21 Eylül 2026 güncel yerel tekrar: `npm run check` başarıyla tamamlandı; lint, typecheck, 9 dosyada 64 test ve Webpack build 526/526 geçti. Owner tarayıcı oturumundaki Akmer editörü son temiz V13 yayını, boş taslağı ve düzenlemeye hazır durumu gösteriyor; public wiki görünümünde teknik kabul metni/görseli bulunmuyor. Bu sonuç canlı kontrollü ağ gecikmesi veya iki bağımsız oturum kabulinin yerine geçmez.
- 21 Eylül 2026 canlı kabul: Aynı owner oturumunun iki editör sekmesinde A taslağı kaydedildikten sonra eski B sekmesi tek bir save isteğinde hızlı `Sürüm çakışması · Başka bir editör bu içeriği değiştirdi. Değişikliklerinizi kopyalayıp sayfayı yenileyin.` yanıtı aldı. B sekmesindeki yerel metin korundu; save/publish düğmeleri kilitlendi. Ardından iki sekmede save ve publish düğmeleri eşzamanlı olarak birer kez başlatıldı; A save başarılı, B sekmesi yerel metni koruyarak aynı çakışma durumuna geçti. Exact publish HTTP durumu tarayıcı UI'sinde görünmediği için bu doğrudan HTTP409 olarak yazılmadı.

- Gerçek Tiptap ve coordinator regresyonları dahil64 test başarılı. Gerçek owner editöründe görselden sonra metin/not kaydı, reload ve publish tamamlandı. Bu tur uçuşta kayda girerken yeni metin eklendi; status tekrar `Taslak kaydedildi`, reload sonrası birleşik yerel metin korundu. Kontrollü ağ gecikmesi ve iki bağımsız Auth oturumu yapılmadı; tarayıcı aracı ağ emülasyonu sağlamıyor. Eski sekme upstream timeout'u PRB-0014'ün SQLSTATE düzeltmesine bağlıydı.

- 17 Eylül Astra uygulaması: `SaveCoordinator` belge/dönem/not snapshot'larını tek sırada işliyor. Save, medya ve publish aynı coordinator token'ını kullanıyor; medya yanıtı artık yalnızca ayrı parent ref'ini değil gerçek kuyruk token'ını güncelliyor. Conflict yazmaya devam edilince temizlenmiyor; yerel belge JSON olarak indirilebilir ve sunucu sürümü ayrı sekmede açılır.
- Güncel doğrulama: 11 coordinator testi ve gerçek React/Tiptap bileşeniyle happy-dom altında 9 DOM testi dahil toplam 61 test geçti. Gecikmeli A→B, A→B uçuşta→A, metadata, ağ hatası, kalıcı conflict, medya sonrası sürüm, yayın kilidi, yayın sonrası yeni taslak ve temiz yayın sonrası rollback düğmesinin yanlış kilitlenmemesi kapsanıyor. Happy-dom canlı tarayıcı/ağ testi değildir. Codex tarayıcısında görsel yüklemesinden sonra metin kaydı ve V1/V2 public yayın kontrolü başarılı; kontrollü iki sekme testi bekliyor.

- Astra ek inceleme, açık kalan işler: `saveLatest` eski `enqueueSave` closure'ını tutuyor; dönem/not değişirken yeni sequence ile eski metadata gönderilebilir. `lastSaved` fast path kuyruktaki isteği beklemiyor (A→B uçuşta→A). 40001 status'u bir sonraki yazıda dirty'ye dönüp retry başlatabiliyor. Mevcut equality helper testleri bunları kapsamaz.
- Çözüm talimatı: belge+dönem+not snapshot'larını tek kuyrukta yönet; pending varken fast path kullanma; kalıcı conflict latch ve aynı görevde network exception handling; publish/upload reload öncesi yeni yazıyı koru. Kabul: kontrollü gecikmeli isteklerle gerçek kuyruk testi + tarayıcı testi. Ayrıntılı sıra Luna belgesinde. Bu açık kısım kodda bu tur değiştirilmedi; çözülmüş sayma.

- Durum: `ONERI_UYGULANIYOR`; Astra çözümü editör durum akışına uygulandı. Canlı uçuşta düzenleme ve yeniden açma kabulü geçti; kontrollü ağ gecikmesi araç tarafından sağlanamadığı için kayıt açık tutuluyor. Tarih: 21 Eylül 2026, Europe/Berlin. D2. Deneme: 1.
- Önceki kanıt (düzeltme öncesi): `wiki-editor.tsx` enqueueSave belgeyi başta yakalıyor; ağ yanıtı geldiğinde koşulsuz `lastSaved.current = serialized; setStatus("saved")` yapıyordu. Otomatik kayıt yalnızca `status === "dirty"` iken 1600 ms timer kuruyordu.
- Yeniden üretme: A belgesinin kaydı sürerken B yaz → A'nın yanıtı B için timer çalışmadan gelsin → status saved olur ve timer iptal olur. Ekranda B varken sunucuda A kalabilir. Tarayıcı E2E henüz uygulanmadı; bu açık akışın statik analizi.

#### Astra çözümü — Luna uygulama paketi

Kaydedilen tam snapshot (document+period+changeNote), güncel snapshot ve uçuş halindeki istek için ayrı monoton düzenleme numarası tut. Yanıt yalnızca ait olduğu snapshot'ı onaylasın. Güncel sürüm farklıysa saved göstermesin ve bir sonraki kaydı planlasın. Kuyruk ağ reddinden sonra kurtarılabilsin; çatışmada otomatik tekrar durmalı, kullanıcının metni kalmalı. Yayın/reload öncesinde gerçekten son sürümün başarıyla kaydedildiğini bekle. Gecikmeli promise ve kontrollü timer testi: A yanıtından sonra B hâlâ dirty olmalı ve sonraki istekte B gönderilmeli. Dönem/not değişimi ve başarısız ağ sonrası tekrar da test edilmeli. İlgili dosya yalnızca editör durum akışı ve bunun bağımsız test edilebilir yardımcısıdır; tüm editörü yeniden yazma.

- Uygulama kanıtı: Editör belge/dönem/not snapshot'ı için monoton `editSequence` tutuyor; eski yanıt yalnızca kendi snapshot'ı güncelse `saved` işaretliyor. `saveLatest`, yayınlama veya medya ekleme/yenileme öncesinde daha yeni bir snapshot varsa onun da kaydedilmesini bekliyor. Kuyruk reddi sonrasında devam ediyor, çatışmada otomatik tekrar duruyor ve metin korunuyor.
- Açık kabul: Gerçek browser timer/DOM testi henüz eklenmedi; mevcut doğrulama statik inceleme, lint, typecheck, gerçek gecikmeli promise ile iki kayıt koordinatörü regresyon testi ve toplam 43/43 testtir.

- 16 Eylül Luna kabulü: `SaveCoordinator` gecikmeli A→B kuyruğunda A yanıtından sonra B snapshot'ını dönen token ile gönderdi; kalıcı conflict yeniden kuyruğa alınmadı. Editör ekranı yerel üretim sunucusunda Auth girişine yönlendiriyor; parolalı owner oturumu olmadığı için gerçek browser timer/DOM senaryosu çalıştırılamadı. Kayıt açık tutuldu.

### PRB-0014 — Medya mutasyonları ve taslak ömrü eşzamanlılık kontrolünü aşıyor

#### Kapanış — 22 Eylül 2026, Astra

- Durum: `COZULDU`. Gerçek SQL'de altı RPC PT409/stale/ABA/base-revision ve medya sürüm kontrolleri; gerçek SDK + kontrollü HTTP409 ile publish/remove/reorder tek istek/conflict; gerçek Tiptap'ta yayın conflict latch, medya tokenı, mutasyon kilidi ve hayalet taslak regresyonları geçti. Canlı owner stale-save/save-publish çatışması, V4–V6 rollback, görsel akışı ve V17 temizliği kabul edildi. Yayın önce save kuyruğunu boşaltır; eski sekmenin publish RPC'sine ulaşmadan durması korumadır. Doğrudan canlı publish HTTP409 ve iki bağımsız DB oturumu ölçülmedi; kontrollü test yanıtı canlı sonuç diye sunulmaz.
- `npm run check`:74 Vitest +6 export testi, lint/typecheck ve build526/526 başarılı. İzole SQL35, bootstrap36 denetim geçti. Özgün D2 maddeleri `D2_KABUL_RAPORU.md` matrisinde karşılandı.
- Astra kabul kararı: önceki sonradan eklenen canlı ağ emülasyonu/ayrı publish HTTP gözlemi zorunluluğu katmanlı doğrulama ile karşılandı. Guard/test gevşetilmedi; başarısız test silinmedi. CPU testleri kullanıcı talimatıyla kapsam dışında. Yeni hata kanıtı yoksa eski açık durumları yeniden uygulama.

Aşağıdaki teşhis ve denemeler tarihsel kayıttır.

#### Astra canlı teşhisi — 21 Eylül 2026, Europe/Berlin

- 21 Eylül 2026 güncel sınır: Kullanıcı 03:00–06:00 arasında yaklaşık %100 CPU dalgası, son 15 dakikada ise olağan seviyeyi gözledi. Kullanıcının talimatıyla CPU teşhisi ve tekrarlayan canlı çakışma/yük testleri bu tur rafa kaldırıldı. Bir stale save/PT409 ve bir eşzamanlı save/publish UI yarışı çalıştırıldı; A save başarılı, B yerel metni koruyan conflict durumuna geçti. Yerel kalite zinciri (lint, typecheck, 64 test, build 526/526) geçti. Kullanıcının seçtiği kanon dışı `deneme` görselinin owner editöründe yüklenmesi, reload sonrası kalması, UI'den kaldırılması ve boş V15 yayınının ardından public görsel/alt metin bulunmaması doğrulandı. Exact publish HTTP kodu ve kontrollü ağ gecikmesi araç sınırı nedeniyle kanıtlanmadı; core reimport/export da ayrıca doğrulanmadı; D2 bu nedenle kapanmadı.

- Güncel durum: `GIRDI_BEKLIYOR`. Altı migration PGlite23, yeni bootstrap24 denetim geçti; altı RPC'nin stale save/attach/remove/reorder/publish/rollback sonuçları PT409. Kullanıcı ileri migration'ı SQL Editor'de çalıştırdı ve fonksiyon tanı çıktısında altı satırın tamamında `old_retry_code=false`, `http_conflict_code=true` görüldü; migration tekrar uygulanmayacak. Bu, canlı HTTP409 istek kabulinin yerine geçmez. Lint/typecheck64 test ve yeni enabled build526/526 geçti.
- Aynı kontrollü kabul sonunda teknik taslak gerçek editör girdisiyle boşaltıldı, boş V9 yayımlandı ve sayfa yeniden açıldı. Beş saniye beklemede yeni draft oluşmadı; public Akmer sayfasında kabul metni/görseli yok. İlk boşaltma denemesi programatik `fill` ile Tiptap güncellemesi üretmedi; gerçek klavye silme ile düzeltildi ve bu ayrıntı sonraki testlerde korunmalı.
- Ayrı stale publish kontrolünde B sekmesi A'nın kaydından önce kendi yerel metnini tuttu. A kaydından sonra B, yayın isteği göndermeden `Sürüm çakışması` durumuna geçti; yerel metin korundu ve `Taslağı kaydet`/`Yayımla` kontrolleri kilitlendi. Bu istemci guard'ı başarılıdır ancak sunucuya ulaşan gerçek publish HTTP409 olarak sayılmaz. Güncel A sekmesi gerçek klavye girdisiyle temizlenip boş V10 yayımlandı; yeniden açma ve 5 saniye bekleme sonrası draft yok, public sayfa temiz.
- Medya çatışması için tek kontrollü hazırlık denemesinde yerel 1×1 test dosyası dosya seçiciye bağlanmadı; `Görseli ekle` isteği oluşmadı, canlı veride değişiklik olmadı ve sekmeler kapatıldı. Bu tarayıcı dosya-seçici engeli medya attach/remove/reorder kabulini kanıtlamaz; aynı yükleme tekrarlanmayacak. Sonraki deneme gerçek seçilebilir bir test dosyası veya kullanıcı tarafından açık dosya seçimi gerektirir.
- Hayalet taslak düzeltmesi canlı doğrulandı: V4 ve V5 sonrası en az5 saniye düzenlemeden beklenirken draft=null; eski sürüm düğmeleri açıldı. Yayın sırasında metin/not/medya kontrolleri kilitlendi. Bu alt sorun artık bekleyen SQLSTATE sorunundan ayrıdır.

- Gerçek owner oturumuyla iki sekme testi: A güncel notu kaydetti; eski B notu kaydetmeye çalışınca uzun süre `Taslak kaydediliyor…`, ardından `upstream request timeout` görüldü. Yerel test notu ekranda korundu; çakışma kabulü başarısız. Veri ezilmesi görülmedi. İkinci deneme de eski token ile başlatıldı; daha fazla istek gönderilmeden B kapatıldı.
- Somut kod bulgusu: altı editör RPC'sinde dokuz kalıcı sürüm çakışması `40001` olarak yükseltiliyor. Bu kod PostgreSQL serialization failure anlamındadır. Supabase'in resmi teşhisi, PostgREST 14'te bu özel kodun sonsuz tekrar ve upstream timeout üretebildiğini doğrular: https://supabase.com/docs/guides/troubleshooting/high-cpu-and-infinite-transaction-retries-when-using-custom-error-codes-in-rpc-functions-77326b . Canlı PostgREST sürümü/log process_id henüz okunmadı; davranış ile kod bulgusunun eşleşmesi güçlüdür, doğrudan backend log kanıtı değildir.
- Dar çözüm: yeni `202609210001_editorial_conflict_sqlstate.sql`, mevcut altı fonksiyonun yalnızca dokuz `errcode` sabitini `PT409` yapar. Kilitler, RLS, yetkiler, imzalar, eski migration'lar ve veriler korunur; bilinmeyen fonksiyon/guard sayısında atomik olarak durur. Sunucu action kodu PT409'u tanır, eski40001 uyumluluğu sürer.
- Canlı uygulama henüz yapılmadı: secret key Data API erişimidir, yönetim SQL bağlantısı değildir. Yerel ortamda DB URL/parola veya yönetim token'ı yok. Kullanıcı yeni dosyayı SQL Editor'de çalıştırmalı; bootstrap tekrar çalıştırılmaz. Canlı kabul sonuçları ve yerel SQL testi aşağıda tamamlanacak.
- Kopyalanabilir sonraki soru: “Altı RPC'deki kalıcı eski-token hatası PT409'a taşındıktan sonra aynı owner'ın iki sekmesinde save/media/publish hızlı409 ile reddediliyor mu? Yerel metin ve indirme korunuyor mu? Önceki40001 döngüsü sürüyorsa Logs Explorer process_id ile pg_stat_activity PID'sini doğrulayıp yalnızca ilgili backend'i sonlandır; topluca bağlantı kapatma veya veri silme.”

#### Güncel Astra yanıtı ve uygulaması — 18 Eylül 2026

- Durum: `ONERI_UYGULANIYOR`. Kullanıcı doğrudan Astra incelemesini istedi; önceki iki Luna denemesi korunuyor. Yeni ve ölçülebilir neden bulundu, tahmini üçüncü yayın yapılmadı.
- Kanıt: kurulu Tiptap 3.31.3 `node_modules/@tiptap/core/src/Editor.ts:307` imzası `setEditable(editable: boolean, emitUpdate = true)`. `emitUpdate` doğruyken belge değişmemiş olsa bile `this.emit('update', ...)` çağırıyor. `wiki-editor.tsx` içindeki `onUpdate` bunu gerçek düzenleme sayıp `editSequence` artırıyor ve `dirty` işaretliyor. Yayın token'ı null yaptıktan sonra kilit açılışı 1600 ms otomatik kaydı tetikliyor; yeni draft oluşuyor, rollback koruması haklı olarak devrede kalıyor. Medya ve başarısız rollback kilitleri de aynı yan etkiye sahipti.
- Dar düzeltme: dört kilit açma/kapama çağrısı `editor.setEditable(false, false)` / `editor.setEditable(true, false)` oldu. Gerçek metin güncellemeleri, conflict koruması ve draft kontrolü değişmedi. Migration, RLS ve yayın transaction'ı değiştirilmedi. Eski sunucu taslağı kendiliğinden silinmez.
- Eklenen kabul testleri (`tests/editorial/wiki-editor.test.ts`): yayın→yenilenen server props→5 saniye hiç yazmadan bekleme yeni save göndermemeli ve rollback açık olmalı; reddedilen rollback sonrası kilidin açılması temiz yayından taslak üretmemeli. Gerçek Tiptap kullanılır; server action yanıtları kontrollü mock'tur.
- Doğrulama sınırı: yeni test çalıştırması bağımlılık dosyası okumasında bekledi (PRB-0003); yeni yama henüz geçti sayılmıyor. Önceki 61 test sonucu tarihsel. Yeni iki testle beklenen toplam 63'tür, sayı tek başına kabul değildir.
- Önceki teşhise düzeltme: uzun `Yayımlanıyor…` görüntüsü RPC süre ölçümü değildir. Next 16.3.5 aynı action yanıtında yeniden render da yapabilir. Transaction kilitlendi, eventual commit oldu veya secret yüzünden publish durdu denemez. Gerekirse action/RPC/RSC sürelerini ayrı ölç; anahtar, cookie veya makale içeriğini loglama.
- Luna'nın dar devam adımı: dosyaları indir → kalite kontrolleri → yeni derleme/sunucu ve kayıtlı sayfayı yenile → eski build kullanan diğer editör sekmelerini kapat → yalnızca bilinen teknik taslağı onaylı kabul kapsamında bir kez yayımla → 5 saniye hiç yazma → yeni autosave olmamasını ve rollback'i doğrula. Mevcut gerçek taslağı elle DB'den silme veya korumayı kaldırma.
- Gerekirse salt okunur SQL: `supabase/diagnostics/wiki_publish_state.sql`. Yalnızca NPC-0006 için etkin revizyon, taslak varlığı/temeli, belge eşitliği ve medya sayılarını verir; kullanıcı/secret/metin/yol döndürmez. Migration değildir ve canlıda bu tur çalıştırılmadı. Başarılı yayın sonrası düzenleme yokken `draft_exists=false` beklenir. Tek sorgu veya eşit belge tüm medya/metadata eşitliğini ya da güvenli silmeyi kanıtlamaz.
- Canlı kabuller bitmeden `COZULDU` veya D2 tamamlandı yazma. Aynı belirti sürerse yeni sonuçları bu kayda ekle; önceki danışma sorusunu değişmemiş biçimde yeniden sorma.

#### Önceki inceleme ve deneme geçmişi

- Durum: `MANUEL_DANISMA_BEKLIYOR`. Son güncelleme: 18 Eylül 2026, Europe/Istanbul.
- 17 Eylül Astra düzeltmesi: medya remove/reorder/upload ve publish aynı mutasyon rezervasyonunda; bekleyen metin kaydı tamamlanır ve en güncel snapshot gönderilir. Publish yanıtı coordinator draft token'ını sıfırlar ve yeni published revision temelini günceller. Başarısız medya isteği galeriyi iyimser olarak değiştirmez.
- Gerçek Tiptap gecikmeli yayın testi önce başarısız oldu: `fieldset.disabled` beklenen `true` yerine `false` idi. React transition busy durumunu geciktiriyordu. `useTransition` yerine acil `useState` kilidi ve `editor.setEditable(false)` kullanıldı; test geçti. Metin/dönem/not/toolbar/medya aynı kilidi paylaşır.
- Ek rollback incelemesi: server sayfasındaki ayrı rollback formu kayıt kilidinin dışındaydı. Sürüm geçmişi editörün kilitli alanına taşındı. Açık veya kaydedilmemiş taslak varken rollback engellenir, önce taslağı yayımlama açıklaması gösterilir. Temiz yayında rollback boyunca editör kilitlenir; başarılı sonuçta yeni belge/medya/token tam yüklenir. Eski yayına dayanan sunucu taslağı başlangıçtan conflict olarak açılır. İlk lint kontrolü render içinde ref okumayı reddetti; gösterim server state'e bağlandı ve lint geçti. Bu değişiklikler canlı migration gerektirmez.
- Doğrulama: lint/typecheck, toplam 61 test ve enabled build 526/526 başarılı. Codex tarayıcısında V1/V2 public yayınları görüldü; V2 sonrası eşleşen sunucu taslağı rollback düğmesini güvenlik gereği kilitledi. Canlı rollback, teknik içeriğin temizlenmesi ve iki ayrı Supabase oturumunun eşzamanlı yarış kabulü tamamlanmadan kayıt kapanmaz.
- 18 Eylül canlı denemesi, onaylı V2 teknik taslağı aynı içerikle yayımlamak için iki kez yapıldı. Her iki denemede de editör uzun süre `Yayımlanıyor…` durumunda kaldı; ikinci deneme sonunda sunucu revizyon 3'ü oluşturdu. Sayfa yenilenince revizyon 3 `Yayında` görünüyor ancak rollback güvenlik uyarısı hâlâ mevcut ve V2 taslağı/galerisi editörde kalıyor. Bu, publish RPC'nin eventual commit süresi ile taslak silme/yeniden oluşturma davranışının canlıda netleşmediğini gösterir; üçüncü tahmini yayın denemesi yapılmayacak.
- Yeniden üretme: Codex in-app browser'da owner oturumuyla `http://127.0.0.1:3001/editor/NPC-0006` aç → eşleşen V2 taslağında `Yayımla` seç → 30 saniyeden uzun bekle → düğme uzun süre `Yayımlanıyor…` kalır; sunucu yeniden başlatılıp sayfa yenilendiğinde revizyon 3 görünür, fakat “Önce mevcut taslağı yayımlayın…” guard'ı ve disabled rollback düğmesi devam eder. Public wiki HTTP 200 ile teknik V2 metnini göstermeye devam eder.
- Manuel Astra sorusu: “Supabase canlı owner oturumunda `publish_wiki_draft` RPC'si 30 saniyeden uzun bekleyip sonunda revizyon oluşturuyor; aynı makaleyi yeniden açınca `wiki_drafts` veya eşdeğer pending state rollback'i kilitliyor. `wiki_articles`/`wiki_drafts` row lock, RPC transaction veya Auth/secret erişimini değiştirmeden publish sonrası taslağın gerçekten silindiğini ve rollback'in neden hâlâ guard'a takıldığını hangi dar teşhis sorguları ve düzeltmeyle doğrularız? Gerekli SQL/log çıktısını gizli anahtar olmadan belirt.”

- Astra ek düzeltmeleri: yeni taslak açılışında beklenen published revision (sekizinci save parametresi) kontrolü ve TS/action/istemci aktarımı; remove için article→draft kilit sırası; DB reorder duplicate ID reddi. PGlite stale/null token, ABA, publish sonrası eski sayfa, galerinin yeni taslağa kopyalanması, rollback sonrası stale publish reddi geçti.
- Açık kalan istemci işi: medya yöneticisinin ayrı kuyruğu autosave ile yarışabiliyor; aynı sayfada eski token yanıtı güncel token'ı ezmemeli. Tek mutasyon kuyruğu veya açık editör kilidi uygulanmalı. Gerçek iki PostgreSQL oturumu testi ve tarayıcı kabulü bekliyor.

- Durum: `ONERI_UYGULANIYOR`; Astra çözümü migration ve editör medya akışına uygulandı. Gerçek PostgreSQL yarış kabulü bekleniyor. Tarih: 16 Eylül 2026, Europe/Istanbul. D2. Deneme: 1.
- Önceki kanıt (düzeltme öncesi): migration 005 attach/remove/reorder RPC'leri beklenen taslak sürümünü almıyor, sürümü artırmıyor ve yayınla aynı taslak kilidini kullanmıyordu. Migration 002 taslakları silip yeni taslağı `lock_version=1` ile başlatıyordu; NULL karşılaştırması da sürüm kontrolünü atlayabiliyordu. Bu, anonim yetki aşımı değil editörlerde kayıp güncelleme açığıydı.

#### Astra çözümü — Luna uygulama paketi

Taslak yaşamları arasında sıfırlanmayan makale sürümü ya da draft UUID + lock_version kullan. Save/publish/attach/remove/reorder aynı sürüm sözleşmesini ve aynı sırada makale/taslak row lock'larını kullansın; her başarılı değişiklik token'ı artırsın ve istemciye dönsün. Eski/NULL token'ı `IS DISTINCT FROM` veya açık NULL kontrolüyle 40001 olarak reddet. Yeni taslak oluşturma beklentisini mevcut yayımlanmış revizyonla da karşılaştır. Aynı anda ilk makaleyi oluşturan oturumlar unique violation yerine kontrollü çakışma almalı. İki gerçek authenticated oturumla: eski sürüm, NULL, silinip yeniden oluşturulmuş taslak ve paralel galeri/yayın yarışları test edilmeli; kaybeden istek sessizce yazmamalı. Testler SQL metni aramasına indirgenmemeli. Canlı PostgreSQL olmadığı için bu turda yarış testi çalıştırılmadı.

- Uygulama kanıtı: `draft_id` UUID'si ve `lock_version` tüm save/publish/attach/remove/reorder RPC'lerinde bekleniyor; her başarılı medya mutasyonu token'ı artırıp istemciye döndürüyor. Aynı makale kilit sırası ve `IS DISTINCT FROM` ile NULL/eski token reddi uygulandı. İlk makale oluşturma `ON CONFLICT ... DO NOTHING` sonrası tekrar kilitli okuma yapıyor.
- Açık kabul: Migration'lar uzak Supabase'e uygulanmadığı için iki oturumlu yarış, ABA ve gerçek Storage/PostgreSQL RLS kabulü henüz çalıştırılmadı.

- 16 Eylül Luna kabulü: canlı Supabase reader/identity kontrolü HTTP 200 ve 416/403/13 sonuçlarıyla başarılı; PGlite birleşik bootstrap testi 18/18 geçti. Gerçek Auth oturumu olmadan `wiki-originals` yükleme, private original reddi, published türev ve iki oturumlu PostgreSQL yarış akışı çalıştırılamadı. Kayıt açık tutuldu; D2 tamamlandı sayılmadı.

### PRB-0015 — Editoryal wiki route'u build sırasında Supabase'e bağlanarak statik üretimi durduruyor

- Durum: `COZULDU`
- Kanıt: Editoryal mod açık `npm run build` sırasında `/wiki/[slug]` sayfaları statik üretimde `fetch failed` ile düşüyordu; public REST ve reader RPC dışarıdan çalışıyordu. `generateStaticParams` yerel veri üretse de sayfa gövdesi build worker içinde Supabase RPC'sini çağırıyordu.
- Uygulanan en küçük düzeltme: `src/app/wiki/[slug]/page.tsx` route'u `dynamic = "force-dynamic"` olarak işaretlendi ve `revalidate` kaldırıldı. Makale içerikleri build artifact'ına gömülmüyor; canlı istek sırasında yayımlanmış revision okunuyor.
- Doğrulama: `.env.local` ile editoryal mod açık üretim build'i 526 sayfa/route ile başarıyla tamamlandı; `/wiki/[slug]` çıktı tablosunda dinamik (`ƒ`) görünüyor. `npm run supabase:check-live`: 416/403/13 ve reader HTTP 200.
- Sınır: Bu düzeltme Vercel deployment'ının kendisini doğrulamaz. Vercel yeni commit'i çalıştırıp canlı route'u kontrol etmeli. Runtime'da `SUPABASE_SECRET_KEY` yalnızca özel medya route'u için gereklidir; public wiki text reader publishable key ile çalışır.

### PRB-0009 — Supabase yönetim erişimi ve ilk kurulum bekleniyor

#### Güncel ortam — 21 Eylül 2026, Europe/Berlin

- Son önizleme handoff'u: son build ile sunucu3001'de yeniden başladı. Browser Use sekmesi `ERR_NETWORK_IO_SUSPENDED` hata sayfasına düştü; bir sonraki deneme kota nedeniyle otomatik incelemeyi tamamlayamadı. Kullanıcı devam dediğinde navigation, aracın kendi data-URL hata sayfası politikasıyla engellendi. Güvenlik/izin ayarı aşılmadı; bu bir uygulama derleme hatası diye kaydedilmedi. Sonraki ajan mevcut tarayıcı envanterini güvenli biçimde yeniden seçsin; uygulama kodunu bu araç hatası için değiştirmesin. SQL dosyası kullanıcıya Codex dosya panelinde açılmak üzere gönderildi.

- Bootstrap, owner ve yerel server secret tamam. Anahtar kullanıcı tarafından belirtilen dosyadan `.env.local` içine çıktı vermeden aktarıldı; chmod0600 ve Git ignore korundu. Auth owner oturumu ve Storage gerçek upload/public türev işlemleri çalışıyor. Önceki yerel503 engeli kalktı. Inline görsel, save/reload/publish, galeri koruma, rollback ve anonim türev erişimi owner oturumunda doğrulandı; bu kayıt ortam erişimi açısından COZULDU.
- D2'nin kalan kabulü PRB-0013/0014 ve planın diğer eksik E2E maddelerine bağlı. Yönetim SQL/DB bağlantısı yok; secret key bunun yerine geçmez. Yeni ileri migration için kullanıcıya SQL Editor adımı verildi. Yeniden bootstrap/owner/secret isteme.

#### Güncel ortam ayrımı — 18 Eylül 2026

Bootstrap, owner ve Vercel server secret kullanıcı tarafından tamamlandı; tekrar isteme. Önceki canlı testte yerel public medya endpoint'i `503 / Medya servisi hazır değil.` verdi. Yerel `.env.local` içinde server secret bulunmaması Vercel'deki değişkenin eksik olduğu anlamına gelmez. Public wiki metni ve HTML görsel referansı görüldü; anonim görsel bytes başarısı henüz kanıtlanmadı. Yerel medya kabulü için `SUPABASE_SECRET_KEY` yalnızca yerel gizli dosya/sunucu ortamına güvenli yolla eklenir ve sunucu yeniden başlatılır; değer sohbet/log/repo/tarayıcı çıktısından alınmaz. Alternatif, mevcut yetki kapsamındaki Vercel Preview ortamında kabul yapmak; bu D2 tamamlandı veya Production deploy başarılı demek değildir. Eksik erişim nedeniyle kabul bekliyorsa açık kaydet. Yeni ortam değerlerini bu tur okumadık veya değiştirmedik.


- 17 Eylül güncel kabul: Kullanıcının açtığı Safari oturumunda owner görünümü ve gerçek taslak/görsel işlemleri doğrulandı. Safari başka kullanıcı işleriyle eşzamanlı kullanıldığı için son testler ayrı Codex tarayıcısına taşındı. Kullanıcı burada da giriş yaptığını bildirdi; son adres `/editor`. Giriş bekleme engeli kaldırıldı, testler Luna'ya devredildi; bu devir turunda test yapılmadı. Auth parolası veya token başka tarayıcıdan alınmadı. Yayın/anonim Storage/rollback testi tamamlanmadı; teknik taslak henüz yayına çıkmadı. Kullanıcının Vercel Secret Key onayı korunur.

**Yeni Astra incelemesi — 16 Eylül 2026:**

- Kullanıcı migration uygulamasını açıkça istedi. Önceki migration yapmama bağlamı artık güncel değil.
- Genel URL/publishable key var; yerel secret key ve PostgreSQL yönetim bağlantısı yok. Supabase projesi ve bir Auth kullanıcısı Safari panelinde görüldü, owner profili henüz doğrulanmadı. Secret key DDL erişimi sağlamaz.
- Kullanıcıya SQL Editor'de hazır dosyayı çalıştırma veya .env.local'e yönetim bağlantısı ekleme seçenekleri sunuldu; kullanıcı SQL Editor yolunu seçip bootstrap'ı çalıştırdı. Yönetim bağlantısı gerekmiyor; canlı şema salt-okuma ile doğrulandı.
- Kullanıcı bootstrap SQL dosyasını canlı Supabase SQL Editor'de çalıştırdığını bildirdi. 16 Eylül ağ erişimli salt-okuma kontrolü: `world_entity_identities` 416 toplam / 403 etkin / 13 emekli; `get_published_wiki_article(text)` RPC doğru parametreyle HTTP 200. `editor_profiles` publishable key ile 401 dönüyor; bu RLS'in beklenen sonucu ve owner satırını doğrulamaz. Kullanıcı owner rolünü ve Vercel Secret Key'i tamamladığını açıkça onayladı; bu kayıtta tekrar doğrulama istenmedi. Yerel tarayıcıda owner/Auth oturumu bulunmadığı için gerçek editör/Storage E2E'si ayrı kabul adımı olarak açık kaldı.
- Son production kabul tekrarında `npm run check` 43/43 test, lint, TypeScript ve 526 sayfalık editoryal mod açık build ile başarılı; `package.json`/lockfile Node `24.x` sabit.
- `supabase/generated/bootstrap_editorial.sql`: boş şema için atomik 001–005 + identity seed; mevcut kurulumda durur. `bootstrap_manifest.json` ve özel kurulum makbuzu hash tutar. CLI history ayrı senkronize edilir. `verify_installation.sql` kurulum sonrası salt-okuma kontrolüdür.
- Yerel gerçek PostgreSQL motoru PGlite 0.5.8 ile 17 işlevsel denetim; birleşik paket ile 18 denetim geçti. Auth/Storage fixture, pgcrypto extension kurulumu ve gerçek HTTP Storage test dışı; iki bağlantılı race testi yapılmadı. Test aracı `scripts/verify_editorial_pglite.mjs`, tekrar komutları Luna belgesinde.
- Önizleme `SUPABASE_EDITORIAL_MODE=enabled` ile production server'da açıldı. `/map`, `/wiki`, Akmer makalesi, Akmer araması ve editör giriş yanıtı 200; geçersiz medya ID 400, bilinmeyen UUID medya 404. In-app ekran görüntüsü ilk kontrolde görüldü, son tarayıcı yeniden kontrolü araç zaman aşımına uğradı; Auth/Storage sahibiyle editör E2E yapılmadı. Bu HTTP denetimi tarayıcı etkileşim testinin yerine geçmez. `fetch failed` tek başına boş şema kanıtı değildir.
- Sonraki somut adım: Supabase Auth kullanıcısının gerçek UUID'sine owner profili eklenmesini doğrula → Supabase secret key'i yalnızca Vercel server ortamına ekle → gerçek D2 kabulü. Migration/seed canlıda doğrulandı; bootstrap'ı tekrar çalıştırma.
- Güncel danışma sorusu: “SQL Editor paketini çalıştırıp sonucunu paylaşacak mısın, yoksa yönetim bağlantısını yerel gizli dosyaya ekleyip kurulumu ajanın yapmasını mı tercih ediyorsun?”

Önceki kayıt ve deneme geçmişi:

- Durum: `GIRDI_BEKLIYOR`
- Oluşturulma / son güncelleme: 16 Eylül 2026, Europe/Istanbul
- Aktif aşama ve adım: D2 — gerçek Auth/PostgreSQL/Storage kurulumu ve uçtan uca kabul
- Tür: Eksik erişim veya girdi
- Deneme sayısı: 1; migration erişimi olmadığı için yalnızca salt-okuma bağlantı ve derleme kontrolü yapıldı.
- Engellenen iş ve kabul ölçütü: Migration'ların gerçek Supabase PostgreSQL'e uygulanması, RLS testleri, özel/yayımlanmış bucket yüklemesi, sahip/editör oturumu, fotoğraflı taslak-yayın-geri alma E2E senaryosu.
- Bağımsız devam edilebilecek işler: Migration, uygulama, test ve kurulum belgeleri yerelde hazırlandı.
- Gereken girdi: Supabase proje URL'si, publishable key, yerel ortama konacak secret key veya yetkili CLI/veritabanı oturumu, ilk sahip hesabının e-posta adresi ve Auth dönüş URL'leri için kullanılacak site adresleri. Gizli anahtar sohbete yazılmamalı; `.env.local` veya yetkili ortam değişkenine eklenmeli.
- Astra durumu: Bu bir teknik danışma sorunu değildir; kullanıcı/proje erişimi gerekir.

#### Uygulama ve doğrulama

- Uygulanan değişiklik: Sürüm kontrollü migration'lar, RLS/Storage politikaları, kimlik seed üretimi, SSR Auth, Tiptap editörü, davet, taslak/yayın/rollback ve medya işleme kodu hazırlandı.
- Yerel doğrulama: Supabase bağlantısı olmayan modda editör giriş sayfası Türkçe yapılandırma durumuyla açıldı; tarayıcı konsolunda hata yok. Gerçek bulut kabulü yapılmadı.
- Sonraki adım / gereken girdi: Erişimler yerel ortamda ayarlandıktan sonra migration, seed, owner bootstrap, `supabase test db` ve tarayıcı E2E akışı çalıştırılacak.

#### Astra incelemesi — 16 Eylül 2026, Europe/Istanbul

- Kullanıcı `.env.local` içine URL ve publishable key ekledi; GitHub deposunu Vercel/Supabase'e bağladı. Kullanıcı veritabanının boş olduğunu ve hiçbir migration uygulanmadığını doğruladı. Bu artık “URL yok” sorunu değildir.
- Gerçek salt okuma: `GET /rest/v1/rpc/get_published_wiki_article?p_entity_id=NPC-0001` → HTTP 404, `PGRST202`, `Could not find the function public.get_published_wiki_article(p_entity_id) in the schema cache`. Anahtar çıktıya yazılmadı; veri değiştirilmedi.
- Gerçek ağ erişimli temiz `npm run build`: Webpack 13,8 saniyede, TypeScript 4,6 saniyede geçti; 526 sayfanın prerender aşamasında aynı eksik fonksiyon mesajıyla çıkış 1 verdi. Örnek rota `/wiki/ayrantuz-kralligi`. Bu, sıradaki deploy engelinin varsayım değil yerel gerçek bağlantıyla yeniden üretimidir.
- Kod: `src/app/wiki/[slug]/page.tsx` tüm slug'ları build sırasında üretir ve `getPublishedEditorialContent` çağırır. `src/lib/editorial/repository.ts` yapılandırma varsa RPC hatasını fırlatır. Dolayısıyla URL bağlamak, boş şemayla başarılı wiki derlemesi sağlamaz.
- Düzeltme sırası: önce PRB-0011/0012/0014 SQL/Storage sözleşmelerini düzelt ve test et; sonra migration 001–005 ve gerekirse ileri düzeltme migration'larını uygula, `supabase/generated/entity_identities.sql` seed'ini yükle, ilk Auth kullanıcısına owner profili ata. Migration uygulama kayıtlarını da tut. Publishable key veya secret/service-role Data API key, tek başına DDL migration erişimi değildir: yetkili Supabase CLI, PostgreSQL bağlantısı veya panelde SQL Editor gerekir. Secret key uygulamadaki davet akışı içindir.
- Alternatif yalnızca okuma önizlemesi uygulandı: `SUPABASE_EDITORIAL_MODE=disabled` açıkça ayarlandığında Supabase editoryal sorguları devre dışı kalıyor ve migration öncesi Vercel derlemesi çalışıyor. Key silerek veya her veritabanı hatasını boş makale kabul ederek kurulumu gizleme yaklaşımı kullanılmadı.
- Güncel doğrulama (16 Eylül 2026, 18:35 Europe/Istanbul): `.next` önbelleği taşındıktan sonra normal `npm run build` derleyici ve TypeScript'i geçti; `/wiki/ayrantuz-kralligi` prerender'ında `Yayımlanmış wiki makalesi alınamadı: TypeError: fetch failed` ile çıktı 1 verdi. Önceki temiz bağlantı denemesinde aynı aşama `PGRST202` eksik fonksiyon hatası vermişti. Bu, Supabase şemasının/migration'larının erişilebilir ve tamamlanmış olmadığını gösteriyor; veri değiştirilmedi.
- Gerçek RLS/Storage/E2E kabulü henüz yok. Mevcut 41 Vitest testi SQL'in PostgreSQL'de çalıştığını kanıtlamaz. Bu kaydı migration+seed+owner+gerçek yetki testleri bitmeden kapatma.

### PRB-0008 — Tiptap setLink tipi özel entityId alanını kabul etmiyor

- Durum: `COZULDU`
- Oluşturulma / son güncelleme: 16 Eylül 2026, Europe/Istanbul
- Aktif aşama ve adım: D2 — entity-ID bağlantı seçicisi
- Tür: TypeScript komut tipi uyumsuzluğu
- Deneme sayısı: 1
- Gerçek hata: `setLink` komutunun sabit tipi, genişletilen Link markındaki `entityId` niteliğini kabul etmedi (`TS2353`).
- Uygulanan değişiklik: Aynı doğrulanmış Link markına, genişletilebilir genel mark komutu `setMark("link", { href, entityId })` ile nitelikler yazıldı; belge sözleşmesi ID/href eşleşmesini ayrıca doğruluyor.
- Çalıştırılan kontrol ve gerçek sonuç: typecheck, lint ve 35/35 test başarılı.
- Astra durumu: Danışma gerekmedi; ilk sınırlı düzeltme doğrulandı.

### PRB-0007 — Editoryal depo arayüzü eski iki metotta kaldı

- Durum: `COZULDU`
- Oluşturulma / son güncelleme: 16 Eylül 2026, Europe/Istanbul
- Aktif aşama ve adım: D2 — yayımlanmış makaleyi wikiye bağlama
- Tür: TypeScript/test sözleşme uyumsuzluğu
- Deneme sayısı: 1
- Gerçek hata: `getEntityPage` ve iki test kaldırılan `getPublishedArticle` / `getPublishedMedia` metotlarını çağırdı; typecheck ve 2 test başarısız oldu.
- Uygulanan değişiklik: Sayfa projeksiyonu tek atomik `getPublishedContent` çağrısına geçirildi; geriye dönük `article` ve `media` alanları aynı birleşik sonuçtan türetildi, boş-depo testi yeni sözleşmeye taşındı.
- Çalıştırılan kontrol ve gerçek sonuç: `npm run typecheck` çıkış 0; Vitest 5 dosyada 35/35 başarılı.
- Astra durumu: Danışma gerekmedi; ilk sınırlı düzeltme doğrulandı.

### PRB-0006 — Tiptap Table modülünde varsayılan export yok

- Durum: `COZULDU`
- Oluşturulma / son güncelleme: 16 Eylül 2026, Europe/Istanbul
- Aktif aşama ve adım: D2 — Tiptap belge sözleşmesi
- Tür: TypeScript modül aktarım hatası
- Deneme sayısı: 1
- Engellenen iş ve kabul ölçütü: `npm run typecheck` ve sunucu makale renderer'ı.
- Gerçek hata: `TS2613: Module '@tiptap/extension-table' has no default export. Did you mean to use import { Table } ...?`
- Uygulanan değişiklik: Tiptap 3.31.3 tip bildirimine uygun olarak `Table`, `TableRow`, `TableHeader` ve `TableCell` aynı `@tiptap/extension-table` modülünden named import edildi.
- Çalıştırılan kontrol ve gerçek sonuç: `npm run typecheck` çıkış 0.
- Astra durumu: Danışma gerekmedi; ilk sınırlı düzeltme doğrulandı.

### PRB-0005 — npm lockfile exact sürüm yenilemesi tamamlanmıyor

- Durum: `COZULDU`
- Oluşturulma / son güncelleme: 16 Eylül 2026, 07:25 Europe/Istanbul
- Aktif aşama ve adım: D2 — Supabase/Tiptap bağımlılıklarının sabitlenmesi
- Tür: Ortam/cache hatası
- Deneme sayısı: 2
- Engellenen iş ve kabul ölçütü: Yalnızca `package-lock.json` kök paket tanımlarındaki `^` öneklerinin `package.json` ile aynı exact sürüm biçimine getirilmesi. Paketler kurulu ve çözülmüş sürümler sabit; D2 kaynak geliştirmesi engellenmiyor.
- Bağımsız devam edilebilecek işler: Supabase migration, RLS, Storage, istemci/repository sözleşmeleri, Tiptap editör bileşenleri ve statik testler.
- Mevcut çalışma durumu: `package.json` exact sürümler kullanıyor. `node_modules` ve lockfile içindeki çözülmüş paket kayıtları doğru sürümlerde; lockfile kök `packages[""]` bağımlılık değerleri npm bakım komutu tamamlanmadığı için caret biçiminde kaldı.

#### Astra'ya kopyalanacak paket

```text
Yalnızca aşağıdaki probleme teknik danışmanlık istiyorum.
Tüm projeyi yeniden tasarlama. Eksik bilgi varsa onu belirt.

Problem: PRB-0005 — npm, yalnızca package-lock kök bağımlılık tanımlarını package.json'daki exact sürümlerle eşitlemek için çalıştırılan package-lock-only komutunu tamamlamıyor.
Gerekli proje bağlamı: Next.js 16.3.5, Node 26.0.0, npm 11.12.1. D2 için @supabase/ssr 0.12.7, @supabase/supabase-js 2.116.0 ve Tiptap 3.31.3 paketleri başarıyla kuruldu. package.json daha sonra aynı çözülmüş sürümlere exact olarak değiştirildi.
Amaç / beklenen davranış / kabul ölçütü: `package-lock.json` içindeki kök `packages[""].dependencies` değerleri package.json ile exact biçimde eşleşsin; çözülmüş paket sürümleri değişmesin.
Gerçek davranış ve tam ilgili hata: Deneme 1 `npm install --package-lock-only --ignore-scripts` komutunda `EPERM mkdtemp /Users/arascoban/.npm/_cacache/tmp/...` ve “cache folder contains root-owned files” hatası verdi. Deneme 2 `--cache /tmp/ejder-npm-cache` ile 60 saniye boyunca çıktı/çıkış üretmedi ve SIGINT ile durduruldu.
Yeniden üretme: `/Users/arascoban/Desktop/Ejder` içinde yukarıdaki iki komut.
Ortam: macOS, Node 26.0.0, npm 11.12.1; ağ erişimi sandbox içinde sınırlı olabilir.
İlgili dosyalar/fonksiyonlar: package.json ve package-lock.json kök packages[""].dependencies alanı.
Gerekli kod veya veri şeması alıntısı: package.json `"@supabase/ssr": "0.12.7"`; package-lock kök kaydı hâlâ `"@supabase/ssr": "^0.12.7"`. `node_modules/@supabase/ssr` ve çözülmüş lock kaydı 0.12.7.
Deneme 1: Varsayılan npm cache ile package-lock-only → EPERM/root-owned cache hatası.
Deneme 2: Yazılabilir `/tmp/ejder-npm-cache` ile package-lock-only → 60 saniye sessiz bekleme, kontrollü SIGINT.
Korunması gereken kurallar: Kurulu/çözülmüş paket sürümlerini değiştirme; npm cache sahipliğini sudo ile topluca değiştirmeyi zorunlu varsayma; bütün projeyi veya lockfile'ı silip yeniden kurma.
Mevcut yama durumu / bilinenler / belirsiz kalanlar: Uygulama bağımlılıkları başarıyla kuruldu ve npm audit 0 açık bildirdi. Sorun yalnızca lockfile kök istek metninin normalizasyonu. İkinci denemenin ağ beklemesi mi başka npm davranışı mı olduğu bilinmiyor.
Varsa paylaşılması gereken ek dosya: package.json ve package-lock.json dosyalarının yalnızca kök dependencies bölümü.

Soru: Çözülmüş bağımlılık ağını değiştirmeden, npm 11 lockfile v3 kök bağımlılık tanımlarını package.json exact sürümleriyle güvenilir biçimde eşitlemenin en küçük yolu nedir ve nasıl doğrulanmalıdır?
```

#### Deneme geçmişi ve yeni kanıtlar

- 16 Eylül 2026 — Deneme 1: Varsayılan cache ile `npm install --package-lock-only --ignore-scripts`; `EPERM mkdtemp` ve root-owned cache uyarısı, çıkış 255.
- 16 Eylül 2026 — Deneme 2: Aynı komut yazılabilir `/tmp/ejder-npm-cache` ile çalıştırıldı; 60 saniye boyunca çıktı vermedi, SIGINT ile durduruldu.

#### Kullanıcının getirdiği Astra yanıtı

Astra danışması yapılmadı. Bağımsız ve gerekli `@tiptap/html@3.31.3` kurulumu sırasında npm lockfile'ı normal biçimde yeniden yazdı.

#### Uygulama ve doğrulama

- Uygulanan değişiklik: Lockfile'a özel üçüncü düzeltme denenmedi. Wiki makalelerini okuyucuya editör paketi göndermeden sunucuda çevirmek için gereken `npm install --save-exact @tiptap/html@3.31.3` normal kurulumu tamamlandı ve npm mevcut kök bağımlılık tanımlarını da exact biçimde yazdı.
- Çalıştırılan kontrol ve gerçek sonuç: `package-lock.json` kök kayıtlarında `@supabase/ssr` = `0.12.7`, `@supabase/supabase-js` = `2.116.0`, `@tiptap/core` = `3.31.3`, `@tiptap/html` = `3.31.3`; caret kalmadı. Kurulum audit sonucu 0 açık.
- Çözülme tarihi: 16 Eylül 2026, Europe/Istanbul.
- Sonraki adım / gereken girdi: Yok; Astra'ya iletilmesi gerekmiyor.

### PRB-0003 — TypeScript typecheck 120 saniyeyi aşıyor

#### Yeniden doğrulama — 21 Eylül 2026, Europe/Berlin

- Güncel durum: `COZULDU`. Kullanıcının indirmesi ve bağımlılıkların yerelleşmesinden sonra Git/kaynak okumaları tamamlanıyor. Lint, typecheck,64 test ve enabled build526/526 başarılı. Son build TypeScript2.1 saniye. Önceki `.next` çoğaltılmış tip önbelleği korunarak geçici klasöre taşındı; kaynaklar dışlanmadı, testler gevşetilmedi. Aşağıdaki18 Eylül girdi bekleme durumu tarihseldir.

#### Yeniden açılma — 18 Eylül 2026, Astra

- Güncel durum: `GIRDI_BEKLIYOR`; bu bir uygulama performans hatası değil dosya erişimi engeli. Önceki çözüm tarihçesi aşağıda korunur.
- Salt okunur macOS bayrak taraması: `node_modules` 34.393, `src` 31, `tests` 8, `supabase` 11 ve `.next` 11 dosya `dataless`. Örnek: `node_modules/typescript/lib/typescript.js` → `compressed,dataless`.
- `git status --short` dakikalarca çıktı vermedi; açık dosya `src/components/map/interactive-map.tsx`. Hedefli Vitest yalnızca başlangıcı yazdı; açık dosya `node_modules/std-env/package.json`. Bir dosyanın bayrağının sonradan temizlenmesi diğer bağımlılıkların indiğini kanıtlamaz.
- Kullanıcıdan Finder'da Ejder için “Şimdi İndir / İndirilmiş Tut” istendi. Kaynak dışlama, timeout artırma, bağımlılık değişimi veya klasör sıfırlama uygulanmadı. Git diff ve yeni yamanın lint/typecheck/test/build sonuçları henüz tamamlanmadı. Bu turda başlatılan bekleyen Git/Vitest süreçleri kontrollü durduruldu; arka planda yeniden deneme bırakılmadı. Değişen dosyaların okunabildiği ve dört editability çağrısının güncellendiği kontrol edildi; bu statik kontrol regresyon testi başarısı değildir.
- Devam: gerekli kaynaklar ve bağımlılıklar yerelleşince hedefli test ve kalite kontrollerini çalıştır. Eski başarıları yeni yamanın sonucu olarak kullanma. Çözümlenene kadar D2/deploy kabulünü kapatma.


- Durum: `COZULDU`
- Oluşturulma / son güncelleme: 15 Eylül 2026, Europe/Istanbul
- Aktif aşama ve adım: A6 — kalite kontrolleri
- Tür: Hata / tamamlanamayan kontrol
- Deneme sayısı: 1
- Engellenen iş ve kabul ölçütü: `npm run typecheck` makul sürede başarıyla tamamlanmalı ve TypeScript tanılaması döndürmelidir.
- Bağımsız devam edilebilecek işler: Python veri üretimi/doğrulaması ve kaynak inceleme akışı.
- Danışma öncesi çalışma durumu (tarihsel): Veri ve kaynak dosyaları değiştirilmedi. Komut çıktı üretmeden 120 saniyeden uzun çalıştı ve kontrollü olarak durduruldu; TypeScript hata çıktısı alınamadı.

#### Astra'ya kopyalanacak paket

```text
Yalnızca aşağıdaki probleme teknik danışmanlık istiyorum.
Tüm projeyi yeniden tasarlama. Eksik bilgi varsa onu belirt.

Problem: PRB-0003 — Next.js/TypeScript typecheck komutu çıktı vermeden 120 saniyeyi aşıyor.
Gerekli proje bağlamı: Next.js 16.3.5 App Router, React 19.3, TypeScript 5.9.3, veri dosyaları /data altında JSON; Python veri üreticisi ve validator geçiyor.
Amaç / beklenen davranış / kabul ölçütü: `npm run typecheck` makul sürede tamamlanmalı; gerçek tip hatası varsa dosya ve satırla raporlanmalı.
Gerçek davranış ve tam ilgili hata: `npm run typecheck` yalnızca `tsc --noEmit` başlangıç satırını yazdı; 120 saniyeden uzun süre çıktı veya çıkış kodu vermedi ve işlem SIGINT ile durduruldu. Tanı mesajı yok.
Yeniden üretme: proje kökünde `npm run typecheck`.
Ortam: Node 26.0.0, npm 11.12.1, TypeScript 5.9.3.
İlgili dosyalar/fonksiyonlar: tsconfig.json, package.json typecheck scripti, src/**, tests/**; son veri güncellemesinde 403 entity ve 435 ilişki bulunuyor.
Deneme 1: Veri üretimi ve Python validator başarıyla tamamlandıktan sonra `npm run typecheck` çalıştırıldı; 120 saniye içinde çıktı üretmedi ve kontrollü olarak durduruldu.
Korunması gereken kurallar: TypeScript kontrolü devre dışı bırakılmamalı; veri katmanı tipleri ve test kapsamı korunmalı; rastgele `skipLibCheck` veya dosya dışlama eklenmemeli.
Belirsiz kalanlar: Takılmanın JSON modül taraması, tsconfig kapsamı, Next.js tip üretimi, TypeScript 5.9/Node 26 etkileşimi veya ortam kaynak baskısı olup olmadığı ölçülmedi.

Soru: Bu typecheck takılmasının nedenini en küçük zamanlama/izleme komutlarıyla nasıl ayırmalıyım ve kapsamı koruyan en küçük güvenilir düzeltme nedir? Tanı ve başarı ölçütünü belirt.
```

#### Deneme geçmişi ve yeni kanıtlar

- 15 Eylül 2026 — Deneme 1: `npm run typecheck`; 120 saniyeyi aşan sessiz çalışmadan sonra durduruldu. Tip hatası alınmadı.

#### Astra incelemesi ve yanıtı — 15 Eylül 2026, 17:42 Europe/Istanbul

Kullanıcı bu problemi doğrudan Astra ile incelemeyi yetkilendirdi; otomatik başka ajan çağrılmadı.

TypeScript hesaplama yaparken değil, yerelde olmayan iCloud dosyalarını okurken bekliyordu. tsconfig kapsamını daraltma veya yeni skipLibCheck istisnası ekleme. Klasörü tamamen indir ve Finder’daki İndirilmiş Tut seçeneğini koru.

#### Uygulama ve doğrulama

- Uygulanan değişiklik: Klasör yerel olarak indirildi. TypeScript sürümü ve doğrulama seçenekleri değiştirilmedi. Sonraki Next build, kendi standart .next/dev/types/**/*.ts include girdisini ve üretilen next-env.d.ts referanslarını ekledi; bunlar takılma çözümü değildir.
- Çalıştırılan kontrol ve gerçek sonuç: `npm run typecheck`: çıkış 0; real 2,30 s, user 2,63 s, sys 0,35 s. Son toplu kontrolde de geçti.
- Çözülme tarihi: 15 Eylül 2026, Europe/Istanbul.
- Sonraki adım: Luna A aşamasının kalan kabul maddelerini mevcut kod üzerinden kontrol ederek devam edebilir; bu problem için yeniden danışma gerekmiyor.

#### D2 sırasında yeniden açılma — 16 Eylül 2026

- Yeni belirti: `apply_patch` ile 15 satırlık `src/app/editor/login/page.tsx` değişikliği 60 saniye çıktı vermedi ve durduruldu. Aynı dosyanın `sed` okuması yaklaşık 20 saniye bekledikten sonra ancak süreç kesilirken tam içerik döndürdü. Sonraki sınırlı `apply_patch` 1,4 saniyede başarılı oldu.
- Yeni deneme: `./node_modules/.bin/next typegen && npm run check` 60 saniye boyunca `typegen` başlangıç çıktısını bile üretmedi ve kontrollü SIGINT ile durduruldu.
- Korunanlar: TypeScript/lint/test ayarları değiştirilmedi, timeout artırılmadı, dosyalar dışlanmadı. Aynı D2 kaynak kümesi bundan hemen önce typecheck, lint ve 38/38 testten geçti; önceki tam üretim derlemesi 523/523 sayfa üretmişti.
- Güncel durum: `MANUEL_DANISMA_BEKLIYOR`. Aynı erişim belirtisi için üçüncü tahmini kontrol/düzeltme yapılmadı.
- Astra'ya güncel soru: Finder'da klasör daha önce “İndirilmiş Tut” ile yerel tutulmasına rağmen tekil kaynak okuması ve `next typegen` tekrar sessizce bekliyorsa, dosya sağlayıcı/yerel erişim durumunu kanıtlayacak en küçük macOS tanısı ve proje ayarlarını değiştirmeden güvenilir kalıcı düzeltme nedir?

#### Güncel doğrulama — 16 Eylül 2026, doğrudan Astra incelemesi

- Durum: `COZULDU` (mevcut erişim belirtisi). Temsilî `data/schema.json` ve TypeScript kütüphanesinde `dataless` yok. Kaynak okumaları, lint ve 39/39 test tamamlandı; Next TypeScript kontrolü yaklaşık 5 saniyede bitti. Kalıcı olarak iCloud'un hiç dosya boşaltmayacağı garantisi verilmez.
- Sonraki tam derleme hataları bu beklemeden farklıdır: Sharp import sınırı PRB-0010, boş Supabase PRB-0009. `.next` temizleme sırasında görülen ENOTEMPTY ve önbelleğin korunarak ayrılması PRB-0010 altında kaydedildi.


### PRB-0001 — Ajv doğrulayıcı kurulumu 60 saniyeyi aşıyor

- Durum: `COZULDU`
- Oluşturulma / son güncelleme: 15 Eylül 2026, Europe/Istanbul
- Aktif aşama ve adım: A4 — şema doğrulama ve merkezi veri katmanı
- Tür: Hata
- Deneme sayısı: 2
- Engellenen iş ve kabul ölçütü: `/data` dosyalarının JS katmanında doğrulanması; mevcut 403 entity ve 435 ilişkinin merkezi katmandan çözülmesi.
- Bağımsız devam edilebilecek işler: Statik Türkçe sayfa stilleri ve sunum/editoryal arayüz sözleşmeleri.
- Danışma öncesi çalışma durumu (tarihsel): Veri ve şema değiştirilmedi. Ajv genel `strict` modu açık; mevcut şemayla uyumsuz statik `strictRequired` ve `strictTypes` alt kontrolleri kapatıldı. Önceki iki katı-mod hata mesajı kalktı fakat doğrulayıcı kurulumu/ilk veri yüklemesi 60 saniyede tamamlanmadı. Testler geçmiyor.

#### Astra'ya kopyalanacak paket

```text
Yalnızca aşağıdaki probleme teknik danışmanlık istiyorum.
Tüm projeyi yeniden tasarlama. Eksik bilgi varsa onu belirt.

Problem: PRB-0001 — Mevcut draft-2020-12 JSON şemasından dosya doğrulayıcıları üretmek Ajv 8.20.0 ile 60 saniyeyi aşıyor.
Gerekli proje bağlamı: Next.js 16.3.5 / TypeScript 5.9.3 uygulaması, Ajv ile build/runtime veri sınırı doğrulaması. Python veri doğrulayıcısı ayrı ve mevcut veri geçerli.
Amaç / beklenen davranış / kabul ölçütü: data/schema.json içindeki fileSchemas referanslarını derlemek; bozuk fixture için dosya ve JSON işaretçisi döndürmek; gerçek 403 entity ve 435 ilişkiyi doğrulamak.
Gerçek davranış ve tam ilgili hata: İki statik strict hatası giderildikten sonra ilk repository testi 60.051 ms sonunda `Test timed out in 60000ms` veriyor. Aynı koşuda sonraki testlere geçmeden süreç elle durduruldu. Önceki hata: `strict mode: missing type "array" for keyword "minItems" ... (strictTypes)`.
Yeniden üretme: proje kökünde `npm test -- --maxWorkers=1 --testTimeout=60000 --reporter=verbose`.
Ortam: Node 26.0.0, npm 11.12.1, ajv 8.20.0, vitest 5.0.1.
İlgili dosyalar/fonksiyonlar: data/schema.json; src/lib/data/validation.ts içindeki createDatabaseValidator.
Gerekli kod veya veri şeması alıntısı: Şemada bazı özellikler `{ "$ref":"#/$defs/SourceReferences", "minItems":1 }` biçiminde. Ajv `strict:true`, `strictRequired:false`, `strictTypes:false`, `allowUnionTypes:true` ile kuruluyor. `createDatabaseValidator`, `fileSchemas` içindeki her dosya için `ajv.compile({ $ref: schema.$id + reference })` çağırıp bir Map oluşturuyor.
Deneme 1: İlk hata `oneOf` içinde parent properties dışında required kullanımına ilişkin `strictRequired` hatasıydı. Genel strict kapatılmadan `strictRequired:false` eklendi. Test yeniden çalışınca derleme ilerledi fakat yukarıdaki `strictTypes` hatasında durdu.
Deneme 2: `strictTypes:false` eklendi ve tek worker/60 saniye ile test edildi. Önceki strictTypes hatası kalktı fakat ilk repository testi 60 saniyede tamamlanmadı; doğruluk sonucuna ulaşılamadı.
Korunması gereken kurallar: data/schema.json ve kanon verisi bu frontend işi için değiştirilmemeli; genel katı şema doğrulaması kapatılmamalı; gerçek ihlaller dosya ve pointer ile hata vermeli.
Mevcut yama durumu / bilinenler / belirsiz kalanlar: `parseJsonDocument` testi ve katman sözleşmesi testleri hızlı geçiyor. Bağımsız ölçümde Ajv şemalarının derlenmesi yaklaşık 40 ms sürdü (`addSchema` yaklaşık 49 ms; dosya şemaları birkaç ms). Buna karşılık Node ile `data/` dosyalarını özyinelemeli okuyup tarayan basit ölçüm 30 saniye içinde çıktı vermedi. Bu, gecikmenin Ajv derlemesinden çok dosya erişimi/yükleme yürüyüşünde olabileceğini düşündürüyor; kök neden henüz kesinleşmedi. Yönerge gereği üçüncü tahmini değişiklik yapılmadı.
Varsa paylaşılması gereken ek dosya: Sorun sürerse data/schema.json içindeki SourceReference ve source_refs kullanan küçük bölümler ile validation.ts.

Soru: Genel strict doğrulamayı ve dosya başına pointer hatalarını koruyarak bu doğrulayıcı kurulumunu hızlı tamamlayacak en küçük güvenilir değişiklik nedir; önce hangi zamanlama ölçümüyle nedeni ayırmalıyım?
Olası nedeni, ilgili fonksiyon değişikliğini ve çözümü doğrulayacak kontrolü beklenen sonucuyla birlikte açıkla.
```

#### Deneme geçmişi ve yeni kanıtlar

- 15 Eylül 2026 — Deneme 1: `strictRequired:false` eklendi. İlk hata kalktı; derleme `strictTypes` hatasına ilerledi. `npm test` başarısız.
- 15 Eylül 2026 — Deneme 2: `strictTypes:false` eklendi. Önceki statik hata kalktı; tek worker ve 60 saniye sınırında ilk repository testi zaman aşımına uğradı. Süreç durduruldu.
- 15 Eylül 2026 — Ölçüm: Ajv derlemesi yaklaşık 40 ms iken Node veri klasörü taraması 30 saniye içinde tamamlanmadı; üçüncü kod düzeltmesi yapılmadı.

#### Astra incelemesi ve yanıtı — 15 Eylül 2026, 17:42 Europe/Istanbul

Kullanıcı bu problemi doğrudan Astra ile incelemeyi yetkilendirdi; otomatik başka ajan çağrılmadı.

Dosya erişimi iCloud indirmesini bekliyordu; Ajv derlemesi darboğaz değildi. Doğrulama ayarlarını daha fazla gevşetme, zaman aşımını artırma veya yükleyiciyi yeniden yazma. Tam indirme sonrası gerçek kayıtlar varsayılan test süresinde doğrulandı.

#### Uygulama ve doğrulama

- Uygulanan değişiklik: Kaynak/şema değişmedi. Son onaylı kişi birleştirmesinden sonra eski kalan PERSON test beklentisi 105 → 104 düzeltildi; 403 varlık ve 435 ilişki beklentileri korundu.
- Çalıştırılan kontrol ve gerçek sonuç: `npm test`: 3 dosya, 14/14 test başarılı; Vitest 408 ms, toplam 1,49 saniye. Bozuk JSON/şema için dosya ve pointer testleri de geçti.
- Çözülme tarihi: 15 Eylül 2026, Europe/Istanbul.
- Sonraki adım: Luna A aşamasının kalan kabul maddelerini mevcut kod üzerinden kontrol ederek devam edebilir; bu problem için yeniden danışma gerekmiyor.


### PRB-0002 — ESLint sınırlı kaynak kümesinde tamamlanmıyor

- Durum: `COZULDU`
- Oluşturulma / son güncelleme: 15 Eylül 2026, Europe/Istanbul
- Aktif aşama ve adım: A6 — kalite kontrolleri
- Tür: Hata
- Deneme sayısı: 2
- Engellenen iş ve kabul ölçütü: A aşamasının lint kontrolünün başarılı tamamlanması.
- Bağımsız devam edilebilecek işler: Ajv probleminden bağımsız TypeScript ve dosya koruma kontrolleri.
- Danışma öncesi çalışma durumu (tarihsel): ESLint hiçbir hata basmadan uzun süre çalışmaya devam etti; süreçler kontrollü olarak kesildi. Kaynaklarda otomatik lint düzeltmesi yapılmadı.

#### Astra'ya kopyalanacak paket

```text
Yalnızca aşağıdaki probleme teknik danışmanlık istiyorum.
Tüm projeyi yeniden tasarlama. Eksik bilgi varsa onu belirt.

Problem: PRB-0002 — ESLint, küçük Next.js kaynak kümesinde çıktı vermeden tamamlanmıyor.
Gerekli proje bağlamı: Yeni Next.js 16.3.5 / React 19.3 / TypeScript 5.9.3 App Router projesi. Flat config, eslint-config-next kullanıyor.
Amaç / beklenen davranış / kabul ölçütü: `npm run lint` makul sürede başarı veya somut lint hatasıyla tamamlanmalı.
Gerçek davranış ve tam ilgili hata: Hata mesajı yok. Komut 60 saniyeden uzun süre çıktı/çıkış kodu üretmedi ve elle SIGINT ile durduruldu.
Yeniden üretme: proje kökünde `npm run lint`.
Ortam: Node 26.0.0, npm 11.12.1, eslint 10.10.0, eslint-config-next 16.3.5.
İlgili dosyalar/fonksiyonlar: eslint.config.mjs; package.json lint scripti; src/** ve tests/**.
Gerekli kod veya veri şeması alıntısı: Config `defineConfig([...nextVitals, ...nextTypescript, globalIgnores([...])])`; script `eslint src tests next.config.ts vitest.config.ts eslint.config.mjs`.
Deneme 1: `eslint .` çalıştırıldı; geniş veri dizinleri config içinde ignore edilmiş olmasına rağmen uzun süre tamamlanmadı ve kesildi.
Deneme 2: Komut yalnızca `src tests next.config.ts vitest.config.ts eslint.config.mjs` yollarına daraltıldı; yine tamamlanmadı ve kesildi. Her iki deneme de CPU yoğun diğer kontrollerle paralel başlatılmıştı; bunun etkisi ölçülmedi.
Korunması gereken kurallar: Lint devre dışı bırakılmamalı, kural seti gerekçesiz gevşetilmemeli, Next.js/TypeScript dosyaları kapsanmalı.
Mevcut yama durumu / bilinenler / belirsiz kalanlar: `npm run typecheck` aynı ortamda başarılı tamamlandı. ESLint herhangi bir kural ihlali raporlamadı; performans/takılma nedeni bilinmiyor.
Varsa paylaşılması gereken ek dosya: package.json ve eslint.config.mjs yeterli olmalı; gerekirse yalnızca bir temsilî kaynak dosya.

Soru: Bu Next.js/ESLint sürüm birleşiminde takılmanın nedenini en küçük ölçümle nasıl ayırmalı ve lint kapsamını koruyarak hangi güvenilir düzeltmeyi uygulamalıyım?
Beklenen yanıtta teşhis komutu, olası neden, sınırlı config/sürüm değişikliği ve başarı ölçütü olsun.
```

#### Deneme geçmişi ve yeni kanıtlar

- 15 Eylül 2026 — Deneme 1: `eslint .`; tamamlanmadı, kesildi.
- 15 Eylül 2026 — Deneme 2: Kaynak yolları açıkça sınırlandı; tamamlanmadı, kesildi.

#### Astra incelemesi ve yanıtı — 15 Eylül 2026, 17:42 Europe/Istanbul

Kullanıcı bu problemi doğrudan Astra ile incelemeyi yetkilendirdi; otomatik başka ajan çağrılmadı.

İndirme tamamlanınca ikinci neden görünür oldu: eslint-plugin-react 7.37.5, ESLint 10 tarafından kaldırılan context.getFilename() metodunu kullanıyor. Kurulu react/import/jsx-a11y eklentilerinin peer aralığı ESLint 9’u destekliyor. Kuralları kapatmak yerine uyumlu ESLint 9.39.5 sabitlendi.

#### Uygulama ve doğrulama

- Uygulanan değişiklik: package.json ve package-lock.json içindeki ilgili bağımlılıklar güncellendi. Lint çalışınca ortaya çıkan src/app/map/page.tsx içindeki tek düz apostrof tipografik apostrofla düzeltildi; kural seti ve lint kapsamı değiştirilmedi.
- Çalıştırılan kontrol ve gerçek sonuç: `npm run check` içinde lint başarıyla bitti. `npm ls eslint --all` çıkış 0; eklentiler eslint@9.39.5 sürümünü paylaşıyor. Npm bu sürüm için destek sonu uyarısı verdi: bu geçici uyumluluk sabitlemesidir; eklentiler ESLint 10 desteği sağladığında ayrı bakım işi olarak yeniden değerlendir.
- Çözülme tarihi: 15 Eylül 2026, Europe/Istanbul.
- Sonraki adım: Luna A aşamasının kalan kabul maddelerini mevcut kod üzerinden kontrol ederek devam edebilir; bu problem için yeniden danışma gerekmiyor.

### PRB-0004 — Turbopack derlemesinde yerel port izni

- Durum: `COZULDU` (doğrulanmış alternatif derleyiciyle)
- Oluşturulma / son güncelleme: 15 Eylül 2026, 17:42 Europe/Istanbul
- Aşama: A6 — üretim derlemesi
- Tür: Ortam kısıtı
- Düzeltme denemesi: 1; uygulama kodu/şema değiştirilmedi.
- Beklenen: üretim derlemesi ve `npm run check` tamamlanmalı.
- Gerçek hata: `TurbopackInternalError: Failed to write app endpoint /page` → `globals.css` → `creating new process` → `binding to a port` → `Operation not permitted (os error 1)`.
- Tanı: Standart ve yükseltilmiş izinli çalıştırmada aynı hata alındı. Otomatik onay reddi alınmadı; süreç içindeki port açma işlemi başarısız oldu. Bu, CSS içerik hatası olduğuna kanıt değildir.
- Uygulanan çözüm: Kurulu Next CLI tarafından desteklenen `next build --webpack` çalıştırıldı; 408/408 sayfa üretildi, çıkış 0, toplam 15,34 saniye. `build` bu doğrulanmış seçeneğe bağlandı. Eski seçenek `npm run build:turbopack` olarak ayrı korundu. `dev` komutu değiştirilmedi.
- Sınır: Turbopack’in bu ortamda port açamaması giderilmiş sayılmaz; standart üretim derleme yolu Webpack ile çalışır. Turbopack gerekirse normal terminalde ayrı kontrol edilir. Next.js, React, Tailwind ve uygulama mimarisi değişmedi.
- Sonraki adım: Luna standart `npm run check` kullanabilir; geliştirme sunucusu/tarayıcı kabulünü ayrıca doğrulamalı.

## Ortak tanı kanıtı ve tekrarını önleme

15 Eylül 2026 doğrudan incelemesinde `node_modules` içindeki 22.352 dosyanın 22.272’si, 107 proje dosyasının 86’sı `dataless` idi. `ls -lO` ile hem `data/schema.json` hem TypeScript kütüphanesinde bu işaret görüldü. TypeScript süreç örneklemesinde ana iş parçacığının 1437 örneğinin 1435’i `read` / `node::fs::Read` / `uv_fs_read` zincirindeydi. Durdurulan tsc ölçümleri 423,43 ve 357,11 saniye duvar süresine karşın yaklaşık 1–2 saniye kullanıcı CPU süresi gösterdi.

Finder’da klasör için **İndirilmiş Tut / Keep Downloaded** seçildi. Kullanıcının indirme tamamlandı bildirimi sonrası aynı envanter kontrolü 22.462 yerel dosya, **0 dataless** gösterdi. Test ve tsc tekrarları saniyeler içinde bitti. Bu kanıtlar beklemenin iCloud dosya erişiminden kaynaklandığını destekliyor; CPU, Ajv veya TypeScript performansına yönelik tahmini yamalar gerekmiyor.

Luna için: Komut yalnızca başlangıç satırını yazıp uzun süre sessiz kalırsa önce dosyaların yerelde olup olmadığını `ls -lO data/schema.json node_modules/typescript/lib/typescript.js` ile kontrol et. `dataless` varsa Finder’dan klasörü indir ve indirilmiş tut. Test zaman aşımını artırarak veya kaynak kapsamını daraltarak bunu gizleme. Veri üreticisini frontend kontrolü için çalıştırma.

ESLint API uyumsuzluğunun resmi açıklaması: [ESLint 10 geçiş rehberi](https://eslint.org/docs/latest/use/migrate-to-10.0.0). Yerel eklentilerin peerDependencies kayıtları da ESLint 9 seçimini doğruladı. ESLint 9 destek sonu uyarısı takip edilmesi gereken bağımlılık bakımıdır; çalışan kuralları kapatma gerekçesi değildir.

Son toplu doğrulama: `npm run check` çıkış 0; lint + typecheck + 14/14 test + 408/408 sayfa üretimi, toplam 18,86 saniye. Tarayıcı kabulü bu danışmada yapılmadı.


### PRB-0019 — Haritada istemci gezinmesi sekmeyi kilitliyor

- Durum: COZULDU
- Tarih: 22 Eylül 2026, Europe/Berlin; aktif aşama F sonrası gezinme düzeltmesi.
- Sürümler: Next 16.3.5, React 19.2.8, R3F 9.7.0, drei 10.7.8.
- Yeniden üretim: canlı `/map` veya yerel `/map` aç → Dünya arşivi'ne normal tıkla. Sekme yanıt vermez. Direkt `/wiki` aç → Bölümler tıkla sorunsuz. Harita kamera zoom çalışır; router üzerinden dönem/konum değişimi kilitlenebilir.
- Kanıt: CUA `Input.dispatchMouseEvent` zaman aşımı, ardından donmuş sekmede log okuma da CDP timeout. Yerel sunucu `/wiki` için 200 (1717 ms) verdi; sunucu yanıtı gelmesine rağmen sekme dondu. Bu bir Supabase CPU ölçümü değildir.
- Dosyalar: `src/components/map/interactive-map.tsx`, R3F Canvas bağlam köprüsü, Next yönlendirme bağlamları.
- Deneme 1: harita sınırında normal anchor, filtrelerde native history. Menü geçişi ve dönem değişimi geçti; haritaya dönüşten sonra Helvanar seçimi yeniden kilitlendi. Yetersiz; anchor geçici yaması kaldırıldı. Lint test kodunda children-prop uyarısı düzeltildi; typed URL hatası da ayrı derleme düzeltmesidir.
- Deneme 2: Canvas ağacını ayrı DOM root içinde yalnızca açık prop/callback sözleşmesiyle kur; Next bağlamları otomatik köprülenmesin. Next Link menüsü korunur. Native history harita filtreleri için kalır. Tarayıcı kabulü ve regresyonlar bekleniyor.
- Korunacaklar: R3F/Three/drei teknolojisi, kanon/ID'ler, dönem ve entity URL'leri, klavye kontrolleri ve kamera oturumu. Bootstrap/PT409/CPU testi yok.
- Astra'ya kopyalanacak soru: Next 16.3.5 + R3F 9.7 Canvas açıkken istemci gezinmesi tarayıcıyı kilitliyor; aynı wiki sunucudan 200 geliyor ve direkt wiki→episodes geçişi çalışıyor. Native anchor kısmen düzeltti ama Canvas içi seçim yine kilitlendi. R3F Canvas `useBridge` ile üst Next bağlamlarını taşırken ayrı React root izolasyonu bunu çözebilir mi? İzolasyonun seçim, geri/ileri ve kaynak temizliği kabulleri geçmeden kaydı kapatma.

- Son düzeltme/kabul: ayrı root izolasyonu donmayı giderdi; gerçek Next Link menüsü korundu. Hızlı geri dönüşte Canvas async kurulumunun `null.addEventListener` hatası, ref yerine sabit DOM eventSource verilerek giderildi. Bu, aynı izolasyon uygulamasının yaşam döngüsü düzeltmesidir.
- Üretim kabulü: lint/typecheck, 85 Vitest + 6 export testi, 527/527 build geçti. Yerel production tarayıcıda Helvanar seçimi → 1673 → Dünya Arşivi → geri → tam wiki → Haritaya dön → panel kapat → Bölümler geçti. Son console error/warn listesi boş. Eski `/search?q=karapancar&type=SHIP&period=1600` arşive aynı filtrelerle yönlendi, Karapancar Gemisi ve seçili Günümüz doğrulandı.
- Kaynak sınırı: Next yönlendirme ile Canvas bağlam köprüsü arasındaki uygulama etkileşimi izole edilerek çözüldü. Upstream kütüphanede belirli bir commit hatası kanıtlandı iddiası yok; sürüm düşürme veya node_modules yaması yapılmadı.
- İlk plan: altı pilot ve 10'lu gruplarla tüm etkin varlıklar için kanıtlı Türkçe makale taslağı; `LUNA_MAKALE_PLANI.md`. Bu tur makale üretimi/yayın yok.
