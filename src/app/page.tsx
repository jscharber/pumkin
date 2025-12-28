'use client';

import { useActiveContest } from '@/hooks/useContest';
import { useEntries } from '@/hooks/useEntries';
import { useCategories } from '@/hooks/useCategories';
import Container from '@/components/layout/Container';
import EntryGrid from '@/components/entries/EntryGrid';
import VotingSection from '@/components/voting/VotingSection';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function Home() {
  const { contest, loading: contestLoading } = useActiveContest();
  const { entries, loading: entriesLoading } = useEntries(contest?.id || null);
  const { categories, loading: categoriesLoading } = useCategories(
    contest?.id || null
  );

  const loading = contestLoading || entriesLoading;

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

  if (!contest) {
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
        <h1 className="text-4xl font-bold mb-2">{contest.name}</h1>
        <p className="text-gray-600 mb-6">
          Browse all entries and vote for your favorites!
        </p>
        <Link href="/submit">
          <Button size="lg">Submit Your Entry</Button>
        </Link>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">
            Gallery ({entries.length} {entries.length === 1 ? 'Entry' : 'Entries'})
          </h2>
        </div>
      </div>

      <EntryGrid entries={entries} loading={entriesLoading} />

      {entries.length > 0 && categories.length > 0 && (
        <div className="mt-16">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold mb-2">Cast Your Votes</h2>
            <p className="text-gray-600">
              Vote for your favorite entry in each category
            </p>
          </div>

          <VotingSection
            contestId={contest!.id}
            categories={categories}
            entries={entries}
          />
        </div>
      )}
    </Container>
  );
}
