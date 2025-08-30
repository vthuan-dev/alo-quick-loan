import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/App';
import { 
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Settings,
  UserPlus,
  Shield,
  TrendingUp,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { api, AdminDashboardStats } from '@/lib/api';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
  badge?: string;
}

export const AdminSidebar = () => {
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

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen hidden md:block">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Admin Menu</h2>
        
        <nav className="space-y-2">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
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

        {/* Quick Stats */}
        {/* <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Stats</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Khoản vay hôm nay</span>
              <span className="font-medium text-primary">5</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Chờ xét duyệt</span>
              <span className="font-medium text-yellow-600">12</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Đã phê duyệt</span>
              <span className="font-medium text-green-600">8</span>
            </div>
          </div>
        </div> */}
      </div>
    </aside>
  );
};
