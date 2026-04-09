# ClientPulse

> A focused daily update tracker that keeps your clients informed — without the chaos.

---

## The Problem

Freelancers and small agencies juggle multiple client projects across WhatsApp, Fiverr, and Upwork simultaneously. Every day brings the same friction: remembering what each team member worked on, formatting it clearly, and sending it to the right client on the right platform — manually, every single day.

This creates three real problems:

1. **Lost accountability** — Updates get forgotten, buried in chat history, or simply never sent.
2. **Inconsistent communication** — Clients receive updates in different formats depending on who sends them and when.
3. **Context switching** — Jumping between platforms to copy-paste scraps of information wastes time and introduces errors.

## The Solution

**ClientPulse** is a private, self-hosted team update hub. Your team logs daily work updates against each project. When it's time to report to a client, one click produces a clean, ready-to-paste message — no formatting required, no sensitive internal notes included.

It replaces the scattered "what did everyone do today?" questions with a single source of truth, and turns client communication into a 10-second task instead of a 10-minute scramble.

---

## Features

### Core Workflow
- **Daily Update Logging** — Team members post what they did, what they plan tomorrow, any blockers, and private internal notes.
- **Copy for Client** — One click generates a formatted update message ready to paste into WhatsApp, Fiverr, or Upwork. Internal notes are **never** included.
- **Per-Project History** — All updates are stored chronologically per project, giving a full audit trail.

### Access Control
- **Admin role** — Full CRUD over projects, updates, and team members. Can assign members to projects.
- **Member role** — Sees only assigned projects. Can only edit or delete their own updates.
- **No self-signup** — The admin creates all accounts. Closed system by design.

### Project Management
- Create and manage client projects with status (Active / On Hold / Completed), platform, external link, and description.
- Assign and reassign team members per project.
- Delete projects with a confirmation modal.

### Team Management
- Admin creates team member accounts with name, email, and password.
- Edit or remove members at any time.

### UI & Experience
- Dark mode only — warm earth-tone design palette.
- Collapsible sidebar (240px expanded → 64px icon-only).
- Custom confirmation modals — no browser `alert()` or `confirm()` dialogs anywhere.
- Shimmer loading skeletons on every list page.
- Custom 404 page.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI | React 19, Tailwind CSS 4 (CSS-first `@theme`) |
| Database | MongoDB Atlas via Mongoose |
| Auth | NextAuth v5 — Credentials provider, JWT sessions |
| Passwords | bcryptjs |
| Testing | Jest, React Testing Library, mongodb-memory-server |
| Font | DM Sans (Google Fonts) |

---

## Project Structure

```
client-pulse/
├── src/
│   ├── app/
│   │   ├── (dashboard)/          # Protected layout: sidebar + main content
│   │   │   ├── dashboard/        # Stats overview page
│   │   │   ├── projects/         # Project list + detail page
│   │   │   └── team/             # Team member management (admin only)
│   │   ├── api/
│   │   │   ├── auth/             # NextAuth handler
│   │   │   ├── projects/         # Projects CRUD + member assignment
│   │   │   ├── updates/          # Per-update PATCH / DELETE
│   │   │   └── users/            # Team member CRUD
│   │   ├── login/                # Public login page
│   │   └── globals.css           # Tailwind 4 theme tokens + keyframes
│   ├── components/               # All client components (modals, cards, sidebar)
│   ├── lib/
│   │   ├── db.ts                 # Cached Mongoose connection
│   │   ├── auth.ts               # Full auth config (Node.js runtime)
│   │   └── auth.config.ts        # Edge-safe auth config (used by middleware)
│   ├── models/                   # Mongoose schemas: User, Project, Update
│   └── middleware.ts             # Route protection via NextAuth edge config
├── scripts/
│   └── seed.ts                   # Creates the initial admin account
├── public/                       # Static assets (logo, favicon)
└── tests/                        # API route integration tests
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [MongoDB Atlas](https://www.mongodb.com/atlas) free-tier cluster (or any MongoDB URI)

### 1. Clone the repository

```bash
git clone https://github.com/Amubasshir/client-pulse.git
cd client-pulse
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/clientpulse?retryWrites=true&w=majority

# Generate a secure secret: openssl rand -base64 32
NEXTAUTH_SECRET=your-secret-here

# Canonical URL of your app (http://localhost:3000 for local dev)
NEXTAUTH_URL=http://localhost:3000
```

### 4. Seed the admin account

Open `scripts/seed.ts` and set your desired admin email and password, then run:

```bash
npm run seed
```

> **Important:** Change the default password immediately after first login.

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with your seeded admin credentials.

---

## Deployment (Vercel)

1. Push to GitHub and import the repository at [vercel.com](https://vercel.com).
2. Add the following environment variables in the Vercel project dashboard:

| Variable | Value |
|---|---|
| `MONGODB_URI` | Your Atlas connection string |
| `NEXTAUTH_SECRET` | A securely generated 32-byte base64 string |
| `NEXTAUTH_URL` | Your Vercel URL (e.g. `https://your-app.vercel.app`) |

3. Deploy. No custom build configuration needed — Next.js is detected automatically.

---

## Available Scripts

```bash
npm run dev             # Start development server (http://localhost:3000)
npm run build           # Production build
npm run start           # Start production server
npm run lint            # Run ESLint
npm run test            # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage report
npm run seed            # Seed the initial admin account
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `NEXTAUTH_SECRET` | Yes | Secret used to sign and verify JWT tokens |
| `NEXTAUTH_URL` | Yes | Canonical URL of the deployed application |

---

## Key Design Decisions

**No platform API integration** — Sending messages via WhatsApp Business API, Fiverr, or Upwork APIs introduces OAuth flows, rate limits, terms-of-service risk, and per-platform maintenance overhead. Copy-paste is instant, always works, and keeps the app completely platform-agnostic.

**No self-signup** — ClientPulse is a private internal tool. The admin controls who has access. This eliminates spam accounts, accidental access, and the need for email verification flows.

**Internal notes are never exposed** — The `notes` field on every update is explicitly stripped from the "Copy for Client" output at the data layer. Clients only ever see Today's Work, Tomorrow's Plan, and Blockers.

**Edge-safe auth separation** — `auth.config.ts` contains only JWT and session callbacks, used by Next.js middleware running on the edge runtime. `auth.ts` extends it with the Credentials provider and bcrypt, which require the Node.js runtime. This prevents `stream` module errors in the edge.

---

## License

Private — all rights reserved.
