# Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         NETLIFY                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Next.js Application                     │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────────┐  │  │
│  │  │  Home   │ │ Submit  │ │ Results │ │  Admin Panel    │  │  │
│  │  │ Gallery │ │  Entry  │ │  Page   │ │  (Protected)    │  │  │
│  │  │ + Vote  │ │  Form   │ │         │ │                 │  │  │
│  │  └────┬────┘ └────┬────┘ └────┬────┘ └────────┬────────┘  │  │
│  │       │           │           │               │            │  │
│  │       └───────────┴───────────┴───────────────┘            │  │
│  │                           │                                 │  │
│  │              ┌────────────┴────────────┐                   │  │
│  │              │     Firebase Client     │                   │  │
│  │              │         SDK            │                    │  │
│  │              └────────────┬────────────┘                   │  │
│  └───────────────────────────┼───────────────────────────────┘  │
│                              │                                   │
│  ┌───────────────────────────┴───────────────────────────────┐  │
│  │              Netlify Functions (Edge)                      │  │
│  │              - Get visitor IP address                      │  │
│  └───────────────────────────┬───────────────────────────────┘  │
└──────────────────────────────┼──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                        FIREBASE                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │    Firestore    │  │     Storage     │  │      Auth       │  │
│  │                 │  │                 │  │                 │  │
│  │  - contests     │  │  - entry images │  │  - admin login  │  │
│  │  - categories   │  │                 │  │                 │  │
│  │  - entries      │  │                 │  │                 │  │
│  │  - votes        │  │                 │  │                 │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Request Flows

### Entry Submission Flow

```
User                    Next.js App                Firebase Storage         Firestore
  │                          │                            │                     │
  │  1. Fill form + image    │                            │                     │
  │─────────────────────────▶│                            │                     │
  │                          │                            │                     │
  │                          │  2. Upload image           │                     │
  │                          │───────────────────────────▶│                     │
  │                          │                            │                     │
  │                          │  3. Return image URL       │                     │
  │                          │◀───────────────────────────│                     │
  │                          │                            │                     │
  │                          │  4. Create entry doc                             │
  │                          │─────────────────────────────────────────────────▶│
  │                          │                                                  │
  │                          │  5. Confirm created                              │
  │                          │◀─────────────────────────────────────────────────│
  │                          │                            │                     │
  │  6. Show success         │                            │                     │
  │◀─────────────────────────│                            │                     │
```

### Voting Flow

```
User                Next.js App           Netlify Function        Firestore
  │                      │                       │                    │
  │  1. Click vote       │                       │                    │
  │─────────────────────▶│                       │                    │
  │                      │                       │                    │
  │                      │  2. Get IP address    │                    │
  │                      │──────────────────────▶│                    │
  │                      │◀──────────────────────│                    │
  │                      │                       │                    │
  │                      │  3. Generate fingerprint (client-side)     │
  │                      │────────────┐          │                    │
  │                      │◀───────────┘          │                    │
  │                      │                       │                    │
  │                      │  4. Check existing vote                    │
  │                      │───────────────────────────────────────────▶│
  │                      │◀───────────────────────────────────────────│
  │                      │                       │                    │
  │                      │  5. If no existing, create vote            │
  │                      │───────────────────────────────────────────▶│
  │                      │◀───────────────────────────────────────────│
  │                      │                       │                    │
  │  6. Confirm vote     │                       │                    │
  │◀─────────────────────│                       │                    │
```

---

## Component Architecture

```
src/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Home: gallery + voting
│   │
│   ├── submit/
│   │   └── page.tsx            # Entry submission form
│   │
│   ├── results/
│   │   ├── page.tsx            # Current year results
│   │   └── [year]/
│   │       └── page.tsx        # Historical results
│   │
│   └── admin/
│       ├── layout.tsx          # Admin layout with auth check
│       ├── page.tsx            # Dashboard
│       ├── contests/
│       │   └── page.tsx        # Contest management
│       ├── categories/
│       │   └── page.tsx        # Category management
│       └── entries/
│           └── page.tsx        # Entry moderation
│
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   ├── Card.tsx
│   │   ├── Skeleton.tsx
│   │   └── ImageUpload.tsx
│   │
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Container.tsx
│   │
│   ├── entries/
│   │   ├── EntryCard.tsx       # Gallery item
│   │   ├── EntryGrid.tsx       # Gallery grid
│   │   ├── EntryDetail.tsx     # Full entry view modal
│   │   └── EntryForm.tsx       # Submission form
│   │
│   ├── voting/
│   │   ├── CategoryVote.tsx    # Vote UI for one category
│   │   ├── VotingSection.tsx   # All categories voting
│   │   └── VoteConfirm.tsx     # Success message
│   │
│   ├── results/
│   │   ├── YearSelector.tsx    # Dropdown for year
│   │   ├── CategoryWinner.tsx  # Winner display per category
│   │   └── Leaderboard.tsx     # Overall rankings
│   │
│   └── admin/
│       ├── AdminNav.tsx
│       ├── ContestForm.tsx
│       ├── CategoryForm.tsx
│       ├── CategoryList.tsx    # With drag reorder
│       └── EntryTable.tsx
│
├── lib/
│   ├── firebase.ts             # Firebase app initialization
│   ├── db/
│   │   ├── contests.ts         # Contest CRUD operations
│   │   ├── categories.ts       # Category CRUD operations
│   │   ├── entries.ts          # Entry CRUD operations
│   │   └── votes.ts            # Vote operations
│   ├── storage.ts              # Image upload/delete helpers
│   ├── fingerprint.ts          # Visitor ID generation
│   └── utils/
│       ├── dates.ts            # Date formatting helpers
│       └── validation.ts       # Form validation schemas
│
├── hooks/
│   ├── useContest.ts           # Active contest data
│   ├── useCategories.ts        # Categories for contest
│   ├── useEntries.ts           # Entries for contest
│   ├── useVoting.ts            # Voting state and actions
│   ├── useVisitorId.ts         # Generate/retrieve visitor ID
│   └── useAuth.ts              # Admin authentication
│
├── context/
│   ├── AuthContext.tsx         # Admin auth state
│   └── ToastContext.tsx        # Toast notifications
│
└── types/
    └── index.ts                # TypeScript interfaces
```

---

## Voter Identification Strategy

Three-layer approach to identify unique voters without accounts:

```typescript
// lib/fingerprint.ts

import FingerprintJS from '@fingerprintjs/fingerprintjs';

export async function getVisitorId(): Promise<string> {
  // Layer 1: Browser fingerprint
  const fp = await FingerprintJS.load();
  const result = await fp.get();
  const fingerprintId = result.visitorId;
  
  // Layer 2: Persistent cookie/localStorage
  let cookieId = localStorage.getItem('voter_id');
  if (!cookieId) {
    cookieId = crypto.randomUUID();
    localStorage.setItem('voter_id', cookieId);
    document.cookie = `voter_id=${cookieId}; max-age=31536000; path=/`;
  }
  
  // Layer 3: IP address (from Netlify function)
  const ipResponse = await fetch('/.netlify/functions/get-ip');
  const { ip } = await ipResponse.json();
  
  // Combine and hash
  const combined = `${fingerprintId}_${cookieId}_${ip}`;
  const hash = await sha256(combined);
  
  return hash.substring(0, 32);
}

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
```

---

## Netlify Function for IP

```typescript
// netlify/functions/get-ip.ts

import { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  const ip = event.headers['x-forwarded-for']?.split(',')[0] 
           || event.headers['client-ip'] 
           || 'unknown';
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ip }),
  };
};
```

---

## State Management

No external state library needed. Use:

1. **React Query / SWR** (optional) - For server state caching
2. **React Context** - For auth state and toast notifications
3. **Component State** - For local UI state

```typescript
// Example: useContest hook with real-time updates

import { useEffect, useState } from 'react';
import { onSnapshot, query, where, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Contest } from '@/types';

export function useActiveContest() {
  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'contests'),
      where('isActive', '==', true)
    );
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          setContest({ id: doc.id, ...doc.data() } as Contest);
        } else {
          setContest(null);
        }
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { contest, loading, error };
}
```

---

## Environment Configuration

```bash
# .env.local (not committed)
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx

# Admin email (for security rules)
NEXT_PUBLIC_ADMIN_EMAIL=admin@yourcontest.com
```

---

## Deployment

### Netlify Configuration

```toml
# netlify.toml

[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

### Firebase Setup Checklist

1. Create Firebase project
2. Enable Firestore (start in production mode)
3. Enable Storage
4. Enable Authentication (Email/Password)
5. Create admin user account
6. Deploy security rules (`firebase deploy --only firestore:rules,storage`)
7. Create composite indexes (or let Firebase prompt you)
8. Copy config to `.env.local`
