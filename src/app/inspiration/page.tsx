'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Container from '@/components/layout/Container';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import { Contest, Entry } from '@/types';
import { getAllContests } from '@/lib/db/contests';
import { getAllInspirationEntries } from '@/lib/db/entries';

const ALL_YEARS = 'all';

export default function InspirationPage() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [images, setImages] = useState<Entry[]>([]);
  const [selectedContestId, setSelectedContestId] = useState(ALL_YEARS);
  const [selectedImage, setSelectedImage] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [contestData, imageData] = await Promise.all([
          getAllContests(),
          getAllInspirationEntries(),
        ]);
        setContests(contestData);
        setImages(imageData);
      } catch (err) {
        console.error('Error loading inspiration images:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const yearFor = (contestId: string) =>
    contests.find((c) => c.id === contestId)?.year;

  // Only offer years that actually have inspiration images (contests are newest first)
  const yearOptions = [
    { value: ALL_YEARS, label: 'All Years' },
    ...contests
      .filter((c) => images.some((img) => img.contestId === c.id))
      .map((c) => ({ value: c.id, label: `${c.year}` })),
  ];

  const visibleImages =
    selectedContestId === ALL_YEARS
      ? images
      : images.filter((img) => img.contestId === selectedContestId);

  if (loading) {
    return (
      <Container className="py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-12 bg-gray-200 rounded w-1/2 mx-auto"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Inspiration Gallery</h1>
        <p className="text-gray-600">
          Need ideas? Browse pumpkins from past contests for creative inspiration!
        </p>
      </div>

      {error ? (
        <Card className="max-w-2xl mx-auto p-8">
          <p className="text-center text-gray-600">
            We couldn&apos;t load the inspiration images. Please try again later.
          </p>
        </Card>
      ) : images.length === 0 ? (
        <Card className="max-w-2xl mx-auto p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🎃</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              No Inspiration Images Yet
            </h2>
            <p className="text-gray-600">Check back soon for ideas from past years!</p>
          </div>
        </Card>
      ) : (
        <>
          <div className="flex items-end justify-between gap-4 mb-6">
            <h2 className="text-2xl font-semibold">
              {visibleImages.length} {visibleImages.length === 1 ? 'Image' : 'Images'}
            </h2>
            {yearOptions.length > 2 && (
              <div className="max-w-xs">
                <Select
                  label="Year"
                  value={selectedContestId}
                  onChange={(e) => setSelectedContestId(e.target.value)}
                  options={yearOptions}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {visibleImages.map((img) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setSelectedImage(img)}
                className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden shadow focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label={`View larger${yearFor(img.contestId) ? ` (${yearFor(img.contestId)})` : ''}`}
              >
                <Image
                  src={img.imageUrl}
                  alt="Pumpkin carving inspiration"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                {yearFor(img.contestId) && (
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 text-xs font-semibold bg-black bg-opacity-60 text-white rounded">
                    {yearFor(img.contestId)}
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      )}

      {selectedImage && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedImage(null)}
          title={`Inspiration${yearFor(selectedImage.contestId) ? ` from ${yearFor(selectedImage.contestId)}` : ''}`}
        >
          <div className="relative w-full h-[70vh] bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={selectedImage.imageUrl}
              alt="Pumpkin carving inspiration"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 900px"
              priority
            />
          </div>
        </Modal>
      )}
    </Container>
  );
}
