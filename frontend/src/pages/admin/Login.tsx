import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/contexts/ToastContext';
import { useAuthContext } from '@/App';
import { Eye, EyeOff, Lock, User } from 'lucide-react';

export const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const { showError, showSuccess } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      showError("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      setIsLoading(true);
      
      // In production, call actual admin login API
      // const response = await api.adminLogin({ username, password });
      
      // Mock admin login for now
      const mockAdminUser = {
        id: 'admin_1',
        username: username,
        fullName: 'Admin User',
        email: 'admin@15s.com',
        role: 'ADMIN',
        permissions: ['loan:read', 'loan:write', 'customer:read', 'admin:read'],
        accessToken: 'mock_admin_token'
      };

      // Store admin token separately
      localStorage.setItem('adminAccessToken', mockAdminUser.accessToken);
      
      // Login to auth context
      await login(mockAdminUser);
      
      showSuccess("Thành công", "Đăng nhập thành công!");
      navigate('/admin/dashboard');
      
    } catch (error: any) {
      console.error('Admin login error:', error);
      showError("Lỗi", error.message || "Đăng nhập thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-primary/5 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="text-center">
              <h1 className="text-5xl font-bold">
                <span className="text-red-500">15</span><span className="text-green-700">S</span>
              </h1>
              <p className="text-sm text-muted-foreground">Tiền về liền tay</p>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Admin Panel
          </h2>
          <p className="text-muted-foreground">
            Đăng nhập để quản lý hệ thống
          </p>
        </div>

        {/* Login Form */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Đăng nhập Admin</CardTitle>
            <CardDescription>
              Nhập thông tin đăng nhập của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Tên đăng nhập</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Nhập tên đăng nhập"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <Lock className="w-4 h-4 mr-2" />
                )}
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Button>
            </form>

            {/* Back to Customer */}
            <div className="mt-6 text-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-muted-foreground hover:text-foreground"
              >
                ← Quay lại trang khách hàng
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>© 2025 15S Admin Panel. Bảo mật và an toàn.</p>
        </div>
      </div>
    </div>
  );
};
