import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { AuthSettings } from '../types/schema';

interface AuthContextValue {
  isAuthenticated: boolean;
  isAuthRequired: boolean;
  authSettings: AuthSettings | null;
  authenticate: (password: string) => Promise<boolean>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const AUTH_SESSION_KEY = 'demoscript-auth-session';

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

interface AuthProviderProps {
  children: ReactNode;
  authSettings?: AuthSettings;
}

export function AuthProvider({ children, authSettings }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthRequired = authSettings?.enabled === true && (authSettings.password || authSettings.password_hash);

  // Check for existing session on mount
  useEffect(() => {
    if (!isAuthRequired) {
      setIsAuthenticated(true);
      return;
    }

    const session = sessionStorage.getItem(AUTH_SESSION_KEY);
    if (session) {
      try {
        const { hash, timestamp } = JSON.parse(session);
        // Session valid for 24 hours
        const isValid = Date.now() - timestamp < 24 * 60 * 60 * 1000;
        if (isValid && hash) {
          // Verify session hash matches expected
          const expectedHash = authSettings?.password_hash || '';
          if (hash === expectedHash || !authSettings?.password_hash) {
            setIsAuthenticated(true);
          }
        }
      } catch {
        sessionStorage.removeItem(AUTH_SESSION_KEY);
      }
    }
  }, [isAuthRequired, authSettings?.password_hash]);

  const authenticate = useCallback(async (password: string): Promise<boolean> => {
    setError(null);

    if (!authSettings) {
      setIsAuthenticated(true);
      return true;
    }

    try {
      const inputHash = await hashPassword(password);

      // Check against password_hash (preferred for static builds)
      if (authSettings.password_hash) {
        if (inputHash === authSettings.password_hash) {
          setIsAuthenticated(true);
          sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({
            hash: inputHash,
            timestamp: Date.now()
          }));
          return true;
        }
      }

      // Check against plaintext password (dev mode)
      if (authSettings.password) {
        const expectedHash = await hashPassword(authSettings.password);
        if (inputHash === expectedHash) {
          setIsAuthenticated(true);
          sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({
            hash: inputHash,
            timestamp: Date.now()
          }));
          return true;
        }
      }

      setError('Incorrect password');
      return false;
    } catch (err) {
      setError('Authentication error');
      console.error('Auth error:', err);
      return false;
    }
  }, [authSettings]);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(AUTH_SESSION_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isAuthRequired: !!isAuthRequired,
      authSettings: authSettings || null,
      authenticate,
      logout,
      error
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
