import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Settings,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/App';
import { api, AdminDashboardStats } from '@/lib/api';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
  badge?: string;
}

export const MobileAdminNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthContext();
  const [stats, setStats] = React.useState<AdminDashboardStats | null>(null);

  React.useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('adminAccessToken') || '';
        if (!token) return;
        const s = await api.getAdminStatistics(token);
        setStats(s);
      } catch (e) {
        // ignore
      }
    };
    load();
  }, []);

  const hasPermission = (permission: string) => {
    if (!user?.permissions) return false;
    return user.permissions.includes('*') || user.permissions.includes(permission);
  };

  // Kiểm tra xem user có phải là admin không
  if (!user || !['SUPER_ADMIN', 'ADMIN', 'SALES', 'SUPPORT'].includes(user.role || '')) {
    return null; // Không hiển thị sidebar nếu không phải admin
  }

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Quản lý khoản vay',
      href: '/admin/loans',
      icon: FileText,
      permission: 'loan:read',
      badge: stats ? String((stats as any).pendingLoans ?? 0) : undefined
    },
    {
      label: 'Quản lý khách hàng',
      href: '/admin/customers',
      icon: Users,
      permission: 'customer:read',
    },
    {
      label: 'Báo cáo & Thống kê',
      href: '/admin/reports',
      icon: BarChart3,
      permission: 'loan:read',
    },
    {
      label: 'Quản lý admin',
      href: '/admin/admins',
      icon: Shield,
      permission: 'admin:read',
    },
    {
      label: 'Cài đặt hệ thống',
      href: '/admin/settings',
      icon: Settings,
      permission: 'admin:write',
    },
  ];

  const filteredNavItems = navItems.filter(item => 
    !item.permission || hasPermission(item.permission)
  );

  const handleNavigation = (href: string) => {
    navigate(href);
    setIsOpen(false);
  };

  return (
    <div className="md:hidden">
      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 hover:text-primary focus:outline-none"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Navigation Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex">
          <div className="bg-white w-64 h-full overflow-y-auto shadow-lg animate-slide-in-left">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center">
                <h2 className="text-lg font-bold">
                  <span className="text-red-500">15</span>
                  <span className="text-green-700">S</span>
                  <span className="text-gray-700 ml-2">Menu</span>
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <nav className="p-4 space-y-1">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <button
                    key={item.href}
                    onClick={() => handleNavigation(item.href)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 text-left rounded-lg transition-colors",
                      isActive
                        ? "bg-primary text-white shadow-sm"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={cn(
                        "w-5 h-5",
                        isActive ? "text-white" : "text-gray-500"
                      )} />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    
                    {item.badge && (
                      <span className={cn(
                        "px-2 py-1 text-xs font-medium rounded-full",
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-primary/10 text-primary"
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};
