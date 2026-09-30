'use client';

import { useEffect, useState } from 'react';
import CategoryVote from './CategoryVote';
import { useToast } from '@/context/ToastContext';
import { useVisitorId } from '@/hooks/useVisitorId';
import { getUserVotes, submitVote } from '@/lib/db/votes';
import { Category, Entry } from '@/types';

interface VotingSectionProps {
  contestId: string;
  categories: Category[];
  entries: Entry[];
}

export default function VotingSection({
  contestId,
  categories,
  entries,
}: VotingSectionProps) {
  const { showToast } = useToast();
  const { visitorId, loading: visitorIdLoading } = useVisitorId();
  const [userVotes, setUserVotes] = useState<Map<string, string>>(new Map());
  const [loadingVotes, setLoadingVotes] = useState(true);

  useEffect(() => {
    if (!visitorId || !contestId) {
      setLoadingVotes(false);
      return;
    }

    getUserVotes(contestId, visitorId)
      .then((votes) => {
        setUserVotes(votes);
        setLoadingVotes(false);
      })
      .catch((error) => {
        console.error('Error loading user votes:', error);
        setLoadingVotes(false);
      });
  }, [visitorId, contestId]);

  const handleVote = async (categoryId: string, entryId: string) => {
    if (!visitorId) {
      showToast('Unable to identify voter. Please refresh and try again.', 'error');
      return;
    }

    try {
      await submitVote({
        contestId,
        categoryId,
        entryId,
        visitorId,
      });

      // Update local state
      setUserVotes((prev) => {
        const newVotes = new Map(prev);
        newVotes.set(categoryId, entryId);
        return newVotes;
      });

      showToast('Vote recorded successfully!', 'success');
    } catch (error) {
      // Firestore rules reject votes outside the voting window
      const message =
        (error as { code?: string })?.code === 'permission-denied'
          ? 'Voting is not open right now.'
          : error instanceof Error
          ? error.message
          : 'Failed to submit vote';
      showToast(message, 'error');
      throw error;
    }
  };

  if (visitorIdLoading || loadingVotes) {
    return (
      <div className="space-y-6">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-lg shadow-md p-6 animate-pulse"
          >
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-600">
          No entries available for voting yet. Check back later!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {categories.map((category) => (
        <CategoryVote
          key={category.id}
          category={category}
          entries={entries}
          selectedEntryId={userVotes.get(category.id) || null}
          hasVoted={userVotes.has(category.id)}
          onVote={(entryId) => handleVote(category.id, entryId)}
        />
      ))}
    </div>
  );
}
