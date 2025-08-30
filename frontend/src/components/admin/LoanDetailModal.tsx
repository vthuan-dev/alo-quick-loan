import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { api, LoanApplication } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { Clock, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

interface LoanDetailModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  loanId?: string | null;
}

export const LoanDetailModal: React.FC<LoanDetailModalProps> = ({ open, onOpenChange, loanId }) => {
  const { showError } = useToast();
  const [loan, setLoan] = useState<LoanApplication | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!open || !loanId) return;
      try {
        setLoading(true);
        const token = localStorage.getItem('adminAccessToken') || '';
        const data = await api.getAdminLoanById(token, loanId);
        setLoan(data);
      } catch (e: any) {
        showError('Lỗi', e.message || 'Không thể tải chi tiết khoản vay');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [open, loanId]);

  const statusInfo = (status?: string) => {
    switch (status) {
      case 'PENDING': return { label: 'Chờ xét duyệt', color: 'bg-yellow-500', Icon: Clock };
      case 'APPROVED': return { label: 'Đã phê duyệt', color: 'bg-green-600', Icon: CheckCircle };
      case 'REJECTED': return { label: 'Từ chối', color: 'bg-red-500', Icon: XCircle };
      default: return { label: status || 'Không xác định', color: 'bg-gray-500', Icon: Clock };
    }
  };

  const { label, color, Icon } = statusInfo(loan?.status);

  // Hàm kiểm tra độ đầy đủ của hồ sơ
  const getProfileCompleteness = (loan: LoanApplication) => {
    const step1Complete = !!(loan.fullName && loan.phoneNumber && loan.loanAmount && loan.loanTerm);
    const step2Complete = !!(loan.gender && loan.dob && loan.identityNumber && loan.phoneBrand && loan.location);
    const step3Complete = !!(loan.relativePhone && loan.companyPhone && loan.bankAccount && loan.bankName);

    const completedSteps = [step1Complete, step2Complete, step3Complete].filter(Boolean).length;
    
    return {
      completedSteps,
      totalSteps: 3,
      isComplete: completedSteps === 3,
      step1Complete,
      step2Complete,
      step3Complete
    };
  };

  const profileInfo = loan ? getProfileCompleteness(loan) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Chi tiết khoản vay</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : loan ? (
          <div className="space-y-6">
            {/* Alert thông báo độ đầy đủ hồ sơ */}
            {profileInfo && (
              <Alert className={profileInfo.isComplete ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
                {profileInfo.isComplete ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                )}
                <AlertDescription className={profileInfo.isComplete ? "text-green-800" : "text-yellow-800"}>
                  {profileInfo.isComplete ? (
                    <div>
                      <strong>✅ Hồ sơ đầy đủ</strong>
                      <p className="text-sm mt-1">Khách hàng đã hoàn thành đủ 3 bước đăng ký</p>
                    </div>
                  ) : (
                    <div>
                      <strong>⚠️ Hồ sơ chưa đầy đủ</strong>
                      <p className="text-sm mt-1">
                        Khách hàng chỉ hoàn thành {profileInfo.completedSteps}/3 bước:
                        {!profileInfo.step1Complete && " Thiếu thông tin cơ bản"}
                        {!profileInfo.step2Complete && " Thiếu thông tin cá nhân"}
                        {!profileInfo.step3Complete && " Thiếu thông tin liên hệ & ngân hàng"}
                      </p>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Mã hồ sơ</p>
                <p className="font-medium">{loan.loanApplicationId}</p>
              </div>
              <div className="flex items-center">
                <Badge className={`${color} text-white`}>
                  <Icon className="w-3 h-3 mr-1" /> {label}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Khách hàng</p>
                <p className="font-medium">{loan.fullName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Số điện thoại</p>
                <p className="font-medium">{loan.phoneNumber}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Số tiền vay</p>
                <p className="font-medium">{new Intl.NumberFormat('vi-VN').format(loan.loanAmount || 0)} đ</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ngày tạo</p>
                <p className="font-medium">{loan.createdAt ? new Date(loan.createdAt as any).toLocaleString('vi-VN') : '-'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Kỳ hạn</p>
                <p className="font-medium">{loan.loanTerm || '-'} ngày</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Thanh toán/ngày</p>
                <p className="font-medium">{loan.dailyPayment ? new Intl.NumberFormat('vi-VN').format(loan.dailyPayment) + ' đ' : '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tổng phải trả</p>
                <p className="font-medium">{loan.totalRepayment ? new Intl.NumberFormat('vi-VN').format(loan.totalRepayment) + ' đ' : '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Giới tính</p>
                <p className="font-medium">{loan.gender || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ngày sinh</p>
                <p className="font-medium">{loan.dob ? new Date(loan.dob).toLocaleDateString('vi-VN') : '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">CMND/CCCD</p>
                <p className="font-medium">{loan.identityNumber || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Hãng điện thoại</p>
                <p className="font-medium">{loan.phoneBrand || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Khu vực</p>
                <p className="font-medium">{loan.location || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">SĐT người thân</p>
                <p className="font-medium">{loan.relativePhone || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">SĐT công ty</p>
                <p className="font-medium">{loan.companyPhone || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ngân hàng</p>
                <p className="font-medium">{loan.bankName || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Số tài khoản</p>
                <p className="font-medium">{loan.bankAccount || '-'}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Không tìm thấy dữ liệu.</p>
        )}
      </DialogContent>
    </Dialog>
  );
};


