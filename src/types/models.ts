// src/types/models.ts
export type Domain = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
};

export type Quest = {
  id: string;
  domainId: string;
  title: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
};

export type Chapter = {
  id: string;
  questId: string;
  title: string;
  order: number;
  createdAt: number;
  updatedAt: number;
};

export type Task = {
  id: string;
  chapterId: string;
  title: string;
  done: boolean;
  dueAt?: number;
  createdAt: number;
  updatedAt: number;
};
