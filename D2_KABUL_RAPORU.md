# D2 kabul raporu

22 Eylül 2026, Europe/Berlin — Astra. **D2 tamamlandı.** Bu karar editörün işlevsel kabulüdür; son harita sanatı, E–I özellikleri ve üretim ortamının tüm işletim kabulleri tamamlandı anlamına gelmez.

## Kabul matrisi

| Plan ölçütü | Doğrulanan kanıt |
| --- | --- |
| Owner ile makale oluştur/kaydet/yeniden aç/yayımla | Gerçek Supabase Auth oturumuyla NPC-0006 üzerinde kayıt, yeniden açma ve yayın; V16 ID bağlantısı yeniden açılınca korundu. Önceki V4–V6 gerçek görsel akışı korunur. |
| Görsel ve sabit ID bağlantısı | Gerçek inline PNG yükleme, önizleme, kayıt ve public WebP kabul edildi (PRB-0016). V16 `/entity/NPC-0051` bağlantısı public sayfada tıklanınca yeni sekmede `/wiki/kalender-tutuncuoglu` açıldı. Kanon değişmedi. |
| Ziyaretçi yalnızca yayımlanan içeriği görür | Önceki canlı anonim kontrolde özel original/derivative doğrudan okunamadı; yayımlanan uygulama medya adresi200/WebP, yayından kaldırılan adres404. Yerel PostgreSQL testleri anon/non-editor özel taslak okuma ve RPC/direct write engelini doğrular. |
| Eşzamanlı kayıtlar kayıp güncelleme üretmez | Gerçek owner iki sekme stale-save ve save/publish çatışmasında yerel yazı korundu. Gerçek Tiptap DOM + SaveCoordinator gecikmeli yanıt testleri güncel belge/dönem/notun eski yanıtla kaydedilmiş sayılmadığını ve conflict sonrası otomatik tekrar olmadığını doğrular. SQL stale/null/ABA/base-revision ile altı RPC PT409 kontrolleri geçti. |
| Yayın/medya çakışması | Gerçek SQL fonksiyonları geçersiz sürümü PT409 ile reddeder; gerçek Supabase SDK'sına kontrollü HTTP409 yanıtı verilen action testleri publish/remove/reorder için tek istek ve conflict sonucunu doğrular. Gerçek Tiptap publish conflict ve medya token aktarımı testleri geçti. Bu HTTP yanıtları test fixture'ıdır; canlı publish HTTP kodu gözlendi iddiası değildir. |
| Rollback yeni sürüm oluşturur | Canlı V4 → V5 → V4 içeriğinden yeni V6; belge ve medya kümesi döndü. Eski revizyonlar korunur. Yayın sonrası hayalet taslak üretmeme ve rollback kilitleri DOM/regresyon testleriyle doğrulandı. |
| NPC/eşya/konum galerileri, Türkçe alt/kredi | Canlı NPC galerisi/inline/yeniden açma/kaldırma; izole gerçek PostgreSQL üzerinde NPC-0006, ITM-0012, CIT-0006 iki görsel sıralama, publish/reopen ve özel taslağın public projeksiyondan dışlanması. Gerçek WikiArticle render testleri aynı üç türde Türkçe alt metin, kredi/kaynak ve sıra gösterimini doğrular. |
| Core import editoryal kayıtları korur | İzole PostgreSQL'de gerçek `supabase/generated/entity_identities.sql` tekrar uygulandı: yedi editoryal tablonun sıralı snapshot'ı birebir aynı. Yeni core release/ad güncellemesi de revizyon/medya bağlantılarını korudu. Canlı kanon yeniden import edilmedi. |
| Yayın deploy gerektirmez | Mevcut çalışan uygulamada V16 public metni ve V17 temizliği yeniden deploy olmadan görüldü. |
| Metadata ve özgün dosyalar dışa aktarılabilir | `npm run editorial:export` gerçek Supabase'den dokuz tabloyu ve25 kayıtlı dosyanın byte'larını aldı; original SHA-256 ve tüm dosya boyutları doğrulandı, yerel dosyalar tekrar okunup hash'leri kontrol edildi.15 revizyon,5 medya,25 dosya,3.040.749 byte içeren ilk doğrulanmış paket Git dışındaki `.local-backups/` altında. Export salt okunurdur. |
| Temizlik | Teknik bağlantı testi ardından boş V17 yayımlandı. Reload sonrası editör Hazır, metin boş. Anonim HTTP200 public Akmer sayfasında teknik metin yok, img sayısı0, sürüm17. Eski teknik sürümler ve özel medya silinmedi. |

## Test sonuçları

- `npm run check`: lint, typecheck,11 dosyada74 Vitest testi,6 dışa aktarma testi ve526/526 sayfalı üretim build başarılı.
- `scripts/verify_editorial_pglite.mjs`: altı migration ile35; birleşik bootstrap ile36 denetim geçti. Bunlar yerel testlerdir; canlı bootstrap/migration tekrar çalıştırılmadı.
- Export testleri eksik/bozuk dosya, işlem sırasında metadata değişimi, güvensiz yol, sayfalama ve mevcut klasörü ezmeme durumlarını kapsar.
- Kullanıcının talimatıyla CPU teşhisi/yük testi yapılmadı; PRB-0017 ertelendi.

## Astra'nın kabul yöntemi kararı

Özgün D2 işlevsel ölçütleri korunur. Önceki yönergelerde sonradan eklenen **canlı tarayıcı ağ yavaşlatma**, **ayrı publish isteğinin tarayıcıda doğrudan HTTP409 olarak görünmesi** ve **canlı pgTAP/iki bağımsız DB oturumu** şartları bu kapanış için zorunlu değildir. Ağ gecikmesi gerçek editör bileşeninde deterministik olarak, PT409 gerçek SQL'de, HTTP409 dönüşümü gerçek SDK + kontrollü transport ile, kullanıcı akışı gerçek Auth/Storage oturumunda ayrı ayrı doğrulandı. Save kuyruğunu boşaltan publish guard'ını aşarak sırf başka bir HTTP kodu görmek için korumalar kaldırılmadı.

Bu, canlı ağ emülasyonu veya bağımsız veritabanı oturumları testi yapıldığı anlamına gelmez. PGlite Auth/Storage fixture kullanır; bulut Auth/Storage kanıtı ayrı gerçek oturumdan gelir. Bu sınırlar test raporlarında korunacak. Yeni bir hata kanıtı çıkmadıkça aynı kabuller tekrar edilerek D2 açılmayacak.

Export tamamlanmış bir proje felaket-kurtarma yedeği değildir: Auth kullanıcı/parolaları, şema ve kayıtsız Storage orphan dosyaları kapsam dışıdır. Yazıcılar sakin olmalıdır; başlangıç/son metadata karşılaştırması transaction snapshot değildir. Tam geri yükleme provası I aşamasındadır.
