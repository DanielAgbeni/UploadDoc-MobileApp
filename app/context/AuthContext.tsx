import React, {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useReducer,
} from 'react';
import { AuthService } from '../services/authService';
import { StorageService } from '../services/storageService';
import {
	ApiError,
	AuthState,
	LoginRequest,
	RegisterRequest,
	User,
	VerifyEmailRequest,
} from '../types/auth';

interface AuthContextType extends AuthState {
	login: (credentials: LoginRequest) => Promise<void>;
	register: (
		userData: RegisterRequest,
	) => Promise<{ message: string; email: string }>;
	verifyEmail: (data: VerifyEmailRequest) => Promise<void>;
	resendVerificationCode: (email: string) => Promise<{ message: string }>;
	logout: () => Promise<void>;
	checkAuthStatus: () => Promise<void>;
	clearError: () => void;
	error: string | null;
}

type AuthAction =
	| { type: 'SET_LOADING'; payload: boolean }
	| { type: 'SET_USER'; payload: { user: User; token: string } }
	| { type: 'SET_ERROR'; payload: string }
	| { type: 'CLEAR_ERROR' }
	| { type: 'LOGOUT' };

const initialState: AuthState = {
	user: null,
	token: null,
	isLoading: true,
	isAuthenticated: false,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
	switch (action.type) {
		case 'SET_LOADING':
			return { ...state, isLoading: action.payload };
		case 'SET_USER':
			return {
				...state,
				user: action.payload.user,
				token: action.payload.token,
				isAuthenticated: true,
				isLoading: false,
			};
		case 'SET_ERROR':
			return { ...state, isLoading: false };
		case 'CLEAR_ERROR':
			return { ...state };
		case 'LOGOUT':
			return {
				...initialState,
				isLoading: false,
			};
		default:
			return state;
	}
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
	children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [state, dispatch] = useReducer(authReducer, initialState);
	const [error, setError] = React.useState<string | null>(null);

	const setLoading = (loading: boolean) => {
		dispatch({ type: 'SET_LOADING', payload: loading });
	};

	const setUser = (user: User, token: string) => {
		dispatch({ type: 'SET_USER', payload: { user, token } });
	};

	const setAuthError = (errorMessage: string) => {
		setError(errorMessage);
		dispatch({ type: 'SET_ERROR', payload: errorMessage });
	};

	const clearError = () => {
		setError(null);
		dispatch({ type: 'CLEAR_ERROR' });
	};

	const login = async (credentials: LoginRequest): Promise<void> => {
		try {
			setLoading(true);
			clearError();

			const response = await AuthService.login(credentials);

			// Save to storage
			await StorageService.saveToken(response.token);
			await StorageService.saveUser(response.user);

			setUser(response.user, response.token);
		} catch (error) {
			const apiError = error as ApiError;
			setAuthError(apiError.message);
			throw error;
		}
	};

	const register = async (
		userData: RegisterRequest,
	): Promise<{ message: string; email: string }> => {
		try {
			setLoading(true);
			clearError();

			const response = await AuthService.register(userData);
			setLoading(false);

			return response;
		} catch (error) {
			const apiError = error as ApiError;
			setAuthError(apiError.message);
			setLoading(false);
			throw error;
		}
	};

	const verifyEmail = async (data: VerifyEmailRequest): Promise<void> => {
		try {
			setLoading(true);
			clearError();

			const response = await AuthService.verifyEmail(data);

			// Save to storage
			await StorageService.saveToken(response.token);
			await StorageService.saveUser(response.user);

			setUser(response.user, response.token);
		} catch (error) {
			const apiError = error as ApiError;
			setAuthError(apiError.message);
			throw error;
		}
	};

	const resendVerificationCode = async (
		email: string,
	): Promise<{ message: string }> => {
		try {
			clearError();
			const response = await AuthService.resendVerificationCode(email);
			return response;
		} catch (error) {
			const apiError = error as ApiError;
			setAuthError(apiError.message);
			throw error;
		}
	};

	const logout = async (): Promise<void> => {
		try {
			// Clear all stored authentication data
			await StorageService.clearAuthData();

			// Update the auth state
			dispatch({ type: 'LOGOUT' });

			// Clear any errors
			clearError();
		} catch (error) {
			console.error('Logout error:', error);
			// Even if there's an error clearing storage, still logout the user
			dispatch({ type: 'LOGOUT' });
			clearError();
		}
	};

	const checkAuthStatus = async (): Promise<void> => {
		try {
			setLoading(true);

			const token = await StorageService.getToken();
			const user = await StorageService.getUser();

			if (token && user) {
				// Verify token with backend
				try {
					const response = await AuthService.checkUserStatus(token);
					setUser(response.user, token);
				} catch (error) {
					// Token is invalid, clear storage
					await StorageService.clearAuthData();
					dispatch({ type: 'LOGOUT' });
				}
			} else {
				dispatch({ type: 'LOGOUT' });
			}
		} catch (error) {
			console.error('Auth status check error:', error);
			dispatch({ type: 'LOGOUT' });
		}
	};

	// Check auth status on app start
	useEffect(() => {
		checkAuthStatus();
	}, []);

	const value: AuthContextType = {
		...state,
		error,
		login,
		register,
		verifyEmail,
		resendVerificationCode,
		logout,
		checkAuthStatus,
		clearError,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};
