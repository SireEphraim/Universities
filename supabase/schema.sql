-- StudyBank schema. Run in Supabase Dashboard > SQL Editor.

create type plan_tier as enum ('free', 'premium');
create type doc_status as enum ('pending', 'approved', 'rejected');
create type doc_kind as enum ('past_question', 'material');

-- Plans a student can buy (prices in kobo; edit to suit)
create table plans (
  id text primary key,                -- 'monthly' | 'semester' | 'annual'
  label text not null,
  price_kobo int not null,
  duration_days int not null
);
insert into plans values
  ('monthly',  'Monthly',  150000,  30),
  ('semester', 'Semester', 500000, 120),
  ('annual',   'Annual',   900000, 365);

-- One profile per registered user
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  university text,
  department text,
  level int,
  tier plan_tier not null default 'free',
  premium_until timestamptz,
  created_at timestamptz default now()
);

create or replace function is_premium(uid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select tier = 'premium' and premium_until > now()
                   from profiles where id = uid), false);
$$;

create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, university, department, level)
  values (new.id,
          new.raw_user_meta_data->>'full_name',
          new.raw_user_meta_data->>'university',
          new.raw_user_meta_data->>'department',
          nullif(new.raw_user_meta_data->>'level','')::int);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- Documents. content_hash UNIQUE is what blocks duplicates.
create table documents (
  id uuid primary key default gen_random_uuid(),
  content_hash text not null unique,      -- SHA-256 hex of the file bytes
  title text not null,
  course_code text not null,
  kind doc_kind not null,
  session text,                            -- e.g. 2023/2024
  storage_path text not null,
  file_size bigint,
  is_premium boolean not null default false,
  status doc_status not null default 'pending',
  uploaded_by uuid references profiles(id),
  created_at timestamptz default now()
);
create index on documents (course_code);

-- Row Level Security
alter table profiles  enable row level security;
alter table documents enable row level security;
alter table plans     enable row level security;

create policy "own profile read"   on profiles  for select using (id = auth.uid());
-- Users may edit profile details but NOT tier/premium_until (set by payment webhook only)
create policy "own profile update" on profiles  for update using (id = auth.uid())
  with check (id = auth.uid() and tier = (select tier from profiles where id = auth.uid()));
create policy "plans public"       on plans     for select using (true);

create policy "browse approved" on documents for select to authenticated
  using ((status = 'approved' and (not is_premium or is_premium(auth.uid())))
         or uploaded_by = auth.uid());
create policy "students upload" on documents for insert to authenticated
  with check (uploaded_by = auth.uid() and status = 'pending' and is_premium = false);

-- Duplicate check that works even for hashes the user can't otherwise see
create or replace function hash_exists(h text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from documents where content_hash = h);
$$;

-- Private storage bucket; files are stored under their hash
insert into storage.buckets (id, name, public) values ('documents', 'documents', false);
create policy "upload to bucket" on storage.objects for insert to authenticated
  with check (bucket_id = 'documents');
create policy "read approved files" on storage.objects for select to authenticated
  using (bucket_id = 'documents' and exists (
    select 1 from documents d where d.storage_path = name
      and ((d.status = 'approved' and (not d.is_premium or is_premium(auth.uid())))
           or d.uploaded_by = auth.uid())));
