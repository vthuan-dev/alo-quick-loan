import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoanDetailModal } from '@/components/admin/LoanDetailModal';
import { useToast } from '@/contexts/ToastContext';
import { api, AdminDashboardStats, AdminRecentLoan } from '@/lib/api';
import { 
  DollarSign, 
  Users, 
  FileText, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Download
} from 'lucide-react';

// Using interfaces from api.ts

export const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [recentLoans, setRecentLoans] = useState<AdminRecentLoan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const { showError } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('adminAccessToken');
      
      if (!token) {
        showError("Lỗi", "Không tìm thấy token đăng nhập");
        return;
      }

      // Call real API
      const response = await api.getAdminDashboard(token);
      setStats(response.statistics);
      setRecentLoans(response.recentLoans);
      
      console.log('Dashboard data loaded:', response);
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      showError("Lỗi", error.message || "Không thể tải dữ liệu dashboard");
      
      // Fallback to mock data if API fails
      setStats({
        totalLoans: 156,
        totalAmount: 1250000000,
        pendingLoans: 23,
        approvedLoans: 89,
        rejectedLoans: 12,
        completedLoans: 32,
        todayLoans: 8,
        thisWeekLoans: 45,
        thisMonthLoans: 156,
      });

      setRecentLoans([
        {
          _id: '1',
          loanApplicationId: 'loan_abc123',
          fullName: 'Nguyễn Văn A',
          phoneNumber: '0123456789',
          loanAmount: 5000000,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        },
        {
          _id: '2',
          loanApplicationId: 'loan_def456',
          fullName: 'Trần Thị B',
          phoneNumber: '0987654321',
          loanAmount: 8000000,
          status: 'APPROVED',
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Chờ xét duyệt', color: 'bg-yellow-500', icon: Clock };
      case 'APPROVED':
        return { label: 'Đã phê duyệt', color: 'bg-green-500', icon: CheckCircle };
      case 'REJECTED':
        return { label: 'Từ chối', color: 'bg-red-500', icon: XCircle };
      case 'COMPLETED':
        return { label: 'Hoàn thành', color: 'bg-blue-500', icon: CheckCircle };
      default:
        return { label: 'Không xác định', color: 'bg-gray-500', icon: AlertCircle };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Tổng quan hệ thống quản lý khoản vay</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Xuất báo cáo
          </Button>
          <Button>
            <Eye className="w-4 h-4 mr-2" />
            Xem chi tiết
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Tổng khoản vay</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">
              {stats?.totalLoans || 0}
            </div>
            <p className="text-xs opacity-90">
              {formatCurrency(stats?.totalAmount || 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Chờ xét duyệt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">
              {stats?.pendingLoans || 0}
            </div>
            <p className="text-xs opacity-90">Cần xử lý</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Đã phê duyệt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">
              {stats?.approvedLoans || 0}
            </div>
            <p className="text-xs opacity-90">Khoản vay</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Hôm nay</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">
              {stats?.todayLoans || 0}
            </div>
            <p className="text-xs opacity-90">Khoản vay mới</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tuần này</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stats?.thisWeekLoans || 0}
            </div>
            <p className="text-sm text-gray-600">Khoản vay mới</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tháng này</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stats?.thisMonthLoans || 0}
            </div>
            <p className="text-sm text-gray-600">Khoản vay mới</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tỷ lệ phê duyệt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats ? Math.round((stats.approvedLoans / stats.totalLoans) * 100) : 0}%
            </div>
            <p className="text-sm text-gray-600">Khoản vay được chấp thuận</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Loans */}
      <Card>
        <CardHeader>
          <CardTitle>Khoản vay gần đây</CardTitle>
          <CardDescription>
            Danh sách các khoản vay mới nhất cần xử lý
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentLoans.map((loan) => {
              const statusInfo = getStatusInfo(loan.status);
              const StatusIcon = statusInfo.icon;
              
              return (
                <div key={loan._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {loan.fullName}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {loan.phoneNumber} • {loan.loanApplicationId}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(loan.loanAmount)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge className={`${statusInfo.color} text-white`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusInfo.label}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => { setSelectedLoanId(loan._id); setDetailOpen(true); }}>
                      <Eye className="w-4 h-4 mr-2" />
                      Xem chi tiết
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      <LoanDetailModal open={detailOpen} onOpenChange={setDetailOpen} loanId={selectedLoanId} />
    </div>
  );
};
