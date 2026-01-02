'use client';

import Select from '@/components/ui/Select';
import { Contest } from '@/types';

interface YearFilterProps {
  contests: Contest[];
  selectedContestId: string | null;
  onSelect: (contestId: string | null) => void;
  showActiveOption?: boolean;
}

export default function YearFilter({
  contests,
  selectedContestId,
  onSelect,
  showActiveOption = true,
}: YearFilterProps) {
  const activeContest = contests.find((c) => c.isActive);

  const options = [
    ...(showActiveOption && activeContest
      ? [{ value: 'active', label: 'Current Contest' }]
      : []),
    ...contests.map((contest) => ({
      value: contest.id,
      label: `${contest.year}`,
    })),
  ];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'active') {
      onSelect(activeContest?.id || null);
    } else {
      onSelect(value);
    }
  };

  const currentValue =
    selectedContestId === activeContest?.id && showActiveOption
      ? 'active'
      : selectedContestId || '';

  return (
    <div className="max-w-xs">
      <Select
        label="Select Year"
        value={currentValue}
        onChange={handleChange}
        options={options}
      />
    </div>
  );
}
