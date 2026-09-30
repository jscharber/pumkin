'use client';

import { useState, useRef, useEffect, ChangeEvent } from 'react';
import Image from 'next/image';

interface MultiImageUploadProps {
  files: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  error?: string;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  label?: string;
  disabled?: boolean;
}

export default function MultiImageUpload({
  files,
  onChange,
  maxFiles = 3,
  error,
  maxSize = 10,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  label = 'Pumpkin Photos',
  disabled = false,
}: MultiImageUploadProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [localError, setLocalError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setLocalError('');

    // Reset so selecting the same file again still fires onChange
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (selected.length === 0) {
      return;
    }

    const maxBytes = maxSize * 1024 * 1024;
    for (const file of selected) {
      if (!acceptedTypes.includes(file.type)) {
        setLocalError('Only JPG, PNG, and WebP images are allowed');
        return;
      }
      if (file.size > maxBytes) {
        setLocalError(`Each photo must be less than ${maxSize}MB`);
        return;
      }
    }

    const remaining = maxFiles - files.length;
    if (selected.length > remaining) {
      setLocalError(`You can upload up to ${maxFiles} photos`);
    }

    onChange([...files, ...selected.slice(0, remaining)]);
  };

  const handleRemove = (index: number) => {
    setLocalError('');
    onChange(files.filter((_, i) => i !== index));
  };

  const displayError = error || localError;
  const canAddMore = files.length < maxFiles && !disabled;

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} <span className="text-red-500">*</span>
      </label>
      <p className="text-xs text-gray-500 mb-2">
        Add up to {maxFiles} photos. The first photo is shown in the gallery.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {previews.map((src, index) => (
          <div
            key={src}
            className="relative h-40 bg-gray-100 rounded-lg overflow-hidden border border-gray-200"
          >
            <Image
              src={src}
              alt={`Photo ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 33vw"
            />
            {index === 0 && (
              <span className="absolute top-2 left-2 px-2 py-0.5 text-xs font-semibold bg-primary text-white rounded">
                Main
              </span>
            )}
            {!disabled && (
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-black bg-opacity-60 hover:bg-opacity-80 text-white rounded-full text-lg leading-none"
                aria-label={`Remove photo ${index + 1}`}
              >
                &times;
              </button>
            )}
          </div>
        ))}

        {canAddMore && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center transition-colors ${
              displayError
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 hover:border-primary hover:bg-gray-50'
            }`}
          >
            <span className="text-3xl text-gray-400">+</span>
            <span className="text-sm font-semibold text-primary">Add photo</span>
            <span className="text-xs text-gray-500 mt-1">
              PNG, JPG, or WebP up to {maxSize}MB
            </span>
          </button>
        )}
      </div>

      {displayError && (
        <p className="text-red-500 text-sm mt-2">{displayError}</p>
      )}
    </div>
  );
}
