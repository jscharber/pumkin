import Card from '@/components/ui/Card';
import { Contest } from '@/types';
import { formatDateTimeInZone, getContestTimeZone } from '@/lib/timezone';

export default function ResultsPending({ contest }: { contest: Contest }) {
  const votingEnd = contest.votingEnd
    ? formatDateTimeInZone(contest.votingEnd.toDate(), getContestTimeZone(contest))
    : 'voting closes';

  return (
    <Card className="max-w-2xl mx-auto p-8">
      <div className="text-center">
        <div className="text-6xl mb-4">🎃</div>
        <p className="text-lg text-gray-700 leading-relaxed">
          Hold onto your pumpkins! 🎃 Check back right after{' '}
          <span className="font-semibold">{votingEnd}</span> to see winners of
          each category, runners-up, and who takes home the crown! 🏆
        </p>
      </div>
    </Card>
  );
}
