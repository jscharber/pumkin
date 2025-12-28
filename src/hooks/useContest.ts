'use client';

import { useEffect, useState } from 'react';
import { onSnapshot, query, where, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Contest } from '@/types';

export function useActiveContest() {
  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'contests'), where('isActive', '==', true));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          setContest({ id: doc.id, ...doc.data() } as Contest);
        } else {
          setContest(null);
        }
        setLoading(false);
      },
      (err) => {
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { contest, loading, error };
}
