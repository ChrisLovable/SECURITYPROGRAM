-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create sites table
create table sites (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  required_base int not null check (required_base >= 0),
  required_relief int not null check (required_relief >= 0),
  permanent_only boolean not null default false,
  created_at timestamptz default now()
);

-- Create guards table
create table guards (
  id uuid primary key default gen_random_uuid(),
  badge text unique not null,
  full_name text not null,
  phone text,
  permanent_site_id uuid references sites(id) on delete set null,
  in_rotation boolean not null default true,
  cycle_start date not null,
  active boolean not null default true,
  created_at timestamptz default now()
);

-- Create assignments table (daily roster)
create table assignments (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references sites(id) on delete cascade not null,
  guard_id uuid references guards(id) on delete set null,
  work_date date not null,
  shift text not null default 'day',
  status text not null default 'scheduled' check (status in ('scheduled', 'unfilled', 'leave', 'sick')),
  created_at timestamptz default now(),
  unique (site_id, work_date, shift, guard_id)
);

-- Create swaps table
create table swaps (
  id uuid primary key default gen_random_uuid(),
  from_guard_id uuid references guards(id) on delete cascade not null,
  to_guard_id uuid references guards(id) on delete cascade not null,
  date_from date not null,
  date_to date not null,
  site_id uuid references sites(id) on delete cascade not null,
  reason text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now(),
  check (date_from <= date_to),
  check (from_guard_id != to_guard_id)
);

-- Create notifications table
create table notifications (
  id uuid primary key default gen_random_uuid(),
  guard_id uuid references guards(id) on delete cascade,
  title text not null,
  body text not null,
  deliver_at timestamptz not null,
  delivered boolean not null default false,
  created_at timestamptz default now()
);

-- Create indexes for performance
create index idx_assignments_date on assignments(work_date);
create index idx_assignments_guard_date on assignments(guard_id, work_date);
create index idx_assignments_site_date on assignments(site_id, work_date);
create index idx_assignments_status on assignments(status);

create index idx_guards_cycle_start on guards(cycle_start);
create index idx_guards_permanent_site on guards(permanent_site_id);
create index idx_guards_active on guards(active);

create index idx_swaps_status on swaps(status);
create index idx_swaps_dates on swaps(date_from, date_to);

create index idx_notifications_deliver_at on notifications(deliver_at);
create index idx_notifications_guard on notifications(guard_id);

-- Row Level Security policies

-- Enable RLS on all tables
alter table sites enable row level security;
alter table guards enable row level security;
alter table assignments enable row level security;
alter table swaps enable row level security;
alter table notifications enable row level security;

-- Sites: Everyone can read, only authenticated users can modify
create policy "Anyone can view sites" on sites
  for select using (true);

create policy "Authenticated users can manage sites" on sites
  for all using (auth.role() = 'authenticated');

-- Guards: Everyone can read, only authenticated users can modify
create policy "Anyone can view guards" on guards
  for select using (true);

create policy "Authenticated users can manage guards" on guards
  for all using (auth.role() = 'authenticated');

-- Assignments: Everyone can read, only authenticated users can modify
create policy "Anyone can view assignments" on assignments
  for select using (true);

create policy "Authenticated users can manage assignments" on assignments
  for all using (auth.role() = 'authenticated');

-- Swaps: Guards can view their own swaps, authenticated users can manage all
create policy "Guards can view their swaps" on swaps
  for select using (
    auth.uid()::text = from_guard_id::text or 
    auth.uid()::text = to_guard_id::text or
    auth.role() = 'authenticated'
  );

create policy "Authenticated users can manage swaps" on swaps
  for all using (auth.role() = 'authenticated');

-- Notifications: Guards can view their own notifications, authenticated users can manage all
create policy "Guards can view their notifications" on notifications
  for select using (
    auth.uid()::text = guard_id::text or
    auth.role() = 'authenticated'
  );

create policy "Authenticated users can manage notifications" on notifications
  for all using (auth.role() = 'authenticated');

