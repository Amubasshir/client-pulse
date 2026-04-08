# CLAUDE.md

## What is this?

Team logs daily updates per project, copies formatted messages to paste into WhatsApp/Fiverr/Upwork. Single Next.js app, no separate backend.

## Tech

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4 (CSS-first config via `@theme` directive, NOT `tailwind.config.ts`)
- MongoDB Atlas (Mongoose) — free tier
- NextAuth v5, Credentials provider, JWT sessions, bcrypt passwords

## Commands

```
npm run dev / npm run build / npm run lint
npx tsx scripts/seed.ts  # seed admin account
```

## Architecture

All API logic in `app/api/` route handlers. No Express, no separate server. MongoDB connection cached in `lib/db.ts`. Middleware protects all routes except `/login` and `/api/auth/*`.

## Roles

- **Admin**: full CRUD everything — projects, updates, team members
- **Member**: see assigned projects only, edit/delete own updates only
- No self-signup. Admin creates all accounts.

## Design

- Dark mode ONLY, warm earth tones (not cold grays)
- Refer to `PRD-ClientPulse.md` Section 6 for full color palette, the key tokens:
  - Page bg: `#12100E`, Cards: `#221E19`, Borders: `#2E2923`
  - Primary accent (copper): `#C4956A`, CTA/danger (burnt red): `#C4553A`
  - Text: `#F0E6DC` / `#B8A898` / `#7A6B5D`
- Font: DM Sans (Google Fonts)
- Collapsible sidebar (240px expanded, 64px collapsed)

## Critical Rules

- No light mode, no external auth providers, no self-signup
- No WhatsApp/Fiverr/Upwork API integration — copy-paste only
- "Copy for Client" button must NEVER include the internal `notes` field
- Members must never see unassigned projects or edit others' updates
- Tailwind 4: use `@import "tailwindcss"` + `@theme {}` in CSS, not JS config
