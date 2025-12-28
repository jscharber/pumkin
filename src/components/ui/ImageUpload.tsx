'use client';

import { useState, useRef, ChangeEvent } from 'react';
import Image from 'next/image';
import Button from './Button';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  error?: string;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
}

export default function ImageUpload({
  onImageSelect,
  error,
  maxSize = 10,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [localError, setLocalError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setLocalError('');

    if (!file) {
      return;
    }

    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      setLocalError('Only JPG, PNG, and WebP images are allowed');
      return;
    }

    // Validate file size
    const maxBytes = maxSize * 1024 * 1024;
    if (file.size > maxBytes) {
      setLocalError(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setFileName(file.name);
    onImageSelect(file);
  };

  const handleClear = () => {
    setPreview(null);
    setFileName('');
    setLocalError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const displayError = error || localError;

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Pumpkin Image <span className="text-red-500">*</span>
      </label>

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileChange}
        className="hidden"
      />

      {preview ? (
        <div className="space-y-3">
          <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-contain"
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 truncate">{fileName}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClear}
            >
              Change Image
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={handleClick}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            displayError
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 hover:border-primary hover:bg-gray-50'
          }`}
        >
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-600">
            <span className="font-semibold text-primary">Click to upload</span> or drag
            and drop
          </p>
          <p className="mt-1 text-xs text-gray-500">
            PNG, JPG, or WebP up to {maxSize}MB
          </p>
        </div>
      )}

      {displayError && (
        <p className="text-red-500 text-sm mt-2">{displayError}</p>
      )}
    </div>
  );
}
