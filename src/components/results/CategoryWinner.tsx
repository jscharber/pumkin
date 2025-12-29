'use client';

import Image from 'next/image';
import Card from '@/components/ui/Card';
import { CategoryResult } from '@/types';

interface CategoryWinnerProps {
  result: CategoryResult;
}

export default function CategoryWinner({ result }: CategoryWinnerProps) {
  const { category, winner, voteCount, runnerUp } = result;

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
        {category.description && (
          <p className="text-sm text-gray-600">{category.description}</p>
        )}
      </div>

      {winner ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-4xl">🏆</span>
            <div>
              <div className="text-sm font-medium text-gray-500 uppercase">
                Winner
              </div>
              <div className="text-lg font-bold text-primary">
                {voteCount} {voteCount === 1 ? 'vote' : 'votes'}
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={winner.imageUrl}
                alt={winner.title}
                fill
                className="object-cover"
                sizes="128px"
              />
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-semibold mb-1">{winner.title}</h4>
              <p className="text-gray-600 mb-2">by {winner.entrantName}</p>
              {winner.description && (
                <p className="text-sm text-gray-700">{winner.description}</p>
              )}
            </div>
          </div>

          {runnerUp && (
            <div className="pt-4 border-t border-gray-200">
              <div className="text-sm font-medium text-gray-500 mb-2">
                Runner-up ({runnerUp.voteCount}{' '}
                {runnerUp.voteCount === 1 ? 'vote' : 'votes'})
              </div>
              <div className="flex gap-3 items-center">
                <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={runnerUp.entry.imageUrl}
                    alt={runnerUp.entry.title}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div>
                  <p className="font-semibold">{runnerUp.entry.title}</p>
                  <p className="text-sm text-gray-600">
                    by {runnerUp.entry.entrantName}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No votes yet in this category
        </div>
      )}
    </Card>
  );
}
