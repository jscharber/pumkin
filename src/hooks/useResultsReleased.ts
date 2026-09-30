'use client';

import { useEffect, useState } from 'react';
import { Contest } from '@/types';
import { areResultsReleased } from '@/lib/db/contests';

// setTimeout overflows above ~24.8 days, so re-check at most this often
const MAX_TIMEOUT_MS = 2_147_483_647;

// Whether results can be shown; flips to true automatically when voting ends
export function useResultsReleased(contest: Contest | null): boolean {
  const [released, setReleased] = useState(() =>
    contest ? areResultsReleased(contest) : false
  );

  useEffect(() => {
    if (!contest) {
      setReleased(false);
      return;
    }

    const isReleased = areResultsReleased(contest);
    setReleased(isReleased);

    if (isReleased || !contest.votingEnd) {
      return;
    }

    const msUntilEnd = contest.votingEnd.toMillis() - Date.now() + 1000;
    const timer = setTimeout(
      () => setReleased(areResultsReleased(contest)),
      Math.min(msUntilEnd, MAX_TIMEOUT_MS)
    );
    return () => clearTimeout(timer);
  }, [contest]);

  return released;
}
