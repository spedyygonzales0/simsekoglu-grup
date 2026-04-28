# Simsekoglu Grup Corporate Website

Premium corporate lead-generation website for **Şimşekoğlu Grup** built with Next.js App Router, TypeScript, and Tailwind CSS.

## Run Locally

```bash
npm install
npm run dev
```

Open:

- `http://localhost:3000`
- `http://localhost:3000/admin`

If PowerShell blocks npm scripts, run via Command Prompt style:

```bash
cmd /c npm run dev
```

## Business Logic (Important)

This is **not** an online rental platform.

- Customers do not create accounts
- Customers do not login
- Customers do not complete rentals or payments online
- Customers browse services/vehicles and send quote requests

## Admin Access

Admin is hidden from public navigation and only reachable by direct URL:

- `/admin`

Temporary credentials:

- username: `admin`
- password: `admin123`

## Image Folder Rules

Use category-separated folders:

- `public/images/fleet` for vehicle/fleet media
- `public/images/construction` for construction media/placeholders
- `public/images/architecture` for architecture media/placeholders
- `public/images/general` for logo/hero/about placeholders

Important:

- Fleet images are used only in fleet components/pages
- Construction and architecture sections use neutral premium placeholders until final media is ready

## Quote Flow

Primary CTA:

- `Teklif Al` opens WhatsApp with prefilled text (`wa.me` + `encodeURIComponent`)

Secondary CTA:

- `Form` opens quote form modal
- Form requests are stored in localStorage
- Requests are shown in admin under **Users / Customer Requests**

## Admin Sections

`/admin` includes:

- Dashboard
- Vehicles
- Projects
- Architecture Content
- Construction Content
- Homepage Content
- Contact Settings
- Media Library
- Users / Customer Requests
- Settings

## Storage Layer (DB-Ready)

All local persistence is abstracted under:

- `lib/storage/client.ts`
- `lib/storage/keys.ts`

This keeps the app ready for future migration to Supabase/Firebase/PostgreSQL.
