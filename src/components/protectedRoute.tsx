// src/router/authLoader.ts
import { redirect } from 'react-router';
import { getAuthState } from '../hooks/useAuthState';

export const protectedLoader = (allowedRoles: string[]) => {
  return () => {
    const { userRole,accessToken } = getAuthState();
    if (!userRole) {
      return redirect('/404');
    }
     if( userRole && !allowedRoles.includes(userRole.toString()) || !accessToken) {
       return redirect('/404');
    }
    if(sessionStorage.getItem("auth-storage")==null){
      alert("Your session has expired, please login again.")
      return redirect('/');
    }
    // NOTE: Uncommment these code above in production, they are for protection, duh
    return true; // Proceed to render the route
  };
};