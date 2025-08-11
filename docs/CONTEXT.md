Project: Finch Quest

Theme & hierarchy:
- Domains (top level):
  - Guild Missions (Career)
  - The Keep (Family/Home)
  - Side Quests (Personal)
  - The Forge (Self)
- Within a Domain:
  - Quest → Chapter → Encounter (Task)

Current stack:
- Next.js 15 (App Router, TypeScript, Tailwind)
- Firebase Web SDK + Firestore (client)
- Firebase Admin SDK (server routes)
- Absolute imports via @ alias
- Auth: Firebase Email/Password + Google

Data model (current):
- Firestore collections:
  - domains (seeded via Admin; client read-only)
  - epics (UI name: “quests”)
    - fields: { userId, domainId, title, summary, status, dueDate, createdAt, updatedAt }

Routes & components:
- /domain — lists live Domains (links to /quests?domain=<id>)
- /quests — shows “epics” filtered by ?domain=; create form defaults to that domain
- Protected wrapper: src/components/auth/Protected.tsx
- Hook: src/lib/useDomains.ts
- Firebase init: src/lib/firebase.client.ts, src/lib/firebase.admin.ts
- Seed endpoint: src/app/api/seed-domains/route.ts

Rules (summary):
- domains readable (authed), no client writes
- CRUD collections gated by userId; status validation; userId immutable on update

Env:
- .env.local has NEXT_PUBLIC_* (client) and FIREBASE_* (admin) vars
- FIREBASE_PRIVATE_KEY is quoted and keeps \n newlines

Outstanding next steps:
1) Build Chapters (under Quest) and Encounters (under Chapter)
2) “Today” view (Encounters due today) + status/due filters
3) Plaud → GPT → Action Items webhook
4) Deploy to Vercel and connect Porkbun domain
