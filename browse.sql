-- Run after schema.sql. Lets free users SEE premium items (locked) without exposing their files.
create or replace function browse_documents(q text default '', k doc_kind default null)
returns table (id uuid, title text, course_code text, kind doc_kind,
               session text, is_premium boolean, locked boolean)
language sql stable security definer set search_path = public as $$
  select d.id, d.title, d.course_code, d.kind, d.session, d.is_premium,
         (d.is_premium and not is_premium(auth.uid())) as locked
  from documents d
  where auth.uid() is not null
    and d.status = 'approved'
    and (k is null or d.kind = k)
    and (q = '' or d.course_code ilike '%' || q || '%' or d.title ilike '%' || q || '%')
  order by d.course_code, d.session desc nulls last
  limit 60;
$$;

-- Logged-in users only (Supabase grants new functions to everyone by default)
revoke execute on function browse_documents(text, doc_kind) from public, anon;
grant  execute on function browse_documents(text, doc_kind) to authenticated;
revoke execute on function hash_exists(text) from public, anon;
grant  execute on function hash_exists(text) to authenticated;
