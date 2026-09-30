'use client';

import Image from 'next/image';
import Card from '@/components/ui/Card';
import { Entry } from '@/types';
import { getEntryImages } from '@/lib/db/entries';

interface EntryCardProps {
  entry: Entry;
  onClick: () => void;
}

export default function EntryCard({ entry, onClick }: EntryCardProps) {
  const photoCount = getEntryImages(entry).length;

  return (
    <Card onClick={onClick} className="group">
      <div className="relative w-full h-64 bg-gray-100">
        <Image
          src={entry.imageUrl}
          alt={entry.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {photoCount > 1 && (
          <span className="absolute bottom-2 right-2 px-2 py-0.5 text-xs font-semibold bg-black bg-opacity-60 text-white rounded">
            {photoCount} photos
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-1 truncate">{entry.title}</h3>
        <p className="text-sm text-gray-600">by {entry.entrantName}</p>
      </div>
    </Card>
  );
}
