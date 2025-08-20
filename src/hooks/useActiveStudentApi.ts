import { useQuery } from '@tanstack/react-query';
import { GetPagedActiveStudent } from '../api/Account/UserAPI';
import { StudentBase } from '../interfaces/IStudent';

/**
 * Active Student API hooks
 * Wraps active student APIs behind React Query so UI components don't call APIs directly.
 */
export const useActiveStudentApi = () => {
  const usePagedActiveStudents = (page: number, pageSize: number, searchQuery?: string, programId?: number) => useQuery({
    queryKey: ['pagedActiveStudents', page, pageSize, searchQuery, programId],
    queryFn: () => GetPagedActiveStudent(page, pageSize, searchQuery, programId),
  });

  return {
    usePagedActiveStudents,
  };
};
