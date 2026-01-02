'use client';

import { useActiveContest } from '@/hooks/useContest';
import { useEntries } from '@/hooks/useEntries';
import { useCategories } from '@/hooks/useCategories';
import Card from '@/components/ui/Card';
import { getSubmissionStatus, getDaysUntilSubmissionStart, getDaysUntilSubmissionEnd } from '@/lib/db/contests';
import { useState, useEffect } from 'react';
import { collection, getCountFromServer, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AdminDashboard() {
  const { contest, loading: contestLoading } = useActiveContest();
  const { entries, loading: entriesLoading } = useEntries(contest?.id || null);
  const { categories, loading: categoriesLoading } = useCategories(
    contest?.id || null
  );
  const [totalVotes, setTotalVotes] = useState(0);
  const [loadingVotes, setLoadingVotes] = useState(true);

  useEffect(() => {
    if (!contest || !db) {
      setLoadingVotes(false);
      return;
    }

    const fetchVoteCount = async () => {
      try {
        const q = query(
          collection(db!, 'votes'),
          where('contestId', '==', contest.id)
        );
        const snapshot = await getCountFromServer(q);
        setTotalVotes(snapshot.data().count);
      } catch (error) {
        console.error('Error fetching vote count:', error);
      } finally {
        setLoadingVotes(false);
      }
    };

    fetchVoteCount();
  }, [contest]);

  const loading = contestLoading || entriesLoading || categoriesLoading || loadingVotes;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!contest) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            No Active Contest
          </h2>
          <p className="text-gray-600">
            Create a contest to get started.
          </p>
        </div>
      </Card>
    );
  }

  const submissionStatus = getSubmissionStatus(contest);
  const daysUntilStart = getDaysUntilSubmissionStart(contest);
  const daysUntilEnd = getDaysUntilSubmissionEnd(contest);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Overview of {contest.name}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="text-sm font-medium text-gray-500 mb-2">
            Total Entries
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {entries.length}
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-sm font-medium text-gray-500 mb-2">
            Total Votes
          </div>
          <div className="text-3xl font-bold text-gray-900">{totalVotes}</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm font-medium text-gray-500 mb-2">
            Categories
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {categories.length}
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-sm font-medium text-gray-500 mb-2">
            Submission Status
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                submissionStatus === 'open'
                  ? 'bg-green-500'
                  : submissionStatus === 'not-started'
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
            />
            <span className="text-lg font-semibold">
              {submissionStatus === 'open'
                ? 'Open'
                : submissionStatus === 'not-started'
                ? 'Opens Soon'
                : 'Closed'}
            </span>
          </div>
          {submissionStatus === 'not-started' && daysUntilStart > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              Opens in {daysUntilStart} {daysUntilStart === 1 ? 'day' : 'days'}
            </p>
          )}
          {submissionStatus === 'open' && daysUntilEnd > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {daysUntilEnd} {daysUntilEnd === 1 ? 'day' : 'days'} remaining
            </p>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Contest Information</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="text-gray-900">{contest.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Year</dt>
              <dd className="text-gray-900">{contest.year}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Submission Window
              </dt>
              <dd className="text-gray-900">
                {contest.submissionStart.toDate().toLocaleDateString()} -{' '}
                {contest.submissionEnd.toDate().toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd>
                <span
                  className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                    contest.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {contest.isActive ? 'Active' : 'Inactive'}
                </span>
              </dd>
            </div>
          </dl>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <a
              href="/admin/contests"
              className="block px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="font-medium">Manage Contests</div>
              <div className="text-sm text-gray-600">
                Create or edit contests
              </div>
            </a>
            <a
              href="/admin/categories"
              className="block px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="font-medium">Manage Categories</div>
              <div className="text-sm text-gray-600">
                Add, edit, or reorder voting categories
              </div>
            </a>
            <a
              href="/admin/entries"
              className="block px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="font-medium">Moderate Entries</div>
              <div className="text-sm text-gray-600">
                View and manage submitted entries
              </div>
            </a>
            <a
              href="/"
              className="block px-4 py-3 bg-primary hover:bg-secondary text-white rounded-lg transition-colors"
            >
              <div className="font-medium">View Public Site</div>
              <div className="text-sm opacity-90">
                See the contest as visitors see it
              </div>
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
