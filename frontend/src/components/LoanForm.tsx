  import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, LoanApplication } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/contexts/ToastContext";
import { useAuthContext } from "@/App";

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
  const { isAuthenticated } = useAuthContext();
  const navigate = useNavigate();

  const [canRepeatLoan, setCanRepeatLoan] = useState(false);
  const [prefillName, setPrefillName] = useState("");
  const [prefillPhone, setPrefillPhone] = useState("");

  useEffect(() => {
    const checkLast = async () => {
      try {
        if (!isAuthenticated) return;
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        const resp = await api.getMyLoanApplications(token, { page: 1, limit: 5 });
        const apps: LoanApplication[] = resp.data || [];
        if (!apps.length) return;
        const latest = apps
          .slice()
          .sort((a: any, b: any) => new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime())[0];
        if (latest && latest.status === 'COMPLETED') {
          setCanRepeatLoan(true);
          setPrefillName(latest.fullName || "");
          setPrefillPhone(latest.phoneNumber || "");
          setFullName(latest.fullName || "");
          setPhone(latest.phoneNumber || "");
        }
      } catch {}
    };
    checkLast();
  }, [isAuthenticated]);

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
    
    if (!agreed || (!canRepeatLoan && (!fullName || !phone))) {
      console.log('❌ Validation failed, showing error toast');
      showError(
        "Thông tin không đầy đủ", 
        "Vui lòng điền đầy đủ thông tin và đồng ý với điều khoản"
      );
      return;
    }

    setIsChecking(true);
    try {
      const usedPhone = canRepeatLoan ? prefillPhone : phone;
      const usedName = canRepeatLoan ? prefillName : fullName;
      console.log('🔍 Checking existing application for phone:', usedPhone);
      // Kiểm tra hồ sơ tồn tại
      const existingCheck = await api.checkExistingApplication(usedPhone.replace(/\s+/g, ''));
      console.log('📋 Existing check result:', existingCheck);
      
      if (!canRepeatLoan && existingCheck.exists) {
        if (!existingCheck.canContinue) {
          // Hồ sơ đã hoàn thành hoặc không thể tiếp tục
          console.log('⚠️ Application cannot continue:', existingCheck.message);
          
          // Kiểm tra xem hồ sơ đã hoàn thành chưa
          if (existingCheck.currentStep === 3) {
            showInfo(
              "Hồ sơ đã hoàn thành",
              (existingCheck.message || "Hồ sơ của bạn đã hoàn thành.") + " Vui lòng đăng nhập để theo dõi và quản lý hồ sơ."
            );
            setTimeout(() => navigate('/login'), 1200);
          } else {
            showInfo(
              "Hồ sơ đã tồn tại",
              (existingCheck.message || "Bạn đã có hồ sơ trong hệ thống.") + " Vui lòng đăng nhập để tiếp tục hoặc theo dõi trạng thái."
            );
            setTimeout(() => navigate('/login'), 1200);
          }
          
          setIsChecking(false);
          return;
        } else {
          // Hồ sơ có thể tiếp tục - lưu thông tin để chuyển tới step tiếp theo
          console.log('ℹ️ Continuing application at step:', existingCheck.currentStep);
          
          if (existingCheck.loanApplicationId) {
            localStorage.setItem('loanApplicationId', existingCheck.loanApplicationId);
            localStorage.setItem('existingApplicationStep', existingCheck.currentStep?.toString() || '1');
          }
          
          showInfo(
            "Tiếp tục hồ sơ",
            existingCheck.message || `Chuyển tới bước ${(existingCheck.currentStep || 1) + 1} của hồ sơ`
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
        fullName: usedName,
        phoneNumber: usedPhone.replace(/\s+/g, ''),
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
    <div className="bg-gradient-hero rounded-xl p-5 shadow-card-custom text-primary-foreground max-w-4xl mx-auto">
      {/* Promo Banner - Full Width */}
      <div className="text-center mb-5">
        <h1 className="text-2xl font-bold leading-tight mb-1">
          <span className="text-white">0%</span> lãi suất cho khách hàng mới!
        </h1>
        <h2 className="text-xl font-bold">
          Nhận tiền trong <span className="text-accent-red">5 phút</span> 24/7
        </h2>
        <p className="text-white/80 text-sm mt-1">
          109.884 khách hàng được vay online với 0% lãi suất và chi phí
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 items-start">
        {/* Column 1 - Mobile first */}
        <div className="space-y-3 order-1">
          {/* Application Form */}
          <div className="bg-white/95 backdrop-blur-sm rounded-md p-3 space-y-2.5 relative z-10">
            <h3 className="text-foreground font-bold text-sm text-center mb-2">Thông tin đăng ký</h3>
            
            {/* Loan Summary - Mobile only - right at the top of the form */}
            <div className="mb-3 space-y-3 block lg:hidden">
              <div className="bg-orange-50 border border-orange-100 p-2 rounded-md">
                <div className="flex flex-col">
                  <div className="text-primary font-medium text-xs mb-1">Tôi cần vay tiền</div>
                  <div className="text-lg font-bold text-primary text-center">{formatCurrency(loanAmount[0])}</div>
                  <div className="pt-2">
                    <Slider
                      value={loanAmount}
                      onValueChange={setLoanAmount}
                      max={10000000}
                      min={1000000}
                      step={500000}
                      className="w-full h-1"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>1M</span>
                      <span>10M</span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 px-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Kỳ hạn vay</span>
                    <div className="flex space-x-3">
                      <div 
                        className="flex items-center space-x-1 cursor-pointer"
                        onClick={() => setLoanTerm(30)}
                      >
                        <div className={`w-3 h-3 rounded-full ${loanTerm === 30 ? 'bg-primary' : 'bg-gray-300'}`}></div>
                        <span className={`text-xs ${loanTerm === 30 ? 'text-primary font-medium' : 'text-gray-600'}`}>30 ngày</span>
                      </div>
                      <div 
                        className="flex items-center space-x-1 cursor-pointer"
                        onClick={() => setLoanTerm(40)}
                      >
                        <div className={`w-3 h-3 rounded-full ${loanTerm === 40 ? 'bg-primary' : 'bg-gray-300'}`}></div>
                        <span className={`text-xs ${loanTerm === 40 ? 'text-primary font-medium' : 'text-gray-600'}`}>40 ngày</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-1.5 flex justify-between items-center px-2">
                  <span className="text-xs text-gray-600">Tùy chọn trả góp:</span>
                  <span className="text-sm font-bold text-primary">{formatCurrency(getDailyPayment(loanAmount[0], loanTerm))}/ngày</span>
                </div>
                <div className="mt-1.5 flex justify-between items-center px-2 border-t border-orange-100 pt-1.5">
                  <span className="text-xs text-gray-600">Tổng số:</span>
                  <span className="text-sm font-bold text-primary">{formatCurrency(totalRepayment)}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2.5">
              <div>
                <Label htmlFor="fullName" className="text-foreground font-medium text-xs">Họ và tên</Label>
                <Input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`mt-0.5 relative z-10 pointer-events-auto text-black placeholder:text-gray-400 h-8 text-xs ${canRepeatLoan ? 'bg-gray-100' : ''}`}
                  placeholder="Nhập họ và tên của bạn"
                  disabled={canRepeatLoan}
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-foreground font-medium text-xs">Số điện thoại của bạn</Label>
                <Input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`mt-0.5 relative z-10 pointer-events-auto text-black placeholder:text-gray-400 h-8 text-xs ${canRepeatLoan ? 'bg-gray-100' : ''}`}
                  placeholder="Nhập số điện thoại"
                  disabled={canRepeatLoan}
                />
              </div>
            </div>

            <Button 
              onClick={handleSubmit}
              size="sm"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm text-sm font-bold py-1.5"
              disabled={!agreed || !fullName || !phone || isChecking}
            >
              {isChecking ? "Đang kiểm tra..." : "ĐĂNG KÝ VAY"}
            </Button>

            <div className="flex items-start space-x-1.5">
              <Checkbox 
                id="terms"
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked as boolean)}
                className="mt-0.5 w-3 h-3"
              />
              <label htmlFor="terms" className="text-[10px] text-muted-foreground leading-tight">
                Bằng việc chọn ở đây, tôi xác nhận rằng tôi đã đọc và hiểu đầy đủ các{" "}
                <a href="/terms" className="text-primary underline">điều khoản</a>, {" "}
                <a href="/conditions" className="text-primary underline">điều kiện</a> và{" "}
                <a href="/privacy" className="text-primary underline">Chính sách quyền riêng tư</a> được đưa ra bởi 15S.
              </label>
            </div>
          </div>
          
          {/* Hidden on mobile since we've added the summary at the top of the form */}
          <div className="hidden">
            {/* These components are now shown in the form summary */}
          </div>


          {/* Payment Summary */}
          <div className="bg-white/15 rounded-md p-3 border border-white/20">
            <h3 className="text-white font-bold text-sm mb-2 text-center">Tổng quan khoản vay</h3>
            
            {/* Key Payment Info */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="text-center">
                <Label className="text-white/70 text-[10px]">Ngày thanh toán đầu tiên</Label>
                <p className="text-white font-bold text-sm">{firstPaymentDate}</p>
              </div>
              <div className="text-center">
                <Label className="text-white/70 text-[10px]">Số tiền mỗi ngày</Label>
                <p className="text-white font-bold text-sm">{formatCurrency(currentDailyPayment)}</p>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-white/70">Số tiền vay:</span>
                <span className="text-white font-semibold">{formatCurrency(loanAmount[0])}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-white/70">Lãi suất:</span>
                <span className="text-white font-semibold">{interestRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-white/70">Tổng lãi:</span>
                <span className="text-white font-semibold">{formatCurrency(totalInterest)}</span>
              </div>
              <hr className="border-white/20" />
              <div className="flex justify-between text-sm font-bold">
                <span className="text-white">Tổng trả:</span>
                <span className="text-white">{formatCurrency(totalRepayment)}</span>
              </div>
            </div>
          </div>
          
          {/* Loan Total - Desktop only */}
          <div className="bg-white/15 rounded-md p-2 border border-white/20 hidden lg:block">
            <div className="flex justify-between items-center">
              <span className="text-white/80 text-xs">Tổng số:</span>
              <span className="text-white font-bold text-base">{formatCurrency(totalRepayment)}</span>
            </div>
          </div>
        </div>

        {/* Loan Info Section - Desktop only */}
        <div className="space-y-3 order-2 lg:order-1 hidden lg:block">
          {/* Loan Amount Slider - Desktop */}
          <div className="space-y-2">
            <Label className="text-white text-sm font-medium">Tôi cần vay tiền</Label>
            <div className="space-y-2">
              <div className="text-xl font-bold text-white text-center mb-2">{formatCurrency(loanAmount[0])}</div>
              <Slider
                value={loanAmount}
                onValueChange={setLoanAmount}
                max={10000000}
                min={1000000}
                step={500000}
                className="w-full h-1"
              />
              <div className="flex justify-between text-xs text-white/70">
                <span>1.000.000</span>
                <span>10.000.000</span>
              </div>
            </div>
          </div>

          {/* Loan Term Selection - Desktop */}
          <div className="space-y-1">
            <Label className="text-white text-sm font-medium">Kỳ hạn vay</Label>
            <RadioGroup 
              value={loanTerm.toString()} 
              onValueChange={(value) => setLoanTerm(parseInt(value) as 30 | 40)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-1.5">
                <RadioGroupItem value="30" id="term-30" className="w-3.5 h-3.5" />
                <Label htmlFor="term-30" className="text-white cursor-pointer text-sm">30 ngày</Label>
              </div>
              <div className="flex items-center space-x-1.5">
                <RadioGroupItem value="40" id="term-40" className="w-3.5 h-3.5" />
                <Label htmlFor="term-40" className="text-white cursor-pointer text-sm">40 ngày</Label>
              </div>
            </RadioGroup>
          </div>
          


          {/* Installment Options - Highlighted - Desktop only */}
          <div className="bg-white/15 rounded-md p-3 border border-white/20 hidden lg:block">
            <h3 className="text-white font-bold text-sm mb-2 text-center">Tùy chọn trả góp</h3>
            <div className="space-y-1.5">
              <div className={`text-center p-1.5 rounded-md transition-all ${loanTerm === 30 ? 'bg-white text-primary font-bold' : 'bg-white/10 text-white/80'}`}>
                <div className="text-xs">Góp 30 ngày</div>
                <div className="text-base font-bold">{formatCurrency(getDailyPayment(loanAmount[0], 30))}</div>
                <div className="text-[10px]">/ngày</div>
              </div>
              <div className={`text-center p-1.5 rounded-md transition-all ${loanTerm === 40 ? 'bg-white text-primary font-bold' : 'bg-white/10 text-white/80'}`}>
                <div className="text-xs">Góp 40 ngày</div>
                <div className="text-base font-bold">{formatCurrency(getDailyPayment(loanAmount[0], 40))}</div>
                <div className="text-[10px]">/ngày</div>
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};