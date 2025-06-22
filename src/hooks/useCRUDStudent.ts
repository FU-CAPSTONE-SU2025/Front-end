import React from 'react'
import { GetAllStudent } from '../api/student/StudentAPI'
import { useMutation } from '@tanstack/react-query';
import { pagedStudentData, StudentBase } from '../interfaces/IStudent';



export default function useCRUDStudent() {

   const getStudentMutation = useMutation<pagedStudentData|null, unknown, void>({
    mutationFn: async () => {
      const data = await GetAllStudent();
      // If API returns a single student, wrap in array
      if (!data) return null;
      return data;
    },
    onError: (error) => {
      // Handle error if needed
       console.error(error);
    },
  });
  const metaData = getStudentMutation.data? getStudentMutation.data : null
  const studentList = metaData?.items ?? []
  return {
    ...getStudentMutation,
    getAllStudent : getStudentMutation.mutate,
    studentList
  }
}

