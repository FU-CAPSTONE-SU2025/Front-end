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
import { FetchComboList } from '../api/SchoolAPI/comboAPI';
import { BulkCreateJoinedSubjectMultipleStudents, BulkCreateJoinedSubjects, CreateJoinedSubject, CreateSubjectToCurriculum } from '../interfaces/ISchoolProgram';

type AddSubjectVersionToCurriculumMutation = {
  curriculumId: number,
  createSubjectToCurriculum: CreateSubjectToCurriculum
}

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

  // Infinite scroll program queries for Transcript page
  const useInfiniteProgramList = (page: number = 1, pageSize: number = 10, search?: string) => useQuery({
    queryKey: ['infiniteProgramList', page, pageSize, search],
    queryFn: () => FetchProgramList(page, pageSize, search),
    enabled: true, // Always enabled for dropdown
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

  // Infinite scroll curriculum queries for Transcript page
  const useInfiniteCurriculumList = (page: number = 1, pageSize: number = 10, search?: string, programId?: number) => useQuery({
    queryKey: ['infiniteCurriculumList', page, pageSize, search, programId],
    queryFn: () => FetchCurriculumList(page, pageSize, search, programId),
    enabled: true, // Always enabled for dropdown
  });

  // Combo queries
  const useComboList = () => useQuery({
    queryKey: ['comboList'],
    queryFn: () => FetchComboList(),
  });

  // Paginated combo queries for edit account page
  const usePagedComboList = (page: number = 1, pageSize: number = 10, search?: string) => useQuery({
    queryKey: ['pagedComboList', page, pageSize, search],
    queryFn: () => FetchComboList(page, pageSize, search),
  });

  // Infinite scroll combo queries for Transcript page
  const useInfiniteComboList = (page: number = 1, pageSize: number = 10, search?: string) => useQuery({
    queryKey: ['infiniteComboList', page, pageSize, search],
    queryFn: () => FetchComboList(page, pageSize, search),
    enabled: true, // Always enabled for dropdown
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
    mutationFn: (data: AddSubjectVersionToCurriculumMutation) => AddSubjectVersionToCurriculum(data.curriculumId, data.createSubjectToCurriculum),
  });

  const removeSubjectVersionFromCurriculumMutation = useMutation({
    mutationFn: (data: any) => RemoveSubjectVersionFromCurriculum(data.subjectVersionId, data.curriculumId),
  });

  const disableSubjectMutation = useMutation({
    mutationFn: (subjectId:number)=>DisableSubject(subjectId),
  });

  const registerMultipleStudentsMutation = useMutation({
    mutationFn: (data:BulkCreateJoinedSubjectMultipleStudents)=>RegisterMultipleStudentsToMultipleSubjects(data),
  });

  const registerOneStudentToMultipleSubjectsMutation = useMutation({
    mutationFn: (data:BulkCreateJoinedSubjects) =>RegisterOneStudentsToMultipleSubjects(data),
  });

  const registerStudentToSubjectMutation = useMutation({
    mutationFn: (data:CreateJoinedSubject)=> RegisterStudentToSubject(data),
  });

  return {
    // Queries
    useProgramList,
    usePagedProgramList,
    useInfiniteProgramList,
    useCurriculumList,
    usePagedCurriculumList,
    useInfiniteCurriculumList,
    useComboList,
    usePagedComboList,
    useInfiniteComboList,
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
