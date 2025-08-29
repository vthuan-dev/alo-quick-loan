import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/App';

interface ClientRouteGuardProps {
  children: React.ReactNode;
}

export const ClientRouteGuard: React.FC<ClientRouteGuardProps> = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuthContext();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Nếu là admin, chuyển hướng về admin dashboard
  if (isAdmin()) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Nếu chưa đăng nhập, chuyển hướng về login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nếu là client, cho phép truy cập
  return <>{children}</>;
};
