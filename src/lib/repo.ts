import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function withCreateTimestamps<T extends object>(data: T) {
  return {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

// Examples to use wherever you create docs (call from your forms, etc.)
export async function createQuest(data: Omit<any, 'createdAt' | 'updatedAt'>) {
  return addDoc(collection(db, 'quests'), withCreateTimestamps(data));
}

export async function createChapter(data: Omit<any, 'createdAt' | 'updatedAt'>) {
  return addDoc(collection(db, 'chapters'), withCreateTimestamps(data));
}

export async function createTask(data: Omit<any, 'createdAt' | 'updatedAt'>) {
  return addDoc(collection(db, 'tasks'), withCreateTimestamps(data));
}
