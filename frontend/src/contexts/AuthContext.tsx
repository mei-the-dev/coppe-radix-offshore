import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { auth, getAuthToken, setAuthToken } from '../api/client';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const BYPASS_LOGIN = import.meta.env.DEV && import.meta.env.VITE_BYPASS_LOGIN === 'true';
const DEV_BYPASS_TOKEN = 'dev-bypass-token';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (BYPASS_LOGIN) {
      setAuthToken(DEV_BYPASS_TOKEN);
      setIsAuthenticated(true);
      setLoading(false);
      return;
    }

    // Check if we have a token on mount
    const token = getAuthToken();
    if (token) {
      // Verify token is still valid by checking expiration
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp > now) {
          setIsAuthenticated(true);
        } else {
          // Token expired, remove it
          setAuthToken(null);
          setIsAuthenticated(false);
        }
      } catch {
        // Invalid token, remove it
        setAuthToken(null);
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    if (BYPASS_LOGIN) {
      setAuthToken(DEV_BYPASS_TOKEN);
      setIsAuthenticated(true);
      return;
    }
    try {
      await auth.login(username, password);
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
      throw error;
    }
  };

  const logout = () => {
    auth.logout();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
