import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/App';

interface PublicRouteGuardProps {
  children: React.ReactNode;
}

export const PublicRouteGuard: React.FC<PublicRouteGuardProps> = ({ children }) => {
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

  // Nếu là admin và đang cố truy cập trang chủ, chuyển hướng về admin dashboard
  if (isAdmin()) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Nếu là client đã đăng nhập và đang truy cập trang chủ, cho phép truy cập
  // Nếu chưa đăng nhập, cũng cho phép truy cập trang chủ
  return <>{children}</>;
};
