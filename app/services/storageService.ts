import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/auth';

const STORAGE_KEYS = {
	TOKEN: '@uploaddoc_token',
	USER: '@uploaddoc_user',
	REMEMBER_EMAIL: '@uploaddoc_remember_email',
} as const;

const StorageService = {
	// Token management
	saveToken: async function (token: string): Promise<void> {
		try {
			await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
		} catch (error) {
			console.error('Error saving token:', error);
			throw new Error('Failed to save authentication token');
		}
	},

	getToken: async function (): Promise<string | null> {
		try {
			return await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
		} catch (error) {
			console.error('Error getting token:', error);
			throw new Error('Failed to retrieve authentication token');
		}
	},

	removeToken: async function (): Promise<void> {
		try {
			await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
		} catch (error) {
			console.error('Error removing token:', error);
			throw new Error('Failed to remove authentication token');
		}
	},

	// User management
	saveUser: async function (user: User): Promise<void> {
		try {
			await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
		} catch (error) {
			console.error('Error saving user:', error);
			throw new Error('Failed to save user data');
		}
	},

	getUser: async function (): Promise<User | null> {
		try {
			const userString = await AsyncStorage.getItem(STORAGE_KEYS.USER);
			return userString ? JSON.parse(userString) : null;
		} catch (error) {
			console.error('Error getting user:', error);
			throw new Error('Failed to retrieve user data');
		}
	},

	removeUser: async function (): Promise<void> {
		try {
			await AsyncStorage.removeItem(STORAGE_KEYS.USER);
		} catch (error) {
			console.error('Error removing user:', error);
			throw new Error('Failed to remove user data');
		}
	},

	// Remember email functionality
	saveRememberedEmail: async function (email: string): Promise<void> {
		try {
			await AsyncStorage.setItem(STORAGE_KEYS.REMEMBER_EMAIL, email);
		} catch (error) {
			console.error('Error saving remembered email:', error);
			throw new Error('Failed to save remembered email');
		}
	},

	getRememberedEmail: async function (): Promise<string | null> {
		try {
			return await AsyncStorage.getItem(STORAGE_KEYS.REMEMBER_EMAIL);
		} catch (error) {
			console.error('Error getting remembered email:', error);
			throw new Error('Failed to retrieve remembered email');
		}
	},

	removeRememberedEmail: async function (): Promise<void> {
		try {
			await AsyncStorage.removeItem(STORAGE_KEYS.REMEMBER_EMAIL);
		} catch (error) {
			console.error('Error removing remembered email:', error);
			throw new Error('Failed to remove remembered email');
		}
	},

	// Helper functions
	clearAuthData: async function (): Promise<void> {
		try {
			await Promise.all([
				AsyncStorage.removeItem(STORAGE_KEYS.TOKEN),
				AsyncStorage.removeItem(STORAGE_KEYS.USER),
			]);
		} catch (error) {
			console.error('Error clearing auth data:', error);
			throw new Error('Failed to clear authentication data');
		}
	},

	hasAuthData: async function (): Promise<boolean> {
		try {
			const [token, user] = await Promise.all([
				AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
				AsyncStorage.getItem(STORAGE_KEYS.USER),
			]);
			return !!(token && user);
		} catch (error) {
			console.error('Error checking auth data:', error);
			throw new Error('Failed to check authentication data');
		}
	},
};

export default StorageService;
