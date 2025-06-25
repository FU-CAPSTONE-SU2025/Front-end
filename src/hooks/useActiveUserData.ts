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
  return {
    ...mutation,
    categorizedData,
    refetch: mutation.mutate, // Call this to fetch data
  };
}