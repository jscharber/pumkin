'use client';

import { useState } from 'react';
import Image from 'next/image';
import Modal from '@/components/ui/Modal';
import { Entry } from '@/types';
import { getEntryImages } from '@/lib/db/entries';

interface EntryDetailProps {
  entry: Entry;
  onClose: () => void;
}

export default function EntryDetail({ entry, onClose }: EntryDetailProps) {
  const images = getEntryImages(entry);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = images[selectedIndex] ?? images[0];

  const createdDate = entry.createdAt.toDate().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Modal isOpen={true} onClose={onClose} title={entry.title}>
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={selectedImage?.url || entry.imageUrl}
              alt={
                images.length > 1
                  ? `${entry.title} - photo ${selectedIndex + 1} of ${images.length}`
                  : entry.title
              }
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 800px"
              priority
            />
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 justify-center">
              {images.map((image, index) => (
                <button
                  key={image.url}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  className={`relative w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                    index === selectedIndex
                      ? 'border-primary'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                  aria-label={`Show photo ${index + 1}`}
                  aria-pressed={index === selectedIndex}
                >
                  <Image
                    src={image.url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
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
