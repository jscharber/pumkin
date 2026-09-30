'use client';

import { useActiveContest } from '@/hooks/useContest';
import { useCategories } from '@/hooks/useCategories';
import { useEntries } from '@/hooks/useEntries';
import Container from '@/components/layout/Container';
import VotingSection from '@/components/voting/VotingSection';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import Countdown from '@/components/ui/Countdown';
import { useVotingStatus } from '@/hooks/useVotingStatus';
import { formatDateTimeInZone, getContestTimeZone } from '@/lib/timezone';

export default function VotePage() {
  const { contest, loading: contestLoading, error: contestError } = useActiveContest();
  const { categories, loading: categoriesLoading } = useCategories(contest?.id || '');
  const { entries, loading: entriesLoading } = useEntries(contest?.id || '');
  const votingStatus = useVotingStatus(contest);

  const loading = contestLoading || categoriesLoading || entriesLoading;

  if (loading) {
    return (
      <Container className="py-12">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-200 rounded w-1/2 mx-auto"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    );
  }

  if (contestError) {
    return (
      <Container className="py-12">
        <Card className="max-w-2xl mx-auto p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-600">
              Failed to load contest information. Please try again later.
            </p>
            <Link href="/gallery" className="mt-4 inline-block">
              <Button>Back to Gallery</Button>
            </Link>
          </div>
        </Card>
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
            <p className="text-gray-600 mb-6">
              There is no active contest at this time. Check back later!
            </p>
            <Link href="/gallery">
              <Button>View Past Contests</Button>
            </Link>
          </div>
        </Card>
      </Container>
    );
  }

  const timeZone = getContestTimeZone(contest);

  if (votingStatus === 'not-started' && contest.votingStart) {
    return (
      <Container className="py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2">{contest.name}</h1>
          </div>

          <Card className="p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">🎃</div>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Whoa, hold your pumpkins! 🎃 We love how excited you are, but
                the voting booth isn&apos;t open just yet. Mark your
                calendar&mdash;voting officially kicks off on{' '}
                <span className="font-semibold">
                  {formatDateTimeInZone(contest.votingStart.toDate(), timeZone)}
                </span>
                !
              </p>
              {contest.votingEnd && (
                <div className="mb-8">
                  <p className="text-gray-700 mb-4">
                    Voting closes on{' '}
                    <span className="font-semibold">
                      {formatDateTimeInZone(contest.votingEnd.toDate(), timeZone)}
                    </span>
                  </p>
                  <Countdown
                    target={contest.votingEnd.toDate()}
                    label="Voting closes in"
                  />
                </div>
              )}
              <Link href="/gallery">
                <Button>Browse the Gallery</Button>
              </Link>
            </div>
          </Card>
        </div>
      </Container>
    );
  }

  if (votingStatus === 'closed') {
    return (
      <Container className="py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2">{contest.name}</h1>
          </div>

          <Card className="p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">🗳️</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Voting Has Closed
              </h2>
              <p className="text-gray-600 mb-6">
                Thanks to everyone who voted! The results are in.
              </p>
              <Link href="/results">
                <Button>See the Results</Button>
              </Link>
            </div>
          </Card>
        </div>
      </Container>
    );
  }

  // Filter out inspiration entries (only show competition entries)
  const competitionEntries = entries.filter((entry) => !entry.isInspiration);

  if (competitionEntries.length === 0) {
    return (
      <Container className="py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2">{contest.name}</h1>
            <p className="text-gray-600">Cast Your Votes</p>
          </div>

          <Card className="p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                No Entries Yet
              </h2>
              <p className="text-gray-600 mb-6">
                There are no entries to vote for yet. Check back after the
                submission period!
              </p>
              <Link href="/gallery">
                <Button>Back to Gallery</Button>
              </Link>
            </div>
          </Card>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold mb-2">{contest.name}</h1>
          <p className="text-xl text-gray-600">Cast Your Votes!</p>
          <p className="max-w-3xl mx-auto mt-4 text-lg text-gray-700 leading-relaxed">
            Pick your #1 favorite in each category! 🗳️ Pass the spotlight to
            your fellow pumpkin artists&mdash;or vote for yourself if you just
            can&apos;t resist!
            {contest.votingEnd && (
              <>
                {' '}Check back on{' '}
                <span className="font-semibold">
                  {formatDateTimeInZone(contest.votingEnd.toDate(), timeZone)}
                </span>{' '}
                to see who claims ultimate bragging rights! 🎉
              </>
            )}
          </p>
          {contest.votingEnd && (
            <div className="mt-6">
              <Countdown
                target={contest.votingEnd.toDate()}
                label="Voting closes in"
              />
            </div>
          )}
        </div>

        {/* Voting Instructions */}
        <div className="mb-6 bg-orange-50 border-l-4 border-orange-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-orange-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-orange-700">
                <strong>How to vote:</strong> Select one pumpkin from each
                category below. You can only vote once per category, so choose
                wisely!
              </p>
            </div>
          </div>
        </div>

        {/* Voting Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6 text-center">
            Vote by Category
          </h2>
          <VotingSection
            contestId={contest.id}
            categories={categories}
            entries={competitionEntries}
          />
        </div>

        {/* Back to Gallery Link */}
        <div className="text-center mt-8">
          <Link href="/gallery">
            <Button variant="outline">Back to Gallery</Button>
          </Link>
        </div>
      </div>
    </Container>
  );
}
