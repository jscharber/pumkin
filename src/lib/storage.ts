import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function uploadEntryImage(
  contestId: string,
  file: File
): Promise<{ url: string; path: string }> {
  if (!storage) throw new Error('Firebase Storage not initialized');

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size must be less than 10MB');
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Only JPG, PNG, and WebP images are allowed');
  }

  // Generate unique filename
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(7);
  const extension = file.name.split('.').pop();
  const filename = `${timestamp}_${randomStr}.${extension}`;

  // Create storage reference
  const path = `entries/${contestId}/${filename}`;
  const storageRef = ref(storage, path);

  // Upload file
  await uploadBytes(storageRef, file);

  // Get download URL
  const url = await getDownloadURL(storageRef);

  return { url, path };
}

export async function deleteEntryImage(path: string): Promise<void> {
  if (!storage) throw new Error('Firebase Storage not initialized');
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}

export async function resizeImage(
  file: File,
  maxWidth: number = 1920
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Check if resize is needed
        if (img.width <= maxWidth) {
          resolve(file);
          return;
        }

        // Calculate new dimensions
        const ratio = maxWidth / img.width;
        const newWidth = maxWidth;
        const newHeight = img.height * ratio;

        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Draw resized image
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }

            // Create new file
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });

            resolve(resizedFile);
          },
          file.type,
          0.9 // Quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}
