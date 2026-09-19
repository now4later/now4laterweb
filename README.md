# NOW4LATERWEB — Phase 1 (Next.js migration + Send Inquiry fix)

## What this is
Your existing site migrated into a Next.js project so future phases (client
portal, admin, agreements, auth) can be added as separate routes without
touching the homepage. This phase does NOT add any client-management
features yet — it only:

1. Moves the site into Next.js
2. Makes the "Send Inquiry" form actually deliver email to you

## What's an exact port vs. reconstructed — please review
- **Exact port from your file:** Header/nav, Hero, Services, "Why Now For
  Later." These match your original markup structure and copy exactly.
- **Reconstructed:** Portfolio, Process, Pricing, About, FAQ, CTA, Footer,
  and the contact form. I only received the rendered *text* for these
  sections (not the original HTML tags), so I rebuilt them using your exact
  CSS classes (`.project`, `.process-card`, `.price`, `.about-box`, `.faq-list`,
  `.footer-grid`, etc.) and your exact copy. Visually this should match, but
  please **compare it side-by-side against your live site** before this
  replaces anything in production, since it isn't a byte-for-byte copy.

## Two things I had to guess — please fix before deploying
Search the codebase for `hello@now4laterweb.com` in `app/page.js`
(footer + CTA "Email Now For Later" button) and replace with your real
business email address.

The footer social icons (`IG` / `FB` / `LI` in `app/page.js`) are placeholders
— your original page had social icons but the exact icons/links weren't in
what I received. Swap in your real profile links (or remove the block).

## Setup

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local`:
- `RESEND_API_KEY` — from https://resend.com (free tier is fine to start)
- `INQUIRY_TO_EMAIL` — the NOW4LATERWEB inbox that should receive inquiries
- `INQUIRY_FROM_EMAIL` — the "from" address Resend sends as (use Resend's
  shared onboarding domain for testing, or your own verified domain)

Run locally:
```bash
npm run dev
```

## Deploying to Vercel
1. Push this project to its own GitHub repo (separate from your music site)
2. Import it in Vercel
3. Add the same three environment variables in Vercel → Project Settings →
   Environment Variables
4. Deploy

These credentials are entirely separate from, and must never be shared
with, your R&J Productions / music site project.

## Phase 2 — Database + Authentication (added)

What this adds, without touching anything from Phase 1:

- **Database schema** (`prisma/schema.prisma`): `User` (client or admin,
  distinguished by role), `Agreement`, `Signature`, `Payment`,
  `UpdateRequest`, `ProjectFile`. This schema also covers Phases 3-4 so it
  won't need to change shape later — only the UI for those tables is still
  to come.
- **Login** at `/login` — shared by clients and admins; after signing in,
  each is routed to their own dashboard.
- **`/portal`** — the client dashboard. Every query is scoped to
  `session.user.id`, so a client can only ever see their own records.
- **`/admin`** — visible only to the admin account. Lets you add client
  accounts (this generates a one-time temporary password you share with the
  client yourself — it's shown once in the browser and never stored in
  plaintext or logged) and lists all clients.
- **`middleware.js`** enforces the above at the routing level too: anyone
  signed out is redirected to `/login`; a non-admin hitting `/admin` is
  redirected to `/portal`.

There is currently **no public client self-signup** — you (the admin) create
each client's account from `/admin`, matching how you'll actually onboard
clients after they sign an agreement. This can change later if you want a
different flow.

### Setup

1. Add a Postgres database. Easiest path: Vercel → Storage → Create
   Database → Postgres, then pull its connection string into
   `DATABASE_URL`. (Or use any Postgres host / Supabase.)
2. Add `DATABASE_URL` and `NEXTAUTH_SECRET` (generate with
   `openssl rand -base64 32`) to `.env.local`, and `NEXTAUTH_URL` to
   `http://localhost:3000` for local dev.
3. Create the tables:
   ```bash
   npx prisma migrate dev --name init
   ```
4. Create your own admin login:
   ```bash
   ADMIN_EMAIL=you@now4laterweb.com ADMIN_PASSWORD='choose-a-strong-password' npm run create-admin
   ```
5. `npm run dev`, go to `/login`, sign in with that email/password — you
   should land on `/admin`.

### Deploying to Vercel
Add `DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` (your real domain)
to Vercel's environment variables, alongside the Phase 1 email variables.
Run the migration against your production database once
(`npx prisma migrate deploy`), then run `create-admin` once, pointed at
production, to create your real login.

## Phase 3 — Agreement, payment options, and electronic signature (added)

What this adds, on top of Phases 1-2:

- **Agreement text** (`lib/agreement-template.js`) — a plain-language
  $1,000 website development agreement covering scope, the two payment
  options, revisions, timeline, ownership, maintenance (pointing to the
  separate $100/month or $100/update plans), termination, liability, and an
  E-SIGN Act electronic-signature consent clause. **This has not been
  reviewed by an attorney.** It's written to be clear and reasonable for a
  small freelance web project, not to guarantee legal compliance — have a
  lawyer review it (and the workflow below) before relying on it,
  especially if your business grows or contract values increase.
- **Admin → Create an agreement**: pick a client, click once, and a new
  versioned agreement (using the text above, filled in with that client's
  name/business) appears in their portal as `PENDING`.
- **Client → Portal**: the client reviews the full agreement text, picks
  Full ($1,000) or Split ($500 + $500), types their full legal name,
  checks an explicit "I agree" box, and signs.
- **What signing records** (`Signature` table): signer name, signer email
  (from their authenticated session, not just typed), agreement version,
  a SHA-256 hash of the *exact* agreement text they saw, IP address, user
  agent, and a timestamp. The agreement's own text is stored on the
  `Agreement` row itself, so what was signed is preserved even if the
  template is edited later for future clients.
- **Payments created automatically at signing**: one `FULL` payment record,
  or two (`DEPOSIT` + `BALANCE`) for the split option — each starts as
  `PENDING`. Marking them `PAID` (e.g. once you've actually been paid) is
  manual for now and comes with the fuller admin tooling in Phase 5.
- **Confirmation emails** on signing, to both the client and to
  `INQUIRY_TO_EMAIL`, via the same Resend setup from Phase 1 — no new email
  credentials needed.

### Why a self-built signature instead of a paid e-signature API
Per your call: for a $1,000 freelance agreement, the audit trail above
(name, email, exact text hash, timestamp, IP, user agent, explicit
affirmative action) is a reasonable, retainable record and can have legal
effect under the U.S. E-SIGN Act — but "can have legal effect" is not the
same as "guaranteed compliant," and requirements vary by state and
situation. The `Agreement`/`Signature` tables are deliberately structured
so a real e-signature provider (Documenso, Dropbox Sign, etc.) could be
swapped in later — writing to the same tables — without rebuilding the
portal or admin dashboard around it.

### Setup
Because the schema changed (agreement's `paymentOption` is now optional
until signing), run:
```bash
npx prisma migrate dev --name agreements
```
No new environment variables are required for this phase — it reuses the
Postgres and Resend setup from Phases 1-2.

## Phase 4 — Update requests + file uploads (added)

What this adds, on top of Phases 1-3:

- **`/portal` → "Request a website update"**: client picks a category
  (Photos, Videos, Events, Text/Content, Links, Other), describes the
  change, and can attach files (photos/videos/documents), matching the
  categories from your original brief. On submit they see "Update request
  submitted successfully." and the request appears in their own list below
  the form, with any attached files as download links.
- **File storage: Vercel Blob** (`@vercel/blob`) — production-ready,
  Vercel-native, no separate account needed beyond your existing Vercel
  account. Files upload directly from the client's browser to Blob storage
  (not routed through a serverless function), which avoids request-size
  limits for larger photos/videos.
- **How uploads stay scoped to the right client**: before issuing an
  upload token, the server (`/api/portal/upload`) checks that the update
  request being attached to actually belongs to the logged-in client. Once
  Vercel confirms the upload finished, the server records the file in the
  database tied to that client's id — this happens server-side, not from
  data the browser sends, so a client can't attach a file to someone else's
  request even by tampering with the request.
- **Important limitation to know about**: Vercel Blob files are stored with
  public-by-default access — the file's URL isn't guessable, but anyone who
  obtains a URL (e.g. if a client pastes it somewhere) could open that one
  file directly, bypassing login. The *list* of files and update requests
  in the portal/database is still strictly scoped per client (Phase 2's
  access control), so no client can browse or discover another client's
  files — this caveat is only about a single leaked direct URL. If you
  later handle sensitive files, Vercel Blob does support gating downloads
  behind your own signed/authenticated route instead of a public URL — say
  the word and I can switch to that pattern.

### Placeholder email & social links — now fixed properly
Rather than guessing at a real address or URLs, the CTA button, footer
"Email Us" link, and social icons now read from environment variables
(`lib/site-config.js`). Anything left unset simply doesn't render — no more
fake `hello@now4laterweb.com` or dead `#` social links. **Set
`NEXT_PUBLIC_CONTACT_EMAIL`** (and any social URLs you actually have) in
your environment to make them appear.

### Setup
1. In Vercel: **Storage → Create Database → Blob**, then connect it to
   this project. Vercel adds `BLOB_READ_WRITE_TOKEN` automatically for
   your deployed environments.
2. For local dev, copy that same token into `.env.local` as
   `BLOB_READ_WRITE_TOKEN`.
3. Add `NEXT_PUBLIC_CONTACT_EMAIL` (and social URLs, if any) to both
   `.env.local` and Vercel's environment variables.
4. `npm install` (adds the new `@vercel/blob` dependency).

**Local-dev note on uploads:** Vercel Blob's client-upload flow calls back
to `/api/portal/upload` once a file finishes uploading, to record it in the
database. This works automatically once deployed to Vercel. For local
testing, use `vercel dev` (which proxies this correctly) rather than plain
`next dev` if you want uploaded files to actually save to the database
during local testing — otherwise the file lands in Blob storage but the
database record won't be created until you test on a real deployment.

## Phase 5 — Admin dashboard (added)

What this adds, on top of Phases 1-4:

- **Client management**: `/admin` still lists every client and lets you
  add new ones (unchanged from Phase 2).
- **Agreements & payments**: the agreements table now has inline
  controls — a "Mark Paid" / "Mark Pending" button per payment (`Payment`
  status + `paidAt` update immediately, visible to the client in their
  portal right away), and a project status dropdown
  (`NOT_STARTED` / `IN_PROGRESS` / `REVIEW` / `LAUNCHED`) per agreement.
- **Update-request management**: every client's update requests in one
  list, each with a status dropdown (`OPEN` / `IN_PROGRESS` / `DONE`) you
  can change inline.
- **Secure file viewing**: file links everywhere (portal and admin) now go
  through `/api/files/[id]` instead of the raw Blob URL. That route checks
  the signed-in session server-side — either the file's owning client, or
  an admin — before redirecting to the actual file, closing the
  direct-URL caveat noted in Phase 4. Copying a `/api/files/...` link and
  sending it to someone without portal access no longer works; they'd need
  to actually be signed in as the owner or as you.
- **Admin notifications**: a new email now fires to `INQUIRY_TO_EMAIL`
  whenever a client submits an update request, on top of the agreement
  inquiry (Phase 1) and signed-agreement (Phase 3) notifications already in
  place — all via the same Resend setup, no new credentials.
- **Client isolation, reinforced**: this was already true from Phase 2
  onward (every `/api/portal/*` route filters by `session.user.id`, and
  `middleware.js` blocks any non-admin from reaching `/admin`), but Phase 5
  is the point where an admin can see *everything* across all clients in
  one dashboard, so it's worth restating plainly: no endpoint in this
  project accepts a client ID from the request and trusts it — client-side
  routes always use the session's own ID, and admin-side routes always
  re-check `role === "ADMIN"` server-side before returning or changing
  anything. There's nothing further to configure for this — it's a
  property of how the routes are written, not a setting.

### Setup
No new environment variables or schema migrations for this phase — it's
built entirely on the database, auth, email, and storage already
configured in Phases 1-4.

## Deployment
All 5 phases are now built. Ready for final Vercel deployment/configuration
whenever you are — let me know and we'll go through it step by step.
