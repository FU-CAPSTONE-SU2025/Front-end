import { useMutation, useQuery } from '@tanstack/react-query';
import {
  FetchProgramList,
} from '../api/SchoolAPI/programAPI';
import {
  DisableSubject,
} from '../api/SchoolAPI/subjectAPI';
import {
  RegisterMultipleStudentsToMultipleSubjects,
  RegisterOneStudentsToMultipleSubjects,
  RegisterStudentToSubject,
  FetchJoinedSubjectList,
  FetchPagedSemesterList,
  FetchPagedSemesterBlockType,
} from '../api/SchoolAPI/joinedSubjectAPI';
import { AddSubjectVersionToCurriculum, FetchCurriculumList, FetchSubjectVersionsToCurriculum, FetchSubjectVersionsToCurriculumByCode, RemoveSubjectVersionFromCurriculum } from '../api/SchoolAPI/curriculumAPI';

export const useSchoolApi = () => {
  // Program queries
  const useProgramList = () => useQuery({
    queryKey: ['programList'],
    queryFn: () => FetchProgramList(),
  });

  // Paginated program queries for edit account page
  const usePagedProgramList = (page: number = 1, pageSize: number = 10, search?: string) => useQuery({
    queryKey: ['pagedProgramList', page, pageSize, search],
    queryFn: () => FetchProgramList(page, pageSize, search),
  });

  // Curriculum queries
  const useCurriculumList = () => useQuery({
    queryKey: ['curriculumList'],
    queryFn: () => FetchCurriculumList(),
  });

  // Paginated curriculum queries for edit account page
  const usePagedCurriculumList = (page: number = 1, pageSize: number = 10, search?: string, programId?: number) => useQuery({
    queryKey: ['pagedCurriculumList', page, pageSize, search, programId],
    queryFn: () => FetchCurriculumList(page, pageSize, search, programId),
  });

  const useSubjectVersionsToCurriculum = (curriculumId: string) => useQuery({
    queryKey: ['subjectVersionsToCurriculum', curriculumId],
    queryFn: () => FetchSubjectVersionsToCurriculum(parseInt(curriculumId)),
    enabled: !!curriculumId,
  });

  const useSubjectVersionsToCurriculumByCode = (curriculumCode: string) => useQuery({
    queryKey: ['subjectVersionsToCurriculumByCode', curriculumCode],
    queryFn: () => FetchSubjectVersionsToCurriculumByCode(curriculumCode),
    enabled: !!curriculumCode,
  });

  // Joined subject queries
  const useJoinedSubjectList = (studentProfileId: number) => useQuery({
    queryKey: ['joinedSubjectList', studentProfileId],
    queryFn: () => FetchJoinedSubjectList(1, 10, studentProfileId),
    enabled: !!studentProfileId,
  });

  // Semester queries
  const usePagedSemesterList = (page: number = 1) => useQuery({
    queryKey: ['pagedSemesterList', page],
    queryFn: () => FetchPagedSemesterList(page, 10),
  });

  const usePagedSemesterBlockType = (page: number = 1) => useQuery({
    queryKey: ['pagedSemesterBlockType', page],
    queryFn: () => FetchPagedSemesterBlockType(page, 10),
  });

  // Mutations
  const addSubjectVersionToCurriculumMutation = useMutation({
    mutationFn: (data: any) => AddSubjectVersionToCurriculum(data.curriculumId, data.subjectVersionId),
  });

  const removeSubjectVersionFromCurriculumMutation = useMutation({
    mutationFn: (data: any) => RemoveSubjectVersionFromCurriculum(data.subjectVersionId, data.curriculumId),
  });

  const disableSubjectMutation = useMutation({
    mutationFn: DisableSubject,
  });

  const registerMultipleStudentsMutation = useMutation({
    mutationFn: RegisterMultipleStudentsToMultipleSubjects,
  });

  const registerOneStudentToMultipleSubjectsMutation = useMutation({
    mutationFn: RegisterOneStudentsToMultipleSubjects,
  });

  const registerStudentToSubjectMutation = useMutation({
    mutationFn: RegisterStudentToSubject,
  });

  return {
    // Queries
    useProgramList,
    usePagedProgramList,
    useCurriculumList,
    usePagedCurriculumList,
    useSubjectVersionsToCurriculum,
    useSubjectVersionsToCurriculumByCode,
    useJoinedSubjectList,
    usePagedSemesterList,
    usePagedSemesterBlockType,
    
    // Convenience async calls
    addSubjectVersionToCurriculum: addSubjectVersionToCurriculumMutation.mutateAsync,
    removeSubjectVersionFromCurriculum: removeSubjectVersionFromCurriculumMutation.mutateAsync,
    disableSubject: disableSubjectMutation.mutateAsync,
    registerMultipleStudents: registerMultipleStudentsMutation.mutateAsync,
    registerOneStudentToMultipleSubjects: registerOneStudentToMultipleSubjectsMutation.mutateAsync,
    registerStudentToSubject: registerStudentToSubjectMutation.mutateAsync,
  };
};
