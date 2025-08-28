// Frontend Firebase Phone Authentication Example
// This file shows how to integrate Firebase Phone Auth with your backend

import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  RecaptchaVerifier, 
  signInWithPhoneNumber 
} from "firebase/auth";

// Your Firebase configuration (already provided)
const firebaseConfig = {
  apiKey: "AIzaSyBT-kzNSr35iEkuYeiD1Utd7vpfDWc_hEg",
  authDomain: "loan-service-e0416.firebaseapp.com",
  projectId: "loan-service-e0416",
  storageBucket: "loan-service-e0416.firebasestorage.app",
  messagingSenderId: "256352676499",
  appId: "1:256352676499:web:18bc2e8556d04cef5d7b66",
  measurementId: "G-VTPGWB5X71"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Make auth global for debugging (optional)
window.auth = auth;

// Setup invisible reCAPTCHA
export function setupRecaptcha(buttonId = 'send-otp-button') {
  window.recaptchaVerifier = new RecaptchaVerifier(auth, buttonId, {
    'size': 'invisible',
    'callback': (response) => {
      // reCAPTCHA solved - will proceed with phone auth
      console.log('reCAPTCHA verified');
    },
    'error-callback': (error) => {
      console.error('reCAPTCHA error:', error);
    }
  });
}

// Send OTP to phone number
export async function sendOTP(phoneNumber) {
  try {
    // Ensure phone number has country code
    if (!phoneNumber.startsWith('+')) {
      throw new Error('Phone number must include country code (e.g., +84)');
    }

    // Setup recaptcha if not already done
    if (!window.recaptchaVerifier) {
      setupRecaptcha();
    }

    const appVerifier = window.recaptchaVerifier;
    
    // Send verification code
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    
    // Store confirmation result globally to use later
    window.confirmationResult = confirmationResult;
    
    console.log('OTP sent successfully');
    return { success: true, message: 'OTP sent successfully' };
  } catch (error) {
    console.error('Error sending OTP:', error);
    
    // Handle specific errors
    if (error.code === 'auth/invalid-phone-number') {
      throw new Error('Invalid phone number format');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many requests. Please try again later');
    }
    
    throw error;
  }
}

// Verify OTP and get Firebase token
export async function verifyOTP(otpCode) {
  try {
    if (!window.confirmationResult) {
      throw new Error('No OTP verification in progress');
    }

    // Confirm the OTP
    const result = await window.confirmationResult.confirm(otpCode);
    const user = result.user;
    
    // Get the Firebase ID token
    const idToken = await user.getIdToken();
    
    console.log('Phone verified successfully');
    return { 
      success: true, 
      user: {
        uid: user.uid,
        phoneNumber: user.phoneNumber
      },
      idToken 
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    
    if (error.code === 'auth/invalid-verification-code') {
      throw new Error('Invalid verification code');
    } else if (error.code === 'auth/code-expired') {
      throw new Error('Verification code expired');
    }
    
    throw error;
  }
}

// Exchange Firebase token for backend JWT
export async function loginWithFirebase(idToken) {
  try {
    const response = await fetch('http://localhost:3000/api/auth/firebase/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    
    // Store the JWT token
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('phoneNumber', data.phoneNumber);
    
    return data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
}

// Complete authentication flow
export async function completePhoneAuth(phoneNumber, otpCode) {
  try {
    // First verify OTP with Firebase
    const verifyResult = await verifyOTP(otpCode);
    
    // Then exchange Firebase token for backend JWT
    const loginResult = await loginWithFirebase(verifyResult.idToken);
    
    return loginResult;
  } catch (error) {
    console.error('Authentication failed:', error);
    throw error;
  }
}

// Logout function
export async function logout() {
  try {
    await auth.signOut();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('phoneNumber');
    console.log('Logged out successfully');
  } catch (error) {
    console.error('Error logging out:', error);
  }
}

// Example usage in a React/Vue component:
/*
// 1. Send OTP
const handleSendOTP = async () => {
  try {
    await sendOTP('+84912345678');
    alert('OTP sent! Check your phone.');
  } catch (error) {
    alert('Error: ' + error.message);
  }
};

// 2. Verify OTP and login
const handleVerifyOTP = async (otpCode) => {
  try {
    const result = await completePhoneAuth('+84912345678', otpCode);
    console.log('Logged in:', result);
    // Redirect to dashboard or update UI
  } catch (error) {
    alert('Error: ' + error.message);
  }
};

// 3. Make authenticated API calls
const fetchMyLoans = async () => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch('http://localhost:3000/api/client/loans/my-applications', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const loans = await response.json();
  return loans;
};
*/
