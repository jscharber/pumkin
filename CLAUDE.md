# Pumpkin Carving Contest App

## Project Overview
A web application for running annual pumpkin carving contests with multi-category voting, entry submissions, and historical results.

## Tech Stack
- **Frontend:** Next.js 14+ (App Router)
- **Hosting:** Netlify
- **Database:** Firebase Firestore
- **Storage:** Firebase Storage (images)
- **Auth:** Firebase Auth (admin only)
- **Styling:** Tailwind CSS

## Key Documentation
- `docs/REQUIREMENTS.md` - Feature specifications
- `docs/DATA_MODEL.md` - Firestore schema
- `docs/ARCHITECTURE.md` - System design

## Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home - gallery + voting
│   ├── submit/            # Entry submission
│   ├── results/           # Current + historical results
│   │   └── [year]/
│   └── admin/             # Protected admin routes
│       ├── categories/
│       └── contests/
├── components/            # Reusable React components
│   ├── ui/               # Generic UI (buttons, forms, etc.)
│   ├── entries/          # Entry-related components
│   ├── voting/           # Voting components
│   └── admin/            # Admin panel components
├── lib/
│   ├── firebase.ts       # Firebase initialization
│   ├── db.ts             # Firestore helpers
│   ├── storage.ts        # Image upload helpers
│   └── fingerprint.ts    # Voter identification
├── hooks/                 # Custom React hooks
└── types/                 # TypeScript interfaces
```

## Coding Standards

### General
- Use TypeScript with strict mode
- Prefer functional components with hooks
- Use async/await over .then() chains
- Handle errors gracefully with user-friendly messages

### Naming Conventions
- Components: PascalCase (`EntryCard.tsx`)
- Hooks: camelCase with `use` prefix (`useContest.ts`)
- Utilities: camelCase (`formatDate.ts`)
- Types/Interfaces: PascalCase with descriptive names (`ContestEntry`, `VoteRecord`)

### Firebase
- Never expose Firebase config in client code without environment variables
- Use Firebase security rules (provide in `firestore.rules`)
- Batch writes when updating multiple documents
- Use server timestamps for `createdAt` fields

### Components
- Keep components focused and single-purpose
- Extract logic into custom hooks when reused
- Use loading and error states consistently
- Implement optimistic UI updates where appropriate

### Forms
- Validate on client before submission
- Show inline validation errors
- Disable submit button while processing
- Show success/error feedback after submission

## Environment Variables
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## Commands
- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run lint` - Run ESLint
- `netlify deploy --prod` - Deploy to production

## Implementation Order
1. Firebase setup and configuration
2. Data model and Firestore helpers
3. Basic page routing structure
4. Entry submission flow
5. Gallery display
6. Voting system with fingerprinting
7. Results pages (current + historical)
8. Admin panel and authentication
9. Polish and error handling
- create git branches that match the feature being implmented, create the branch before changes start, commit the branch before moving on to the next feature