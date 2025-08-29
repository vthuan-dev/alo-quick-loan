import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api, AdminRecentLoan } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { ArrowLeft, CheckCircle, Clock, XCircle } from 'lucide-react';

export const AdminLoanDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showError } = useToast();
  const [loan, setLoan] = useState<AdminRecentLoan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('adminAccessToken') || '';
        const data = await api.getAdminLoanById(token, id!);
        setLoan(data);
      } catch (e: any) {
        showError('Lỗi', e.message || 'Không thể tải chi tiết khoản vay');
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const statusInfo = (status: string) => {
    switch (status) {
      case 'PENDING': return { label: 'Chờ xét duyệt', color: 'bg-yellow-500', icon: Clock };
      case 'APPROVED': return { label: 'Đã phê duyệt', color: 'bg-green-600', icon: CheckCircle };
      case 'REJECTED': return { label: 'Từ chối', color: 'bg-red-500', icon: XCircle };
      default: return { label: status, color: 'bg-gray-500', icon: Clock };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="p-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
        </Button>
        <p className="mt-4 text-sm text-muted-foreground">Không tìm thấy khoản vay.</p>
      </div>
    );
  }

  const s = statusInfo(loan.status);
  const Icon = s.icon;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chi tiết khoản vay</CardTitle>
          <CardDescription>Mã hồ sơ: {loan.loanApplicationId}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Khách hàng</p>
              <p className="text-lg font-medium">{loan.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Số điện thoại</p>
              <p className="text-lg font-medium">{loan.phoneNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Số tiền vay</p>
              <p className="text-lg font-medium">{new Intl.NumberFormat('vi-VN').format(loan.loanAmount)} đ</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={`${s.color} text-white`}>
                <Icon className="w-3 h-3 mr-1" /> {s.label}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
