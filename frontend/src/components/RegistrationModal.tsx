import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { api, Gender } from "@/lib/api";
import React from "react";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegistrationModal = ({ isOpen, onClose }: RegistrationModalProps) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    gender: "",
    birthDate: "",
    cccdNumber: "",
    phoneInUse: "",
    iphoneModel: "",
    location: "",
    relativePhone: "",
    employerPhone: "",
    bankAccount: "",
    bankName: ""
  });
  const [loanApplicationId, setLoanApplicationId] = useState<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem('loanApplicationId') : null,
  );

  // Kiểm tra step hiện tại từ localStorage khi modal mở
  React.useEffect(() => {
    if (isOpen && loanApplicationId) {
      const existingStep = localStorage.getItem('existingApplicationStep');
      if (existingStep) {
        const stepNumber = parseInt(existingStep);
        if (stepNumber > 1 && stepNumber <= 3) {
          setStep(stepNumber);
        }
      }
      // Load thông tin đã có từ localStorage
      loadFormData();
    }
  }, [isOpen, loanApplicationId]);

  // Load thông tin form từ localStorage
  const loadFormData = () => {
    const savedData = localStorage.getItem(`formData_${loanApplicationId}`);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(prev => ({ ...prev, ...parsedData }));
      } catch (e) {
        console.error('Error loading form data:', e);
      }
    }
  };

  // Save thông tin form vào localStorage
  const saveFormData = () => {
    if (loanApplicationId) {
      localStorage.setItem(`formData_${loanApplicationId}`, JSON.stringify(formData));
    }
  };

  // Auto-save khi form thay đổi
  React.useEffect(() => {
    if (loanApplicationId) {
      saveFormData();
    }
  }, [formData, loanApplicationId]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
    if (step === 1) {
      // Validate step 1
      if (!formData.gender || !formData.birthDate || !formData.cccdNumber || !formData.location) {
        alert('Vui lòng điền đầy đủ thông tin bước 1');
        return;
      }
      
      if (loanApplicationId) {
        try {
          setIsLoading(true);
          await api.step2({
            loanApplicationId,
            gender: (formData.gender === 'male' ? 'MALE' : formData.gender === 'female' ? 'FEMALE' : 'OTHER') as Gender,
            dob: formData.birthDate,
            identityNumber: formData.cccdNumber,
            phoneBrand: formData.phoneInUse || formData.iphoneModel || 'Unknown',
            location: formData.location,
          });
          setStep(2);
          localStorage.setItem('existingApplicationStep', '2');
        } catch (e) {
          alert('Vui lòng kiểm tra lại thông tin bước 1.');
        } finally {
          setIsLoading(false);
        }
      }
      return;
    }
    
    if (step === 2) {
      // Validate step 2
      if (!formData.relativePhone || !formData.employerPhone || !formData.bankAccount || !formData.bankName) {
        alert('Vui lòng điền đầy đủ thông tin bước 2');
        return;
      }
      
      if (loanApplicationId) {
        try {
          setIsLoading(true);
          await api.step3({
            loanApplicationId,
            relativePhone: formData.relativePhone,
            companyPhone: formData.employerPhone,
            bankAccount: formData.bankAccount,
            bankName: formData.bankName,
          });
          setStep(3);
          localStorage.setItem('existingApplicationStep', '3');
        } catch (e) {
          alert('Vui lòng kiểm tra lại thông tin bước 2.');
        } finally {
          setIsLoading(false);
        }
      }
      return;
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      localStorage.setItem('existingApplicationStep', (step - 1).toString());
    }
  };

  const handleSubmit = async () => {
    if (!loanApplicationId) return;
    setIsSubmitting(true);
    try {
      await api.step3({
        loanApplicationId,
        relativePhone: formData.relativePhone,
        companyPhone: formData.employerPhone,
        bankAccount: formData.bankAccount,
        bankName: formData.bankName,
      });
      setStep(3);
      localStorage.setItem('existingApplicationStep', '3');
    } catch (e) {
      alert('Vui lòng kiểm tra lại thông tin bước 2.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderProgressBar = () => (
    <div className="flex items-center justify-center mb-6">
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer ${
            step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`} onClick={() => step > 1 && setStep(1)}>
            1
          </div>
          <div className={`w-8 h-0.5 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
        </div>
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer ${
            step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`} onClick={() => step > 2 && setStep(2)}>
            2
          </div>
          <div className={`w-8 h-0.5 ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
        </div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer ${
            step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`} onClick={() => step === 3 && setStep(3)}>
            3
          </div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold text-center mb-2">Chào bạn!</h3>
      <p className="text-muted-foreground text-center mb-6">
        Vui lòng điền thông tin cá nhân của bạn một cách cẩn thận, điều này là cần thiết để được 
        duyệt và cấp cho bạn các điều khoản vay tốt hơn.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="gender">Giới tính</Label>
          <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn giới tính" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Nam</SelectItem>
              <SelectItem value="female">Nữ</SelectItem>
              <SelectItem value="other">Khác</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="birthDate">Ngày tháng năm sinh</Label>
          <Input 
            type="date" 
            value={formData.birthDate}
            onChange={(e) => handleInputChange('birthDate', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="cccdNumber">Số CCCD</Label>
          <Input 
            placeholder="Nhập số CCCD"
            value={formData.cccdNumber}
            onChange={(e) => handleInputChange('cccdNumber', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="phoneInUse">Nhãn hiệu điện thoại bạn đang sử dụng</Label>
          <Select value={formData.phoneInUse} onValueChange={(value) => handleInputChange('phoneInUse', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Vui lòng chọn..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="iphone">iPhone</SelectItem>
              <SelectItem value="samsung">Samsung</SelectItem>
              <SelectItem value="oppo">OPPO</SelectItem>
              <SelectItem value="xiaomi">Xiaomi</SelectItem>
              <SelectItem value="vivo">Vivo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="iphoneModel">Loại điện thoại iPhone</Label>
          <Input 
            placeholder="VD: iPhone 14 Pro Max"
            value={formData.iphoneModel}
            onChange={(e) => handleInputChange('iphoneModel', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="location">Vị trí của bạn</Label>
          <Input 
            placeholder="Nhập địa chỉ của bạn"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <Button onClick={handleNext} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            <>
              Tiếp tục
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-center mb-4">Thông tin liên hệ</h3>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="relativePhone">Số điện thoại người thân</Label>
          <Input 
            placeholder="Nhập số điện thoại người thân"
            value={formData.relativePhone}
            onChange={(e) => handleInputChange('relativePhone', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="employerPhone">Số điện thoại nhà tuyển dụng/đồng nghiệp</Label>
          <Input 
            placeholder="Nhập số điện thoại công ty"
            value={formData.employerPhone}
            onChange={(e) => handleInputChange('employerPhone', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="bankAccount">STK Ngân hàng</Label>
          <Input 
            placeholder="Nhập số tài khoản ngân hàng"
            value={formData.bankAccount}
            onChange={(e) => handleInputChange('bankAccount', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="bankName">Tên Ngân hàng</Label>
          <Select value={formData.bankName} onValueChange={(value) => handleInputChange('bankName', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn ngân hàng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="agribank">Agribank</SelectItem>
              <SelectItem value="abbank">ABBank</SelectItem>
              <SelectItem value="baovietbank">BaoViet Bank</SelectItem>
              <SelectItem value="vietcapitalbank">Viet Capital Bank</SelectItem>
              <SelectItem value="bacabank">Bac A Bank</SelectItem>
              <SelectItem value="vietinbank">VietinBank</SelectItem>
              <SelectItem value="bidv">BIDV</SelectItem>
              <SelectItem value="dongabank">DongA Bank</SelectItem>
              <SelectItem value="seabank">SeABank</SelectItem>
              <SelectItem value="eximbank">Eximbank</SelectItem>
              <SelectItem value="msb">MSB</SelectItem>
              <SelectItem value="kienlongbank">Kienlongbank</SelectItem>
              <SelectItem value="techcombank">Techcombank</SelectItem>
              <SelectItem value="namabank">Nam A Bank</SelectItem>
              <SelectItem value="vietcombank">Vietcombank</SelectItem>
              <SelectItem value="hdbank">HDBank</SelectItem>
              <SelectItem value="ocb">OCB</SelectItem>
              <SelectItem value="mbbank">MBBank</SelectItem>
              <SelectItem value="ncb">NCB</SelectItem>
              <SelectItem value="vib">VIB</SelectItem>
              <SelectItem value="scb">SCB</SelectItem>
              <SelectItem value="saigonbank">Saigonbank</SelectItem>
              <SelectItem value="sacombank">Sacombank</SelectItem>
              <SelectItem value="shb">SHB</SelectItem>
              <SelectItem value="tpbank">TPBank</SelectItem>
              <SelectItem value="vietabank">VietABank</SelectItem>
              <SelectItem value="vpbank">VPBank</SelectItem>
              <SelectItem value="acb">ACB</SelectItem>
              <SelectItem value="shinhanbank">Shinhan Bank</SelectItem>
              <SelectItem value="standardchartered">Standard Chartered</SelectItem>
              <SelectItem value="hsbc">HSBC</SelectItem>
              <SelectItem value="uob">UOB</SelectItem>
              <SelectItem value="cimbbank">CIMB</SelectItem>
              <SelectItem value="wooribank">Woori Bank</SelectItem>
              <SelectItem value="publicbank">Public Bank</SelectItem>
              <SelectItem value="indovina">Indovina Bank</SelectItem>
              <SelectItem value="vrbank">Viet-Nga Bank (VRB)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
        <Button onClick={handleNext} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            <>
              Tiếp tục
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );

  // Hàm xử lý khi hoàn tất - reset lại tất cả
  const handleComplete = () => {
    // Reset form data
    setFormData({
      gender: "",
      birthDate: "",
      cccdNumber: "",
      phoneInUse: "",
      iphoneModel: "",
      location: "",
      relativePhone: "",
      employerPhone: "",
      bankAccount: "",
      bankName: ""
    });
    
    // Reset step về 1
    setStep(1);
    
    // Xóa dữ liệu từ localStorage
    if (loanApplicationId) {
      localStorage.removeItem(`formData_${loanApplicationId}`);
      localStorage.removeItem('existingApplicationStep');
    }
    
    // Đóng modal
    onClose();
    
    // Sau 3 giây, refresh lại trang web
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  };

  const renderStep3 = () => (
    <div className="text-center py-8">
      <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
      <h3 className="text-2xl font-bold mb-4 text-success">Thành công!</h3>
      <p className="text-lg text-muted-foreground mb-2">Hồ sơ đang được xét duyệt</p>
      <p className="text-sm text-muted-foreground mb-6">
        Chúng tôi sẽ liên hệ với bạn trong vòng 5-15 phút
      </p>
      <p className="text-xs text-muted-foreground mb-4">
        Trang sẽ tự động làm mới sau 3 giây...
      </p>
      <div className="flex justify-center">
        <Button onClick={handleComplete} className="bg-success hover:bg-success/90">
          Tiếp tục
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        // Khi đóng modal (click dấu X hoặc click outside), reset lại trang
        handleComplete();
      }
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="text-center mb-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">A15</span>
              </div>
              <span className="text-xl font-bold text-primary">ALO 15S</span>
            </div>
          </div>
          {renderProgressBar()}
        </DialogHeader>
        
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </DialogContent>
    </Dialog>
  );
};