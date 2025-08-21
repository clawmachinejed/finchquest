Stack

- Next.js 15 (App Router), TypeScript, Tailwind.
- Firebase: Web SDK (client) + Admin SDK (server routes), Firestore, Auth.
- Hosting: Vercel.

Project Layout

- src/app/(auth) — sign-in/up; redirects to /domain after auth.
- src/app/(app) — authenticated app surfaces (Domains, Quests, Chapters, Tasks).
- src/components — shared UI (nav, forms).
- src/components/auth/Protected.tsx — route guard; import via @/components/auth/Protected.
- @/\* path aliases (configured in tsconfig.json).

Navigation & State

- URL params carry domain to preserve context across pages.
- LinkWithParams centralizes param carry/replace behavior.
- Breadcrumbs reflect hierarchy, independent from param state.

Data Access
Client (Web SDK):

- Lists, user-created/edited docs (quests/chapters/tasks).
- Must include userId on create and preserve on update (rules).

Server (Admin SDK):

- API routes that need server credentials.

Firestore
Collections:

- domains (seeded, read-only for clients).
- profiles (per-user profile, id == uid).
- quests, chapters, tasks (owner-scoped).
- users/{uid}/settings, users/{uid}/aliases/{domainKey}/entries.

Rules: owner-only (userId checks), type guards, timestamp validators.

Indexes: baseline single-field; plan composite indexes for frequent queries.

Styling

- Tailwind + tokens for color/spacing; card components with layered variants.
- Keep mobile layout first; wider panels enhance, not block core flows.

Error Handling & Telemetry

- Toasts for save/fail; empty states in lists.
- (Planned) lightweight client log utility + server console for API errors.

[CHANGED]

- All meeting components/routes removed.
- “Epics” fully renamed to Quests.

Removed Features

- Meeting Drawer, meeting ingestion, Plaud scraping.

# ARCHITECTURE.md

## Original Architecture (unchanged)

[keep existing content]

---

## Updates — Aug 18, 2025

- **Phase 0 Decisions**
  - Adopted strict TS as baseline.
  - ESLint to enforce import boundaries (planned).
  - Env split will use Zod validation to ensure runtime safety.

- **Firebase Boundary (planned Phase 1)**
  - Current: single `src/lib/firebase.ts` mixing client + admin.
  - Planned:
    - `firebase.ts` → client SDK only
    - `firebase-server.ts` → Admin SDK only
  - Repo interfaces will abstract Firestore access.

- **Scaffold Scripts**
  - Planned `scripts/verify.mjs` (pnpm variant) will unify typecheck, lint, format, build.
  - CI/CD integration: `.github/workflows/verify.yml` + Husky pre-commit.

- **Architectural Guardrails**
  - Pages orchestrate.
  - Components render.
  - Hooks expose `{ data, loading, error, refetch }`.
  - Repositories mediate Firestore/Admin SDK.

- **Status:** Guardrails are **partially in place**. Firebase boundary, hooks normalization, and repo interfaces are **pending**.

#### Env Split & Validation

- Client‑safe keys live in `src/env/env.client.ts` (NEXT*PUBLIC*\* only).
- Server‑only keys live in `src/env/env.server.ts` with Zod validation.
- `env.server.ts` requires **either**:
  (a) Inline Admin creds (PROJECT_ID, CLIENT_EMAIL, PRIVATE_KEY with \n), or
  (b) `GOOGLE_APPLICATION_CREDENTIALS` pointing to a service‑account JSON.
- `src/lib/firebase-server.ts` prefers inline creds via `cert(...)`; otherwise falls back to ADC via `applicationDefault()`.

This guarantees secrets never ship to the client bundle and misconfigurations fail fast.
