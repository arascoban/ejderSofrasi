# Uygulama ilerleme durumu

Son güncelleme: 22 Eylül 2026, Europe/Berlin

## Güncel kabul — 22 Eylül 2026, Astra

- **D2 tamamlandı.** Kabul matrisi ve test sınırları `D2_KABUL_RAPORU.md` içindedir. PRB-0013 ve PRB-0014 kapandı; PRB-0017 kullanıcı kararıyla ertelendi ve D2 engeli değildir.
- Lint/typecheck,74 Vitest +6 export testi ve üretim build526/526 başarılı; yerel SQL35/36 denetim geçti. Canlı V16 ID bağlantısı ve temiz V17 yayını doğrulandı. Özgün medya + editoryal metadata dışa aktarıldı.
- I aşamasının davet ortam kontrolü PRB-0018 altında açık; E için engel değildir.
- Sıradaki özellik **E — Türkçe global arama ve filtreler**. Güncel yürütme sırası `LUNA_DEPLOY_TALIMATLARI.md`. Kanon, sabit ID'ler, kaynaklar ve mevcut Astra düzeltmeleri korunacak.
- Uygulama commit'i `81e63d0` GitHub main dalına gönderildi; Vercel Production success aynı commit için doğrulandı. `https://ejder-map.vercel.app` üzerinde temel sayfalar200, editör giriş koruması307 ve temiz V17 kontrolü geçti. Ayrıntılar `D2_KABUL_RAPORU.md`.

## Tarihsel kabul — 21 Eylül 2026, Astra

Aşağıdaki önceki açık kabul maddeleri tarihsel kayıttır;22 Eylül kararı ve kabul matrisi önceliklidir.

- D2 bu turda açık tutuldu. Güncel sıra `LUNA_DEPLOY_TALIMATLARI.md`; ayrıntılı tek sorun kaydı `ASTRA_SORUN_KAYITLARI.md`.
- Son kullanıcı görüntüleri altı PT409 fonksiyonunu ve CPU kartında%2,04'e düşüşü doğruladı. PRB-0017 artık bellek/swap/commitment ve bağlantı kararlılığı kontrolü bekliyor; anlık CPU düşüşü D2 kapanışı değildir. Salt-okuma bellek tanı dosyası ve Luna sırası güncellendi.
- PRB-0003/0011/0012/0016 çözüldü. Gerçek owner ile inline görsel save/reload/publish; galeri koruma, rollback ve anonim medya erişimi kabul edildi. PRB-0014 hayalet taslak alt sorunu da canlı doğrulandı.
- PRB-0014 yeni SQLSTATE düzeltmesini kullanıcı SQL Editor'de çalıştırdı. Tek stale save isteği canlıda hızlı PT409 ile reddedildi ve yerel metin korundu. Bu turda aynı owner ile eşzamanlı save/publish başlatıldı; save başarılı olurken diğer sekme yerel metni koruyan çakışma durumuna geçti. Exact publish HTTP durumu tarayıcı UI'sinde görünmediği için bu doğrudan sunucu HTTP409 kanıtı olarak yazılmadı. Yeniden migration/bootstrap uygulanmayacak. Kullanıcının talimatıyla PRB-0017 CPU teşhisi ve tekrarlı yük/yarış testleri rafa kaldırıldı. Medya yükleme/kaldırma kabulü tamamlandı; kontrollü ağ gecikmesi, bağımsız publish HTTP kanıtı ve kalan plan maddeleri tamamlanmadan E'ye geçilmeyecek.
- NPC-0006 teknik içerik UI'den temizlendi: boş V15 yayında, draft/bağlı medya yok. Anonim public sayfada teknik metin/görsel yok; dört test medya adresi404. Geçmiş revizyonlar ve özel dosyalar korunur.
- 21 Eylül medya kabulü: Kullanıcının seçtiği kanon dışı `deneme` görseli gerçek owner editöründen yüklendi; yeniden açmada galeri içinde kaldığı doğrulandı. Görsel UI üzerinden kaldırıldı, boş V15 yayımlandı, yeniden açma ve 5 saniye beklemede draft/galeri oluşmadı. Anonim public Akmer sayfasında `img` öğesi ve `alt=deneme` yok; geniş metin eşleşmesi yalnızca kanonik “ritüel denemesi” ifadesidir. Kanon ve eski medya/sürüm geçmişi silinmedi. Tek görsel olduğu için sıra düğmeleri doğal olarak devre dışıydı; çoklu galeri sırası/rollback kanıtı önceki V4–V6 kabulünde korunuyor.
- Son kodda lint/typecheck ve9 dosyada64 test başarılı. Enabled production build526/526 başarılı. PGlite altı migration/23 denetim, yeni ilk kurulum paketi/24 denetim başarılı; canlı pgTAP/iki bağımsız DB oturumu testi sayılmaz.
- Yerel server secret eklendi, owner oturumu çalışıyor. Son build önizlemesi `http://127.0.0.1:3001` üzerinde başlatıldı. Secret dosyaları ignore edildi, anahtarlar rapora yazılmadı.
- 21 Eylül güncel yerel tekrar: `npm run check` başarıyla geçti (lint, typecheck, 64 test, Webpack build 526/526). Owner editör oturumunda PRB-0013 için uçuşta düzenleme korunarak yeniden açma doğrulandı; PRB-0014 için stale PT409, eşzamanlı save/publish yarışı ve yerel metin korunması doğrulandı. Test akışının sonunda gerçek klavye ile içerik temizlendi, boş V13 yayımlandı; 5 saniye sonra draft oluşmadı ve public wiki'de PRB/test metni bulunmadı.
- Önceki medya çatışması hazırlığında yerel test dosyası tarayıcı dosya seçicisine bağlanmamış ve istek oluşmamıştı; bu sınırlı deneme geçmişi korunuyor. Sonraki kullanıcı destekli `deneme` dosyasıyla yükleme, reload, kaldırma ve temiz yayın kabulü tamamlandı.
- Mevcut staged/unstaged çalışma korundu. Kanon ve önceki migration dosyaları bu tur değiştirilmedi. Yeni migration ve yalnızca yeni kurulum için güncel bootstrap paketi eklendi. Medya yükleme/kaldırma kabulü artık kanıtlı; D2'nin kontrollü ağ gecikmesi, bağımsız publish HTTP kanıtı ve core reimport/export gibi kalan tam kabul maddeleri tamamlanmadığı için commit/push/Vercel deploy ve E başlangıcı yapılmadı.

Aşağıdaki16 Eylül bölümleri tarihsel kabul kaydıdır; yukarıdaki güncel durum önceliklidir.

## Yetkilendirilen kapsam

Kullanıcı uygulamadaki açık sorunları ve Vercel deploy hatasını doğrudan Astra ile incelemeyi istedi. A–D1 önceki kabulü korunur. Astra'nın PRB-0011–0014 önerileri yerel kod, migration ve medya erişim akışına uygulandı; gerçek Supabase kurulumu salt-okuma ile doğrulandı, fakat canlı Auth/Storage editör E2E'si tamamlanmadı. Kullanıcı owner rolü ile Vercel Secret Key'in ayarlandığını onayladı; bu bilgi tekrar sorgulanmadan kabul akışına alındı. GitHub push ve Vercel canlı deploy bu çalışma sonunda ayrıca doğrulanacaktır.

## Son Astra kontrolü — 16 Eylül 2026

- Migration uygulama yetkisi verildi ve kullanıcı bootstrap SQL paketini canlı Supabase SQL Editor'de çalıştırdı. Bootstrap'ı tekrar çalıştırma.
- Canlı salt-okuma kontrolü başarılı: 416 kimlik (403 etkin, 13 emekli), public reader RPC HTTP 200. Anon `editor_profiles` sorgusu 401 ile reddedildi; owner satırı publishable key ile doğrulanamaz. Kullanıcı owner rolünün ve Vercel Secret Key'in ayarlandığını onayladı (PRB-0009).
- Yerel lint/typecheck, 43 test, beş migration + 17 PostgreSQL davranış kontrolü ve bootstrap ile 18 kontrol başarılı. `npm run check` editoryal mod açıkken tamamlandı; production build 526 sayfa üretti.
- PRB-0011/0014 için ek SQL ve cache düzeltmeleri uygulandı; PRB-0013/0014 yerel kuyruk ve PGlite davranış kontrolleri geçti. Owner Auth/Storage tarayıcı kabulü PRB-0009 kapsamında doğrulandı; kontrollü ağ gecikmesi ve dosya-seçici medya yarışı ayrı açık sınırdır.
- PRB-0015 çözüldü: editoryal wiki route'u artık build sırasında Supabase'e bağlanmıyor (`force-dynamic`); editoryal mod açık üretim build'i başarılı.
- Vercel Node sürümü `24.x` olarak `package.json` ve lockfile kökünde sabitlendi; `npm run check` son tekrarında lint/typecheck/test/build tamamlandı (43 test, 526 sayfa).
- Önizleme: http://127.0.0.1:3000/map. Production HTTP kontrolü map/wiki/Akmer/arama/editör giriş 200; geçersiz medya ID 400, bilinmeyen UUID medya 404. Editör tarayıcı akışı Auth girişine kadar kontrol edildi; parolalı owner oturumu olmadan etkileşimli E2E çalıştırılamadı.
- Sonraki uygulayıcı `LUNA_DEPLOY_TALIMATLARI.md` sırasını izlesin: kullanıcı onayıyla owner/secret adımı tamam kabul edilerek gerçek Auth/Storage E2E, ardından commit/push ve Vercel canlı kontrolü. Ayrıntılı hata kayıtları yalnızca ASTRA_SORUN_KAYITLARI.md içindedir.

## Önceki aktif aşama — 16 Eylül kaydı

- D2 — Editör ve Supabase kabulü; paralelde I aşamasının deploy teşhisi.
- Durum: üretim derleyicisini durduran istemci/sunucu import hatası düzeltildi (PRB-0010). PRB-0011–0014 için Astra önerileri yerelde uygulandı ve statik kontroller geçti; gerçek Auth/Storage/PostgreSQL E2E'si owner oturumu gerektirdiği için açık. `CIT-0006` dünya çapası sunum taslağı olarak kalır.

## Tamamlananlar

- [x] A1: Çalışma alanı incelendi. Başlangıçta frontend, `package.json` ve Git deposu bulunmadı.
- [x] A1: Node `v26.0.0`, npm `11.12.1`, Python `3.10.0` doğrulandı.
- [x] A1: Korunacak alanlar belirlendi: `Canon/`, `WorldData/`, `data/`, `scripts/id_registry.json` ve mevcut veri üretim araçları.
- [x] A2: Next.js 16.3.5, React 19.2.8, TypeScript 5.9.3 ve Tailwind 4.3.3 kök dizinde uyumlu sürümlerle sabitlendi. React 19.2, kararlı R3F 9.7 peer aralığı için seçildi.
- [x] A3: Türkçe kök düzen, gezinme, `/map` ve `/wiki` sayfaları oluşturuldu; `html lang="tr"` tanımlandı.
- [x] A3 bağımsız iyileştirme: Dünya arşivi araması artık ad, slug, takma ad ve sabit kimlikle çalışıyor; 1300/1600 dönem filtresi eklendi.
- [x] A3 bağımsız iyileştirme: Etkin arşiv filtreleri tek bağlantıyla temizlenebiliyor; filtreli sonuç sayısı erişilebilir canlı bölgede gösteriliyor.
- [x] A4: Merkezi veri deposu, varlık/slug/olgu/ilişki indeksleri ve dönem sonuçları eklendi; gerçek veri ve bozuk fixture testleri başarılı.
- [x] A4: `world_metadata`, `episodes`, `world_states`, `id_redirects` ve `source_inventory` için uygulamaya ait yardımcı Ajv sözleşmeleri merkezi yükleyiciye bağlandı.
- [x] A5/A6: Geliştirme sunucusu ve tarayıcıda Türkçe gezinme, arama, 1300/1600 filtresi, eski ID yönlendirmesi, kanonik/takma ad görünümü, kampüs ortak olguları, seyrek kanon sayfası ve Türkçe 404 doğrulandı.
- [x] Veri sahipliği kararı: `NPC-0004` Adnan Körkapak / O'Rusbu Adnan olarak birleştirildi; eski `NPC-0059` kimliği ve `o-rusbu-adnan` slug'ı geriye dönük yönlendirmeyle korundu. `NPC-0052 Kara Kapak` ayrı kaldı.
- [x] Veri sahipliği kararı: `TWN-0003 Güllaç Kasabası` TOWN olarak kesinleştirildi; normalized açıklama “Şeker madenlerinin ve Sütçüoğlu tesislerinin bulunduğu kasaba.” oldu. Kaynak pointer ve düzeltme gerekçesi korundu.
- [x] Veri sahipliği kararı: `TWN-0011 Şalgam Kasabası` için owner-confirmed `LOCATED_IN → ISL-0005 Şalgam Adası` ilişkisi eklendi; eski kimlikler ve ayrı entity kayıtları korundu.
- [x] Veri sahipliği kararları: `CRE-0008`, `CRE-0002`, `NPC-0050`, `ITM-0031` ve `ITM-0036` beş owner-confirmed merge ile kesinleştirildi; eski ID’ler `data/id_redirects.json` içinde korunuyor.
- [x] Veri sahipliği kararı: `NPC-0024` kaydı artık canonical adı `Dingi Sandalı` olan kişidir; `Dingi` ve `Dingil` alias olarak korunur. Yanlış ITEM kaydı `ITM-0007` geriye dönük olarak `NPC-0024` kimliğine yönlendirilir ve sahte tekne ilişkisi dışlanır.
- [x] Veri sahipliği kararları: `Bronz Ejderha` ve `Kahverengi Ejderha` `DRG-0002` altında birleştirildi; `Metal Ejderha` ayrı kaldı. `Ozempic Kervansaray` `BLD-0006 Tahin Saray Kervansarayı` için eski ad olarak korundu. Roary’nin `Ördek-ül Deva` ve `Ördek-ül Şifa` halk adları korundu; taşıdığı ördeğe bu adlar verilmedi.
- [x] Veri sahipliği kararları: Kavurhan akrabalık iddiası kandırmaca olarak işaretlendi; Hulusi’nin sandığı grup mülkiyetine geçti; Akmer/Kalender’in Sıçan kostümleri düzeltildi; İsrafsoy ve Kıtlıkan ayrı tanrılar olarak korundu; Kainatın Salatası/Gavurdağı Golemi birleştirildi; gerçek deney mutfağı ile tapınak yansıması ayrıldı; Podcastia aynı evrendeki sınırlı crossover referansı olarak kaydedildi.
- [x] Veri sahipliği kararı: Gavurdağı Canavarı’nın istediği Kazandibi ile ekip tarafından pişirilen Sütlaç ayrı olaylar ve ayrı kanıt kayıtları olarak korundu; Sütlaç kaydına yanlış Kazandibi alias’ı eklenmedi.
- [x] Veri sahipliği kararı: Sancar Komutan’ın Devran’ın ağzı üzerinden Arifler bağlantısıyla konuştuğu, bağlantının kask çıkarılınca koptuğu ve karakterlerin bunu sonradan fark ettiği olay bilgisi iki ilgili olguya işlendi.
- [x] Veri sahipliği kararları: Kışla Komutanı ile Kızıl Komutan Sancar ayrı kişiler olarak korundu; Opera Sanatçısı Dayı, Operacı Nihat ile birleştirildi ve eski kayıt yönlendirmesi bırakıldı.
- [x] Veri sahipliği kararları: Işık Tacı’nın başından çıkarılamadığı ve hep İto’da olduğu; Remove Curse teklifinin reddedildiği işlendi. Yeniden Yaşam Yüzüğü’nün Kalender’de kaldığı, Kadeh’in Roary’de olduğu, Roary’nin kadehi fırlatıp şehirden kaçışta geride bıraktığı, İbrahim/Cemil/Ördek’in Yaz Helvası Şehri’nde kaldığı kaydedildi.
- [x] Veri sahipliği kararı: Kristal Kılıç ile Helvacıoğlu Baltası tek eşyanın dönüşüm aşamaları olarak birleştirildi; Kalender’in önceki sahipliği, Akmer’e devri ve sabah baltaya dönüşüm bilgisi korunarak eski kimlik yönlendirmesi eklendi.
- [x] Canon destekli tekrarlar otomatik olarak işlendi: Şalgam Kasabası’nın Şalgam Adası’nda olduğu, Pıyan ve kardeşlerinin kanonik yazımları, Gizemler Adası’nın kanonik adı ve Arifler Okulu/yerleşke ayrımı yeniden sorulmadan veri inceleme kaydına bağlandı.
- [x] Veri sahipliği kararı: Çöl Şehri kaydı kanonik olarak Yaz Helvası Şehri adıyla korunuyor; eski ad ve slug geriye dönük arama için tutuluyor.
- [x] Veri sahipliği kararı: Yaz Helvası Şehri üç bağlı şehirle modellendi: Yaz Helvası Alt Şehri, Yaz Helvası Orta Şehri ve Yaz Helvası Üst Şehri. Alt şehir çölle bitişik, orta şehir ticaret merkezi, üst şehir saray/Arifler bölgesidir; surlar, kapılar, büyülü zipline ve ana yol ilişkileri veri katmanına eklendi.
- [x] Veri sahipliği kararları: Roary’nin kadeh rüyasının lanet kaynaklı olduğu, ödülün 5000 altın olduğu, Latte Kasabası’nın Vhelin Adası’ndaki ayrı liman olduğu, Borda Feneri/Dingi akrabalığının kanıtlanmadığı, Muzaffer Cemil’in kadim Zümrüt Ejderha tapınağı koruyucusu olduğu ve “Şampiyon Fener” ifadesinin eşya adından türediği işlendi. Kesin olmayan 5 gümüş ücret, ejderha sembolü ve zindan çıkış noktası belirsizlik olarak korundu.
- [x] Bu veri turu sonrası çatışma soru akışı durduruldu. Kullanıcının doğrudan Astra incelemesiyle PRB-0001, PRB-0002 ve PRB-0003 çözüldü; ek derleme engeli PRB-0004 doğrulanmış alternatifle giderildi.
- [x] B bağımlılıkları: Three.js 0.180.0, R3F 9.7.0 ve drei 10.7.8 kuruldu. React 19.2.8 ile peer bağımlılık ağacı doğrulandı; temiz tarayıcı oturumunda uyarı/hata yok.
- [x] B sunum verisi: sürümlü dünya/yerel alanlar, geometri revizyonları, boş sanat varlığı kataloğu, etkin taslak yayın manifesti ve ayrı JSON şeması oluşturuldu.
- [x] B envanteri: güncel veriden 4 ada ve 2 kıta türetiliyor; her entity ID tam bir ayrı şekle bağlanıyor. `ISL-0002 → CON-0001` owner birleştirmesi nedeniyle eski 5 ada varsayımı planlarda düzeltildi.
- [x] B etkileşimi: üstten ortografik R3F sahnesi, CameraControls ile fare/dokunma kaydırma, tekerlek/yakınlaştırma, sıfırlama ve klavye okları/+/−/0 kontrolleri eklendi; dönüş kilitli.
- [x] B dönem görünümü: envanter görünümü 6 şekli, 1300 görünümü 1 kaynak destekli şekli, 1600 görünümü 3 kaynak destekli şekli gösteriyor; dönem kanıtı olmayan 2 ada yalnızca açıkça etiketli envanter taslağında yer alıyor.
- [x] B dayanıklılığı: WebGL/Canvas hata durumunda erişilebilir kara parçası listesi kalıyor; sanat dosyası zorunlu değil. 360 px ekranda yatay taşma yok ve kamera bütün şekilleri veri sınırlarından kadraja alıyor.
- [x] B koordinat QA: yerel → dünya → yerel ve dünya → ekran → dünya dönüşümleri farklı yakınlaştırmalarda doğrulandı; dünya sınırı büyüyünce mevcut yerel çapanın değişmediği test edildi.
- [x] C kapsam raporu: 85/85 konumun her biri `mapped`, `local_map`, `unplaced` veya `supernatural_or_uncertain` durumuna bağlandı. Dağılım 7/38/36/4; koordinatı bilinmeyen kayıtlara sahte çapa verilmedi.
- [x] C sunum yerleşimi: `map_layout.json` ve `map_location_coverage.json` ayrı sürümlü sözleşmeler olarak yayına bağlandı. `CIT-0006` yalnızca `PRESENTATION + draft + CANON_CONSTRAINED` olarak Helvanar alanına yerleştirildi; kesin konum iddiası yapılmadı.
- [x] C önizleme: Yaz Helvası Şehri paneli kanonik adı, Çöl Şehri takma adı, `CAPITAL_OF → KNG-0008`, bağlı yerler, olgular, bölümler ve wiki bağlantısını merkezi veri deposundan çözüyor.
- [x] C etkileşimi: gerçek düğme işaretleri, erişilebilir konum listesi, sürükleme/eşik koruması, `entity` ve `era` URL durumu, tarayıcı geçmişiyle uyumlu açma-kapama, odak iadesi ve kamera durumunu bozmayan panel eklendi.
- [x] C responsive panel: masaüstünde harita üstü yan panel, 820 px altında haritayı kullanılabilir bırakan alt panel davranışı ve koordinatı olmayan 78 kayıt için doğrudan wiki dizini eklendi.
- [x] D1 wiki: 403 varlığın tamamı statik wiki sayfasına bağlandı; olgular, giden/gelen ilişkiler, dönemler, bölümler ve kaynak kanıtları Türkçe, tip duyarlı ve ID tabanlı gösteriliyor.
- [x] D1 ilişki anlamı: gelen ve giden ilişki etiketleri ayrı çözümleniyor; `USES` kullananı, `OWNS` sahibini, coğrafi ilişkiler ise doğru ters yönü gösteriyor.
- [x] D1 bölüm arşivi: 25 bölüm sayfası; 90 zaman çizelgesi olayı, 56 seyahat kaydı, katılımcılar, konumlar, bağlı varlıklar ve kanıt izleriyle çapraz bağlandı.
- [x] D1 bağımsız lore: 86 lore kaydı kendi dizin ve detay sayfasına, kaynak bölümü ve varsa konu varlığı bağlantısına sahip.
- [x] D1 harita dönüşü: haritadan açılan wiki bağlantısı `entity` ve `era` durumunu taşır; dönüş bağlantısı seçimi korur, kamera görünümü oturum depolamasından güvenli sınırlar içinde geri yüklenir.
- [x] D1 paket ayrımı: normal wiki, bölüm ve lore istemci chunk’larında R3F/Three veya editör kodu bulunmuyor; wiki detayları statik üretilmeye devam ediyor.

## Tarihsel sıradaki adım — gerçek Auth/Storage E2E ve yayın

1. Kullanıcının owner/Secret Key onayını koru; parolalı Auth oturumuyla editör tarayıcı kabul akışını çalıştır.
2. Görselli düzenle → yayımla → tekrar düzenle → rollback akışını ve iki editör yarış senaryosunu gerçek Supabase üzerinde doğrula.
3. Owner ve secret sonrasında `SUPABASE_EDITORIAL_MODE=enabled` ile bağlı build/deploy çalıştır; gerçek Storage ve Auth E2E kabulünü kaydet.

## Güncel doğrulamalar — 16 Eylül 2026, Astra incelemesi

- Lint başarılı, 8 dosyada 43/43 test başarılı. Sunucu işleme testi gerçek Sharp ile çalışıyor; kayıt koordinatörü gecikmeli yanıt ve kalıcı çakışma testlerini içeriyor.
- PRB-0010 yamasından sonra Webpack derlemesi ve Next TypeScript kontrolü başarılı. PRB-0015 ile `/wiki/[slug]` dinamik route'a alındı; editoryal mod açık tam build artık 526 sayfa ile başarılı.
- 16 Eylül 19:35'te editoryal mod açık build'in `fetch failed` nedeniyle düşmesi PRB-0015 olarak ayrıştırıldı; `/wiki/[slug]` `force-dynamic` yapıldıktan sonra aynı build 526/526 sayfa ile geçti.
- `SUPABASE_EDITORIAL_MODE=disabled npm run build` başarılı: Webpack derlemesi, TypeScript ve 526/526 statik sayfa üretimi tamamlandı; `/api/media/[mediaId]` dinamik route olarak paketlendi. Bu mod migration öncesi açıkça salt-okuma önizlemesidir.
- Supabase canlı salt-okuma kontrolü: 416 kimlik (403 etkin, 13 emekli), reader RPC HTTP 200; anonim `editor_profiles` erişimi 401 (beklenen RLS). Kullanıcı bootstrap SQL'i SQL Editor'de çalıştırdığını bildirdi; owner satırı ve Storage nesneleri public anahtarla doğrulanmadı.
- Git deposu mevcut: `https://github.com/arascoban/ejderSofrasi`, incelenen commit `2cb0d5e`. Yerel düzeltmeler push edilmedi. Anahtarlar çıktıya/dokümanlara yazılmadı.
- Kod incelemesindeki SQL/Storage ve editör yarış bulguları için gerçek PostgreSQL motoru PGlite davranış testi geçti; Auth/Storage fixture ve iki bağımsız canlı oturumlu tarayıcı E2E hâlâ açık kabul kapsamıdır.

## Önceki doğrulamalar — D1 kabul geçmişi

- A kabulü: Python QA `passed_with_editorial_warnings`; 403 varlık, 435 ilişki, 90 olay, 56 seyahat, 89 açık lore çatışması, `1290/1290` kaynak olgu kapsamı, 0 hata. `qa_report.json` değişmedi.
- Koruma: `rebuild_verification.json` içindeki 26 mevcut kanon/ID çıktısının tamamı aynı hash ile eşleşti. Yeni map sunum dosyaları bu kanon hash listesinden ayrıdır.
- Frontend toplu kontrolü: lint, TypeScript, test ve Webpack üretim derlemesi başarılı. 521/521 sayfa üretildi.
- Vitest: 3 dosyada 25/25 test başarılı; yardımcı veri şemaları, 85 konum kapsamı, 6 kara şekli, 25 bölüm, 90 olay, 56 seyahat, 86 lore kaydı ve ilişki yön etiketleri dahil.
- Tarayıcı: `/episodes/EP07`, `/lore/LOR-0029` ve `/wiki/col-sehri?from=map&entity=CIT-0006&era=1300` canlı açıldı; bağlantılar, kanıt ayrıntıları ve `/map?era=1300&entity=CIT-0006` dönüş adresi doğrulandı.
- Tarayıcı: `/map` ve `/map?entity=CIT-0006` canlı olarak açıldı; erişilebilir ağaçta 6 kara parçası, 1 işaret, 7/38/36/4 kapsam sayıları ve doğru şehir/krallık paneli doğrulandı. İn-app tarayıcı daha sonraki ekran görüntüsü denemesinde WebGL bağlamını kaybetti; üretim derlemesi ve ilk canlı açılış başarılıdır.
- Sunum metadata boyutu: çerçeve, özellik, varlık ve yayın JSON’ları toplam 5.321 bayt; gzip ile 1.445 bayt. 200 KB başlangıç hedefinin altında.
- Tarayıcı: `/map` gerçek WebGL Canvas ile açıldı; envanter/1300/1600 sayıları 6/1/3; temiz oturumda konsol uyarısı veya hatası yok. 360 px görünümde yatay taşma 0.
- Git: D1 kabulünün yapıldığı tarihte çalışma alanı henüz Git deposu değildi; güncel durum yukarıda.

## Değişen uygulama alanları

- `src/lib/data/auxiliary-schema.ts`, `src/lib/data/repository.ts`: yardımcı veri sözleşmeleri ve merkezi doğrulama.
- `data/map_frames.json`, `data/map_features.json`, `data/map_layout.json`, `data/map_location_coverage.json`, `data/map_assets.json`, `data/map_releases.json`, `data/map_presentation_schema.json`: ayrı, sürümlü sunum verisi ve tam konum kapsamı.
- `src/lib/presentation/*`: harita veri deposu, türler ve koordinat dönüşümleri.
- `src/components/map/interactive-map.tsx`, `src/app/map/page.tsx`, `src/app/globals.css`: R3F harita, kamera, dönem görünümü, erişilebilir liste ve responsive arayüz.
- `src/app/wiki/[slug]/page.tsx`, `src/app/episodes/*`, `src/app/lore/*`, `src/components/map-return-link.tsx`: tam wiki, bölüm/lore arşivleri, kanıt görünümü ve haritaya durum koruyarak dönüş.
- `src/lib/data/repository.ts`, `src/lib/domain/types.ts`, `src/lib/domain/labels.ts`, `src/lib/routing/entity.ts`: bölüm, olay, seyahat ve lore sorguları ile Türkçe ilişki yönleri ve rota yardımcıları.
- `tests/data/validation.test.ts`, `tests/domain/contracts.test.ts`: yardımcı şema, envanter ve dönüşüm regresyon testleri.
- `src/app/editor/[entityId]/actions.ts`, `src/app/editor/[entityId]/wiki-editor.tsx`, `src/app/editor/[entityId]/draft-media-manager.tsx`: token'lı taslak/medya mutasyonları, snapshot sıralı otomatik kayıt ve editör galeri akışı.
- `src/app/api/media/[mediaId]/route.ts`, `src/lib/editorial/media-limits.ts`, `src/lib/editorial/save-snapshot.ts`: private yayımlanmış medya sunumu, istemci/server sınırı ve test edilebilir kayıt sırası kuralı.
- `supabase/migrations/202609160001_editorial_core.sql`, `202609160002_editorial_security_and_workflow.sql`, `202609160003_editorial_storage.sql`, `202609160005_media_workflow.sql`: draft UUID, private bucket, imzalı editör önizlemesi ve eşzamanlılık sözleşmesi.
- `tests/editorial/supabase-contract.test.ts`, `tests/editorial/save-snapshot.test.ts`, `supabase/tests/editorial_schema.test.sql`: yeni SQL/RLS ve snapshot regresyon kontrolleri.
- `package.json`, `package-lock.json`: uyumlu React/R3F/Three sürümleri ve önceki Astra lint/build düzeltmeleri.
- `WIKI_VE_HARITA_PLANI.md`, `IMPLEMENTATION_PLAN.md`, `LUNA_UYGULAMA_REHBERI.md`: güncel owner birleştirmesine göre 4 ada/2 kıta ve 85 konum kabul sayıları.

## Teknik sorun durumu

- PRB-0001, PRB-0002, PRB-0003: `COZULDU`.
- PRB-0004: `COZULDU`; standart üretim derlemesi Webpack ile çalışır. Turbopack’in ortamda yerel port açma kısıtı sürer, `dev` komutu değiştirilmedi.
- ESLint 9 için npm destek sonu uyarısı var; eklentilerin ESLint 10 desteği sağlandığında bakım kapsamında yeniden değerlendir. Bu bir geçici uyumluluk kararıdır.
- PRB-0005–0008 ve PRB-0010: `COZULDU`.
- PRB-0009: `COZULDU`; owner Auth/Storage E2E, inline görsel, anonim türev erişimi, galeri koruma ve rollback canlıda doğrulandı.
- PRB-0011/0012/0016: `COZULDU`; PRB-0013 canlı uçuşta düzenleme kanıtı ve PRB-0014 stale PT409/eşzamanlı UI yarışı kanıtı alındı, ancak kontrollü ağ gecikmesi ve bağımsız publish HTTP sonucu açık sınır olarak kayda bağlı.
- Ayrıntılar ve korunmuş deneme geçmişi: `ASTRA_SORUN_KAYITLARI.md`.
