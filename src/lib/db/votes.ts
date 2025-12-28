import {
  collection,
  doc,
  getDocs,
  addDoc,
  query,
  where,
  serverTimestamp,
  getCountFromServer,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Vote, VoteInput } from '@/types';

const COLLECTION = 'votes';

export async function hasVoted(
  contestId: string,
  categoryId: string,
  visitorId: string
): Promise<boolean> {
  const q = query(
    collection(db, COLLECTION),
    where('contestId', '==', contestId),
    where('categoryId', '==', categoryId),
    where('visitorId', '==', visitorId)
  );

  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

export async function submitVote(input: VoteInput): Promise<string> {
  // Check if already voted
  const alreadyVoted = await hasVoted(
    input.contestId,
    input.categoryId,
    input.visitorId
  );

  if (alreadyVoted) {
    throw new Error('You have already voted in this category');
  }

  const docRef = await addDoc(collection(db, COLLECTION), {
    ...input,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function getVotesForCategory(
  contestId: string,
  categoryId: string
): Promise<Vote[]> {
  const q = query(
    collection(db, COLLECTION),
    where('contestId', '==', contestId),
    where('categoryId', '==', categoryId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Vote[];
}

export async function getVoteCountForEntry(
  categoryId: string,
  entryId: string
): Promise<number> {
  const q = query(
    collection(db, COLLECTION),
    where('categoryId', '==', categoryId),
    where('entryId', '==', entryId)
  );

  const snapshot = await getCountFromServer(q);
  return snapshot.data().count;
}

export async function getTotalVotesForEntry(entryId: string): Promise<number> {
  const q = query(collection(db, COLLECTION), where('entryId', '==', entryId));

  const snapshot = await getCountFromServer(q);
  return snapshot.data().count;
}

export async function getVoteCounts(
  contestId: string,
  categoryId: string
): Promise<Map<string, number>> {
  const votes = await getVotesForCategory(contestId, categoryId);

  const counts = new Map<string, number>();

  votes.forEach((vote) => {
    const current = counts.get(vote.entryId) || 0;
    counts.set(vote.entryId, current + 1);
  });

  return counts;
}

export async function getUserVotes(
  contestId: string,
  visitorId: string
): Promise<Map<string, string>> {
  const q = query(
    collection(db, COLLECTION),
    where('contestId', '==', contestId),
    where('visitorId', '==', visitorId)
  );

  const snapshot = await getDocs(q);

  const userVotes = new Map<string, string>();

  snapshot.docs.forEach((doc) => {
    const vote = doc.data() as Vote;
    userVotes.set(vote.categoryId, vote.entryId);
  });

  return userVotes;
}
