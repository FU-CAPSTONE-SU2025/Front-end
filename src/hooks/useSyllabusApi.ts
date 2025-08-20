import { useQuery } from '@tanstack/react-query';
import { GetSyllabusById } from '../api/syllabus/syllabusAPI';
import { useApiErrorHandler } from './useApiErrorHandler';

/**
 * Syllabus-related API hooks
 * Wraps syllabus APIs behind React Query so UI components don't call APIs directly.
 */
export const useSyllabusApi = () => {
  const { handleError } = useApiErrorHandler();

  const useSyllabusById = (syllabusId: string) => useQuery({
    queryKey: ['syllabusById', syllabusId],
    queryFn: async () => {
      try {
        return await GetSyllabusById(parseInt(syllabusId));
      } catch (err) {
        handleError(err, 'Failed to fetch syllabus');
        throw err;
      }
    },
    enabled: !!syllabusId,
  });

  return {
    useSyllabusById,
  };
};
