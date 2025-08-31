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
      // Luôn luôn tạo khung cố định từ tháng 1 đến tháng 12 của năm hiện tại
      const currentYear = new Date().getFullYear();
      
      // Tạo map của data từ backend
      const contributionMap = new Map<string, number>();
      commitActivity.forEach(week => {
        const weekStart = new Date(week.week * 1000);
        week.days.forEach((commits, dayIndex) => {
          const dayDate = new Date(weekStart);
          dayDate.setDate(weekStart.getDate() + dayIndex);
          const dateString = dayDate.toISOString().split('T')[0];
          contributionMap.set(dateString, commits);
        });
      });

      // Tạo lịch cho cả năm từ 1/1 đến 31/12
      const contributionDays: ContributionDay[] = [];
      let totalContributions = 0;
      
      // Bắt đầu từ Chủ nhật đầu tiên của năm (có thể là năm trước)
      const yearStart = new Date(currentYear, 0, 1);
      const firstSunday = new Date(yearStart);
      firstSunday.setDate(yearStart.getDate() - yearStart.getDay());
      
      // Kết thúc ở Thủ bảy cuối cùng của năm (có thể là năm sau)
      const yearEnd = new Date(currentYear, 11, 31);
      const lastSaturday = new Date(yearEnd);
      lastSaturday.setDate(yearEnd.getDate() + (6 - yearEnd.getDay()));
      
      // Tạo calendar theo thứ tự GitHub: mỗi cột = 1 tuần, mỗi hàng = 1 ngày trong tuần
      const currentDate = new Date(firstSunday);
      while (currentDate <= lastSaturday) {
        const dateString = currentDate.toISOString().split('T')[0];
        const count = contributionMap.get(dateString) || 0;
        
        contributionDays.push({
          date: dateString,
          count: count,
          weekday: currentDate.getDay()
        });
        
        totalContributions += count;
        currentDate.setDate(currentDate.getDate() + 1);
      }

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
     * Convert commitsPerDayLastYear thành ContributionData
     */
    static convertDailyCommitsToContributionData(commitsPerDay: Record<string, number>): ContributionData {
      // Luôn luôn tạo khung cố định từ tháng 1 đến tháng 12 của năm hiện tại
      const currentYear = new Date().getFullYear();
      
      // Tạo map của data từ backend
      const contributionMap = new Map<string, number>();
      Object.entries(commitsPerDay).forEach(([date, count]) => {
        contributionMap.set(date, count);
      });

      // Tạo lịch cho cả năm từ 1/1 đến 31/12
      const contributionDays: ContributionDay[] = [];
      let totalContributions = 0;
      
      // Bắt đầu từ Chủ nhật đầu tiên của năm
      const yearStart = new Date(currentYear, 0, 1);
      const firstSunday = new Date(yearStart);
      firstSunday.setDate(yearStart.getDate() - yearStart.getDay());
      
      // Kết thúc ở Thủ bảy cuối cùng của năm
      const yearEnd = new Date(currentYear, 11, 31);
      const lastSaturday = new Date(yearEnd);
      lastSaturday.setDate(yearEnd.getDate() + (6 - yearEnd.getDay()));
      
      // Tạo calendar theo thứ tự GitHub: mỗi cột = 1 tuần, mỗi hàng = 1 ngày trong tuần
      const currentDate = new Date(firstSunday);
      while (currentDate <= lastSaturday) {
        const dateString = currentDate.toISOString().split('T')[0];
        const count = contributionMap.get(dateString) || 0;
        
        contributionDays.push({
          date: dateString,
          count: count,
          weekday: currentDate.getDay()
        });
        
        totalContributions += count;
        currentDate.setDate(currentDate.getDate() + 1);
      }

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
     * Tạo month labels cố định từ tháng 1 đến tháng 12
     */
    static createContributionChartWithLabels(contributionData: ContributionData): {
      chartData: ContributionData;
      monthLabels: Array<{ month: string; weekIndex: number; hasData: boolean }>;
      startDate: Date;
      endDate: Date;
    } {
      const currentYear = new Date().getFullYear();
      const startDate = new Date(currentYear, 0, 1);
      const endDate = new Date(currentYear, 11, 31);
      
      // Tạo month labels cố định
      const monthLabels: Array<{ month: string; weekIndex: number; hasData: boolean }> = [
        { month: 'Jan', weekIndex: 0, hasData: true },
        { month: 'Feb', weekIndex: 4, hasData: true },
        { month: 'Mar', weekIndex: 8, hasData: true },
        { month: 'Apr', weekIndex: 13, hasData: true },
        { month: 'May', weekIndex: 17, hasData: true },
        { month: 'Jun', weekIndex: 22, hasData: true },
        { month: 'Jul', weekIndex: 26, hasData: true },
        { month: 'Aug', weekIndex: 31, hasData: true },
        { month: 'Sep', weekIndex: 35, hasData: true },
        { month: 'Oct', weekIndex: 39, hasData: true },
        { month: 'Nov', weekIndex: 44, hasData: true },
        { month: 'Dec', weekIndex: 48, hasData: true }
      ];

      return {
        chartData: contributionData,
        monthLabels,
        startDate,
        endDate
      };
    }

    /**
     * Generate contribution calendar với month labels cố định
     */
    static generateContributionCalendar(contributionData: ContributionData): {
      calendar: ContributionDay[];
      monthLabels: Array<{ month: string; weekIndex: number; hasData: boolean }>;
      startDate: Date;
      endDate: Date;
    } {
      const currentYear = new Date().getFullYear();
      const startDate = new Date(currentYear, 0, 1);
      const endDate = new Date(currentYear, 11, 31);
      
      // Tạo month labels cố định cho 12 tháng
      const monthLabels: Array<{ month: string; weekIndex: number; hasData: boolean }> = [
        { month: 'Jan', weekIndex: 0, hasData: true },
        { month: 'Feb', weekIndex: 4, hasData: true },
        { month: 'Mar', weekIndex: 8, hasData: true },
        { month: 'Apr', weekIndex: 13, hasData: true },
        { month: 'May', weekIndex: 17, hasData: true },
        { month: 'Jun', weekIndex: 22, hasData: true },
        { month: 'Jul', weekIndex: 26, hasData: true },
        { month: 'Aug', weekIndex: 31, hasData: true },
        { month: 'Sep', weekIndex: 35, hasData: true },
        { month: 'Oct', weekIndex: 39, hasData: true },
        { month: 'Nov', weekIndex: 44, hasData: true },
        { month: 'Dec', weekIndex: 48, hasData: true }
      ];

      return {
        calendar: contributionData.contributionCalendar,
        monthLabels,
        startDate,
        endDate
      };
    }
  }