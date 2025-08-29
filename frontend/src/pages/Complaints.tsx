import { ALOHeader } from '@/components/ALOHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Complaints = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-orange-50/40">
      <ALOHeader />
      <section className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-extrabold tracking-tight mb-6">Khiếu nại</h1>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Gửi khiếu nại</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Họ và tên" />
              <Input placeholder="Số hợp đồng (nếu có)" />
              <Textarea placeholder="Nội dung khiếu nại" />
              <Button className="w-full">Gửi</Button>
            </CardContent>
          </Card>
          <Card className="bg-card/70 backdrop-blur">
            <CardContent className="p-6 text-muted-foreground">
              Chúng tôi cam kết xử lý minh bạch và phản hồi trong 24-48 giờ làm việc.
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Complaints;


