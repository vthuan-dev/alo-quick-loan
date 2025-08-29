import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { useAuthContext } from '@/App';

export const AdminLayout = () => {
  const { isAuthenticated, user } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/admin/login');
      return;
    }

    // Check if user has admin role
    if (!user.role || !['SUPER_ADMIN', 'ADMIN', 'SALES', 'SUPPORT'].includes(user.role)) {
      navigate('/');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
