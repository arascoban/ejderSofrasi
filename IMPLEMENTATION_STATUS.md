# Uygulama ilerleme durumu

Son güncelleme: 16 Eylül 2026, Europe/Istanbul

## Yetkilendirilen kapsam

Kullanıcı Astra’nın teknik çözümlerinden sonra uygulamaya devam edilmesini istedi. A, B, C ve **D1 aşamalarının kabul ölçütleri tamamlandı**. Canlı yayın, Supabase kurulumu, yetkili içerik düzenleme ve nihai harita çizimi henüz yapılmadı.

## Aktif aşama

- D1 — Tam bağlantılı wiki ve bölüm sayfaları
- Durum: D1 kabul ölçütleri tamamlandı. `CIT-0006` dünya çapası sunum taslağı olarak kalır; owner incelemesi gelince aynı placement/entity ID üzerinde `reviewed` durumuna geçirilebilir. Sıradaki ana aşama D2 — Supabase tabanlı yetkili wiki yazımı, görseller ve revizyonlar.

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

## Sıradaki adım — D2 aşaması

1. Supabase Auth/PostgreSQL/Storage bağlantısını kur; sahip ve davetli editör rollerini RLS ile sınırla.
2. Türkçe Tiptap düzenleyicisinde taslak, önizleme, yayımlama, entity-ID bağlantıları ve revizyon çakışması kontrolünü tamamla.
3. Özel orijinal/yayımlanmış türev ayrımıyla görsel yükleme, Türkçe alternatif metin, kredi ve sıralanabilir galeri akışını kur.
4. Geri alma işlemini geçmişi silmeden yeni yayımlanmış revizyon olarak uygula; kanon yeniden içe aktarımının yazıları ve medyayı koruduğunu doğrula.

## Son doğrulamalar — 16 Eylül 2026, Europe/Istanbul

- A kabulü: Python QA `passed_with_editorial_warnings`; 403 varlık, 435 ilişki, 90 olay, 56 seyahat, 89 açık lore çatışması, `1290/1290` kaynak olgu kapsamı, 0 hata. `qa_report.json` değişmedi.
- Koruma: `rebuild_verification.json` içindeki 26 mevcut kanon/ID çıktısının tamamı aynı hash ile eşleşti. Yeni map sunum dosyaları bu kanon hash listesinden ayrıdır.
- Frontend toplu kontrolü: lint, TypeScript, test ve Webpack üretim derlemesi başarılı. 521/521 sayfa üretildi.
- Vitest: 3 dosyada 25/25 test başarılı; yardımcı veri şemaları, 85 konum kapsamı, 6 kara şekli, 25 bölüm, 90 olay, 56 seyahat, 86 lore kaydı ve ilişki yön etiketleri dahil.
- Tarayıcı: `/episodes/EP07`, `/lore/LOR-0029` ve `/wiki/col-sehri?from=map&entity=CIT-0006&era=1300` canlı açıldı; bağlantılar, kanıt ayrıntıları ve `/map?era=1300&entity=CIT-0006` dönüş adresi doğrulandı.
- Tarayıcı: `/map` ve `/map?entity=CIT-0006` canlı olarak açıldı; erişilebilir ağaçta 6 kara parçası, 1 işaret, 7/38/36/4 kapsam sayıları ve doğru şehir/krallık paneli doğrulandı. İn-app tarayıcı daha sonraki ekran görüntüsü denemesinde WebGL bağlamını kaybetti; üretim derlemesi ve ilk canlı açılış başarılıdır.
- Sunum metadata boyutu: çerçeve, özellik, varlık ve yayın JSON’ları toplam 5.321 bayt; gzip ile 1.445 bayt. 200 KB başlangıç hedefinin altında.
- Tarayıcı: `/map` gerçek WebGL Canvas ile açıldı; envanter/1300/1600 sayıları 6/1/3; temiz oturumda konsol uyarısı veya hatası yok. 360 px görünümde yatay taşma 0.
- Git: çalışma alanı henüz Git deposu değil.

## Değişen uygulama alanları

- `src/lib/data/auxiliary-schema.ts`, `src/lib/data/repository.ts`: yardımcı veri sözleşmeleri ve merkezi doğrulama.
- `data/map_frames.json`, `data/map_features.json`, `data/map_layout.json`, `data/map_location_coverage.json`, `data/map_assets.json`, `data/map_releases.json`, `data/map_presentation_schema.json`: ayrı, sürümlü sunum verisi ve tam konum kapsamı.
- `src/lib/presentation/*`: harita veri deposu, türler ve koordinat dönüşümleri.
- `src/components/map/interactive-map.tsx`, `src/app/map/page.tsx`, `src/app/globals.css`: R3F harita, kamera, dönem görünümü, erişilebilir liste ve responsive arayüz.
- `src/app/wiki/[slug]/page.tsx`, `src/app/episodes/*`, `src/app/lore/*`, `src/components/map-return-link.tsx`: tam wiki, bölüm/lore arşivleri, kanıt görünümü ve haritaya durum koruyarak dönüş.
- `src/lib/data/repository.ts`, `src/lib/domain/types.ts`, `src/lib/domain/labels.ts`, `src/lib/routing/entity.ts`: bölüm, olay, seyahat ve lore sorguları ile Türkçe ilişki yönleri ve rota yardımcıları.
- `tests/data/validation.test.ts`, `tests/domain/contracts.test.ts`: yardımcı şema, envanter ve dönüşüm regresyon testleri.
- `package.json`, `package-lock.json`: uyumlu React/R3F/Three sürümleri ve önceki Astra lint/build düzeltmeleri.
- `WIKI_VE_HARITA_PLANI.md`, `IMPLEMENTATION_PLAN.md`, `LUNA_UYGULAMA_REHBERI.md`: güncel owner birleştirmesine göre 4 ada/2 kıta ve 85 konum kabul sayıları.

## Teknik sorun durumu

- PRB-0001, PRB-0002, PRB-0003: `COZULDU`.
- PRB-0004: `COZULDU`; standart üretim derlemesi Webpack ile çalışır. Turbopack’in ortamda yerel port açma kısıtı sürer, `dev` komutu değiştirilmedi.
- ESLint 9 için npm destek sonu uyarısı var; eklentilerin ESLint 10 desteği sağlandığında bakım kapsamında yeniden değerlendir. Bu bir geçici uyumluluk kararıdır.
- Yeni açık Astra danışma kaydı yok. R3F/Three/React kararlı sürüm uyumu doğrudan peer bağımlılıkları ve temiz tarayıcı kontrolüyle çözüldü.
- Ayrıntılar ve korunmuş deneme geçmişi: `ASTRA_SORUN_KAYITLARI.md`.
