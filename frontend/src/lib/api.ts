export interface Step1Request {
  fullName: string;
  phoneNumber: string;
  loanAmount: number;
  loanTerm: 30 | 40;
}

export interface Step1Response {
  loanApplicationId: string;
  message: string;
  loanAmount: number;
  loanTerm: number;
  dailyPayment: number;
}

export interface CheckExistingResponse {
  exists: boolean;
  canContinue: boolean;
  message?: string;
  currentStep?: number;
  loanApplicationId?: string;
}

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface Step2Request {
  loanApplicationId: string;
  gender: Gender;
  dob: string; // yyyy-mm-dd
  identityNumber: string; // 9-12 digits
  phoneBrand: string;
  location: string;
}

export interface Step3Request {
  loanApplicationId: string;
  relativePhone: string; // vi-VN
  companyPhone: string; // 10-11 digits
  bankAccount: string; // 8-20 digits
  bankName: string;
}

export interface SendOtpResponse {
  message: string;
  expiresIn: number;
}

export interface LoginResponse {
  accessToken: string;
  phoneNumber: string;
  expiresIn: number;
}

export interface LoanApplication {
  _id?: string;
  loanApplicationId: string;
  fullName: string;
  phoneNumber: string;
  loanAmount?: number;
  loanTerm?: number;
  dailyPayment?: number;
  totalRepayment?: number;
  gender?: string;
  dob?: Date;
  identityNumber?: string;
  phoneBrand?: string;
  location?: string;
  relativePhone?: string;
  companyPhone?: string;
  bankAccount?: string;
  bankName?: string;
  status: 'PENDING' | 'CONTACTED' | 'APPROVED' | 'REJECTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  currentStep: number;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoanStatistics {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  completedApplications: number;
  totalLoanAmount: number;
  totalPayment: number;
  approvedAmount: number;
  pendingAmount: number;
}

export interface LoanApplicationsResponse {
  data: LoanApplication[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function http<T>(path: string, options: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

export const api = {
  async checkExistingApplication(phoneNumber: string): Promise<CheckExistingResponse> {
    const response = await fetch(`${API_BASE_URL}/api/loan/check-existing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to check existing application');
    }

    return response.json();
  },

  async sendOtp(payload: { phoneNumber: string; email: string }): Promise<SendOtpResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send OTP');
    }

    return response.json();
  },

  async verifyOtpAndLogin(payload: { phoneNumber: string; email: string; otp: string }): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to verify OTP and login');
    }
    return response.json();
  },

  // Loan Management APIs
  async getMyLoanApplications(token: string, query?: { page?: number; limit?: number; status?: string }): Promise<LoanApplicationsResponse> {
    const queryParams = new URLSearchParams();
    if (query?.page) queryParams.append('page', query.page.toString());
    if (query?.limit) queryParams.append('limit', query.limit.toString());
    if (query?.status) queryParams.append('status', query.status);

    const response = await fetch(`${API_BASE_URL}/api/client/loans/my-applications?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch loan applications');
    }
    return response.json();
  },

  async getMyLoanApplication(token: string, loanId: string): Promise<LoanApplication> {
    const response = await fetch(`${API_BASE_URL}/api/client/loans/my-applications/${loanId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch loan application');
    }
    return response.json();
  },

  async getMyLoanStatistics(token: string): Promise<LoanStatistics> {
    const response = await fetch(`${API_BASE_URL}/api/client/loans/statistics`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch loan statistics');
    }
    return response.json();
  },

  async getMyLoanSummary(token: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/client/loans/summary`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch loan summary');
    }
    return response.json();
  },

  async getRecentLoanActivity(token: string): Promise<LoanApplication[]> {
    const response = await fetch(`${API_BASE_URL}/api/client/loans/recent-activity`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch recent activity');
    }
    return response.json();
  },

  step1(payload: Step1Request) {
    return http<Step1Response>('/api/loan/step1', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  step2(payload: Step2Request) {
    return http<{ message: string }>('/api/loan/step2', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  step3(payload: Step3Request) {
    return http<{ message: string }>('/api/loan/step3', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};


