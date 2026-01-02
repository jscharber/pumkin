/**
 * Script to fix placeholder URLs in existing entries
 * Changes from via.placeholder.com to placehold.co
 *
 * Usage:
 *   npx ts-node scripts/fix-placeholder-urls.ts
 */

import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
} from 'firebase/firestore';

// Load environment variables
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

async function fixPlaceholderUrls() {
  console.log('🔧 Fixing placeholder URLs in entries...\n');

  try {
    // Get all entries with via.placeholder.com URLs
    const entriesRef = collection(db, 'entries');
    const snapshot = await getDocs(entriesRef);

    let fixedCount = 0;
    let skippedCount = 0;

    for (const docSnap of snapshot.docs) {
      const entry = docSnap.data();
      const imageUrl = entry.imageUrl;

      if (imageUrl && imageUrl.includes('via.placeholder.com')) {
        // Convert URL from via.placeholder.com to placehold.co
        // Old: https://via.placeholder.com/800x800/FF6B35/FFFFFF?text=Spooky+Ghost
        // New: https://placehold.co/800x800/FF6B35/FFF/png?text=Spooky+Ghost

        const newUrl = imageUrl
          .replace('via.placeholder.com', 'placehold.co')
          .replace(/\/([0-9A-F]{6})\/FFFFFF/i, '/$1/FFF/png');

        console.log(`Updating entry: ${entry.title}`);
        console.log(`  Old URL: ${imageUrl}`);
        console.log(`  New URL: ${newUrl}`);

        await updateDoc(doc(db, 'entries', docSnap.id), {
          imageUrl: newUrl,
        });

        fixedCount++;
      } else {
        skippedCount++;
      }
    }

    console.log('\n✅ Done!');
    console.log(`  Fixed: ${fixedCount} entries`);
    console.log(`  Skipped: ${skippedCount} entries`);
  } catch (error) {
    console.error('❌ Error fixing placeholder URLs:', error);
    process.exit(1);
  }
}

fixPlaceholderUrls()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
