import { Timestamp } from 'firebase/firestore';

export interface Contest {
  id: string;
  year: number;
  name: string;
  submissionStart: Timestamp;
  submissionEnd: Timestamp;
  votingStart?: Timestamp;
  votingEnd?: Timestamp;
  timeZone?: string; // IANA zone (e.g. "America/Chicago") the dates are entered and displayed in
  headerImageUrl?: string | null; // Home page header picture
  headerImagePath?: string | null; // Storage path for deletion
  introMessage?: string;
  instructionsAndRules?: string;
  contactInfo?: string;
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
  isInspiration?: boolean; // True for past year inspiration images
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

// Result types for displaying winners
export interface CategoryResult {
  category: Category;
  winner: Entry | null;
  voteCount: number;
  runnerUp?: {
    entry: Entry;
    voteCount: number;
  };
}

export interface LeaderboardEntry {
  entry: Entry;
  totalVotes: number;
  categoryWins: string[]; // Category names where this entry won
}
