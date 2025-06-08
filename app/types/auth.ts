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
	// Provider-specific fields
	openingHours?: string;
	printingCost?: string;
	printingLocation?: string;
	discountRates?: DiscountRate[];
	supportContact?: string;
	additionalInfo?: string;
	rating?: number;
	reviews?: Review[];
	adminStatus?: string;
	queueTimeEstimate?: number;
}

export interface DiscountRate {
	minPages: number;
	maxPages: number;
	discount: number;
}

export interface Review {
	id: string;
	rating: number;
	comment: string;
	createdAt: string;
	userId: string;
	userName: string;
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

export interface UpdateProfileRequest {
	openingHours?: string;
	printingCost?: string;
	printingLocation?: string;
	discountRates?: DiscountRate[];
	supportContact?: string;
	additionalInfo?: string;
}
export interface Admin {
	_id: string;
	name: string;
	email: string;
	matricNumber?: string;
	isAdmin: boolean;
	superAdmin: boolean;
	isVerified: boolean;
	documentsReceived?: number;
	documentToken?: string;
	openingHours?: string;
	printingCost?: number; // Assuming a number, e.g., currency
	printingLocation?: string;
	discountRates?: Record<string, number>; // Example for a map of string to number
	rating?: number; // Assuming a number, e.g., 1-5
	adminStatus?: string;
	queueTimeEstimate?: string;
	supportContact?: string;
	additionalInfo?: string;
	reviews?: any[]; // You might want to define a specific type for reviews if you use them
	profilePicture?: string;
	createdAt: string; // Assuming ISO date string
	updatedAt: string; // Assuming ISO date string
}

// Define the structure of the successful response from getAdmins
export interface AdminPaginationResponse {
	admins: Admin[];
	pagination: {
		totalCount: number;
		totalPages: number;
		currentPage: number;
		limit: number;
	};
}
