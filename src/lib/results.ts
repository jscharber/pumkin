import { getVotesForCategory, getVoteCountForEntry } from './db/votes';
import { Entry, Category, CategoryResult, LeaderboardEntry } from '@/types';

export async function calculateCategoryResults(
  contestId: string,
  category: Category,
  entries: Entry[]
): Promise<CategoryResult> {
  try {
    const votes = await getVotesForCategory(contestId, category.id);

    // Count votes per entry
    const voteCounts = new Map<string, number>();
    votes.forEach((vote) => {
      const count = voteCounts.get(vote.entryId) || 0;
      voteCounts.set(vote.entryId, count + 1);
    });

    // Find winner (entry with most votes)
    let winner: Entry | null = null;
    let maxVotes = 0;
    let runnerUp: { entry: Entry; voteCount: number } | undefined;

    entries.forEach((entry) => {
      const voteCount = voteCounts.get(entry.id) || 0;
      if (voteCount > maxVotes) {
        // Current winner becomes runner-up
        if (winner) {
          runnerUp = { entry: winner, voteCount: maxVotes };
        }
        winner = entry;
        maxVotes = voteCount;
      } else if (voteCount > 0 && (!runnerUp || voteCount > runnerUp.voteCount)) {
        runnerUp = { entry, voteCount };
      }
    });

    return {
      category,
      winner,
      voteCount: maxVotes,
      runnerUp,
    };
  } catch (error) {
    console.error('Error calculating category results:', error);
    return {
      category,
      winner: null,
      voteCount: 0,
    };
  }
}

export async function calculateLeaderboard(
  contestId: string,
  categories: Category[],
  entries: Entry[]
): Promise<LeaderboardEntry[]> {
  try {
    // Calculate total votes and category wins for each entry
    const leaderboardMap = new Map<string, LeaderboardEntry>();

    // Initialize all entries
    entries.forEach((entry) => {
      leaderboardMap.set(entry.id, {
        entry,
        totalVotes: 0,
        categoryWins: [],
      });
    });

    // Calculate results for each category
    for (const category of categories) {
      const result = await calculateCategoryResults(contestId, category, entries);

      const votes = await getVotesForCategory(contestId, category.id);

      // Count votes per entry in this category
      const voteCounts = new Map<string, number>();
      votes.forEach((vote) => {
        const count = voteCounts.get(vote.entryId) || 0;
        voteCounts.set(vote.entryId, count + 1);
      });

      // Add votes to total
      voteCounts.forEach((count, entryId) => {
        const leaderboardEntry = leaderboardMap.get(entryId);
        if (leaderboardEntry) {
          leaderboardEntry.totalVotes += count;
        }
      });

      // Track category wins
      if (result.winner) {
        const leaderboardEntry = leaderboardMap.get(result.winner.id);
        if (leaderboardEntry) {
          leaderboardEntry.categoryWins.push(category.name);
        }
      }
    }

    // Convert to array and sort by total votes
    const leaderboard = Array.from(leaderboardMap.values());
    leaderboard.sort((a, b) => {
      // Sort by total votes (descending)
      if (b.totalVotes !== a.totalVotes) {
        return b.totalVotes - a.totalVotes;
      }
      // Then by number of wins (descending)
      return b.categoryWins.length - a.categoryWins.length;
    });

    return leaderboard;
  } catch (error) {
    console.error('Error calculating leaderboard:', error);
    return [];
  }
}
