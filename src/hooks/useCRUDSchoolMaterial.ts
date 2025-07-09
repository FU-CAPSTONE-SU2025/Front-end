import { useMutation } from '@tanstack/react-query';
import { CreateCurriculum, CreateSubject, Curriculum, Subject, UpdateCurriculum, CurriculumSubject, SubjectWithCurriculumInfo } from '../interfaces/ISchoolProgram';
import { AddCurriculum, FetchCurriculumById, FetchCurriculumList, UpdateCurriculumById, FetchSubjectToCurriculum } from '../api/SchoolAPI/curriculumAPI';
import { PagedData } from '../interfaces/ISchoolProgram';
import { AddSubject, FetchSubjectById, FetchSubjectList, UpdateSubjectById, AddPrerequisitesSubject } from '../api/SchoolAPI/subjectAPI';
import { Combo, CreateCombo, UpdateCombo } from '../interfaces/ISchoolProgram';
import { AddCombo, FetchComboList, FetchComboById, UpdateComboById, AddSubjectToCombo, RemoveSubjectToCombo } from '../api/SchoolAPI/comboAPI';
import { useState } from 'react';
import { 
  AddSyllabus, 
  AddSyllabusAssessments, 
  AddSyllabusMaterial, 
  AddSyllabusOutcomes, 
  AddSyllabusSessions, 
  AddSyllabusOutcomesToSession, 
  FetchSyllabusBySubject, 
  UpdateSyllabusById, 
  DisableSyllabus 
} from '../api/SchoolAPI/syllabusAPI';
import { CreateSyllabus, Syllabus, UpdateSyllabus, SyllabusAssessment, SyllabusMaterial, SyllabusOutcome, SyllabusSession, CreateSyllabusAssessment, CreateSyllabusMaterial, CreateSyllabusOutcome, CreateSyllabusSession } from '../interfaces/ISchoolProgram';

interface PaginationParams {
  pageNumber: number;
  pageSize: number;
  filterType?: string;
  filterValue?: string;
}

export function useCRUDCurriculum() {
  const getCurriculumMutation = useMutation<PagedData<Curriculum> | null, unknown, PaginationParams>({
    mutationFn: async (params: PaginationParams) => {
      const data = await FetchCurriculumList(
        params.pageNumber, 
        params.pageSize, 
        params.filterType, 
        params.filterValue
      );
      return data;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const updateCurriculumMutation = useMutation<Curriculum | null, unknown, { id: number; data: UpdateCurriculum }>({
    mutationFn: async ({ id, data }) => {
      const result = await UpdateCurriculumById(id, data);
      return result;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const getCurriculumById = useMutation<Curriculum | null, unknown, number>({
    mutationFn: async (id:number) => {
      const result = await FetchCurriculumById(id);
      return result;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const addCurriculumMutation = useMutation<Curriculum | null, unknown, CreateCurriculum>({
    mutationFn: async (data: CreateCurriculum) => {
      const result = await AddCurriculum(data);
      return result;
    },
  });

  const fetchCurriculumSubjectsMutation = useMutation<SubjectWithCurriculumInfo[] | null, unknown, number>({
    mutationFn: async (curriculumId: number) => {
      const result = await FetchSubjectToCurriculum(curriculumId);
      return result;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const fetchSubjectsMutation = useMutation<PagedData<Subject> | null, unknown, void>({
    mutationFn: async () => {
      const result = await FetchSubjectList(1, 100);
      return result;
    },
    onError: (error) => {
      console.error(error);
    },
  });
  
  const isSuccessCreateCurriculum = addCurriculumMutation.isSuccess;
  const isSuccessUpdateCurriculum = updateCurriculumMutation.isSuccess;
  
  const curriculumById = getCurriculumById.data || null;
  const metaData = getCurriculumMutation.data || null;
  const curriculumList = metaData?.items || [];
  const paginationCurriculum = metaData ? {
    current: metaData.pageNumber,
    pageSize: metaData.pageSize,
    total: metaData.totalCount,
    totalPages: Math.ceil(metaData.totalCount / metaData.pageSize)
  } : null;
  
  return {
    updateCurriculumMutation,
    addCurriculumMutation,
    getCurriculumMutation,
    fetchCurriculumSubjectsMutation,
    fetchSubjectsMutation,
    getAllCurriculums: getCurriculumMutation.mutate,
    curriculumList,
    paginationCurriculum,
    isLoading: getCurriculumMutation.isPending,
    isSuccessCreateCurriculum,
    isSuccessUpdateCurriculum,
    curriculumById,
    getCurriculumById
  }
}

export function useCRUDSubject() {
  const getSubjectMutation = useMutation<PagedData<Subject> | null, unknown, PaginationParams>({
    mutationFn: async (params: PaginationParams) => {
      const data = await FetchSubjectList(
        params.pageNumber,
        params.pageSize,
        params.filterValue,
        params.filterType,
        undefined
      );
      return data;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const updateSubjectMutation = useMutation<Subject | null, unknown, { id: number; data: Subject }>({
    mutationFn: async ({ id, data }) => {
      const result = await UpdateSubjectById(id, data);
      return result;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const getSubjectById = useMutation<Subject | null, unknown, number>({
    mutationFn: async (id: number) => {
      const result = await FetchSubjectById(id);
      return result;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const addSubjectMutation = useMutation<Subject | null, unknown, CreateSubject>({
    mutationFn: async (data: CreateSubject) => {
      const result = await AddSubject(data);
      return result;
    },
  });

  const addPrerequisiteMutation = useMutation<Subject | null, unknown, { id: number; prerequisitesId: number }>({
    mutationFn: async ({ id, prerequisitesId }) => {
      const result = await AddPrerequisitesSubject(id, prerequisitesId);
      return result;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const isSuccessCreateSubject = addSubjectMutation.isSuccess;
  const isSuccessUpdateSubject = updateSubjectMutation.isSuccess;

  const subjectById = getSubjectById.data || null;
  const metaData = getSubjectMutation.data || null;
  const subjectList = metaData?.items || [];
  const paginationSubject = metaData ? {
    current: metaData.pageNumber,
    pageSize: metaData.pageSize,
    total: metaData.totalCount,
    totalPages: Math.ceil(metaData.totalCount / metaData.pageSize)
  } : null;

  return {
    updateSubjectMutation,
    addSubjectMutation,
    getSubjectMutation,
    getAllSubjects: getSubjectMutation.mutate,
    subjectList,
    paginationSubject,
    isLoading: getSubjectMutation.isPending,
    isSuccessCreateSubject,
    isSuccessUpdateSubject,
    subjectById,
    getSubjectById,
    addPrerequisiteMutation
  }
}

export function useCRUDCombo() {
  const [comboPage, setComboPage] = useState(1);
  const [comboPageSize, setComboPageSize] = useState(10);
  const [comboSearch, setComboSearch] = useState('');

  const getComboMutation = useMutation<PagedData<Combo> | null, unknown, PaginationParams>({
    mutationFn: async (params: PaginationParams) => {
      const data = await FetchComboList(
        params.pageNumber,
        params.pageSize,
        params.filterValue
      );
      return data;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const addComboMutation = useMutation<Combo | null, unknown, CreateCombo>({
    mutationFn: async (data: CreateCombo) => {
      const result = await AddCombo(data);
      return result;
    },
  });

  const updateComboMutation = useMutation<Combo | null, unknown, { id: number; data: UpdateCombo }>({
    mutationFn: async ({ id, data }) => {
      const result = await UpdateComboById(id, data);
      return result;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const getComboById = useMutation<Combo | null, unknown, number>({
    mutationFn: async (id: number) => {
      const result = await FetchComboById(id);
      return result;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const addSubjectToComboMutation = useMutation<Combo | null, unknown, { comboId: number; subjectId: number }>({
    mutationFn: async ({ comboId, subjectId }) => {
        
      const result = await AddSubjectToCombo(comboId, subjectId);
      return result;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const removeSubjectFromComboMutation = useMutation<Combo | null, unknown, { comboId: number; subjectId: number }>({
    mutationFn: async ({ comboId, subjectId }) => {
      const result = await RemoveSubjectToCombo(comboId, subjectId);
      return result;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const metaData = getComboMutation.data || null;
  const comboList = metaData?.items || [];
  const paginationCombo = metaData ? {
    current: metaData.pageNumber,
    pageSize: metaData.pageSize,
    total: metaData.totalCount,
    totalPages: Math.ceil(metaData.totalCount / metaData.pageSize)
  } : null;

  const isComboLoading = getComboMutation.isPending;

  return {
    addComboMutation,
    updateComboMutation,
    getComboMutation,
    getAllCombos: getComboMutation.mutate,
    comboList,
    paginationCombo,
    addSubjectToComboMutation,
    removeSubjectFromComboMutation,
    getComboById,
    comboPage,
    setComboPage,
    comboPageSize,
    setComboPageSize,
    comboSearch,
    setComboSearch,
    isComboLoading
  }
}

export function useCRUDSyllabus() {
  // Fetch syllabus by subject
  const fetchSyllabusBySubjectMutation = useMutation<Syllabus | null, unknown, number>({
    mutationFn: async (subjectId: number) => {
      const result = await FetchSyllabusBySubject(subjectId);
      return result as Syllabus | null;
    },
    onError: (error) => {
      console.error(error);
       return null;
    },
  });

  // Add syllabus
  const addSyllabusMutation = useMutation<Syllabus | null, unknown, CreateSyllabus>({
    mutationFn: async (data: CreateSyllabus) => {
      const result = await AddSyllabus(data);
      return result;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  // Update syllabus
  const updateSyllabusMutation = useMutation<any | null, unknown, { id: number; data: UpdateSyllabus }>({
    mutationFn: async ({ id, data }) => {
      const result = await UpdateSyllabusById(id, data);
      return result;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  // Disable syllabus
  const disableSyllabusMutation = useMutation<any | null, unknown, number>({
    mutationFn: async (id: number) => {
      const result = await DisableSyllabus(id);
      return result;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  // Add syllabus assessments
  const addSyllabusAssessmentMutation = useMutation<any | null, unknown, CreateSyllabusAssessment>({
    mutationFn: async (data: CreateSyllabusAssessment) => {
      const result = await AddSyllabusAssessments(data);
      return result;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  // Add syllabus material
  const addSyllabusMaterialMutation = useMutation<any | null, unknown, CreateSyllabusMaterial>({
    mutationFn: async (data: CreateSyllabusMaterial) => {
      const result = await AddSyllabusMaterial(data);
      return result;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  // Add syllabus outcomes
  const addSyllabusOutcomeMutation = useMutation<any | null, unknown, CreateSyllabusOutcome>({
    mutationFn: async (data: CreateSyllabusOutcome) => {
      const result = await AddSyllabusOutcomes(data);
      return result;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  // Add syllabus sessions
  const addSyllabusSessionMutation = useMutation<any | null, unknown, CreateSyllabusSession>({
    mutationFn: async (data: CreateSyllabusSession) => {
      const result = await AddSyllabusSessions(data);
      return result;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  // Add outcomes to session
  const addSyllabusOutcomesToSessionMutation = useMutation<any | null, unknown, { sessionId: number; outcomeId: number }>({
    mutationFn: async ({ sessionId, outcomeId }) => {
      const result = await AddSyllabusOutcomesToSession(sessionId, outcomeId);
      return result;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  return {
    fetchSyllabusBySubjectMutation,
    addSyllabusMutation,
    updateSyllabusMutation,
    disableSyllabusMutation,
    addSyllabusAssessmentMutation,
    addSyllabusMaterialMutation,
    addSyllabusOutcomeMutation,
    addSyllabusSessionMutation,
    addSyllabusOutcomesToSessionMutation
  };
}
