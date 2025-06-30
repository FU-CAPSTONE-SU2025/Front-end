import { useMutation } from '@tanstack/react-query';
import { pagedStaffData } from '../interfaces/IStaff';
import { FetchStaffList } from '../api/staff/StaffAPI';

interface PaginationParams {
  pageNumber: number;
  pageSize: number;
  searchQuery?: string;
  filterType?: string;
  filterValue?: string;
}

export default function useCRUDStaff() {
   const getStaffMutation = useMutation<pagedStaffData|null, unknown, PaginationParams>({
    mutationFn: async (params: PaginationParams) => {
      const data = await FetchStaffList(
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
  
  const metaData = getStaffMutation.data || null;
  const staffList = metaData?.items || [];
  const pagination = metaData ? {
    current: metaData.pageNumber,
    pageSize: metaData.pageSize,
    total: metaData.totalCount,
    totalPages: Math.ceil(metaData.totalCount / metaData.pageSize)
  } : null;
  
  return {
    ...getStaffMutation,
    getAllStaff: getStaffMutation.mutate,
    staffList,
    pagination
  }
}

