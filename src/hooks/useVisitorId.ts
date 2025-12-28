'use client';

import { useEffect, useState } from 'react';
import { getVisitorId } from '@/lib/fingerprint';

export function useVisitorId() {
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVisitorId()
      .then((id) => {
        setVisitorId(id);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error getting visitor ID:', error);
        setLoading(false);
      });
  }, []);

  return { visitorId, loading };
}
