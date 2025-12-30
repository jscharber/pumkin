'use client';

import { Entry } from '@/types';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Image from 'next/image';

interface ImageComparisonProps {
  entries: Entry[];
  onClose: () => void;
  onDelete: (entryId: string) => void;
}

export default function ImageComparison({
  entries,
  onClose,
  onDelete,
}: ImageComparisonProps) {
  if (entries.length === 0) {
    return null;
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Modal isOpen={true} onClose={onClose}>
      <div className="max-w-6xl w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            Compare Images ({entries.length})
          </h2>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entries.map((entry) => (
            <div key={entry.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="relative aspect-square bg-gray-100">
                <Image
                  src={entry.imageUrl}
                  alt={entry.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-lg">{entry.title}</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="font-medium">Uploaded:</span>{' '}
                    {formatDate(entry.createdAt)}
                  </p>
                  <p>
                    <span className="font-medium">Entrant:</span>{' '}
                    {entry.entrantName}
                  </p>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    if (
                      window.confirm(
                        `Are you sure you want to delete "${entry.title}"?`
                      )
                    ) {
                      onDelete(entry.id);
                    }
                  }}
                  className="w-full mt-2"
                >
                  Delete This Image
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Tip:</strong> Review the images above and delete any duplicates. You can also check the upload dates to identify which version to keep.
          </p>
        </div>
      </div>
    </Modal>
  );
}
