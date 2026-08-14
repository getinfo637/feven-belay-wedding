-- Run this once in Supabase SQL Editor.
-- It changes the RSVP rule to: accepted = 1, declined = 0.
alter table public.rsvps
drop constraint if exists rsvps_number_attending_check;

alter table public.rsvps
add constraint rsvps_number_attending_check
check (
  (attendance_status = 'accepted' and number_attending = 1)
  or
  (attendance_status = 'declined' and number_attending = 0)
);

drop policy if exists "Guests can submit RSVP" on public.rsvps;

create policy "Guests can submit RSVP"
on public.rsvps
for insert
to anon
with check (
  length(trim(guest_name)) between 2 and 100
  and (
    (attendance_status = 'accepted' and number_attending = 1)
    or
    (attendance_status = 'declined' and number_attending = 0)
  )
);
