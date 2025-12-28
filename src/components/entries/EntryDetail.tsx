'use client';

import Image from 'next/image';
import Modal from '@/components/ui/Modal';
import { Entry } from '@/types';

interface EntryDetailProps {
  entry: Entry;
  onClose: () => void;
}

export default function EntryDetail({ entry, onClose }: EntryDetailProps) {
  const createdDate = entry.createdAt.toDate().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Modal isOpen={true} onClose={onClose} title={entry.title}>
      <div className="space-y-6">
        <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
          <Image
            src={entry.imageUrl}
            alt={entry.title}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 800px"
            priority
          />
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Carved By
            </h3>
            <p className="text-lg">{entry.entrantName}</p>
          </div>

          {entry.description && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Description
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {entry.description}
              </p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Submitted
            </h3>
            <p className="text-gray-700">{createdDate}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
