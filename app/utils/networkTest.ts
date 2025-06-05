// Utility to test network connectivity to the backend
import Constants from 'expo-constants';

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

export const testBackendConnection = async (): Promise<{
  success: boolean;
  message: string;
  url: string;
}> => {
  const baseUrl = getBaseUrl();
  
  try {
    console.log(`Testing connection to: ${baseUrl}`);
    
    // Try to fetch a simple endpoint or just test connectivity
    const response = await fetch(`${baseUrl}/api/auth/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add a timeout
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    
    console.log(`Connection test response status: ${response.status}`);
    
    return {
      success: true,
      message: `Successfully connected to backend at ${baseUrl}`,
      url: baseUrl,
    };
  } catch (error) {
    console.error('Backend connection test failed:', error);
    
    let message = `Failed to connect to backend at ${baseUrl}. `;
    
    if (error instanceof TypeError) {
      message += 'Please check:\n1. Backend server is running\n2. IP address is correct\n3. Port 5000 is accessible';
    } else {
      message += `Error: ${error}`;
    }
    
    return {
      success: false,
      message,
      url: baseUrl,
    };
  }
};

export const getCurrentBackendUrl = (): string => {
  return getBaseUrl();
};
