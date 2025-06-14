import {
	ApiError,
	AuthResponse,
	LoginRequest,
	RegisterRequest,
	User,
	VerifyEmailRequest,
} from '../types/auth';

const BASE_URL = 'https://upload-doc-backend.vercel.app';

class AuthServiceClass {
	private async makeRequest<T>(
		endpoint: string,
		options: RequestInit = {},
	): Promise<T> {
		try {
			const response = await fetch(`${BASE_URL}${endpoint}`, {
				headers: {
					'Content-Type': 'application/json',
					...options.headers,
				},
				...options,
			});

			const data = await response.json();

			if (!response.ok) {
				throw data as ApiError;
			}

			return data as T;
		} catch (error) {
			if (error instanceof TypeError) {
				throw {
					message: `Network error. Please check your connection and ensure you are connected to the internet`,
				} as ApiError;
			}
			throw error;
		}
	}

	async login(credentials: LoginRequest): Promise<AuthResponse> {
		return this.makeRequest<AuthResponse>('/api/auth/login', {
			method: 'POST',
			body: JSON.stringify(credentials),
		});
	}

	async register(
		userData: RegisterRequest,
	): Promise<{ message: string; email: string; canResend: boolean }> {
		return this.makeRequest<{
			message: string;
			email: string;
			canResend: boolean;
		}>('/api/auth/register', {
			method: 'POST',
			body: JSON.stringify(userData),
		});
	}

	async verifyEmail(
		verificationData: VerifyEmailRequest,
	): Promise<AuthResponse> {
		return this.makeRequest<AuthResponse>('/api/auth/verify-email', {
			method: 'POST',
			body: JSON.stringify(verificationData),
		});
	}

	async resendVerificationCode(
		email: string,
	): Promise<{ message: string; canResend: boolean }> {
		return this.makeRequest<{ message: string; canResend: boolean }>(
			'/api/auth/resend-verification',
			{
				method: 'POST',
				body: JSON.stringify({ email }),
			},
		);
	}

	async checkUserStatus(token: string): Promise<{ user: User }> {
		return this.makeRequest<{ user: User }>('/api/auth/status', {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
	}

	async forgotPassword(
		email: string,
	): Promise<{ success: boolean; message: string }> {
		return this.makeRequest<{ success: boolean; message: string }>(
			'/api/auth/forgot-password',
			{
				method: 'POST',
				body: JSON.stringify({ email }),
			},
		);
	}

	async resetPassword(
		email: string,
		otp: string,
		newPassword: string,
	): Promise<{ success: boolean; message: string }> {
		return this.makeRequest<{ success: boolean; message: string }>(
			'/api/auth/reset-password',
			{
				method: 'POST',
				body: JSON.stringify({ email, otp, newPassword }),
			},
		);
	}

	// Google OAuth URL
	getGoogleAuthUrl(): string {
		return `${BASE_URL}/api/auth/google`;
	}

	async googleSignIn(accessToken: string): Promise<AuthResponse> {
		return this.makeRequest<AuthResponse>('/api/auth/google/mobile', {
			method: 'POST',
			body: JSON.stringify({ accessToken }),
		});
	}
}

export const AuthService = new AuthServiceClass();
export default AuthService;
