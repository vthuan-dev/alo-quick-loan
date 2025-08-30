import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/App";
import { User, LogOut, Menu, X, Phone } from "lucide-react";
import { useState } from "react";

export const ALOHeader = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, isAdmin } = useAuthContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navigationItems = [
    { href: "/", label: "Trang chủ" },
    { href: "/support", label: "Trung tâm hỗ trợ" },
    { href: "/about", label: "Về chúng tôi" },
    { href: "/contact", label: "Liên hệ" },
    { href: "/complaints", label: "Khiếu nại" },
    { href: "/news", label: "Tin tức" },
  ];

  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-50">
      {/* Top Gradient Border */}
      <div className="w-full h-1 bg-gradient-to-r from-orange-400 to-yellow-400"></div>
      
      {/* Hotline Bar - Only on Desktop */}
      <div className="hidden md:block w-full bg-primary text-primary-foreground py-2 text-center text-sm font-medium">
        <div className="flex items-center justify-center space-x-2">
          <Phone className="w-4 h-4" />
          <span>ʜᴏтʟɪпᴇ / zɑʟᴏ : 0815.320.648 - 0927.996.903</span>
        </div>
      </div>
      
             {/* Main Header */}
       <div className="container mx-auto px-4 py-5">
                 <div className="flex items-center justify-between relative">
           {/* Mobile: Hamburger Menu */}
           <div className="md:hidden">
             <Button
               variant="ghost"
               size="sm"
               className="p-1 text-orange-500 hover:text-orange-600"
               onClick={toggleMobileMenu}
               aria-label="Toggle mobile menu"
             >
               {isMobileMenuOpen ? (
                 <X className="w-6 h-6" />
               ) : (
                 <Menu className="w-6 h-6" />
               )}
             </Button>
           </div>

           {/* Desktop: Logo Left */}
           <div className="hidden md:block">
             <div 
               className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
               onClick={handleLogoClick}
               title="Click để về trang chủ"
             >
               <div className="text-center">
                 <h1 className="text-3xl font-bold">
                   <span className="text-red-500">15</span><span className="text-green-700">S</span>
                 </h1>
                 <p className="text-sm text-muted-foreground">Tiền về liền tay</p>
               </div>
             </div>
           </div>

           {/* Mobile: Centered Logo */}
           <div className="md:hidden absolute left-1/2 transform -translate-x-1/2">
             <div 
               className="text-center cursor-pointer hover:opacity-80 transition-opacity"
               onClick={handleLogoClick}
               title="Click để về trang chủ"
             >
               <h1 className="text-4xl font-bold">
                 <span className="text-red-500">15</span><span className="text-green-700">S</span>
               </h1>
               <p className="text-base text-gray-600">Trả góp liền tay</p>
             </div>
           </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navigationItems.map((item) => (
              <a 
                key={item.href}
                href={item.href} 
                className="text-foreground hover:text-primary transition-colors text-sm xl:text-base"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
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
                size="sm"
                className="bg-primary hover:bg-primary/90 text-xs"
                onClick={handleLogin}
              >
                Đăng Nhập
              </Button>
            )}
          </div>

          {/* Mobile: Login Button */}
          <div className="md:hidden">
            {isAuthenticated ? (
              <div 
                className="flex items-center space-x-1 px-2 py-1 bg-primary/10 rounded-lg cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={handleUserClick}
                title="Click để xem quản lý khoản vay"
              >
                <User className="w-4 h-4 text-primary" />
              </div>
            ) : (
                             <Button 
                 variant="default" 
                 size="sm"
                 className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-4 py-2 rounded-full"
                 onClick={handleLogin}
               >
                 Đăng Nhập
               </Button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="pt-4 pb-3 border-t border-gray-200">
              {/* Mobile Navigation */}
              <nav className="space-y-2 mb-4">
                {navigationItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="block px-3 py-2 text-sm text-foreground hover:text-primary hover:bg-primary/5 rounded-md transition-colors"
                    onClick={closeMobileMenu}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>

              {/* Mobile Action Buttons */}
              <div className="space-y-2">
                {isAdmin() && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full border-primary text-primary hover:bg-primary hover:text-white text-sm"
                    onClick={() => {
                      navigate('/admin/dashboard');
                      closeMobileMenu();
                    }}
                  >
                    Admin Panel
                  </Button>
                )}
                
                {isAuthenticated && (
                  <div className="space-y-2">
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      <span className="font-medium">Email:</span> {user?.email}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full border-primary text-primary hover:bg-primary hover:text-white text-sm"
                      onClick={() => {
                        handleLogout();
                        closeMobileMenu();
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Đăng xuất
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Gradient Border */}
      <div className="w-full h-1 bg-gradient-to-r from-orange-400 to-red-500"></div>
    </header>
  );
};