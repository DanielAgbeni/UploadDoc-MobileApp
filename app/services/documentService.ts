import { ApiError, Project, ProjectPaginationResponse } from '../types/auth';

// const getBaseUrl = () => {
// 	// For development, use your machine's IP address
// 	// You can find your IP by running: ipconfig (Windows) or ifconfig (Mac/Linux)
// 	const debuggerHost = Constants.expoConfig?.hostUri?.split(':')[0];

// 	if (__DEV__) {
// 		// If running in development and we can get the debugger host
// 		if (debuggerHost) {
// 			return `http://${debuggerHost}:5000`;
// 		}
// 		// Fallback for development - using your machine's IP
// 		return 'http://192.168.137.156:5000'; // Your machine's IP address
// 	}

// 	// For production, use your actual server URL
// 	return 'https://your-production-api.com';
// };

const BASE_URL = 'https://upload-doc-backend.vercel.app';

class DocumentServiceClass {
	private async makeRequest<T>(
		endpoint: string,
		options: RequestInit = {},
		token?: string,
	): Promise<T> {
		try {
			const response = await fetch(`${BASE_URL}${endpoint}`, {
				...options,
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
					...(token && { Authorization: `Bearer ${token}` }),
					...(options.headers ?? {}),
				},
			});

			// Try to get the response text first
			const responseText = await response.text();

			let data;
			try {
				// Then parse it as JSON
				data = JSON.parse(responseText);
			} catch (parseError) {
				console.log(parseError);
				throw {
					message: 'Invalid response from server. Please try again.',
					details: responseText.substring(0, 100), // Log first 100 chars of response
				} as ApiError;
			}

			if (!response.ok) {
				throw data as ApiError;
			}

			return data as T;
		} catch (error) {
			console.error('Request error:', error);

			if (error instanceof TypeError) {
				throw {
					message: `Network error. Cannot connect to server at ${BASE_URL}. Please check your connection.`,
				} as ApiError;
			}

			// If it's our ApiError, just rethrow it
			if ((error as ApiError).message) {
				throw error;
			}

			// For any other errors
			throw {
				message: 'An unexpected error occurred. Please try again.',
				details: error,
			} as ApiError;
		}
	}

	async uploadDocument(
		formData: FormData,
		token: string,
	): Promise<{ message: string; project: Project }> {
		return this.makeRequest(
			'/api/projects/upload',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'multipart/form-data',
					Accept: 'application/json',
				},
				body: formData,
			},
			token,
		);
	}

	async getUserDocuments(
		userId: string,
		page: number = 1,
		limit: number = 10,
		token: string,
	): Promise<ProjectPaginationResponse> {
		const queryParams = new URLSearchParams({
			page: page.toString(),
			limit: limit.toString(),
		});

		return this.makeRequest(
			`/api/projects/student/${userId}?${queryParams.toString()}`,
			{ method: 'GET' },
			token,
		);
	}
}

export const DocumentService = new DocumentServiceClass();
