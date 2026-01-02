'use client';

import { useState, useEffect } from 'react';
import { getAllContests } from '@/lib/db/contests';
import { Contest } from '@/types';
import Container from '@/components/layout/Container';
import EntryForm from '@/components/entries/EntryForm';
import Card from '@/components/ui/Card';
import YearSelector from '@/components/results/YearSelector';

export default function AdminSubmitPage() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [selectedContestId, setSelectedContestId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadContests() {
      try {
        setLoading(true);
        const allContests = await getAllContests();
        setContests(allContests);

        // Default to active contest if available
        const activeContest = allContests.find((c) => c.isActive);
        if (activeContest) {
          setSelectedContestId(activeContest.id);
        } else if (allContests.length > 0) {
          setSelectedContestId(allContests[0].id);
        }
      } catch (err) {
        console.error('Error loading contests:', err);
        setError('Failed to load contests');
      } finally {
        setLoading(false);
      }
    }

    loadContests();
  }, []);

  const selectedContest = contests.find((c) => c.id === selectedContestId);

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
            <p className="text-gray-600">{error}</p>
          </div>
        </Card>
      </Container>
    );
  }

  if (!loading && contests.length === 0) {
    return (
      <Container className="py-12">
        <Card className="max-w-2xl mx-auto p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              No Contests Available
            </h1>
            <p className="text-gray-600">
              There are no contests configured. Please create a contest first.
            </p>
          </div>
        </Card>
      </Container>
    );
  }

  if (!selectedContest) {
    return null;
  }

  return (
    <Container className="py-12">
      <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700 font-medium">
              Test Mode - Admin Only
            </p>
            <p className="text-xs text-yellow-600 mt-1">
              Submissions are allowed regardless of contest dates for testing purposes.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">{selectedContest.name}</h1>
        <p className="text-gray-600">Test Entry Submission</p>
      </div>

      <div className="mb-6 flex justify-center">
        <YearSelector
          contests={contests}
          selectedContestId={selectedContestId}
          onSelect={setSelectedContestId}
        />
      </div>

      <Card className="p-8">
        <EntryForm contestId={selectedContest.id} />
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
