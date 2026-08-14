-- Supabase setup for the wedding RSVP system.
create extension if not exists pgcrypto;

create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  attendance_status text not null check (attendance_status in ('accepted','declined')),
  number_attending integer not null default 0 check (number_attending in (0,1)),
  created_at timestamptz not null default now()
);

-- A simple duplicate guard by normalized guest name.
create unique index if not exists rsvps_guest_name_unique
on public.rsvps (lower(trim(guest_name)));

alter table public.rsvps enable row level security;

-- Guests can insert an RSVP, but cannot read other guests' records.
drop policy if exists "Public can submit RSVP" on public.rsvps;
create policy "Public can submit RSVP"
on public.rsvps for insert
to anon
with check (number_attending = case when attendance_status='accepted' then 1 else 0 end);

-- Authenticated admins can read the dashboard.
drop policy if exists "Authenticated admins can view RSVPs" on public.rsvps;
create policy "Authenticated admins can view RSVPs"
on public.rsvps for select
to authenticated
using (true);
