import { useMutation } from '@tanstack/react-query';
import { pagedAdvisorData } from '../interfaces/IAdvisor';
import { FetchAdvisorList } from '../api/advisor/AdvisorAPI';

interface PaginationParams {
  pageNumber: number;
  pageSize: number;
  filterType?: string;
  filterValue?: string;
}

export default function useCRUDAdvisor() {
  const getAdvisorMutation = useMutation<pagedAdvisorData | null, unknown, PaginationParams>({
    mutationFn: async (params: PaginationParams) => {
      const data = await FetchAdvisorList(
        params.pageNumber,
        params.pageSize,
        undefined, // searchQuery removed - will be handled client-side
        params.filterType,
        params.filterValue
      );
      return data;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const metaData = getAdvisorMutation.data || null;
  const advisorList = metaData?.items || [];
  const pagination = metaData
    ? {
        current: metaData.pageNumber,
        pageSize: metaData.pageSize,
        total: metaData.totalCount,
        totalPages: Math.ceil(metaData.totalCount / metaData.pageSize),
      }
    : null;

  return {
    ...getAdvisorMutation,
    getAllAdvisor: getAdvisorMutation.mutate,
    advisorList,
    pagination,
    isLoading: getAdvisorMutation.isPending
  };
} 