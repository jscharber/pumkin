'use client';

import { useState } from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import { Category, Entry } from '@/types';

interface CategoryVoteProps {
  category: Category;
  entries: Entry[];
  selectedEntryId: string | null;
  hasVoted: boolean;
  onVote: (entryId: string) => Promise<void>;
}

export default function CategoryVote({
  category,
  entries,
  selectedEntryId,
  hasVoted,
  onVote,
}: CategoryVoteProps) {
  const [localSelected, setLocalSelected] = useState<string | null>(
    selectedEntryId
  );
  const [loading, setLoading] = useState(false);

  const handleVote = async () => {
    if (!localSelected || hasVoted) return;

    setLoading(true);
    try {
      await onVote(localSelected);
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
        {category.description && (
          <p className="text-sm text-gray-600">{category.description}</p>
        )}
      </div>

      {hasVoted ? (
        <div className="text-center py-8">
          <div className="text-green-500 text-5xl mb-3">✓</div>
          <p className="text-lg font-semibold text-gray-700 mb-2">
            Vote Recorded!
          </p>
          <p className="text-sm text-gray-500">
            Thank you for voting in this category
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
            {entries.map((entry) => (
              <button
                key={entry.id}
                onClick={() => setLocalSelected(entry.id)}
                className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                  localSelected === entry.id
                    ? 'border-primary ring-2 ring-primary ring-offset-2'
                    : 'border-gray-200 hover:border-primary'
                }`}
              >
                <div className="aspect-square relative bg-gray-100">
                  <Image
                    src={entry.imageUrl}
                    alt={entry.title}
                    fill
                    className="object-cover"
                    sizes="150px"
                  />
                  {localSelected === entry.id && (
                    <div className="absolute top-1 right-1 bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      ✓
                    </div>
                  )}
                </div>
                <div className="p-2 bg-white">
                  <p className="text-xs font-medium truncate">{entry.title}</p>
                  {entry.description && (
                    <p
                      className="text-xs text-gray-500 truncate"
                      title={entry.description}
                    >
                      {entry.description}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>

          <Button
            onClick={handleVote}
            disabled={!localSelected || loading}
            loading={loading}
            className="w-full"
          >
            {localSelected ? 'Submit Vote' : 'Select an Entry'}
          </Button>
        </>
      )}
    </div>
  );
}
