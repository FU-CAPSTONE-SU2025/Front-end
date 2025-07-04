import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchSyllabusPaged } from '../api/syllabus/syllabusAPI';
import { PagedData, Syllabus } from '../interfaces/ISchoolProgram';

interface UseStudentFeatureParams {
  search: string;
  page: number;
  pageSize: number;
}

export const useStudentFeature = ({ search, page, pageSize }: UseStudentFeatureParams) => {
  return useQuery<PagedData<Syllabus> | null, Error>({
    queryKey: ['syllabus', search, page, pageSize],
    queryFn: () => fetchSyllabusPaged({ search, page, pageSize }),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60, // 1 phút
  });
};
