# Türkçe wiki ve güncellenebilir harita — kesinleştirilen kapsam

15 Eylül 2026. Bu belge [ana uygulama planının](/Users/arascoban/Desktop/Ejder/IMPLEMENTATION_PLAN.md) parçasıdır. Şu an yalnızca plan güncellenmiştir; uygulama, harita çizimi ve bulut kurulumu başlamamıştır. Mevcut kaynaklar ve `/data` değiştirilmez.

Uygulayıcı GPT-5.6 Luna / Max olacaktır. Okuma sırası ve küçük uygulama adımları [LUNA_UYGULAMA_REHBERI.md](/Users/arascoban/Desktop/Ejder/LUNA_UYGULAMA_REHBERI.md), sürekli çalışma kuralları [AGENTS.md](/Users/arascoban/Desktop/Ejder/AGENTS.md) içindedir. Teknik belirsizlikler, tamamlanamayan işler ve çözülemeyen problemler bağlamlarıyla [ASTRA_SORUN_KAYITLARI.md](/Users/arascoban/Desktop/Ejder/ASTRA_SORUN_KAYITLARI.md) dosyasına kaydedilir. Aynı problemin ikinci başarısız düzeltmesinden sonra üçüncü tahmini yama yapılmaz; kullanıcı kaydı manuel olarak Astra'ya iletir. Otomatik danışma yapılmaz; proje Luna'da kalır. Bu ekleme uygulamayı başlatmaz.

## 1. Ürün kararları

Site bütünüyle Türkçe olacak. Ziyaretçi haritada gezinebilecek, bir konumun panelini açabilecek ve bağlantılı wiki sayfalarına geçebilecek. Wiki, yapılandırılmış kaynak bilgilerinin yanında sonradan yazılabilen gerçek makaleler ve görsel galerileri içerecek. Her ada ve kıta, envanterdeki kendi kimliğine bağlı ayrı bir coğrafi şekille temsil edilecek. Seri devam ettikçe yeni içerik ve coğrafya mevcut bağlantıları bozmadan eklenecek.

| Konu | Uygulanacak karar |
| --- | --- |
| Dil | Arayüz, düzenleyici, giriş ekranı, hata metinleri, yardım, erişilebilirlik etiketleri ve tarih gösterimi Türkçe. |
| Yazım | Kanonik Türkçe adlar korunur; `tr-TR` sıralama ve arama, `I/İ/ı/i` ayrımı test edilir. |
| Teknoloji | Next.js App Router, TypeScript, Tailwind, R3F/Three.js ve drei CameraControls korunur. |
| Wiki düzenleyicisi | Tiptap tabanlı zengin metin; Türkçe araç çubuğu ve ID ile varlık bağlantıları. |
| Kalıcı içerik | Supabase PostgreSQL, Auth ve Storage; düzenleme aşaması D2'de devreye girer. |
| Okuma | Herkese açık; okumak veya haritayı kullanmak için hesap gerekmez. |
| Düzenleme | Planlama varsayımı: yalnızca sahibi ve davet ettiği editörler. Bu konuda sorulan tercihin yanıtı gelirse yetki kapsamı ona göre güncellenir. |
| Dönemler | Ziyaretçiye **Günümüz** ve **Gümüş Tanrısının 1673 yılı** olarak gösterilen iki bağlam aynı dünyaya aittir. Bilinmeyen dönem, ikisinde de var olma anlamına gelmez. Kaynak anahtarları geriye dönük uyumluluk için korunur. |

Teknik enum ve ID'ler İngilizce kalabilir; ziyaretçiye `PERSON` yerine “Kişi”, `UNKNOWN` yerine bağlama uygun Türkçe açıklama gösterilir. İlk sürümde çok dilli içerik yönetimi gerekmez; makale dil alanı `tr` olur.

## 2. Normal wiki yazma deneyimi

Yetkili kullanıcı sayfadaki “Düzenle” eylemiyle makale düzenleyicisine geçer. Başlık ve alt başlık, paragraf, kalın/italik, liste, alıntı, tablo, kaynak bağlantısı, görsel, açıklama ve galeri ekleyebilir. Varlık bağlantısı seçicisinden bir NPC, eşya, yer veya başka bir kayıt seçebilir. Bağlantı, ad metnine değil değişmeyen entity ID'sine kaydedilir; ad veya slug değişirse doğru sayfaya çözülmeye devam eder.

Akış: **Düzenle → Taslağı kaydet → Önizle → Yayımla.** Sunucuya otomatik taslak kaydı ve kaydetme durumu bulunur. Kullanıcı sonradan kaldığı yerden devam eder. Yayımlanan sürüm, yeni taslak hazırlanırken görünmeye devam eder. Tamamlanmamış taslak ziyaretçiye veya genel aramaya gönderilmez.

Sürüm geçmişi değişikliği yapan kişiyi, zamanı ve değişiklik notunu tutar. Önceki sürüme dönmek geçmişi silmez; eski içerikten yeni bir sürüm yayımlar. Eşzamanlı kayıtta beklenen revizyon numarası kontrol edilir; başka bir editörün değişikliği sessizce ezilmez. İlk sürüm için canlı ortak imleçler veya CRDT gerekmiyor.

Makale bölümleri genel/bağlamı belirtilmemiş, 1300 civarı veya 1600 civarı kapsamına sahip olabilir. Genel metin iki dönemde aynı olayın yaşandığı iddiasına dönüştürülmez. Okuyucu dönem filtresini değiştirince ilgili bölümler öne çıkar; diğer dönemler ve tarihsiz bilgiler erişilebilir kalır.

Sayfanın kaynak tabanlı bilgi kutusu, ilişkileri ve bölüm referansları ayrı kalır. Makaleye “X burada yaşar” yazmak otomatik olarak `LIVES_IN` ilişkisi üretmez. İsim, tür, akrabalık, dönem veya kaynak destekli olgu düzeltmesi gözden geçirilen kanon güncelleme akışına girer. Böylece normal wiki yazımı rahat olurken yapılandırılmış veri denetimsiz değişmez.

İlk düzenleyici mevcut varlıklara içerik ekler. Yeni bölümden gelen yeni varlıklar ID kayıt defteri üzerinden oluşturulur. Metinde geçen yeni bir ad otomatik olarak varlık açmaz veya benzer adla birleşmez. Herkese açık öneri sistemi tercih edilirse bu akışa bekleyen değişiklik ve editör onayı eklenir; ziyaretçi doğrudan yayımlayamaz.

Okuma ekranı makaleyi sunucuda üretir. Okuyucuya düzenleyici paketi yüklenmez. Tiptap'in JSON belgesi saklanabilir ve sunucuda HTML'e dönüştürülebilir; desteklenen düğümler, bağlantı protokolleri ve içerik sınırları ayrıca doğrulanır. Rastgele HTML/script kabul edilmez. [Tiptap içerik saklama ve çıktı](https://tiptap.dev/docs/guides/output-json-html).

## 3. Görseller ve galeriler

NPC portresi, eşya fotoğrafı/çizimi, konum manzarası, harita detayı ve diğer varlık türlerinin görselleri aynı medya sistemiyle eklenir. Bir görsel birden çok varlığa bağlanabilir. Sayfada kapak, küçük görsel, portre veya sıralanabilir galeri olarak kullanılabilir; makale içine de yerleştirilebilir.

Her görselde sabit medya ID'si, dosya anahtarı, içerik özeti/hash, boyutlar, MIME türü, Türkçe alternatif metin, açıklama, kaynak ve üretici/kullanım bilgisi tutulur. Dönem kapsamı ve “illüstrasyon”, “bölüm görüntüsü” gibi görsel niteliği ayrıca belirtilir. Yüklenen bir portre, tek başına karakterin kanonik görünüşü sayılmaz.

Orijinal dosya ve küçük/orta/büyük yayın türevleri ayrıdır. Liste küçük görseli, wiki uygun boyutu yükler; harita paneli tam boy fotoğraf indirmez. İlk sürümde doğrulanan JPEG, PNG, WebP ve AVIF kabul edilir; dosya boyutu ve piksel sınırları sunucuda uygulanır. SVG gibi aktif içerik taşıyabilen yüklemeler ilk kapsamda yoktur.

Taslaklar ve orijinaller özel depoda; ziyaretçiye sunulan türevler yayımlanmış varlığa bağlıdır. Özel dosyalar yetkili oturum veya süreli bağlantıyla gösterilir. Yayımlama önce gerekli dosyaları hazırlar, sonra makalenin yayımlanmış revizyonunu ve medya bağlantılarını atomik olarak etkinleştirir; dosya yükleme hatası yarım sayfa yayımlamamalıdır. Storage ile PostgreSQL tek işlem paylaşmadığından başarısız hazırlıklar yeniden denenebilir ve sahipsiz dosyalar sonradan temizlenebilir. [Supabase özel ve herkese açık depolar](https://supabase.com/docs/guides/storage/buckets/fundamentals).

Görseli değiştirmek yeni dosya/sürüm oluşturur; eski revizyonun dosyası üzerine yazılmaz. Bir sayfadan kaldırmak aynı görseli kullanan başka sayfaları bozmaz. Geçmiş revizyonlardan kullanılan dosyalar otomatik silinmez. Daha önce herkese açık yayımlanan URL'lerin kopyaları geri alınmış sayılmaz; özel taslaklar baştan özel tutulur.

## 4. Verinin sahibi ve kayıt sınırları

| Alan | Yetkili kaynak | Yeni bölüm içeri alınırken davranış |
| --- | --- | --- |
| Kanonik varlıklar, olgular, ilişkiler, dönem ve kaynak kanıtları | Mevcut `/data` ve gözden geçirilen üretim süreci | Yeni sürüm hazırlanır, doğrulanır ve farkları incelenir. |
| Wiki metni ve revizyonları | Supabase editoryal tabloları | Yeniden üretilmez, silinmez ve kaynak özetleriyle ezilmez. |
| Görsel metadata ve varlık bağlantıları | Supabase; dosyalar Storage | ID bağları korunur. |
| Harita şekilleri, yerleşimler ve sanat dosyası kayıtları | Ayrı şemalı, sürümlü sunum dosyaları | Yeni olgular gözden geçirme gerektirebilir; konumlar kendiliğinden taşınmaz. |
| Arama, sayfa DTO'ları ve Supabase kanon kopyası | Türetilmiş okuma verisi | Yetkili kaynaklardan yeniden oluşturulur. |

Bu ayrım React bileşenlerine lore yazma izni değildir. Bütün sayfalar veri katmanından okunur. Aynı alan iki yerde düzenlenmez. Kanon JSON'u kanon için tek kaynak olmaya devam eder; makaleler ayrı editoryal içeriktir. Supabase makaleleri düzenlenebilir bir kanon kopyası değildir.

Uygulama sırasında aşağıdaki kayıt sorumlulukları kurulacak; bu görevde tablo oluşturulmuyor:

| Kayıt | Temel sorumluluk |
| --- | --- |
| Kalıcı varlık kimliği | Mevcut text ID, etkin/kullanımdan kaldırılmış durum, gözden geçirilen yönlendirme; veri sürümünden bağımsız. |
| `wiki_articles` | Makale ID, entity ID, dil, yayımlanmış revizyon işaretçisi. |
| `wiki_revisions` | Makale ID, şema sürümü, blok JSON'u, dönem kapsamı, yazar, zaman, değişiklik notu, dayandığı kanon sürümü. |
| `media_assets` | Sabit medya ID, orijinal/türev dosya kayıtları ve hak/kaynak bilgileri. |
| Revizyonlu medya bağlantıları | Entity/makale revizyonu, medya ID, rol, sıra ve dönem; galeri değişiklikleri de geri alınabilir. |
| Editör yetkileri | Sahip/editör rolleri ve davet bilgisi. Kullanıcı kendi rolünü yükseltemez. |

Supabase Auth kimliği doğrular; sunucu yetki kontrolü ve PostgreSQL/Storage RLS yazma/okuma sınırlarını uygular. Yalnızca “Düzenle” düğmesini gizlemek yeterli değildir. Sahip editör davet edebilir; editör içerik düzenleyip yayımlayabilir fakat yetki dağıtamaz. Bu, yanıt bekleyen sahip+davetli editör varsayımına göredir. [Supabase satır düzeyinde güvenlik](https://supabase.com/docs/guides/database/postgres/row-level-security).

Kaynak olgu değişirse ona referans veren makale için inceleme bildirimi oluşturulur; kullanıcının yazısı otomatik yeniden yazılmaz. Makale/görsel yayımlamak, geri almak veya yayından kaldırmak sayfa ve arama önbelleğini yeniler; yeniden Vercel dağıtımı gerektirmez. Arama sürümü kanon sürümüyle editoryal yayın sürümünü birlikte belirtir.

## 5. Harita gerçekten konum envanterini izleyecek

Mevcut veritabanındaki ada ve kıta kayıtları:

| Kimlik | Ad | Kayıtlı dönem |
| --- | --- | --- |
| `ISL-0001` | Gizemler Adası | 1600 civarı |
| `ISL-0003` | Singlemalt Adası | Bilinmiyor |
| `ISL-0004` | Vhelin Adası | 1600 civarı |
| `ISL-0005` | Şalgam Adası | Bilinmiyor |
| `CON-0001` | Helvanar Kıtası / Helva Adası | 1300 civarı; 1600 için kayıp olduğuna ilişkin kayıt var |
| `CON-0002` | Masadan Kıtası | 1600 civarı |

Owner doğrulamasıyla `ISL-0002`, `CON-0001` kaydına yönlendirildi; Helva Adası ve Helvanar Kıtası aynı büyük kara parçasının adlarıdır. Güncel ilk coğrafi taslakta **4 ayrı ada şekli** ve iki kıta şekli hazırlanır. Sayılar kodda sabitlenmez: envanter ileride 10 ayrı ada içerirse kapsam denetimi 10 ayrı ada şekli ister. Dört şekle on işaret koymak şartı karşılamaz. Aynı adanın iki dönemdeki şekilleri ise iki ayrı kanonik ada sayılmaz.

Bu, altı kara parçasını iki tarihsel haritada birlikte var saymak değildir. Envanter taslağı bütün şekilleri dönem durumlarıyla gösterir. Tarihsiz kayıtlar “Dönemi doğrulanmamış sunum taslağı” kapsamında tutulur. Normal 1300/1600 görünümü yalnızca uygun kanıt ve gözden geçirilmiş sunum yerleşimleriyle çalışır.

Ada/kıta → şekil; şehir/köy/liman → ölçeğe uygun yerleşim işareti veya alan; bina/tapınak → yakınlaştırma düzeyine uygun işaret ya da yerel harita öğesi. Her bina dünya haritasında görünmek zorunda değildir. Bilinmeyen konum listede ve wiki'de bulunabilir. Güncel 85 yer kaydının her biri için çizilmiş, yerel haritada, konumu belirsiz veya dünya düzlemi dışında gibi açık bir kapsam durumu bulunur.

Sıra: **envanter → ayrı kimlikli şekiller → kaynak kısıtlarının denetimi → yerleşimler → atmosferik çizim/doku → etiket ve etkileşim cilası.** Harita görseli bu şekillere göre hazırlanır veya uyarlanır. Adlar resmin içine basılmaz. Başlangıçta deniz yüzeyi üzerinde bağımsız düz şekiller kullanılır; sonraki aşamada kaliteli doku ve seçili 3D detaylar eklenir.

Kaynakta olmayan kıyı biçimleri, ölçekler ve kesin uzaklıklar yaratıcı sunum kararıdır. Kanonik kuzey/güney, içinde/yanında gibi kısıtlar göz önünde bulundurulur; eksik krallık sınırları veya aile ilişkileri çizim ihtiyacı için uydurulmaz. Taslakta serbest yerleştirilen bir ada kesin kanonik koordinat kazanmaz.

## 6. Haritayı büyütürken mevcut içerik korunacak

Tek dev resme bağlı yüzdeler yerine sabit bir dünya koordinat alanı ve kara parçalarına ait yerel alanlar kullanılır. İşaretin konumu kendi alanındaki normalize `u,v` ile tutulur; dünya konumu dönüşümden hesaplanır. Görselin piksel çözünürlüğü veya deniz alanının büyümesi mevcut işaretlerin koordinat sözleşmesini değiştirmez.

Örneğin yeni bir ada eklendiğinde yeni şekil ve yerel alan açılır, gerekirse kamera sınırları genişler. Mevcut adaların ve şehirlerin konumları yeniden yüzdeye çevrilmez. Bir ada bilinçli olarak taşınırsa ona bağlı şehirler aynı dönüşümle birlikte taşınır. Bu görsel bağ, kaynakta olmayan coğrafi ebeveynlik iddiası oluşturmaz.

| Değişiklik | Koruma yöntemi |
| --- | --- |
| Daha yüksek çözünürlüklü aynı çizim | Aynı alan kaydı; yeni değişmez dosya/hash. |
| Kıyı çizgisinin değişmesi | Yeni geometri revizyonu, etkilenen işaret denetimi ve gerekirse açık konum taşıma kaydı. |
| Yeni ada/şehir | Yeni ID veya mevcut ID'ye yeni sunum öğesi; eski kayıtlar yerinde kalır. |
| Yeni dönem haritası | Aynı varlık ID'lerine bağlanan ayrı dönem kapsamı ve geometri revizyonları. |
| Ad/slug düzeltmesi | Sabit ID, gözden geçirilen eski URL yönlendirmesi. |
| Varlık birleşmesi/kullanımdan kaldırılması | Silmek yerine kimlik geçmişi/yönlendirme; makale ve görseller için incelenen taşıma planı. |
| Hatalı harita yayını | Önceki uyumlu yayın manifestine dönüş; eski dosyalar korunur. |

Harita yayın manifesti birlikte kullanılacak kanon sürümünü, alan/dönüşüm sürümlerini, geometriyi, konumları ve görsel dosyalarını belirtir. Dosyalar hazır ve doğrulamalar başarılı olmadan etkin sürüm değiştirilmez. Aynı oturumda yeni kıyı çizgisi üzerinde eski uyumsuz işaretler gösterilmez. Makale yayınları bundan bağımsız revizyonlanır; bir harita geri alımı yeni wiki yazılarını silmez. Yeni makalelerde geçen varlıklar kalıcı kimlik çözümleyicisinden bulunur; eski haritada yoksa wiki açılır ve harita konumu bulunmadığı açıklanır.

## 7. Devam eden seri için güncelleme akışı

1. Yeni bölüm kaynakları eklenir; eski kaynaklar korunur.
2. Kanon üretimi ayrı aday sürümde çalışır. ID kayıt defteri korunur, yeni kimlikler yalnızca kanıtla atanır.
3. Yeni/değişen varlıklar, olgular, ilişkiler, dönemler ve çelişkiler için fark raporu hazırlanır.
4. Harita kapsamı yeniden hesaplanır. Yeni ada için şekil ihtiyacı, değişen coğrafya için inceleme işi çıkar; wiki yazıları ve eski konumlar otomatik yeniden üretilmez.
5. Gerekli sunum değişiklikleri yapılır. Makalelerin dayandığı değişmiş kaynaklar editöre gösterilir.
6. Bağlantılar, dönem uyumu, yetkiler ve sürüm uyumu doğrulanır; aday yayın önizlenir.
7. Uyumlu sürüm etkinleştirilir. Önceki sürüm ve dosyalar geri dönüş için saklanır.

Yeni kaynak verisi, harita çizimi tamamlanmadan wiki'ye alınabilir; yeni konum “Haritada konumu henüz belirlenmedi” durumunda kalır. Yeni kanonla mevcut yerleşim sürümünün uyumu doğrulanır ve bu birleşimi belirten yeni yayın manifesti oluşturulur; uyumsuz eski yerleşimler devre dışı veya incelemede tutulur. Bu kontrollü ara durum, haritanın güncellenmiş ve tamamlanmış sayılması için yeterli değildir: eksik ada şekilleri kapsam raporunda açık kalır.

Yedekleme, kanon ve sunum JSON'larını, editoryal JSON dışa aktarımını, revizyon/bağlantı kayıtlarını ve **gerçek Storage dosyalarını** kapsar. Veritabanı yedeği tek başına fotoğraf dosyalarının yedeği sayılmaz. Dışa aktarımlar geri yükleme içindir; ikinci bir elle düzenlenen makale kaynağı değildir. Şema değişimleri önce eklemeli yapılır; eski revizyonları okuyacak geçiş veya dönüştürme yolu sağlanır.

## 8. Tamamlanma ve kabul denetimleri

| Aşama | Bu taleplere özel tamamlanma ölçütü |
| --- | --- |
| A | Türkçe temel arayüz, gerçek 411 ID ile veri katmanı; kanon/editoryal/sunum sınırları ve sürüm sözleşmeleri. Bulut anahtarı olmadan çalışır. |
| B | Envanter taslağında güncel 4 ayrı ada ve 2 ayrı kıta şekli; dönemleri bilinmeyenler açıkça işaretli. Alan sınırları büyütüldüğünde mevcut koordinatlar değişmez. |
| C | İşaret → doğru varlık paneli; kapsam raporu güncel 85 konumun tamamını açık bir durumda gösterir. |
| D1 | Bütün varlık türleri, kaynak bilgileri ve karşılıklı bağlantılarla okunabilir wiki sayfasına sahiptir. |
| D2 | Yetkili kullanıcı yazı ve fotoğraf ekler, taslak kaydeder, yayımlar, galeriyi düzenler ve eski revizyonu geri getirir. Yetkisiz doğrudan istekler reddedilir. |
| E | Türkçe adlar ve yayımlanan makale metinleri aranır; taslaklar bulunmaz; yayın değişiklikleri redeploy istemez. |
| F | Makale bölümü, görsel ve harita öğesinin dönem kapsamı birlikte uygulanır. Bilinmeyen dönem otomatik iki döneme atanmaz. |
| G | Seyahat/olay bağlantıları ID ve dönem anlamını korur; konum güncellemesi eski rotayı yeni bir kanon iddiasına dönüştürmez. |
| H | Son çizim envanter kapsamını karşılar; Türkçe metinler, galeriler ve düzenleyici mobilde kullanılabilir. |
| I | Yeni ada ve bölüm ekleme, yeniden içe aktarma, harita geri alma ve veri+dosya geri yükleme senaryoları başarıyla denenir. |

I aşamasındaki bağımsız test verisinde yeni bir ada eklenip mevcut sayfa URL'leri, ID bağlantıları, makale/görsel revizyonları ve değişmemesi gereken konumların korunduğu karşılaştırılır. Ardından önceki harita sürümüne dönülür ve aynı kontroller yinelenir. Deneme adası gerçek kanon verisine eklenmez.

Plan uygulamaya başlanabilecek ayrıntıdadır. İlk adım A'dır; bu belge hazırlanırken A başlatılmaz. Yanıtı beklenen editör kapsamı D2 yetkilerini etkiler, A'nın veri ve dil altyapısını engellemez. Hesap ve erişim gereksinimleri [SETUP_REQUIREMENTS.md](/Users/arascoban/Desktop/Ejder/SETUP_REQUIREMENTS.md) dosyasındadır.
