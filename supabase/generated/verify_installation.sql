-- Read-only verification after bootstrap or CLI migrations.
select count(*) as total, count(*) filter (where active) as active,
  count(*) filter (where not active) as retired
from public.world_entity_identities;
-- Expected at this release: total 416, active 403, retired 13.
select id, public from storage.buckets where id in ('wiki-originals','wiki-published');
-- Both must be false.
select c.relname, c.relrowsecurity
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relname in (
'world_entity_identities','editor_profiles','wiki_articles','wiki_revisions','wiki_drafts',
'media_assets','media_files','wiki_draft_media','wiki_revision_media');
-- Nine rows, all relrowsecurity=true.
select p.proname, pg_get_function_identity_arguments(p.oid) as signature
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname in (
'save_wiki_draft','publish_wiki_draft','rollback_wiki_article','get_published_wiki_article',
'attach_media_to_wiki_draft','remove_media_from_wiki_draft','reorder_wiki_draft_media');
-- Exactly one current signature per function (seven rows).
select user_id,role,display_name from public.editor_profiles;
-- Initially empty; owner must be assigned separately after matching the Auth user.
