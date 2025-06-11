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
			'111429529165-sb7t0b8hdiroe47leb8ea2md215rp909.apps.googleusercontent.com',
		iosClientId:
			'111429529165-sb7t0b8hdiroe47leb8ea2md215rp909.apps.googleusercontent.com',
		webClientId:
			'111429529165-sb7t0b8hdiroe47leb8ea2md215rp909.apps.googleusercontent.com',
		clientId:
			'111429529165-sb7t0b8hdiroe47leb8ea2md215rp909.apps.googleusercontent.com',
		responseType: 'id_token',
		scopes: ['profile', 'email'],
	});

	useEffect(() => {
		if (response?.type === 'success') {
			handleSignInResponse(response.authentication?.accessToken);
		}
	}, [response]);

	const handleSignInResponse = async (accessToken?: string | null) => {
		if (!accessToken) {
			onError?.('No access token received');
			return;
		}

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
		try {
			setLoading(true);
			await promptAsync();
		} catch (error) {
			console.error('Google sign-in error:', error);
			const errorMessage =
				error instanceof Error ? error.message : 'Google sign-in failed';
			onError?.(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	return (
		<TouchableOpacity
			onPress={handleGoogleSignIn}
			disabled={loading}
			className={`
        w-full px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600
        flex-row items-center justify-center
        ${themed.bg.background}
        ${loading ? 'opacity-50' : ''}
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
