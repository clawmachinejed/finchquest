export type DomainId = 'guild' | 'keep' | 'side' | 'forge';

export const DOMAINS: Record<DomainId, { id: DomainId; name: string }> = {
  guild: { id: 'guild', name: 'Guild Missions' }, // Career
  keep: { id: 'keep', name: 'The Keep' }, // Family/Home
  side: { id: 'side', name: 'Side Quests' }, // Personal
  forge: { id: 'forge', name: 'The Forge' }, // Self
};

export const DOMAIN_OPTIONS = Object.values(DOMAINS);

export function domainName(id: DomainId | null | undefined) {
  return id && DOMAINS[id]?.name ? DOMAINS[id].name : 'Unassigned';
}
