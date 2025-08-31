import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import {
  AddSubjectMarkReport,
  FetchSubjectMarkReport,
  FetchSelfSubjectMarkReport,
  FetchPersonalAcademicTranscript,
  UpdateSubjectMarkReport,
  DeleteSubjectMarkReport,
  FetchViewSubjectMarkReportTemplate,
} from '../api/SchoolAPI/subjectMarkReportAPI';
import { 
  ISubjectMarkReport, 
  ICreateSubjectMarkReport, 
  IUpdateSubjectMarkReport,
  IViewSubjectAssessment,
  IPersonalAcademicTranscript
} from '../interfaces/ISubjectMarkReport';
import { useApiErrorHandler } from './useApiErrorHandler';
export const useSubjectMarkReport = () => {
  const { handleError } = useApiErrorHandler();
  const queryClient = useQueryClient();

  // Add subject mark report (single or bulk)
  const addSubjectMarkReportMutation = useMutation<any | null, unknown, { joinedSubjectId: number; data: ICreateSubjectMarkReport[] }>({
    mutationFn: async ({ joinedSubjectId, data }) => {
      return await AddSubjectMarkReport(joinedSubjectId, data);
    },
    onSuccess: () => {
      // Invalidate subject mark report queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['subjectMarkReport'] });
      queryClient.invalidateQueries({ queryKey: ['selfSubjectMarkReport'] });
      // Also invalidate joined subject by ID to refresh isPassed status
      queryClient.invalidateQueries({ queryKey: ['joinedSubjectById'] });
      // Invalidate status data to refresh subject status
      queryClient.invalidateQueries({ queryKey: ['joinedSubjectMapStatus'] });
    },
    onError: (err) => handleError(err, 'Failed to add subject mark report'),
  });

  // Fetch subject mark report (for Staff, Manager, Admin)
  const fetchSubjectMarkReportMutation = useMutation<ISubjectMarkReport[] | null, unknown, number>({
    mutationFn: async (joinedSubjectId: number) => {
      return await FetchSubjectMarkReport(joinedSubjectId);
    },
    onError: (err) => handleError(err, 'Failed to fetch subject mark report'),
  });

  // Fetch self subject mark report (for Student only)
  const fetchSelfSubjectMarkReportMutation = useMutation<ISubjectMarkReport[] | null, unknown, void>({
    mutationFn: async () => {
      return await FetchSelfSubjectMarkReport();
    },
    onError: (err) => handleError(err, 'Failed to fetch personal academic transcript'),
  });

  // Update subject mark report
  const updateSubjectMarkReportMutation = useMutation<any | null, unknown, { id: number; data: IUpdateSubjectMarkReport }>({
    mutationFn: async ({ id, data }) => {
      return await UpdateSubjectMarkReport(id, data);
    },
    onSuccess: () => {
      // Invalidate subject mark report queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['subjectMarkReport'] });
      queryClient.invalidateQueries({ queryKey: ['selfSubjectMarkReport'] });
      // Also invalidate joined subject by ID to refresh isPassed status
      queryClient.invalidateQueries({ queryKey: ['joinedSubjectById'] });
      // Invalidate status data to refresh subject status
      queryClient.invalidateQueries({ queryKey: ['joinedSubjectMapStatus'] });
    },
    onError: (err) => handleError(err, 'Failed to update subject mark report'),
  });

  // Delete subject mark report
  const deleteSubjectMarkReportMutation = useMutation<any | null, unknown, number>({
    mutationFn: async (id: number) => {
      return await DeleteSubjectMarkReport(id);
    },
    onSuccess: () => {
      // Invalidate subject mark report queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['subjectMarkReport'] });
      queryClient.invalidateQueries({ queryKey: ['selfSubjectMarkReport'] });
      // Also invalidate joined subject by ID to refresh isPassed status
      queryClient.invalidateQueries({ queryKey: ['joinedSubjectById'] });
      // Invalidate status data to refresh subject status
      queryClient.invalidateQueries({ queryKey: ['joinedSubjectMapStatus'] });
    },
    onError: (err) => handleError(err, 'Failed to delete subject mark report'),
  });

  return {
    // Convenience async calls (preferred for pages/components)
    addSubjectMarkReport: addSubjectMarkReportMutation.mutateAsync,
    fetchSubjectMarkReport: fetchSubjectMarkReportMutation.mutateAsync,
    fetchSelfSubjectMarkReport: fetchSelfSubjectMarkReportMutation.mutateAsync,
    updateSubjectMarkReport: updateSubjectMarkReportMutation.mutateAsync,
    deleteSubjectMarkReport: deleteSubjectMarkReportMutation.mutateAsync,

    // Full mutation objects when consumers need loading/error states
    addSubjectMarkReportMutation,
    fetchSubjectMarkReportMutation,
    fetchSelfSubjectMarkReportMutation,
    updateSubjectMarkReportMutation,
    deleteSubjectMarkReportMutation,
  };
};

export const useSubjectMarkReportTemplate = (subjectCode: string, subjectVersionCode: string) => {
  const { handleError } = useApiErrorHandler();

  return useQuery<IViewSubjectAssessment[] | null>({
    queryKey: ['subjectMarkReportTemplate', subjectCode, subjectVersionCode],
    queryFn: async () => {
      if (!subjectCode || !subjectVersionCode) {
        handleError("error", 'Missing query data');
        return null;
      }
      try {
        return await FetchViewSubjectMarkReportTemplate(subjectCode, subjectVersionCode);
      } catch (error) {
        handleError(error, 'Failed to fetch subject mark report template');
        return null;
      }
    },
    enabled: !!subjectCode && !!subjectVersionCode,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

export const usePersonalAcademicTranscript = () => {
  const { handleError } = useApiErrorHandler();

  return useQuery<IPersonalAcademicTranscript[] | null>({
    queryKey: ['personalAcademicTranscript'],
    queryFn: async () => {
      try {
        return await FetchPersonalAcademicTranscript();
      } catch (error) {
        handleError(error, 'Failed to fetch personal academic transcript');
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};
