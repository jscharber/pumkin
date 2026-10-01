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
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Entry, EntryContact, EntryImage } from '@/types';
import { deleteEntryImage } from '../storage';

const COLLECTION = 'entries';
const CONTACTS_COLLECTION = 'entryContacts';

export const MAX_ENTRY_IMAGES = 3;

// Entries created before multi-photo support only have imageUrl/imagePath
export function getEntryImages(entry: Entry): EntryImage[] {
  if (entry.images && entry.images.length > 0) {
    return entry.images;
  }
  return entry.imageUrl ? [{ url: entry.imageUrl, path: entry.imagePath }] : [];
}

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
  imagePath: string,
  isInspiration: boolean = false,
  options: { images?: EntryImage[]; contactInfo?: string } = {}
): Promise<string> {
  if (!db) throw new Error('Firestore not initialized');

  const images = options.images?.length
    ? options.images
    : [{ url: imageUrl, path: imagePath }];
  const entryData = {
    contestId,
    entrantName,
    title,
    description,
    imageUrl,
    imagePath,
    images,
    isInspiration,
    createdAt: serverTimestamp(),
  };

  if (!options.contactInfo) {
    const docRef = await addDoc(collection(db, COLLECTION), entryData);
    return docRef.id;
  }

  // Write the entry and its private contact info together
  const entryRef = doc(collection(db, COLLECTION));
  const batch = writeBatch(db);
  batch.set(entryRef, entryData);
  batch.set(doc(db, CONTACTS_COLLECTION, entryRef.id), {
    contestId,
    contactInfo: options.contactInfo,
    createdAt: serverTimestamp(),
  });
  await batch.commit();

  return entryRef.id;
}

// Admin only: contact info for all entries in a contest, keyed by entry ID
export async function getEntryContactsForContest(
  contestId: string
): Promise<Record<string, EntryContact>> {
  if (!db) throw new Error('Firestore not initialized');
  const q = query(
    collection(db, CONTACTS_COLLECTION),
    where('contestId', '==', contestId)
  );
  const snapshot = await getDocs(q);

  const contacts: Record<string, EntryContact> = {};
  snapshot.docs.forEach((d) => {
    contacts[d.id] = { id: d.id, ...d.data() } as EntryContact;
  });
  return contacts;
}

export async function updateEntry(
  id: string,
  updates: Partial<{
    entrantName: string;
    title: string;
    description: string;
    imageUrl: string;
    imagePath: string;
    images: EntryImage[];
  }>
): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteEntry(id: string): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');

  // Get entry to retrieve image paths
  const entry = await getEntryById(id);

  // Delete the entry and its contact info from Firestore
  const batch = writeBatch(db);
  batch.delete(doc(db, COLLECTION, id));
  batch.delete(doc(db, CONTACTS_COLLECTION, id));
  await batch.commit();

  // Delete images from storage
  const paths = entry ? getEntryImages(entry).map((img) => img.path) : [];
  await Promise.all(
    paths.filter(Boolean).map(async (path) => {
      try {
        await deleteEntryImage(path);
      } catch (error) {
        console.error('Error deleting image from storage:', error);
        // Don't throw - entry is already deleted from Firestore
      }
    })
  );
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

export async function getInspirationEntries(contestId: string): Promise<Entry[]> {
  if (!db) throw new Error('Firestore not initialized');
  const q = query(
    collection(db, COLLECTION),
    where('contestId', '==', contestId),
    where('isInspiration', '==', true),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Entry[];
}

export async function getCompetitionEntries(contestId: string): Promise<Entry[]> {
  if (!db) throw new Error('Firestore not initialized');
  const q = query(
    collection(db, COLLECTION),
    where('contestId', '==', contestId),
    where('isInspiration', '==', false),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Entry[];
}

// Inspiration images from every contest, newest first
export async function getAllInspirationEntries(): Promise<Entry[]> {
  if (!db) throw new Error('Firestore not initialized');
  // Sorted here rather than with orderBy so no composite index is needed
  const q = query(collection(db, COLLECTION), where('isInspiration', '==', true));
  const snapshot = await getDocs(q);

  return (snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Entry[]).sort(
    (a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0)
  );
}
