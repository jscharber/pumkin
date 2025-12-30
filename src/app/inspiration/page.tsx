'use client';

import { useState, useEffect } from 'react';
import Container from '@/components/layout/Container';
import EntryGrid from '@/components/entries/EntryGrid';
import YearFilter from '@/components/gallery/YearFilter';
import Card from '@/components/ui/Card';
import { Contest, Entry } from '@/types';
import { getAllContests } from '@/lib/db/contests';
import { getEntriesForContest } from '@/lib/db/entries';

export default function InspirationPage() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [selectedContestId, setSelectedContestId] = useState<string | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContests = async () => {
      try {
        const data = await getAllContests();
        setContests(data);
        // Select the most recent non-active contest by default
        const pastContests = data.filter((c) => !c.isActive);
        if (pastContests.length > 0) {
          setSelectedContestId(pastContests[0].id);
        }
      } catch (error) {
        console.error('Error loading contests:', error);
      } finally {
        setLoading(false);
      }
    };
    loadContests();
  }, []);

  useEffect(() => {
    const loadEntries = async () => {
      if (!selectedContestId) {
        setEntries([]);
        return;
      }

      setLoading(true);
      try {
        const data = await getEntriesForContest(selectedContestId);
        setEntries(data);
      } catch (error) {
        console.error('Error loading entries:', error);
      } finally {
        setLoading(false);
      }
    };
    loadEntries();
  }, [selectedContestId]);

  const selectedContest = contests.find((c) => c.id === selectedContestId);

  if (loading && contests.length === 0) {
    return (
      <Container className="py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-12 bg-gray-200 rounded w-1/2 mx-auto"></div>
          <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto"></div>
        </div>
      </Container>
    );
  }

  if (contests.length === 0) {
    return (
      <Container className="py-12">
        <Card className="max-w-2xl mx-auto p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🎃</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              No Past Contests
            </h1>
            <p className="text-gray-600">
              Past contest entries will appear here for inspiration once previous years&apos; contests are archived.
            </p>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Inspiration Gallery</h1>
        <p className="text-gray-600 mb-4">
          Browse past entries from previous years for creative inspiration!
        </p>
        {selectedContest && (
          <p className="text-sm text-gray-500">
            Viewing: {selectedContest.year} - {selectedContest.name}
          </p>
        )}
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">
            Gallery ({entries.length} {entries.length === 1 ? 'Entry' : 'Entries'})
          </h2>
          <YearFilter
            contests={contests}
            selectedContestId={selectedContestId}
            onSelect={setSelectedContestId}
            showActiveOption={false}
          />
        </div>
      </div>

      {entries.length === 0 ? (
        <Card className="max-w-2xl mx-auto p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🎃</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              No Entries
            </h2>
            <p className="text-gray-600">
              This contest has no entries yet.
            </p>
          </div>
        </Card>
      ) : (
        <EntryGrid entries={entries} loading={loading} />
      )}
    </Container>
  );
}
