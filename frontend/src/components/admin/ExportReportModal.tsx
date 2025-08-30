import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/contexts/ToastContext';
import { api } from '@/lib/api';
import { Download, Calendar, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({ isOpen, onClose }) => {
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'custom'>('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const { showSuccess, showError } = useToast();

  const getDateRange = () => {
    const today = new Date();
    const start = new Date();
    const end = new Date();

    switch (dateRange) {
      case 'today':
        return {
          start: format(today, 'yyyy-MM-dd'),
          end: format(today, 'yyyy-MM-dd')
        };
      case 'week':
        start.setDate(today.getDate() - 7);
        return {
          start: format(start, 'yyyy-MM-dd'),
          end: format(today, 'yyyy-MM-dd')
        };
      case 'month':
        start.setMonth(today.getMonth() - 1);
        return {
          start: format(start, 'yyyy-MM-dd'),
          end: format(today, 'yyyy-MM-dd')
        };
      case 'custom':
        return {
          start: startDate,
          end: endDate
        };
      default:
        return {
          start: format(today, 'yyyy-MM-dd'),
          end: format(today, 'yyyy-MM-dd')
        };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Chờ xét duyệt';
      case 'CONTACTED': return 'Đã liên hệ';
      case 'APPROVED': return 'Đã phê duyệt';
      case 'REJECTED': return 'Từ chối';
      case 'IN_PROGRESS': return 'Đang xử lý';
      case 'COMPLETED': return 'Hoàn thành';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const exportToExcel = async () => {
    try {
      setIsExporting(true);
      const token = localStorage.getItem('adminAccessToken');
      
      if (!token) {
        showError("Lỗi", "Không tìm thấy token đăng nhập");
        return;
      }

      const { start, end } = getDateRange();
      
      if (dateRange === 'custom' && (!start || !end)) {
        showError("Lỗi", "Vui lòng chọn ngày bắt đầu và kết thúc");
        return;
      }

      // Lấy dữ liệu từ API
      const response = await api.getAdminLoansForExport(token, start, end);
      
      // Xử lý response có thể là array hoặc object
      let loans = response;
      if (response && typeof response === 'object' && !Array.isArray(response)) {
        // Nếu response là object, lấy data field
        loans = (response as any).data || (response as any).loans || [];
      }
      
      if (!loans || !Array.isArray(loans) || loans.length === 0) {
        showError("Thông báo", "Không có dữ liệu để xuất báo cáo");
        return;
      }

      // Chuẩn bị dữ liệu cho Excel
      const excelData = loans.map((loan: any) => ({
        'Mã khoản vay': loan.loanApplicationId,
        'Họ và tên': loan.fullName,
        'Số điện thoại': loan.phoneNumber,
        'Giới tính': loan.gender === 'MALE' ? 'Nam' : loan.gender === 'FEMALE' ? 'Nữ' : 'Khác',
        'Ngày sinh': loan.dob ? format(new Date(loan.dob), 'dd/MM/yyyy') : '',
        'CMND/CCCD': loan.identityNumber || '',
        'Thương hiệu điện thoại': loan.phoneBrand || '',
        'Địa chỉ': loan.location || '',
        'Số điện thoại người thân': loan.relativePhone || '',
        'Số điện thoại công ty': loan.companyPhone || '',
        'Số tài khoản ngân hàng': loan.bankAccount || '',
        'Tên ngân hàng': loan.bankName || '',
        'Số tiền vay': loan.loanAmount ? formatCurrency(loan.loanAmount) : '',
        'Kỳ hạn vay (ngày)': loan.loanTerm || '',
        'Số tiền trả hàng ngày': loan.dailyPayment ? formatCurrency(loan.dailyPayment) : '',
        'Tổng số tiền phải trả': loan.totalRepayment ? formatCurrency(loan.totalRepayment) : '',
        'Trạng thái': getStatusText(loan.status),
        'Ghi chú': loan.notes || '',
        'Bước hiện tại': loan.currentStep || '',
        'Ngày tạo': format(new Date(loan.createdAt), 'dd/MM/yyyy HH:mm:ss'),
        'Ngày cập nhật': format(new Date(loan.updatedAt), 'dd/MM/yyyy HH:mm:ss'),
      }));

      // Tạo workbook và worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Đặt độ rộng cột
      const columnWidths = [
        { wch: 15 }, // Mã khoản vay
        { wch: 20 }, // Họ và tên
        { wch: 15 }, // Số điện thoại
        { wch: 10 }, // Giới tính
        { wch: 12 }, // Ngày sinh
        { wch: 15 }, // CMND/CCCD
        { wch: 20 }, // Thương hiệu điện thoại
        { wch: 25 }, // Địa chỉ
        { wch: 20 }, // Số điện thoại người thân
        { wch: 20 }, // Số điện thoại công ty
        { wch: 20 }, // Số tài khoản ngân hàng
        { wch: 20 }, // Tên ngân hàng
        { wch: 15 }, // Số tiền vay
        { wch: 15 }, // Kỳ hạn vay
        { wch: 20 }, // Số tiền trả hàng ngày
        { wch: 20 }, // Tổng số tiền phải trả
        { wch: 15 }, // Trạng thái
        { wch: 30 }, // Ghi chú
        { wch: 10 }, // Bước hiện tại
        { wch: 20 }, // Ngày tạo
        { wch: 20 }, // Ngày cập nhật
      ];
      worksheet['!cols'] = columnWidths;

      // Thêm worksheet vào workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Báo cáo khoản vay');

      // Tạo tên file
      const dateRangeText = dateRange === 'today' ? 'hom-nay' : 
                           dateRange === 'week' ? 'tuan-nay' : 
                           dateRange === 'month' ? 'thang-nay' : 
                           `tu-${format(new Date(start), 'dd-MM-yyyy')}-den-${format(new Date(end), 'dd-MM-yyyy')}`;
      
      const fileName = `bao-cao-khoan-vay-${dateRangeText}-${format(new Date(), 'dd-MM-yyyy-HHmm')}.xlsx`;

      // Xuất file
      XLSX.writeFile(workbook, fileName);

      showSuccess("Thành công", `Đã xuất báo cáo ${loans.length} khoản vay thành công!`);
      onClose();
      
    } catch (error: any) {
      console.error('Error exporting report:', error);
      showError("Lỗi", error.message || "Không thể xuất báo cáo");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Xuất báo cáo Excel
          </DialogTitle>
          <DialogDescription>
            Chọn khoảng thời gian để xuất báo cáo chi tiết các khoản vay
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Khoảng thời gian</Label>
            <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hôm nay</SelectItem>
                <SelectItem value="week">7 ngày qua</SelectItem>
                <SelectItem value="month">30 ngày qua</SelectItem>
                <SelectItem value="custom">Tùy chọn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Từ ngày</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Đến ngày</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Thông tin báo cáo sẽ bao gồm:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Thông tin cá nhân khách hàng</li>
              <li>• Chi tiết khoản vay và kỳ hạn</li>
              <li>• Thông tin ngân hàng</li>
              <li>• Trạng thái xử lý</li>
              <li>• Thời gian tạo và cập nhật</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            Hủy
          </Button>
          <Button onClick={exportToExcel} disabled={isExporting}>
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Đang xuất...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Xuất Excel
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
