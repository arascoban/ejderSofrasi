# Editoryal kanıt çalışma alanı

Bu dizin, `/data` içindeki kanon kayıtlarını makale yazımından önce incelemek için hazırlanmış ayrı bir çalışma alanıdır. Kanon JSON'u, `Canon/`, `WorldData/` veya Supabase içerikleri burada değiştirilmez; bu dosyalar yayınlanmış wiki makalesi değildir.

`npm run editorial:evidence` her etkin varlık için `evidence/<ENTITY-ID>.json` ve `coverage.json` üretir. Kaynak envanterinin SHA-256 değeri pakete yazılır. Aynı `/data` girdileri aynı sıralı ve deterministik çıktıyı verir; `npm run editorial:evidence -- --check` dosyaların güncel ve değişmeden üretilebilir olduğunu kontrol eder.

Her paket kimlik bilgisini, kaynaklı olguları, giden/gelen ilişkileri, ilgili olayları, kanıtlı seyahatleri, lore kayıtlarını, bölüm bağlantılarını, harita kısıtlarını, dönem durumlarını, açık çatışmaları ve ilgili normalizasyon kararlarını toplar. `linked_entities` yalnızca bu kanıt bağlamında gereken kimlik özetidir; tam kayıtların sahibi yine `data/entities.json` dosyasıdır.

`review_status` şu anki kanıt kapsamını gösterir:

- `sufficient_narrative`: başlangıç makalesi için birden fazla kaynaklı kanıt bağlantısı var.
- `short_entry`: yalnızca kısa ve dürüst bir kimlik maddesi için kanıt var.
- `source_review_required`: açık çatışma veya kullanıcı kararı ayrıca incelenmeli.

Bu aşamada taslak metin, Tiptap belgesi, görsel, Supabase yazımı veya yayın işlemi üretilmez. M2 pilot incelemesi tamamlanmadan toplu makale üretimi ve yayın başlatılamaz.
