create extension if not exists pgcrypto;

create type public.editor_role as enum ('owner', 'editor');
create type public.media_state as enum ('draft', 'ready', 'published', 'withdrawn');
create type public.media_role as enum ('cover', 'portrait', 'gallery', 'map_thumbnail', 'inline');
create type public.media_file_kind as enum ('original', 'thumbnail', 'small', 'medium', 'large');

create table public.world_entity_identities (
  entity_id text primary key check (entity_id ~ '^[A-Z]{3}-[0-9]{4}$'),
  canonical_name text check (canonical_name is null or length(trim(canonical_name)) > 0),
  canonical_slug text check (canonical_slug is null or canonical_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  entity_type text not null,
  active boolean not null default true,
  redirected_to_entity_id text references public.world_entity_identities(entity_id) on delete restrict,
  core_release_id text not null,
  synced_at timestamptz not null default now(),
  constraint world_entity_redirect_not_self check (redirected_to_entity_id is null or redirected_to_entity_id <> entity_id),
  constraint world_entity_active_shape check (
    (active and redirected_to_entity_id is null and canonical_name is not null and canonical_slug is not null)
    or
    (not active and redirected_to_entity_id is not null)
  )
);

create unique index world_entity_identities_active_slug_idx
  on public.world_entity_identities(canonical_slug)
  where active;

create table public.editor_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.editor_role not null,
  display_name text not null check (length(trim(display_name)) between 1 and 100),
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.wiki_articles (
  article_id uuid primary key default gen_random_uuid(),
  entity_id text not null unique references public.world_entity_identities(entity_id) on delete restrict,
  language text not null default 'tr' check (language = 'tr'),
  published_revision_id uuid,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.wiki_revisions (
  revision_id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.wiki_articles(article_id) on delete restrict,
  revision_number bigint not null check (revision_number > 0),
  schema_version text not null default 'tiptap-v1',
  base_core_release_id text not null,
  period text check (period is null or period in ('1300 civarı', '1600 civarı')),
  document jsonb not null check (jsonb_typeof(document) = 'object'),
  change_note text not null default '' check (length(change_note) <= 500),
  created_by uuid not null references auth.users(id) on delete restrict,
  source_revision_id uuid references public.wiki_revisions(revision_id) on delete restrict,
  created_at timestamptz not null default now(),
  published_at timestamptz not null default now(),
  unique (article_id, revision_number),
  unique (article_id, revision_id)
);

alter table public.wiki_articles
  add constraint wiki_articles_published_revision_fk
  foreign key (article_id, published_revision_id)
  references public.wiki_revisions(article_id, revision_id)
  on delete restrict;

create table public.wiki_drafts (
  article_id uuid primary key references public.wiki_articles(article_id) on delete cascade,
  schema_version text not null default 'tiptap-v1',
  base_core_release_id text not null,
  period text check (period is null or period in ('1300 civarı', '1600 civarı')),
  document jsonb not null check (jsonb_typeof(document) = 'object'),
  change_note text not null default '' check (length(change_note) <= 500),
  based_on_revision_id uuid references public.wiki_revisions(revision_id) on delete restrict,
  lock_version bigint not null default 1 check (lock_version > 0),
  updated_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.media_assets (
  media_id uuid primary key default gen_random_uuid(),
  state public.media_state not null default 'draft',
  content_hash_sha256 text not null check (content_hash_sha256 ~ '^[a-f0-9]{64}$'),
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp', 'image/avif')),
  width integer not null check (width between 1 and 12000),
  height integer not null check (height between 1 and 12000),
  byte_size bigint not null check (byte_size between 1 and 12582912),
  alternative_text_tr text not null check (length(trim(alternative_text_tr)) between 1 and 500),
  caption_tr text not null default '' check (length(caption_tr) <= 1000),
  source_label text not null check (length(trim(source_label)) between 1 and 300),
  creator_credit text not null check (length(trim(creator_credit)) between 1 and 300),
  rights_note text not null check (length(trim(rights_note)) between 1 and 1000),
  visual_kind text not null default 'illüstrasyon',
  period text check (period is null or period in ('1300 civarı', '1600 civarı')),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index media_assets_content_hash_idx on public.media_assets(content_hash_sha256);

create table public.media_files (
  media_id uuid not null references public.media_assets(media_id) on delete cascade,
  kind public.media_file_kind not null,
  bucket_id text not null check (bucket_id in ('wiki-originals', 'wiki-published')),
  object_path text not null check (object_path !~ '(^|/)\.\.(/|$)'),
  width integer check (width is null or width between 1 and 12000),
  height integer check (height is null or height between 1 and 12000),
  byte_size bigint not null check (byte_size between 1 and 12582912),
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp', 'image/avif')),
  created_at timestamptz not null default now(),
  primary key (media_id, kind),
  unique (bucket_id, object_path),
  constraint media_file_bucket_kind check (
    (kind = 'original' and bucket_id = 'wiki-originals') or
    (kind <> 'original' and bucket_id = 'wiki-published')
  )
);

create table public.wiki_draft_media (
  article_id uuid not null references public.wiki_drafts(article_id) on delete cascade,
  media_id uuid not null references public.media_assets(media_id) on delete restrict,
  role public.media_role not null,
  position integer not null default 0 check (position >= 0),
  period text check (period is null or period in ('1300 civarı', '1600 civarı')),
  primary key (article_id, media_id, role)
);

create table public.wiki_revision_media (
  revision_id uuid not null references public.wiki_revisions(revision_id) on delete restrict,
  media_id uuid not null references public.media_assets(media_id) on delete restrict,
  role public.media_role not null,
  position integer not null default 0 check (position >= 0),
  period text check (period is null or period in ('1300 civarı', '1600 civarı')),
  primary key (revision_id, media_id, role)
);

create index wiki_revisions_article_created_idx on public.wiki_revisions(article_id, created_at desc);
create index wiki_drafts_updated_by_idx on public.wiki_drafts(updated_by);
create index media_assets_created_by_idx on public.media_assets(created_by);
create index wiki_revision_media_revision_position_idx on public.wiki_revision_media(revision_id, position);

comment on table public.world_entity_identities is
  'Stable identity bridge imported from validated canon releases. Editorial rows reference this table, never a disposable release row.';
comment on column public.wiki_revisions.document is
  'Validated Tiptap JSON. Arbitrary HTML is never stored or rendered.';
comment on column public.wiki_drafts.lock_version is
  'Optimistic concurrency token; every save must provide the last value it read.';
