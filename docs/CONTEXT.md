Product & Scope

Goal: track goals (“quests”) inside domains with nested chapters and tasks.

Stack: Next.js 15 (App Router) + TypeScript + Tailwind, Firebase (Auth, Firestore), hosted on Vercel.

Data ownership: single-user scope (no org multi-tenant); every document includes userId and reads/writes are restricted to owner via rules.

Design Philosophy

Mobile-first, minimal friction. Actions must be doable from a phone.

Simple, explicit hierarchy: Domain → Quests → Chapters → Tasks.

Real-time: use Firestore listeners for lists and detail views where UX benefits.

Predictable URLs & params: preserve ?domain= across navigation when appropriate.

Consistent theming: token-based, layered Tailwind variants for cards/rows.

Auth first: signed-in users land on /domain (not legacy /epics).

Core Navigation Rules

Global param domain filters context (e.g., /quests?domain=forge).

LinkWithParams:

- carry: which params to preserve (e.g., carry domain across sections).
- Use to avoid stale params when switching to pages where param no longer applies.

AppSidebar: quick nav to Domains + “Explore” domain presets (guild, keep, forge, side) highlighting active domain.

AppTopbar: breadcrumbs + mobile drawer; quick “+ Add” entry point (quests).

Protected.tsx gates all routes under (app) and redirects to /domain after sign-in.

Process Loop (Plan → Do → Learn → Decide)

Plan: Create Quests inside a Domain, outline Chapters, seed Tasks.
Do: Mark task progress.
Learn: Review task outcomes.
Decide: Reassign/prioritize tasks.

What Exists Today (User-visible)

Domains: /domain lists all user domains with links into filtered quests.
Quests: /quests?domain={alias} shows quests in a domain; create/edit quests.
Chapters: /chapters?questId={id}; create/edit chapters.
Tasks: basic CRUD; status enum: todo | doing | done | blocked.

Auth: redirects to /domain on sign-in; per-user Firestore security enforced.

Backend & Infra (Project state)

Firestore Rules (deployed):

- Collections: domains (read-only seeded), profiles, quests, chapters, tasks, users/{uid}/settings, users/{uid}/aliases/{domainKey}/entries.
- Owner-only read/write; userId must match request.auth.uid; timestamp and type guard helpers.

Environment:

- .env.local includes public Web SDK config and Admin SDK creds.
- .firebaserc set to finch-quest.
- firebase.json maps firestore.rules, firestore.indexes.json.

[CHANGED]

- Meetings removed.
- “Epics” fully replaced by Quests.

[PLANNED] (near-term)

- Polish CRUD flows for quests/chapters/tasks.
- Add list empty states, toasts, optimistic updates.

Removed Features

- Meetings, Plaud links, and scraping helpers removed until later phase.

# CONTEXT.md

## Original Context (unchanged)

[keep all existing content here as-is]

---

## Updates — Aug 18, 2025

- **Refactor Epic Launched**  
  We are treating Cleanup/Refactoring as an epic, broken down into 8 phases (0–7). The canvas roadmap is the single source of truth.

- **Phase 0 (Guardrails & Scaffold)**
  - ✅ Strict TypeScript config completed. This is fully enforced (`strict`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`).
  - ⏳ ESLint, Prettier+Tailwind, Env split, `.env.example`, verify script, Node+PM pinning, Husky+CI hooks are still pending.
  - New realization: `.env.example`, verify script, and pinned Node/PM versions are mandatory to finish Phase 0. These are now explicitly tracked.

- **Early Work Beyond Phase 0**
  - AuthProvider has been partially wired with redirect logic (`/domain`). This technically belongs in Phase 1 but was done early.
  - Firebase split not yet in place; still to do.

- **Meta Decision**  
  All phases will keep their definitions of done locked, but real progress is logged here and in the roadmap with ✅ ⏳ ⛔ markers.

### Server Credentials Strategy (Decision: 2025‑08‑20)

We support two equivalent ways to provide Firebase Admin credentials:

- Mode A (Local Dev default): GOOGLE_APPLICATION_CREDENTIALS points to a service‑account JSON on disk (ADC).
- Mode B (CI/Prod default): Inline envs FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY (with \n newlines).

Rationale: Mode A is lowest friction for local development; Mode B is cloud‑native for Vercel/CI. The code path accepts either and fails fast if neither is present.
