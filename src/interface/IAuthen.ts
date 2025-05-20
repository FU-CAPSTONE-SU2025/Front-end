export interface AuthState {
    isAuthenticated: boolean;
    userRole: string | null;
    login: () => void;
    logout: () => void;
    setUserRole: (role: string) => void;
  };

  export interface ProtectedRouteProps {
    component: React.ComponentType;
    allowedRoles: string[];
  }