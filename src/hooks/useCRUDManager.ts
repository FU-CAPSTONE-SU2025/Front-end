import { useMutation } from '@tanstack/react-query';
import { pagedManagerData } from '../interfaces/IManager';
import { FetchManagerList } from '../api/manager/ManagerAPI';

interface PaginationParams {
  pageNumber: number;
  pageSize: number;
  searchQuery?: string;
  filterType?: string;
  filterValue?: string;
}

export default function useCRUDManager() {
  const getManagerMutation = useMutation<pagedManagerData | null, unknown, PaginationParams>({
    mutationFn: async (params: PaginationParams) => {
      const data = await FetchManagerList(
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

  const metaData = getManagerMutation.data || null;
  const managerList = metaData?.items || [];
  const pagination = metaData
    ? {
        current: metaData.pageNumber,
        pageSize: metaData.pageSize,
        total: metaData.totalCount,
        totalPages: Math.ceil(metaData.totalCount / metaData.pageSize),
      }
    : null;

  return {
    ...getManagerMutation,
    getAllManager: getManagerMutation.mutate,
    managerList,
    pagination,
  };
} 