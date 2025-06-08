import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import { Alert, Image, Text, TouchableOpacity } from 'react-native';
import { icons } from '../../../constants/icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../hooks/useTheme';
import { AuthService } from '../../services/authService';
import { StorageService } from '../../services/storageService';

WebBrowser.maybeCompleteAuthSession();

interface GoogleSignInButtonProps {
	onSuccess?: () => void;
	onError?: (error: string) => void;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
	onSuccess,
	onError,
}) => {
	const { themed } = useTheme();
	const { checkAuthStatus } = useAuth();
	const [loading, setLoading] = useState(false);

	const handleGoogleSignIn = async () => {
		try {
			setLoading(true);

			// For now, we'll use WebBrowser to open the Google auth URL
			// In a production app, you'd want to implement proper OAuth flow
			const authUrl = AuthService.getGoogleAuthUrl();

			const result = await WebBrowser.openAuthSessionAsync(
				authUrl,
				'uploaddocmobile://google-auth-callback',
			);

			if (result.type === 'success' && result.url) {
				// Extract token from callback URL
				const url = new URL(result.url);
				const token = url.searchParams.get('token');

				if (token) {
					// Verify the token and get user data
					const userResponse = await AuthService.checkUserStatus(token);

					// Save to storage
					await StorageService.saveToken(token);
					await StorageService.saveUser(userResponse.user);

					// Update auth context
					await checkAuthStatus();

					onSuccess?.();
				} else {
					throw new Error('No token received from Google authentication');
				}
			} else if (result.type === 'cancel') {
			}
		} catch (error) {
			console.error('Google sign-in error:', error);
			const errorMessage =
				error instanceof Error ? error.message : 'Google sign-in failed';
			onError?.(errorMessage);
			Alert.alert('Sign-in Error', errorMessage);
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
