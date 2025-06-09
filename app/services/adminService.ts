// services/adminService.ts
import { AdminPaginationResponse, ApiError } from '../types/auth'; // Import the new types

// const getBaseUrl = () => {
// 	const debuggerHost = Constants.expoConfig?.hostUri?.split(':')[0];

// 	if (__DEV__) {
// 		if (debuggerHost) {
// 			return `http://${debuggerHost}:5000`;
// 		}
// 		return 'http://192.168.137.156:5000'; // Your machine's IP address
// 	}
// 	return 'https://your-production-api.com';
// };

const BASE_URL = 'https://upload-doc-backend.vercel.app';

class AdminServiceClass {
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
			console.error('Request error:', error);

			if (error instanceof TypeError) {
				throw {
					message: `Network error. Cannot connect to server at ${BASE_URL}. Please check your connection and ensure the backend server is running.`,
				} as ApiError;
			}
			throw error;
		}
	}

	// Modified getAdmins to accept an optional query parameter
	async getAdmins(
		page: number,
		limit: number,
		query?: string, // New optional query parameter
	): Promise<AdminPaginationResponse> {
		const queryParams = new URLSearchParams({
			page: page.toString(),
			limit: limit.toString(),
		});

		if (query) {
			queryParams.append('query', query); // Append the query parameter
		}

		return this.makeRequest<AdminPaginationResponse>(
			`/api/users/admins?${queryParams.toString()}`,
			{ method: 'GET' },
		);
	}
}

export const AdminService = new AdminServiceClass();
export default AdminService;
