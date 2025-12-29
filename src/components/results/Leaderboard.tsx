'use client';

import Image from 'next/image';
import Card from '@/components/ui/Card';
import { LeaderboardEntry } from '@/types';

interface LeaderboardProps {
  leaderboard: LeaderboardEntry[];
  limit?: number;
}

export default function Leaderboard({ leaderboard, limit = 10 }: LeaderboardProps) {
  const displayedEntries = limit ? leaderboard.slice(0, limit) : leaderboard;

  if (leaderboard.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-gray-500">
          No votes have been cast yet
        </div>
      </Card>
    );
  }

  const getMedalEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return null;
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Entry
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Votes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category Wins
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayedEntries.map((item, index) => {
              const rank = index + 1;
              const medal = getMedalEmoji(rank);

              return (
                <tr key={item.entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {medal && <span className="text-2xl">{medal}</span>}
                      <span className="text-lg font-semibold text-gray-900">
                        #{rank}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={item.entry.imageUrl}
                          alt={item.entry.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {item.entry.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          by {item.entry.entrantName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-lg font-bold text-primary">
                      {item.totalVotes}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {item.categoryWins.length > 0 ? (
                      <div className="space-y-1">
                        <div className="font-semibold text-gray-900">
                          {item.categoryWins.length}{' '}
                          {item.categoryWins.length === 1 ? 'win' : 'wins'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {item.categoryWins.join(', ')}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
