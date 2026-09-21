-- Forward-only fix. Apply after 202609160001-202609160005; do not rerun bootstrap.
-- 40001 is a transient serialization failure; older PostgREST versions retry it.
-- An obsolete editor token is a permanent application conflict, HTTP 409.
-- Keep existing function bodies, locks, grants and data unchanged except this code.
do $migration$
declare
  target record;
  function_oid oid;
  definition text;
  old_marker constant text := 'errcode = ''40001''';
  new_marker constant text := 'errcode = ''PT409''';
  marker_count integer;
begin
  for target in select * from (values
    ('public.save_wiki_draft(text,jsonb,text,text,text,bigint,uuid,uuid)', 3),
    ('public.publish_wiki_draft(text,bigint,text,uuid)', 2),
    ('public.rollback_wiki_article(text,uuid,uuid,text)', 1),
    ('public.attach_media_to_wiki_draft(text,uuid,public.media_role,text,uuid,bigint)', 1),
    ('public.remove_media_from_wiki_draft(text,uuid,uuid,bigint)', 1),
    ('public.reorder_wiki_draft_media(text,uuid[],uuid,bigint)', 1)
  ) as targets(signature, expected_count)
  loop
    function_oid := to_regprocedure(target.signature);
    if function_oid is null then
      raise exception 'Required editorial function missing: %', target.signature;
    end if;
    definition := pg_get_functiondef(function_oid);
    marker_count := (length(definition) - length(replace(definition, old_marker, ''))) / length(old_marker)
      + (length(definition) - length(replace(definition, new_marker, ''))) / length(new_marker);
    if marker_count <> target.expected_count then
      raise exception 'Unexpected conflict guards in %; inspect before applying', target.signature;
    end if;
    -- CREATE OR REPLACE from pg_get_functiondef preserves the signature, security
    -- configuration and existing grants. The DO statement is atomic and repeatable.
    execute replace(definition, old_marker, new_marker);
  end loop;
end;
$migration$;

notify pgrst, 'reload schema';
