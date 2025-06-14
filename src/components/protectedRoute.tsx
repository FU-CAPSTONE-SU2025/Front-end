// src/router/authLoader.ts
import { redirect } from 'react-router';
import { getAuthState } from '../hooks/useAuths';

export const protectedLoader = (allowedRoles: string[]) => {
  return () => {
    const { isAuthenticated, userRole } = getAuthState();
    console.log("Protected Route Check: ", isAuthenticated, userRole);
    if (!isAuthenticated) {
      return redirect('/');
    }

    if (!userRole || !allowedRoles.includes(userRole)) {
      return redirect('/404');
    }
    // NOTE: Uncommment these code above in production, they are for protection, duh

    return null; // Proceed to render the route
  };
};