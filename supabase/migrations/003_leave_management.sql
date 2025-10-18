-- Add leave requests table
create table leave_requests (
  id uuid primary key default gen_random_uuid(),
  guard_id uuid references guards(id) on delete cascade not null,
  leave_type text not null check (leave_type in ('sick', 'vacation', 'personal', 'training', 'emergency')),
  start_date date not null,
  end_date date not null,
  reason text,
  status text not null default 'pending' check (status in ('pending', 'supervisor_approved', 'manager_approved', 'rejected')),
  supervisor_notes text,
  manager_notes text,
  supervisor_approved_at timestamptz,
  manager_approved_at timestamptz,
  created_at timestamptz default now(),
  check (start_date <= end_date)
);

-- Add indexes for leave requests
create index idx_leave_requests_guard on leave_requests(guard_id);
create index idx_leave_requests_status on leave_requests(status);
create index idx_leave_requests_dates on leave_requests(start_date, end_date);

-- Add RLS policies for leave requests
alter table leave_requests enable row level security;

create policy "Guards can view their own leave requests" on leave_requests
  for select using (
    auth.uid()::text = guard_id::text or
    auth.role() = 'authenticated'
  );

create policy "Guards can create leave requests" on leave_requests
  for insert with check (
    auth.uid()::text = guard_id::text or
    auth.role() = 'authenticated'
  );

create policy "Authenticated users can manage leave requests" on leave_requests
  for all using (auth.role() = 'authenticated');

-- Add user roles table for better permission management
create table user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  guard_id uuid references guards(id) on delete cascade,
  role text not null check (role in ('guard', 'supervisor', 'manager', 'admin')),
  created_at timestamptz default now(),
  unique (user_id)
);

-- Add indexes for user roles
create index idx_user_roles_user_id on user_roles(user_id);
create index idx_user_roles_guard_id on user_roles(guard_id);
create index idx_user_roles_role on user_roles(role);

-- Add RLS policies for user roles
alter table user_roles enable row level security;

create policy "Users can view their own role" on user_roles
  for select using (
    auth.uid() = user_id or
    auth.role() = 'authenticated'
  );

create policy "Authenticated users can manage roles" on user_roles
  for all using (auth.role() = 'authenticated');








