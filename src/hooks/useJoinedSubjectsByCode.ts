import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAuthState } from './useAuthState';
import { jwtDecode } from 'jwt-decode';
import { GetCurrentStudentUser } from '../api/Account/UserAPI';
import { GetJoinedSubjectsByCode } from '../api/student/StudentAPI';
import { IJoinedSubjectByCode } from '../interfaces/IJoinedSubject';

 type JwtPayload = { UserId?: number };

export const useJoinedSubjectsByCode = (subjectCode: string | null) => {
  const { accessToken } = getAuthState();
  const [studentId, setStudentId] = useState<number | null>(null);
  const [studentProfileId, setStudentProfileId] = useState<number | null>(null);

  useEffect(() => {
    try {
      const payload: JwtPayload = jwtDecode(accessToken ?? '');
      const id = payload?.UserId ?? null;
      setStudentId(id);
    } catch {
      setStudentId(null);
    }
  }, [accessToken]);

  useEffect(() => {
    const run = async () => {
      if (!studentId) return;
      try {
        const res = await GetCurrentStudentUser(studentId);
        const profileId = res?.studentDataDetailResponse?.id;
        setStudentProfileId(profileId ?? null);
      } catch {
        setStudentProfileId(null);
      }
    };
    run();
  }, [studentId]);

  const query = useQuery<IJoinedSubjectByCode[]>({
    queryKey: ['joined-subjects-by-code', studentProfileId, subjectCode],
    queryFn: () => GetJoinedSubjectsByCode(studentProfileId!, subjectCode!),
    enabled: !!studentProfileId && !!subjectCode && subjectCode.trim().length > 0,
    staleTime: 5 * 60 * 1000,
  });

  return {
    data: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error as any,
  };
};
