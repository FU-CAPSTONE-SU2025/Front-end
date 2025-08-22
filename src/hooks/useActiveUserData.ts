import { useMutation } from '@tanstack/react-query';
import { GetActiveUser } from '../api/Account/UserAPI';
import { ActiveAccountProps, ActiveCategoriesProp } from '../interfaces/IAccount';

const roleMap: Record<string, keyof ActiveCategoriesProp> = {
  "Admin": 'admin',
  "Academic Staff": 'staff',
  "Advisor": 'advisor',
  "Manager": 'manager',
  "Student": 'student',
};

// Chart data interface
export interface ChartDataPoint {
  role: string;
  count: number;
  color: string;
}

export default function useActiveUserData() {
  const categorizeUsers = (users: ActiveAccountProps[]): ActiveCategoriesProp => {
    const categorized: ActiveCategoriesProp = {
      admin: [],
      staff: [],
      advisor: [],
      manager: [],
      student: [],
    };
    users.forEach((user) => {
      const roleKey = roleMap[user.roleName];
      if (roleKey) {
        categorized[roleKey].push(user);
      }
    });
    return categorized;
  };

  // Generate chart data from categorized user data
  const generateChartData = (categorizedData: ActiveCategoriesProp | null): ChartDataPoint[] => {
    if (!categorizedData) {
      return [];
    }

    const chartData: ChartDataPoint[] = [];

    // Add Admin data
    chartData.push({
      role: 'Admin',
      count: categorizedData.admin.length,
      color: '#FF6384', // Pink for Admin
    });

    // Add Staff data
    chartData.push({
      role: 'Academic Staff',
      count: categorizedData.staff.length,
      color: '#a21caf', // Purple for Staff (matching original)
    });

    // Add Advisor data
    chartData.push({
      role: 'Advisor',
      count: categorizedData.advisor.length,
      color: '#2563eb', // Blue for Advisor (matching original)
    });

    // Add Manager data
    chartData.push({
      role: 'Manager',
      count: categorizedData.manager.length,
      color: '#22c55e', // Green for Manager (matching original)
    });

    // Add Student data
    chartData.push({
      role: 'Student',
      count: categorizedData.student.length,
      color: '#f59e42', // Orange for Student (matching original)
    });

    return chartData;
  };

  const mutation = useMutation<ActiveAccountProps[], unknown, void>({
    mutationFn: async () => {
      const data = await GetActiveUser();
      // If your API returns a single user, wrap in array
      if (!data) return [];
      return Array.isArray(data) ? data : [data];
    },
    onError: (error) => {
      // Handle error if needed
       console.error(error);
    },
  });

  const categorizedData = mutation.data ? categorizeUsers(mutation.data) : null;
  const chartData = generateChartData(categorizedData);

  return {
    ...mutation,
    categorizedData,
    chartData,
    refetch: mutation.mutate, // Call this to fetch data
  };
}