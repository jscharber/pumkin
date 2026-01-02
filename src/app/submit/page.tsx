'use client';

import { useActiveContest } from '@/hooks/useContest';
import { getSubmissionStatus, getDaysUntilSubmissionStart } from '@/lib/db/contests';
import Container from '@/components/layout/Container';
import EntryForm from '@/components/entries/EntryForm';
import Card from '@/components/ui/Card';

export default function SubmitPage() {
  const { contest, loading, error } = useActiveContest();

  if (loading) {
    return (
      <Container className="py-12">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-12">
        <Card className="max-w-2xl mx-auto p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-600">
              Failed to load contest information. Please try again later.
            </p>
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
            <p className="text-gray-600">
              There is no active contest at this time. Check back later!
            </p>
          </div>
        </Card>
      </Container>
    );
  }

  const submissionStatus = getSubmissionStatus(contest);

  if (submissionStatus !== 'open') {
    const startDate = contest.submissionStart.toDate().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    const endDate = contest.submissionEnd.toDate().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    // Contest hasn't started yet
    if (submissionStatus === 'not-started') {
      const daysUntilStart = getDaysUntilSubmissionStart(contest);

      return (
        <Container className="py-12">
          <Card className="max-w-2xl mx-auto p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">🎃</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                Submissions Open Soon
              </h1>
              <p className="text-gray-600 mb-2">
                The submission window for {contest.name} opens on {startDate}.
              </p>
              <p className="text-sm text-gray-500">
                {daysUntilStart > 0 && (
                  <span className="font-semibold">
                    Opens in {daysUntilStart} {daysUntilStart === 1 ? 'day' : 'days'}
                  </span>
                )}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Submissions will be accepted from {startDate} to {endDate}.
              </p>
            </div>
          </Card>
        </Container>
      );
    }

    // Contest has ended
    return (
      <Container className="py-12">
        <Card className="max-w-2xl mx-auto p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🎃</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Submissions Closed
            </h1>
            <p className="text-gray-600 mb-2">
              The submission window for {contest.name} has closed.
            </p>
            <p className="text-sm text-gray-500">
              Submissions were accepted from {startDate} to {endDate}.
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
        <p className="text-gray-600">Submit Your Pumpkin Carving</p>
      </div>

      <Card className="p-8">
        <EntryForm contestId={contest.id} />
      </Card>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>
          By submitting, you agree to have your entry displayed in the contest
          gallery.
        </p>
      </div>
    </Container>
  );
}
