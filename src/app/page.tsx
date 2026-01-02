'use client';

import { useState, useEffect } from 'react';
import { useActiveContest } from '@/hooks/useContest';
import { useEntries } from '@/hooks/useEntries';
import { useCategories } from '@/hooks/useCategories';
import Container from '@/components/layout/Container';
import EntryGrid from '@/components/entries/EntryGrid';
import VotingSection from '@/components/voting/VotingSection';
import TopThreeLeaderboard from '@/components/voting/TopThreeLeaderboard';
import YearFilter from '@/components/gallery/YearFilter';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { getAllContests, getContestById, getSubmissionStatus } from '@/lib/db/contests';
import { Contest } from '@/types';

export default function Home() {
  const { contest: activeContest, loading: contestLoading } = useActiveContest();
  const [allContests, setAllContests] = useState<Contest[]>([]);
  const [selectedContestId, setSelectedContestId] = useState<string | null>(null);
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);

  const { entries, loading: entriesLoading } = useEntries(selectedContestId);
  const { categories, loading: categoriesLoading } = useCategories(
    selectedContestId
  );

  const loading = contestLoading || entriesLoading;
  const isViewingPastYear = selectedContestId !== activeContest?.id;
  const submissionStatus = activeContest ? getSubmissionStatus(activeContest) : null;

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

  const scrollToVoting = () => {
    const votingSection = document.getElementById('voting-section');
    if (votingSection) {
      votingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <Container className="py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">
          {selectedContest?.name || 'Pumpkin Carving Contest'}
        </h1>
        <p className="text-gray-600 mb-6">
          {isViewingPastYear
            ? 'Browse past entries for inspiration!'
            : 'Browse all entries and vote for your favorites!'}
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          {!isViewingPastYear && entries.length > 0 && (
            <Button
              size="lg"
              onClick={scrollToVoting}
            >
              Vote Now
            </Button>
          )}
          <Link href="/submit">
            <Button
              size="lg"
              disabled={isViewingPastYear}
              variant={isViewingPastYear ? 'outline' : 'secondary'}
            >
              {isViewingPastYear
                ? 'Submissions Closed for This Year'
                : submissionStatus === 'not-started'
                ? `Submissions Open ${activeContest?.submissionStart.toDate().toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}`
                : submissionStatus === 'open'
                ? 'Submit Your Entry'
                : 'Submissions Closed'}
            </Button>
          </Link>
        </div>
      </div>

      {/* Top 3 Leaderboard - Only show for active contest with entries */}
      {!isViewingPastYear && entries.length > 0 && selectedContestId && (
        <TopThreeLeaderboard contestId={selectedContestId} />
      )}

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

      {!isViewingPastYear && entries.length > 0 && categories.length > 0 && (
        <div id="voting-section" className="mt-16">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold mb-2">Cast Your Votes</h2>
            <p className="text-gray-600">
              Vote for your favorite entry in each category
            </p>
          </div>

          <VotingSection
            contestId={selectedContestId!}
            categories={categories}
            entries={entries}
          />
        </div>
      )}
    </Container>
  );
}
