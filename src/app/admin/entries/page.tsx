'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import EntryEditForm from '@/components/entries/EntryEditForm';
import { Contest, Entry, EntryContact } from '@/types';
import { getAllContests } from '@/lib/db/contests';
import {
  getEntriesForContest,
  getEntryContactsForContest,
  getEntryImages,
  deleteEntry,
} from '@/lib/db/entries';
import { useToast } from '@/context/ToastContext';

export default function EntriesPage() {
  const { showToast } = useToast();
  const [contests, setContests] = useState<Contest[]>([]);
  const [selectedContestId, setSelectedContestId] = useState('');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [contacts, setContacts] = useState<Record<string, EntryContact>>({});
  const [loading, setLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);

  useEffect(() => {
    loadContests();
  }, []);

  useEffect(() => {
    if (selectedContestId) {
      loadEntries();
    }
  }, [selectedContestId]);

  const loadContests = async () => {
    try {
      const data = await getAllContests();
      setContests(data);
      if (data.length > 0 && !selectedContestId) {
        const active = data.find((c) => c.isActive);
        setSelectedContestId(active?.id || data[0].id);
      }
    } catch (error) {
      console.error('Error loading contests:', error);
      showToast('Failed to load contests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadEntries = async () => {
    try {
      const [data, contactData] = await Promise.all([
        getEntriesForContest(selectedContestId),
        getEntryContactsForContest(selectedContestId),
      ]);
      setEntries(data);
      setContacts(contactData);
    } catch (error) {
      console.error('Error loading entries:', error);
      showToast('Failed to load entries', 'error');
    }
  };

  const handleEdit = (entry: Entry) => {
    setEditingEntry(entry);
  };

  const handleEditSuccess = () => {
    setEditingEntry(null);
    loadEntries();
  };

  const handleEditCancel = () => {
    setEditingEntry(null);
  };

  const handleDelete = async (entry: Entry) => {
    if (!confirm(`Delete "${entry.title}" by ${entry.entrantName}?`)) return;

    try {
      // Also deletes the entry's photos and contact info
      await deleteEntry(entry.id);
      showToast('Entry deleted', 'success');
      loadEntries();
    } catch (error) {
      console.error('Error deleting entry:', error);
      showToast('Failed to delete entry', 'error');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Entry Moderation</h1>
        <p className="text-gray-600">View and manage submitted entries</p>
      </div>

      <Card className="p-6">
        <Select
          label="Select Contest"
          value={selectedContestId}
          onChange={(e) => setSelectedContestId(e.target.value)}
          options={contests.map((c) => ({ value: c.id, label: c.name }))}
        />
      </Card>

      {selectedContestId && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Entries ({entries.length})
          </h2>
          {entries.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-600">No entries yet</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {entries.map((entry) => (
                <Card key={entry.id} className="overflow-hidden">
                  <div className="relative h-48 bg-gray-100">
                    <Image
                      src={entry.imageUrl}
                      alt={entry.title}
                      fill
                      className="object-cover"
                      sizes="400px"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{entry.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      by {entry.entrantName}
                    </p>
                    {entry.description && (
                      <p className="text-sm text-gray-700 mb-3">
                        {entry.description}
                      </p>
                    )}
                    {contacts[entry.id]?.contactInfo && (
                      <p className="text-sm text-gray-700 mb-3 whitespace-pre-line">
                        <span className="font-medium">Contact:</span>{' '}
                        {contacts[entry.id].contactInfo}
                      </p>
                    )}
                    {getEntryImages(entry).length > 1 && (
                      <p className="text-xs text-gray-500 mb-1">
                        {getEntryImages(entry).length} photos
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mb-3">
                      Submitted: {entry.createdAt.toDate().toLocaleDateString()}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(entry)}
                        className="flex-1"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(entry)}
                        className="flex-1"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {editingEntry && (
        <Modal
          isOpen={true}
          onClose={handleEditCancel}
          title="Edit Entry"
        >
          <EntryEditForm
            entry={editingEntry}
            onSuccess={handleEditSuccess}
            onCancel={handleEditCancel}
          />
        </Modal>
      )}
    </div>
  );
}
