'use client';

import { useState, useEffect } from 'react';
import { useActiveContest } from '@/hooks/useContest';
import { useEntries } from '@/hooks/useEntries';
import Container from '@/components/layout/Container';
import EntryGrid from '@/components/entries/EntryGrid';
import YearFilter from '@/components/gallery/YearFilter';
import Card from '@/components/ui/Card';
import { getAllContests, getContestById } from '@/lib/db/contests';
import { Contest } from '@/types';

export default function GalleryPage() {
  const { contest: activeContest, loading: contestLoading } = useActiveContest();
  const [allContests, setAllContests] = useState<Contest[]>([]);
  const [selectedContestId, setSelectedContestId] = useState<string | null>(null);
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);

  const { entries, loading: entriesLoading } = useEntries(selectedContestId);

  const loading = contestLoading || entriesLoading;
  const isViewingPastYear = selectedContestId !== activeContest?.id;

  useEffect(() => {
    const loadContests = async () => {
      const contests = await getAllContests();
      setAllContests(contests);
    };
    loadContests();
  }, []);

  useEffect(() => {
    if (activeContest && !selectedContestId) {
      setSelectedContestId(activeContest.id);
      setSelectedContest(activeContest);
    }
  }, [activeContest, selectedContestId]);

  useEffect(() => {
    const loadSelectedContest = async () => {
      if (selectedContestId) {
        const contest = await getContestById(selectedContestId);
        setSelectedContest(contest);
      }
    };
    loadSelectedContest();
  }, [selectedContestId]);

  const handleYearChange = (contestId: string | null) => {
    setSelectedContestId(contestId);
  };

  if (contestLoading) {
    return (
      <Container className="py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-12 bg-gray-200 rounded w-1/2 mx-auto"></div>
          <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto"></div>
        </div>
      </Container>
    );
  }

  if (!activeContest && !selectedContest) {
    return (
      <Container className="py-12">
        <Card className="max-w-2xl mx-auto p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🎃</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              No Active Contest
            </h1>
            <p className="text-gray-600">
              There is no active contest at this time. Check back later!
            </p>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">
          {selectedContest?.name || 'Pumpkin Contest'}
        </h1>
        {isViewingPastYear ? (
          <p className="text-gray-600">Browse past entries for inspiration!</p>
        ) : (
          <div className="max-w-2xl mx-auto mt-4">
            <p className="text-xl font-bold text-primary">
              SPY ON THE COMPETITION! 🕵🏽
            </p>
            <p className="text-gray-600 mt-1">
              Want to see what other pumpkin geniuses are up to? Sneak a peek at
              the entries rolling in below!
            </p>
          </div>
        )}
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">
            Gallery ({entries.length} {entries.length === 1 ? 'Entry' : 'Entries'})
          </h2>
          {allContests.length > 1 && (
            <YearFilter
              contests={allContests}
              selectedContestId={selectedContestId}
              onSelect={handleYearChange}
            />
          )}
        </div>
      </div>

      <EntryGrid entries={entries} loading={entriesLoading} />
    </Container>
  );
}
