# Firebase Configuration Checklist

Quick checklist for configuring Firebase. Check off each item as you complete it.

## In Firebase Console (https://console.firebase.google.com)

### Authentication Setup
- [ ] Go to Authentication
- [ ] Click "Get started"
- [ ] Click "Sign-in method" tab
- [ ] Enable "Email/Password"
- [ ] Click "Users" tab
- [ ] Add admin user (email + password)
- [ ] Save the admin email address

### Firestore Database
- [ ] Go to Firestore Database
- [ ] Click "Create database"
- [ ] Select "Start in production mode"
- [ ] Choose location (e.g., us-central1)
- [ ] Click "Enable"

### Storage
- [ ] Go to Storage
- [ ] Click "Get started"
- [ ] Click "Next" (default rules)
- [ ] Use same location as Firestore
- [ ] Click "Done"

### Get Config
- [ ] Click gear icon ⚙️ > Project settings
- [ ] Scroll to "Your apps"
- [ ] Click web icon `</>` if no app exists
- [ ] Copy firebaseConfig values

## In Your Project

### Environment Setup
- [ ] Create `.env.local` file in project root
- [ ] Add all NEXT_PUBLIC_FIREBASE_* values from config
- [ ] Add NEXT_PUBLIC_ADMIN_EMAIL (from admin user)
- [ ] Verify no syntax errors in .env.local

### Dependencies
- [ ] Run `npm install`
- [ ] Install Firebase CLI: `npm install -g firebase-tools`

### Firebase CLI Setup
- [ ] Run `firebase login`
- [ ] Run `firebase init`
- [ ] Select: Firestore and Storage
- [ ] Choose existing project
- [ ] Accept default file names (press Enter)

### Deploy Rules
- [ ] Run `firebase deploy --only firestore:rules,storage`
- [ ] Verify "Deploy complete!" message

### Create Test Data
- [ ] Run `npm run setup-firebase`
- [ ] Verify success message with contest and categories

### Start & Test
- [ ] Run `npm run dev`
- [ ] Open http://localhost:3001
- [ ] Verify contest appears
- [ ] Submit a test entry
- [ ] Try voting

## Firebase Config Template

Your `.env.local` should look like this:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_ADMIN_EMAIL=admin@yourcontest.com
```

## Quick Commands Reference

```bash
# Install dependencies
npm install

# Setup test data
npm run setup-firebase

# Start dev server
npm run dev

# Deploy Firebase rules
firebase deploy --only firestore:rules,storage

# Build for production
npm run build
```

## Verification Steps

✅ Firebase Console shows:
  - Authentication > Email/Password enabled
  - Authentication > Users tab has admin user
  - Firestore Database exists
  - Storage exists

✅ Local project has:
  - `.env.local` file with all variables
  - `node_modules/` folder (after npm install)
  - Firebase CLI installed globally

✅ App works:
  - Home page shows contest name
  - Can submit entries
  - Can vote
  - No console errors

## Need Help?

See `QUICK_START.md` for detailed instructions.
See `FIREBASE_SETUP.md` for comprehensive setup guide.
