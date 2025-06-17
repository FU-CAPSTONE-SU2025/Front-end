export interface AuthState {
    isAuthenticated: boolean;
    userRole: string | number | null;
    login: () => void;
    logout: () => void;
    setUserRole: (role: number|string) => void;
  };
  export interface TokenState {
    accessToken: string | null;
    refreshToken: string | null;
    // Methods to manage tokens
    setAccessToken: (token: string) => void;
    removeAccessToken: () => void;
    setRefreshToken: (token: string) => void;
    removeRefreshToken: () => void;

  };
  export interface TokenProps {
    accessToken: string;
    refreshToken: string;
  }

  export interface ProtectedRouteProps {
    component: React.ComponentType;
    allowedRoles: string[];
  }