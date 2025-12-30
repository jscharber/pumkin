'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Container from '@/components/layout/Container';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import ImageComparison from '@/components/admin/ImageComparison';
import { Contest, Entry } from '@/types';
import { getAllContests } from '@/lib/db/contests';
import { getEntriesForContest, deleteEntry } from '@/lib/db/entries';
import { useToast } from '@/context/ToastContext';
import Image from 'next/image';

export default function ManageInspirationPage() {
  const searchParams = useSearchParams();
  const [contests, setContests] = useState<Contest[]>([]);
  const [selectedContestId, setSelectedContestId] = useState('');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc'>('date-desc');
  const [loading, setLoading] = useState(true);
  const [showComparison, setShowComparison] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const loadContests = async () => {
      const data = await getAllContests();
      setContests(data);

      // Pre-select contest from query param if provided
      const contestParam = searchParams.get('contest');
      if (contestParam) {
        setSelectedContestId(contestParam);
      } else if (data.length > 0) {
        setSelectedContestId(data[0].id);
      }
    };
    loadContests();
  }, [searchParams]);

  useEffect(() => {
    const loadEntries = async () => {
      if (!selectedContestId) {
        setEntries([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await getEntriesForContest(selectedContestId);
        // Filter only inspiration entries
        const inspirationEntries = data.filter((e) => e.isInspiration);
        setEntries(inspirationEntries);
      } catch (error) {
        console.error('Error loading entries:', error);
        showToast('Failed to load entries', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadEntries();
  }, [selectedContestId, showToast]);

  const sortedEntries = [...entries].sort((a, b) => {
    const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
    const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;

    if (sortBy === 'date-desc') {
      return dateB - dateA;
    } else {
      return dateA - dateB;
    }
  });

  const handleToggleSelect = (entryId: string) => {
    setSelectedEntries((prev) =>
      prev.includes(entryId)
        ? prev.filter((id) => id !== entryId)
        : [...prev, entryId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEntries.length === entries.length) {
      setSelectedEntries([]);
    } else {
      setSelectedEntries(entries.map((e) => e.id));
    }
  };

  const handleDelete = async (entryId: string) => {
    try {
      await deleteEntry(entryId);
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
      setSelectedEntries((prev) => prev.filter((id) => id !== entryId));
      showToast('Image deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting entry:', error);
      showToast('Failed to delete image', 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEntries.length === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedEntries.length} image${
        selectedEntries.length !== 1 ? 's' : ''
      }?`
    );

    if (!confirmed) return;

    try {
      await Promise.all(selectedEntries.map((id) => deleteEntry(id)));
      setEntries((prev) => prev.filter((e) => !selectedEntries.includes(e.id)));
      showToast(
        `Successfully deleted ${selectedEntries.length} image${
          selectedEntries.length !== 1 ? 's' : ''
        }`,
        'success'
      );
      setSelectedEntries([]);
    } catch (error) {
      console.error('Error deleting entries:', error);
      showToast('Failed to delete some images', 'error');
    }
  };

  const handleCompare = () => {
    if (selectedEntries.length < 2) {
      showToast('Select at least 2 images to compare', 'info');
      return;
    }
    if (selectedEntries.length > 6) {
      showToast('Maximum 6 images can be compared at once', 'info');
      return;
    }
    setShowComparison(true);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const selectedEntriesData = entries.filter((e) =>
    selectedEntries.includes(e.id)
  );

  return (
    <Container className="py-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Manage Inspiration Images</h1>
          <p className="text-gray-600">
            View, compare, and delete inspiration images to remove duplicates.
          </p>
        </div>

        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Contest Year"
              value={selectedContestId}
              onChange={(e) => setSelectedContestId(e.target.value)}
              options={contests.map((contest) => ({
                value: contest.id,
                label: `${contest.year} - ${contest.name}`,
              }))}
            />

            <Select
              label="Sort By"
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as 'date-desc' | 'date-asc')
              }
              options={[
                { value: 'date-desc', label: 'Newest First' },
                { value: 'date-asc', label: 'Oldest First' },
              ]}
            />

            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="flex-1"
              >
                {selectedEntries.length === entries.length
                  ? 'Deselect All'
                  : 'Select All'}
              </Button>
              <div className="text-sm text-gray-600 whitespace-nowrap self-center">
                {selectedEntries.length} selected
              </div>
            </div>
          </div>

          {selectedEntries.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
              <Button
                variant="primary"
                onClick={handleCompare}
                disabled={selectedEntries.length < 2}
              >
                Compare Selected ({selectedEntries.length})
              </Button>
              <Button variant="danger" onClick={handleBulkDelete}>
                Delete Selected ({selectedEntries.length})
              </Button>
            </div>
          )}
        </Card>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="aspect-square bg-gray-200 rounded-lg animate-pulse"
              ></div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <Card className="p-8">
            <div className="text-center text-gray-500">
              <p className="text-lg mb-2">No inspiration images found</p>
              <p className="text-sm">
                Upload inspiration images to see them here.
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedEntries.map((entry) => {
              const isSelected = selectedEntries.includes(entry.id);

              return (
                <div
                  key={entry.id}
                  className={`relative border-2 rounded-lg overflow-hidden transition-all cursor-pointer ${
                    isSelected
                      ? 'border-primary ring-2 ring-primary'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleToggleSelect(entry.id)}
                >
                  <div className="absolute top-2 left-2 z-10">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(entry.id)}
                      className="w-5 h-5 cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  <div className="aspect-square bg-gray-100 relative">
                    <Image
                      src={entry.imageUrl}
                      alt={entry.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />
                  </div>

                  <div className="p-3 bg-white">
                    <p className="text-sm font-medium truncate">
                      {entry.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(entry.createdAt)}
                    </p>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          window.confirm(
                            `Delete "${entry.title}"? This cannot be undone.`
                          )
                        ) {
                          handleDelete(entry.id);
                        }
                      }}
                      className="w-full mt-2"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showComparison && (
        <ImageComparison
          entries={selectedEntriesData}
          onClose={() => setShowComparison(false)}
          onDelete={(entryId) => {
            handleDelete(entryId);
            setShowComparison(false);
          }}
        />
      )}
    </Container>
  );
}
