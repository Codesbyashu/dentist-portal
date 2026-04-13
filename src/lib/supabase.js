import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/*
==============================================
  PASTE THIS SQL IN SUPABASE → SQL EDITOR
==============================================

-- 1. DOCTORS TABLE
create table doctors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  specialization text,
  available_days text[] default '{Mon,Tue,Wed,Thu,Fri,Sat}',
  created_at timestamptz default now()
);

insert into doctors (name, specialization) values
  ('Dr. Anil Sharma', 'General Dentistry'),
  ('Dr. Priya Nair', 'Orthodontics');

-- 2. PROFILES TABLE (extends Supabase auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text default 'patient',  -- 'patient' or 'admin'
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'patient');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- 3. APPOINTMENTS TABLE
create table appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references profiles(id) on delete cascade,
  doctor_id uuid references doctors(id),
  appointment_date date not null,
  appointment_time time not null,
  service text not null,
  notes text,
  status text default 'upcoming',  -- 'upcoming', 'completed', 'cancelled'
  created_at timestamptz default now()
);

-- 4. PRESCRIPTIONS TABLE
create table prescriptions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references profiles(id) on delete cascade,
  appointment_id uuid references appointments(id),
  doctor_id uuid references doctors(id),
  medication text not null,
  dosage text,
  instructions text,
  issued_date date default current_date,
  created_at timestamptz default now()
);

-- 5. ROW LEVEL SECURITY (RLS) — patients see only their data
alter table profiles enable row level security;
alter table appointments enable row level security;
alter table prescriptions enable row level security;

-- Profiles: user sees only their own
create policy "Users see own profile" on profiles
  for all using (auth.uid() = id);

-- Appointments: patient sees own, admin sees all
create policy "Patient sees own appointments" on appointments
  for select using (auth.uid() = patient_id);

create policy "Patient inserts own appointments" on appointments
  for insert with check (auth.uid() = patient_id);

create policy "Admin sees all appointments" on appointments
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Prescriptions: patient sees own, admin sees all
create policy "Patient sees own prescriptions" on prescriptions
  for select using (auth.uid() = patient_id);

create policy "Admin manages prescriptions" on prescriptions
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Doctors: everyone can read
create policy "Anyone reads doctors" on doctors
  for select using (true);

==============================================
*/
