// Main repository data interface
export interface GitHubRepoData {
    // Basic repo info
    name: string;
    nameWithOwner: string;
    description: string;
    url: string;
    
    // Stats
    stargazerCount: number;
    watcherCount: number;
    forkCount: number;
    openIssuesCount: number;
    openPullRequestsCount: number;
    
    // Branch & commits
    defaultBranchName: string;
    totalCommitCount: number;
    branchCount: number;
    releaseCount: number;
    
    // Languages & topics
    languages: RepositoryLanguage[];
    topics: string[];
    licenseName: string;
    primaryLanguage: string;
    
    // Repository status
    isPrivate: boolean;
    isFork: boolean;
    isArchived: boolean;
    isDisabled: boolean;
    
    // Dates
    createdAt: string; // ISO date string
    pushedAt: string;
    updatedAt: string;
    
    // Additional info
    diskUsage?: number; // KB
    owner: Owner;
    mentionableUsersCount: number;
    contributorCount: number;
    
    // Activity data - KEY cho contribution chart
    commitActivity: CommitActivityWeek[];
    contributors: ContributorStat[];
    codeFrequency: CodeFrequencyEntry[];
    participation: Participation;
    punchCard: PunchCardEntry[];
    recentEvents: RepositoryEvent[];
    
    // Derived data - QUAN TRỌNG cho contribution chart
    commitsPerDayLastYear: Record<string, number>; // {"2024-01-15": 5, "2024-01-16": 3, ...}
  }
  
  // Language info
  export interface RepositoryLanguage {
    name: string;
    size: number;
  }
  
  // Owner info
  export interface Owner {
    login: string;
    avatarUrl: string;
    url: string;
    type: string; // "User" | "Organization"
  }
  
  // Commit activity per week - CHÍNH cho contribution chart
  export interface CommitActivityWeek {
    week: number; // Unix timestamp (start of week)
    total: number; // Total commits in week
    days: number[]; // [Sun, Mon, Tue, Wed, Thu, Fri, Sat] - commits per day
  }
  
  // Contributor statistics
  export interface ContributorStat {
    author: {
      login: string;
      avatarUrl: string;
    };
    total: number;
    weeks: Array<{
      week: number; // Unix timestamp
      additions: number;
      deletions: number;
      commits: number;
    }>;
  }
  
  // Code frequency (additions/deletions per week)
  export interface CodeFrequencyEntry {
    week: number; // Unix timestamp
    additions: number;
    deletions: number;
  }
  
  // Participation data
  export interface Participation {
    all: number[]; // Weekly commit counts for all contributors (52 weeks)
    owner: number[]; // Weekly commit counts for owner (52 weeks)
  }
  
  // Punch card data (commits by hour and day)
  export interface PunchCardEntry {
    dayOfWeek: number; // 0-6 (Sunday-Saturday)
    hour: number; // 0-23
    commits: number;
  }
  
  // Recent repository events
  export interface RepositoryEvent {
    id: string;
    type: string; // "PushEvent", "PullRequestEvent", etc.
    actor: {
      login: string;
      avatarUrl: string;
    };
    createdAt: string;
    payload: any; // Event-specific data
  }
  
  // ===== INTERFACES ĐỂ XỬ LÝ CONTRIBUTION CHART =====
  
  // Interface để tạo contribution chart
  export interface ContributionDay {
    date: string; // "YYYY-MM-DD"
    count: number; // Số commits
    weekday: number; // 0-6 (Sunday-Saturday)
  }
  
  export interface ContributionWeek {
    days: ContributionDay[];
  }
  
  export interface ContributionData {
    totalContributions: number;
    weeks: ContributionWeek[];
    contributionCalendar: ContributionDay[];
  }
  
  // Helper functions để convert data
  export class ContributionHelper {
    /**
     * Convert CommitActivityWeek[] thành ContributionData cho chart
     */
    static convertToContributionData(commitActivity: CommitActivityWeek[]): ContributionData {
      const contributionDays: ContributionDay[] = [];
      let totalContributions = 0;

      commitActivity.forEach(week => {
        // Convert Unix timestamp to Date object
        const weekStart = new Date(week.week * 1000);
        
        // Ensure we're working with UTC dates to avoid timezone issues
        const utcWeekStart = new Date(Date.UTC(
          weekStart.getUTCFullYear(),
          weekStart.getUTCMonth(),
          weekStart.getUTCDate()
        ));
        
        week.days.forEach((commits, dayIndex) => {
          // Calculate the date for each day of the week
          const dayDate = new Date(utcWeekStart);
          dayDate.setUTCDate(utcWeekStart.getUTCDate() + dayIndex);
          
          // Format as YYYY-MM-DD
          const dateString = dayDate.toISOString().split('T')[0];
          
          contributionDays.push({
            date: dateString,
            count: commits,
            weekday: dayIndex
          });
          
          totalContributions += commits;
        });
      });

      // Sort by date to ensure chronological order
      contributionDays.sort((a, b) => a.date.localeCompare(b.date));

      // Group by weeks for display
      const weeks: ContributionWeek[] = [];
      for (let i = 0; i < contributionDays.length; i += 7) {
        weeks.push({
          days: contributionDays.slice(i, i + 7)
        });
      }

      return {
        totalContributions,
        weeks,
        contributionCalendar: contributionDays
      };
    }

    /**
     * Convert commitsPerDayLastYear thành ContributionData (alternative approach)
     */
    static convertDailyCommitsToContributionData(commitsPerDay: Record<string, number>): ContributionData {
      const contributionDays: ContributionDay[] = Object.entries(commitsPerDay)
        .map(([date, count]) => ({
          date,
          count,
          weekday: new Date(date).getDay()
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      const totalContributions = contributionDays.reduce((sum, day) => sum + day.count, 0);

      // Group by weeks
      const weeks: ContributionWeek[] = [];
      for (let i = 0; i < contributionDays.length; i += 7) {
        weeks.push({
          days: contributionDays.slice(i, i + 7)
        });
      }

      return {
        totalContributions,
        weeks,
        contributionCalendar: contributionDays
      };
    }

    /**
     * Create a proper contribution chart with correct month labels
     */
    static createContributionChartWithLabels(contributionData: ContributionData): {
      chartData: ContributionData;
      monthLabels: Array<{ month: string; weekIndex: number; hasData: boolean }>;
      startDate: Date;
      endDate: Date;
    } {
      if (!contributionData.contributionCalendar.length) {
        return {
          chartData: contributionData,
          monthLabels: [],
          startDate: new Date(),
          endDate: new Date()
        };
      }

      // Get the date range
      const dates = contributionData.contributionCalendar.map(day => new Date(day.date));
      const startDate = new Date(Math.min(...dates.map(d => d.getTime())));
      const endDate = new Date(Math.max(...dates.map(d => d.getTime())));

      // Create month labels based on actual data and week positions
      const monthLabels: Array<{ month: string; weekIndex: number; hasData: boolean }> = [];
      
      // Group days by weeks and check which weeks have data
      const weeksWithData = new Set<number>();
      contributionData.contributionCalendar.forEach((day, index) => {
        const weekIndex = Math.floor(index / 7);
        if (day.count > 0) {
          weeksWithData.add(weekIndex);
        }
      });

      // Create month labels for weeks that have data
      let currentMonth = '';
      let currentWeekIndex = 0;
      
      for (let weekIndex = 0; weekIndex < Math.ceil(contributionData.contributionCalendar.length / 7); weekIndex++) {
        const weekStartIndex = weekIndex * 7;
        const weekStartDate = new Date(contributionData.contributionCalendar[weekStartIndex].date);
        const monthName = weekStartDate.toLocaleDateString('en-US', { month: 'short' });
        
        // Only add month label if it's a new month and the week has data
        if (monthName !== currentMonth && weeksWithData.has(weekIndex)) {
          monthLabels.push({
            month: monthName,
            weekIndex: weekIndex,
            hasData: true
          });
          currentMonth = monthName;
        }
      }

      return {
        chartData: contributionData,
        monthLabels,
        startDate,
        endDate
      };
    }
  }