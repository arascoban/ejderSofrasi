create or replace function public.get_published_wiki_article(p_entity_id text)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'article_id', article.article_id,
    'entity_id', article.entity_id,
    'language', article.language,
    'revision', jsonb_build_object(
      'revision_id', revision.revision_id,
      'revision_number', revision.revision_number,
      'schema_version', revision.schema_version,
      'base_core_release_id', revision.base_core_release_id,
      'period', revision.period,
      'document', revision.document,
      'change_note', revision.change_note,
      'published_at', revision.published_at
    ),
    'media', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'media_id', media.media_id,
          'role', link.role,
          'position', link.position,
          'period', link.period,
          'alternative_text_tr', media.alternative_text_tr,
          'caption_tr', media.caption_tr,
          'source_label', media.source_label,
          'creator_credit', media.creator_credit,
          'rights_note', media.rights_note,
          'visual_kind', media.visual_kind,
          'files', coalesce((
            select jsonb_agg(
              jsonb_build_object(
                'kind', file.kind,
                'bucket_id', file.bucket_id,
                'object_path', file.object_path,
                'width', file.width,
                'height', file.height,
                'mime_type', file.mime_type
              ) order by
                case file.kind
                  when 'thumbnail'::public.media_file_kind then 1
                  when 'small'::public.media_file_kind then 2
                  when 'medium'::public.media_file_kind then 3
                  when 'large'::public.media_file_kind then 4
                  else 5
                end
            )
            from public.media_files file
            where file.media_id = media.media_id
              and file.bucket_id = 'wiki-published'
              and file.kind <> 'original'::public.media_file_kind
          ), '[]'::jsonb)
        ) order by link.position, media.created_at
      )
      from public.wiki_revision_media link
      join public.media_assets media on media.media_id = link.media_id
      where link.revision_id = revision.revision_id
        and media.state = 'published'::public.media_state
    ), '[]'::jsonb)
  )
  from public.wiki_articles article
  join public.wiki_revisions revision
    on revision.revision_id = article.published_revision_id
  where article.entity_id = p_entity_id;
$$;

revoke all on function public.get_published_wiki_article(text) from public;
grant execute on function public.get_published_wiki_article(text) to anon, authenticated;

comment on function public.get_published_wiki_article(text) is
  'Public RLS-respecting projection. Drafts, private originals and non-current revisions are excluded.';
