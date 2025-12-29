'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import { Contest, Category } from '@/types';
import { getAllContests } from '@/lib/db/contests';
import {
  getCategoriesForContest,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from '@/lib/db/categories';
import { useToast } from '@/context/ToastContext';

export default function CategoriesPage() {
  const { showToast } = useToast();
  const [contests, setContests] = useState<Contest[]>([]);
  const [selectedContestId, setSelectedContestId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadContests();
  }, []);

  useEffect(() => {
    if (selectedContestId) {
      loadCategories();
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

  const loadCategories = async () => {
    try {
      const data = await getCategoriesForContest(selectedContestId);
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      showToast('Failed to load categories', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingId) {
        await updateCategory(editingId, {
          contestId: selectedContestId,
          name: formName,
          description: formDescription,
          order: 0,
        });
        showToast('Category updated', 'success');
      } else {
        await createCategory({
          contestId: selectedContestId,
          name: formName,
          description: formDescription,
          order: categories.length,
        });
        showToast('Category created', 'success');
      }
      resetForm();
      loadCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      showToast('Failed to save category', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (category: Category) => {
    setFormName(category.name);
    setFormDescription(category.description);
    setEditingId(category.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      await deleteCategory(id);
      showToast('Category deleted', 'success');
      loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      showToast('Failed to delete category', 'error');
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormDescription('');
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Category Management</h1>
        <p className="text-gray-600">Manage voting categories for contests</p>
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
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Categories ({categories.length})
            </h2>
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : 'Add Category'}
            </Button>
          </div>

          {showForm && (
            <Card className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Category Name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  placeholder="Best Craft"
                />
                <Textarea
                  label="Description"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Awarded for exceptional carving technique"
                  rows={3}
                />
                <Button type="submit" loading={submitting}>
                  {editingId ? 'Update' : 'Create'} Category
                </Button>
              </form>
            </Card>
          )}

          <div className="space-y-4">
            {categories.map((category) => (
              <Card key={category.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{category.name}</h3>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(category)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
