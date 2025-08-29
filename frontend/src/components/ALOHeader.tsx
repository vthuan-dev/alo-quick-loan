import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/App";
import { User, LogOut } from "lucide-react";

export const ALOHeader = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, isAdmin } = useAuthContext();

  const handleLogin = () => {
    navigate('/login');
  };

  const handlePayment = () => {
    // TODO: Implement payment logic
    console.log('Payment button clicked');
  };

  const handleLogout = () => {
    // Xóa session và refresh token
    logout();
    
    // Xóa tất cả localStorage items liên quan đến authentication
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('loanApplicationId');
    localStorage.removeItem('existingApplicationStep');
    
    // Xóa tất cả sessionStorage items
    sessionStorage.clear();
    
    // Xóa tất cả cookies (nếu có)
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    // Làm mới lại trang web
    window.location.reload();
    
    // Chuyển hướng về trang chủ
    navigate('/');
  };

  const handleUserClick = () => {
    // Khi click vào thông tin user, chuyển đến trang quản lý khoản vay
    navigate('/loan-management');
  };

  const handleLogoClick = () => {
    // Khi click vào logo, quay về trang chủ
    navigate('/');
  };

  return (
    <header className="w-full bg-orange-50 shadow-sm sticky top-0 z-50">
      {/* Hotline Bar */}
      <div className="w-full bg-primary text-primary-foreground py-2 text-center text-sm font-medium">
        ʜᴏтʟɪпᴇ / zɑʟᴏ : 0815.320.648 - 0927.996.903
      </div>
      
      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleLogoClick}
            title="Click để về trang chủ"
          >
            <div className="text-center">
              <h1 className="text-4xl font-bold">
                <span className="text-red-500">15</span><span className="text-green-700">S</span>
              </h1>
              <p className="text-sm text-muted-foreground">Tiền về liền tay</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-foreground hover:text-primary transition-colors">Trang chủ</a>
            <a href="/support" className="text-foreground hover:text-primary transition-colors">Trung tâm hỗ trợ</a>
            <a href="/about" className="text-foreground hover:text-primary transition-colors">Về chúng tôi</a>
            <a href="/contact" className="text-foreground hover:text-primary transition-colors">Liên hệ</a>
            <a href="/complaints" className="text-foreground hover:text-primary transition-colors">Khiếu nại</a>
            <a href="/news" className="text-foreground hover:text-primary transition-colors">Tin tức</a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {/* Nếu là admin, hiển thị link đến admin panel */}
            {isAdmin() && (
              <Button 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary hover:text-white"
                onClick={() => navigate('/admin/dashboard')}
              >
                Admin Panel
              </Button>
            )}
            
            {/* <Button 
              variant="default" 
              className="bg-success hover:bg-success/90"
              onClick={handlePayment}
            >
              Thanh Toán
            </Button> */}
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <div 
                  className="flex items-center space-x-2 px-3 py-2 bg-primary/10 rounded-lg cursor-pointer hover:bg-primary/20 transition-colors"
                  onClick={handleUserClick}
                  title="Click để xem quản lý khoản vay"
                >
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-sm text-primary font-medium">
                    {user?.email}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  className="border-primary text-primary hover:bg-primary hover:text-white"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Đăng xuất
                </Button>
              </div>
            ) : (
              <Button 
                variant="default" 
                className="bg-primary hover:bg-primary/90"
                onClick={handleLogin}
              >
                Đăng Nhập
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};