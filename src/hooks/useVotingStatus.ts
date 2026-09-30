'use client';

import { useEffect, useState } from 'react';
import { Contest } from '@/types';
import { getVotingStatus, VotingStatus } from '@/lib/db/contests';

// setTimeout overflows above ~24.8 days, so re-check at most this often
const MAX_TIMEOUT_MS = 2_147_483_647;

// Current voting status; updates automatically when voting opens or closes
export function useVotingStatus(contest: Contest | null): VotingStatus | null {
  const [status, setStatus] = useState<VotingStatus | null>(() =>
    contest ? getVotingStatus(contest) : null
  );

  useEffect(() => {
    if (!contest) {
      setStatus(null);
      return;
    }

    const current = getVotingStatus(contest);
    setStatus(current);

    const nextChange =
      current === 'not-started'
        ? contest.votingStart?.toMillis()
        : current === 'open'
        ? contest.votingEnd?.toMillis()
        : undefined;

    if (nextChange === undefined) {
      return;
    }

    const timer = setTimeout(
      () => setStatus(getVotingStatus(contest)),
      Math.min(nextChange - Date.now() + 1000, MAX_TIMEOUT_MS)
    );
    return () => clearTimeout(timer);
  }, [contest, status]);

  return status;
}
