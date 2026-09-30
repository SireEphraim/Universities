-- Run AFTER moderator.sql. Adds each student's email to their profile.

alter table profiles add column email text;
update profiles p set email = u.email from auth.users u where u.id = p.id;   -- existing users

-- New sign-ups get their email copied in (same trigger as before, one more column)
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email, full_name, university, department, level)
  values (new.id, new.email,
          new.raw_user_meta_data->>'full_name',
          new.raw_user_meta_data->>'university',
          new.raw_user_meta_data->>'department',
          nullif(new.raw_user_meta_data->>'level','')::int);
  return new;
end $$;

-- Keep it in sync if a student changes their email
create or replace function sync_profile_email() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update profiles set email = new.email where id = new.id;
  return new;
end $$;
create trigger on_auth_user_email_changed after update of email on auth.users
  for each row when (old.email is distinct from new.email)
  execute function sync_profile_email();

-- Moderators can see students' emails; students can't edit the column
-- (moderator.sql already limits editable columns to name/university/department/level)
create policy "mods read profiles" on profiles for select to authenticated
  using (is_moderator(auth.uid()));
