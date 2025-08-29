import { ALOHeader } from '@/components/ALOHeader';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50/40">
      <ALOHeader />
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">Về chúng tôi</h1>
          <p className="text-muted-foreground mb-8">
            15S là nền tảng cung cấp giải pháp tài chính hiện đại, nhanh chóng và minh bạch.
            Chúng tôi ứng dụng công nghệ để tối ưu quy trình, giúp khách hàng tiếp cận khoản vay dễ dàng.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <CheckCircle2 className="w-6 h-6 text-primary mb-3" />
              <h3 className="font-semibold mb-1">Nhanh chóng</h3>
              <p className="text-sm text-muted-foreground">Quy trình xét duyệt tinh gọn, giải ngân chỉ trong vài giờ.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <CheckCircle2 className="w-6 h-6 text-primary mb-3" />
              <h3 className="font-semibold mb-1">Minh bạch</h3>
              <p className="text-sm text-muted-foreground">Lãi suất, phí và lịch trả rõ ràng ngay từ đầu.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <CheckCircle2 className="w-6 h-6 text-primary mb-3" />
              <h3 className="font-semibold mb-1">Bảo mật</h3>
              <p className="text-sm text-muted-foreground">Dữ liệu người dùng được bảo vệ theo tiêu chuẩn cao.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default About;


