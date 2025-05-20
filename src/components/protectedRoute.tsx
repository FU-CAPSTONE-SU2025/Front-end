// src/router/authLoader.ts
import { redirect } from 'react-router';
import { getAuthState } from '../hooks/useAuths';

export const protectedLoader = (allowedRoles: string[]) => {
  return () => {
    const { isAuthenticated, userRole } = getAuthState();

    if (!isAuthenticated) {
      return redirect('/login');
    }

    if (userRole && !allowedRoles.includes(userRole)) {
      return redirect('/404');
    }

    return null; // Proceed to render the route
  };
};