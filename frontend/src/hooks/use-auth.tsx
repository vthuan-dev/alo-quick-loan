import { useState, useEffect } from 'react';

interface User {
  id?: string;
  email: string;
  fullName?: string;
  accessToken: string;
  role?: string;
  permissions?: string[];
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập từ localStorage
    const accessToken = localStorage.getItem('accessToken');
    const userEmail = localStorage.getItem('userEmail');
    
    if (accessToken && userEmail) {
      setUser({ email: userEmail, accessToken });
    }
    
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('accessToken', userData.accessToken);
    localStorage.setItem('userEmail', userData.email);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('rememberMe');
  };

  const isAuthenticated = !!user;

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
  };
};
