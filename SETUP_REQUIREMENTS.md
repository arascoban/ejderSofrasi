# Hesaplar, anahtarlar ve kurulum gereksinimleri

15 Eylül 2026: Türkçe ve düzenlenebilir wiki kapsamına göre güncellendi. Henüz uygulama veya bulut kaynağı oluşturulmadı. Planı onaylamak, veri dosyalarını kullanmak ve **A aşamasına başlamak için hiçbir API anahtarı gerekmiyor.**

Luna Max uygulamayı yürütür; çözülemeyen işleri `ASTRA_SORUN_KAYITLARI.md` dosyasına kaydeder. Kullanıcı ilgili paketi kendi Astra oturumuna manuel iletir. Otomatik danışma aracı, alt ajan kurulumu veya web sitesine OpenAI API entegrasyonu gerekmiyor. Plan dosyaları model seçimini değiştirmez. Ayrıntılar [Luna uygulama rehberinde](/Users/arascoban/Desktop/Ejder/LUNA_UYGULAMA_REHBERI.md).

| Ne zaman | Gereken erişim |
| --- | --- |
| A–D1: temel uygulama, harita taslağı ve wiki okuma | Yerel çalışma alanı yeterli. |
| D2: kalıcı wiki düzenleme ve görseller | Supabase proje erişimi, Auth, PostgreSQL ve Storage. |
| I: barındırma ve yayın | GitHub deposu ve Vercel proje erişimi; isteğe bağlı alan adı/DNS. |

## Supabase — D2 aşamasında

Gereken bilgiler: kullanılacak organizasyon/proje, proje URL'si, **publishable key** ve ilk sahip hesabının e-posta adresi. Tarayıcı yapılandırmasında `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` kullanılır. Publishable key gizli değildir; erişimi tablo izinleri ve RLS sınırlar. Özel `wiki-published` bucket'taki yayımlanmış görselleri anonim okuyucuya sunan uygulama medya rotası için sunucu tarafında `SUPABASE_SECRET_KEY` de gerekir; bu değer tarayıcıya gönderilmez. [Supabase API anahtarları](https://supabase.com/docs/guides/getting-started/api-keys).

Şema, RLS ve Storage politikalarını oluşturmak için yetkili Supabase CLI oturumu veya yerelde yapılandırılmış veritabanı bağlantısı gerekir. Yönetim işlemleri Data API kullanırsa sunucu tarafında `SUPABASE_SECRET_KEY` gerekir; normal editör işlemleri kullanıcının oturumu ve RLS ile çalışır. Migration öncesi salt-okuma bir Vercel yayını için `SUPABASE_EDITORIAL_MODE=disabled` açıkça ayarlanabilir; migration tamamlandıktan sonra `enabled` yapılır. Gizli anahtarları ve veritabanı şifresini sohbete göndermeyin veya Git'e eklemeyin; yerel ortam ya da Vercel gizli değişken ayarlarında yapılandırılır. Her işlem için ayrı bir API token toplamamız gerekmiyor.

Auth kurulumu; sahip hesabı, editör davetleri ve yerel/önizleme/canlı ortamların izin verilen giriş dönüş URL'lerini kapsar. İlk sürümde sahip ve davetli editörler varsayılıyor; herkese açık kayıt gerekmiyor. Üretimde davet/şifre yenileme e-postaları kullanılacaksa doğrulanmış gönderici ve uygun e-posta teslimat yapılandırması gerekir; sağlayıcı erişimi o aşamada yerel/gizli ayarlara eklenir. [Supabase Auth yönlendirme URL'leri](https://supabase.com/docs/guides/auth/redirect-urls), [SMTP yapılandırması](https://supabase.com/docs/guides/auth/auth-smtp).

Storage'da özel orijinaller/taslaklar ve yayımlanmış görsel türevleri ayrılacak. `wiki-originals` ve `wiki-published` bucket'ları private çalışır; editör önizlemeleri kısa ömürlü imzalı adresle, ziyaretçi görselleri ise yalnızca etkin yayımlanmış medya satırını RLS ile doğrulayan sunucu rotasıyla sunulur. Yükleme/okuma politikaları editör rolleriyle sınırlandırılır. Harita ve görsel dosyaları değişmez sürümlü anahtarlarla saklanır. Veritabanının yanında gerçek Storage dosyalarını da kapsayan dışa aktarma ve geri yükleme akışı kurulacak. [Storage erişim modeli](https://supabase.com/docs/guides/storage/buckets/fundamentals).

Bulut projesi henüz hazır değilse D2 yerel Supabase geliştirme ortamıyla yapılabilir; kalıcı düzenleme ve yetkiler gerçekten çalışmalıdır. Tarayıcı belleğine kaydedilen bir demo, tamamlanmış wiki düzenleyicisi sayılmaz.

## GitHub ve Vercel — yayın aşamasında

GitHub için depo sahibi/adı veya URL ve yetkili hesap bağlantısı yeterlidir. Henüz depo yoksa uygulama çalışması sırasında oluşturulabilir. Mevcut oturum/CLI veya GitHub yetkilendirmesi, elle kişisel token paylaşmaya tercih edilir.

Vercel için kullanılacak ekip/proje ve GitHub deposuna bağlantı gerekir. Standart bağlı-depo akışında özel bir GitHub API anahtarı veya Vercel API token gerekmiyor. Ayrı bir otomatik yönetim/deploy akışı seçilirse gerekli yetki o zaman belirlenir. [Vercel GitHub bağlantısı](https://vercel.com/docs/git/vercel-for-github).

Geliştirme, önizleme ve canlı ortam değişkenleri ayrı yapılandırılır. Önizleme yazma denemeleri canlı wiki içeriklerini değiştirmemeli; ayrı geliştirme projesi veya eşdeğer veri yalıtımı kullanılmalı. Gizli değişkenler sunucu tarafında kalır. Özel alan adı ve DNS erişimi yalnızca kendi alan adınızla yayına geçmek için gereklidir. [Vercel ortam değişkenleri](https://vercel.com/docs/environment-variables).

## İçerik ve görseller

Başlangıç harita taslağı mevcut ada/kıta envanterine göre oluşturulacak; hazır çiziminiz olması A veya B için önkoşul değildir. Sonraki görsel cilada özgün, etiketleri içine basılmamış harita çizimi ve varsa kullanım izni bulunan 3D varlıklar gerekir. Mevcut fotoğraf/çizimlerinizi wiki düzenleyicisi hazır olduğunda yükleyebilirsiniz; şimdi hepsini toplamak gerekmiyor.

Three.js, R3F, drei, CameraControls ve bu kurmaca harita için harici coğrafi harita/geocoding API anahtarı gerekmiyor. Yerel Tiptap düzenleyicisi için Tiptap Cloud hesabı veya API anahtarı planlanmıyor. Yapay zekâ görsel üretimi, Google ile giriş, sosyal paylaşım otomasyonu veya ticari arama hizmeti zorunlu bağımlılık değildir.

Uygulama kapsamı ve aşamalar: [IMPLEMENTATION_PLAN.md](/Users/arascoban/Desktop/Ejder/IMPLEMENTATION_PLAN.md). Türkçe wiki, görseller ve yıkıcı olmayan harita güncelleme sözleşmesi: [WIKI_VE_HARITA_PLANI.md](/Users/arascoban/Desktop/Ejder/WIKI_VE_HARITA_PLANI.md).
