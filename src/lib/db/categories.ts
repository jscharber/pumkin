import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Category, CategoryInput } from '@/types';

const COLLECTION = 'categories';

export async function getCategoriesForContest(
  contestId: string
): Promise<Category[]> {
  if (!db) throw new Error('Firestore not initialized');
  const q = query(
    collection(db, COLLECTION),
    where('contestId', '==', contestId),
    orderBy('order', 'asc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Category[];
}

export async function getCategoryById(id: string): Promise<Category | null> {
  if (!db) throw new Error('Firestore not initialized');
  const docRef = doc(db, COLLECTION, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return { id: docSnap.id, ...docSnap.data() } as Category;
}

export async function createCategory(input: CategoryInput): Promise<string> {
  if (!db) throw new Error('Firestore not initialized');
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function updateCategory(
  id: string,
  updates: Partial<CategoryInput>
): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCategory(id: string): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');
  const docRef = doc(db, COLLECTION, id);
  await deleteDoc(docRef);
}

export async function reorderCategories(
  categories: Array<{ id: string; order: number }>
): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');
  const batch = writeBatch(db);

  categories.forEach(({ id, order }) => {
    const docRef = doc(db!, COLLECTION, id);
    batch.update(docRef, {
      order,
      updatedAt: serverTimestamp(),
    });
  });

  await batch.commit();
}
