'use client';

import { useEffect, useState } from 'react';
import { onSnapshot, query, where, orderBy, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Category } from '@/types';

export function useCategories(contestId: string | null) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!contestId || !db) {
      setCategories([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'categories'),
      where('contestId', '==', contestId),
      orderBy('order', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const cats = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Category[];
        setCategories(cats);
        setLoading(false);
      },
      (err) => {
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [contestId]);

  return { categories, loading, error };
}
