import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/contexts/ToastContext";
import { useAuthContext } from "@/App";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Loader2, Phone } from "lucide-react";
import { ALOHeader } from "@/components/ALOHeader";

export const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { showError, showSuccess, showInfo } = useToast();
  const { login } = useAuthContext();
  const navigate = useNavigate();

  const handleRequestOtp = async () => {
    if (!phoneNumber || !email) {
      showError("Lỗi", "Vui lòng nhập đầy đủ số điện thoại và email");
      return;
    }

    // Validate phone number format (Vietnamese)
    const phoneRegex = /^(0|\+84)(3[2-9]|5[689]|7[06-9]|8[1-689]|9[0-46-9])[0-9]{7}$/;
    if (!phoneRegex.test(phoneNumber)) {
      showError("Lỗi", "Số điện thoại không đúng định dạng Việt Nam");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError("Lỗi", "Email không đúng định dạng");
      return;
    }

    setIsRequestingOtp(true);
    try {
      // Kiểm tra số điện thoại có trong database và có hợp đồng chưa
      const existingCheck = await api.checkExistingApplication(phoneNumber);
      
      if (!existingCheck.exists) {
        showError(
          "Số điện thoại không tồn tại",
          "Số điện thoại này chưa được đăng ký trong hệ thống. Vui lòng đăng ký vay trước khi đăng nhập."
        );
        setIsRequestingOtp(false);
        return;
      }

      // Nếu có số điện thoại trong hệ thống thì cho phép tiếp tục (kể cả có hồ sơ)
      // Không cần kiểm tra canContinue nữa

      // Gửi OTP cho số điện thoại và gửi qua email
      await api.sendOtp({ phoneNumber, email });
      showSuccess(
        "OTP đã được gửi!",
        `Mã OTP đã được gửi đến email ${email} cho số điện thoại ${phoneNumber}. Vui lòng kiểm tra hộp thư.`
      );
      setShowOtpInput(true);
    } catch (error: any) {
      showError(
        "Lỗi gửi OTP",
        error.message || "Không thể gửi OTP. Vui lòng kiểm tra lại số điện thoại và email."
      );
    } finally {
      setIsRequestingOtp(false);
    }
  };

  const handleLogin = async () => {
    if (!phoneNumber || !email || !otp) {
      showError("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setIsLoggingIn(true);
    try {
      // Đăng nhập với số điện thoại, email và OTP
      const response = await api.verifyOtpAndLogin({ phoneNumber, email, otp });
      
      // Sử dụng hook useAuth để đăng nhập
      login({
        email: response.phoneNumber, // Sử dụng phoneNumber làm identifier
        accessToken: response.accessToken
      });
      
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

      showSuccess(
        "Đăng nhập thành công!",
        "Chào mừng bạn quay trở lại ALO 15S"
      );

      // Chuyển hướng đến trang quản lý khoản vay sau 1 giây
      setTimeout(() => {
        navigate('/loan-management');
      }, 1000);

    } catch (error: any) {
      showError(
        "Đăng nhập thất bại",
        error.message || "Thông tin đăng nhập không đúng. Vui lòng thử lại."
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <ALOHeader />
      
      {/* Main Content */}
      <div className="flex items-center justify-center p-4 pt-8">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={handleBackToHome}
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại trang chủ
          </Button>

          {/* Login Card */}
          <div className="bg-gradient-hero rounded-2xl p-8 shadow-card-custom text-primary-foreground">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="text-center">
                  <h1 className="text-4xl font-bold">
                    <span className="text-red-500">15</span><span className="text-green-700">S</span>
                  </h1>
                  <p className="text-sm text-white/80">Tiền về liền tay</p>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Đăng nhập vào tài khoản
              </h1>
              <p className="text-white/80">
                Sử dụng OTP để đăng nhập an toàn
              </p>
            </div>

            {/* Login Form */}
            <div className="space-y-6">
              {/* Phone Number Input */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-white font-medium">
                  Số điện thoại
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Nhập số điện thoại của bạn"
                    className="pl-10 bg-white/95 backdrop-blur-sm border-white/30 text-foreground placeholder:text-gray-500"
                    disabled={showOtpInput}
                  />
                </div>
                <p className="text-xs text-white/70">
                  Số điện thoại đã đăng ký trong hệ thống
                </p>
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white font-medium">
                  Email nhận OTP
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập email để nhận OTP"
                    className="pl-10 bg-white/95 backdrop-blur-sm border-white/30 text-foreground placeholder:text-gray-500"
                    disabled={showOtpInput}
                  />
                </div>
                <p className="text-xs text-white/70">
                  Email sẽ nhận mã OTP (có thể khác email đăng ký)
                </p>
              </div>

              {/* OTP Input - Only show after requesting OTP */}
              {showOtpInput && (
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-white font-medium">
                    Mã OTP
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                    <Input
                      id="otp"
                      type={showPassword ? "text" : "password"}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Nhập mã OTP 4 số"
                      className="pl-10 pr-10 bg-white/95 backdrop-blur-sm border-white/30 text-foreground placeholder:text-gray-500"
                      maxLength={4}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-white/70">
                    Mã OTP đã được gửi đến email {email} cho số điện thoại {phoneNumber}
                  </p>
                </div>
              )}

              {/* Remember Me */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="border-white/30 data-[state=checked]:bg-white data-[state=checked]:text-primary"
                />
                <Label htmlFor="rememberMe" className="text-white text-sm cursor-pointer">
                  Ghi nhớ đăng nhập
                </Label>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {!showOtpInput ? (
                  <Button
                    onClick={handleRequestOtp}
                    disabled={isRequestingOtp || !phoneNumber || !email}
                    className="w-full bg-white text-primary hover:bg-white/90 font-semibold shadow-elegant"
                    size="lg"
                  >
                    {isRequestingOtp ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang gửi OTP...
                      </>
                    ) : (
                      "Gửi mã OTP"
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleLogin}
                    disabled={isLoggingIn || !otp}
                    className="w-full bg-success hover:bg-success/90 text-white font-semibold shadow-elegant"
                    size="lg"
                  >
                    {isLoggingIn ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang đăng nhập...
                      </>
                    ) : (
                      "Đăng nhập"
                    )}
                  </Button>
                )}

                {showOtpInput && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowOtpInput(false);
                      setOtp("");
                    }}
                    className="w-full bg-transparent border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 font-semibold"
                    size="lg"
                  >
                    Gửi lại OTP
                  </Button>
                )}
              </div>

              {/* Additional Info */}
              <div className="text-center">
                <p className="text-white/70 text-sm">
                  Chưa có tài khoản?{" "}
                  <button
                    onClick={() => navigate('/')}
                    className="text-white underline hover:text-white/80"
                  >
                    Đăng ký vay ngay
                  </button>
                </p>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="text-center mt-6">
            <p className="text-muted-foreground text-sm">
              Bằng việc đăng nhập, bạn đồng ý với{" "}
              <a href="/terms" className="text-primary underline hover:text-primary/80">
                Điều khoản sử dụng
              </a>{" "}
              và{" "}
              <a href="/privacy" className="text-primary underline hover:text-primary/80">
                Chính sách bảo mật
              </a>{" "}
              của ALO 15S
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
