import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import { Image, Text, TouchableOpacity } from 'react-native';
import { icons } from '../../../constants/icons';
import { useAuth } from '../../context/AuthContext';
import useTheme from '../../hooks/useTheme';
import AuthService from '../../services/authService';
import StorageService from '../../services/storageService';

WebBrowser.maybeCompleteAuthSession();

interface GoogleSignInButtonProps {
	onSuccess?: () => void;
	onError?: (error: string) => void;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
	onSuccess,
	onError,
}) => {
	const { themed } = useTheme();
	const { checkAuthStatus } = useAuth();
	const [loading, setLoading] = useState(false);

	const [request, response, promptAsync] = Google.useAuthRequest({
		androidClientId:
			'111429529165-3irujao5mgtrimdnlo2vhturvefjhftk.apps.googleusercontent.com',
		iosClientId:
			'111429529165-3irujao5mgtrimdnlo2vhturvefjhftk.apps.googleusercontent.com',
		webClientId:
			'111429529165-3irujao5mgtrimdnlo2vhturvefjhftk.apps.googleusercontent.com',
		responseType: 'token', // Changed from 'id_token' to Token
		scopes: ['profile', 'email'],
	});

	useEffect(() => {
		handleAuthResponse(); // eslint-disable-next-line react-hooks/exhaustive-deps
	}, [response]);

	const handleAuthResponse = async () => {
		if (response?.type === 'success') {
			// Now we can access the accessToken properly
			const { accessToken: access_token } = response.authentication || {};
			if (access_token) {
				await handleSignInWithToken(access_token);
			} else {
				onError?.('No access token received from Google');
			}
		} else if (response?.type === 'error') {
			console.error('Google auth error:', response.error);
			onError?.(response.error?.message || 'Google authentication failed');
		} else if (response?.type === 'cancel') {
			console.log('Google sign-in was cancelled');
			onError?.('Google sign-in was cancelled');
		}
	};

	const handleSignInWithToken = async (accessToken: string) => {
		try {
			setLoading(true);

			// Send the access token to your backend
			const userResponse = await AuthService.googleSignIn(accessToken);

			if (userResponse.token) {
				// Save to storage
				await StorageService.saveToken(userResponse.token);
				await StorageService.saveUser(userResponse.user);

				// Update auth context
				await checkAuthStatus();
				onSuccess?.();
			} else {
				onError?.('Authentication successful but no token received');
			}
		} catch (error) {
			console.error('Google sign-in error:', error);
			const errorMessage =
				error instanceof Error ? error.message : 'Google sign-in failed';
			onError?.(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const handleGoogleSignIn = async () => {
		if (!request) {
			onError?.('Google sign-in is not ready. Please try again.');
			return;
		}

		try {
			setLoading(true);
			const result = await promptAsync();
			// The result will be handled by the useEffect hook
		} catch (error) {
			console.error('Error initiating Google sign-in:', error);
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Failed to start Google sign-in';
			onError?.(errorMessage);
			setLoading(false);
		}
	};

	return (
		<TouchableOpacity
			onPress={handleGoogleSignIn}
			disabled={loading || !request}
			className={`
        w-full px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600
        flex-row items-center justify-center
        ${themed.bg.background}
        ${loading || !request ? 'opacity-50' : ''}
      `}
			activeOpacity={0.8}>
			<Image
				source={icons.google}
				className='w-5 h-5 mr-3'
				resizeMode='contain'
			/>
			<Text className={`text-base font-medium ${themed.text.primary}`}>
				{loading ? 'Signing in...' : 'Continue with Google'}
			</Text>
		</TouchableOpacity>
	);
};

export default GoogleSignInButton;
