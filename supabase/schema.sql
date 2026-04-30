-- Run this in Supabase SQL Editor
-- Development-friendly schema and policies for fleet vehicle management

create extension if not exists pgcrypto;

create table if not exists vehicles (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  model text not null,
  model_year_label text default '2024+',
  categories jsonb default '[]'::jsonb,
  image_urls jsonb default '[]'::jsonb,
  rental_packages jsonb default '[]'::jsonb,
  description_tr text,
  description_en text,
  services_tr text,
  terms_tr text,
  user_rules_tr text,
  active boolean default true,
  featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists settings (
  id text primary key,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

create table if not exists architecture_categories (
  id uuid primary key default gen_random_uuid(),
  title_tr text not null,
  title_en text,
  slug text unique not null,
  description_tr text,
  description_en text,
  cover_image_url text,
  active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists architecture_projects (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references architecture_categories(id) on delete cascade,
  title_tr text not null,
  title_en text,
  slug text not null,
  short_description_tr text,
  short_description_en text,
  detailed_description_tr text,
  detailed_description_en text,
  subtitle_tr text,
  subtitle_en text,
  cover_image_url text,
  gallery_image_urls jsonb default '[]'::jsonb,
  location_tr text,
  location_en text,
  status_tr text,
  status_en text,
  year text,
  active boolean default true,
  featured boolean default false,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function set_vehicles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_set_vehicles_updated_at on vehicles;
create trigger trg_set_vehicles_updated_at
before update on vehicles
for each row
execute function set_vehicles_updated_at();

create or replace function set_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_set_settings_updated_at on settings;
create trigger trg_set_settings_updated_at
before update on settings
for each row
execute function set_settings_updated_at();

drop trigger if exists trg_set_architecture_categories_updated_at on architecture_categories;
create trigger trg_set_architecture_categories_updated_at
before update on architecture_categories
for each row
execute function set_settings_updated_at();

drop trigger if exists trg_set_architecture_projects_updated_at on architecture_projects;
create trigger trg_set_architecture_projects_updated_at
before update on architecture_projects
for each row
execute function set_settings_updated_at();

alter table vehicles enable row level security;
alter table settings enable row level security;
alter table architecture_categories enable row level security;
alter table architecture_projects enable row level security;

drop policy if exists "vehicles_select_dev" on vehicles;
create policy "vehicles_select_dev"
on vehicles
for select
to anon, authenticated
using (true);

drop policy if exists "vehicles_insert_dev" on vehicles;
create policy "vehicles_insert_dev"
on vehicles
for insert
to anon, authenticated
with check (true);

drop policy if exists "vehicles_update_dev" on vehicles;
create policy "vehicles_update_dev"
on vehicles
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "vehicles_delete_dev" on vehicles;
create policy "vehicles_delete_dev"
on vehicles
for delete
to anon, authenticated
using (true);

drop policy if exists "settings_select_dev" on settings;
create policy "settings_select_dev"
on settings
for select
to anon, authenticated
using (true);

drop policy if exists "settings_insert_dev" on settings;
create policy "settings_insert_dev"
on settings
for insert
to anon, authenticated
with check (true);

drop policy if exists "settings_update_dev" on settings;
create policy "settings_update_dev"
on settings
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "settings_delete_dev" on settings;
create policy "settings_delete_dev"
on settings
for delete
to anon, authenticated
using (true);

drop policy if exists "architecture_categories_select_dev" on architecture_categories;
create policy "architecture_categories_select_dev"
on architecture_categories
for select
to anon, authenticated
using (true);

drop policy if exists "architecture_categories_insert_dev" on architecture_categories;
create policy "architecture_categories_insert_dev"
on architecture_categories
for insert
to anon, authenticated
with check (true);

drop policy if exists "architecture_categories_update_dev" on architecture_categories;
create policy "architecture_categories_update_dev"
on architecture_categories
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "architecture_categories_delete_dev" on architecture_categories;
create policy "architecture_categories_delete_dev"
on architecture_categories
for delete
to anon, authenticated
using (true);

drop policy if exists "architecture_projects_select_dev" on architecture_projects;
create policy "architecture_projects_select_dev"
on architecture_projects
for select
to anon, authenticated
using (true);

drop policy if exists "architecture_projects_insert_dev" on architecture_projects;
create policy "architecture_projects_insert_dev"
on architecture_projects
for insert
to anon, authenticated
with check (true);

drop policy if exists "architecture_projects_update_dev" on architecture_projects;
create policy "architecture_projects_update_dev"
on architecture_projects
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "architecture_projects_delete_dev" on architecture_projects;
create policy "architecture_projects_delete_dev"
on architecture_projects
for delete
to anon, authenticated
using (true);

-- Optional: storage policies for "media" bucket uploads from anon/authenticated
-- Make sure a bucket named "media" exists in Storage.
drop policy if exists "media_select_dev" on storage.objects;
create policy "media_select_dev"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'media');

drop policy if exists "media_insert_dev" on storage.objects;
create policy "media_insert_dev"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'media');

drop policy if exists "media_update_dev" on storage.objects;
create policy "media_update_dev"
on storage.objects
for update
to anon, authenticated
using (bucket_id = 'media')
with check (bucket_id = 'media');

drop policy if exists "media_delete_dev" on storage.objects;
create policy "media_delete_dev"
on storage.objects
for delete
to anon, authenticated
using (bucket_id = 'media');
