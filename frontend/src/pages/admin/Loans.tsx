import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api, LoanApplication } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { LoanDetailModal } from '@/components/admin/LoanDetailModal';
import { RefreshCw, Search, Eye } from 'lucide-react';

const statusOptions = [
  { value: 'PENDING', label: 'Chờ xét duyệt' },
  { value: 'CONTACTED', label: 'Đã liên hệ' },
  { value: 'APPROVED', label: 'Đã phê duyệt' },
  { value: 'REJECTED', label: 'Từ chối' },
  { value: 'IN_PROGRESS', label: 'Đang xử lý' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
  { value: 'CANCELLED', label: 'Hủy' },
];

export const AdminLoansPage = () => {
  const { showError, showSuccess } = useToast();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<LoanApplication[]>([]);
  const [total, setTotal] = useState(0);
  const [tab, setTab] = useState<'ACTIVE' | 'COMPLETED'>('ACTIVE');

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminAccessToken') || '';
      const res = await api.getAdminLoans(token, { page, limit, status });
      setItems(res.loans || res.data || []);
      setTotal(res.total || res.meta?.total || 0);
    } catch (e: any) {
      showError('Lỗi', e.message || 'Không tải được danh sách');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, limit, status]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('adminAccessToken') || '';
      await api.updateAdminLoan(token, id, { status: newStatus as any });
      showSuccess('Thành công', 'Cập nhật trạng thái thành công');
      load();
    } catch (e: any) {
      showError('Lỗi', e.message || 'Cập nhật thất bại');
    }
  };

  const renderStatus = (s: string) => {
    const map: any = {
      PENDING: { label: 'Chờ xét duyệt', cls: 'bg-yellow-500' },
      CONTACTED: { label: 'Đã liên hệ', cls: 'bg-blue-500' },
      APPROVED: { label: 'Đã phê duyệt', cls: 'bg-green-600' },
      REJECTED: { label: 'Từ chối', cls: 'bg-red-500' },
      IN_PROGRESS: { label: 'Đang xử lý', cls: 'bg-purple-500' },
      COMPLETED: { label: 'Hoàn thành', cls: 'bg-emerald-600' },
      CANCELLED: { label: 'Hủy', cls: 'bg-gray-400' },
    };
    const m = map[s] || { label: s, cls: 'bg-gray-500' };
    return <Badge className={`${m.cls} text-white`}>{m.label}</Badge>;
  };

  const filteredItems = useMemo(() => {
    if (tab === 'COMPLETED') return items.filter(i => i.status === 'COMPLETED');
    return items.filter(i => i.status !== 'COMPLETED');
  }, [items, tab]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Quản lý khoản vay</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={load}>
              <RefreshCw className="w-4 h-4 mr-2" /> Làm mới
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Tabs */}
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant={tab === 'ACTIVE' ? 'default' : 'outline'}
              onClick={() => setTab('ACTIVE')}
              className={tab === 'ACTIVE' ? '' : 'bg-transparent'}
            >
              Đang xử lý
            </Button>
            <Button
              variant={tab === 'COMPLETED' ? 'default' : 'outline'}
              onClick={() => setTab('COMPLETED')}
              className={tab === 'COMPLETED' ? '' : 'bg-transparent'}
            >
              Đã hoàn thành
            </Button>
          </div>

          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Tìm tên, SĐT, mã hồ sơ..." className="pl-9 w-64" />
            </div>
            <Select value={status ?? 'ALL'} onValueChange={(v) => setStatus(v === 'ALL' ? undefined : v)}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả</SelectItem>
                {statusOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="text-left p-3">Mã hồ sơ</th>
                  <th className="text-left p-3">Khách hàng</th>
                  <th className="text-left p-3">SĐT</th>
                  <th className="text-left p-3">Số tiền</th>
                  <th className="text-left p-3">Trạng thái</th>
                  <th className="text-right p-3">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Đang tải...</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Không có dữ liệu</td></tr>
                ) : (
                  filteredItems.map(item => (
                    <tr key={item._id || item.loanApplicationId} className="border-t">
                      <td className="p-3 font-medium">{item.loanApplicationId}</td>
                      <td className="p-3">{item.fullName}</td>
                      <td className="p-3">{item.phoneNumber}</td>
                      <td className="p-3">{new Intl.NumberFormat('vi-VN').format(item.loanAmount || 0)} đ</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {renderStatus(item.status)}
                          <Select value={item.status} onValueChange={(v) => updateStatus(item._id || '', v)} disabled={item.status === 'COMPLETED'}>
                            <SelectTrigger className="h-8 w-40" disabled={item.status === 'COMPLETED'}><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {statusOptions.filter(o=>o.value).map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <Button variant="outline" size="sm" onClick={() => { setSelectedId(item._id || ''); setDetailOpen(true); }}>
                          <Eye className="w-4 h-4 mr-2" /> Xem
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <LoanDetailModal open={detailOpen} onOpenChange={setDetailOpen} loanId={selectedId} />
    </div>
  );
};
