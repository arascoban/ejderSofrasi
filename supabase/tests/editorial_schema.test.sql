begin;
select plan(11);

select ok(
  not exists (
    select 1
    from unnest(array[
      'world_entity_identities', 'editor_profiles', 'wiki_articles', 'wiki_revisions',
      'wiki_drafts', 'media_assets', 'media_files', 'wiki_draft_media', 'wiki_revision_media'
    ]) table_name
    join pg_class relation on relation.relname = table_name
    join pg_namespace namespace on namespace.oid = relation.relnamespace and namespace.nspname = 'public'
    where not relation.relrowsecurity
  ),
  'Every exposed editorial table has RLS enabled'
);

select ok(
  not exists (
    select 1 from unnest(array[
      'world_entity_identities', 'editor_profiles', 'wiki_articles', 'wiki_revisions',
      'wiki_drafts', 'media_assets', 'media_files', 'wiki_draft_media', 'wiki_revision_media'
    ]) table_name
    where has_table_privilege('anon', 'public.' || table_name, 'INSERT,UPDATE,DELETE')
  ),
  'anon has no direct editorial table writes'
);

select ok(
  not exists (
    select 1 from unnest(array[
      'world_entity_identities', 'editor_profiles', 'wiki_articles', 'wiki_revisions',
      'wiki_drafts', 'media_assets', 'media_files', 'wiki_draft_media', 'wiki_revision_media'
    ]) table_name
    where has_table_privilege('authenticated', 'public.' || table_name, 'INSERT,UPDATE,DELETE')
  ),
  'authenticated has no direct editorial table writes'
);

select ok(has_function_privilege('authenticated', 'public.save_wiki_draft(text,jsonb,text,text,text,bigint)', 'EXECUTE'), 'authenticated can save through RPC');
select ok(has_function_privilege('authenticated', 'public.publish_wiki_draft(text,bigint,text)', 'EXECUTE'), 'authenticated can publish through RPC');
select ok(has_function_privilege('authenticated', 'public.rollback_wiki_article(text,uuid,uuid,text)', 'EXECUTE'), 'authenticated can roll back through RPC');
select ok(not has_function_privilege('anon', 'public.save_wiki_draft(text,jsonb,text,text,text,bigint)', 'EXECUTE'), 'anon cannot save drafts');

select is((select public from storage.buckets where id = 'wiki-originals'), false, 'original bucket is private');
select is((select public from storage.buckets where id = 'wiki-published'), true, 'published derivative bucket is public');

select ok(
  not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and cmd = 'UPDATE'
      and policyname ilike '%wiki%'
  ),
  'wiki storage objects have no overwrite policy'
);

select ok(
  has_function_privilege('anon', 'public.get_published_wiki_article(text)', 'EXECUTE')
  and not has_table_privilege('anon', 'public.wiki_drafts', 'SELECT'),
  'public projection is callable while drafts remain unreadable'
);

select * from finish();
rollback;
