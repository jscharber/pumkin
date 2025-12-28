import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Entry } from '@/types';

const COLLECTION = 'entries';

export async function getEntriesForContest(contestId: string): Promise<Entry[]> {
  if (!db) throw new Error('Firestore not initialized');
  const q = query(
    collection(db, COLLECTION),
    where('contestId', '==', contestId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Entry[];
}

export async function getEntryById(id: string): Promise<Entry | null> {
  if (!db) throw new Error('Firestore not initialized');
  const docRef = doc(db, COLLECTION, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return { id: docSnap.id, ...docSnap.data() } as Entry;
}

export async function createEntry(
  contestId: string,
  entrantName: string,
  title: string,
  description: string,
  imageUrl: string,
  imagePath: string
): Promise<string> {
  if (!db) throw new Error('Firestore not initialized');
  const docRef = await addDoc(collection(db, COLLECTION), {
    contestId,
    entrantName,
    title,
    description,
    imageUrl,
    imagePath,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function deleteEntry(id: string): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');
  const docRef = doc(db, COLLECTION, id);
  await deleteDoc(docRef);
}

export async function getRandomEntries(
  contestId: string,
  limit: number = 10
): Promise<Entry[]> {
  const entries = await getEntriesForContest(contestId);

  // Simple shuffle algorithm
  const shuffled = [...entries].sort(() => Math.random() - 0.5);

  return shuffled.slice(0, limit);
}
