# Firebase Setup Guide

This guide will walk you through setting up Firebase for the Pumpkin Carving Contest app.

## Step 1: Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click "Add project"
3. Enter project name (e.g., "pumpkin-contest")
4. Disable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In the Firebase Console, click "Authentication" in the left sidebar
2. Click "Get started"
3. Click on the "Sign-in method" tab
4. Enable "Email/Password":
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

## Step 3: Create Admin User

1. Still in Authentication, click the "Users" tab
2. Click "Add user"
3. Enter email: `admin@yourcontest.com` (or your preferred admin email)
4. Enter a secure password
5. Click "Add user"
6. **IMPORTANT:** Copy this email - you'll need it for `.env.local`

## Step 4: Enable Firestore Database

1. Click "Firestore Database" in the left sidebar
2. Click "Create database"
3. Select "Start in production mode" (we'll add security rules next)
4. Choose a location closest to your users
5. Click "Enable"

## Step 5: Enable Storage

1. Click "Storage" in the left sidebar
2. Click "Get started"
3. Click "Next" (use default security rules)
4. Choose the same location as Firestore
5. Click "Done"

## Step 6: Get Firebase Configuration

1. Click the gear icon (⚙️) next to "Project Overview"
2. Click "Project settings"
3. Scroll down to "Your apps"
4. Click the web icon `</>`
5. Register your app:
   - App nickname: "Pumpkin Contest Web"
   - Don't check "Firebase Hosting"
   - Click "Register app"
6. Copy the firebaseConfig object values

## Step 7: Create .env.local File

Create a file called `.env.local` in the project root with:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Admin Configuration
NEXT_PUBLIC_ADMIN_EMAIL=admin@yourcontest.com
```

Replace the values with your actual Firebase config values.

## Step 8: Deploy Security Rules

Install Firebase CLI if you haven't:
```bash
npm install -g firebase-tools
```

Login to Firebase:
```bash
firebase login
```

Initialize Firebase in your project:
```bash
firebase init
```

When prompted:
- Select: **Firestore** and **Storage** (use spacebar to select, enter to confirm)
- Use existing project: Select your project
- Firestore rules file: Press enter (use default: `firestore.rules`)
- Firestore indexes file: Press enter (use default: `firestore.indexes.json`)
- Storage rules file: Press enter (use default: `storage.rules`)

Deploy the rules:
```bash
firebase deploy --only firestore:rules,storage
```

## Step 9: Create Initial Contest Data

You have two options:

### Option A: Using Firebase Console (Manual)

1. Go to Firestore Database in Firebase Console
2. Click "Start collection"
3. Collection ID: `contests`
4. Add a document with ID: `2024`
5. Add fields:
   ```
   year: 2024 (number)
   name: "2024 Pumpkin Carving Contest" (string)
   isActive: true (boolean)
   submissionStart: (timestamp) - set to a past date
   submissionEnd: (timestamp) - set to a future date
   createdAt: (timestamp) - click "Insert timestamp"
   updatedAt: (timestamp) - click "Insert timestamp"
   ```

6. Create another collection: `categories`
7. Click "Auto-ID" for document ID
8. Add fields:
   ```
   contestId: "2024" (string)
   name: "Best Craft" (string)
   description: "Awarded for exceptional carving technique" (string)
   order: 0 (number)
   createdAt: (timestamp) - click "Insert timestamp"
   updatedAt: (timestamp) - click "Insert timestamp"
   ```

### Option B: Using the Setup Script (Recommended)

I'll create a setup script for you in the next step.

## Step 10: Verify Setup

1. Start your dev server: `npm run dev`
2. Open http://localhost:3001
3. You should see the active contest
4. Try submitting an entry (if submission window is open)
5. Try voting for entries

## Troubleshooting

### "No Active Contest" Error
- Check that you have a contest with `isActive: true` in Firestore
- Verify your Firebase config in `.env.local`
- Restart your dev server after changing `.env.local`

### Authentication Errors
- Verify Email/Password authentication is enabled in Firebase Console
- Check that `NEXT_PUBLIC_ADMIN_EMAIL` matches an actual user in Firebase Auth

### Permission Denied Errors
- Verify security rules are deployed: `firebase deploy --only firestore:rules,storage`
- Check the Firebase Console > Firestore > Rules tab

### Storage Upload Errors
- Verify Storage is enabled in Firebase Console
- Check storage rules are deployed
- Ensure images are under 10MB and are JPG/PNG/WebP format

## Next Steps

Once Firebase is configured, you can:
- Submit test entries
- Vote on entries
- View the gallery
- Build the admin panel to manage contests and categories through the UI

## Security Notes

- Never commit `.env.local` to git (it's already in `.gitignore`)
- Keep your Firebase credentials secure
- The security rules allow public reading but require authentication for admin actions
- Consider adding rate limiting in production
