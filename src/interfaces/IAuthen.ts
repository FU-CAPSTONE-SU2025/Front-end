export interface AuthState {
    isAuthenticated: boolean;
    userRole: string | number | null;
     accessToken: string | null;
    refreshToken: string | null;
    // Methods to manage tokens
    setAccessToken: (token: string) => void;
    setRefreshToken: (token: string) => void;
    login: (roleId:number) => void;
    logout: () => void;
  };
  export interface TokenProps {
    accessToken: string;
    refreshToken: string;
  }

  export interface ProtectedRouteProps {
    component: React.ComponentType;
    allowedRoles: string[];
  }