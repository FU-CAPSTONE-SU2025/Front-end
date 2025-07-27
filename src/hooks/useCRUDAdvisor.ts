import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { pagedAdvisorData } from '../interfaces/IAdvisor';
import { 
  BookingAvailability, 
  PagedBookingAvailabilityData, 
  CreateBookingAvailabilityRequest, 
  CreateBulkBookingAvailabilityRequest,
  UpdateBookingAvailabilityRequest
} from '../interfaces/IBookingAvailability';
import { 
  FetchAdvisorList, 
  FetchBookingAvailability, 
  CreateBookingAvailability, 
  CreateBulkBookingAvailability,
  UpdateBookingAvailability,
  DeleteBookingAvailability,
  GetBookingAvailabilityById
} from '../api/advisor/AdvisorAPI';

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
  const pagination = metaData ? {
    current: metaData.pageNumber,
    pageSize: metaData.pageSize,
    total: metaData.totalCount,
    totalPages: Math.ceil(metaData.totalCount / metaData.pageSize)
  } : null;
  
  return {
    ...getAdvisorMutation,
    getAllAdvisor: getAdvisorMutation.mutate,
    advisorList,
    pagination,
    isLoading: getAdvisorMutation.isPending
  }
}

export function useBookingAvailability() {
  const getBookingAvailabilityMutation = useMutation<BookingAvailability[], unknown, void>({
    mutationKey: ['bookingAvailability'],
    mutationFn: async () => {
      const data = await FetchBookingAvailability();
      return data;
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const allBookingAvailability = getBookingAvailabilityMutation.data || [];
  
  // Client-side pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const bookingAvailabilityList = allBookingAvailability.slice(startIndex, endIndex);
  
  const pagination = {
    current: currentPage,
    pageSize: pageSize,
    total: allBookingAvailability.length,
    totalPages: Math.ceil(allBookingAvailability.length / pageSize),
  };

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  return {
    ...getBookingAvailabilityMutation,
    getAllBookingAvailability: getBookingAvailabilityMutation.mutate,
    bookingAvailabilityList,
    pagination,
    isLoading: getBookingAvailabilityMutation.isPending,
    handlePageChange
  };
}

export function useCreateBookingAvailability() {
  const queryClient = useQueryClient();
  
  return useMutation<BookingAvailability | null, unknown, CreateBookingAvailabilityRequest>({
    mutationFn: async (data) => {
      const result = await CreateBookingAvailability(data);
      return result;
    },
    onSuccess: () => {
      // Invalidate and refetch booking availability data
      queryClient.invalidateQueries({ queryKey: ['bookingAvailability'] });
    },
    onError: (error) => {
      console.error('Failed to create booking availability:', error);
    },
  });
}

export function useCreateBulkBookingAvailability() {
  const queryClient = useQueryClient();
  
  return useMutation<BookingAvailability[] | null, unknown, CreateBulkBookingAvailabilityRequest>({
    mutationFn: async (data) => {
      const result = await CreateBulkBookingAvailability(data);
      return result;
    },
    onSuccess: () => {
      // Invalidate and refetch booking availability data
      queryClient.invalidateQueries({ queryKey: ['bookingAvailability'] });
    },
    onError: (error) => {
      console.error('Failed to create bulk booking availability:', error);
    },
  });
}

export function useUpdateBookingAvailability() {
  const queryClient = useQueryClient();
  
  return useMutation<BookingAvailability | null, unknown, { id: number; data: UpdateBookingAvailabilityRequest }>({
    mutationFn: async ({ id, data }) => {
      const result = await UpdateBookingAvailability(id, data);
      return result;
    },
    onSuccess: () => {
      // Invalidate and refetch booking availability data
      queryClient.invalidateQueries({ queryKey: ['bookingAvailability'] });
    },
    onError: (error) => {
      console.error('Failed to update booking availability:', error);
    },
  });
}

export function useDeleteBookingAvailability() {
  const queryClient = useQueryClient();
  
  return useMutation<boolean, unknown, number>({
    mutationFn: async (id) => {
      const result = await DeleteBookingAvailability(id);
      return result;
    },
    onSuccess: () => {
      // Invalidate and refetch booking availability data
      queryClient.invalidateQueries({ queryKey: ['bookingAvailability'] });
    },
    onError: (error) => {
      console.error('Failed to delete booking availability:', error);
    },
  });
}

export function useGetBookingAvailabilityById(id: number | null) {
  return useQuery<BookingAvailability | null>({
    queryKey: ['bookingAvailability', id],
    queryFn: async () => {
      if (!id) return null;
      const result = await GetBookingAvailabilityById(id);
      return result;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
} 