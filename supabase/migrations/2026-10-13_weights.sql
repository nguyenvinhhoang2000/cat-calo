-- =====================================================================
--  Migration: thêm bảng cân nặng theo ngày
--  Chạy trong Supabase Dashboard → SQL Editor cho DB đã tồn tại.
-- =====================================================================
create table if not exists public.weights (
    device_id   text          not null,
    weigh_date  date          not null,
    kg          numeric(5, 1) not null check (kg > 0 and kg <= 500),
    updated_at  timestamptz   not null default now(),
    primary key (device_id, weigh_date)
);

create index if not exists weights_device_date_idx
    on public.weights (device_id, weigh_date);

alter table public.weights enable row level security;

drop policy if exists "anon full access - weights" on public.weights;
create policy "anon full access - weights"
    on public.weights for all
    to anon
    using (true)
    with check (true);
