Roadmap (Meeting-Free Phase)

MVP (current phase)

- Domains: CRUD complete (list, filter).
- Quests: CRUD, domain-scoped.
- Chapters: CRUD, quest-scoped.
- Tasks: CRUD, status enum, quest/chapter-scoped.
- Auth: Firebase Auth, Protected routes.
- Navigation: sidebar, topbar, breadcrumbs, param carry.

Near-Term

- UX polish: loading states, empty placeholders, toasts.
- Optimistic UI updates for create/edit/delete.
- Improve form validation + type safety.

Future (post-MVP)

- Meeting system re-introduction (drawer, AI summary, transcripts).
- API routes for meeting ingest and classification.
- File uploads (transcripts, docs).
- Cross-domain analytics.

Removed / Deferred

- Meeting Drawer and related API routes.
- Plaud 7-day link ingestion.

# ROADMAP.md

## Original Roadmap (unchanged)

[keep existing content]

---

## Updates — Aug 18, 2025

- **Phase 0 Progress:**
  - ✅ Strict TypeScript config is complete.
  - ⏳ ESLint, Prettier+Tailwind, Env split, `.env.example`, verify script, engines pinning, Husky+CI hooks are pending.
  - These must be completed before Phase 1.

- **Phase 1 Early Work:**
  - AuthProvider with `/domain` redirect partially implemented. Not finalized yet.
  - Firebase boundary + repo interfaces not started.

- **Dependency Ordering:**
  - Phase 0 must close before full Phase 1 rollout.
  - No story in later phases will be marked as complete until its dependencies are done.

- **Overall Epic Status:**
  - Phase 0: ~15% complete (TS strict only).
  - Entire Epic: ~2% complete (because Ph0 is foundational).

Phase 0 — Guardrails & Scaffold

- TypeScript strict config: ✅
- ESLint flat config, zero warnings: ✅
- Prettier + Tailwind plugin, format gate: ✅
- Env split with Zod validation (client/server): ✅
- .env.example template: ✅
- Verify script (types→lint→build→format): ✅
- Node & package manager pinned: ✅ (Node 20.11.x via nvm‑windows)
- Pre‑commit & CI hooks: ✅ (Husky + lint‑staged + GitHub Action)
- Tailwind & PostCSS wiring: ✅
- Project layout invariants documented: 🚧 (ongoing ADRs)
