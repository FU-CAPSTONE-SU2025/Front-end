import { useQuery } from '@tanstack/react-query';
import { GetPagedActiveStudent } from '../api/Account/UserAPI';
import { 
  GetActiveStudentsByCombo, 
  GetActiveStudentsByProgram, 
  GetActiveStudentsByCurriculum 
} from '../api/student/StudentAPI';

export const useActiveStudentApi = () => {
  const usePagedActiveStudents = (page: number, pageSize: number, search?: string, programId?: number) => useQuery({
    queryKey: ['pagedActiveStudents', page, pageSize, search, programId],
    queryFn: () => GetPagedActiveStudent(page, pageSize, search, programId),
  });

  const useActiveStudentsByCombo = (comboCode: string | null, page: number, pageSize: number) => useQuery({
    queryKey: ['activeStudentsByCombo', comboCode, page, pageSize],
    queryFn: () => GetActiveStudentsByCombo(comboCode, page, pageSize),
    enabled: !!comboCode,
  });

  const useActiveStudentsByProgram = (programId: number | null, page: number, pageSize: number) => useQuery({
    queryKey: ['activeStudentsByProgram', programId, page, pageSize],
    queryFn: () => GetActiveStudentsByProgram(programId, page, pageSize),
    enabled: !!programId,
  });

  const useActiveStudentsByCurriculum = (curriculumCode: string | null, page: number, pageSize: number) => useQuery({
    queryKey: ['activeStudentsByCurriculum', curriculumCode, page, pageSize],
    queryFn: () => GetActiveStudentsByCurriculum(curriculumCode, page, pageSize),
    enabled: !!curriculumCode,
  });

  return {
    usePagedActiveStudents,
    useActiveStudentsByCombo,
    useActiveStudentsByProgram,
    useActiveStudentsByCurriculum,
  };
};
