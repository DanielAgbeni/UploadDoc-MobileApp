export interface User {
  id: string;
  name: string;
  email: string;
  matricNumber?: string;
  isAdmin: boolean;
  superAdmin: boolean;
  documentToken: string;
  documentsReceived?: number;
  isVerified: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  matricNumber: string;
  password: string;
}

export interface VerifyEmailRequest {
  email: string;
  otp: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}

export interface ApiError {
  message: string;
  needsVerification?: boolean;
  needsRegistration?: boolean;
  canResend?: boolean;
  email?: string;
  attemptsRemaining?: number;
}

export interface GoogleAuthResult {
  type: 'success' | 'cancel';
  token?: string;
  user?: User;
}
