import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/contexts/ToastContext";

interface LoanFormProps {
  onSubmit: () => void;
}

export const LoanForm = ({ onSubmit }: LoanFormProps) => {
  const [loanAmount, setLoanAmount] = useState([4500000]);
  const [loanTerm, setLoanTerm] = useState<30 | 40>(30);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const { showError, showSuccess, showInfo } = useToast();

  // Bảng tỷ lệ thanh toán hàng ngày theo dữ liệu backend
  const PAYMENT_RATES = {
    30: {
      1000000: 41000,
      1500000: 61500,
      2000000: 82000,
      2500000: 102000,
      3000000: 123000,
      3500000: 143500,
      4000000: 164000,
      4500000: 184500,
      5000000: 205000,
      5500000: 225500,
      6000000: 246000,
      6500000: 266500,
      7000000: 287000,
      7500000: 307500,
      8000000: 328000,
      8500000: 348500,
      9000000: 369000,
      9500000: 389500,
      10000000: 410000,
    },
    40: {
      1000000: 30750,
      1500000: 46125,
      2000000: 61500,
      2500000: 76875,
      3000000: 92250,
      3500000: 107625,
      4000000: 123000,
      4500000: 138375,
      5000000: 153750,
      5500000: 169125,
      6000000: 184500,
      6500000: 199875,
      7000000: 215250,
      7500000: 230625,
      8000000: 246000,
      8500000: 261375,
      9000000: 276750,
      9500000: 292125,
      10000000: 307500,
    }
  };

  const getDailyPayment = (amount: number, term: 30 | 40): number => {
    const rates = PAYMENT_RATES[term];
    
    // Tìm số tiền gần nhất trong bảng
    const amounts = Object.keys(rates).map(Number).sort((a, b) => a - b);
    
    // Nếu số tiền chính xác có trong bảng
    if (rates[amount]) {
      return rates[amount];
    }
    
    // Tìm 2 số tiền gần nhất để nội suy tuyến tính
    let lowerAmount = amounts[0];
    let upperAmount = amounts[amounts.length - 1];
    
    for (let i = 0; i < amounts.length - 1; i++) {
      if (amount >= amounts[i] && amount <= amounts[i + 1]) {
        lowerAmount = amounts[i];
        upperAmount = amounts[i + 1];
        break;
      }
    }
    
    // Nội suy tuyến tính
    const lowerRate = rates[lowerAmount];
    const upperRate = rates[upperAmount];
    const ratio = (amount - lowerAmount) / (upperAmount - lowerAmount);
    
    return Math.round(lowerRate + (upperRate - lowerRate) * ratio);
  };

  const calculateTotalRepayment = (amount: number, term: 30 | 40): number => {
    const dailyPayment = getDailyPayment(amount, term);
    return dailyPayment * term;
  };

  const calculateTotalInterest = (amount: number, term: 30 | 40): number => {
    const totalRepayment = calculateTotalRepayment(amount, term);
    return totalRepayment - amount;
  };

  const calculateInterestRate = (amount: number, term: 30 | 40): number => {
    const totalInterest = calculateTotalInterest(amount, term);
    return (totalInterest / amount) * 100;
  };

  const getFirstPaymentDate = (term: 30 | 40): string => {
    const today = new Date();
    const firstPaymentDate = new Date(today);
    firstPaymentDate.setDate(today.getDate() + term);
    
    return firstPaymentDate.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString() + " Vnd";
  };

  const handleSubmit = async () => {
    console.log('🚀 handleSubmit called');
    
    if (!agreed || !fullName || !phone) {
      console.log('❌ Validation failed, showing error toast');
      showError(
        "Thông tin không đầy đủ", 
        "Vui lòng điền đầy đủ thông tin và đồng ý với điều khoản"
      );
      return;
    }

    setIsChecking(true);
    try {
      console.log('🔍 Checking existing application for phone:', phone);
      // Kiểm tra hồ sơ tồn tại
      const existingCheck = await api.checkExistingApplication(phone.replace(/\s+/g, ''));
      console.log('📋 Existing check result:', existingCheck);
      
      if (existingCheck.exists) {
        if (!existingCheck.canContinue) {
          // Hồ sơ đã hoàn thành và đang chờ xét duyệt
          console.log('⚠️ Showing warning toast for pending application');
          showInfo(
            "Hồ sơ đang chờ xét duyệt",
            existingCheck.message || "Quý khách đang có hồ sơ đang chờ xét duyệt, vui lòng thử lại sau"
          );
          setIsChecking(false);
          return;
        } else {
          // Hồ sơ có thể tiếp tục - lưu thông tin để chuyển tới step tiếp theo
          console.log('ℹ️ Showing info toast for continuing application');
          if (existingCheck.loanApplicationId) {
            localStorage.setItem('loanApplicationId', existingCheck.loanApplicationId);
            localStorage.setItem('existingApplicationStep', existingCheck.currentStep?.toString() || '1');
          }
          
          showInfo(
            "Tiếp tục hồ sơ",
            existingCheck.message || "Chuyển tới bước tiếp theo của hồ sơ"
          );
          
          // Chuyển tới step tiếp theo
          onSubmit();
          setIsChecking(false);
          return;
        }
      }

      // Không có hồ sơ tồn tại - tạo mới
      console.log('🆕 Creating new application');
      const payload = {
        fullName,
        phoneNumber: phone.replace(/\s+/g, ''),
        loanAmount: loanAmount[0],
        loanTerm: loanTerm,
      };

      const res = await api.step1(payload);
      
      // Lưu loanApplicationId cho RegistrationModal
      localStorage.setItem('loanApplicationId', res.loanApplicationId);
      localStorage.setItem('existingApplicationStep', '1');
      
      console.log('✅ Showing success toast');
      showSuccess(
        "Thành công!",
        "Bước 1 hoàn thành, chuyển tới bước tiếp theo"
      );
      
      onSubmit();
    } catch (e) {
      console.error('💥 Submit failed', e);
      showError(
        "Lỗi gửi yêu cầu",
        "Gửi yêu cầu không thành công. Vui lòng thử lại."
      );
    } finally {
      setIsChecking(false);
    }
  };

  const currentDailyPayment = getDailyPayment(loanAmount[0], loanTerm);
  const totalRepayment = calculateTotalRepayment(loanAmount[0], loanTerm);
  const totalInterest = calculateTotalInterest(loanAmount[0], loanTerm);
  const interestRate = calculateInterestRate(loanAmount[0], loanTerm);
  const firstPaymentDate = getFirstPaymentDate(loanTerm);

  return (
    <div className="bg-gradient-hero rounded-2xl p-8 shadow-card-custom text-primary-foreground max-w-6xl mx-auto">
      {/* Promo Banner - Full Width */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold leading-tight mb-2">
          <span className="text-white">0%</span> lãi suất cho khách hàng mới!
        </h1>
        <h2 className="text-3xl font-bold mb-2">
          Nhận tiền trong <span className="text-accent-red">5 phút</span> 24/7
        </h2>
        <p className="text-white/80 text-lg">
          109.884 khách hàng được vay online với 0% lãi suất và chi phí
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Left Column - Core Loan Info */}
        <div className="space-y-6">
          {/* Loan Amount Slider */}
          <div className="space-y-4">
            <Label className="text-white text-xl font-medium">Tôi cần vay tiền</Label>
            <div className="space-y-4">
              <Slider
                value={loanAmount}
                onValueChange={setLoanAmount}
                max={10000000}
                min={500000}
                step={500000}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-white/70">
                <span>500.000 Vnd</span>
                <span className="text-3xl font-bold text-white">{formatCurrency(loanAmount[0])}</span>
                <span>10.000.000 Vnd</span>
              </div>
            </div>
          </div>

          {/* Loan Term Selection */}
          <div className="space-y-3">
            <Label className="text-white text-xl font-medium">Kỳ hạn vay</Label>
            <RadioGroup 
              value={loanTerm.toString()} 
              onValueChange={(value) => setLoanTerm(parseInt(value) as 30 | 40)}
              className="flex space-x-6"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="30" id="term-30" className="w-5 h-5" />
                <Label htmlFor="term-30" className="text-white cursor-pointer text-lg">30 ngày</Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="40" id="term-40" className="w-5 h-5" />
                <Label htmlFor="term-40" className="text-white cursor-pointer text-lg">40 ngày</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Installment Options - Highlighted */}
          <div className="bg-white/20 rounded-xl p-6 border border-white/30">
            <h3 className="text-white font-bold text-xl mb-4 text-center">Tùy chọn trả góp</h3>
            <div className="space-y-3">
              <div className={`text-center p-3 rounded-lg transition-all ${loanTerm === 30 ? 'bg-white text-primary font-bold' : 'bg-white/10 text-white/80'}`}>
                <div className="text-sm">Góp 30 ngày</div>
                <div className="text-2xl font-bold">{formatCurrency(getDailyPayment(loanAmount[0], 30))}</div>
                <div className="text-xs">/ngày</div>
              </div>
              <div className={`text-center p-3 rounded-lg transition-all ${loanTerm === 40 ? 'bg-white text-primary font-bold' : 'bg-white/10 text-white/80'}`}>
                <div className="text-sm">Góp 40 ngày</div>
                <div className="text-2xl font-bold">{formatCurrency(getDailyPayment(loanAmount[0], 40))}</div>
                <div className="text-xs">/ngày</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Form + Payment Summary */}
        <div className="space-y-6">
          {/* Application Form */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 space-y-4 relative z-10">
            <h3 className="text-foreground font-bold text-xl text-center mb-4">Thông tin đăng ký</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName" className="text-foreground font-medium">Họ và tên</Label>
                <Input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 relative z-10 pointer-events-auto text-black placeholder:text-gray-500"
                  placeholder="Nhập họ và tên của bạn"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-foreground font-medium">Số điện thoại của bạn</Label>
                <Input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 relative z-10 pointer-events-auto text-black placeholder:text-gray-500"
                  placeholder="Nhập số điện thoại"
                />
              </div>
            </div>

            <Button 
              onClick={handleSubmit}
              size="xl"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-elegant"
              disabled={!agreed || !fullName || !phone || isChecking}
            >
              {isChecking ? "Đang kiểm tra..." : "ĐĂNG KÝ VAY"}
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

          {/* Payment Summary */}
          <div className="bg-white/20 rounded-xl p-6 border border-white/30">
            <h3 className="text-white font-bold text-xl mb-4 text-center">Tổng quan khoản vay</h3>
            
            {/* Key Payment Info */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <Label className="text-white/70 text-sm">Ngày thanh toán đầu tiên</Label>
                <p className="text-white font-bold text-lg">{firstPaymentDate}</p>
              </div>
              <div className="text-center">
                <Label className="text-white/70 text-sm">Số tiền mỗi ngày</Label>
                <p className="text-white font-bold text-lg">{formatCurrency(currentDailyPayment)}</p>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Số tiền vay:</span>
                <span className="text-white font-semibold">{formatCurrency(loanAmount[0])}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Lãi suất:</span>
                <span className="text-white font-semibold">{interestRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Tổng lãi:</span>
                <span className="text-white font-semibold">{formatCurrency(totalInterest)}</span>
              </div>
              <hr className="border-white/20" />
              <div className="flex justify-between text-lg font-bold">
                <span className="text-white">Tổng trả:</span>
                <span className="text-white">{formatCurrency(totalRepayment)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};