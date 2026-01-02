import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
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

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

async function checkContests() {
  console.log('\n🔍 Checking contests in database...\n');

  const snapshot = await getDocs(collection(db, 'contests'));

  if (snapshot.empty) {
    console.log('❌ No contests found in database\n');
    process.exit(0);
  }

  console.log('Contests found:');
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    const start = data.submissionStart?.toDate().toLocaleDateString();
    const end = data.submissionEnd?.toDate().toLocaleDateString();
    console.log(`\n  📅 ${data.year}: ${data.name}`);
    console.log(`     ID: ${doc.id}`);
    console.log(`     Status: ${data.isActive ? '🟢 ACTIVE' : '⚫ Inactive'}`);
    console.log(`     Submissions: ${start} - ${end}`);
  });

  console.log(`\n✅ Total: ${snapshot.size} contest(s)\n`);
  process.exit(0);
}

checkContests().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
