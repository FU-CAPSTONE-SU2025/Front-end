import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { pagedAdvisorData } from '../interfaces/IAdvisor';
import { 
  BookingAvailability, 
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
  search?: string;
}

export default function useCRUDAdvisor() {
  const getAdvisorMutation = useMutation<pagedAdvisorData | null, unknown, PaginationParams>({
    mutationFn: async (params: PaginationParams) => {
      const data = await FetchAdvisorList(
        params.pageNumber, 
        params.pageSize, 
        params.search,
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

export function useBookingAvailability(pageSize: number = 100) {
  const getBookingAvailabilityQuery = useQuery<BookingAvailability[], Error>({
    queryKey: ['bookingAvailability', pageSize],
    queryFn: async () => {
      console.log('useBookingAvailability - Fetching data with pageSize:', pageSize);
      const data = await FetchBookingAvailability();
      console.log('useBookingAvailability - Data fetched:', data.length, 'items');
      return data;
    },
  });

  // Ensure allBookingAvailability is always an array
  const allBookingAvailability = Array.isArray(getBookingAvailabilityQuery.data) 
    ? getBookingAvailabilityQuery.data 
    : [];
  
  // Sort data by day of week (Monday = 2, Sunday = 1) and time
  const sortedAllBookingAvailability = [...allBookingAvailability].sort((a, b) => {
    // Convert Sunday from 1 to 8 for proper sorting (Monday=2, Tuesday=3, ..., Sunday=8)
    const dayA = a.dayInWeek === 1 ? 8 : a.dayInWeek;
    const dayB = b.dayInWeek === 1 ? 8 : b.dayInWeek;
    
    // First sort by day of week (Monday first)
    if (dayA !== dayB) {
      return dayA - dayB;
    }
    
    // If same day, sort by start time (earliest first)
    const timeA = a.startTime;
    const timeB = b.startTime;
    
    // Convert time strings to comparable values
    const timeAValue = parseInt(timeA.replace(':', ''));
    const timeBValue = parseInt(timeB.replace(':', ''));
    
    return timeAValue - timeBValue;
  });
  
  // Client-side pagination
  const [currentPage, setCurrentPage] = useState(1);
  
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const bookingAvailabilityList = sortedAllBookingAvailability.slice(startIndex, endIndex);
  
  const pagination = {
    current: currentPage,
    pageSize: pageSize,
    total: sortedAllBookingAvailability.length,
    totalPages: Math.ceil(sortedAllBookingAvailability.length / pageSize),
  };

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
  };

  return {
    ...getBookingAvailabilityQuery,
    getAllBookingAvailability: getBookingAvailabilityQuery.refetch,
    bookingAvailabilityList,
    allSortedData: sortedAllBookingAvailability, // Add full sorted data
    pagination,
    isLoading: getBookingAvailabilityQuery.isPending,
    handlePageChange,
    refetch: getBookingAvailabilityQuery.refetch
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
      // Debug: Log before invalidating
      console.log('CreateBookingAvailability - Invalidating queries...');
      // Invalidate all booking availability queries (including different pageSize)
      queryClient.invalidateQueries({ queryKey: ['bookingAvailability'] });
      console.log('CreateBookingAvailability - Queries invalidated');
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
      // Debug: Log before invalidating
      console.log('CreateBulkBookingAvailability - Invalidating queries...');
      // Invalidate all booking availability queries (including different pageSize)
      queryClient.invalidateQueries({ queryKey: ['bookingAvailability'] });
      console.log('CreateBulkBookingAvailability - Queries invalidated');
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
      // Invalidate all booking availability queries (including different pageSize)
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
      // Invalidate all booking availability queries (including different pageSize)
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