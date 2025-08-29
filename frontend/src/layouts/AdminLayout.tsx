import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { useAuthContext } from '@/App';

export const AdminLayout = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  // AdminRouteGuard đã kiểm tra quyền truy cập, không cần kiểm tra lại ở đây
  if (!user) {
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
