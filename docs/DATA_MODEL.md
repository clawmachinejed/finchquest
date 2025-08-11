Collections (current):
- domains:
  - ids: "guild", "keep", "side", "forge"
  - fields: { id, name, createdAt, updatedAt } (seeded by Admin)
  - client: read-only
- epics (UI name: quests):
  - { userId, domainId, title, summary, status, dueDate, createdAt, updatedAt }

Planned additions:
- chapters:
  - { userId, questId, title, summary, status, dueDate }
- encounters (tasks):
  - { userId, chapterId, title, notes, status, dueDate, priority }

Security rules (essentials):
- authed() required
- isOwner / isOwnerNew enforce userId on read/write/create
- validStatus in ["todo","doing","done","blocked"]
- userId cannot change on update
- domains: allow read if authed; no client writes
