'use client';

import { useState, useEffect } from 'react';
import { getTopEntriesByVotes } from '@/lib/db/votes';
import { getEntryById } from '@/lib/db/entries';
import { Entry } from '@/types';
import Card from '@/components/ui/Card';
import Image from 'next/image';

interface TopThreeLeaderboardProps {
  contestId: string;
}

interface LeaderboardEntry {
  entry: Entry;
  voteCount: number;
  rank: number;
}

export default function TopThreeLeaderboard({
  contestId,
}: TopThreeLeaderboardProps) {
  const [topEntries, setTopEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTopEntries() {
      try {
        setLoading(true);
        const topVotes = await getTopEntriesByVotes(contestId, 3);

        // Fetch full entry details
        const entries = await Promise.all(
          topVotes.map(async ({ entryId, voteCount }, index) => {
            const entry = await getEntryById(entryId);
            if (!entry) return null;
            return {
              entry,
              voteCount,
              rank: index + 1,
            };
          })
        );

        setTopEntries(entries.filter((e): e is LeaderboardEntry => e !== null));
      } catch (error) {
        console.error('Error loading top entries:', error);
      } finally {
        setLoading(false);
      }
    }

    loadTopEntries();
  }, [contestId]);

  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-center mb-6">
          Top 3 Leaderboard
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <Card className="p-6">
                <div className="h-48 bg-gray-200 rounded mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (topEntries.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-center mb-6">
          Top 3 Leaderboard
        </h2>
        <Card className="p-8 max-w-2xl mx-auto">
          <p className="text-center text-gray-600">
            No votes yet! Be the first to vote for your favorite pumpkins.
          </p>
        </Card>
      </div>
    );
  }

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return '';
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-yellow-600';
      case 2:
        return 'from-gray-300 to-gray-400';
      case 3:
        return 'from-orange-400 to-orange-600';
      default:
        return 'from-gray-200 to-gray-300';
    }
  };

  // Reorder for podium display (2nd, 1st, 3rd)
  const podiumOrder = [
    topEntries[1], // 2nd place
    topEntries[0], // 1st place
    topEntries[2], // 3rd place
  ].filter(Boolean);

  return (
    <div className="mb-8">
      <h2 className="text-3xl font-bold text-center mb-6">
        🎃 Top 3 Leaderboard 🎃
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto items-end">
        {podiumOrder.map((item, displayIndex) => {
          if (!item) return null;
          const { entry, voteCount, rank } = item;

          // First item in podiumOrder (2nd place) - left side
          // Second item (1st place) - center, taller
          // Third item (3rd place) - right side
          const isWinner = rank === 1;
          const heightClass = isWinner
            ? 'md:min-h-[400px]'
            : 'md:min-h-[350px]';

          return (
            <Card
              key={entry.id}
              className={`overflow-hidden transform transition-all hover:scale-105 ${heightClass} ${
                isWinner ? 'md:order-2' : displayIndex === 0 ? 'md:order-1' : 'md:order-3'
              }`}
            >
              <div
                className={`bg-gradient-to-br ${getRankColor(
                  rank
                )} p-4 text-center`}
              >
                <div className="text-4xl mb-1">{getMedalIcon(rank)}</div>
                <div className="text-white font-bold text-lg">
                  {rank === 1
                    ? '1st Place'
                    : rank === 2
                    ? '2nd Place'
                    : '3rd Place'}
                </div>
              </div>

              <div className="relative h-48 bg-gray-100">
                <Image
                  src={entry.imageUrl}
                  alt={entry.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>

              <div className="p-4">
                <h3 className="font-bold text-lg mb-1 line-clamp-2">
                  {entry.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  by {entry.entrantName}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Total Votes</span>
                  <span className="text-2xl font-bold text-orange-600">
                    {voteCount}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
