# Luna Max için uygulama rehberi

Bu belge ana planın yürütme rehberidir. Uygulayıcı: **GPT-5.6 Luna / Max**. Gerektiğinde kullanıcı tarafından manuel danışılan model: **GPT-6 Astra**. Luna otomatik danışma çağrısı yapmaz. Bu rehberin hazırlanması sırasında uygulama başlatılmamıştır. Kullanıcı uygulamayı başlatınca aşağıdaki sıra izlenir.

## 1. Belgeleri nasıl kullanacaksın?

| Belge | Sorumluluğu |
| --- | --- |
| `AGENTS.md` | Her uygulama görevinde geçerli çalışma kuralları. |
| Bu rehber | Adım sırası, kapsam sınırı, ilerleme ve sorun çözme. |
| `ASTRA_SORUN_KAYITLARI.md` | Çözülemeyen işler, problem bağlamı, denemeler ve kullanıcının Astra’ya kopyalayacağı paketler. |
| `WIKI_VE_HARITA_PLANI.md` | Türkçe ürün gereksinimleri; makaleler, medya, harita envanteri ve güncellemeler. |
| `IMPLEMENTATION_PLAN.md` | Teknik mimari ve her aşamanın ayrıntılı kabul ölçütleri. |
| `data/README.md` ve gerçek JSON | Veri sözleşmeleri, kaynak anlamları ve güncel kayıtlar. |
| `SETUP_REQUIREMENTS.md` | Servislerin ne zaman ve hangi erişimle bağlanacağı. |

İlk başlangıçta temel belgeleri oku; sonraki adımlarda aktif aşamanın ilgili bölümlerine dön. İngilizce teknik ana plan korunmuştur; onu uygularken kullanıcıya dönük metinleri İngilizce üretme. Bu Türkçe rehber ana planı sadeleştirir, özelliklerini azaltmaz.

Çelişki çözümü: güncel kullanıcı talimatı, eski planlama varsayımından üstündür. Ürün davranışı için Türkçe kapsam belgesini; teknik ayrıntı için ana planı; varlık/olgu/ID gerçeği için kaynak veriyi kullan. Geçmiş veri raporundaki “Supabase yalnızca okuma kopyası” ifadesi ithal kanonu anlatır; yeni wiki makaleleri Supabase'te ayrı editoryal kaynaktır. Çözülemeyen teknik çelişkiyi manuel Astra danışması için ayrı sorun dosyasına kaydet; kullanıcı adına yeni bir ürün veya kanon kararı verme.

Mevcut plan A–I arasında seçenek karşılaştırmaları da içerir. Seçilen başlangıç yığını Next.js + TypeScript + Tailwind + R3F + drei CameraControls'tür. Leaflet/MapLibre/OpenSeadragon karşılaştırması bunları da kurma talimatı değildir. D2'de Tiptap + Supabase gerekir. İsteğe bağlı 3D yapılar, ileri kümeleme ve ağ grafiği ilk aşamanın kapsamı değildir.

## 2. Her adımın çalışma döngüsü

1. Kullanıcının hangi aşamayı yetkilendirdiğini, mevcut dosyaları ve varsa ilerleme kaydını kontrol et.
2. O adımın beklenen davranışını ve ilgili kabul ölçütünü tek paragrafta belirle.
3. Yalnızca gerekli dosyaları/veri örneklerini oku. Gerçek şemayı örnek JSON'a benzeterek tahmin etme.
4. Tek sorumluluğu olan küçük bir değişiklik uygula. Sonraki aşamaların tamamını aynı değişikliğe ekleme.
5. İlgili kontrolü çalıştır; beklenen davranışı gerçekten doğrula. Çalıştırılmayan teste “geçti” deme.
6. Başarılıysa sonucu kaydet ve aynı yetkilendirilmiş aşamanın sonraki adımına geç. Başarısızsa bölüm 5'teki protokolü uygula.
7. Aşama bittiğinde kabul ölçütlerini, çalışan sonucu ve varsa kalan sınırı raporla. Kullanıcı yalnızca o aşamayı istemişse burada dur; daha geniş yetki zaten verilmişse tekrar izin isteme.

Bir hata tüm projenin başarısızlığı değildir. Çalışan dosyaları ve kullanıcının değişikliklerini koru. `reset --hard`, toplu silme, sıfırdan scaffold oluşturma veya bağımlılıkların tamamını değiştirme sorun çözme yöntemi değildir. Gerekirse yalnızca kendi hatalı yamanı, mevcut değişiklikleri inceleyerek geri al.

## 3. İlk uygulama: A aşamasını küçük adımlara böl

| Adım | Yapılacak iş | Tamamlanma kanıtı |
| --- | --- | --- |
| A1 | Çalışma alanını ve mevcut dosyaları incele; uygun Node/Python sürümlerini doğrula; kaynak/veri başlangıç durumunu kaydet. | Nelerin mevcut olduğu ve korunacağı belli; uygulama varsa üzerine ikinci uygulama oluşturulmamış. |
| A2 | Proje kökünde Next.js/TypeScript/Tailwind temelini kur; uyumlu sürümleri seç ve lockfile oluştur. | Uygulama çalışıyor; kökteki veri, script ve belgeler korunuyor. |
| A3 | Türkçe kök düzen, temel gezinme ve veri erişim katmanı kur. | `lang="tr"`; UI Türkçe; bileşenler bağımsız JSON parse etmiyor. |
| A4 | Şema doğrulama, ID/slug/fact/ilişki indeksleri ve dönem sonuç tiplerini kur. | Gerçek 411 kayıt çözümleniyor; bozuk referans/şema kontrollü hata veriyor. Sayılar ileride envanterden okunuyor. |
| A5 | Temel varlık dizini, kimlik yönlendirmesi ve henüz harita olmadığına dair kullanılabilir sayfa oluştur. | Çöl Şehri, Akmer, Arifler Okulu/kampüs ve dönem bilgisi olmayan Helva kayıtlarına ulaşılabiliyor. |
| A6 | Kanon/editoryal/sunum arayüz sınırlarını tanımla; ilgili kontrolleri çalıştır ve sonucu kaydet. | A'nın ana plandaki kabul ölçütleri karşılanıyor; bulut anahtarı istemeden temel uygulama çalışıyor. |

A'da R3F sahnesini, fotoğraf yüklemeyi, tam wiki düzenleyicisini veya Supabase şemasını tamamlamaya çalışma. Gelecek aşamaya ait arayüz sözleşmesi tanımlamak, o özelliği tamamlandı saymak değildir. Çalışmayan düğme veya sahte kalıcılıkla kabul ölçütünü geçirme.

Python veri araçları için `data/README.md` Python 3.10+ ister. Önce ortamı doğrula. `validate_database.py` yalnızca ekrana sonuç basmaz; `data/qa_report.json` dosyasını da yeniden yazar. Beklenen rapor değişikliğini incele; frontend başlangıcında veri üreticisini gereksiz yere çalıştırma. Yeni sunum dosyaları gerektiğinde builder'ın bunları korumasını açıkça doğrula.

## 4. Aşama sınırları

| Aşama | Hedef | Sonraya bırakılacak iş |
| --- | --- | --- |
| A | Türkçe temel uygulama ve doğru veri katmanı | Harita sahnesi, tam editör, bulut kurulumu |
| B | Kamera, sabit koordinat alanları, envantere bağlı ada/kıta şekilleri | Nihai görsel cila |
| C | İşaretler, etiketler, seçim ve bilgi paneli | Bütün wiki yazım sistemi |
| D1 | Bütün türlerin okunabilir wiki sayfaları, bölüm ve kaynak bağlantıları | İçerik yazma ve yükleme |
| D2 | Yetkili wiki yazımı, fotoğraflar, kalıcı taslak/yayın ve revizyonlar | Herkese açık öneri sistemi, kullanıcı istemedikçe |
| E | Türkçe arama, yayımlanan makale metni ve filtreler | Ölçüm gerektirmedikçe harici arama servisi |
| F | Dönemler arasında tutarlı harita, makale ve medya davranışı | Kanıtsız tarih simülasyonu |
| G | Olaylar ve kanıtlı seyahat gösterimi | Bilinmeyen rotaları uydurmak |
| H | Özgün görsel kalite, mobil kullanım ve varlık optimizasyonu | Gereksiz efekt/3D yükü |
| I | Yayın, güvenlik, veri güncelleme, yedek ve geri dönüş doğrulaması | Kullanıcı yetkisi olmadan canlı yayın |

Güncel owner doğrulamasından sonra `ISL-0002 → CON-0001` yönlendirmesiyle envanter 4 ada/2 kıtadır; Helva Adası ve Helvanar Kıtası aynı büyük kara parçasıdır. Bunların hepsini iki dönemde birlikte mevcut sayma. Güncel 85 konumun her birinin bir kapsam durumu olmalı; kaynaksız koordinat üretmek gerekmez. “Hazır harita resmi yok” B'yi durdurmaz: ilk ayrı şekiller sunum taslağı olarak hazırlanır.

## 5. Belirsizlik ve iki başarısız deneme kuralı

**Teknik belirsizlik:** İlgili dosyayı ve plan kuralını okumana rağmen hangi yaklaşımın doğru olduğunu gerekçelendiremiyorsan tahminle mimari kurma. O soruyu hemen `ASTRA_SORUN_KAYITLARI.md` dosyasına, kullanıcının manuel danışmasına hazır biçimde kaydet. Basit bir dosya araması veya dokümantasyon okumasını “başarısız deneme” sayma.

**Aynı problem:** Aynı beklenen davranışın aynı temel engel yüzünden sağlanamaması. Başka dosyada görülmesi, komut adının değişmesi veya bağlamın daralması sayacı sıfırlamaz. İlk hata gözlemi, henüz bir düzeltme denemesi değildir.

**Bir düzeltme denemesi:** Kanıta dayalı bir hipotez → sınırlı değişiklik veya farklı teşhis yaklaşımı → ilgili komut/test ile sonucu kontrol etme. İlk başarısız düzeltmede ayrı sorun dosyasında bir kayıt aç ve sonucu kaydet. Sadece aynı komutu hiçbir şeyi değiştirmeden yeniden çalıştırmak yeni çözüm değildir.

| Durum | Yapılacak işlem |
| --- | --- |
| İlk düzeltme başarısız | Gerçek sonucu kaydet; yeni kanıt varsa farklı, gerekçeli ikinci yaklaşımı dene. |
| İlk başarısızlıktan sonra ne yapacağını bilmiyorsun | İkinci denemeyi doldurmak için tahmin üretme; bağlamı kaydedip `MANUEL_DANISMA_BEKLIYOR` durumuna geçir. |
| İkinci düzeltme de başarısız | Üçüncü tahmini yamayı yapma; kaydı ve kopyalanabilir paketi tamamlayıp kullanıcıya bildir. |
| Açıkça eksik erişim/anahtar veya kullanıcı tercihi | Sorunu `GIRDI_BEKLIYOR` olarak kaydet ve eksik girdiyi kullanıcıdan iste; Astra’dan yetki, parola veya kanon uydurmasını bekleme. |

Danışma bir proje devri değildir. Uygulayıcı Luna'dır. Astra yalnızca dar sorunun bağımsız incelemesini yapar. Beklerken örneğin etkilenmeyen testleri incelemek veya yeniden üretim örneğini hazırlamak mümkündür; arızalı alanda kör düzeltmelere devam edilmez.

## 6. Ayrı sorun kaydı ve manuel Astra danışması

Kullanıcının son tercihi, problemleri kendisinin manuel olarak Astra'ya sormasıdır. Önceki otomatik alt ajan çağırma akışı kaldırılmıştır. Luna başka bir model çağırmaz, mesaj göndermez ve kendi modelini değiştirmez.

Tek yetkili teknik sorun dosyası `ASTRA_SORUN_KAYITLARI.md` olur. Bu dosyada her çözülemeyen iş için kalıcı problem ID'si, durum, aktif aşama, gerekli bağlam, tam ilgili hata, sürümler, yeniden üretme adımları, ilgili kod/şema alıntıları, denemeler ve sonuçlar tutulur. Tamamlanamayan erişim veya ürün girdisine bağlı işler de nedenleriyle kaydedilir. Kaynak lore belirsizlikleri buraya topluca kopyalanmaz.

Dosyadaki şablonu kullan ve her kaydın “Astra'ya kopyalanacak paket” bölümünü kendi başına anlaşılır biçimde doldur. Kullanıcının başka bir oturumda yalnızca bu bölümü paylaşması yeterli bağlamı sağlamalıdır. Salt dosya yolu veya “önceki hatanın aynısı” gibi ifadeler yeterli değildir. Tüm proje yerine gerekli küçük alıntıları ekle; ilave dosya şartsa hangisinin paylaşılacağını belirt. Gizli erişim bilgilerini çıkar.

İlk başarısız düzeltmede `ACIK` kayıt oluştur; ikinci başarısız düzeltmede `MANUEL_DANISMA_BEKLIYOR` durumuna geçir. Belirsizlikte iki denemeyi bekleme. Aynı problemin geçmişini koru, mükerrer kayıt açma. Kullanıcıya kısa problem özeti ve dosya bağlantısı ver; son raporda tamamlanamayan kabul ölçütünü açıkça göster.

Kullanıcı Astra yanıtını getirdiğinde ilgili problem ID'sine kaydet. Öneriyi kanon ve mimari kurallarıyla karşılaştır; uygun en küçük düzeltmeyi uygula ve ilgili kontrolü çalıştır. Sadece gerçek doğrulama başarılıysa `COZULDU` durumuna geçir. Çözülen kaydı silme. Öneri de başarısızsa yeni kanıtı ve güncel kopyalama paketini aynı kayda ekle; kullanıcı tekrar manuel danışabilir.

Yanıt beklenirken yalnızca bağımsız, yetkilendirilmiş işler sürdürülür. Arızalı alanda üçüncü tahmini yamayı yapma, engellenen şartı atlama veya bütün projeyi yeniden başlatma. Kullanıcı yanıtı henüz gelmediyse gelmiş gibi ilerleme.

## 7. İlerleme ve devamlılık

İlk uygulama başladığında kökte `IMPLEMENTATION_STATUS.md` oluştur; şimdi boş bir tamamlanma kaydı üretme. Her anlamlı adımda kısa biçimde güncelle:

- Kullanıcının yetkilendirdiği kapsam; aktif aşama ve adım.
- Tamamlanan işler, değişen dosyalar, gerçekten çalıştırılan kontrol ve sonuçları.
- Sıradaki somut adım ve varsa engel.
- Ayrı sorun dosyasındaki açık problem ID’lerine bağlantılar; ayrıntı ve denemeleri burada kopyalama.
- Kullanıcının getirdiği Astra yanıtı uygulandıysa ilgili problem kaydına bağlantı ve kısa ilerleme sonucu.

Yeni oturumda veya bağlam daralınca ilerleme kaydı, ayrı sorun dosyasındaki açık problemler ve gerçek dosyalar birlikte okunur. Aşama yeniden başlatılmaz; aynı problem için iki deneme sayacı unutulmaz. Kullanıcı manuel danışma için ilgili problem paketini kullanır. Bir kabul ölçütü ancak gerçek kontrolü başarılıysa tamamlandı işaretlenir.

## 8. Luna'ya verilecek başlangıç mesajı

```text
Bu çalışma alanında GPT-5.6 Luna, Max ile uygulamayı yürüt.
Önce AGENTS.md ve LUNA_UYGULAMA_REHBERI.md dosyalarını, ardından
belirtilen ürün planı, teknik plan ve veri sözleşmelerini oku.
Mevcut dosyaları incele. Varsa IMPLEMENTATION_STATUS.md'den devam et.
İlk uygulamaysa yalnızca A aşamasını tamamla ve kabul sonuçlarını göster.
Teknik belirsizlikte veya aynı problemin ikinci başarısız düzeltmesinden
sonra problemi bağlamı ve denemeleriyle ASTRA_SORUN_KAYITLARI.md
dosyasına kaydet. Ben manuel olarak Astra’ya soracağım; otomatik
danışma yapma. Yalnızca bağımsız, yetkilendirilmiş işleri sürdür.
Kaynakları, sabit ID'leri ve çalışan değişiklikleri koru.
```

Bu başlangıç mesajı kullanıcı tarafından uygulama başlatılırken verilebilir; burada bulunması tek başına başlama talimatı değildir. Model/Max seçimini Codex arayüzündeki gerçek ayarla doğrula. Model kimlikleri için [OpenAI Luna belgesi](https://developers.openai.com/api/docs/models/gpt-5.6-luna); danışma davranışının kapsamını açıkça tanımlama yaklaşımı için [OpenAI model rehberi](https://developers.openai.com/api/docs/guides/latest-model). Bu proje protokolü kullanıcının seçtiği çalışma biçimidir; bir başarı garantisi veya otomatik model geçişi değildir.
