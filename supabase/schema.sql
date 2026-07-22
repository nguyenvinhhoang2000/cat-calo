-- =====================================================================
--  MèoCalo — Lược đồ cơ sở dữ liệu (Supabase / PostgreSQL)
--  Chạy file này trong: Supabase Dashboard → SQL Editor → New query
-- =====================================================================
--
--  Mô hình nhận diện: theo "device_id" (một UUID sinh ở trình duyệt và
--  lưu trong localStorage). Chưa dùng auth nên RLS mở cho vai trò anon.
--  Nếu sau này bật Supabase Auth, hãy thay device_id bằng auth.uid()
--  và siết lại policy tương ứng.
-- =====================================================================

-- --- Bảng nhật ký món ăn ---------------------------------------------
create table if not exists public.entries (
    id          uuid primary key default gen_random_uuid(),
    device_id   text        not null,
    entry_date  date        not null,
    name        text        not null,
    kcal        integer     not null check (kcal > 0),
    meal        text        not null check (meal in ('breakfast', 'lunch', 'dinner', 'snack')),
    created_at  timestamptz not null default now()
);

-- Truy vấn thường lọc theo (device_id, ngày) và sắp theo lúc tạo.
create index if not exists entries_device_date_idx
    on public.entries (device_id, entry_date, created_at);

-- --- Bảng mục tiêu calo theo ngày ------------------------------------
create table if not exists public.daily_goals (
    device_id   text        not null,
    goal_date   date        not null,
    goal        integer     not null check (goal >= 0),
    updated_at  timestamptz not null default now(),
    primary key (device_id, goal_date)
);

-- --- Bảng nhật ký tập luyện (calo tiêu hao) --------------------------
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

-- =====================================================================
--  Row Level Security
--  Bật RLS rồi cho phép vai trò anon thao tác. Vì chỉ có anon key ở
--  client, đây là cấu hình tối thiểu để app chạy. LƯU Ý: dữ liệu KHÔNG
--  cách ly tuyệt đối giữa các thiết bị — bất kỳ ai có anon key về mặt
--  kỹ thuật đều đọc được mọi hàng. Chấp nhận được với app cá nhân;
--  nâng lên Supabase Auth nếu cần bảo mật chặt.
-- =====================================================================
alter table public.entries      enable row level security;
alter table public.daily_goals  enable row level security;
alter table public.workouts     enable row level security;

drop policy if exists "anon full access - entries" on public.entries;
create policy "anon full access - entries"
    on public.entries for all
    to anon
    using (true)
    with check (true);

drop policy if exists "anon full access - workouts" on public.workouts;
create policy "anon full access - workouts"
    on public.workouts for all
    to anon
    using (true)
    with check (true);

drop policy if exists "anon full access - daily_goals" on public.daily_goals;
create policy "anon full access - daily_goals"
    on public.daily_goals for all
    to anon
    using (true)
    with check (true);
