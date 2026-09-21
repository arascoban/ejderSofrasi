-- These signatures existed in the first local D2 draft. Remove them before
-- adding the token-aware overloads so an older RPC cannot bypass concurrency checks.
drop function if exists public.save_wiki_draft(text, jsonb, text, text, text, bigint);
drop function if exists public.save_wiki_draft(text, jsonb, text, text, text, bigint, uuid);
drop function if exists public.publish_wiki_draft(text, bigint, text);

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

create or replace function private.is_editor()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.editor_profiles
    where user_id = (select auth.uid())
      and role in ('owner'::public.editor_role, 'editor'::public.editor_role)
  );
$$;

create or replace function private.is_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.editor_profiles
    where user_id = (select auth.uid())
      and role = 'owner'::public.editor_role
  );
$$;

create or replace function private.is_current_revision(candidate_revision_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.wiki_articles
    where published_revision_id = candidate_revision_id
  );
$$;

create or replace function private.is_published_media(candidate_media_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.wiki_articles a
    join public.wiki_revision_media link
      on link.revision_id = a.published_revision_id
    join public.media_assets media
      on media.media_id = link.media_id
    where link.media_id = candidate_media_id
      and media.state = 'published'::public.media_state
  );
$$;

create or replace function private.is_valid_wiki_document(candidate jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  with recursive nodes(node, depth) as (
    select candidate, 0
    union all
    select child, parent.depth + 1
    from nodes parent
    cross join lateral jsonb_array_elements(
      case
        when jsonb_typeof(parent.node -> 'content') = 'array' then parent.node -> 'content'
        else '[]'::jsonb
      end
    ) child
  ), marks(mark) as (
    select mark
    from nodes
    cross join lateral jsonb_array_elements(
      case
        when jsonb_typeof(nodes.node -> 'marks') = 'array' then nodes.node -> 'marks'
        else '[]'::jsonb
      end
    ) mark
  )
  select
    jsonb_typeof(candidate) = 'object'
    and candidate ->> 'type' = 'doc'
    and (select count(*) from nodes) <= 2000
    and (select count(*) from nodes where node ->> 'type' = 'doc') = 1
    and coalesce((select max(depth) from nodes), 0) <= 20
    and coalesce((select sum(length(node ->> 'text')) from nodes where node ->> 'type' = 'text'), 0) <= 100000
    and not exists (
      select 1 from nodes
      where coalesce(node ->> 'type', '') not in (
        'doc', 'paragraph', 'heading', 'bulletList', 'orderedList', 'listItem',
        'blockquote', 'table', 'tableRow', 'tableHeader', 'tableCell',
        'text', 'hardBreak', 'horizontalRule', 'image'
      )
      or (node ? 'content' and jsonb_typeof(node -> 'content') <> 'array')
      or (node ->> 'type' = 'text' and jsonb_typeof(node -> 'text') <> 'string')
      or (node ->> 'type' = 'heading' and coalesce((node -> 'attrs' ->> 'level')::integer, 0) not in (2, 3, 4))
      or (node ->> 'type' = 'image' and (
        coalesce(node -> 'attrs' ->> 'mediaId', '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
        or coalesce(node -> 'attrs' ->> 'src', '') <> ''
      ))
    )
    and not exists (
      select 1 from marks
      where coalesce(mark ->> 'type', '') not in ('bold', 'italic', 'strike', 'code', 'link')
      or (mark ->> 'type' = 'link' and not (
        (
          mark -> 'attrs' ? 'entityId'
          and mark -> 'attrs' ->> 'entityId' ~ '^[A-Z]{3}-[0-9]{4}$'
          and mark -> 'attrs' ->> 'href' = '/entity/' || (mark -> 'attrs' ->> 'entityId')
        )
        or
        (
          not (mark -> 'attrs' ? 'entityId')
          and mark -> 'attrs' ->> 'href' ~* '^https?://'
        )
      ))
    );
$$;

revoke all on function private.is_editor() from public;
revoke all on function private.is_owner() from public;
revoke all on function private.is_current_revision(uuid) from public;
revoke all on function private.is_published_media(uuid) from public;
revoke all on function private.is_valid_wiki_document(jsonb) from public;
grant execute on function private.is_editor() to anon, authenticated;
grant execute on function private.is_owner() to authenticated;
grant execute on function private.is_current_revision(uuid) to anon, authenticated;
grant execute on function private.is_published_media(uuid) to anon, authenticated;

alter table public.world_entity_identities enable row level security;
alter table public.editor_profiles enable row level security;
alter table public.wiki_articles enable row level security;
alter table public.wiki_revisions enable row level security;
alter table public.wiki_drafts enable row level security;
alter table public.media_assets enable row level security;
alter table public.media_files enable row level security;
alter table public.wiki_draft_media enable row level security;
alter table public.wiki_revision_media enable row level security;

revoke all on table public.world_entity_identities from anon, authenticated;
revoke all on table public.editor_profiles from anon, authenticated;
revoke all on table public.wiki_articles from anon, authenticated;
revoke all on table public.wiki_revisions from anon, authenticated;
revoke all on table public.wiki_drafts from anon, authenticated;
revoke all on table public.media_assets from anon, authenticated;
revoke all on table public.media_files from anon, authenticated;
revoke all on table public.wiki_draft_media from anon, authenticated;
revoke all on table public.wiki_revision_media from anon, authenticated;

grant select on table public.world_entity_identities to anon, authenticated;
grant select on table public.wiki_articles to anon, authenticated;
grant select on table public.wiki_revisions to anon, authenticated;
grant select on table public.media_assets to anon, authenticated;
grant select on table public.media_files to anon, authenticated;
grant select on table public.wiki_revision_media to anon, authenticated;
grant select on table public.editor_profiles to authenticated;
grant select on table public.wiki_drafts to authenticated;
grant select on table public.wiki_draft_media to authenticated;

create policy "World identities are public"
  on public.world_entity_identities
  for select
  to anon, authenticated
  using (true);

create policy "Users can read their editor profile"
  on public.editor_profiles
  for select
  to authenticated
  using (user_id = (select auth.uid()) or (select private.is_owner()));

create policy "Published articles are public"
  on public.wiki_articles
  for select
  to anon, authenticated
  using (published_revision_id is not null);

create policy "Editors can read all articles"
  on public.wiki_articles
  for select
  to authenticated
  using ((select private.is_editor()));

create policy "Current revisions are public"
  on public.wiki_revisions
  for select
  to anon, authenticated
  using ((select private.is_current_revision(revision_id)));

create policy "Editors can read revision history"
  on public.wiki_revisions
  for select
  to authenticated
  using ((select private.is_editor()));

create policy "Editors can read drafts"
  on public.wiki_drafts
  for select
  to authenticated
  using ((select private.is_editor()));

create policy "Published media metadata is public"
  on public.media_assets
  for select
  to anon, authenticated
  using ((select private.is_published_media(media_id)));

create policy "Editors can read all media metadata"
  on public.media_assets
  for select
  to authenticated
  using ((select private.is_editor()));

create policy "Published media files are public"
  on public.media_files
  for select
  to anon, authenticated
  using (
    bucket_id = 'wiki-published'
    and kind <> 'original'::public.media_file_kind
    and (select private.is_published_media(media_id))
  );

create policy "Editors can read all media files"
  on public.media_files
  for select
  to authenticated
  using ((select private.is_editor()));

create policy "Editors can read draft media links"
  on public.wiki_draft_media
  for select
  to authenticated
  using ((select private.is_editor()));

create policy "Current revision media links are public"
  on public.wiki_revision_media
  for select
  to anon, authenticated
  using ((select private.is_current_revision(revision_id)));

create policy "Editors can read revision media history"
  on public.wiki_revision_media
  for select
  to authenticated
  using ((select private.is_editor()));

create or replace function public.save_wiki_draft(
  p_entity_id text,
  p_document jsonb,
  p_base_core_release_id text,
  p_period text default null,
  p_change_note text default '',
  p_expected_lock_version bigint default null,
  p_expected_draft_id uuid default null,
  p_expected_published_revision_id uuid default null
)
returns table (article_id uuid, draft_id uuid, lock_version bigint, based_on_revision_id uuid, updated_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_article_id uuid;
  v_draft_id uuid;
  v_published_revision_id uuid;
  v_lock_version bigint;
  v_based_on_revision_id uuid;
  v_updated_at timestamptz;
begin
  if v_user_id is null or not private.is_editor() then
    raise exception using errcode = '42501', message = 'Bu işlem için editör yetkisi gerekiyor.';
  end if;

  if not private.is_valid_wiki_document(p_document) then
    raise exception using errcode = '22023', message = 'Makale belgesi izinli düğüm ve bağlantı sözleşmesine uymuyor.';
  end if;

  if p_period is not null and p_period not in ('1300 civarı', '1600 civarı') then
    raise exception using errcode = '22023', message = 'Geçersiz dönem değeri.';
  end if;

  if not exists (
    select 1 from public.world_entity_identities
    where entity_id = p_entity_id and active and core_release_id = p_base_core_release_id
  ) then
    raise exception using errcode = '23503', message = 'Etkin dünya varlığı veya çekirdek veri sürümü bulunamadı.';
  end if;

  select a.article_id, a.published_revision_id
    into v_article_id, v_published_revision_id
  from public.wiki_articles a
  where a.entity_id = p_entity_id
  for update;

  if v_article_id is null then
    insert into public.wiki_articles(entity_id, created_by)
    values (p_entity_id, v_user_id)
    on conflict (entity_id) do nothing
    returning wiki_articles.article_id, wiki_articles.published_revision_id
      into v_article_id, v_published_revision_id;
    if v_article_id is null then
      select a.article_id, a.published_revision_id
        into v_article_id, v_published_revision_id
      from public.wiki_articles a
      where a.entity_id = p_entity_id
      for update;
    end if;
  end if;

  select d.draft_id, d.lock_version, d.based_on_revision_id
    into v_draft_id, v_lock_version, v_based_on_revision_id
  from public.wiki_drafts d
  where d.article_id = v_article_id
  for update;

  if found then
    if p_expected_draft_id is null or p_expected_draft_id is distinct from v_draft_id
      or p_expected_lock_version is null or p_expected_lock_version is distinct from v_lock_version then
      raise exception using errcode = '40001', message = 'Taslak başka bir oturumda değiştirildi. Son sürümü yeniden açın.';
    end if;

    update public.wiki_drafts d
    set document = p_document,
        base_core_release_id = p_base_core_release_id,
        period = p_period,
        change_note = left(coalesce(p_change_note, ''), 500),
        lock_version = d.lock_version + 1,
        updated_by = v_user_id,
        updated_at = now()
    where d.article_id = v_article_id
    returning d.lock_version, d.based_on_revision_id, d.updated_at
      into v_lock_version, v_based_on_revision_id, v_updated_at;
  else
    if p_expected_lock_version is not null or p_expected_draft_id is not null then
      raise exception using errcode = '40001', message = 'Taslak durumu değişti. Sayfayı yeniden açın.';
    end if;

    if v_published_revision_id is distinct from p_expected_published_revision_id then
      raise exception using errcode = '40001', message = 'Yayımlanmış sürüm değişti. Sayfayı yeniden açın.';
    end if;

    insert into public.wiki_drafts(
      article_id,
      base_core_release_id,
      period,
      document,
      change_note,
      based_on_revision_id,
      updated_by
    ) values (
      v_article_id,
      p_base_core_release_id,
      p_period,
      p_document,
      left(coalesce(p_change_note, ''), 500),
      v_published_revision_id,
      v_user_id
    )
    returning wiki_drafts.draft_id, wiki_drafts.lock_version, wiki_drafts.based_on_revision_id, wiki_drafts.updated_at
      into v_draft_id, v_lock_version, v_based_on_revision_id, v_updated_at;

    insert into public.wiki_draft_media(article_id, media_id, role, position, period)
    select v_article_id, media_id, role, position, period
    from public.wiki_revision_media
    where revision_id = v_published_revision_id;
  end if;

  return query select v_article_id, v_draft_id, v_lock_version, v_based_on_revision_id, v_updated_at;
end;
$$;

create or replace function public.publish_wiki_draft(
  p_entity_id text,
  p_expected_lock_version bigint,
  p_change_note text default '',
  p_expected_draft_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_article public.wiki_articles%rowtype;
  v_draft public.wiki_drafts%rowtype;
  v_revision_id uuid;
  v_revision_number bigint;
begin
  if v_user_id is null or not private.is_editor() then
    raise exception using errcode = '42501', message = 'Bu işlem için editör yetkisi gerekiyor.';
  end if;

  select a.* into v_article
  from public.wiki_articles a
  where a.entity_id = p_entity_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'Yayımlanacak makale bulunamadı.';
  end if;

  select d.* into v_draft
  from public.wiki_drafts d
  where d.article_id = v_article.article_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'Yayımlanacak taslak bulunamadı.';
  end if;

  if p_expected_draft_id is null or v_draft.draft_id is distinct from p_expected_draft_id
    or p_expected_lock_version is null or v_draft.lock_version is distinct from p_expected_lock_version then
    raise exception using errcode = '40001', message = 'Taslak başka bir oturumda değiştirildi. Son sürümü yeniden açın.';
  end if;

  if v_draft.based_on_revision_id is distinct from v_article.published_revision_id then
    raise exception using errcode = '40001', message = 'Yayımlanmış makale değişti. Taslağı yeni sürümle karşılaştırın.';
  end if;

  if exists (
    with recursive nodes(node) as (
      select v_draft.document
      union all
      select child
      from nodes parent
      cross join lateral jsonb_array_elements(
        case when jsonb_typeof(parent.node -> 'content') = 'array' then parent.node -> 'content' else '[]'::jsonb end
      ) child
    )
    select 1
    from nodes
    cross join lateral jsonb_array_elements(
      case when jsonb_typeof(nodes.node -> 'marks') = 'array' then nodes.node -> 'marks' else '[]'::jsonb end
    ) mark
    where mark ->> 'type' = 'link'
      and mark -> 'attrs' ? 'entityId'
      and not exists (
        select 1 from public.world_entity_identities identity
        where identity.entity_id = mark -> 'attrs' ->> 'entityId' and identity.active
      )
  ) then
    raise exception using errcode = '23503', message = 'Makale etkin olmayan bir dünya varlığına bağlantı içeriyor.';
  end if;

  if exists (
    with recursive nodes(node) as (
      select v_draft.document
      union all
      select child
      from nodes parent
      cross join lateral jsonb_array_elements(
        case when jsonb_typeof(parent.node -> 'content') = 'array' then parent.node -> 'content' else '[]'::jsonb end
      ) child
    )
    select 1
    from nodes
    where nodes.node ->> 'type' = 'image'
      and not exists (
        select 1 from public.wiki_draft_media link
        where link.article_id = v_article.article_id
          and link.media_id = (nodes.node -> 'attrs' ->> 'mediaId')::uuid
      )
  ) then
    raise exception using errcode = '23503', message = 'Makale taslağa bağlı olmayan bir görsel içeriyor.';
  end if;

  if exists (
    select 1
    from public.wiki_draft_media link
    join public.media_assets media on media.media_id = link.media_id
    where link.article_id = v_article.article_id
      and (
        media.state not in ('ready'::public.media_state, 'published'::public.media_state)
        or not exists (
          select 1 from public.media_files file
          where file.media_id = media.media_id
            and file.bucket_id = 'wiki-published'
            and file.kind <> 'original'::public.media_file_kind
        )
      )
  ) then
    raise exception using errcode = '23514', message = 'Yayımlanmaya hazır olmayan görsel var.';
  end if;

  select coalesce(max(r.revision_number), 0) + 1
    into v_revision_number
  from public.wiki_revisions r
  where r.article_id = v_article.article_id;

  insert into public.wiki_revisions(
    article_id,
    revision_number,
    schema_version,
    base_core_release_id,
    period,
    document,
    change_note,
    created_by
  ) values (
    v_article.article_id,
    v_revision_number,
    v_draft.schema_version,
    v_draft.base_core_release_id,
    v_draft.period,
    v_draft.document,
    left(coalesce(nullif(p_change_note, ''), v_draft.change_note, ''), 500),
    v_user_id
  ) returning revision_id into v_revision_id;

  insert into public.wiki_revision_media(revision_id, media_id, role, position, period)
  select v_revision_id, media_id, role, position, period
  from public.wiki_draft_media
  where article_id = v_article.article_id;

  update public.media_assets media
  set state = 'published'::public.media_state,
      updated_at = now()
  where media.media_id in (
    select link.media_id
    from public.wiki_revision_media link
    where link.revision_id = v_revision_id
  );

  update public.wiki_articles
  set published_revision_id = v_revision_id,
      updated_at = now()
  where article_id = v_article.article_id;

  delete from public.wiki_drafts where article_id = v_article.article_id;
  return v_revision_id;
end;
$$;

create or replace function public.rollback_wiki_article(
  p_entity_id text,
  p_source_revision_id uuid,
  p_expected_published_revision_id uuid,
  p_change_note text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_article public.wiki_articles%rowtype;
  v_source public.wiki_revisions%rowtype;
  v_revision_id uuid;
  v_revision_number bigint;
begin
  if v_user_id is null or not private.is_editor() then
    raise exception using errcode = '42501', message = 'Bu işlem için editör yetkisi gerekiyor.';
  end if;

  select a.* into v_article
  from public.wiki_articles a
  where a.entity_id = p_entity_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'Makale bulunamadı.';
  end if;

  if v_article.published_revision_id is distinct from p_expected_published_revision_id then
    raise exception using errcode = '40001', message = 'Yayımlanmış makale değişti. Sürüm geçmişini yeniden açın.';
  end if;

  select r.* into v_source
  from public.wiki_revisions r
  where r.revision_id = p_source_revision_id
    and r.article_id = v_article.article_id;

  if not found then
    raise exception using errcode = 'P0002', message = 'Geri alınacak sürüm bu makaleye ait değil.';
  end if;

  select coalesce(max(r.revision_number), 0) + 1
    into v_revision_number
  from public.wiki_revisions r
  where r.article_id = v_article.article_id;

  insert into public.wiki_revisions(
    article_id,
    revision_number,
    schema_version,
    base_core_release_id,
    period,
    document,
    change_note,
    created_by,
    source_revision_id
  ) values (
    v_article.article_id,
    v_revision_number,
    v_source.schema_version,
    v_source.base_core_release_id,
    v_source.period,
    v_source.document,
    left(coalesce(p_change_note, ''), 500),
    v_user_id,
    v_source.revision_id
  ) returning revision_id into v_revision_id;

  insert into public.wiki_revision_media(revision_id, media_id, role, position, period)
  select v_revision_id, media_id, role, position, period
  from public.wiki_revision_media
  where revision_id = v_source.revision_id;

  update public.wiki_articles
  set published_revision_id = v_revision_id,
      updated_at = now()
  where article_id = v_article.article_id;

  return v_revision_id;
end;
$$;

revoke all on function public.save_wiki_draft(text, jsonb, text, text, text, bigint, uuid, uuid) from public;
revoke all on function public.publish_wiki_draft(text, bigint, text, uuid) from public;
revoke all on function public.rollback_wiki_article(text, uuid, uuid, text) from public;
grant execute on function public.save_wiki_draft(text, jsonb, text, text, text, bigint, uuid, uuid) to authenticated;
grant execute on function public.publish_wiki_draft(text, bigint, text, uuid) to authenticated;
grant execute on function public.rollback_wiki_article(text, uuid, uuid, text) to authenticated;

comment on function public.save_wiki_draft(text, jsonb, text, text, text, bigint, uuid, uuid) is
  'Creates or updates one article draft with optimistic lock checking.';
comment on function public.publish_wiki_draft(text, bigint, text, uuid) is
  'Publishes a draft atomically after checking draft and published-revision concurrency.';
comment on function public.rollback_wiki_article(text, uuid, uuid, text) is
  'Copies an older immutable revision into a new published revision; history is never rewritten.';
