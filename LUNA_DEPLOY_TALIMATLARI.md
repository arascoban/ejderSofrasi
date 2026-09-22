# Astra → Luna: ilk kurulum ve yayın

## En güncel Astra devri — 22 Eylül 2026, gezinme ve makale ara aşaması

Bu bölüm aşağıdaki tarihsel G'ye-geç yönergelerinden önceliklidir. Son kullanıcı isteği menü donmasını düzeltmek, aramayı Dünya Arşivi'nde birleştirmek ve tüm varlıklar için makale planı hazırlamaktır.

- Canlı kabul: `9927973` Vercel dağıtımı success; normal menü tıklaması, konum seçimi, geri dönüş ve dönem değişimi canlıda geçti; console hata/uyarı yok. Lint/typecheck, 85+6 test ve 527/527 build başarılı.
- PRB-0019: R3F Canvas, `IsolatedScene` içinde Next yönlendirme bağlamından ayrılır. Sahne verileri/callback'leri açık prop olarak geçer. Bu sınırın içine `useRouter/useSearchParams/Link` ekleme; sayfa linkleri dıştaki DOM ağacında kalır. Menüde normal Next Link gezinmesi korunur; tam sayfa anchor geçici denemesi kaldırıldı.
- Harita seçim/dönem URL'si native history ile değişir; sunucuya gereksiz RSC isteği yapılmaz. Geri/ileri, konum seçimi, dönem ve harita→wiki→harita kabulü yeni harita değişikliğinde tekrarlanır. Canvas `eventSource` gerçek DOM elemanıdır; gecikmeli yapılandırma sırasında null olabilen ref ile değiştirme.
- Ayrı Ara menüsü/sayfası yok. `/wiki` sorgu, tür ve dönem filtrelerinin tek yüzeyi. Eski `/search` URL'leri query/filter kaybetmeden yönlenir. Sorgusuz arşiv Supabase'i beklemez; isteğe bağlı yayımlanmış makale araması ortak üç saniyelik süre sınırına sahiptir.
- Ara iş **M: kaynaklara dayalı varlık makaleleri** başladı. M1 kanıt paketleri `editorial_work/evidence/` altında ve `editorial_work/coverage.json` ile 403 etkin ID'yi kapsıyor; `npm run editorial:evidence -- --check` deterministik çıktıyı doğrular. Henüz makale taslağı veya yayın yok. Sonraki iş M2 altı pilotu manuel kaynak incelemesiyle hazırlamak; pilot kabulü olmadan toplu taslak/yayın üretme. M, G/H/I'nin yerine geçmez.
- Kanon/ID'lere, eski migration'lara ve D2 kabulüne dokunma. CPU PRB-0017 ertelenmiş, davet işletim kabulü PRB-0018 I kapsamındadır.


## Güncel Astra yönergesi — 22 Eylül 2026

**D2 tamamlandı; E1–E3 ve F canlıda tamamlandı, sıradaki özellik G.** `D2_KABUL_RAPORU.md` kabul matrisi bu dosyanın daha eski açık-test talimatlarının önündedir. PRB-0013/0014 çözüldü. CPU konusu PRB-0017 kullanıcı isteğiyle ertelendi; yeniden ölçüm veya yük testi başlatma. PT409 migration ve bootstrap'ı canlıda tekrar çalıştırma. Owner/secret onayını yeniden isteme.

**Dönem etiketi kararı:** Ziyaretçi arayüzünde eski dönem adları kullanılmayacak. `1600 civarı` kaynak anahtarı **Günümüz**, `1300 civarı` kaynak anahtarı **Gümüş Tanrısının 1673 yılı** olarak gösterilir. Bu anahtarlar mevcut veri, makale ve eski URL uyumluluğu için saklanır; F dönem geçişi yeni Türkçe etiketlerle kabul edilir.

**F durumu:** F'nin dönem durumu, seçili dönem wiki/harita bağlamı, emekli kimlik çözümlemesi, eksik sanat bildirimi, dönemsiz içerik ayrımı ve dönemler arası kamera/sahne izolasyonu yerelde uygulandı ve kabul edildi. Sıradaki yayın adımı yeni commit için Vercel Production dağıtımı ve HTTPS smoke kontrolüdür. CPU PRB-0017 ertelenmiş olarak kalır.

**M1 kabulü — 22 Eylül 2026:** `scripts/build_editorial_evidence.mjs`, kaynak kanıtlarını kanon verisinden ayrı bir hazırlık alanına çıkarır. 403 etkin varlığın tamamında kimlik, olgu/assertion, yönlü ilişkiler, ilgili olay/seyahat/lore/bölüm kayıtları, harita kısıtları, world state, çatışmalar ve eşleşen normalizasyon/owner kararları bulunur. 316 paket yeterli anlatı, 76 paket kısa madde, 11 paket kaynak incelemesi gerektiren açık çatışma olarak işaretlendi. M2 pilotları tamamlanmadan bu paketler makale veya yayın sayılmaz.

1. AGENTS.md, güncel durum ve kabul raporunu oku; mevcut staged/unstaged değişiklikleri koru. Kanonu/ID'leri frontend için değiştirme. Yeni bir hata yoksa D2 test içeriğini yeniden yaratma; canlı NPC-0006 temiz V17, geçmiş revizyonlar/özel dosyalar korunuyor.
2. `81e63d0` için GitHub push, Vercel Production success ve `https://ejder-map.vercel.app` HTTPS smoke tamamlandı. Yeni değişikliklerde doğru commit için Vercel success ve HTTPS smoke doğrula. İşletim erişimi engeli varsa PRB kaydına bağlamı ekle; yerel D2 kabulünü başarısız sayma ve deploy olmuş gibi raporlama.
3. **E1:** Merkezi depodan Türkçe/ASCII arama eşleştirmesini genişlet: kanonik ad, alias, sabit/eski ID ve eski slug. Aynı alias birden fazla kimliğe aitse tüm sonuçları koru. Akmer, Pastırman, Helvanar, Çöl Şehri/col sehri, Karapancar kabul örnekleridir. Sonuçlar mevcut canonical route çözümleyicisini kullansın.
4. **E2:** Klavyeyle kullanılabilen Türkçe global arama ve sonuç ekranını ekle; tür/dönem filtreleri URL'de tutulmalı ve geri/ileri gezinmede dönmeli. Bilinmeyen dönemi iki döneme atama. Koordinatsız kaydı wiki'ye götür; harita için sahte koordinat üretme.
5. **E3:** Yalnızca etkin yayımlanmış editoryal metni ara. İlk kapsam küçük indeks/ölçülü sunucu isteği; her tuşta Supabase sorgusu ve ücretli harici arama servisi yok. Taslak, eski revizyon veya özel dosya adresi istemci indeksine girmesin. Publish/rollback sonrası eski metnin sonuçtan kalkması kabul şartıdır. Migration gerekirse yeni ileri migration hazırla; uygulanmış dosyaları değiştirme.
6. Her adımı dar diff, anlamlı test ve tarayıcı kabulüyle doğrula. Next API değişikliği yapmadan ilgili yerel `node_modules/next/dist/docs/` belgesini oku. E sonunda lint/typecheck/test/build ve klavye/mobil/URL/arama güncelliği sonuçlarını yaz. E tamamlanmadan F/G/H/I'yi topluca uygulama.
7. Çözülemeyen yeni işleri mevcut manuel Astra protokolüyle `ASTRA_SORUN_KAYITLARI.md` içine kaydet. Alt ajan/model değişikliği yapma. D2'de yapılmayan canlı ağ emülasyonu/ayrı publish HTTP gözlemini yapılmış diye aktarma; bunlar kabul raporundaki katmanlı doğrulamayla karşılanmıştır.

### E uygulama kaydı — 22 Eylül 2026, Astra

E1–E3 kodu uygulandı ve canlıda kabul edildi. `src/lib/domain/search.ts` tek normalizasyon/filtre katmanıdır; `/wiki` ve yeni Türkçe `/search` aynı kayıt deposunu kullanır. Kanonik ad, alias, slug ve mevcut ID yönlendirmelerinden gelen eski ID'ler aranır; editoryal metin yalnızca public `wiki_articles` içindeki güncel `published_revision_id` üzerinden, draft ve tarihçe dışarıda bırakılarak okunur. Arama formu klavye ile çalışır; `q`, `type` ve `period` URL parametreleri geri/ileri gezinmede korunur. `npm run lint`, `npm run typecheck`, `npm run test` (78 Vitest + 6 export testi) ve `npm run build` (527/527) başarılıdır. Yerel `/search?q=col%20sehri`, eski `NPC-0059` ve tür/dönem filtreleri gerçek HTML ile kontrol edildi. `cb6bb4b` commit'i GitHub main'e gönderildi, Vercel Production success oldu; canlı `/search?q=col%20sehri`, `/search?q=NPC-0059` ve `karapancar` gemi+dönem filtresi HTTP 200 ve beklenen sonuçları verdi. E kabulü kapandı; F'ye geçilebilir.

### F uygulama kaydı — 22 Eylül 2026, Luna

F'nin ilk uygulaması tamamlandı. `getEntityEraState` emekli kimlik yönlendirmelerini de çözerek `ISL-0002 → CON-0001` durumunu koruyor. Harita kara şekilleri artık seçilebilir dönem önizlemesine, dönem durumu kanıtına ve onaylı sanat yoksa açık bir eksik sanat bildirimine sahip; kamera oturumu `map_id + dönem` ile ayrılıyor ve dönem değişiminde Canvas anahtarı sahne katmanını yeniliyor. Wiki URL'deki `era` seçimi dönem bağlamını, diğer dönem kayıtlarını ve dönemsiz makale/görsellerin otomatik aktarılmadığı uyarısını gösteriyor. `map_assets.json` şu anda boş olduğu için iki dönem de `unavailable` olarak dürüstçe sunuluyor; yaratıcı final koordinat veya sanat uydurulmadı.

Yerel kabul kanıtı: `npm run lint`, `npm run typecheck`, `npm run test` (81 Vitest + 6 export testi), `npm run build` (527/527) başarılı. Yerel tarayıcıda iki dönem haritası, Helvanar'ın Günümüz'de kayıp bildirimi, Gümüş Tanrısının 1673 yılında kanıtlı görünümü, wiki seçili dönem paneli ve hızlı geçişte katman tutarlılığı doğrulandı. `e8e473b` GitHub main'e gönderildi; GitHub Vercel status'u “Deployment has completed / success” verdi ve cache-bust HTTPS smoke'ta F başlığı, eksik sanat bildirimi ve Helvanar kayıp paneli görüldü. Yeni sorun çıkarsa yalnızca ilgili PRB kaydı açılacak; CPU PRB-0017 yeniden başlatılmayacak.

Davet/SMTP işletim kabulü I aşamasında PRB-0018 altında açık; E'yi engellemez. Yeni editör daveti göndermeden önce mutlak site adresi ve callback izin listesini doğrula.

## Tarihsel yönergeler — aşağıdakiler yeniden yapılacak liste değildir


## Güncel Astra devri — 21 Eylül 2026, Europe/Berlin

Bu bölüm güncel yürütme sırasıdır. Alttaki 16 Eylül notları tarihsel başvurudur. Mevcut staged/unstaged değişiklikleri koru, projeyi yeniden kurma, başka ajan çağırma. D2 bu turda açık tutuldu; tam deploy ve E başlangıcı kabul kanıtı tamamlanmadı.

### En son kullanıcı bildirimi — CPU ve sonraki iş

**Ekran görüntüleriyle güncel doğrulama:** Altı RPC'nin tamamında `old_retry_code=false`, `http_conflict_code=true`; SQL düzeltmesinin uygulanması artık kullanıcı sonuç görüntüsüyle de doğrulandı. Bunu tekrar isteme. Kullanıcı 03:00–06:00 arasında yaklaşık %100 CPU dalgası, son 15 dakikada ise olağan seviyeyi gözledi. Tek stale save hızlı PT409 ile sonuçlandı; stale publish sekmesi sunucu isteği öncesi guard'a geçti. Uzun dönem CPU nedeni ve gerçek publish HTTP409 hâlâ ayrı kabul. Bellek kartı406,51 MB, commitment1,24 GB; swap alanı mevcut ve commitment kesikli sınıra yakın/yer yer üzerinde görünüyor. Tam kapasite ve tooltip değerleri yok; bu görüntüden fiziksel RAM doluluk yüzdesi veya bellek sızıntısı sonucu çıkarma.

Luna'nın ilk kaynak kontrolü artık RAM/swap ve bağlantı sayısıdır: `supabase/diagnostics/editorial_memory_state.sql` yalnızca bağlantı gruplarını ve mevcut ayarları okur; RAM ölçmez, bağlantı sonlandırmaz. Son15 dakikada CPU/bellek/commitment ve Disk I/O/yanıt süresini birlikte değerlendir. Sabit swap miktarı aktif swap trafiği kanıtı değildir. Eski süreç PID sonucu paylaşılmadı; CPU düştü diye kalan backend'leri varsayarak terminate/restart yapma. Commitment sürekli sınırda/üstündeyse veya timeout/OOM varsa ağır canlı kabulü beklet; bağlantı ve sorgu kanıtı topla. Düşük CPU, istikrarlı bellek, normal yanıt ve hata yokluğu teyit edilirse küçük ardışık D2 kabullerine devam et. Cache boşaltma, swap kapatma, work_mem/max_connections ayarını tahminle değiştirme veya plan yükseltme yok.

Kullanıcı `202609210001_editorial_conflict_sqlstate.sql` dosyasını çalıştırdığını onayladı. Tekrar çalıştırmasını isteme. Kullanıcının açık talimatıyla PRB-0017 CPU teşhisi, Query Performance incelemesi ve tekrarlayan canlı çakışma/yük testleri rafa kaldırıldı. Bu nedenle CPU sonucu D2'yi kapatmak için kullanılmadı. Öncelik, tek kontrollü PRB-0013/0014 kabul kanıtını belgelemek ve D2'nin kalan medya/plan maddelerini tamamlamaktır.

1. Kullanıcının CPU yüzdesi/zaman aralığı artık kaydedildi: yaklaşık %100, 03:00–06:00; son 15 dakika olağan. `supabase/diagnostics/editorial_conflict_state.sql` iki sonuç kümesi hâlâ görünür değilse bunu eksik kanıt olarak kaydet; tekrar tekrar isteme. Bu salt-okuma dosyası altı RPC kodunu ve eski aktif RPC oturumlarını gösterir; CPU yüzdesini ölçmez. Anahtar/owner/bootstrap adımlarını tekrar isteme. Yönetim erişimi yoksa Data API secret ile SQL çalıştırmaya veya yeni SQL RPC açmaya çalışma.
2. Altı fonksiyonda PT409 doğrulanmalı. Eski40001 döngüsünü Logs Explorer process_id ve aktif backend PID eşleşmesiyle kanıtla. Yalnızca doğrulanmış eski test backend'i sonlandırılabilir; izin gerekiyorsa somut PID ve etkiyi göster. Tüm bağlantıları kapatma. Kullanıcının panelden proje restart'ı, ancak hedefli çözüm mümkün değilse ve kısa erişim kesintisi kabul edilmişse alternatif; otomatik uygulama.
3. Eski işlemler temizlendikten sonra test sekmeleri kapalıyken 10–15 dakikalık düşük trafik ölçümünü kaydet. Bu bir planlama gözlem penceresidir, ölçülmüş sonuç değildir; otomatik tekrar sorgulama/heartbeat kurma. CPU grafiği, aktif bağlantı sayısı, tekrarlayan40001 ve503/504 oranını karşılaştır. Sorun sürerse Query Performance ile en çok toplam süre tüketen sorguları incele; kanıtsız index, compute yükseltme veya servis değişimi yapma.
4. CPU testi rafa kaldırılmış olsa da D2 kabulünde tek kontrollü istek sınırını koru. Test başına bir stale istek; yanıt gelmezse seri tekrar yok. Gerekli doğrulamalardan sonra test içeriğini temizle. D2 kapanışı için teknik test sayısı tek başına yeterli değil.

**Ücretsiz planı koruma yaklaşımı:** Kanon/harita/bölüm verisini mevcut JSON okuma katmanında tut. Aramada her tuşa Supabase sorgusu gönderme; önce küçük yerel indeks, gerekiyorsa bekletilmiş ve sınırlı sorgu. Editör autosave yalnızca değişiklikte ve mevcut kuyrukla çalışmalı;409 otomatik tekrar edilmez. SQL ve race testlerini yerelde yap, canlıda yalnızca sınırlı kabul. Public wiki'deki editoryal okuma ve medya başına yetki sorgusu ileride ölçülecek sıcak noktalar; gerekirse yayın/geri alma ile doğru invalidation sağlayan public-only cache tasarla. Özel taslak/oturum verisini ortak cache'e alma; medya erişiminin anında kaldırılması sözleşmesini ve `private, no-store` korumasını CPU uğruna kaldırma. Mevcut API bağlantısına ölçümsüz “pooler ekle” çözümü uygulama; uygulama doğrudan PostgreSQL bağlantı havuzu açmıyor.

**D2 sonrası ilk özellik: E — Türkçe global arama ve filtreler.** Mevcut `/wiki` ad/alias/ID aramasını kullan; ikinci ayrı kanon deposu kurma. Önce Türkçe/ASCII eşleştirme (`Çöl Şehri`/`col sehri`), eski ID/slug yönlendirmesi ve birden fazla varlıkla ortak alias sonuçları; sonra klavyeyle çalışan global arama arayüzü ve URL'den geri gelen filtreler. Koordinatsız sonuç wiki'ye gider. Yalnızca etkin yayımlanmış makale metnini indeksle; taslakları dahil etme. Publish/rollback indeks güncelliğini aynı kabulde test et. Başlangıçta harici ücretli arama servisi kurma. Ölçülebilir kabul: Akmer/Pastırman/Helvanar/Çöl Şehri/col sehri/Karapancar doğru ID'leri bulur; boş/belirsiz dönem kaydı kaybolmaz; eski yayın metni rollback sonrası bulunmaz.

E'yi tamamlayınca F (tam dönem geçişleri), G (timeline/seyahat), H (özgün görseller ve mobil cila), I (güncelleme/yedek/geri dönüş ve yayın) sırasını koru. Bu talimat bunların hepsini tek dev değişiklikte uygulama talimatı değildir. Hedef görsel kalite henüz tamamlanmış değildir; başlangıç harita şekillerini final sanat diye raporlama.

### Doğrulanmış işler

- PRB-0003 dosya erişim engeli kalktı. Lint, typecheck, 9 dosyada64 test geçti; gerçek Tiptap DOM testleri12 adet. Enabled build sonucu IMPLEMENTATION_STATUS.md içinde güncellenir.
- PRB-0016 canlıda çözüldü: inline upload → metin → save → reload → publish başarılı. ProseMirror null-prototype attrs, Server Actions sınırında ayrık düz JSON'a çevriliyor; imzalı URL saklanmıyor. Inline NodeView ve bu dönüşüm korunacak.
- PRB-0014 hayalet taslak alt sorunu çözüldü: dört `setEditable(..., false)` çağrısını koru. Sürüm4/5 yayınından en az5 saniye sonra draft yok, rollback kullanılabilir.
- 21 Eylül canlı stale save kabulü: A sekmesinde taslak kaydedildikten sonra eski B sekmesinin tek save isteği hızlı PT409 çakışması verdi; B yerel metni korundu ve kontroller kilitlendi. PRB-0013 için uçuşta metin ekleme/reload akışı birleşik metni korudu. İki sekmede save/publish birer kez eşzamanlı başlatıldı; A save başarılı, B conflict durumunda kaldı. Exact publish HTTP kodu UI'de görünmedi. Teknik içerik gerçek klavye girdisiyle temizlendi, boş V13 yayımlandı; yeniden açma ve 5 saniye bekleme sonrası draft oluşmadı, public sayfa temiz. Medya yükleme/kaldırma kabulü sonraki kullanıcı destekli dosyayla tamamlandı; kontrollü ağ gecikmesi ve bağımsız publish HTTP kanıtı hâlâ bekliyor.
- 21 Eylül ek stale publish kontrolü: B sekmesi A kaydından önce kendi yerel metnini taşıyordu. A kaydından sonra B yayın isteği göndermeden `Sürüm çakışması` guard'ına geçti; yerel metin korundu, save/publish kontrolleri kilitlendi. Bu istemci koruması başarılıdır; gerçek sunucu publish HTTP409'u olarak raporlanmaz. A sekmesi gerçek klavye girdisiyle temizlenip boş V10 yayımlandı; yeniden açma ve 5 saniye bekleme sonrası draft yok, public sayfa temiz.
- 21 Eylül medya kabulü tamamlandı: Kullanıcının seçtiği kanon dışı `deneme` görseli owner editöründen yüklendi, reload sonrası korundu, UI'den kaldırıldı ve boş V15 yayımlandı. Beş saniye sonra draft/galeri yoktu. Public sayfada görsel veya `alt=deneme` yok; metin eşleşmesi kanonik “ritüel denemesi” ifadesiyle sınırlı. Tek görsel olduğundan sıra düğmeleri devre dışıydı; çoklu galeri sırası/rollback V4–V6 kanıtına dayanıyor. Test içeriği temizdir; kanon ve eski sürümler korunur.
- PRB-0011/0012 gerçek owner + anonim HTTP kabulü geçti: private original/türev adresleri anonim isteği reddediyor; yeni taslak medya uygulama adresi404, yayın sonrası200 WebP ve `private, no-store`. Yeni düzenleme galeriyi koruyor, rollback doğru medya kümesine dönüyor ve kaldırılan medyanın adresi404 oluyor.
- NPC-0006 temizlendi: V15 boş doküman, draft yok, bağlı medya yok. Public Akmer200; teknik metin/görsel yok, dört test medya adresi404. Geçmiş V1–V14 ve özel dosyalar korunur. Bu işlem ilk “hiç makale yok” durumuna dönüş değildir. Kanon değişmedi.
- Yerel server secret kullanıcı dosyasından `.env.local` içine güvenli eklendi. Owner/secret/bootstrap tekrar istenmez. Secret dosyası ve ortam Git dışında; değerini rapora/komut argümanına yazma.

### 1. Yeni SQL düzeltmesinin mevcut durumu

`202609210001_editorial_conflict_sqlstate.sql` canlı SQL Editor'de kullanıcı tarafından çalıştırıldı. Önceki `upstream request timeout` yerine tek stale save isteği hızlı PT409 çakışmasına düştü; eski sekmenin metni korundu. Bu migration yeniden uygulanmayacak. Eşzamanlı save/publish UI yarışı da birer istekle çalıştırıldı; exact publish HTTP kodu tarayıcı UI'sinden görünmediği için doğrudan HTTP409 diye işaretlenmedi.

1. `supabase/migrations/202609210001_editorial_conflict_sqlstate.sql` kullanıcı tarafından çalıştırıldı. Bundan sonraki iş salt-okuma tanı ve canlı kabul; dosyayı/bootstrap'ı yeniden uygulama. Secret key yönetim SQL yetkisi sağlamaz. Eski migration'ları değiştirme.
2. Yerel PGlite: altı migration +23 davranış kontrolü; yeni ilk kurulum paketi +24 kontrol geçti. Tekrar uygulama tanım ve grant'ları korur. Bunlar canlı HTTP409 kabulü değildir.
3. Uygulama sonrası `supabase/diagnostics/editorial_conflict_state.sql` salt-okuma sonucu altı satırda `old_retry_code=false`, `http_conflict_code=true` olmalı. Önceki döngüler migration ile durmayabilir: Logs Explorer'daki tekrar eden40001 process_id ile eşleşen eski backend'i doğrulamadan bağlantı sonlandırma. Tanı dosyası yalnızca adayları gösterir; topluca terminate/reset yok.
4. Yeni bootstrap/manifest altı migration içerir ve **yeni projeler** içindir. Mevcut canlı makbuz eski beş sürümü tutar, bunların hash'leri korundu. Altıncı sürüm geçmişini ancak gerçekten uygulandığını doğrulayınca CLI'de onar; ilk beş migration'ı yeniden uygulama.

### 2. Kalan gerçek kabul

1. AGENTS.md, durum ve PRB kayıtlarını oku. Staged ve unstaged diff'i incele. Kod değiştiyse lint/typecheck/test ve enabled build. Aynı `.next` üzerinde dev/build/start eşzamanlı olmasın. Son build'i `SUPABASE_EDITORIAL_MODE=enabled npm run start -- --hostname 127.0.0.1 --port 3001` ile aç.
2. Codex tarayıcısında mevcut owner oturumunu kullan. Sekme/süreç numarasını sabit kabul etme; Safari'ye geçme, token/kuki çıkarma. Oturum gerçekten biterse kullanıcı kendi girişini yapar.
3. Yeni migration sonrası aynı makaleyi iki sekmede aç: A kaydet, eski B ile save dene. Hızlı kontrollü çakışma, yerel yazının korunması, daha fazla yazıda autosave'in durması ve “Yerel taslağı indir” kabulünü doğrula. Timeout tekrar ederse art arda istek gönderme.
4. Ayrı temiz stale sekmelerle medya mutate ve publish çakışmasını doğrula. Save çakışmasıyla zaten kilitli bir sekmeyi bağımsız publish testi sayma. İki sekme aynı Auth kullanıcısıdır; iki bağımsız kullanıcı/DB oturumu testi sayılmaz. Eksik erişimi açık kaydet.
5. PRB-0013 gecikmeli yanıt regresyonları gerçek Tiptap DOM/coordinator üzerinde geçti. Canlı kontrollü gecikme/ağ kesintisi kabulü yapılmadı. Araç sağlamıyorsa yapılmış gibi yazma. Eski yanıt daha yeni metin/not/dönemi kaydedildi göstermemeli.
6. D2 planındaki diğer kabul kanıtlarını kontrol et: ID'li bağlantının save/reopen/public render'ı; yetkisiz direct write/private draft read reddi; NPC/item/location galeri; core import ve export koruması. Eksikse tamamla. Gerçek kanonu test için yeniden konsolide/import etme; izole fixture kullan.

### 3. Temizlik ve kapanış

NPC-0006 artık temiz V15'tir; eski teknik taslak varmış gibi davranma. Yeni test eklersen sonunda temiz sürüme dön veya boş temiz yeni sürüm yayımla. Public metin/görsel yokluğu ve test medya404 sonucunu anonim HTTP ile doğrula. Özel dosya ve geçmişi topluca silme.

V4 → V5 → V4'ten oluşturulan V6 yayın/rollback akışı kabul edildi; sebepsiz tekrarlama. Tekrar gerekirse gerçek yeni numaraları kaydet. Guard kaldırma, SQL'den draft silerek hatayı gizleme.

D2 kapanmadan tam deploy başarısı yazma. Medya yükleme/kaldırma artık kanıtlıdır; açık kapsam PRB-0013/0014, kontrollü ağ gecikmesi, bağımsız publish HTTP kanıtı ve planın core reimport/export gibi kalan tam D2 maddeleridir. Bunlar kanıtlanmadan E'ye geçme. Tek ayrıntılı kayıt ASTRA_SORUN_KAYITLARI.md. D2 gerçekten tamamlanırsa mevcut yetki kapsamında ilgili staged+unstaged değişiklikleri commit/push et; Vercel'de **yeni commit** Ready ve gerçek HTTPS smoke sonuçlarını doğrula. Anahtarlar, `.env.local`, `secret.md`, `.next`, fixture ve `tsconfig.tsbuildinfo` commit'e girmesin. HEAD/remote'u yeniden kontrol et.

İlk başarısız düzeltmede aynı PRB'yi güncelle; ikinci başarısız düzeltmede manuel danışma beklet, üçüncü tahmini yama yapma. Yeni migration'ın canlıda uygulanması deploy'dan bağımsız bir önkoşuldur.

## Tarihsel başvuru — 16 Eylül 2026 (yeniden uygulanacak iş listesi değil)

16 Eylül 2026. Önce AGENTS.md ve mevcut rehberleri oku. Bu belge mevcut projeyi sürdürür; sıfırdan kurma. Kullanıcı migration uygulanmasını ve önizlemeyi istedi. D2 kabulü tamamlanmadan editörü üretime hazır ilan etme. Kullanıcının seçtiği modeli değiştirme, alt ajan çağırma.

## Bugünkü karar

Salt okunur harita/wiki önizlemesi çalışıyor. Harita şu anda envanterden türetilen başlangıç şekilleri içeriyor: 4 ada + 2 kıta, yalnızca bir yerleştirilmiş şehir işareti. Son fantasy artwork, kapsamlı yerleşimler ve 3D deneyim tamamlanmadı. Dar görünümde bazı ada etiketleri çakışıyor. Bu hâli bitmiş ürün diye tanıtma.

PRB-0009'un girdi adımı kullanıcı onayıyla tamam kabul edildi: bootstrap canlı SQL Editor'de çalıştırıldı, owner rolü ve Vercel server secret'ın ayarlandığı bildirildi. Ağ erişimli salt-okuma kontrolü 416 kimlik (403 etkin / 13 emekli) ve reader RPC HTTP 200 gösteriyor. Parolalı Auth oturumu olmadan canlı editör/Storage tarayıcı E2E'si çalıştırılamadığı için D2 açık kalır. `fetch failed` tek başına boş veritabanı kanıtı değildir; önceki `PGRST202` eksik okuyucu fonksiyonunu gösterir.

## 1. Kurulumu tamamla

Kullanıcı bootstrap SQL dosyasını canlı Supabase SQL Editor'de çalıştırdığını bildirdi. Bootstrap'ı tekrar çalıştırma. Salt-okuma canlı kontrolünde 416 kimlik (403 etkin / 13 emekli) ve public reader RPC HTTP 200 görüldü. Owner rolü ile server secret adımı kullanıcı onayıyla tamam kabul edildi; sıradaki iş gerçek Auth/Storage E2E'sidir:

- SQL Editor yolu (tamamlandı): Kullanıcı `supabase/generated/bootstrap_editorial.sql` dosyasını doğru projede çalıştırdı. Bu paket 001–005 + kimlik seed'ini tek transaction'da uygular; canlı salt-okuma sonucu 416 kimlik / 403 etkin / 13 emekli. Dosyayı yeniden çalıştırma.
- CLI/PostgreSQL yolu: kullanıcı yönetim bağlantısını yalnızca yerel gizli dosyaya ekler veya yetkili CLI oturumu açar. Şifreyi sohbet/log/komut argümanına koyma. Önce `migration list` ve `db push --dry-run`; yalnızca bekleyen migration'ları uygula; ardından identity seed. Dolu projede bootstrap dosyasını çalıştırma. `db reset` kullanma.

`bootstrap_editorial.sql` yalnızca ilk kurulum içindir. SQL dosyaları değişirse `node scripts/export_supabase_bootstrap.mjs` ile paketi yeniden üret. Seed yeniden üretmek için veri konsolidasyonunu çalıştırma; ayrı identity exporter mevcut.

Kurulum sonrası `supabase/generated/verify_installation.sql`: 416/403/13 kimlik, iki private bucket, dokuz RLS tablo, yedi güncel tek RPC imzası beklenir. `save_wiki_draft` artık sekiz parametre içerir; sonuncu `p_expected_published_revision_id`.

Public bağlantı ve okuyucu RPC'sini anahtarları yazdırmadan kontrol etmek için `npm run supabase:check-live` kullanılabilir. Bu komut owner satırını okumaya çalışmaz; 401/403 görülmesi RLS'in beklenen sonucudur. Owner yalnızca SQL Editor/Auth oturumunda doğrulanır.

**Migration geçmişi:** SQL Editor, Supabase CLI geçmişini güncellemez. Paket kendi `private.bootstrap_receipts` tablosuna kaynak hash'lerini kaydeder; bu CLI geçmişi değildir. CLI'ye geçmeden önce makbuzları `supabase/generated/bootstrap_manifest.json` ile karşılaştır ve kurulum sorgularını doğrula. Ancak gerçekten uygulanmış ve hash'i eşleşen 202609160001–202609160005 sürümlerini `supabase migration repair <version> --status applied` ile işaretle. Sonrasında `migration list` ve `db push --dry-run` hiçbir eski migration'ı yeniden uygulamamalı. Hata saklamak için repair kullanma. Canlıya uygulanmış migration dosyalarını sonradan değiştirme; yeni ileri migration ekle.

## 2. Sahip hesabı ve ortam

Kullanıcı owner rolünün ve Vercel `SUPABASE_SECRET_KEY` değişkeninin ayarlandığını açıkça onayladı; aynı bilgiyi tekrar isteme veya bootstrap'ı yeniden çalıştırma. Aşağıdaki maddeler yalnızca gelecekteki ortam kurulumlarında referans içindir. Gerçek Auth/Storage kabulü için yerel önizlemede owner hesabıyla oturum açılmış bir tarayıcı gerekir; parola sohbetten veya kayıtlardan alınmaz.

Supabase Auth > Users içindeki kullanıcının site sahibine ait olduğunu eşleştir. Kullanıcının onayladığı gerçek UUID ile SQL Editor'de tek kayıt ekle:

```sql
insert into public.editor_profiles(user_id, role, display_name)
values ('AUTH_USER_UUID', 'owner', 'Site Sahibi');
```

`AUTH_USER_UUID` gerçek UUID ile değiştirilmeden çalışmaz. Mevcut bir rolü körlemesine yükseltme. Auth parolasını kullanıcı kendisi belirlesin/girsin. Public repoya kişisel hesap UUID/e-posta veya gizli anahtar ekleme.

Gerekli uygulama değişkenleri:

| Değişken | Nerede / amacı |
| --- | --- |
| NEXT_PUBLIC_SUPABASE_URL | Vercel ilgili ortamı + .env.local; mevcut doğru proje |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | Aynı projeye ait genel anahtar; mevcut |
| NEXT_PUBLIC_SITE_URL | Yerelde kullanılan tam origin, canlıda gerçek HTTPS domain |
| SUPABASE_SECRET_KEY | Yalnızca sunucu; özel medya sunumu ve owner davet işlemleri. NEXT_PUBLIC ön eki koyma |
| SUPABASE_EDITORIAL_MODE | Geçici salt-okuma yayını: disabled. Kurulum + D2 kabulünden sonra enabled |

Vercel entegrasyonunun ürettiği değişken adlarının uygulamanın okuduğu adlarla eşleştiğini kontrol et. Eski `SUPABASE_SERVICE_ROLE_KEY` adı kendiliğinden okunmuyor. Secret key, SQL migration çalıştıran yönetim bağlantısı değildir. Migration şifresini Vercel runtime'a koymak gerekmez.

Auth URL Configuration'da gerçek site URL'si ve kullanılacak origin'lerin `/auth/callback` adresleri bulunmalı. Yerel önizleme 127.0.0.1:3000 kullanıyorsa localhost ile aynı origin sayma. Yeni editöre davet gönderme testinde kullanıcıdan alıcı için açık yetki olmadan e-posta gönderme.

## 3. Yayından önce tamamlanacak kod işleri

Ayrıntılı tek problem kayıtları ASTRA_SORUN_KAYITLARI.md içindedir; aşağıdaki ölçütleri mevcut PRB'lere bağla.

**PRB-0013 / PRB-0014 — editörün kayıt kuyruğu:**

1. `wiki-editor.tsx` içindeki `saveLatest` eski `enqueueSave` closure'ını döngü boyunca tutuyor. Kayıt uçuş hâlindeyken dönem/not değişirse güncel editSequence ile eski metadata gönderilebiliyor. Her belge+dönem+not+sequence için değişmez snapshot al; kuyrukta gerçekten en güncel snapshot'ı işle. Yalnızca ref sayacı karşılaştırma testini yeterli sayma.
2. `lastSaved` hızlı dönüşü, başka kayıt kuyruktayken kullanılmamalı. A → B kaydı uçuşta → A'ya geri dön → publish senaryosu B'nin yanlışlıkla yayımlanmasına yol açmamalı.
3. 40001 çakışmasını kalıcı bir durdurma işaretiyle tut. Yazmaya devam etmek yalnızca dirty yapıp aynı eski token ile yeniden otomatik kayıt başlatmamalı. Yerel yazıyı koru, kullanıcıya yeniden yükleme/karşılaştırma seçeneği sun. RPC/network throw'larını aynı görevde yakala; rejected promise ve sonsuz saveLatest döngüsü bırakma.
4. Metin kaydı, media attach/remove/reorder ve publish tek tutarlı mutasyon sırasına sahip olsun. `draft-media-manager.tsx` ayrı kuyruğu eski lock token'ını üst bileşene geri yazmamalı. Gerçek DB çakışmasını yutma.
5. Publish/upload sırasında yazılan yeni metin `window.location.reload()` ile silinmemeli. Ya işlem boyunca düzenlemeyi açıkça kilitle, ya da yeni snapshot'ı koruyarak sayfayı yenilemeden sunucu sonucunu uygula. Tüm dönem/not/toolbar/media kontrollerini aynı kurala dahil et.
6. Kontrollü gecikmeli yanıtlarla gerçek kuyruk davranışını test et: kayıt sırasında belge/dönem/not değişimi; geri alma; ağ hatası; kalıcı conflict; medyayla eşzamanlı save; publish sırasında yazma. Test gerçek koordinatör davranışını çalıştırsın; implementation string kontrolüyle yetinme.

**Bu Astra incelemesinde zaten uygulanan ek düzeltmeler:**

- Yeni taslak açarken beklenen yayımlanmış revizyon kontrolü SQL + action + input + istemciye eklendi. Eski sayfa yeni yayını sessizce temel alamaz.
- Medya remove sırası article → draft olarak açık kilitlendi; reorder tekrar eden ID'leri DB'de reddediyor.
- Public medya yanıtı `private, no-store`; yayından kaldırma/rollback sonrasında bir yıllık cache erişimi sürdürmez. Gerçek CDN/Storage testini yine yap.
- Platformun `storage.buckets` tablo yorumunu değiştiren gereksiz komut kaldırıldı.

## 4. Doğrulama ve kabul

Astra'da lint/typecheck ve 43/43 test geçti. PostgreSQL motoru PGlite 0.5.8 üzerinde beş migration + seed ve 17 davranış denetimi geçti; birleşik bootstrap ile 18 denetim geçti. Bu test gerçek PL/pgSQL ve RLS çalıştırır; Auth/Storage tabloları fixture'dır, pgcrypto extension yüklemesi atlanır, built-in UUID kullanılır. Gerçek Storage HTTP, iki bağımsız PostgreSQL oturumuyla yarış, Auth callback ve tarayıcı editörü test edilmiş sayılmaz.

Tekrarlamak için geçici bağımlılık kur (uygulama paketine eklemek gerekmez):

```sh
npm install --prefix /tmp/ejder-sql-validation --no-audit --no-fund @electric-sql/pglite@0.5.8
node scripts/verify_editorial_pglite.mjs /tmp/ejder-sql-validation/node_modules/@electric-sql/pglite/dist/index.js
EJDER_TEST_BOOTSTRAP=1 node scripts/verify_editorial_pglite.mjs /tmp/ejder-sql-validation/node_modules/@electric-sql/pglite/dist/index.js
```

Gerçek Supabase kurulunca pgTAP `supabase/tests/editorial_schema.test.sql` çalıştır. Sonra gerçek sahip hesabıyla taslak oluştur → fotoğraf ekle → anonim erişim yok → yayımla → anonim metin/türev var, original yok → yeni taslakta galeri korunuyor → rollback doğru medya kümesini sunuyor senaryosunu doğrula. İki oturumda stale save/media/publish reddini ve kullanıcı metninin kaybolmadığını kontrol et. Test içerikleri için ayrı staging proje tercih et; üretimdeki gerçek lore'u değiştirme. Gizli anahtarları test raporuna yazma.

## 5. Vercel yayın sırası

1. Önce kod ve gerçek D2 kabulünü bitir. Yalnızca görsel önizleme istenirse `SUPABASE_EDITORIAL_MODE=disabled` ile ayrı salt-okuma deployment yapılabilir; D2 tamamlandı sayılmaz.
2. Node sürümü `package.json` ve lockfile root metadata'sında `24.x` olarak sabitlendi; Vercel'in desteklediği sürümle eşleşiyor. Yerel test makinesi Node 26 kullanıyor; son kabul için Vercel logunda Node 24.x görüldüğünü kontrol et.
3. Framework Next.js, Root Directory proje kökü, Build Command `npm run build`, Output Directory framework varsayılanı. Mevcut webpack seçimini gerekçesiz değiştirme; Sharp sunucu sınırını koru.
4. Lint, typecheck, test ve editoryal **enabled** üretim build'i geçsin. Disabled build'in geçmesi gerçek bağlantının çalıştığını kanıtlamaz. `NEXT_PUBLIC_*` değerler build sırasında gömülür; env değişince yeni deploy gerekir.
5. Git diff'i incele; .env.local, anahtar, node_modules, .next, geçici PostgreSQL paketini dahil etme. Bu yerel düzeltmeler henüz commit/push edilmedi. Kullanıcının mevcut değişikliklerini koru. Onaylanmış yayın kapsamıyla doğru GitHub projesine gönder.
6. Vercel'de gerçekten bu yeni commit'in derlendiğini kontrol et. Eski `2cb0d5e` commit'ini yeniden deploy etmek yerel düzeltmeleri içermez. Kullanıcının eski log'u `Detected Next.js version` satırında kesiliyor; bu satır tek başına hata değil. Başarısızsa ilk gerçek hata ve son build çıkışını kaydet.
7. Canlı HTTPS'de harita/wiki/arama/alias yönlendirmesi/404, mobil görünüm, oturum/owner yetkisi, görsel yayın ve logout testleri yap. Public yanıtta secret veya taslak olmadığını doğrula. Deployment ID/commit/URL/test sonuçlarını status'a ekle; yalnızca sonra ilgili PRB kabulünü kapat.

İlk başarısız düzeltmede mevcut PRB'yi güncelle, ikinci başarısız düzeltmede MANUEL_DANISMA_BEKLIYOR; üçüncü tahmini yama ve proje yeniden oluşturma yok. Yeni bir dış engel varsa deneme harcamadan kaydet. Kullanıcı kayıtları Astra'ya kendisi taşıyacak.

Kaynaklar: [Supabase migration geçmişi](https://supabase.com/docs/guides/deployment/database-migrations), [Supabase CLI](https://supabase.com/docs/reference/cli/supabase-migration-repair), [Vercel Node sürümleri](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions).
