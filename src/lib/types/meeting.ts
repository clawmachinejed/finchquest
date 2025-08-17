export type ProcessingStatus = 'uploaded' | 'summarized' | 'actions_generated';
export type MatchMethod = 'exact' | 'alias' | 'fuzzy' | 'model';

export interface MeetingAttachment {
  name: string;
  url: string | null;
  type: string;
  createdAt: number; // ms epoch
}

export interface MeetingMeta {
  importHints?: { domain?: string | null; questId?: string | null; chapterId?: string | null };
  audit?: Array<{
    at: number;
    by?: string | null;
    action: 'created' | 'classified' | 'attached' | 'reassigned' | 'summary_generated' | 'reprocessed';
    from?: { questId?: string | null; chapterId?: string | null } | null;
    to?: { questId?: string | null; chapterId?: string | null } | null;
    reason?: string | null;
  }>;
}

export interface Meeting {
  id: string;
  userId: string;
  source: 'plaud' | 'manual';
  shareUrl: string;
  shareUrlExpiresAt?: number | null;

  title: string;
  occurredAt: number;

  plaudSummary?: string | null;
  aiSummary?: string | null;
  summaryModel?: string | null;

  attachments: MeetingAttachment[];

  domainKey?: 'guild' | 'keep' | 'forge' | 'side' | null;
  domainConfidence?: number | null;

  questId?: string | null;
  questConfidence?: number | null;
  questMatchMethod?: MatchMethod | null;

  chapterId?: string | null;
  chapterConfidence?: number | null;
  chapterMatchMethod?: MatchMethod | null;

  processingStatus: ProcessingStatus;
  aiRunHash?: string | null;
  aiRunId?: string | null;
  lastAiRunAt?: number | null;

  meta?: MeetingMeta;
  createdAt: number;
  updatedAt: number;
}

// Settings
export interface AutomationSettings {
  meetingAttachThreshold?: number | null; // default 0.75
  taskCreateThreshold?: number | null;    // default 0.75
}

// Alias entry
export interface AliasEntry {
  alias: string;
  questId: string;
  chapterId?: string | null;
  weight?: number;
  createdAt: number;
  updatedAt: number;
}
