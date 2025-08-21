Collections

domains

- id
- key (guild, keep, forge, side)
- name
- description

profiles

- id == userId
- displayName
- email

quests

- id
- userId
- domainId
- title
- description
- status: todo | doing | done | blocked
- createdAt, updatedAt

chapters

- id
- userId
- questId
- title
- description
- status: todo | doing | done | blocked
- createdAt, updatedAt

tasks

- id
- userId
- questId
- chapterId
- title
- description
- status: todo | doing | done | blocked
- createdAt, updatedAt

users/{uid}/settings

- theme
- preferences

users/{uid}/aliases/{domainKey}/entries

- flexible alias support

[CHANGED]

- meetings collection removed entirely until re-introduction.

# DATA_MODEL.md

## Original Data Model (unchanged)

[keep existing content]

---

## Updates — Aug 18, 2025

- **Current Entities:** Domain, Quest, Chapter, Task (unchanged).

- **Repo Interfaces (Planned, Phase 1):**
  - `IQuestRepo`, `IDomainRepo`, `IChapterRepo`, `ITaskRepo`.
  - Interfaces will strictly define CRUD operations.
  - Firestore-specific code will be isolated behind these repos.

- **Auth State:**
  - Partially implemented AuthProvider with `/domain` redirect.
  - Will be finalized in Phase 1 with strict types.

- **Data Flow Rules:**
  - No raw Firestore in components/pages.
  - Hooks consume repositories.
  - Pages orchestrate, not fetch directly.

# ADR 0001: Firebase Admin Credentials Modes

Date: 2025‑08‑20  
Status: Accepted

## Context

Builds failed locally when server env validation required three inline Admin vars. We want a path that is easy locally and standard in CI/Prod.

## Decision

Support two modes in `env.server.ts`:

- Mode A (Local): GOOGLE_APPLICATION_CREDENTIALS → JSON (ADC)
- Mode B (CI/Prod): Inline Admin vars (PROJECT_ID, CLIENT_EMAIL, PRIVATE_KEY)

`firebase-server.ts` prefers inline cert, else ADC.

## Consequences

- Local dev is simple and secure (file kept out of Git).
- CI/Prod use environment variables managed by the platform.
- No code changes required to switch modes; validation remains fail‑fast.
