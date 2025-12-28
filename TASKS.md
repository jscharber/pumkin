# Implementation Tasks

Use this checklist to track progress. Complete tasks in order.

## Phase 1: Project Setup

- [ ] Initialize Next.js project with TypeScript and Tailwind
- [ ] Install dependencies: firebase, @fingerprintjs/fingerprintjs
- [ ] Create environment variables template (`.env.example`)
- [ ] Set up Firebase configuration (`src/lib/firebase.ts`)
- [ ] Create TypeScript types (`src/types/index.ts`)
- [ ] Set up basic layout (`src/app/layout.tsx`)
- [ ] Create reusable UI components (Button, Input, Card, Modal, Toast)

## Phase 2: Database Layer

- [ ] Create Firestore helper for contests (`src/lib/db/contests.ts`)
- [ ] Create Firestore helper for categories (`src/lib/db/categories.ts`)
- [ ] Create Firestore helper for entries (`src/lib/db/entries.ts`)
- [ ] Create Firestore helper for votes (`src/lib/db/votes.ts`)
- [ ] Create Storage helper for image uploads (`src/lib/storage.ts`)
- [ ] Write Firestore security rules (`firestore.rules`)
- [ ] Write Storage security rules (`storage.rules`)

## Phase 3: Voter Identification

- [ ] Create fingerprint utility (`src/lib/fingerprint.ts`)
- [ ] Create Netlify function for IP (`netlify/functions/get-ip.ts`)
- [ ] Create `useVisitorId` hook (`src/hooks/useVisitorId.ts`)
- [ ] Test visitor ID generation

## Phase 4: Core Hooks

- [ ] Create `useActiveContest` hook
- [ ] Create `useCategories` hook
- [ ] Create `useEntries` hook
- [ ] Create `useVoting` hook (check existing votes, submit vote)
- [ ] Create `useAuth` hook for admin

## Phase 5: Public Pages

### Home Page (Gallery + Voting)
- [ ] Create `EntryCard` component
- [ ] Create `EntryGrid` component
- [ ] Create `EntryDetail` modal component
- [ ] Create `CategoryVote` component
- [ ] Create `VotingSection` component
- [ ] Assemble home page (`src/app/page.tsx`)
- [ ] Add loading states and error handling

### Submit Page
- [ ] Create `ImageUpload` component with preview
- [ ] Create `EntryForm` component with validation
- [ ] Create submit page (`src/app/submit/page.tsx`)
- [ ] Handle submission window (open/closed states)
- [ ] Add success/error feedback

### Results Pages
- [ ] Create `YearSelector` component
- [ ] Create `CategoryWinner` component
- [ ] Create `Leaderboard` component
- [ ] Create current results page (`src/app/results/page.tsx`)
- [ ] Create historical results page (`src/app/results/[year]/page.tsx`)
- [ ] Calculate and display vote counts

## Phase 6: Admin Panel

### Authentication
- [ ] Create `AuthContext` provider
- [ ] Create login page (`src/app/admin/login/page.tsx`)
- [ ] Create admin layout with auth guard (`src/app/admin/layout.tsx`)

### Dashboard
- [ ] Create admin dashboard (`src/app/admin/page.tsx`)
- [ ] Display stats (entry count, vote count, submission window status)

### Contest Management
- [ ] Create `ContestForm` component
- [ ] Create contests page (`src/app/admin/contests/page.tsx`)
- [ ] Implement create/edit/toggle active

### Category Management
- [ ] Create `CategoryForm` component
- [ ] Create `CategoryList` with reorder functionality
- [ ] Create categories page (`src/app/admin/categories/page.tsx`)
- [ ] Implement add/edit/delete/reorder

### Entry Moderation
- [ ] Create `EntryTable` component
- [ ] Create entries page (`src/app/admin/entries/page.tsx`)
- [ ] Implement view details and delete

## Phase 7: Polish

- [ ] Add toast notification system
- [ ] Implement skeleton loaders
- [ ] Add confirmation dialogs for destructive actions
- [ ] Responsive design review
- [ ] Accessibility audit (ARIA labels, keyboard nav)
- [ ] Error boundary implementation
- [ ] 404 page

## Phase 8: Deployment

- [ ] Create `netlify.toml` configuration
- [ ] Set environment variables in Netlify dashboard
- [ ] Deploy Firestore security rules
- [ ] Deploy Storage security rules
- [ ] Create Firestore indexes (or run app and follow Firebase prompts)
- [ ] Create admin user in Firebase Auth
- [ ] Test full flow in production

---

## Quick Commands

```bash
# Development
npm run dev

# Build
npm run build

# Deploy
netlify deploy --prod

# Firebase rules
firebase deploy --only firestore:rules
firebase deploy --only storage
```

---

## Notes

Add implementation notes and decisions here as you build:

- 
