// src/lib/types.ts
export type Status = 'todo' | 'doing' | 'done' | 'blocked';

export interface Quest {
  id: string;
  userId: string;
  domainId: string;
  title: string;
  summary: string;
  status: Status;
  dueDate: number | null; // Firestore Timestamp.toMillis()
  createdAt: number;
  updatedAt: number;
}

export interface Chapter {
  id: string;
  userId: string;
  questId: string;
  title: string;
  summary: string;
  status: Status;
  dueDate: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface Task {
  id: string;
  userId: string;
  chapterId: string;
  title: string;
  status: Status;
  dueDate: number | null;
  createdAt: number;
  updatedAt: number;
}
