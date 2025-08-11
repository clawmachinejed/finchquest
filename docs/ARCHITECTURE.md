Stack:
- Next.js 15 (App Router, TS, Tailwind)
- Firebase Web SDK + Firestore
- Firebase Admin SDK (server)
- Absolute imports with @ alias

Aliases (tsconfig.json):
- baseUrl: "."
- paths: { "@/*": ["src/*"] }
- Always import with @ (e.g. "@/components/auth/Protected")

Folders:
- src/app/domain/page.tsx           // domain list
- src/app/(app)/quests/page.tsx     // quests UI (for “epics”)
- src/components/auth/Protected.tsx // route guard
- src/lib/useDomains.ts             // live domains hook
- src/lib/firebase.client.ts        // client SDK
- src/lib/firebase.admin.ts         // admin SDK
- src/app/api/seed-domains/route.ts // seed fixed domain docs

(Optionally) redirects in next.config.ts:
- /epics → /quests
- /     → /domain
