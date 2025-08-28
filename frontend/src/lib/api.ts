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


