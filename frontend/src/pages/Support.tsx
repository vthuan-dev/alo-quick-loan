import { ALOHeader } from '@/components/ALOHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { HelpCircle, Phone, Mail, MessageSquare } from 'lucide-react';

const Support = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-orange-50/40">
      <ALOHeader />
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-16 -right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 pt-14 pb-8">
          <h1 className="text-4xl font-extrabold tracking-tight">Trung tâm hỗ trợ</h1>
          <p className="text-muted-foreground mt-3 max-w-3xl">
            Chúng tôi luôn sẵn sàng giúp bạn. Tìm câu trả lời nhanh trong mục FAQ
            hoặc gửi yêu cầu, đội ngũ 15S sẽ phản hồi trong thời gian sớm nhất.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="backdrop-blur supports-[backdrop-filter]:bg-white/70">
            <CardHeader className="flex-row items-center space-y-0 gap-3">
              <HelpCircle className="w-6 h-6 text-primary" />
              <CardTitle>FAQ - Câu hỏi thường gặp</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>• Điều kiện vay và hồ sơ cần chuẩn bị</p>
              <p>• Thời gian xét duyệt và giải ngân</p>
              <p>• Cách thanh toán, tất toán khoản vay</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur supports-[backdrop-filter]:bg-white/70">
            <CardHeader className="flex-row items-center space-y-0 gap-3">
              <MessageSquare className="w-6 h-6 text-primary" />
              <CardTitle>Gửi yêu cầu hỗ trợ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Họ và tên" />
              <Input placeholder="Email hoặc SĐT" />
              <Textarea placeholder="Mô tả vấn đề của bạn" />
              <Button className="w-full">Gửi yêu cầu</Button>
            </CardContent>
          </Card>

          <Card className="backdrop-blur supports-[backdrop-filter]:bg-white/70">
            <CardHeader className="flex-row items-center space-y-0 gap-3">
              <Phone className="w-6 h-6 text-primary" />
              <CardTitle>Kênh liên hệ trực tiếp</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> Hotline: 0815.320.648 - 0927.996.903</div>
              <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> Email: support@15s.vn</div>
              <div className="flex items-center gap-2">Zalo/FB: @15S</div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Support;


