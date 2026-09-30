-- Run after schema.sql. Payment log; reference is unique so a replayed webhook can't extend premium twice.
create table payments (
  reference text primary key,
  user_id uuid not null references profiles(id),
  plan_id text not null references plans(id),
  amount_kobo int not null,
  paid_at timestamptz default now()
);
alter table payments enable row level security;   -- no policies: only the service role can touch it
create policy "read own payments" on payments for select to authenticated using (user_id = auth.uid());
