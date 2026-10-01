# Data Model

## Firestore Collections

### contests
One document per year/contest.

```typescript
interface Contest {
  id: string;              // Document ID, e.g., "2024"
  year: number;            // 2024
  name: string;            // "2024 Pumpkin Carving Contest"
  submissionStart: Timestamp;
  submissionEnd: Timestamp;
  votingStart?: Timestamp;
  votingEnd?: Timestamp;
  timeZone?: string;       // IANA zone the dates are entered/shown in, e.g. "America/Chicago"
  headerImageUrl?: string | null;  // Home page header picture (Storage URL)
  headerImagePath?: string | null; // Storage path for deletion (contests/{id}/...)
  introMessage?: string;   // Shown on the Home page
  instructionsAndRules?: string; // Shown on the Home page
  categoriesText?: string; // Shown on the Home page under Instructions and Rules
  contactInfo?: string;    // Shown on the Home page
  isActive: boolean;       // Only one should be true
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Example Document:**
```json
{
  "year": 2024,
  "name": "2024 Pumpkin Carving Contest",
  "submissionStart": "2024-10-01T00:00:00Z",
  "submissionEnd": "2024-10-20T23:59:59Z",
  "votingStart": "2024-10-21T00:00:00Z",
  "votingEnd": "2024-10-31T23:59:59Z",
  "timeZone": "America/Chicago",
  "headerImageUrl": "https://firebasestorage.googleapis.com/...",
  "headerImagePath": "contests/abc123/header_1727712000000.jpg",
  "introMessage": "Welcome to our annual pumpkin carving contest!",
  "instructionsAndRules": "One entry per household...",
  "contactInfo": "Questions? Email pumpkins@example.com",
  "isActive": true,
  "createdAt": "2024-09-15T12:00:00Z",
  "updatedAt": "2024-09-15T12:00:00Z"
}
```

---

### categories
Voting categories, scoped per contest.

```typescript
interface Category {
  id: string;              // Auto-generated
  contestId: string;       // Reference to contests collection
  name: string;            // "Carved Under the Influence"
  description: string;     // Optional explanatory text
  order: number;           // Display order (0, 1, 2, ...)
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Example Document:**
```json
{
  "contestId": "2024",
  "name": "Best Craft",
  "description": "Awarded for exceptional carving technique and detail",
  "order": 1,
  "createdAt": "2024-09-15T12:00:00Z",
  "updatedAt": "2024-09-15T12:00:00Z"
}
```

---

### entries
Pumpkin submissions.

```typescript
interface Entry {
  id: string;              // Auto-generated
  contestId: string;       // Reference to contests collection
  entrantName: string;     // "John Smith"
  title: string;           // "Spooky Steve"
  description: string;     // Optional details
  imageUrl: string;        // Firebase Storage URL (main photo, same as images[0])
  imagePath: string;       // Storage path for deletion
  images?: { url: string; path: string }[]; // All photos in order, max 3
  createdAt: Timestamp;
}
```

### entryContacts
Optional contact info from the submit form. Document ID matches the entry ID.
Kept out of `entries` because entries are publicly readable; only admins can read these.

```typescript
interface EntryContact {
  id: string;              // Same as the entry ID
  contestId: string;
  contactInfo: string;     // Max 500 characters
  createdAt: Timestamp;
}
```

**Example Document:**
```json
{
  "contestId": "2024",
  "entrantName": "John Smith",
  "title": "Spooky Steve",
  "description": "My first attempt at a scary face design",
  "imageUrl": "https://firebasestorage.googleapis.com/...",
  "imagePath": "entries/2024/abc123.jpg",
  "createdAt": "2024-10-05T14:30:00Z"
}
```

---

### votes
One document per voter per category.

```typescript
interface Vote {
  id: string;              // Auto-generated
  contestId: string;       // Reference to contests collection
  categoryId: string;      // Reference to categories collection
  entryId: string;         // Reference to entries collection
  visitorId: string;       // Fingerprint hash (unique voter ID)
  createdAt: Timestamp;
}
```

**Example Document:**
```json
{
  "contestId": "2024",
  "categoryId": "cat_abc123",
  "entryId": "entry_xyz789",
  "visitorId": "fp_a1b2c3d4e5f6",
  "createdAt": "2024-10-15T18:45:00Z"
}
```

---

## Indexes

Create composite indexes for common queries:

```
// Get all categories for a contest, ordered
Collection: categories
Fields: contestId ASC, order ASC

// Get all entries for a contest, newest first
Collection: entries
Fields: contestId ASC, createdAt DESC

// Check if visitor already voted in category
Collection: votes
Fields: contestId ASC, categoryId ASC, visitorId ASC

// Count votes per entry in a category
Collection: votes
Fields: contestId ASC, categoryId ASC, entryId ASC

// Get all votes for an entry (for total count)
Collection: votes
Fields: entryId ASC
```

---

## Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper: Check if user is admin
    function isAdmin() {
      return request.auth != null && 
             request.auth.token.email == 'admin@yourcontest.com';
    }
    
    // Contests: public read, admin write
    match /contests/{contestId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Categories: public read, admin write
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Entries: public read, public create (during submission window), admin delete
    match /entries/{entryId} {
      allow read: if true;
      allow create: if true;  // Submission window enforced in app
      allow update: if false;
      allow delete: if isAdmin();
    }
    
    // Votes: public read, public create (one per visitor/category), no update/delete
    match /votes/{voteId} {
      allow read: if true;
      allow create: if true;  // Duplicate prevention in app
      allow update, delete: if false;
    }
  }
}
```

---

## Storage Rules

```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /entries/{contestId}/{fileName} {
      // Anyone can read images
      allow read: if true;
      
      // Anyone can upload images (with restrictions)
      allow write: if request.resource.size < 10 * 1024 * 1024  // 10MB max
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

---

## TypeScript Types File

Create `src/types/index.ts`:

```typescript
import { Timestamp } from 'firebase/firestore';

export interface Contest {
  id: string;
  year: number;
  name: string;
  submissionStart: Timestamp;
  submissionEnd: Timestamp;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Category {
  id: string;
  contestId: string;
  name: string;
  description: string;
  order: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Entry {
  id: string;
  contestId: string;
  entrantName: string;
  title: string;
  description: string;
  imageUrl: string;
  imagePath: string;
  createdAt: Timestamp;
}

export interface Vote {
  id: string;
  contestId: string;
  categoryId: string;
  entryId: string;
  visitorId: string;
  createdAt: Timestamp;
}

// Utility types for forms (without server-generated fields)
export type ContestInput = Omit<Contest, 'id' | 'createdAt' | 'updatedAt'>;
export type CategoryInput = Omit<Category, 'id' | 'createdAt' | 'updatedAt'>;
export type EntryInput = Omit<Entry, 'id' | 'createdAt' | 'imageUrl' | 'imagePath'>;
export type VoteInput = Omit<Vote, 'id' | 'createdAt'>;
```

---

## Common Queries

```typescript
// Get active contest
const activeContest = await db.collection('contests')
  .where('isActive', '==', true)
  .limit(1)
  .get();

// Get categories for contest, ordered
const categories = await db.collection('categories')
  .where('contestId', '==', contestId)
  .orderBy('order')
  .get();

// Get entries for contest, newest first
const entries = await db.collection('entries')
  .where('contestId', '==', contestId)
  .orderBy('createdAt', 'desc')
  .get();

// Check for existing vote
const existingVote = await db.collection('votes')
  .where('contestId', '==', contestId)
  .where('categoryId', '==', categoryId)
  .where('visitorId', '==', visitorId)
  .limit(1)
  .get();

// Count votes for entry in category
const voteCount = await db.collection('votes')
  .where('categoryId', '==', categoryId)
  .where('entryId', '==', entryId)
  .count()
  .get();

// Get all contests for year selector
const contests = await db.collection('contests')
  .orderBy('year', 'desc')
  .get();
```
