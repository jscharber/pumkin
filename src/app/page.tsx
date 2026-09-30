'use client';

import Image from 'next/image';
import { Timestamp } from 'firebase/firestore';
import { useActiveContest } from '@/hooks/useContest';
import Container from '@/components/layout/Container';
import Card from '@/components/ui/Card';
import { formatDateTimeInZone, getContestTimeZone } from '@/lib/timezone';

interface DateWindowProps {
  title: string;
  start?: Timestamp;
  end?: Timestamp;
  timeZone: string;
}

function DateWindow({ title, start, end, timeZone }: DateWindowProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-primary mb-3">{title}</h2>
      {start && end ? (
        <dl className="space-y-2 text-gray-700">
          <div>
            <dt className="text-sm font-medium text-gray-500">Opens</dt>
            <dd>{formatDateTimeInZone(start.toDate(), timeZone)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Closes</dt>
            <dd>{formatDateTimeInZone(end.toDate(), timeZone)}</dd>
          </div>
        </dl>
      ) : (
        <p className="text-gray-600">Dates coming soon!</p>
      )}
    </Card>
  );
}

function TextSection({ title, body }: { title: string; body?: string }) {
  if (!body?.trim()) {
    return null;
  }

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-3">{title}</h2>
      <p className="text-gray-700 whitespace-pre-line leading-relaxed">{body}</p>
    </section>
  );
}

export default function Home() {
  const { contest, loading, error } = useActiveContest();

  if (loading) {
    return (
      <Container className="py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-64 bg-gray-200 rounded-lg"></div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="h-6 bg-gray-200 rounded w-2/3"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </div>
      </Container>
    );
  }

  if (error || !contest) {
    return (
      <Container className="py-12">
        <Card className="max-w-2xl mx-auto p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🎃</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              {error ? 'Something Went Wrong' : 'No Active Contest'}
            </h1>
            <p className="text-gray-600">
              {error
                ? 'We could not load the contest details. Please try again later.'
                : 'There is no active contest at this time. Check back later!'}
            </p>
          </div>
        </Card>
      </Container>
    );
  }

  const timeZone = getContestTimeZone(contest);

  return (
    <Container className="py-12">
      <div className="max-w-4xl mx-auto space-y-10">
        {contest.headerImageUrl ? (
          <>
            <h1 className="sr-only">{contest.name}</h1>
            <Image
              src={contest.headerImageUrl}
              alt={contest.name}
              width={2400}
              height={800}
              sizes="(max-width: 896px) 100vw, 896px"
              className="w-full h-auto rounded-lg shadow-md"
              priority
            />
          </>
        ) : (
          <h1 className="text-4xl font-bold text-center">{contest.name}</h1>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <DateWindow
            title="Submissions"
            start={contest.submissionStart}
            end={contest.submissionEnd}
            timeZone={timeZone}
          />
          <DateWindow
            title="Voting"
            start={contest.votingStart}
            end={contest.votingEnd}
            timeZone={timeZone}
          />
        </div>

        <TextSection title="Welcome" body={contest.introMessage} />
        <TextSection title="Instructions and Rules" body={contest.instructionsAndRules} />
        <TextSection title="Contact Information" body={contest.contactInfo} />
      </div>
    </Container>
  );
}
