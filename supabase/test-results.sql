-- Public test-result lookup for Zehin dag.
-- Run once in Supabase SQL Editor after the base schema.
create table if not exists public.test_results (
  id uuid primary key default gen_random_uuid(),
  student_number text not null,
  surname text not null,
  exam_title text not null default 'Synag',
  score numeric(7,2) not null check (score >= 0),
  max_score numeric(7,2) not null default 100 check (max_score > 0 and score <= max_score),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  published_at timestamptz
);

create index if not exists test_results_lookup_idx
  on public.test_results (lower(trim(student_number)), lower(trim(surname)));

alter table public.test_results enable row level security;

drop policy if exists "admin manage test results" on public.test_results;
create policy "admin manage test results"
  on public.test_results for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create or replace function public.lookup_test_results(p_student_number text, p_surname text)
returns table (
  exam_title text,
  score numeric,
  max_score numeric,
  published_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select r.exam_title, r.score, r.max_score, r.published_at
  from public.test_results r
  where r.published = true
    and lower(trim(r.student_number)) = lower(trim(coalesce(p_student_number, '')))
    and lower(trim(r.surname)) = lower(trim(coalesce(p_surname, '')))
  order by coalesce(r.published_at, r.created_at) desc;
$$;

revoke all on function public.lookup_test_results(text, text) from public;
grant execute on function public.lookup_test_results(text, text) to anon, authenticated;
