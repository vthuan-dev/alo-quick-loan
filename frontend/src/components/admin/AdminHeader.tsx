import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useAuthContext } from '@/App';
import { useNotifications } from '@/contexts/NotificationContext';
import { ChangePasswordModal } from './ChangePasswordModal';
import { 
  User, 
  Settings, 
  LogOut, 
  Bell,
  Search,
  Check,
  CheckCheck,
  FileText,
  Clock,
  Volume2,
  VolumeX,
  Lock
} from 'lucide-react';

export const AdminHeader = () => {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, soundEnabled, toggleSound } = useNotifications();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      'SUPER_ADMIN': 'Super Admin',
      'ADMIN': 'Administrator',
      'SALES': 'Sales Staff',
      'SUPPORT': 'Support Staff'
    };
    return roleNames[role] || role;
  };

  const formatNotificationTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'NEW_LOAN_APPLICATION':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'LOAN_STATUS_UPDATE':
        return <Clock className="w-4 h-4 text-orange-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-3 md:px-6 py-4">
              <div className="flex items-center justify-between w-full">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <div 
            className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate('/admin/dashboard')}
          >
            <div className="text-center">
              <h1 className="text-2xl font-bold">
                <span className="text-red-500">15</span><span className="text-green-700">S</span>
              </h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Search Bar - Hide on Mobile */}
        <div className="hidden md:block flex-1 max-w-md mx-4 lg:mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm khoản vay, khách hàng..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Side - Notifications and User Menu */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Notifications */}
          <DropdownMenu open={notificationOpen} onOpenChange={setNotificationOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Thông báo</span>
                <div className="flex items-center space-x-2">
                  {/* Sound Toggle */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleSound}
                    className="h-6 px-2 text-xs"
                    title={soundEnabled ? "Tắt âm thanh thông báo" : "Bật âm thanh thông báo"}
                  >
                    {soundEnabled ? (
                      <Volume2 className="w-3 h-3 text-green-600" />
                    ) : (
                      <VolumeX className="w-3 h-3 text-gray-400" />
                    )}
                  </Button>
                  
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAllAsRead()}
                      className="h-6 px-2 text-xs"
                    >
                      <CheckCheck className="w-3 h-3 mr-1" />
                      Đọc tất cả
                    </Button>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Không có thông báo nào
                </div>
              ) : (
                notifications.slice(0, 10).map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className={`p-3 cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''}`}
                    onClick={() => {
                      if (!notification.isRead) {
                        markAsRead(notification.id);
                      }
                      setNotificationOpen(false);
                    }}
                  >
                    <div className="flex items-start space-x-3 w-full">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatNotificationTime(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))
              )}
              
              {notifications.length > 10 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      navigate('/admin/notifications');
                      setNotificationOpen(false);
                    }}
                    className="text-center justify-center"
                  >
                    Xem tất cả thông báo
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 pr-0 md:pr-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                  <p className="text-xs text-gray-500">{getRoleDisplayName(user?.role || '')}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/admin/profile')}>
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setChangePasswordOpen(true)}>
                <Lock className="w-4 h-4 mr-2" />
                Đổi mật khẩu
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/')}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Về trang chủ
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Change Password Modal */}
      <ChangePasswordModal 
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </header>
  );
};
