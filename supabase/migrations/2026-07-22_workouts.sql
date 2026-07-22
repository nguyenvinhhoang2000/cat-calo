-- =====================================================================
--  Migration: thêm bảng tập luyện (calo tiêu hao)
--  Chạy trong Supabase Dashboard → SQL Editor cho DB đã tồn tại.
-- =====================================================================
create table if not exists public.workouts (
    id          uuid primary key default gen_random_uuid(),
    device_id   text        not null,
    entry_date  date        not null,
    name        text        not null,
    kcal        integer     not null check (kcal > 0),
    created_at  timestamptz not null default now()
);

create index if not exists workouts_device_date_idx
    on public.workouts (device_id, entry_date, created_at);

alter table public.workouts enable row level security;

drop policy if exists "anon full access - workouts" on public.workouts;
create policy "anon full access - workouts"
    on public.workouts for all
    to anon
    using (true)
    with check (true);
