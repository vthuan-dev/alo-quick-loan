import React, { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { MobileAdminNav } from '@/components/admin/MobileAdminNav';
import { useAuthContext } from '@/App';
import { NotificationProvider } from '@/contexts/NotificationContext';

export const AdminLayout = () => {
  const { user, isAuthenticated, isLoading } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in but not as admin
    if (!isLoading && isAuthenticated && user && !['SUPER_ADMIN', 'ADMIN', 'SALES', 'SUPPORT'].includes(user.role || '')) {
      // Redirect non-admin users to customer dashboard
      navigate('/');
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  // If loading auth status, show loading spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Check if the user has admin role
  const isAdmin = user && ['SUPER_ADMIN', 'ADMIN', 'SALES', 'SUPPORT'].includes(user.role || '');
  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <NotificationProvider>
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Header */}
        <div className="flex items-center bg-white border-b border-gray-200">
          <div className="flex md:hidden items-center">
            <MobileAdminNav />
          </div>
          <div className="flex-1">
            <AdminHeader />
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <AdminSidebar />

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
};