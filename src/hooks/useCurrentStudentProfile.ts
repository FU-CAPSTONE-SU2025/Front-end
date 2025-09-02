import { useEffect, useState } from 'react';
import { getAuthState } from './useAuthState';
import { jwtDecode } from 'jwt-decode';
import { GetCurrentStudentUser } from '../api/Account/UserAPI';

 type JwtPayload = { UserId?: number };

export const useCurrentStudentProfile = () => {
  const { accessToken } = getAuthState();
  const [studentId, setStudentId] = useState<number | null>(null);
  const [studentDetail, setStudentDetail] = useState<any | null>(null);
  const [studentProfileId, setStudentProfileId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
    const fetchDetail = async () => {
      if (!studentId) return;
      setIsLoading(true);
      try {
        const res = await GetCurrentStudentUser(studentId);
        setStudentDetail(res);
        const profileId = res?.studentDataDetailResponse?.id;
        setStudentProfileId(profileId ?? null);
      } catch (e) {
        setStudentDetail(null);
        setStudentProfileId(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [studentId]);

  return { studentDetail, studentProfileId, isLoading };
};
