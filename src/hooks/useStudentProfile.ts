import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAuthState } from './useAuthState';
import { jwtDecode } from 'jwt-decode';
import { GetCurrentStudentUser } from '../api/Account/UserAPI';

export const useStudentProfile = () => {
  const [studentId, setStudentId] = useState<number | null>(null);
  const [studentProfileId, setStudentProfileId] = useState<number | null>(null);
  const { accessToken } = getAuthState();

  // Extract student ID from JWT token
  useEffect(() => {
    try {
      if (accessToken) {
        const payload: any = jwtDecode(accessToken);
        const userId = payload?.UserId ?? null;
        setStudentId(userId);
      }
    } catch (error) {
      console.error('Failed to decode JWT token:', error);
      setStudentId(null);
    }
  }, [accessToken]);

  // Fetch student details and get studentProfileId
  const { data: studentDetail, isLoading, error } = useQuery({
    queryKey: ['studentDetail', studentId],
    queryFn: async () => {
      if (!studentId) return null;
      const res = await GetCurrentStudentUser(studentId);
      return res;
    },
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
  });

  // Update studentProfileId when studentDetail changes
  useEffect(() => {
    if (studentDetail?.studentDataDetailResponse?.id) {
      setStudentProfileId(studentDetail.studentDataDetailResponse.id);
    } else {
      setStudentProfileId(null);
    }
  }, [studentDetail]);

  return {
    studentId,
    studentProfileId,
    studentDetail,
    isLoading,
    error,
    refetch: () => {
      // This will trigger a refetch of the student detail
      return Promise.resolve();
    }
  };
};
