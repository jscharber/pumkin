import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Contest, ContestInput } from '@/types';

const COLLECTION = 'contests';

export async function getActiveContest(): Promise<Contest | null> {
  if (!db) throw new Error('Firestore not initialized');

  const q = query(
    collection(db, COLLECTION),
    where('isActive', '==', true)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Contest;
}

export async function getContestById(id: string): Promise<Contest | null> {
  if (!db) throw new Error('Firestore not initialized');
  const docRef = doc(db, COLLECTION, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return { id: docSnap.id, ...docSnap.data() } as Contest;
}

export async function getAllContests(): Promise<Contest[]> {
  if (!db) throw new Error('Firestore not initialized');
  const q = query(collection(db, COLLECTION), orderBy('year', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Contest[];
}

export async function createContest(input: ContestInput): Promise<string> {
  if (!db) throw new Error('Firestore not initialized');
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function updateContest(
  id: string,
  updates: Partial<ContestInput>
): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function setActiveContest(id: string): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');
  // First, deactivate all contests
  const allContests = await getAllContests();
  const batch = allContests.map(async (contest) => {
    if (contest.id !== id && contest.isActive) {
      await updateDoc(doc(db!, COLLECTION, contest.id), {
        isActive: false,
        updatedAt: serverTimestamp(),
      });
    }
  });

  await Promise.all(batch);

  // Then activate the target contest
  await updateDoc(doc(db!, COLLECTION, id), {
    isActive: true,
    updatedAt: serverTimestamp(),
  });
}

export function isSubmissionOpen(contest: Contest): boolean {
  const now = Timestamp.now();
  return (
    now.toMillis() >= contest.submissionStart.toMillis() &&
    now.toMillis() <= contest.submissionEnd.toMillis()
  );
}
