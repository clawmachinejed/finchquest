// Central app models used across UI and hooks.
// Keep optional fields optional to match existing Firestore data gradually.

export interface Domain {
  id: string;
  title: string;
  description?: string;
  createdAt?: number; // epoch ms
  updatedAt?: number; // epoch ms
}

export interface Quest {
  id: string;
  domainId: string;
  title: string;
  summary?: string;   // used in UI
  status?: string;    // e.g., 'open' | 'paused' | 'done'
  priority?: number;  // 1..5 or similar
  createdAt?: number;
  updatedAt?: number;
}

export interface Chapter {
  id: string;
  questId: string;
  title: string;
  summary?: string;   // used in UI
  status?: string;    // used in UI
  priority?: number;  // used in UI
  createdAt?: number;
  updatedAt?: number;
}

export interface Task {
  id: string;
  chapterId: string;
  title: string;
  status?: string;    // used in UI
  priority?: number;  // used in UI
  dueAt?: number;     // epoch ms
  createdAt?: number;
  updatedAt?: number;
}
