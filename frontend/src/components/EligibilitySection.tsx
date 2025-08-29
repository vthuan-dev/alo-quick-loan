import { Button } from "@/components/ui/button";
import { Users, MapPin, Wallet } from "lucide-react";

export const EligibilitySection = () => {
  const eligibilityItems = [
    {
      icon: <Users className="w-12 h-12 text-primary" />,
      title: "Độ tuổi từ 22 đến 60",
      description: "Phù hợp với độ tuổi lao động"
    },
    {
      icon: <MapPin className="w-12 h-12 text-primary" />,
      title: "Sinh sống ở tất cả các tỉnh thành tại Việt Nam",
      description: "Phục vụ toàn quốc"
    },
    {
      icon: <Wallet className="w-12 h-12 text-primary" />,
      title: "Người có thu nhập ổn định",
      description: "Đảm bảo khả năng trả nợ"
    }
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-6 text-foreground">
            Ai có thể vay tiền?
          </h2>
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Là một trong những nền tảng cho vay tiền qua iphone uy tín nhất Việt Nam, 
            <span className="text-primary font-semibold"> 15S </span>
            cung cấp dịch vụ cho đa dạng khách hàng với quy trình thủ tục đơn giản. 
            Tại <span className="text-primary font-semibold">15S</span>, chúng tôi mong muốn đem lại giải pháp tài chính thông minh, hiện đại, 
            phục vụ các nhu cầu vay tiền nhanh và đa dạng của khách hàng
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {eligibilityItems.map((item, index) => (
            <div key={index} className="bg-card rounded-2xl p-8 shadow-card-custom text-center hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-card-foreground">{item.title}</h3>
              <p className="text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button size="xl" className="bg-primary hover:bg-primary/90 shadow-elegant">
            Đăng ký ngay
          </Button>
        </div>
      </div>
    </section>
  );
};