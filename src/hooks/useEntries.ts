'use client';

import { useEffect, useState } from 'react';
import { onSnapshot, query, where, orderBy, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Entry } from '@/types';

export function useEntries(contestId: string | null) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!contestId) {
      setEntries([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'entries'),
      where('contestId', '==', contestId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ents = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Entry[];
        setEntries(ents);
        setLoading(false);
      },
      (err) => {
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [contestId]);

  return { entries, loading, error };
}
