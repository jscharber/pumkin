'use client';

import { useState, FormEvent, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import ImageUpload from '@/components/ui/ImageUpload';
import { useToast } from '@/context/ToastContext';
import { uploadEntryImage, resizeImage, deleteEntryImage } from '@/lib/storage';
import { updateEntry } from '@/lib/db/entries';
import { Entry } from '@/types';
import Image from 'next/image';

interface EntryEditFormProps {
  entry: Entry;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EntryEditForm({
  entry,
  onSuccess,
  onCancel,
}: EntryEditFormProps) {
  const { showToast } = useToast();

  const [entrantName, setEntrantName] = useState(entry.entrantName);
  const [title, setTitle] = useState(entry.title);
  const [description, setDescription] = useState(entry.description || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [replaceImage, setReplaceImage] = useState(false);

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      showToast('Please fix the errors before submitting', 'error');
      return;
    }

    setLoading(true);

    try {
      const updates: Partial<{
        entrantName: string;
        title: string;
        description: string;
        imageUrl: string;
        imagePath: string;
      }> = {
        entrantName: entrantName.trim(),
        title: title.trim(),
        description: description.trim(),
      };

      // If user selected a new image, upload it and delete the old one
      if (imageFile && replaceImage) {
        // Resize image if needed
        const resizedImage = await resizeImage(imageFile, 1920);

        // Upload new image to Firebase Storage
        const { url, path } = await uploadEntryImage(entry.contestId, resizedImage);

        updates.imageUrl = url;
        updates.imagePath = path;

        // Update entry in Firestore
        await updateEntry(entry.id, updates);

        // Delete old image from storage
        if (entry.imagePath) {
          try {
            await deleteEntryImage(entry.imagePath);
          } catch (error) {
            console.error('Error deleting old image:', error);
            // Don't throw - entry is already updated
          }
        }
      } else {
        // Just update text fields
        await updateEntry(entry.id, updates);
      }

      showToast('Entry updated successfully!', 'success');
      onSuccess();
    } catch (error) {
      console.error('Error updating entry:', error);
      showToast(
        error instanceof Error ? error.message : 'Failed to update entry',
        'error'
      );
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Entrant Name"
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

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Current Image
        </label>
        <div className="relative w-64 h-64 border border-gray-300 rounded-lg overflow-hidden">
          <Image
            src={entry.imageUrl}
            alt={entry.title}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="replaceImage"
            checked={replaceImage}
            onChange={(e) => setReplaceImage(e.target.checked)}
            disabled={loading}
            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
          />
          <label htmlFor="replaceImage" className="text-sm text-gray-700">
            Replace image
          </label>
        </div>

        {replaceImage && (
          <ImageUpload
            onImageSelect={setImageFile}
            error={errors.image}
          />
        )}
      </div>

      {description.length > 0 && (
        <p className="text-sm text-gray-500 text-right">
          {description.length}/500 characters
        </p>
      )}

      <div className="flex gap-4 pt-4">
        <Button
          type="submit"
          loading={loading}
          disabled={loading}
          className="flex-1"
        >
          Update Entry
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
