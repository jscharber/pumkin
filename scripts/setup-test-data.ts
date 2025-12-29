/**
 * Setup script to create initial test data in Firebase
 *
 * Usage:
 *   npx ts-node scripts/setup-test-data.ts
 *
 * This will create:
 * - An active contest for 2024
 * - Sample categories
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, Timestamp } from 'firebase/firestore';

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

async function setupTestData() {
  console.log('🎃 Setting up Pumpkin Contest test data...\n');

  try {
    // Create contest
    const contestId = '2024';
    const contestRef = doc(db, 'contests', contestId);

    const now = new Date();
    const submissionStart = new Date(now.getFullYear(), 9, 1); // October 1
    const submissionEnd = new Date(now.getFullYear(), 9, 31); // October 31

    await setDoc(contestRef, {
      year: 2024,
      name: '2024 Pumpkin Carving Contest',
      submissionStart: Timestamp.fromDate(submissionStart),
      submissionEnd: Timestamp.fromDate(submissionEnd),
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    console.log('✅ Created contest: 2024 Pumpkin Carving Contest');
    console.log(`   Submission window: ${submissionStart.toLocaleDateString()} - ${submissionEnd.toLocaleDateString()}\n`);

    // Create categories
    const categories = [
      {
        name: 'Fun',
        description: 'Most fun and entertaining pumpkin',
        order: 0,
      },
      {
        name: 'Best Craft',
        description: 'Awarded for exceptional carving technique and detail',
        order: 1,
      },
      {
        name: 'Carved Under the Influence',
        description: 'For those who carved with questionable judgment',
        order: 2,
      },
      {
        name: 'Scariest',
        description: 'The pumpkin that gives you nightmares',
        order: 3,
      },
      {
        name: 'Most Creative',
        description: 'Most original and innovative design',
        order: 4,
      },
      {
        name: "People's Choice",
        description: 'Overall favorite by popular vote',
        order: 5,
      },
    ];

    console.log('Creating categories:');
    for (const category of categories) {
      const categoryRef = doc(collection(db, 'categories'));
      await setDoc(categoryRef, {
        ...category,
        contestId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      console.log(`  ✅ ${category.name}`);
    }

    console.log('\n🎉 Test data setup complete!\n');
    console.log('Next steps:');
    console.log('  1. Start your dev server: npm run dev');
    console.log('  2. Open http://localhost:3000');
    console.log('  3. Submit test entries');
    console.log('  4. Try voting!\n');

  } catch (error) {
    console.error('❌ Error setting up test data:', error);
    process.exit(1);
  }
}

setupTestData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
