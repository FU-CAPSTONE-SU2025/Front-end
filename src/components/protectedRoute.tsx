// src/router/authLoader.ts
import { redirect } from 'react-router';
import { getAuthState } from '../hooks/useAuths';
import { jwtDecode } from 'jwt-decode';

export const protectedLoader = (allowedRoles: string[]) => {
  // Role code as follows:
  // 1. Admin -> 1
  // 2. Staff -> 2
  // 3. Advisor -> 3
  // 4. Manager -> 4
  // 5. Student -> 5
  return () => {
    // const { userRole,accessToken } = getAuthState();
    // console.log("Protected Route Check: ", userRole);
    // if( userRole && !allowedRoles.includes(userRole.toString()) || !accessToken) {
    //    return redirect('/404');
    // }
    // if (!userRole) {
    //   const tokenData = jwtDecode(accessToken)
    //   return redirect('/404');
    // }
    // NOTE: Uncommment these code above in production, they are for protection, duh

    return null; // Proceed to render the route
  };
};