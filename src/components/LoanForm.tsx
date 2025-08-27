import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

interface LoanFormProps {
  onSubmit: () => void;
}

export const LoanForm = ({ onSubmit }: LoanFormProps) => {
  const [loanAmount, setLoanAmount] = useState([4500000]);
  const [fullName, setFullName] = useState("NGUYEN VAN THUAN");
  const [phone, setPhone] = useState("0333 351 725");
  const [agreed, setAgreed] = useState(false);

  const calculateRepayment = (amount: number) => {
    // Based on the loan table data, calculate approximate repayment
    const interestRate = 0.1; // 10% for example
    return Math.round(amount + (amount * interestRate));
  };

  const getInstallmentInfo = (amount: number) => {
    // Match amount to loan table data
    if (amount >= 3500000 && amount <= 4000000) {
      return { days30: "142.000", days40: "112.000" };
    }
    if (amount >= 4000000 && amount <= 5000000) {
      return { days30: "162.000", days40: "128.000" };
    }
    if (amount >= 5000000 && amount <= 6000000) {
      return { days30: "202.000", days40: "160.000" };
    }
    // Default calculation
    const days30 = Math.round(amount * 0.04);
    const days40 = Math.round(amount * 0.032);
    return { 
      days30: days30.toLocaleString(), 
      days40: days40.toLocaleString() 
    };
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString() + " Vnd";
  };

  const installmentInfo = getInstallmentInfo(loanAmount[0]);

  return (
    <div className="bg-gradient-hero rounded-2xl p-8 shadow-card-custom text-primary-foreground max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Left Side - Loan Details */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold leading-tight">
              <span className="text-white">0%</span> lãi suất cho khách hàng mới!
            </h1>
            <h2 className="text-3xl font-bold">
              Nhận tiền trong <span className="text-accent-red">5 phút</span> 24/7
            </h2>
            <p className="text-white/80">
              109.884 khách hàng được vay online với 0% lãi suất và chi phí
            </p>
          </div>

          {/* Loan Amount Slider */}
          <div className="space-y-4">
            <Label className="text-white text-lg font-medium">Tôi cần vay tiền</Label>
            <div className="space-y-4">
              <Slider
                value={loanAmount}
                onValueChange={setLoanAmount}
                max={10000000}
                min={500000}
                step={100000}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-white/70">
                <span>500.000 Vnd</span>
                <span className="text-2xl font-bold text-white">{formatCurrency(loanAmount[0])}</span>
                <span>10.000.000 Vnd</span>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white/70 text-sm">Trả lại (Vnd)</Label>
              <p className="text-white font-semibold">
                <span className="line-through text-white/60 text-sm">5.445.000</span>
                <br />
                <span className="text-xl">{formatCurrency(calculateRepayment(loanAmount[0]))}</span>
              </p>
            </div>
            <div>
              <Label className="text-white/70 text-sm">Ngày thanh toán đầu tiên</Label>
              <p className="text-white font-semibold text-xl">3.09.2025</p>
            </div>
          </div>

          {/* Installment Options */}
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Tùy chọn trả góp:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-white/80">
                <span>Góp 30 ngày: </span>
                <span className="font-semibold">{installmentInfo.days30} Vnd</span>
              </div>
              <div className="text-white/80">
                <span>Góp 40 ngày: </span>
                <span className="font-semibold">{installmentInfo.days40} Vnd</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 space-y-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName" className="text-foreground font-medium">Họ và tên</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1"
                placeholder="Nhập họ và tên của bạn"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-foreground font-medium">Số điện thoại của bạn</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1"
                placeholder="Nhập số điện thoại"
              />
            </div>
          </div>

          <Button 
            onClick={onSubmit}
            size="xl"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-elegant"
            disabled={!agreed || !fullName || !phone}
          >
            ĐĂNG KÝ VAY
          </Button>

          <div className="flex items-start space-x-2">
            <Checkbox 
              id="terms"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked as boolean)}
              className="mt-0.5"
            />
            <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed">
              Bằng việc chọn ở đây, tôi xác nhận rằng tôi đã đọc và hiểu đầy đủ các{" "}
              <a href="/terms" className="text-primary underline">điều khoản</a>, {" "}
              <a href="/conditions" className="text-primary underline">điều kiện</a> và đồng ý với{" "}
              <a href="/privacy" className="text-primary underline">Chính sách quyền riêng tư</a> được đưa ra bởi ALO 15S.
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};