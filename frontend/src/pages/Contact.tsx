import { ALOHeader } from '@/components/ALOHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MapPin } from 'lucide-react';

const Contact = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-primary/5">
      <ALOHeader />
      <section className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="order-2 lg:order-1">
            <CardHeader>
              <CardTitle>Gửi liên hệ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Họ và tên" />
              <Input placeholder="Email hoặc SĐT" />
              <Textarea placeholder="Nội dung" />
              <Button className="w-full">Gửi</Button>
            </CardContent>
          </Card>
          <div className="order-1 lg:order-2 space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight">Liên hệ 15S</h1>
            <p className="text-muted-foreground">Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn.</p>
            <Card>
              <CardContent className="p-6 space-y-3 text-sm">
                <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> 0815.320.648 - 0927.996.903</div>
                <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> support@15s.vn</div>
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> TP.HCM</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;


