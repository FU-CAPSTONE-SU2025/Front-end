import React from 'react'
import { GetAllStudent } from '../api/student/StudentAPI'
import { useMutation } from '@tanstack/react-query';
import { pagedStudentData, StudentBase } from '../interfaces/IStudent';

interface PaginationParams {
  pageNumber: number;
  pageSize: number;
  searchQuery?: string;
  filterType?: string;
  filterValue?: string;
}

export default function useCRUDStudent() {
   const getStudentMutation = useMutation<pagedStudentData|null, unknown, PaginationParams>({
    mutationFn: async (params: PaginationParams) => {
      const data = await GetAllStudent(
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
  
  const metaData = getStudentMutation.data || null;
  const studentList = metaData?.items || [];
  const pagination = metaData ? {
    current: metaData.pageNumber,
    pageSize: metaData.pageSize,
    total: metaData.totalCount,
    totalPages: Math.ceil(metaData.totalCount / metaData.pageSize)
  } : null;
  
  return {
    ...getStudentMutation,
    getAllStudent: getStudentMutation.mutate,
    studentList,
    pagination
  }
}

