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
