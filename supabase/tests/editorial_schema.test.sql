begin;
select plan(16);

select ok(
  (select count(*) = 6 and bool_and(
    position('errcode = ''40001''' in p.prosrc) = 0
    and position('errcode = ''PT409''' in p.prosrc) > 0
  ) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.proname in (
    'save_wiki_draft', 'publish_wiki_draft', 'rollback_wiki_article',
    'attach_media_to_wiki_draft', 'remove_media_from_wiki_draft', 'reorder_wiki_draft_media'
  )),
  'Permanent editor conflicts use HTTP 409 instead of retryable serialization failures'
);

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

select ok(has_function_privilege('authenticated', 'public.save_wiki_draft(text,jsonb,text,text,text,bigint,uuid,uuid)', 'EXECUTE'), 'authenticated can save through RPC');
select ok(has_function_privilege('authenticated', 'public.publish_wiki_draft(text,bigint,text,uuid)', 'EXECUTE'), 'authenticated can publish through RPC');
select ok(has_function_privilege('authenticated', 'public.rollback_wiki_article(text,uuid,uuid,text)', 'EXECUTE'), 'authenticated can roll back through RPC');
select ok(not has_function_privilege('anon', 'public.save_wiki_draft(text,jsonb,text,text,text,bigint,uuid,uuid)', 'EXECUTE'), 'anon cannot save drafts');
select ok(
  has_function_privilege('authenticated', 'public.attach_media_to_wiki_draft(text,uuid,public.media_role,text,uuid,bigint)', 'EXECUTE')
  and has_function_privilege('authenticated', 'public.remove_media_from_wiki_draft(text,uuid,uuid,bigint)', 'EXECUTE')
  and has_function_privilege('authenticated', 'public.reorder_wiki_draft_media(text,uuid[],uuid,bigint)', 'EXECUTE'),
  'authenticated can mutate media through versioned RPCs'
);
select ok(
  not has_function_privilege('anon', 'public.attach_media_to_wiki_draft(text,uuid,public.media_role,text,uuid,bigint)', 'EXECUTE')
  and not has_function_privilege('anon', 'public.remove_media_from_wiki_draft(text,uuid,uuid,bigint)', 'EXECUTE')
  and not has_function_privilege('anon', 'public.reorder_wiki_draft_media(text,uuid[],uuid,bigint)', 'EXECUTE'),
  'anon cannot mutate media'
);
select ok(
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'wiki_drafts' and column_name = 'draft_id'
      and column_default like '%gen_random_uuid%'
  ),
  'drafts have a non-resetting UUID token'
);

select is((select public from storage.buckets where id = 'wiki-originals'), false, 'original bucket is private');
select is((select public from storage.buckets where id = 'wiki-published'), false, 'published derivative bucket is private');
select ok(
  exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'Editors can read published wiki media' and cmd = 'SELECT'
  ),
  'editors can create signed previews for published derivatives'
);

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
