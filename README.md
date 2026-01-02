# Pumpkin Carving Contest

A web application for running annual pumpkin carving contests with multi-category voting, entry submissions, and historical results.

## Tech Stack

- **Frontend:** Next.js 14+ (App Router)
- **Hosting:** Netlify
- **Database:** Firebase Firestore
- **Storage:** Firebase Storage (images)
- **Auth:** Firebase Auth (admin only)
- **Styling:** Tailwind CSS

## Project Status

**Phase 1 Complete:** Project setup, database layer, and core utilities
- ✅ Next.js with TypeScript and Tailwind CSS configured
- ✅ Firebase configuration and helpers
- ✅ TypeScript types defined
- ✅ Firestore database helpers (contests, categories, entries, votes)
- ✅ Firebase Storage helper for image uploads
- ✅ Voter fingerprinting system
- ✅ Custom React hooks
- ✅ Reusable UI components
- ✅ Firebase security rules

**Next Steps:** Build out public pages (gallery, voting, submission, results)

## Getting Started

### Prerequisites

- Node.js 20+
- Firebase project
- Netlify account (for deployment)

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd pumkin
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Create a new Firebase project at https://console.firebase.google.com
   - Enable Firestore Database
   - Enable Storage
   - Enable Authentication (Email/Password)
   - Copy your Firebase configuration

4. Create environment file:
```bash
cp .env.example .env.local
```

5. Fill in your Firebase credentials in `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_ADMIN_EMAIL=admin@example.com
```

6. Deploy Firebase security rules:
```bash
# Install Firebase CLI if you haven't
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init

# Deploy rules
firebase deploy --only firestore:rules
firebase deploy --only storage
```

7. Create an admin user in Firebase Console:
   - Go to Authentication > Users
   - Add a new user with the email matching `NEXT_PUBLIC_ADMIN_EMAIL`

### Development

```bash
npm run dev
```

Open http://localhost:3001 in your browser.

### Build

```bash
npm run build
```

### Deployment

Deploy to Netlify:

1. Connect your repository to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy:
```bash
netlify deploy --prod
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home - gallery + voting
│   ├── submit/            # Entry submission
│   ├── results/           # Current + historical results
│   └── admin/             # Protected admin routes
├── components/            # Reusable React components
│   ├── ui/               # Generic UI components
│   ├── layout/           # Layout components
│   ├── entries/          # Entry-related components
│   ├── voting/           # Voting components
│   └── admin/            # Admin panel components
├── lib/
│   ├── firebase.ts       # Firebase initialization
│   ├── db/               # Firestore helpers
│   ├── storage.ts        # Image upload helpers
│   └── fingerprint.ts    # Voter identification
├── hooks/                 # Custom React hooks
├── context/               # React context providers
└── types/                 # TypeScript interfaces
```

## Features

### Planned Features

- **Entry Submission:** Users can submit pumpkin photos with title, name, and description
- **Gallery:** View all entries in a responsive grid
- **Voting:** Vote for entries across multiple categories
- **Results:** View current and historical contest results
- **Admin Panel:** Manage contests, categories, and entries

### Voter Identification

Uses a three-layer approach to identify unique voters without user accounts:
1. Browser fingerprint (FingerprintJS)
2. Persistent cookie/localStorage
3. IP address (via Netlify function)

## Documentation

- `REQUIREMENTS.md` - Feature specifications
- `DATA_MODEL.md` - Firestore schema
- `ARCHITECTURE.md` - System design
- `TASKS.md` - Implementation checklist
- `CLAUDE.md` - Coding standards

## License

Private project - All rights reserved
