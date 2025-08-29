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

// Admin Dashboard Interfaces
export interface AdminDashboardStats {
  totalLoans: number;
  totalAmount: number;
  pendingLoans: number;
  approvedLoans: number;
  rejectedLoans: number;
  completedLoans: number;
  todayLoans: number;
  thisWeekLoans: number;
  thisMonthLoans: number;
}

export interface AdminRecentLoan {
  _id: string;
  loanApplicationId: string;
  fullName: string;
  phoneNumber: string;
  loanAmount: number;
  status: string;
  createdAt: string;
}

export interface AdminDashboardResponse {
  statistics: AdminDashboardStats;
  recentLoans: AdminRecentLoan[];
  adminInfo: {
    id: string;
    username: string;
    role: string;
    permissions: string[];
  };
}

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface AdminLoginResponse {
  accessToken: string;
  admin: {
    id: string;
    username: string;
    fullName: string;
    email: string;
    role: string;
    permissions: string[];
  };
}

const envApiUrl = import.meta.env.VITE_API_URL as string | undefined;
const envAdminKey = import.meta.env.VITE_ADMIN_API_KEY as string | undefined;

if (!envApiUrl) {
  console.error('[ENV] Missing VITE_API_URL. Please set it in your .env files.');
}
if (!envAdminKey) {
  console.warn('[ENV] Missing VITE_ADMIN_API_KEY. Admin endpoints may fail.');
}

const API_BASE_URL = envApiUrl ?? '';
const ADMIN_API_KEY = envAdminKey ?? '';

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

  // Admin APIs
  async adminLogin(loginData: AdminLoginRequest): Promise<AdminLoginResponse> {
    const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Admin login failed');
    }
    
    return response.json();
  },

  async getAdminDashboard(token: string): Promise<AdminDashboardResponse> {
    const response = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-admin-api-key': ADMIN_API_KEY,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch admin dashboard data');
    }
    
    return response.json();
  },

  async getAdminStatistics(token: string): Promise<AdminDashboardStats> {
    const response = await fetch(`${API_BASE_URL}/api/admin/statistics`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-admin-api-key': ADMIN_API_KEY,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch admin statistics');
    }
    
    return response.json();
  },

  async getAdminLoans(token: string, query?: { page?: number; limit?: number; status?: string }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (query?.page) queryParams.append('page', query.page.toString());
    if (query?.limit) queryParams.append('limit', query.limit.toString());
    if (query?.status) queryParams.append('status', query.status);

    const response = await fetch(`${API_BASE_URL}/api/admin/loans?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-admin-api-key': ADMIN_API_KEY,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch admin loans');
    }
    
    return response.json();
  },

  async getAdminLoanById(token: string, id: string): Promise<LoanApplication> {
    const response = await fetch(`${API_BASE_URL}/api/admin/loans/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-admin-api-key': ADMIN_API_KEY,
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch loan detail');
    }
    return response.json();
  },

  async updateAdminLoan(
    token: string,
    id: string,
    payload: Partial<Pick<LoanApplication, 'status' | 'notes' | 'currentStep' | 'isCompleted'>>,
  ): Promise<LoanApplication> {
    const response = await fetch(`${API_BASE_URL}/api/admin/loans/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-admin-api-key': ADMIN_API_KEY,
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update loan');
    }
    return response.json();
  },
};


