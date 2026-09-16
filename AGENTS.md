# Ejder — uygulama ajanı talimatları

Bu dosya proje içindeki uygulama çalışmalarına yön verir. Kullanıcının güncel isteği ve çalışma ortamının üst düzey talimatları önceliklidir. Planı okumak tek başına uygulamaya başlama izni değildir.

## Önce oku

1. `LUNA_UYGULAMA_REHBERI.md`: yürütme sırası, sorun çözme ve Astra danışma protokolü.
2. `WIKI_VE_HARITA_PLANI.md`: Türkçe ürün, wiki yazımı, görseller ve korunarak güncellenen harita şartları.
3. `IMPLEMENTATION_PLAN.md`: mimari, arayüz sözleşmeleri ve aşama kabul ölçütleri.
4. `data/README.md`: gerçek veri şeması ve kanıt/dönem anlamları.

Varsa `IMPLEMENTATION_STATUS.md` dosyasını ve `ASTRA_SORUN_KAYITLARI.md` içindeki açık kayıtları okuyarak kaldığın adımdan devam et. Yoksa aşama tamamlanmış varsayma; mevcut dosyaları kontrol et. `SETUP_REQUIREMENTS.md` yalnızca servis bağlantısı gerektiğinde okunur.

## Çalışma kuralları

- Ana uygulayıcı kullanıcının seçtiği **GPT-5.6 Luna, Max** ayarıdır. Modeli kendiliğinden değiştirme; belge model seçicisini otomatik ayarlamaz.
- Kullanıcının yetkilendirdiği aşamayı küçük, doğrulanabilir adımlarla tamamla. Sıra A → B → C → D1 → D2 → E → F → G → H → I. Yetki varsa sonraki aşamaya geç; zaten verilmiş izni tekrar isteme.
- Public site ve editör Türkçe olacak. Teknik ID ve enum'lar kullanıcıya çevrilmiş etiketlerle gösterilir.
- `Canon/`, `WorldData/` ve mevcut ID kayıt defterini UI hatasını gidermek için değiştirme. Kanon/kimlik değişikliği ayrı, kanıta dayalı veri güncellemesidir.
- Kanon JSON, editoryal içerik ve harita sunum verisini ayrı tut. `/data` kayıtlarını bileşen içine kopyalama. Makale/görseller kaynak içe aktarma sırasında ezilmez.
- Bilinmeyen dönemi iki döneme atama; anılma, ziyaret ve fiziksel bulunmayı karıştırma. Benzer adları otomatik birleştirme.
- Harita şekil sayısını envanterden üret; ada başına ayrı şekil şartını işaret sayısıyla karşılanmış sayma. Yerel koordinat alanları ve sabit ID'ler korunur.
- Sorun çözmek için bütün projeyi yeniden oluşturma, çalışan değişiklikleri topluca silme, testleri gevşetme veya gerekçesiz teknoloji değiştirme.
- `scripts/build_database.py` dosyasını frontend kurulumunun rutin parçası olarak çalıştırma. `scripts/validate_database.py` QA raporunu yeniden yazar; farkı kontrol et. Üretilmiş kanon dosyalarına elle yama yapma.

## Çözülemeyen işleri kaydetme — manuel Astra danışması

- Kullanıcının son tercihi **manuel danışmadır**. Kendiliğinden Astra/başka alt ajan çağırma, mesaj gönderme veya ana modelini değiştirme. Kullanıcı kayıtları kendisi Astra'ya iletecek.
- Yapamadığın işi, çözülmeden kalan hatayı, eksik erişimi veya çözülemeyen teknik belirsizliği `ASTRA_SORUN_KAYITLARI.md` dosyasına bağlamıyla kaydet. İlk başarısız düzeltmede açık kayıt oluştur; ikinci başarısız düzeltmede `MANUEL_DANISMA_BEKLIYOR` durumuna geçir ve üçüncü tahmini yamayı yapma. Belirsizlik veya dış engelde iki denemeyi bekleme.
- Her problem için kalıcı `PRB-0001` biçiminde kimlik kullan. Aynı problemde mevcut kaydı güncelle; oturum değişince denemeleri unutma veya mükerrer kayıt açma.
- Kayıtta aktif aşama, amaç, beklenen/gerçek davranış, ilgili dosya ve gerekli kod alıntıları, sürümler, yeniden üretim adımları, gerçek hata/log, denemeler ve sonuçları, engellenen işler, korunacak kurallar ve Astra'ya kopyalanabilir tek soru bulunur. Gizli anahtarları koyma.
- Tüm projeyi aktarma. Kopyalanabilir danışma paketi kendi başına anlaşılır olsun; yalnızca yerel dosya yolu yazmak, manuel açılan Astra oturumuna bağlam sağlamaz.
- Kullanıcı Astra yanıtını getirince aynı kayda ekle; öneriyi Luna değerlendirir, uygular ve doğrular. Gerçek doğrulama başarılı olmadan kaydı `COZULDU` işaretleme. Çözülen kayıtları ve geçmiş denemeleri silme.
- Yanıt beklenirken yalnızca bağımsız, yetkilendirilmiş işi ilerlet. Engellenen kabul ölçütünü atlayıp aşamayı tamamlandı sayma. Son raporda açık problem kimliklerini ve dosya bağlantısını belirt.

Deneme tanımı `LUNA_UYGULAMA_REHBERI.md`, tek yetkili problem kaydı ve kopyalama şablonu `ASTRA_SORUN_KAYITLARI.md` içindedir. `IMPLEMENTATION_STATUS.md` yalnızca problem ID'lerine bağlanır; ayrıntıları ikinci kez tutmaz. Bu teknik kayıtlar `/data/unresolved_conflicts.json` içindeki lore belirsizliklerinden ayrıdır.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
