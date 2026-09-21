-- Read only: after applying 202609210001_editorial_conflict_sqlstate.sql.
-- Expected: six rows, old_retry_code=false and http_conflict_code=true on each.
select p.proname as function_name,
  position('errcode = ''40001''' in p.prosrc) > 0 as old_retry_code,
  position('errcode = ''PT409''' in p.prosrc) > 0 as http_conflict_code
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'save_wiki_draft', 'publish_wiki_draft', 'rollback_wiki_article',
    'attach_media_to_wiki_draft', 'remove_media_from_wiki_draft',
    'reorder_wiki_draft_media'
  )
order by p.proname;

-- Candidates only. Do not terminate every returned PID.
-- Confirm an old repeated SQLSTATE 40001 process_id in Logs Explorer before
-- deciding to terminate that exact backend. A new migration alone may not stop
-- requests already in progress. Query contents and Auth identifiers are omitted.
select pid, state, query_start, now() - query_start as elapsed,
  wait_event_type, wait_event
from pg_stat_activity
where usename = 'authenticator'
  and state = 'active'
  and query_start < now() - interval '30 seconds'
  and query ~ '(save_wiki_draft|publish_wiki_draft|rollback_wiki_article|attach_media_to_wiki_draft|remove_media_from_wiki_draft|reorder_wiki_draft_media)'
order by query_start;
