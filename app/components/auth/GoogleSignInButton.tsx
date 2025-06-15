import {
	GoogleSignin,
	SignInResponse,
} from '@react-native-google-signin/google-signin';
import React, { useEffect, useState } from 'react';
import { Image, Text, TouchableOpacity } from 'react-native';
import { icons } from '../../../constants/icons';
import { useAuth } from '../../context/AuthContext';
import useTheme from '../../hooks/useTheme';
import AuthService from '../../services/authService';
import StorageService from '../../services/storageService';

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

	useEffect(() => {
		// Configure Google Sign-In
		GoogleSignin.configure({
			webClientId:
				'111429529165-3irujao5mgtrimdnlo2vhturvefjhftk.apps.googleusercontent.com',
			scopes: ['profile', 'email'],
			offlineAccess: true,
			forceCodeForRefreshToken: true,
		});
	}, []);

	const handleGoogleSignIn = async () => {
		try {
			setLoading(true);

			// Check if Google Play Services are available (Android only)
			await GoogleSignin.hasPlayServices();

			// Sign in with Google
			const response = (await GoogleSignin.signIn()) as SignInResponse & {
				serverAuthCode?: string;
			};

			// Extract the data from the response
			const { serverAuthCode } = response;
			if (serverAuthCode) {
				await handleSignInWithCode(serverAuthCode);
			} else {
				onError?.('No authorization code received from Google');
			}
		} catch (error: any) {
			console.error('Google sign-in error:', error);

			// Handle specific Google Sign-In errors
			if (error.code === 'SIGN_IN_CANCELLED') {
				onError?.('Google sign-in was cancelled');
			} else if (error.code === 'IN_PROGRESS') {
				onError?.('Google sign-in is already in progress');
			} else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
				onError?.('Google Play Services not available');
			} else {
				const errorMessage = error.message || 'Google sign-in failed';
				onError?.(errorMessage);
			}
		} finally {
			setLoading(false);
		}
	};

	const handleSignInWithCode = async (serverAuthCode: string) => {
		try {
			// Send the server auth code to your backend
			const userResponse = await AuthService.googleSignIn(serverAuthCode);

			if (userResponse.token) {
				await StorageService.saveToken(userResponse.token);
				await StorageService.saveUser(userResponse.user);
				await checkAuthStatus();
				onSuccess?.();
			} else {
				onError?.('Authentication successful but no token received');
			}
		} catch (error) {
			console.error('Backend authentication error:', error);
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Backend authentication failed';
			onError?.(errorMessage);
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
