import Constants from 'expo-constants';
import { ApiError, UpdateProfileRequest, User } from '../types/auth';

// Get the correct base URL for different environments
const getBaseUrl = () => {
	const debuggerHost = Constants.expoConfig?.hostUri?.split(':')[0];

	if (__DEV__) {
		if (debuggerHost) {
			return `http://${debuggerHost}:5000`;
		}
		return 'http://192.168.137.156:5000';
	}

	return 'https://your-production-api.com';
};

const BASE_URL = getBaseUrl();

class ProfileServiceClass {
	async makeRequest<T>(
		endpoint: string,
		options: RequestInit = {},
		token?: string,
	): Promise<T> {
		try {
			const response = await fetch(`${BASE_URL}${endpoint}`, {
				...options,
				headers: {
					'Content-Type': 'application/json',
					...(token && { Authorization: `Bearer ${token}` }),
					...(options.headers ?? {}),
				},
			});

			const data = await response.json();

			if (!response.ok) {
				throw data as ApiError;
			}

			return data as T;
		} catch (error) {
			if (error instanceof TypeError) {
				throw {
					message: `Network error. Cannot connect to server at ${BASE_URL}. Please check your connection and ensure the backend server is running.`,
				} as ApiError;
			}
			throw error;
		}
	}

	async updateProfile(
		profileData: UpdateProfileRequest,
		token: string,
	): Promise<{ message: string; user: User }> {
		return this.makeRequest<{ message: string; user: User }>(
			'/api/users/update-profile',
			{
				method: 'PUT',
				body: JSON.stringify(profileData),
			},
			token,
		);
	}

	async getUserProfile(userId: string, token: string): Promise<User> {
		return this.makeRequest<User>(
			`/api/users/${userId}`,
			{
				method: 'GET',
			},
			token,
		);
	}
}

const ProfileService = new ProfileServiceClass();

export { ProfileService };
export default ProfileService;
