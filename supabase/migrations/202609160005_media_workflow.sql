-- Replace the pre-concurrency signatures instead of leaving an unsafe overload
-- callable through the Data API after a partial migration.
drop function if exists public.attach_media_to_wiki_draft(text, uuid, public.media_role, text);
drop function if exists public.remove_media_from_wiki_draft(text, uuid);
drop function if exists public.reorder_wiki_draft_media(text, uuid[]);

create or replace function public.register_processed_media(
  p_media_id uuid,
  p_content_hash_sha256 text,
  p_mime_type text,
  p_width integer,
  p_height integer,
  p_byte_size bigint,
  p_alternative_text_tr text,
  p_caption_tr text,
  p_source_label text,
  p_creator_credit text,
  p_rights_note text,
  p_visual_kind text,
  p_period text,
  p_original_path text,
  p_files jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_expected_prefix text;
begin
  if v_user_id is null or not private.is_editor() then
    raise exception using errcode = '42501', message = 'Bu işlem için editör yetkisi gerekiyor.';
  end if;
  v_expected_prefix := v_user_id::text || '/' || p_media_id::text || '/';
  if p_original_path <> (v_expected_prefix || 'original' ||
    case p_mime_type
      when 'image/jpeg' then '.jpg'
      when 'image/png' then '.png'
      when 'image/webp' then '.webp'
      when 'image/avif' then '.avif'
      else '.invalid'
    end)
  then
    raise exception using errcode = '22023', message = 'Özgün dosya yolu medya kimliğiyle eşleşmiyor.';
  end if;
  if jsonb_typeof(p_files) <> 'array' or jsonb_array_length(p_files) < 3 then
    raise exception using errcode = '22023', message = 'En az üç yayımlanabilir görsel türevi gerekiyor.';
  end if;
  if not exists (
    select 1 from storage.objects object
    where object.bucket_id = 'wiki-originals'
      and object.name = p_original_path
      and object.owner_id = v_user_id::text
  ) then
    raise exception using errcode = '23503', message = 'Özel depoda kullanıcıya ait özgün görsel bulunamadı.';
  end if;

  insert into public.media_assets(
    media_id, state, content_hash_sha256, mime_type, width, height, byte_size,
    alternative_text_tr, caption_tr, source_label, creator_credit, rights_note,
    visual_kind, period, created_by
  ) values (
    p_media_id, 'ready'::public.media_state, p_content_hash_sha256, p_mime_type,
    p_width, p_height, p_byte_size, p_alternative_text_tr, coalesce(p_caption_tr, ''),
    p_source_label, p_creator_credit, p_rights_note, coalesce(p_visual_kind, 'illüstrasyon'),
    p_period, v_user_id
  )
  on conflict (media_id) do nothing;

  if not exists (
    select 1 from public.media_assets
    where media_id = p_media_id
      and created_by = v_user_id
      and content_hash_sha256 = p_content_hash_sha256
  ) then
    raise exception using errcode = '23505', message = 'Medya kimliği başka bir dosya için kullanılıyor.';
  end if;

  insert into public.media_files(
    media_id, kind, bucket_id, object_path, width, height, byte_size, mime_type
  ) values (
    p_media_id, 'original'::public.media_file_kind, 'wiki-originals', p_original_path,
    p_width, p_height, p_byte_size, p_mime_type
  ) on conflict (media_id, kind) do nothing;

  insert into public.media_files(
    media_id, kind, bucket_id, object_path, width, height, byte_size, mime_type
  )
  select
    p_media_id,
    file.kind::public.media_file_kind,
    'wiki-published',
    file.object_path,
    file.width,
    file.height,
    file.byte_size,
    file.mime_type
  from jsonb_to_recordset(p_files) as file(
    kind text,
    object_path text,
    width integer,
    height integer,
    byte_size bigint,
    mime_type text
  )
  where file.kind in ('thumbnail', 'small', 'medium', 'large')
    and file.mime_type = 'image/webp'
    and file.object_path like v_expected_prefix || '%'
    and exists (
      select 1 from storage.objects object
      where object.bucket_id = 'wiki-published'
        and object.name = file.object_path
        and object.owner_id = v_user_id::text
    )
  on conflict (media_id, kind) do nothing;

  if (
    select count(*) from public.media_files
    where media_id = p_media_id and bucket_id = 'wiki-published'
  ) < 3 then
    raise exception using errcode = '23514', message = 'Görsel türev kayıtları eksik.';
  end if;

  return p_media_id;
end;
$$;

create or replace function public.attach_media_to_wiki_draft(
  p_entity_id text,
  p_media_id uuid,
  p_role public.media_role,
  p_period text default null,
  p_expected_draft_id uuid default null,
  p_expected_lock_version bigint default null
)
returns table (draft_id uuid, lock_version bigint)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_article_id uuid;
  v_draft_id uuid;
  v_lock_version bigint;
  v_position integer;
begin
  if auth.uid() is null or not private.is_editor() then
    raise exception using errcode = '42501', message = 'Bu işlem için editör yetkisi gerekiyor.';
  end if;
  select article.article_id into v_article_id
  from public.wiki_articles article
  join public.wiki_drafts draft on draft.article_id = article.article_id
  where article.entity_id = p_entity_id
  for update of article;
  if v_article_id is null then
    raise exception using errcode = 'P0002', message = 'Önce makale taslağını kaydedin.';
  end if;
  select draft.draft_id, draft.lock_version
    into v_draft_id, v_lock_version
  from public.wiki_drafts draft
  where draft.article_id = v_article_id
  for update;
  if p_expected_draft_id is null or v_draft_id is distinct from p_expected_draft_id
    or p_expected_lock_version is null or v_lock_version is distinct from p_expected_lock_version then
    raise exception using errcode = '40001', message = 'Taslak başka bir oturumda değiştirildi. Son sürümü yeniden açın.';
  end if;
  if not exists (
    select 1 from public.media_assets media
    where media.media_id = p_media_id
      and media.state in ('ready'::public.media_state, 'published'::public.media_state)
  ) then
    raise exception using errcode = '23503', message = 'Yayıma hazır medya bulunamadı.';
  end if;

  select coalesce(max(link.position), -1) + 1 into v_position
  from public.wiki_draft_media link
  where link.article_id = v_article_id;

  delete from public.wiki_draft_media
  where article_id = v_article_id and media_id = p_media_id;
  insert into public.wiki_draft_media(article_id, media_id, role, position, period)
  values (v_article_id, p_media_id, p_role, v_position, p_period);
  update public.wiki_drafts draft
  set lock_version = draft.lock_version + 1,
      updated_at = now(),
      updated_by = auth.uid()
  where draft.article_id = v_article_id
  returning draft.draft_id, draft.lock_version into draft_id, lock_version;
  return next;
end;
$$;

create or replace function public.remove_media_from_wiki_draft(
  p_entity_id text,
  p_media_id uuid,
  p_expected_draft_id uuid default null,
  p_expected_lock_version bigint default null
)
returns table (draft_id uuid, lock_version bigint)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_article_id uuid;
  v_draft_id uuid;
  v_lock_version bigint;
begin
  if auth.uid() is null or not private.is_editor() then
    raise exception using errcode = '42501', message = 'Bu işlem için editör yetkisi gerekiyor.';
  end if;
  select article.article_id into v_article_id
  from public.wiki_articles article
  where article.entity_id = p_entity_id
  for update of article;
  select draft.draft_id, draft.lock_version into v_draft_id, v_lock_version
  from public.wiki_drafts draft
  where draft.article_id = v_article_id
  for update;
  if v_article_id is null then
    raise exception using errcode = 'P0002', message = 'Makale taslağı bulunamadı.';
  end if;
  if p_expected_draft_id is null or v_draft_id is distinct from p_expected_draft_id
    or p_expected_lock_version is null or v_lock_version is distinct from p_expected_lock_version then
    raise exception using errcode = '40001', message = 'Taslak başka bir oturumda değiştirildi. Son sürümü yeniden açın.';
  end if;
  delete from public.wiki_draft_media link
  where link.article_id = v_article_id and link.media_id = p_media_id;
  update public.wiki_drafts draft
  set lock_version = draft.lock_version + 1,
      updated_at = now(),
      updated_by = auth.uid()
  where draft.article_id = v_article_id
  returning draft.draft_id, draft.lock_version into draft_id, lock_version;
  return next;
end;
$$;

create or replace function public.reorder_wiki_draft_media(
  p_entity_id text,
  p_media_ids uuid[],
  p_expected_draft_id uuid default null,
  p_expected_lock_version bigint default null
)
returns table (draft_id uuid, lock_version bigint)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_article_id uuid;
  v_draft_id uuid;
  v_lock_version bigint;
  v_existing_count integer;
begin
  if auth.uid() is null or not private.is_editor() then
    raise exception using errcode = '42501', message = 'Bu işlem için editör yetkisi gerekiyor.';
  end if;
  select article.article_id into v_article_id
  from public.wiki_articles article
  join public.wiki_drafts draft on draft.article_id = article.article_id
  where article.entity_id = p_entity_id
  for update of article;
  if v_article_id is null then
    raise exception using errcode = 'P0002', message = 'Makale taslağı bulunamadı.';
  end if;
  select draft.draft_id, draft.lock_version
    into v_draft_id, v_lock_version
  from public.wiki_drafts draft
  where draft.article_id = v_article_id
  for update;
  if p_expected_draft_id is null or v_draft_id is distinct from p_expected_draft_id
    or p_expected_lock_version is null or v_lock_version is distinct from p_expected_lock_version then
    raise exception using errcode = '40001', message = 'Taslak başka bir oturumda değiştirildi. Son sürümü yeniden açın.';
  end if;

  select count(*) into v_existing_count
  from public.wiki_draft_media
  where article_id = v_article_id;
  if v_existing_count <> coalesce(array_length(p_media_ids, 1), 0)
    or v_existing_count <> (select count(distinct id) from unnest(p_media_ids) id)
    or exists (
      select 1 from unnest(p_media_ids) id
      where not exists (
        select 1 from public.wiki_draft_media link
        where link.article_id = v_article_id and link.media_id = id
      )
    )
  then
    raise exception using errcode = '22023', message = 'Galeri sırası mevcut medya kümesiyle eşleşmiyor.';
  end if;

  update public.wiki_draft_media link
  set position = ordered.ordinality - 1
  from unnest(p_media_ids) with ordinality as ordered(media_id, ordinality)
  where link.article_id = v_article_id and link.media_id = ordered.media_id;
  update public.wiki_drafts draft
  set lock_version = draft.lock_version + 1,
      updated_at = now(),
      updated_by = auth.uid()
  where draft.article_id = v_article_id
  returning draft.draft_id, draft.lock_version into draft_id, lock_version;
  return next;
end;
$$;

revoke all on function public.register_processed_media(uuid, text, text, integer, integer, bigint, text, text, text, text, text, text, text, text, jsonb) from public;
revoke all on function public.attach_media_to_wiki_draft(text, uuid, public.media_role, text, uuid, bigint) from public;
revoke all on function public.remove_media_from_wiki_draft(text, uuid, uuid, bigint) from public;
revoke all on function public.reorder_wiki_draft_media(text, uuid[], uuid, bigint) from public;
grant execute on function public.register_processed_media(uuid, text, text, integer, integer, bigint, text, text, text, text, text, text, text, text, jsonb) to authenticated;
grant execute on function public.attach_media_to_wiki_draft(text, uuid, public.media_role, text, uuid, bigint) to authenticated;
grant execute on function public.remove_media_from_wiki_draft(text, uuid, uuid, bigint) to authenticated;
grant execute on function public.reorder_wiki_draft_media(text, uuid[], uuid, bigint) to authenticated;
