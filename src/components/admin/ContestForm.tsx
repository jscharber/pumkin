'use client';

import { useState, FormEvent } from 'react';
import { Timestamp } from 'firebase/firestore';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Contest } from '@/types';
import { createContest, updateContest } from '@/lib/db/contests';
import { useToast } from '@/context/ToastContext';

interface ContestFormProps {
  contest?: Contest;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ContestForm({
  contest,
  onSuccess,
  onCancel,
}: ContestFormProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [year, setYear] = useState(contest?.year || new Date().getFullYear());
  const [name, setName] = useState(contest?.name || '');
  const [submissionStart, setSubmissionStart] = useState(
    contest
      ? contest.submissionStart.toDate().toISOString().split('T')[0]
      : ''
  );
  const [submissionEnd, setSubmissionEnd] = useState(
    contest ? contest.submissionEnd.toDate().toISOString().split('T')[0] : ''
  );
  const [isActive, setIsActive] = useState(contest?.isActive || false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const contestData = {
        year,
        name,
        submissionStart: Timestamp.fromDate(new Date(submissionStart)),
        submissionEnd: Timestamp.fromDate(new Date(submissionEnd)),
        isActive,
      };

      if (contest) {
        await updateContest(contest.id, contestData);
        showToast('Contest updated successfully', 'success');
      } else {
        await createContest(contestData);
        showToast('Contest created successfully', 'success');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving contest:', error);
      showToast(
        error instanceof Error ? error.message : 'Failed to save contest',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Year"
        type="number"
        value={year}
        onChange={(e) => setYear(parseInt(e.target.value))}
        required
        min={2020}
        max={2100}
        disabled={loading}
      />

      <Input
        label="Contest Name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="2024 Pumpkin Carving Contest"
        required
        maxLength={100}
        disabled={loading}
      />

      <Input
        label="Submission Start Date"
        type="date"
        value={submissionStart}
        onChange={(e) => setSubmissionStart(e.target.value)}
        required
        disabled={loading}
      />

      <Input
        label="Submission End Date"
        type="date"
        value={submissionEnd}
        onChange={(e) => setSubmissionEnd(e.target.value)}
        required
        disabled={loading}
      />

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
          disabled={loading}
        />
        <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
          Set as active contest (only one contest can be active at a time)
        </label>
      </div>

      <div className="flex gap-4">
        <Button type="submit" loading={loading} disabled={loading} className="flex-1">
          {contest ? 'Update Contest' : 'Create Contest'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
