-- Read only. Run in SQL Editor; no configuration or connection is changed.
-- These are connection/configuration clues, NOT physical RAM or swap measurements.
-- Query text, client addresses, credentials and application users are omitted.
select backend_type, coalesce(state, 'background') as state,
  count(*) as connection_count,
  count(*) filter (where state = 'active'
    and query_start < now() - interval '30 seconds') as active_over_30_seconds,
  count(*) filter (where state like 'idle in transaction%') as idle_transactions
from pg_stat_activity
where datname = current_database()
  and pid <> pg_backend_pid()
group by backend_type, state
order by connection_count desc;

-- Context only: a setting is not evidence that its maximum is currently in use.
select name, setting, unit
from pg_settings
where name in ('max_connections', 'shared_buffers', 'work_mem', 'maintenance_work_mem')
order by name;
