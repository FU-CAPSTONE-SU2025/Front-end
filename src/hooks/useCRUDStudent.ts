
import { GetAllStudent } from '../api/student/StudentAPI'
import { useMutation } from '@tanstack/react-query';
import { pagedStudentData, StudentBase } from '../interfaces/IStudent';

interface PaginationParams {
  pageNumber: number;
  pageSize: number;
  filterType?: string;
  filterValue?: string;
  search?:string
}

export default function useCRUDStudent() {
   const getStudentMutation = useMutation<pagedStudentData|null, unknown, PaginationParams>({
    mutationFn: async (params: PaginationParams) => {
      const data = await GetAllStudent(
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


  // The mutation signature was incorrect for useMutation. 
  // useMutation expects the third generic parameter to be the variables object passed to the mutation function.
  // To fix, wrap the parameters in a single object and type accordingly.

  type UpdateStudentScoreParams = { studentId: number; subjectId: number; score: number };

  const updateStudentScoreMutation = useMutation<StudentBase | number, unknown, UpdateStudentScoreParams>({
    mutationFn: async ({ studentId, subjectId, score }) => {
      // const data = await UpdateStudentScore(studentId, subjectId, score);
      throw Error("Not yet working");
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
    pagination,
    isLoading: getStudentMutation.isPending,
    updateStudentScoreMutation
  }
}

