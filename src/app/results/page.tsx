'use client';

import { useState, useEffect } from 'react';
import { useActiveContest } from '@/hooks/useContest';
import { useEntries } from '@/hooks/useEntries';
import { useCategories } from '@/hooks/useCategories';
import Container from '@/components/layout/Container';
import Card from '@/components/ui/Card';
import CategoryWinner from '@/components/results/CategoryWinner';
import Leaderboard from '@/components/results/Leaderboard';
import { CategoryResult, LeaderboardEntry } from '@/types';
import { calculateCategoryResults, calculateLeaderboard } from '@/lib/results';

export default function ResultsPage() {
  const { contest, loading: contestLoading } = useActiveContest();
  const { entries, loading: entriesLoading } = useEntries(contest?.id || null);
  const { categories, loading: categoriesLoading } = useCategories(
    contest?.id || null
  );

  const [categoryResults, setCategoryResults] = useState<CategoryResult[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    if (!contest || !categories.length || !entries.length) {
      return;
    }

    const calculateResults = async () => {
      setCalculating(true);
      try {
        // Calculate results for each category
        const results = await Promise.all(
          categories.map((category) =>
            calculateCategoryResults(contest.id, category, entries)
          )
        );
        setCategoryResults(results);

        // Calculate overall leaderboard
        const board = await calculateLeaderboard(contest.id, categories, entries);
        setLeaderboard(board);
      } catch (error) {
        console.error('Error calculating results:', error);
      } finally {
        setCalculating(false);
      }
    };

    calculateResults();
  }, [contest, categories, entries]);

  const loading = contestLoading || entriesLoading || categoriesLoading || calculating;

  if (contestLoading) {
    return (
      <Container className="py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-12 bg-gray-200 rounded w-1/2 mx-auto"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </Container>
    );
  }

  if (!contest) {
    return (
      <Container className="py-12">
        <Card className="max-w-2xl mx-auto p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              No Active Contest
            </h1>
            <p className="text-gray-600">
              There are no results to display at this time.
            </p>
          </div>
        </Card>
      </Container>
    );
  }

  if (entries.length === 0) {
    return (
      <Container className="py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">{contest.name} - Results</h1>
        </div>
        <Card className="max-w-2xl mx-auto p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🎃</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              No Entries Yet
            </h2>
            <p className="text-gray-600">
              Results will appear once entries have been submitted.
            </p>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">{contest.name} - Results</h1>
        <p className="text-gray-600">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'} •{' '}
          {categories.length} {categories.length === 1 ? 'category' : 'categories'}
        </p>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      ) : (
        <>
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
