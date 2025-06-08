import { ApiError, ProjectPaginationResponse } from '../types/auth';

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

class DashboardServiceClass {
	private async makeRequest<T>(
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

	async getProject(
		adminId: string,
		page: number = 1,
		limit: number = 10,
		token: string,
	): Promise<ProjectPaginationResponse> {
		const queryParams = new URLSearchParams({
			page: page.toString(),
			limit: limit.toString(),
		});

		return this.makeRequest<ProjectPaginationResponse>(
			`/api/projects/assigned/${adminId}?${queryParams.toString()}`,
			{ method: 'GET' },
			token,
		);
	}

	async acceptProject(
		projectId: string,
		token: string,
	): Promise<{
		message: string;
		project: any;
		user: any;
	}> {
		return this.makeRequest(
			`/api/projects/accept/${projectId}`,
			{
				method: 'PUT',
			},
			token,
		);
	}

	async deleteProject(
		projectId: string,
		token: string,
	): Promise<{ message: string }> {
		return this.makeRequest(
			`/api/projects/${projectId}`,
			{
				method: 'DELETE',
			},
			token,
		);
	}
}

export const DashboardService = new DashboardServiceClass();
