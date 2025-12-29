'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ContestForm from '@/components/admin/ContestForm';
import { Contest } from '@/types';
import { getAllContests, setActiveContest } from '@/lib/db/contests';
import { useToast } from '@/context/ToastContext';

export default function ContestsPage() {
  const { showToast } = useToast();
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingContest, setEditingContest] = useState<Contest | undefined>();

  const loadContests = async () => {
    try {
      const data = await getAllContests();
      setContests(data);
    } catch (error) {
      console.error('Error loading contests:', error);
      showToast('Failed to load contests', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContests();
  }, []);

  const handleCreateNew = () => {
    setEditingContest(undefined);
    setShowForm(true);
  };

  const handleEdit = (contest: Contest) => {
    setEditingContest(contest);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingContest(undefined);
    loadContests();
  };

  const handleToggleActive = async (contest: Contest) => {
    try {
      await setActiveContest(contest.id);
      showToast(`${contest.name} is now active`, 'success');
      loadContests();
    } catch (error) {
      console.error('Error toggling active status:', error);
      showToast('Failed to update contest', 'error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Contest Management</h1>
          <p className="text-gray-600">Create and manage pumpkin carving contests</p>
        </div>
        <Button onClick={handleCreateNew}>Create New Contest</Button>
      </div>

      {contests.length === 0 ? (
        <Card className="p-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Contests Yet
            </h3>
            <p className="text-gray-600 mb-4">
              Create your first contest to get started
            </p>
            <Button onClick={handleCreateNew}>Create Contest</Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {contests.map((contest) => (
            <Card key={contest.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{contest.name}</h3>
                    {contest.isActive && (
                      <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <span className="font-medium">Year:</span> {contest.year}
                    </p>
                    <p>
                      <span className="font-medium">Submission Window:</span>{' '}
                      {contest.submissionStart.toDate().toLocaleDateString()} -{' '}
                      {contest.submissionEnd.toDate().toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(contest)}
                  >
                    Edit
                  </Button>
                  {!contest.isActive && (
                    <Button
                      size="sm"
                      onClick={() => handleToggleActive(contest)}
                    >
                      Set Active
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showForm && (
        <Modal
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          title={editingContest ? 'Edit Contest' : 'Create New Contest'}
        >
          <ContestForm
            contest={editingContest}
            onSuccess={handleFormSuccess}
            onCancel={() => setShowForm(false)}
          />
        </Modal>
      )}
    </div>
  );
}
