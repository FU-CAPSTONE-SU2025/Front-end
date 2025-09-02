import { useMemo } from 'react';
import { getAuthState } from './useAuthState';
import { jwtDecode } from 'jwt-decode';

// Minimal advisor info derived from JWT
export interface AdvisorJwtInfo {
  userId: number | null;
  username?: string | null;
  email?: string | null;
  roles?: string[];
  firstName?: string | null;
  lastName?: string | null;
}

export const useCurrentAdvisor = (): AdvisorJwtInfo => {
  const { accessToken } = getAuthState();

  return useMemo(() => {
    try {
      if (!accessToken) return { userId: null, username: null, email: null, roles: [], firstName: null, lastName: null };
      const payload: any = jwtDecode(accessToken);
      const userId: number | null = payload?.UserId ?? null;
      const username: string | null = payload?.unique_name ?? payload?.name ?? null;
      const email: string | null = payload?.email ?? payload?.Email ?? null;
      const roles: string[] = Array.isArray(payload?.role)
        ? payload.role
        : payload?.role
        ? [payload.role]
        : [];
      const firstName: string | null = payload?.firstName ?? payload?.FirstName ?? payload?.given_name ?? null;
      const lastName: string | null = payload?.lastName ?? payload?.LastName ?? payload?.family_name ?? null;
      return { userId, username, email, roles, firstName, lastName };
    } catch {
      return { userId: null, username: null, email: null, roles: [], firstName: null, lastName: null };
    }
  }, [accessToken]);
};
