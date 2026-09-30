-- Run after schema.sql. Adds moderators and LOCKS DOWN profile edits.

alter table profiles add column is_moderator boolean not null default false;

create or replace function is_moderator(uid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select is_moderator from profiles where id = uid), false);
$$;

create policy "mods read all docs" on documents for select to authenticated
  using (is_moderator(auth.uid()));
create policy "mods update docs" on documents for update to authenticated
  using (is_moderator(auth.uid())) with check (is_moderator(auth.uid()));
create policy "mods read all files" on storage.objects for select to authenticated
  using (bucket_id = 'documents' and is_moderator(auth.uid()));

-- SECURITY FIX for schema.sql: students could previously edit their own
-- premium_until / is_moderator. Now they can only change these four columns.
drop policy "own profile update" on profiles;
create policy "own profile update" on profiles for update
  using (id = auth.uid()) with check (id = auth.uid());
revoke update on profiles from authenticated, anon;
grant update (full_name, university, department, level) on profiles to authenticated;

-- Make yourself a moderator (replace the email):
-- update profiles set is_moderator = true
--   where id = (select id from auth.users where email = 'you@example.com');
