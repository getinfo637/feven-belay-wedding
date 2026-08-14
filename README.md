# ፌቨን ♥ በላይ — Luxury Wedding Invitation

This is a GitHub-friendly static wedding invitation with:
- Amharic-first UI + English switch
- luxury burgundy/gold design
- Orthodox-inspired details
- your uploaded photos
- countdown
- gallery lightbox
- Google Maps link
- music button
- one-person RSVP
- Supabase database support
- private authenticated RSVP dashboard

## Important time note
The Amharic time you supplied, **6:00 ከሰዓት**, means **6:00 PM**. This project therefore uses May 23, 2027 at 6:00 PM East Africa Time. If you intended 12:00 PM/noon, change `weddingDateISO` in `config.js` to `2027-05-23T12:00:00+03:00`.

## 1. Create GitHub repository
1. Sign in to GitHub.
2. Click **New repository**.
3. Name it something like `feven-belay-wedding`.
4. Choose Public.
5. Create the repository.
6. Upload the contents of this folder (not the outer folder itself).

## 2. Set up Supabase
1. Create a Supabase project.
2. Open SQL Editor.
3. Paste and run `schema.sql`.
4. In Authentication > Users, create the organizer/admin user email and password.
5. Open Project Settings > API.
6. Copy the Project URL and the public anon key.
7. Put them in `config.js`.

Example:
window.WEDDING_CONFIG = {
  weddingDateISO: "2027-05-23T18:00:00+03:00",
  supabaseUrl: "https://YOURPROJECT.supabase.co",
  supabaseAnonKey: "YOUR_PUBLIC_ANON_KEY",
  adminPath: "admin/"
};

Never put a Supabase service-role key in GitHub.

## 3. Add your song
Put your MP3 at:
`assets/music/wedding-song.mp3`

The browser requires a user gesture before audio starts, so the invitation has a music button.

## 4. Publish with GitHub Pages
In GitHub:
Settings > Pages > Build and deployment > Deploy from a branch > main > /(root) > Save.

After deployment, GitHub will show your public URL.

## 5. Admin dashboard
Open:
`YOUR-SITE-URL/admin/`

Sign in using the Supabase Auth user you created. The dashboard shows accepted, declined, total, guest name, attendance, and RSVP timestamp.

## 6. RSVP behavior
Each submission stores:
- guest name
- accepted/declined
- number attending (1 for accepted, 0 for declined)
- timestamp

The database has a normalized-name unique index to reduce duplicate submissions.

## 7. Optional notification
Email/SMS/WhatsApp notifications should be added server-side (for example with a Supabase Edge Function). Do not put private provider API keys in this static website.
