import { ApiError, UpdateProfileRequest, User } from '../types/auth';

// Get the correct base URL for different environments

const BASE_URL = 'https://upload-doc-backend.vercel.app';

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
					message: `Network error. Please check your connection and ensure you are connected to the internet`,
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
