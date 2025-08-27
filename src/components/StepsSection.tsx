import { Button } from "@/components/ui/button";
import { Smartphone, Clock, Wallet, ArrowLeftRight } from "lucide-react";

export const StepsSection = () => {
  const steps = [
    {
      number: "01",
      icon: <Smartphone className="w-12 h-12 text-primary" />,
      title: "Đăng ký dịch vụ",
      description: "Chọn điều khoản vay trong biểu mẫu và để lại yêu cầu vay"
    },
    {
      number: "02", 
      icon: <Clock className="w-12 h-12 text-primary" />,
      title: "Nhận tư vấn",
      description: "Đợi câu trả lời. Chúng tôi sẽ trả lời bạn trong vòng 30 phút"
    },
    {
      number: "03",
      icon: <Wallet className="w-12 h-12 text-primary" />,
      title: "Nhận tiền nhanh", 
      description: "Nhân viên giao dịch sẽ liên lạc với bạn và cho bạn biết làm thế nào để có được một khoản vay"
    },
    {
      number: "04",
      icon: <ArrowLeftRight className="w-12 h-12 text-primary" />,
      title: "Thanh toán khoản vay",
      description: "Nhận tiền vào tài khoản của bạn"
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
          4 bước đơn giản để nhận tiền và thanh toán nhanh
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {steps.map((step, index) => (
            <div key={index} className="bg-card rounded-xl p-6 shadow-card-custom text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">{step.title}</h3>
              <p className="text-muted-foreground text-sm">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button className="bg-primary hover:bg-primary/90 px-8 py-3 text-lg">
            Đăng ký ngay
          </Button>
        </div>
      </div>
    </section>
  );
};