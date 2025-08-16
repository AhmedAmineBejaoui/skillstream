import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { User, LoginRequest, RegisterRequest, AuthResponse } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem('accessToken')
  );
  const queryClient = useQueryClient();

  // Get current user
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/users/me'],
    enabled: !!accessToken,
    retry: false
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: api.login,
    onSuccess: (data: AuthResponse) => {
      setAccessToken(data.accessToken);
      localStorage.setItem('accessToken', data.accessToken);
      queryClient.setQueryData(['/api/users/me'], data.user);
    }
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: api.register,
    onSuccess: (data: AuthResponse) => {
      setAccessToken(data.accessToken);
      localStorage.setItem('accessToken', data.accessToken);
      queryClient.setQueryData(['/api/users/me'], data.user);
    }
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: api.logout,
    onSuccess: () => {
      setAccessToken(null);
      localStorage.removeItem('accessToken');
      queryClient.clear();
    }
  });

  const login = async (data: LoginRequest) => {
    await loginMutation.mutateAsync(data);
  };

  const register = async (data: RegisterRequest) => {
    await registerMutation.mutateAsync(data);
  };

  const logout = () => {
    logoutMutation.mutate();
  };

  // Set up axios interceptor for token refresh
  useEffect(() => {
    const interceptor = async (response: Response) => {
      if (response.status === 401 && accessToken) {
        try {
          const { accessToken: newToken } = await api.refreshToken();
          setAccessToken(newToken);
          localStorage.setItem('accessToken', newToken);
          return true; // Retry the request
        } catch (error) {
          logout();
          return false;
        }
      }
      return false;
    };

    // This would be handled by the query client in a real implementation
    // For now, we'll handle token refresh manually
  }, [accessToken]);

  const value: AuthContextType = {
    user: (user as User) || null,
    login,
    register,
    logout,
    isLoading: isLoading || loginMutation.isPending || registerMutation.isPending,
    isAuthenticated: !!(user as User)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
