'use client';

import { useState } from 'react';
import EntryCard from './EntryCard';
import EntryDetail from './EntryDetail';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Entry } from '@/types';

interface EntryGridProps {
  entries: Entry[];
  loading?: boolean;
}

export default function EntryGrid({ entries, loading = false }: EntryGridProps) {
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎃</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No Entries Yet
        </h3>
        <p className="text-gray-500">
          Be the first to submit your pumpkin carving!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {entries.map((entry) => (
          <EntryCard
            key={entry.id}
            entry={entry}
            onClick={() => setSelectedEntry(entry)}
          />
        ))}
      </div>

      {selectedEntry && (
        <EntryDetail
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
        />
      )}
    </>
  );
}
