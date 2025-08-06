import { useMutation } from '@tanstack/react-query';
import { CreateCurriculum, CreateSubject, Curriculum, Subject, UpdateCurriculum, Program, CreateProgram, SubjectPrerequisite, SubjectVersionWithCurriculumInfo } from '../interfaces/ISchoolProgram';
import { AddCurriculum, FetchCurriculumById, FetchCurriculumList, UpdateCurriculumById, RegisterMultipleCurriculum, FetchSubjectVersionsToCurriculum, AddSubjectVersionToCurriculum, RemoveSubjectVersionFromCurriculum } from '../api/SchoolAPI/curriculumAPI';
import { PagedData } from '../interfaces/ISchoolProgram';
import { AddSubject, FetchSubjectById, FetchSubjectList, UpdateSubjectById, AddPrerequisitesSubject, RegisterMultipleSubject } from '../api/SchoolAPI/subjectAPI';
import { AddProgram, FetchProgramList, FetchProgramById, UpdateProgramById, DisableProgram, RegisterMultiplePrograms } from '../api/SchoolAPI/programAPI';
import { Combo, CreateCombo, UpdateCombo } from '../interfaces/ISchoolProgram';
import { AddCombo, FetchComboList, FetchComboById, UpdateComboById, AddSubjectToCombo, RemoveSubjectToCombo, RegisterMultipleCombo, FetchComboSubjects } from '../api/SchoolAPI/comboAPI';
import { useState } from 'react';
import { 
  AddSyllabus, 
  AddSyllabusAssessments, 
  AddSyllabusMaterial, 
  AddSyllabusOutcomes, 
  AddSyllabusSessions, 
  AddSyllabusOutcomesToSession,
  AddSyllabusMaterialsBulk,
  AddSyllabusOutcomesBulk,
  AddSyllabusSessionsBulk,
  FetchSyllabusBySubjectVersion, 
  FetchSyllabusBySubject, 
  UpdateSyllabusById, 
  DisableSyllabus 
} from '../api/SchoolAPI/syllabusAPI';
import { CreateSyllabus, Syllabus, UpdateSyllabus, SyllabusAssessment, SyllabusMaterial, SyllabusOutcome, SyllabusSession, CreateSyllabusAssessment, CreateSyllabusMaterial, CreateSyllabusOutcome, CreateSyllabusSession } from '../interfaces/ISchoolProgram';
import { 
  AddSubjectVersion, 
  DeleteSubjectVersion, 
  FetchPagedSubjectVersionList, 
  FetchSubjectVersionById, 
  FetchSubjectVersionBySubjectId, 
  FetchDefaultSubjectVersionBySubject, 
  UpdateSubjectVersionById, 
  ActiveSubjectVersion, 
  AddPrerequisiteToSubjectVersion, 
  GetPrerequisitesBySubjectVersion, 
  GetDependentsBySubjectVersion, 
  DeletePrerequisiteFromSubjectVersion, 
  GetPrerequisitesBySubject, 
  CopyPrerequisitesBetweenVersions,
  SetDefaultSubjectVersion
} from '../api/SchoolAPI/subjectVersionAPI';
import { SubjectVersion, CreateSubjectVersion, UpdateSubjectVersion } from '../interfaces/ISchoolProgram';

interface PaginationParams {
  pageNumber: number;
  pageSize: number;
  filterType?: string;
  filterValue?: string;
  searchQuery?: string;
  programId?: number;
}

export function useCRUDCurriculum() {
  const getCurriculumMutation = useMutation<PagedData<Curriculum> | null, unknown, PaginationParams>({
    mutationFn: async (params: PaginationParams) => {
      const data = await FetchCurriculumList(
        params.pageNumber, 
        params.pageSize, 
        params.searchQuery,
        params.programId
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

  const addMultipleCurriculumsMutation = useMutation<any | null, unknown, CreateCurriculum[]>({
    mutationFn: async (data: CreateCurriculum[]) => {
      const result = await RegisterMultipleCurriculum(data);
      return result;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  // Fetch subject versions in curriculum
  const fetchCurriculumSubjectVersionsMutation = useMutation<SubjectVersionWithCurriculumInfo[] | null, unknown, number>({
    mutationFn: async (curriculumId: number) => {
      const result = await FetchSubjectVersionsToCurriculum(curriculumId);
      return result;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const fetchSubjectsMutation = useMutation<PagedData<Subject> | null, unknown, void>({
    mutationFn: async () => {
      const result = await FetchSubjectList(1, 10);
      return result;
    },
    onError: (error) => {
      console.error(error);
    },
  });
  
  const isSuccessCreateCurriculum = addCurriculumMutation.isSuccess;
  const isSuccessUpdateCurriculum = updateCurriculumMutation.isSuccess;
  const isSuccessBulkImport = addMultipleCurriculumsMutation.isSuccess;
  
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
    addMultipleCurriculumsMutation,
    getCurriculumMutation,
    fetchCurriculumSubjectVersionsMutation,
    fetchSubjectsMutation,
    getAllCurriculums: getCurriculumMutation.mutate,
    curriculumList,
    paginationCurriculum,
    isLoading: getCurriculumMutation.isPending,
    isSuccessCreateCurriculum,
    isSuccessUpdateCurriculum,
    isSuccessBulkImport,
    curriculumById,
    getCurriculumById
  }
}

export function useCRUDSubject() {
  const getSubjectMutation = useMutation<PagedData<Subject> | null, unknown, PaginationParams | 'NONE' | undefined>({
    mutationFn: async (params?: PaginationParams | 'NONE') => {
      if (!params || params === 'NONE') {
        // Fetch all subjects with no paged
        const data = await FetchSubjectList();
        return data;
      } else {
        const data = await FetchSubjectList(
          params.pageNumber,
          params.pageSize,
          params.filterValue,
          params.filterType,
          undefined
        );
        return data;
      }
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

  const addMultipleSubjectsMutation = useMutation<any | null, unknown, CreateSubject[]>({
    mutationFn: async (data: CreateSubject[]) => {
      const result = await RegisterMultipleSubject(data);
      return result;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  /**
   * @deprecated Use addPrerequisiteToSubjectVersionMutation from useCRUDSubjectVersion instead
   * This mutation will be removed in a future version
   */
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
  const isSuccessBulkImport = addMultipleSubjectsMutation.isSuccess;

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
    addMultipleSubjectsMutation,
    getSubjectMutation,
    getAllSubjects: getSubjectMutation.mutate,
    subjectList,
    paginationSubject,
    isLoading: getSubjectMutation.isPending,
    isSuccessCreateSubject,
    isSuccessUpdateSubject,
    isSuccessBulkImport,
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

  const addMultipleCombosMutation = useMutation<any | null, unknown, CreateCombo[]>({
    mutationFn: async (data: CreateCombo[]) => {
      const result = await RegisterMultipleCombo(data);
      return result;
    },
    onError: (error) => {
      console.error(error);
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

  const fetchComboSubjectsMutation = useMutation<Subject[] | null, unknown, number>({
    mutationFn: async (comboId: number) => {
      const result = await FetchComboSubjects(comboId);
      return result;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const isSuccessBulkImport = addMultipleCombosMutation.isSuccess;

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
    addMultipleCombosMutation,
    updateComboMutation,
    getComboMutation,
    getAllCombos: getComboMutation.mutate,
    comboList,
    paginationCombo,
    addSubjectToComboMutation,
    removeSubjectFromComboMutation,
    getComboById,
    isSuccessBulkImport,
    comboPage,
    setComboPage,
    comboPageSize,
    setComboPageSize,
    comboSearch,
    setComboSearch,
    isComboLoading,
    fetchComboSubjectsMutation
  }
}

export function useCRUDSyllabus() {
  // Fetch syllabus by subject version
  const fetchSyllabusBySubjectVersionMutation = useMutation<Syllabus | null, unknown, number>({
    mutationFn: async (subjectVersionId: number) => {
      const result = await FetchSyllabusBySubjectVersion(subjectVersionId);
      return result;
    },
    onError: (error) => {
      console.error(error);
      return null;
    },
  });

  const fetchSyllabusBySubjectMutation = useMutation<Syllabus | null, unknown, number>({
    mutationFn: async (subjectId: number) => {
      const result = await FetchSyllabusBySubject(subjectId);
      return result;
    },
    onError: (error) => {
      console.error(error);
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

  // Add syllabus outcomes to session
  const addSyllabusOutcomesToSessionMutation = useMutation<any | null, unknown, { sessionId: number; outcomeId: number }>({
    mutationFn: async ({ sessionId, outcomeId }) => {
      const result = await AddSyllabusOutcomesToSession(sessionId, outcomeId);
      return result;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  // Add syllabus materials bulk
  const addSyllabusMaterialsBulkMutation = useMutation<any | null, unknown, CreateSyllabusMaterial[]>({
    mutationFn: async (data: CreateSyllabusMaterial[]) => {
      const result = await AddSyllabusMaterialsBulk(data);
      return result;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  // Add syllabus outcomes bulk
  const addSyllabusOutcomesBulkMutation = useMutation<any | null, unknown, CreateSyllabusOutcome[]>({
    mutationFn: async (data: CreateSyllabusOutcome[]) => {
      const result = await AddSyllabusOutcomesBulk(data);
      return result;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  // Add syllabus sessions bulk
  const addSyllabusSessionsBulkMutation = useMutation<any | null, unknown, CreateSyllabusSession[]>({
    mutationFn: async (data: CreateSyllabusSession[]) => {
      const result = await AddSyllabusSessionsBulk(data);
      return result;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  return {
    fetchSyllabusBySubjectVersionMutation,
    fetchSyllabusBySubjectMutation,
    addSyllabusMutation,
    updateSyllabusMutation,
    disableSyllabusMutation,
    addSyllabusAssessmentMutation,
    addSyllabusMaterialMutation,
    addSyllabusOutcomeMutation,
    addSyllabusSessionMutation,
    addSyllabusOutcomesToSessionMutation,
    addSyllabusMaterialsBulkMutation,
    addSyllabusOutcomesBulkMutation,
    addSyllabusSessionsBulkMutation
  };
}

export function useCRUDProgram() {
  const getProgramMutation = useMutation<PagedData<Program> | null, unknown, PaginationParams & { searchQuery?: string }>({
    mutationFn: async (params) => {
      const data = await FetchProgramList(
        params.pageNumber,
        params.pageSize,
        params.searchQuery,
        params.filterType,
        params.filterValue
      );
      return data;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const addProgramMutation = useMutation<Program | null, unknown, CreateProgram>({
    mutationFn: async (data: CreateProgram) => {
      const result = await AddProgram(data);
      return result;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const addMultipleProgramsMutation = useMutation<any | null, unknown, CreateProgram[]>({
    mutationFn: async (data: CreateProgram[]) => {
      const result = await RegisterMultiplePrograms(data);
      return result;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const updateProgramMutation = useMutation<Program | null, unknown, { id: number; data: CreateProgram }>({
    mutationFn: async ({ id, data }) => {
      const result = await UpdateProgramById(id, data);
      return result;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const getProgramById = useMutation<Program | null, unknown, number>({
    mutationFn: async (id: number) => {
      const result = await FetchProgramById(id);
      return result;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const disableProgramMutation = useMutation<Program | null, unknown, number>({
    mutationFn: async (id: number) => {
      const result = await DisableProgram(id);
      return result;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const isSuccessCreateProgram = addProgramMutation.isSuccess;
  const isSuccessUpdateProgram = updateProgramMutation.isSuccess;
  const isSuccessBulkImport = addMultipleProgramsMutation.isSuccess;

  const programById = getProgramById.data || null;
  const metaData = getProgramMutation.data || null;
  const programList = metaData?.items || [];
  const paginationProgram = metaData ? {
    current: metaData.pageNumber,
    pageSize: metaData.pageSize,
    total: metaData.totalCount,
    totalPages: Math.ceil(metaData.totalCount / metaData.pageSize)
  } : null;

  return {
    addProgramMutation,
    addMultipleProgramsMutation,
    updateProgramMutation,
    getProgramMutation,
    disableProgramMutation,
    getAllPrograms: getProgramMutation.mutate,
    programList,
    paginationProgram,
    isLoading: getProgramMutation.isPending,
    isSuccessCreateProgram,
    isSuccessUpdateProgram,
    isSuccessBulkImport,
    programById,
    getProgramById
  };
}

export function useCRUDSubjectVersion() {
  // Fetch paged subject versions
  const getSubjectVersionMutation = useMutation<PagedData<SubjectVersion> | null, unknown, PaginationParams>({
    mutationFn: async (params: PaginationParams) => {
      const data = await FetchPagedSubjectVersionList(
        params.pageNumber,
        params.pageSize,
        params.filterValue,
        params.filterType
      );
      return data;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  // Fetch subject version by ID
  const getSubjectVersionById = useMutation<SubjectVersion | null, unknown, number>({
    mutationFn: async (id: number) => {
      const result = await FetchSubjectVersionById(id);
      return result;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  // Fetch subject versions by subject ID
  const getSubjectVersionsBySubjectId = useMutation<SubjectVersion[] | null, unknown, number>({
    mutationFn: async (subjectId: number) => {
      const result = await FetchSubjectVersionBySubjectId(subjectId);
      // Return empty array if result is null or undefined
      return result || [];
    },
    onError: (error) => {
      console.error(error);
    },
  });

  // Fetch default subject version by subject ID
  const getDefaultSubjectVersionBySubjectId = useMutation<SubjectVersion | null, unknown, number>({
    mutationFn: async (subjectId: number) => {
      const result = await FetchDefaultSubjectVersionBySubject(subjectId);
      return result;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  // Add subject version
  const addSubjectVersionMutation = useMutation<SubjectVersion | null, unknown, CreateSubjectVersion>({
    mutationFn: async (data: CreateSubjectVersion) => {
      const result = await AddSubjectVersion(data);
      return result;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  // Update subject version
  const updateSubjectVersionMutation = useMutation<SubjectVersion | null, unknown, { id: number; data: UpdateSubjectVersion }>({
    mutationFn: async ({ id, data }) => {
      const result = await UpdateSubjectVersionById(id, data);
      return result;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  // Delete subject version
  const deleteSubjectVersionMutation = useMutation<any | null, unknown, number>({
    mutationFn: async (id: number) => {
      const result = await DeleteSubjectVersion(id);
      return result;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  // Toggle active status
  const toggleActiveSubjectVersionMutation = useMutation<SubjectVersion | null, unknown, number>({
    mutationFn: async (id: number) => {
      const result = await ActiveSubjectVersion(id);
      return result;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  // Set default subject version
  const setDefaultSubjectVersionMutation = useMutation<SubjectVersion | null, unknown, number>({
    mutationFn: async (id: number) => {
      const result = await SetDefaultSubjectVersion(id);
      return result;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  // Add prerequisite to subject version
  const addPrerequisiteToSubjectVersionMutation = useMutation<SubjectVersion | null, unknown, { subjectVersionId: number; prerequisiteId: number }>({
    mutationFn: async ({ subjectVersionId, prerequisiteId }) => {
      const result = await AddPrerequisiteToSubjectVersion(subjectVersionId, prerequisiteId);
      return result;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  // Get prerequisites by subject version
  const getPrerequisitesBySubjectVersionMutation = useMutation<SubjectPrerequisite[] | null, unknown, number>({
    mutationFn: async (subjectVersionId: number) => {
      const result = await GetPrerequisitesBySubjectVersion(subjectVersionId);
      return result;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  // Get dependents by subject version
  const getDependentsBySubjectVersionMutation = useMutation<SubjectVersion[] | null, unknown, number>({
    mutationFn: async (subjectVersionId: number) => {
      const result = await GetDependentsBySubjectVersion(subjectVersionId);
      return result;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  // Delete prerequisite from subject version
  const deletePrerequisiteFromSubjectVersionMutation = useMutation<any | null, unknown, { subjectVersionId: number; prerequisiteId: number }>({
    mutationFn: async ({ subjectVersionId, prerequisiteId }) => {
      const result = await DeletePrerequisiteFromSubjectVersion(subjectVersionId, prerequisiteId);
      return result;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  // Get prerequisites by subject
  const getPrerequisitesBySubjectMutation = useMutation<any | null, unknown, number>({
    mutationFn: async (subjectId: number) => {
      const result = await GetPrerequisitesBySubject(subjectId);
      return result;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  // Copy prerequisites between versions
  const copyPrerequisitesBetweenVersionsMutation = useMutation<any | null, unknown, { sourceVersionId: number; targetVersionId: number }>({
    mutationFn: async ({ sourceVersionId, targetVersionId }) => {
      const result = await CopyPrerequisitesBetweenVersions(sourceVersionId, targetVersionId);
      return result;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const isSuccessCreateSubjectVersion = addSubjectVersionMutation.isSuccess;
  const isSuccessUpdateSubjectVersion = updateSubjectVersionMutation.isSuccess;
  const isSuccessDeleteSubjectVersion = deleteSubjectVersionMutation.isSuccess;
  const isSuccessToggleActive = toggleActiveSubjectVersionMutation.isSuccess;
  const isSuccessAddPrerequisite = addPrerequisiteToSubjectVersionMutation.isSuccess;
  const isSuccessGetPrerequisites = getPrerequisitesBySubjectVersionMutation.isSuccess;
  const isSuccessGetDependents = getDependentsBySubjectVersionMutation.isSuccess;
  const isSuccessDeletePrerequisite = deletePrerequisiteFromSubjectVersionMutation.isSuccess;
  const isSuccessGetPrerequisitesBySubject = getPrerequisitesBySubjectMutation.isSuccess;
  const isSuccessCopyPrerequisites = copyPrerequisitesBetweenVersionsMutation.isSuccess;
  const isSuccessSetDefault = setDefaultSubjectVersionMutation.isSuccess;

  const subjectVersionById = getSubjectVersionById.data || null;
  const metaData = getSubjectVersionMutation.data || null;
  const subjectVersionList = metaData?.items || [];
  const paginationSubjectVersion = metaData ? {
    current: metaData.pageNumber,
    pageSize: metaData.pageSize,
    total: metaData.totalCount,
    totalPages: Math.ceil(metaData.totalCount / metaData.pageSize)
  } : null;

  return {
    addSubjectVersionMutation,
    updateSubjectVersionMutation,
    deleteSubjectVersionMutation,
    toggleActiveSubjectVersionMutation,
    setDefaultSubjectVersionMutation,
    addPrerequisiteToSubjectVersionMutation,
    getPrerequisitesBySubjectVersionMutation,
    getDependentsBySubjectVersionMutation,
    deletePrerequisiteFromSubjectVersionMutation,
    getPrerequisitesBySubjectMutation,
    copyPrerequisitesBetweenVersionsMutation,
    getSubjectVersionMutation,
    getSubjectVersionById,
    getSubjectVersionsBySubjectId,
    getDefaultSubjectVersionBySubjectId,
    getAllSubjectVersions: getSubjectVersionMutation.mutate,
    subjectVersionList,
    paginationSubjectVersion,
    isLoading: getSubjectVersionMutation.isPending,
    isSuccessCreateSubjectVersion,
    isSuccessUpdateSubjectVersion,
    isSuccessDeleteSubjectVersion,
    isSuccessToggleActive,
    isSuccessAddPrerequisite,
    isSuccessGetPrerequisites,
    isSuccessGetDependents,
    isSuccessDeletePrerequisite,
    isSuccessGetPrerequisitesBySubject,
    isSuccessCopyPrerequisites,
    isSuccessSetDefault,
    subjectVersionById
  };
}
