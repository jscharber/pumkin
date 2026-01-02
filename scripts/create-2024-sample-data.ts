/**
 * Script to create sample entries and votes for 2024 contest
 *
 * Usage:
 *   npm run create-sample-data
 *
 * This will create:
 * - 3-5 sample entries for 2024 contest
 * - 20-30 sample votes distributed across categories
 */

import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  Timestamp,
  addDoc,
} from 'firebase/firestore';
import * as crypto from 'crypto';

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

const CONTEST_ID = '2024';

// Sample entry data
const sampleEntries = [
  {
    entrantName: 'Alice Johnson',
    title: 'Spooky Ghost',
    description: 'A classic ghostly design with intricate carving details',
    // Using placehold.co (updated from via.placeholder.com)
    imageUrl: 'https://placehold.co/800x800/FF6B35/FFF/png?text=Spooky+Ghost',
    imagePath: 'entries/2024/sample-ghost.jpg',
  },
  {
    entrantName: 'Bob Martinez',
    title: "Dragon's Lair",
    description: 'An elaborate dragon emerging from the pumpkin',
    imageUrl: 'https://placehold.co/800x800/004E89/FFF/png?text=Dragon+Lair',
    imagePath: 'entries/2024/sample-dragon.jpg',
  },
  {
    entrantName: 'Carol Davis',
    title: 'Pumpkin Pi',
    description: 'A mathematical masterpiece featuring the digits of pi carved in a spiral',
    imageUrl: 'https://placehold.co/800x800/F77F00/FFF/png?text=Pumpkin+Pi',
    imagePath: 'entries/2024/sample-pi.jpg',
  },
  {
    entrantName: 'David Chen',
    title: 'Frankenstein Face',
    description: 'A quirky take on the classic monster',
    imageUrl: 'https://placehold.co/800x800/06A77D/FFF/png?text=Frankenstein',
    imagePath: 'entries/2024/sample-frankenstein.jpg',
  },
  {
    entrantName: 'Emma Wilson',
    title: 'Starry Night Pumpkin',
    description: 'Van Gogh inspired design with swirling stars',
    imageUrl: 'https://placehold.co/800x800/9B59B6/FFF/png?text=Starry+Night',
    imagePath: 'entries/2024/sample-starry.jpg',
  },
];

// Generate a random visitor ID (fingerprint hash)
function generateVisitorId(): string {
  return crypto.randomBytes(32).toString('hex');
}

async function createSampleData() {
  console.log('🎃 Creating sample data for 2024 contest...\n');

  try {
    // Verify contest exists
    const contestRef = doc(db, 'contests', CONTEST_ID);
    const contestSnap = await getDoc(contestRef);

    if (!contestSnap.exists()) {
      console.error('❌ 2024 contest not found. Please run setup-test-data.ts first.');
      process.exit(1);
    }

    console.log('✅ Found 2024 contest\n');

    // Get categories
    const categoriesQuery = query(
      collection(db, 'categories'),
      where('contestId', '==', CONTEST_ID)
    );
    const categoriesSnap = await getDocs(categoriesQuery);

    if (categoriesSnap.empty) {
      console.error('❌ No categories found for 2024. Please run setup-test-data.ts first.');
      process.exit(1);
    }

    const categories = categoriesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(`✅ Found ${categories.length} categories:`);
    categories.forEach((cat: any) => console.log(`   - ${cat.name}`));
    console.log();

    // Check for existing entries
    const existingEntriesQuery = query(
      collection(db, 'entries'),
      where('contestId', '==', CONTEST_ID),
      where('isInspiration', '==', false)
    );
    const existingEntriesSnap = await getDocs(existingEntriesQuery);

    console.log(`Found ${existingEntriesSnap.size} existing entries for 2024\n`);

    // Create sample entries
    console.log('Creating sample entries:');
    const entryIds: string[] = [];

    for (const entry of sampleEntries) {
      const entryRef = doc(collection(db, 'entries'));
      await setDoc(entryRef, {
        contestId: CONTEST_ID,
        entrantName: entry.entrantName,
        title: entry.title,
        description: entry.description,
        imageUrl: entry.imageUrl,
        imagePath: entry.imagePath,
        isInspiration: false,
        createdAt: Timestamp.now(),
      });
      entryIds.push(entryRef.id);
      console.log(`  ✅ ${entry.title} by ${entry.entrantName}`);
    }

    console.log();

    // Create sample votes with strategic distribution
    console.log('Creating sample votes:');

    const voteDistribution = [
      // Entry 0 (Spooky Ghost) - Strong in Scariest and Most Creative
      { entryIndex: 0, categoryNames: ['Scariest', 'Most Creative', 'Fun'], voteCount: 8 },
      // Entry 1 (Dragon's Lair) - Strong in Best Craft
      { entryIndex: 1, categoryNames: ['Best Craft', 'Most Creative'], voteCount: 10 },
      // Entry 2 (Pumpkin Pi) - Strong in Most Creative and People's Choice
      { entryIndex: 2, categoryNames: ['Most Creative', "People's Choice", 'Fun'], voteCount: 7 },
      // Entry 3 (Frankenstein) - Strong in Fun and Carved Under the Influence
      { entryIndex: 3, categoryNames: ['Fun', 'Carved Under the Influence'], voteCount: 6 },
      // Entry 4 (Starry Night) - Strong in Best Craft and People's Choice
      { entryIndex: 4, categoryNames: ['Best Craft', "People's Choice"], voteCount: 9 },
    ];

    let totalVotes = 0;

    for (const dist of voteDistribution) {
      const entryId = entryIds[dist.entryIndex];

      for (const categoryName of dist.categoryNames) {
        const category = categories.find((c: any) => c.name === categoryName);
        if (!category) continue;

        // Create multiple votes for this entry/category combination
        for (let i = 0; i < dist.voteCount; i++) {
          const voteRef = doc(collection(db, 'votes'));
          await setDoc(voteRef, {
            contestId: CONTEST_ID,
            categoryId: category.id,
            entryId: entryId,
            visitorId: generateVisitorId(),
            createdAt: Timestamp.now(),
          });
          totalVotes++;
        }

        console.log(
          `  ✅ ${dist.voteCount} votes for "${sampleEntries[dist.entryIndex].title}" in ${categoryName}`
        );
      }
    }

    console.log();
    console.log(`\n🎉 Sample data creation complete!\n`);
    console.log(`Created:`);
    console.log(`  - ${entryIds.length} entries`);
    console.log(`  - ${totalVotes} votes across ${categories.length} categories\n`);
    console.log('Next steps:');
    console.log('  1. Visit http://localhost:3001/results/2024');
    console.log('  2. Check the Overall Leaderboard');
    console.log('  3. View Category Winners\n');
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    process.exit(1);
  }
}

createSampleData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
