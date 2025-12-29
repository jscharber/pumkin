'use client';

import Select from '@/components/ui/Select';
import { Contest } from '@/types';

interface YearSelectorProps {
  contests: Contest[];
  selectedContestId: string;
  onSelect: (contestId: string) => void;
}

export default function YearSelector({
  contests,
  selectedContestId,
  onSelect,
}: YearSelectorProps) {
  return (
    <div className="max-w-xs">
      <Select
        label="Select Year"
        value={selectedContestId}
        onChange={(e) => onSelect(e.target.value)}
        options={contests.map((contest) => ({
          value: contest.id,
          label: `${contest.year} - ${contest.name}`,
        }))}
      />
    </div>
  );
}
