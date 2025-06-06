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

export interface AdminResult {
	_id: string;
	name: string;
	email: string;
	matricNumber: string;
	isAdmin: boolean;
	superAdmin: boolean;
	isVerified: boolean;
	documentsReceived: number;
	documentToken: number;
	openingHours?: string | null;
	printingCost?: number | null;
	printingLocation?: string | null;
	discountRates: DiscountRate[];
	rating: number;
	adminStatus: string;
	queueTimeEstimate: number;
	supportContact?: string | null;
	additionalInfo?: string | null;
	reviews: ReviewResult[];
	profilePicture?: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface ReviewResult {
	_id: string;
	userId: string;
	name: string;
	rating: number;
	comment: string;
}
