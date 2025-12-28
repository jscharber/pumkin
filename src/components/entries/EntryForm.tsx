'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import ImageUpload from '@/components/ui/ImageUpload';
import { useToast } from '@/context/ToastContext';
import { uploadEntryImage, resizeImage } from '@/lib/storage';
import { createEntry } from '@/lib/db/entries';

interface EntryFormProps {
  contestId: string;
}

export default function EntryForm({ contestId }: EntryFormProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [entrantName, setEntrantName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<{
    entrantName?: string;
    title?: string;
    description?: string;
    image?: string;
  }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!entrantName.trim()) {
      newErrors.entrantName = 'Name is required';
    } else if (entrantName.length > 100) {
      newErrors.entrantName = 'Name must be 100 characters or less';
    }

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length > 100) {
      newErrors.title = 'Title must be 100 characters or less';
    }

    if (description.length > 500) {
      newErrors.description = 'Description must be 500 characters or less';
    }

    if (!imageFile) {
      newErrors.image = 'Image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      showToast('Please fix the errors before submitting', 'error');
      return;
    }

    if (!imageFile) {
      return;
    }

    setLoading(true);

    try {
      // Resize image if needed
      const resizedImage = await resizeImage(imageFile, 1920);

      // Upload image to Firebase Storage
      const { url, path } = await uploadEntryImage(contestId, resizedImage);

      // Create entry in Firestore
      await createEntry(
        contestId,
        entrantName.trim(),
        title.trim(),
        description.trim(),
        url,
        path
      );

      showToast('Entry submitted successfully!', 'success');

      // Redirect to home page
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (error) {
      console.error('Error submitting entry:', error);
      showToast(
        error instanceof Error ? error.message : 'Failed to submit entry',
        'error'
      );
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <Input
        label="Your Name"
        type="text"
        value={entrantName}
        onChange={(e) => setEntrantName(e.target.value)}
        placeholder="John Smith"
        required
        maxLength={100}
        error={errors.entrantName}
        disabled={loading}
      />

      <Input
        label="Pumpkin Title"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Spooky Steve"
        required
        maxLength={100}
        error={errors.title}
        disabled={loading}
      />

      <Textarea
        label="Description (Optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Tell us about your pumpkin..."
        rows={4}
        maxLength={500}
        error={errors.description}
        disabled={loading}
      />

      <ImageUpload
        onImageSelect={setImageFile}
        error={errors.image}
      />

      <div className="flex gap-4">
        <Button
          type="submit"
          loading={loading}
          disabled={loading}
          className="flex-1"
        >
          Submit Entry
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/')}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>

      {description.length > 0 && (
        <p className="text-sm text-gray-500 text-right">
          {description.length}/500 characters
        </p>
      )}
    </form>
  );
}
