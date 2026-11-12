alter table public.vehicles
  add column if not exists source_name text,
  add column if not exists source_phone text;
