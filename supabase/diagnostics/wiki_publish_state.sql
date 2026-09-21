-- PRB-0014: salt okunur teşhis. Migration/bootstrap değildir.
-- Supabase SQL Editor'de yalnızca teknik test makalesini incelemek için çalıştır.
-- Auth kullanıcıları, makale metni, Storage yolları ve anahtarlar döndürülmez.
-- Yayın tamamlandıktan ve en az 5 saniye düzenleme yapılmadan beklendikten
-- sonra draft_exists=false beklenir. Eski istemci sekmelerini önce kapat.
-- Karşılaştırma sonuçları tek başına taslağın güvenle silinebileceğini kanıtlamaz.
begin transaction read only;

select
  a.entity_id,
  a.published_revision_id,
  r.revision_number as published_revision_number,
  r.published_at,
  d.draft_id is not null as draft_exists,
  d.draft_id,
  d.lock_version,
  d.based_on_revision_id,
  case when d.draft_id is not null then
    d.based_on_revision_id is not distinct from a.published_revision_id
  end as draft_based_on_current_publication,
  case when d.draft_id is not null and r.revision_id is not null then
    d.document = r.document
  end as document_matches_publication,
  case when d.draft_id is not null and r.revision_id is not null then
    d.period is not distinct from r.period
  end as period_matches_publication,
  (select count(*) from public.wiki_draft_media dm
    where dm.article_id = a.article_id) as draft_media_count,
  (select count(*) from public.wiki_revision_media rm
    where rm.revision_id = a.published_revision_id) as published_media_count
from public.wiki_articles a
left join public.wiki_drafts d on d.article_id = a.article_id
left join public.wiki_revisions r on r.revision_id = a.published_revision_id
where a.entity_id = 'NPC-0006';

commit;
