# Astra → Luna: varlık makaleleri için ara aşama M

22 Eylül 2026. Kullanıcının son isteği: mevcut dünya varlıklarının her biri için olaylardan, eşyalardan, mekânlardan ve diğer ilişkilerden yararlanan, Türkçe ve kaynaklara dayalı wiki makaleleri hazırlamak. Bu turda plan istendi; toplu üretim, veritabanına aktarım ve yayın yapılmadı. Luna'ya uygulama yetkisi geldiğinde M1'den başla. G–I kapsamı korunur; hepsini bu ara aşamayla aynı anda uygulama.

## Ürün ve kapsam

Makale varlığın mevcut `/wiki/[slug]` sayfasında, mevcut Tiptap/Supabase editoryal alanında okunacak ve sonradan normal editörle değiştirilebilecek. Yeni makale sitesi veya ayrı arama sayfası yapma. Tek arama yüzeyi Dünya Arşivi `/wiki`; eski `/search` bağlantıları sorgu ve filtreleriyle buraya yönlenir.

Her **etkin** varlık kapsamda: kişiler, aileler, örgütler, yerler, tanrılar, ejderhalar, yaratıklar, bitkiler, gemiler, eşyalar, olaylar ve dönemler. Şu an 403 etkin kayıt var; sayıyı koda sabitleme, gerçek registry'den türet. Emekli kimliklere ikinci makale üretme; mevcut ID yönlendirmeleri korunsun. Veri azsa kısa ve dürüst bir başlangıç maddesi yeterli. Her varlığa uzun biyografi uydurma.

## Değiştirilmeyecek sınırlar

- Canon/WorldData, ID registry ve üretilmiş kanon JSON'a makale metni yazma. Makale üretimi kanon üretim betiğini çalıştırmaz.
- Önceden elle yazılan taslak, yayımlanmış revizyon ve görseller otomatik olarak ezilmez. Kullanıcının sonraki düzenlemeleri yeni bölüm ithalinde korunur.
- Güncel kullanıcı doğrulamaları ve açık belirsizlikler kaynak özeti karşısında korunur. `bilinmiyor` bir boşluğu tahminle doldurma izni değildir. Kullanıcının doğruladığı belirsizlik makalede açık kalır.
- Ad benzerliğinden akrabalık/kimlik; aynı bölümden karşılaşma; anılmadan ziyaret; eşya adından güncel sahiplik çıkarma. Grubun eylemini otomatik olarak her üyeye yazma.
- Günümüz ve **Gümüş Tanrısının 1673 yılı** aynı dünyanın farklı dönemleridir. EP07 sonundaki geçişi koru. 300–400 yıl ifadesinden kesin Günümüz yılı hesaplama. Eski DB anahtarları saklanır; yeni anlatıda merkezi dönem etiketleri kullanılır. Kaynak alıntısını sessizce yeniden yazma.
- `revealed`, `historical`, `planned`, rüya, kehanet ve gerçekten gerçekleşen olay ayrılır. Açıklanma bölümü, olayın tarihi değildir.
- Harita sunum geometrisi, yaratıcı koordinat ve görsel taslağı makaleye kanıt olamaz. Görsel yoksa görsel gerekçesiyle çalışmayı durdurma.

## M1 — kanıt paketleri ve kapsam raporu

Önce mevcut `src/lib/domain/types.ts`, `src/lib/data/repository.ts`, `data/README.md` ve gerçek JSON örneklerini oku. README'deki tarihsel sayılar veya eski varsayımlar güncel kayıtların önüne geçmez. Uygun saf indeksleme yardımcılarını kullan; sunucuya özel modülü doğrudan CLI'ye taşımaya çalışma.

Her etkin ID için `editorial_work/evidence/<ENTITY-ID>.json` hazırla. Bu dizin `/data` ve `public/` dışında, incelenebilir hazırlık alanıdır; uygulamada kendiliğinden yayımlanmaz. Her pakette:

1. ID, kanonik ad, tür, diğer adlar, dönem kapsamı ve kaynak sürümü/hash'i.
2. Varlığın olguları ve varsa ortak `fact_ids`; assertion bazında bölüm, dönem, confidence ve kanıt referansları.
3. Gelen/giden ilişkiler; subject/object yönü, dönem, bölüm, belirsizlikleriyle birlikte. Bağlı varlıkların yalnızca bu konuya gerekli bilgileri.
4. `timeline.json` içindeki katılımcı/konum/ilgili varlık ID eşleşmeleri; `summary_fact_id` gerçek olguya çözülür. Kaynakta doğrudan ilişki yoksa yalnızca adın metinde geçmesi güçlü kanıt sayılmaz.
5. `travel.json`: gerçek gezgin, başlangıç, varış, ara durak, ayrı grup kolları, bilinmeyen uçlar ve zamansal geçişler. Başka bir gezginin rotasını aktarma.
6. İlgili lore, episode bağlantıları, map_canon coğrafi kısıtları ve world_states. Söylenceyi anlatıcısının iddiası olarak koru.
7. İlgili çatışmalar, çözüm kararları, owner doğrulamaları ve kaynak envanterindeki JSON pointer/satır referansları. Çözülmüş kayıtların geçmişini silme.

`coverage.json` etkin ID listesini ve her varlık için kanıt zenginliğini tutar: yeterli anlatı / kısa madde / kaynak incelemesi gerekli. Kimliği kesin olmayan veya birbirine aykırı kayıtları listele; M1 bunları otomatik birleştirmez. Bir çelişki yalnızca ilgili cümleyi engelleyebilir, bütün makaleyi değil.

Kabul: tüm etkin ID'lerin tam bir paketi vardır; her kanıt ve bağlantı gerçek kayda çözülür; emekli ID ikinci makaleye dönüşmez; deterministik çıktı aynı kaynaktan aynı hash'i verir. Kanon dosyalarının diff'i boş kalır.

## M2 — altı pilot makale ve yazım sözleşmesi

Kanıt paketlerini hazırladıktan sonra pilotları seç: Akmer, Kalender, Yaz Helvası Krallığı, Helvacıoğlu Baltası, Arifler Okulu ve yalnızca adı doğrulanmış az verili bir tanrı. İlgili ID'leri registry'den çöz; ada bakıp benzer başka kayıt seçme. Pilotlar kişi/eşya/yer/örgüt/az verili kayıt ayrımını sınar.

Akıcı, tarafsız Türkçe yaz. Olgu listesini aynen art arda yapıştırma; aynı bilgiyi tek anlatıda birleştir, farklı olayları koru. Karakterlerin şakası, aldatmacası veya inancı anlatıcının nesnel hükmüne dönüşmesin. Yazarın yeni diyaloglarını, niyetini, görünüşünü ve duygu yorumunu ekleme.

İçerik varsa kullanılacak bölümler:

| Tür | Önerilen anlatı |
| --- | --- |
| Kişi | Kısa tanıtım; bilinen geçmiş; bölüm sırasıyla önemli olaylar; kişiler/örgütlerle ilişkiler; önemli eşyalar ve değişen durum; son bilinen durum. |
| Yer | Konum ve siyasi bağlam; gerçekten doğrulanmış alt yerler; toplum/ekonomi/mimari; burada yaşanan olaylar; dönem değişimleri. |
| Eşya | Tanım; kanıtlı özellikler; keşif, dönüşüm ve el değiştirme öyküsü; son bilinen konum/sahip ve belirsizlik. |
| Örgüt/aile | Amaç ve rol; kanıtlı üyeler/liderler; diğer yapılarla ilişkiler; önemli olaylar. |
| Tanrı/ejderha/yaratık | Kimliği ve türü; kaynakların ona atfettiği özellikler; inanç/anlatılar; karşılaşmalar; açıklanmayan noktalar. |
| Olay/dönem | Ne olduğu; katılımcılar; yer ve zamanın bilinen kapsamı; neden/sonuç yalnızca kanıtlıysa; hikâyede ne zaman öğrenildiği. |

Başlığı sayfa zaten verir; Tiptap içinde ikinci H1 üretme. Gereksiz boş başlıkları çıkar. Az verili maddede doğrulanmış tanım + bilginin sınırı yeterlidir; uzunluk kotası koyma. "Son bilinen" iddiasının kapsadığı bölüm sürümü belirtilsin.

Her taslağın yanında cümle veya paragraf düzeyinde **kanıt defteri** hazırla: blok yolu (`/content/3` gibi), iddia özeti, kaynak entity/fact/relation/event/travel/lore ID'leri, gerçek assertion referansı, dönem, kesinlik ve çatışma kararı. Sadece dosya adı ya da yalnızca EP etiketi yeterli kanıt değildir. Birleştirilmiş iddia birden çok kaynağa bağlanabilir. Her olgusal cümle desteklenmeli; kayıtlı doğrulanmış belirsizlik için de kaynak gösterilmeli.

## M3 — mevcut editörle uyumlu, tekrar çalıştırılabilir hazırlık

Çıktı: `editorial_work/drafts/<ENTITY-ID>.json` ve `editorial_work/manifest.json`. Hazırlık zarfında `entity_id`, `language: tr`, `base_core_release_id`, `source_hash`, `document_hash`, `document`, `period`, `claims`, `review_status` ve mevcut makale/taslak durumu yer alsın. Teknik metadata'yı Tiptap belgesine desteklenmeyen düğüm olarak gömme.

Mevcut şemaya uy:

- `src/lib/editorial/document.ts` doğrulayıcısı: başlık 2–4, en fazla 2.000 düğüm, 100.000 karakter, derinlik 20. Sınırı aşan makaleyi sessizce kırpma.
- İç bağlantı mevcut `link` mark'ı: `attrs.entityId` ve `attrs.href: /entity/<ID>`. Yeni bir hayali `entityLink` node'u yaratma. Bağlantılar aktif ID'ye veya mevcut redirect'e çözülmeli.
- Bölüm kaynakları düz EP etiketiyle kanıt defterinde tutulabilir. Tıklanabilir bölüm kaynakları gerekiyorsa mevcut doğrulayıcının izin verdiği doğrulanmış mutlak site URL'sini kullan veya iç rota desteğini ayrı testli adımla genişlet. Güvensiz href kontrolünü gevşetme.
- İlk pilotlar metin olabilir. Görsellerde mevcut mediaId, alt metin, kaynak/kredi/haklar ve dönem kuralları geçerli. Üretilmiş illüstrasyon bir kanon kanıtı değildir.
- Mevcut revizyonda tek `period` var; blok bazlı dönem alanı henüz yok. Tek dönemin makalesine o anahtarı ver. Çok dönemli makalede `period: null`, açık dönem başlıkları ve genel anlatı kullan; null'ı iki dönemde de geçerli kabul etme. Gerçek blok filtresi istenirse ayrı migration/renderer işi olarak kaydet.

İlk aktarma yolu mevcut yetkili editör ve taslak RPC'leri olmalı. CLI aktarım aracı gerekirse önce yalnızca dry-run/diff üret; varsayılan olarak yazma/yayın yapma. Sadece onaylı, boş veya kendi ürettiği değişmemiş taslağı hedefle. Dolu insan makalesini fark önerisi olarak bırak. Her yazıda güncel draft ID/lock_version/based_on_revision kontrolü zorunlu; PT409 sonrası kör retry yok. Service key'i dosyalara, loglara veya istemciye koyma. Bootstrap/PT409 migration'ı tekrar çalıştırma.

İçeriği üretme, taslağa aktarma ve yayımlama ayrı işlemlerdir. Her biri tamamlanan entity ID ve hash üzerinden devam edebilir; aynı sürüm tekrar yazılmaz. Yayın için kullanıcının o içerik grubuna verdiği yetkiyi takip et; bu plan kendi başına tüm makaleleri yayımlama izni değildir.

## M4 — inceleme, 10'lu gruplar ve kabul

Altı pilotu kaynak paketiyle birlikte karşılaştır. Özellikle sahibi/konumu zamanla değişen eşya, açıklanmamış akıbet, aynı lakabın farklı kişilerde kullanımı ve yer/krallık ayrımını elle incele. Veri hatası fark edilirse makale içinde yeni kanon üretme; veri incelemesine ayrı kayıt bırak. Pilot formatı doğrulanınca kalanları 10'lu gruplarda üret; önce ana karakterler ve ana yerler, sonra bağlantılı eşya/örgütler, en son az verili maddeler. Her grupta manifest ve kaldığın ID'yi güncelle.

Kabul kontrolleri:

- Belge doğrulaması, bütün ID/kanıt referansları ve her olgusal cümlenin destek kaydı programatik olarak kontrol edilir. Anlamsal doğruluk yalnızca ID varlığıyla kanıtlanmış sayılmaz; metin ile kaynak ayrıca incelenir.
- Taslak kaydet → yeniden aç → aynı içerik ve ID bağlantısı; yayımlanmış eski içerik yeni taslak yüzünden değişmez. Onaylı pilot yayını varsa public okuma ve geri alma denenir; kalanlara otomatik yayın yayılmaz.
- Karma dönemli makale ve farklı dönemli **inline görsel** birlikte sınanır. Mevcut WikiArticle görünür medya filtresi, belge içinde kalan image node'unu medya listesinden çıkarırsa renderer hata verebilir; toplu yayından önce bu durumu anlamlı regresyon testiyle doğrula ve gerekirse düzelt. İlgisiz medya veya bütün makale sessizce kaybolmasın.
- Dünya Arşivi yalnızca etkin yayımlanmış revizyonu arar; taslak/eski revizyonlar sızmaz. Yayın ve rollback sonrası arama doğrulanır. Yüzlerce makalede tüm metni her tuşta çekme; mevcut submit davranışını koru, büyüme sınırını ölç ve sayfalama/indeks ihtiyacını ayrıca değerlendir.
- Yeni bölüm geldiğinde yalnızca kanıtı değişen taslaklar için fark çıkar. İnsan düzenlemesini koruma ve ikinci çalıştırmada hiçbir kaydı çoğaltmama testi geçer.
- Son rapor: kapsam/üretilen/incelenen/aktarılmış/yayımlanmış/insan içeriği nedeniyle atlanan/kısa madde sayıları ayrı; çözülemeyen kimlikler ve nedenleri açık. "403 dosya var" tek başına içerik kabulü değildir.

Teknik sorunlar `ASTRA_SORUN_KAYITLARI.md` içinde kalıcı PRB ile; lore belirsizlikleri mevcut veri inceleme akışında tutulur. İlk başarısız düzeltme kaydedilir, ikinci başarısız düzeltmeden sonra manuel danışma beklenir. Otomatik alt ajan veya model değişikliği yapma.

## M sonrası

G: zaman çizelgesi ve kanıtlı seyahat; H: görsel bütünlük, kullanılabilirlik, mobil/erişilebilirlik ve performans; I: son yayın ve işletim kabulleri. Makale çalışması bu aşamaları veya eksik dönem harita sanatını tamamlanmış yapmaz. D2 geçmiş kabulünü ve ertelenen CPU PRB-0017 kararını tekrar açma.
