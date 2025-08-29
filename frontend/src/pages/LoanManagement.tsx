import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/contexts/ToastContext";
import { useAuthContext } from "@/App";
import { useNavigate } from "react-router-dom";
import { ALOHeader } from "@/components/ALOHeader";
import { api, LoanApplication, LoanStatistics } from "@/lib/api";
import { 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  FileText,
  Download,
  Eye,
  RefreshCw,
  LogOut,
  CreditCard,
  BarChart3,
  Sparkles
} from "lucide-react";

export const LoanManagement = () => {
  const [loanApplications, setLoanApplications] = useState<LoanApplication[]>([]);
  const [loanStatistics, setLoanStatistics] = useState<LoanStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState<LoanApplication | null>(null);
  const { user, isAuthenticated, logout } = useAuthContext();
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Mock data - trong thực tế sẽ gọi API
    loadLoanApplications();
  }, [isAuthenticated, navigate]);

  const loadLoanApplications = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        showError("Lỗi", "Không tìm thấy token đăng nhập");
        return;
      }

      // Load song song cả danh sách khoản vay và thống kê
      const [applicationsResponse, statistics] = await Promise.all([
        api.getMyLoanApplications(token),
        api.getMyLoanStatistics(token)
      ]);

      setLoanApplications(applicationsResponse.data);
      setLoanStatistics(statistics);
      
      showSuccess("Thành công", "Đã tải dữ liệu khoản vay");
    } catch (error: any) {
      console.error('Error loading loan data:', error);
      showError("Lỗi", error.message || "Không thể tải dữ liệu khoản vay");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Chờ xét duyệt', color: 'bg-yellow-500', icon: Clock };
      case 'APPROVED':
        return { label: 'Đã phê duyệt', color: 'bg-green-500', icon: CheckCircle };
      case 'IN_PROGRESS':
        return { label: 'Đang xử lý', color: 'bg-blue-500', icon: TrendingUp };
      case 'COMPLETED':
        return { label: 'Hoàn thành', color: 'bg-green-600', icon: CheckCircle };
      case 'REJECTED':
        return { label: 'Từ chối', color: 'bg-red-500', icon: AlertCircle };
      default:
        return { label: 'Không xác định', color: 'bg-gray-500', icon: AlertCircle };
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('rememberMe');
    sessionStorage.clear();
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    window.location.reload();
  };

  const handleViewDetails = (loan: LoanApplication) => {
    setSelectedLoan(loan);
  };

  const handleCloseDetails = () => {
    setSelectedLoan(null);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <ALOHeader />
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 border border-primary/20">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-50"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-primary/20 rounded-xl backdrop-blur-sm">
                      <BarChart3 className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        Quản lý khoản vay
                      </h1>
                      <p className="text-muted-foreground text-lg mt-1">
                        Chào mừng <span className="font-semibold text-primary">{user?.email}</span>, quản lý các khoản vay của bạn
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    onClick={loadLoanApplications}
                    disabled={isLoading}
                    variant="outline"
                    className="border-primary/30 text-primary hover:bg-primary hover:text-white transition-all duration-300 hover:scale-105 backdrop-blur-sm bg-white/50"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Làm mới
                  </Button>
                </div>
              </div>
              
              {/* Warning message for pending applications */}
              {loanStatistics && loanStatistics.pendingApplications > 0 && (
                <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200/50 rounded-xl backdrop-blur-sm animate-in slide-in-from-top-2 duration-500">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                    </div>
                    <div>
                      <h3 className="text-yellow-800 font-semibold mb-1 flex items-center">
                        <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                        Không thể tạo khoản vay mới
                      </h3>
                      <p className="text-yellow-700 text-sm">
                        Bạn hiện có <strong className="text-yellow-800">{loanStatistics.pendingApplications} khoản vay đang chờ xét duyệt</strong>. 
                        Vui lòng chờ xét duyệt hoàn tất trước khi đăng ký khoản vay mới.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-500/90 to-blue-600/90 text-white backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-in slide-in-from-bottom-4 duration-700 delay-100">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="pb-2 relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium opacity-90">Tổng khoản vay</CardTitle>
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold mb-1">
                {loanStatistics ? formatCurrency(loanStatistics.totalLoanAmount) : formatCurrency(0)}
              </div>
              <p className="text-xs opacity-90">
                {loanStatistics ? loanStatistics.totalApplications : 0} khoản vay
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-green-500/90 to-green-600/90 text-white backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-in slide-in-from-bottom-4 duration-700 delay-200">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="pb-2 relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium opacity-90">Đã phê duyệt</CardTitle>
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <CheckCircle className="w-4 h-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold mb-1">
                {loanStatistics ? loanStatistics.approvedApplications : 0}
              </div>
              <p className="text-xs opacity-90">Khoản vay</p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-yellow-500/90 to-orange-500/90 text-white backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-in slide-in-from-bottom-4 duration-700 delay-300">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="pb-2 relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium opacity-90">Chờ xét duyệt</CardTitle>
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold mb-1">
                {loanStatistics ? loanStatistics.pendingApplications : 0}
              </div>
              <p className="text-xs opacity-90">Khoản vay</p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-purple-500/90 to-purple-600/90 text-white backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-in slide-in-from-bottom-4 duration-700 delay-400">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="pb-2 relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium opacity-90">Tổng thanh toán</CardTitle>
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold mb-1">
                {loanStatistics ? formatCurrency(loanStatistics.totalPayment) : formatCurrency(0)}
              </div>
              <p className="text-xs opacity-90">Bao gồm lãi suất</p>
            </CardContent>
          </Card>
        </div>

        {/* Loan Applications List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-background to-primary/5 rounded-2xl border border-primary/10">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Danh sách khoản vay
              </h2>
            </div>
            {loanStatistics && loanStatistics.pendingApplications > 0 ? (
              <div className="flex items-center space-x-2 px-4 py-2 bg-yellow-100 rounded-xl border border-yellow-200">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="text-yellow-700 font-medium">
                  Bạn có {loanStatistics.pendingApplications} khoản vay đang chờ duyệt
                </span>
              </div>
            ) : (
              <Button
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Đăng ký vay mới
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center max-w-md">
                <div className="relative mb-6">
                  <div className="w-20 h-20 mx-auto relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                    <div className="absolute inset-2 bg-primary/40 rounded-full animate-pulse"></div>
                    <RefreshCw className="w-16 h-16 mx-auto text-primary animate-spin" />
                  </div>
                </div>
                <p className="text-lg text-muted-foreground font-medium">Đang tải danh sách khoản vay...</p>
                <p className="text-sm text-muted-foreground mt-2">Vui lòng chờ trong giây lát</p>
              </div>
            </div>
          ) : loanApplications.length === 0 ? (
            <Card className="text-center py-16 bg-gradient-to-br from-background to-primary/5 border border-primary/20">
              <CardContent>
                <div className="relative mb-6">
                  <div className="w-24 h-24 mx-auto relative">
                    <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse"></div>
                    <FileText className="w-20 h-20 mx-auto text-primary/60 relative z-10" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  Chưa có khoản vay nào
                </h3>
                <p className="text-muted-foreground mb-6 text-lg">
                  Bạn chưa có khoản vay nào. Hãy đăng ký vay đầu tiên của mình!
                </p>
                {loanStatistics && loanStatistics.pendingApplications > 0 ? (
                  <div className="flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200/50 rounded-xl max-w-md mx-auto">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                    </div>
                    <span className="text-yellow-700 font-medium text-sm">
                      Bạn có {loanStatistics.pendingApplications} khoản vay đang chờ duyệt. Vui lòng chờ xét duyệt trước khi tạo khoản vay mới.
                    </span>
                  </div>
                ) : (
                  <Button
                    onClick={() => navigate('/')}
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-8 py-3 text-lg"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Đăng ký vay ngay
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {loanApplications.map((loan, index) => {
                const statusInfo = getStatusInfo(loan.status);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <Card 
                    key={loan.loanApplicationId} 
                    className="group relative overflow-hidden bg-gradient-to-br from-background to-primary/5 border border-primary/20 hover:border-primary/40 hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-in slide-in-from-bottom-4 duration-700"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardHeader className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-primary/20 rounded-lg">
                            <DollarSign className="w-5 h-5 text-primary" />
                          </div>
                          <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                            Khoản vay #{loan.loanApplicationId}
                          </CardTitle>
                        </div>
                        <Badge className={`${statusInfo.color} text-white shadow-lg backdrop-blur-sm`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <CardDescription className="text-muted-foreground flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Tạo ngày {loan.createdAt ? formatDate(loan.createdAt.toString()) : 'N/A'}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 relative z-10">
                      {/* Loan Amount */}
                      <div className="group/item flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-primary/20 rounded-lg group-hover/item:bg-primary/30 transition-colors">
                            <DollarSign className="w-5 h-5 text-primary" />
                          </div>
                          <span className="font-semibold text-foreground">Số tiền vay:</span>
                        </div>
                        <span className="font-bold text-xl text-primary">
                          {formatCurrency(loan.loanAmount || 0)}
                        </span>
                      </div>

                      {/* Loan Term */}
                      <div className="group/item flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/10 to-blue-500/5 rounded-xl border border-blue-200/30 hover:border-blue-300/50 transition-all duration-300 hover:scale-105">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-500/20 rounded-lg group-hover/item:bg-blue-500/30 transition-colors">
                            <Calendar className="w-5 h-5 text-blue-600" />
                          </div>
                          <span className="font-semibold text-foreground">Kỳ hạn:</span>
                        </div>
                        <span className="font-bold text-xl text-blue-600">
                          {loan.loanTerm || 0} ngày
                        </span>
                      </div>

                      {/* Daily Payment */}
                      <div className="group/item flex items-center justify-between p-4 bg-gradient-to-r from-green-500/10 to-green-500/5 rounded-xl border border-green-200/30 hover:border-green-300/50 transition-all duration-300 hover:scale-105">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-500/20 rounded-lg group-hover/item:bg-green-500/30 transition-colors">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                          </div>
                          <span className="font-semibold text-foreground">Trả hàng ngày:</span>
                        </div>
                        <span className="font-bold text-xl text-green-600">
                          {formatCurrency(loan.dailyPayment || 0)}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      {!loan.isCompleted && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Tiến độ hoàn thiện hồ sơ</span>
                            <span className="font-medium">{loan.currentStep}/3</span>
                          </div>
                          <Progress value={(loan.currentStep / 3) * 100} className="h-2" />
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center space-x-3 pt-4">
                        <Button
                          onClick={() => handleViewDetails(loan)}
                          variant="outline"
                          className="flex-1 border-primary/30 text-primary hover:bg-primary hover:text-white transition-all duration-300 hover:scale-105 backdrop-blur-sm bg-white/50 shadow-lg hover:shadow-xl"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Xem chi tiết
                        </Button>
                        {loan.status === 'APPROVED' && (
                          <Button
                            variant="outline"
                            className="flex-1 border-green-500/30 text-green-600 hover:bg-green-500 hover:text-white transition-all duration-300 hover:scale-105 backdrop-blur-sm bg-white/50 shadow-lg hover:shadow-xl"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Tải hợp đồng
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Loan Details Modal */}
      {selectedLoan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Chi tiết khoản vay #{selectedLoan.loanApplicationId}</CardTitle>
                <Button
                  onClick={handleCloseDetails}
                  variant="ghost"
                  size="sm"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Số tiền vay</label>
                  <p className="font-semibold">{formatCurrency(selectedLoan.loanAmount)}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Kỳ hạn</label>
                  <p className="font-semibold">{selectedLoan.loanTerm} ngày</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Trả hàng ngày</label>
                  <p className="font-semibold">{formatCurrency(selectedLoan.dailyPayment)}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Tổng thanh toán</label>
                  <p className="font-semibold">{formatCurrency(selectedLoan.totalRepayment || 0)}</p>
                </div>
              </div>

              {/* Basic Info */}
              <div className="space-y-3">
                <h4 className="font-semibold text-primary">Thông tin cơ bản</h4>
                <div className="grid grid-cols-2 gap-4 p-3 bg-primary/5 rounded-lg">
                  <div>
                    <label className="text-sm text-muted-foreground">Họ và tên</label>
                    <p className="font-medium">{selectedLoan.fullName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Số điện thoại</label>
                    <p className="font-medium">{selectedLoan.phoneNumber}</p>
                  </div>
                </div>
              </div>

              {/* Status Info */}
              <div className="space-y-3">
                <h4 className="font-semibold text-primary">Trạng thái hồ sơ</h4>
                <div className="p-3 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Trạng thái hiện tại</span>
                    <Badge className={`${getStatusInfo(selectedLoan.status).color} text-white`}>
                      {getStatusInfo(selectedLoan.status).label}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-muted-foreground">Tiến độ hoàn thiện</span>
                    <span className="font-medium">{selectedLoan.currentStep}/3 bước</span>
                  </div>
                  <Progress value={(selectedLoan.currentStep / 3) * 100} className="h-2 mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default LoanManagement;
