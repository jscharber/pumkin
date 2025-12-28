# Feature Requirements

## 1. Contest Management

### 1.1 Contest Entity
Each contest represents one year's competition.

**Fields:**
- Year (e.g., 2024)
- Name (e.g., "2024 Pumpkin Carving Contest")
- Submission window start datetime
- Submission window end datetime
- Active flag (boolean)

**Business Rules:**
- Only one contest can be active at a time
- Submission window controls when entries are accepted
- Past contests remain viewable for historical results

### 1.2 Admin Contest Management
- Create new contest for upcoming year
- Edit submission window dates
- Set/unset active flag
- Cannot delete contests with entries (archive only)

---

## 2. Categories

### 2.1 Category Entity
Categories are voting criteria within a contest.

**Fields:**
- Name (e.g., "Best Craft")
- Description (optional explanatory text)
- Display order (integer for sorting)
- Contest ID (foreign key)

**Example Categories:**
- Fun
- Best Craft
- Carved Under the Influence
- Scariest
- Most Creative
- People's Choice

### 2.2 Admin Category Management
- Add new category to active contest
- Edit category name/description
- Reorder categories (drag-drop or up/down arrows)
- Delete category (warn if votes exist)
- Categories are contest-specific (can vary year to year)

---

## 3. Entry Submission

### 3.1 Entry Entity
**Fields:**
- Entrant name
- Pumpkin title
- Description (optional)
- Image URL (stored in Firebase Storage)
- Contest ID (foreign key)
- Created timestamp

### 3.2 Submission Flow
1. User navigates to `/submit`
2. System checks if current time is within submission window
   - If closed: display message with dates ("Submissions open Oct 1-15")
   - If open: display submission form
3. User fills form: name, title, description, uploads photo
4. Client-side validation:
   - Name required, max 100 chars
   - Title required, max 100 chars
   - Description optional, max 500 chars
   - Image required, max 10MB, jpg/png/webp only
5. On submit:
   - Upload image to Firebase Storage
   - Create entry document in Firestore
   - Show success message
   - Redirect to gallery

### 3.3 Image Handling
- Accept jpg, png, webp formats
- Max file size: 10MB
- Resize/compress on client before upload (max 1920px wide)
- Generate unique filename with timestamp
- Store in `entries/{contestId}/{filename}`

---

## 4. Gallery

### 4.1 Gallery Display
- Show all entries for current active contest
- Grid layout, responsive (1-4 columns based on viewport)
- Each entry card shows:
  - Pumpkin image (thumbnail)
  - Title
  - Entrant name
- Click card to view full-size image + description

### 4.2 Gallery Features
- Sort by: newest first (default), random
- Optional: search/filter by entrant name

---

## 5. Voting

### 5.1 Voting Rules
- Each voter can vote once per category
- Voter selects one entry as winner for each category
- Votes are final (no changing after cast)
- Voting available anytime (no separate voting window in v1)

### 5.2 Voter Identification
Combine multiple signals to create unique voter ID (no user accounts):

```
visitorId = hash(fingerprintId + ipAddress + cookieId)
```

**Components:**
1. **Browser Fingerprint** (primary) - Use FingerprintJS library
2. **IP Address** - From request headers via Netlify function
3. **Cookie** - Random UUID stored in localStorage + cookie

### 5.3 Voting Flow
1. User views gallery at `/`
2. Below gallery, voting section shows each category
3. For each category:
   - Display category name + description
   - Dropdown or card selection to pick winning entry
   - "Vote" button per category OR single "Submit All Votes" button
4. Before recording vote:
   - Generate/retrieve visitor ID
   - Check Firestore for existing vote in this category
   - If exists: show "Already voted" message
   - If not: record vote
5. Show confirmation after successful vote

### 5.4 Vote Entity
**Fields:**
- Contest ID
- Category ID
- Entry ID (the voted-for entry)
- Voter ID (fingerprint hash)
- Created timestamp

---

## 6. Results

### 6.1 Results Display
- Year selector dropdown at top
- Defaults to current/most recent contest

**Per Category:**
- Category name
- Winner: entry image, title, entrant name
- Vote count for winner
- Optional: show runner-up

**Overall Leaderboard:**
- Entries ranked by total votes across all categories
- Show top 5-10 entries
- Display: rank, image, title, entrant name, total votes

### 6.2 Historical Results
- Route: `/results/[year]`
- Same display as current results
- Year dropdown to navigate between years

---

## 7. Admin Panel

### 7.1 Authentication
- Single admin account (email/password via Firebase Auth)
- Protected routes redirect to login if unauthenticated
- Session persists until explicit logout

### 7.2 Admin Dashboard (`/admin`)
- Quick stats: total entries, total votes, days until submission closes
- Links to management pages

### 7.3 Contest Management (`/admin/contests`)
- List all contests
- Create new contest form
- Edit existing contest
- Toggle active status

### 7.4 Category Management (`/admin/categories`)
- Select contest to manage
- List categories with reorder handles
- Inline edit or modal for add/edit
- Delete with confirmation

### 7.5 Entry Moderation (`/admin/entries`)
- List all entries for selected contest
- View entry details
- Delete inappropriate entries (with confirmation)

---

## 8. UI/UX Requirements

### 8.1 General
- Mobile-first responsive design
- Halloween/autumn theme (optional)
- Fast loading (lazy load images)
- Accessible (proper ARIA labels, keyboard navigation)

### 8.2 Loading States
- Skeleton loaders for gallery grid
- Spinner for form submissions
- Disabled buttons during async operations

### 8.3 Error Handling
- User-friendly error messages (not technical jargon)
- Retry options where appropriate
- Form validation errors inline below fields

### 8.4 Feedback
- Toast notifications for success/error actions
- Confirmation dialogs for destructive actions
- Progress indicator for image uploads
