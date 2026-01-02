'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/layout/Container';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import ImageUpload from '@/components/ui/ImageUpload';
import { Contest } from '@/types';
import { getAllContests } from '@/lib/db/contests';
import { createEntry } from '@/lib/db/entries';
import { uploadEntryImage } from '@/lib/storage';
import { useToast } from '@/context/ToastContext';

export default function InspirationAdminPage() {
  const router = useRouter();
  const [contests, setContests] = useState<Contest[]>([]);
  const [selectedContestId, setSelectedContestId] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const loadContests = async () => {
      const data = await getAllContests();
      setContests(data);
    };
    loadContests();
  }, []);

  const handleImagesChange = (files: File[]) => {
    setImages(files);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!selectedContestId) {
      showToast('Please select a contest', 'error');
      return;
    }

    if (images.length === 0) {
      showToast('Please select at least one image', 'error');
      return;
    }

    setUploading(true);

    try {
      let successCount = 0;

      for (let i = 0; i < images.length; i++) {
        const image = images[i];

        try {
          // Upload image
          const { url, path } = await uploadEntryImage(selectedContestId, image);

          // Create inspiration entry
          await createEntry(
            selectedContestId,
            'Past Contestant', // Generic name for inspiration entries
            `Inspiration ${i + 1}`,
            'Past year entry for inspiration',
            url,
            path,
            true // isInspiration = true
          );

          successCount++;
        } catch (error) {
          console.error(`Error uploading image ${i + 1}:`, error);
        }
      }

      showToast(
        `Successfully uploaded ${successCount} of ${images.length} inspiration images`,
        successCount === images.length ? 'success' : 'info'
      );

      // Redirect to management page with pre-selected contest
      router.push(`/admin/inspiration/manage?contest=${selectedContestId}`);
    } catch (error) {
      console.error('Error uploading inspiration images:', error);
      showToast('Failed to upload inspiration images', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container className="py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Upload Inspiration Images</h1>
          <p className="text-gray-600">
            Upload past year entries to inspire future contestants. These images will appear in the inspiration gallery.
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Select
              label="Select Contest Year"
              value={selectedContestId}
              onChange={(e) => setSelectedContestId(e.target.value)}
              options={contests.map((contest) => ({
                value: contest.id,
                label: `${contest.year}`,
              }))}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Images
              </label>
              <p className="text-sm text-gray-500 mb-4">
                Select multiple images to upload at once. Each will be added as a separate inspiration entry.
              </p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  handleImagesChange(files);
                }}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-white
                  hover:file:bg-primary/90
                  file:cursor-pointer cursor-pointer"
              />
              {images.length > 0 && (
                <p className="mt-2 text-sm text-gray-600">
                  {images.length} image{images.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={uploading || !selectedContestId || images.length === 0}
              >
                {uploading
                  ? `Uploading ${images.length} image${images.length !== 1 ? 's' : ''}...`
                  : 'Upload Images'}
              </Button>
              {images.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setImages([])}
                >
                  Clear Selection
                </Button>
              )}
            </div>
          </form>
        </Card>

        {images.length > 0 && (
          <Card className="mt-6 p-6">
            <h2 className="text-lg font-semibold mb-4">Preview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </Container>
  );
}
