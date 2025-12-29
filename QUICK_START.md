# Quick Start Guide - Firebase Already Created

You've already created your Firebase project. Here's what to do next:

## Step 1: Enable Authentication (Email/Password)

1. Go to https://console.firebase.google.com
2. Select your project
3. Click **"Authentication"** in the left sidebar
4. Click **"Get started"** button
5. Click on the **"Sign-in method"** tab at the top
6. Find **"Email/Password"** in the list and click on it
7. Toggle **"Enable"** to ON
8. Click **"Save"**

## Step 2: Create an Admin User

1. Still in Authentication, click the **"Users"** tab
2. Click **"Add user"** button
3. Enter:
   - **Email:** `admin@yourcontest.com` (or your preferred email)
   - **Password:** Create a strong password
4. Click **"Add user"**
5. **Important:** Save this email - you'll need it later

## Step 3: Enable Firestore Database

1. Click **"Firestore Database"** in the left sidebar
2. Click **"Create database"**
3. Choose **"Start in production mode"**
4. Select a location (choose closest to your users, e.g., `us-central1`)
5. Click **"Enable"**

## Step 4: Enable Storage

1. Click **"Storage"** in the left sidebar
2. Click **"Get started"**
3. Click **"Next"** (we'll update rules later)
4. Use the **same location** as your Firestore database
5. Click **"Done"**

## Step 5: Get Your Firebase Config

1. Click the **gear icon ⚙️** next to "Project Overview"
2. Click **"Project settings"**
3. Scroll down to **"Your apps"** section
4. If you don't see a web app:
   - Click the **`</>`** (web) icon
   - App nickname: `Pumpkin Contest`
   - Don't check Firebase Hosting
   - Click **"Register app"**
5. You'll see the `firebaseConfig` object - keep this page open!

## Step 6: Create Your .env.local File

In your project folder, create a file named `.env.local`:

```bash
# Copy values from your Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Use the admin email you created in Step 2
NEXT_PUBLIC_ADMIN_EMAIL=admin@yourcontest.com
```

## Step 7: Install Dependencies & Setup Firebase Tools

```bash
# Install new dependencies
npm install

# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init
```

When `firebase init` prompts you:
- **Which Firebase features?** Select: `Firestore`, `Storage` (use space to select, enter to confirm)
- **Use an existing project?** Yes
- **Select your project** from the list
- **Firestore rules file:** Press Enter (use `firestore.rules`)
- **Firestore indexes file:** Press Enter (use `firestore.indexes.json`)
- **Storage rules file:** Press Enter (use `storage.rules`)

## Step 8: Deploy Security Rules

```bash
firebase deploy --only firestore:rules,storage
```

You should see:
```
✔  Deploy complete!
```

## Step 9: Create Test Data

Run the setup script to create a contest and categories:

```bash
npm run setup-firebase
```

You should see:
```
🎃 Setting up Pumpkin Contest test data...
✅ Created contest: 2024 Pumpkin Carving Contest
✅ Fun
✅ Best Craft
... (more categories)
🎉 Test data setup complete!
```

## Step 10: Start the App!

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

You should see:
- **2024 Pumpkin Carving Contest** header
- **Submit Your Entry** button
- Gallery section (empty initially)
- Voting section with 6 categories

## Test the App

1. **Submit an Entry:**
   - Click "Submit Your Entry"
   - Fill out the form
   - Upload a pumpkin image
   - Submit

2. **View Gallery:**
   - Go back to home page
   - See your entry in the gallery
   - Click on it to view full details

3. **Vote:**
   - Scroll down to the voting section
   - Select your entry in each category
   - Click "Submit Vote"
   - See the confirmation checkmark

## Troubleshooting

### "Firebase: Error (auth/invalid-api-key)"
- Check that `.env.local` has the correct API key
- Restart dev server: Stop and run `npm run dev` again

### "No Active Contest"
- Run `npm run setup-firebase` to create test data
- Check Firestore in Firebase Console - you should see a `contests` collection

### "Permission denied"
- Make sure you deployed the rules: `firebase deploy --only firestore:rules,storage`
- Check Firebase Console > Firestore Database > Rules tab

### Can't submit images
- Make sure Storage is enabled in Firebase Console
- Deploy storage rules: `firebase deploy --only storage`

## What You've Configured

✅ Firebase Authentication (Email/Password)
✅ Firestore Database with security rules
✅ Firebase Storage with security rules
✅ Admin user account
✅ Test contest and categories
✅ Development environment

## Next Steps

- Submit multiple test entries
- Test voting functionality
- Invite others to test
- Build the admin panel for managing contests
- Deploy to Netlify for production

Enjoy your pumpkin carving contest! 🎃
