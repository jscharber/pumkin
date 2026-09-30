'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/layout/Container';
import Card from '@/components/ui/Card';
import YearSelector from '@/components/results/YearSelector';
import CategoryWinner from '@/components/results/CategoryWinner';
import Leaderboard from '@/components/results/Leaderboard';
import ResultsPending from '@/components/results/ResultsPending';
import ResultsThankYou from '@/components/results/ResultsThankYou';
import TopThreeLeaderboard from '@/components/voting/TopThreeLeaderboard';
import { useResultsReleased } from '@/hooks/useResultsReleased';
import { Contest, Entry, Category, CategoryResult, LeaderboardEntry } from '@/types';
import { getAllContests } from '@/lib/db/contests';
import { getEntriesForContest } from '@/lib/db/entries';
import { getCategoriesForContest } from '@/lib/db/categories';
import { calculateCategoryResults, calculateLeaderboard } from '@/lib/results';

export default function HistoricalResultsPage({
  params,
}: {
  params: { year: string };
}) {
  const router = useRouter();
  const [contests, setContests] = useState<Contest[]>([]);
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryResults, setCategoryResults] = useState<CategoryResult[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const released = useResultsReleased(selectedContest);

  useEffect(() => {
    loadContests();
  }, []);

  useEffect(() => {
    if (contests.length > 0) {
      // Links use the year; the year selector uses the contest ID
      const contest =
        contests.find((c) => c.id === params.year) ||
        contests.find((c) => String(c.year) === params.year);
      if (contest) {
        loadContestData(contest);
      } else {
        setLoading(false);
      }
    }
  }, [contests, params.year]);

  // Calculate once data is loaded and results are released (including when voting ends while viewing)
  useEffect(() => {
    if (!released || !selectedContest || !entries.length || !categories.length) {
      return;
    }

    const calculateResults = async () => {
      try {
        const results = await Promise.all(
          categories.map((category) =>
            calculateCategoryResults(selectedContest.id, category, entries)
          )
        );
        setCategoryResults(results);
        setLeaderboard(
          await calculateLeaderboard(selectedContest.id, categories, entries)
        );
      } catch (error) {
        console.error('Error calculating results:', error);
      }
    };

    calculateResults();
  }, [released, selectedContest, entries, categories]);

  const loadContests = async () => {
    try {
      const data = await getAllContests();
      setContests(data);
    } catch (error) {
      console.error('Error loading contests:', error);
      setLoading(false);
    }
  };

  const loadContestData = async (contest: Contest) => {
    setLoading(true);
    try {
      setSelectedContest(contest);

      const [entriesData, categoriesData] = await Promise.all([
        getEntriesForContest(contest.id),
        getCategoriesForContest(contest.id),
      ]);

      setEntries(entriesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading contest data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContestChange = (contestId: string) => {
    router.push(`/results/${contestId}`);
  };

  if (loading) {
    return (
      <Container className="py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-12 bg-gray-200 rounded w-1/2 mx-auto"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </Container>
    );
  }

  if (!selectedContest) {
    return (
      <Container className="py-12">
        <Card className="max-w-2xl mx-auto p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Contest Not Found
            </h1>
            <p className="text-gray-600">
              No contest found for year {params.year}.
            </p>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <div className="mb-8">
        <YearSelector
          contests={contests}
          selectedContestId={selectedContest.id}
          onSelect={handleContestChange}
        />
      </div>

      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">
          {selectedContest.name} - Results
        </h1>
        <p className="text-gray-600">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'} •{' '}
          {categories.length} {categories.length === 1 ? 'category' : 'categories'}
        </p>
      </div>

      {!released ? (
        <ResultsPending contest={selectedContest} />
      ) : entries.length === 0 ? (
        <Card className="max-w-2xl mx-auto p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🎃</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              No Entries
            </h2>
            <p className="text-gray-600">
              This contest had no entries submitted.
            </p>
          </div>
        </Card>
      ) : (
        <>
          <ResultsThankYou />

          <div className="mb-12">
            <TopThreeLeaderboard
              contestId={selectedContest.id}
              emptyMessage="No votes were cast."
            />
          </div>

          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Overall Leaderboard</h2>
            <Leaderboard leaderboard={leaderboard} limit={10} />
          </div>

          <div className="space-y-8">
            <h2 className="text-3xl font-bold">Category Winners</h2>
            {categoryResults.map((result) => (
              <CategoryWinner key={result.category.id} result={result} />
            ))}
          </div>
        </>
      )}
    </Container>
  );
}
