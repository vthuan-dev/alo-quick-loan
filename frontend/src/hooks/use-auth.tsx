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
    const adminToken = localStorage.getItem('adminAccessToken');
    
    if (accessToken && userEmail) {
      // Client user
      setUser({ email: userEmail, accessToken, role: 'CLIENT' });
    } else if (adminToken) {
      // Admin user - get from admin storage
      const adminData = localStorage.getItem('adminUserData');
      if (adminData) {
        try {
          const adminUser = JSON.parse(adminData);
          setUser(adminUser);
        } catch (error) {
          console.error('Error parsing admin data:', error);
          localStorage.removeItem('adminAccessToken');
          localStorage.removeItem('adminUserData');
        }
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    
    if (userData.role && ['SUPER_ADMIN', 'ADMIN', 'SALES', 'SUPPORT'].includes(userData.role)) {
      // Admin user
      localStorage.setItem('adminAccessToken', userData.accessToken);
      localStorage.setItem('adminUserData', JSON.stringify(userData));
      // Clear client tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userEmail');
    } else {
      // Client user
      localStorage.setItem('accessToken', userData.accessToken);
      localStorage.setItem('userEmail', userData.email);
      // Clear admin tokens
      localStorage.removeItem('adminAccessToken');
      localStorage.removeItem('adminUserData');
    }
  };

  const logout = () => {
    setUser(null);
    // Clear all tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('adminAccessToken');
    localStorage.removeItem('adminUserData');
  };

  const isAuthenticated = !!user;
  
  // Helper functions for role checking
  const isAdmin = () => {
    return user?.role && ['SUPER_ADMIN', 'ADMIN', 'SALES', 'SUPPORT'].includes(user.role);
  };
  
  const isClient = () => {
    return user?.role === 'CLIENT' || (!user?.role && user?.email);
  };
  
  const hasPermission = (permission: string) => {
    if (!user?.permissions) return false;
    return user.permissions.includes('*') || user.permissions.includes(permission);
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    isClient,
    hasPermission,
    login,
    logout,
  };
};
