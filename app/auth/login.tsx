import { Link, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
	Alert,
	Image,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { icons } from '../../constants/icons';
import { AuthButton } from '../components/auth/AuthButton';
import { AuthInput } from '../components/auth/AuthInput';
import { GoogleSignInButton } from '../components/auth/GoogleSignInButton';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { StorageService } from '../services/storageService';
import { ApiError } from '../types/auth';

export default function LoginScreen() {
	const { themed } = useTheme();
	const { login, isLoading, error, clearError } = useAuth();

	const [formData, setFormData] = useState({
		email: '',
		password: '',
	});
	const [rememberMe, setRememberMe] = useState(false);
	const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

	// Load remembered email on component mount
	useEffect(() => {
		loadRememberedEmail();
	}, []);

	const loadRememberedEmail = async () => {
		try {
			const rememberedEmail = await StorageService.getRememberedEmail();
			if (rememberedEmail) {
				setFormData((prev) => ({ ...prev, email: rememberedEmail }));
				setRememberMe(true);
			}
		} catch (error) {
			console.error('Error loading remembered email:', error);
		}
	};

	const validateForm = () => {
		const errors: { [key: string]: string } = {};

		if (!formData.email.trim()) {
			errors.email = 'Email is required';
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			errors.email = 'Please enter a valid email address';
		}

		if (!formData.password.trim()) {
			errors.password = 'Password is required';
		} else if (formData.password.length < 6) {
			errors.password = 'Password must be at least 6 characters';
		}

		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleLogin = async () => {
		if (!validateForm()) return;

		try {
			clearError();

			await login({
				email: formData.email.trim().toLowerCase(),
				password: formData.password,
			});

			// Save email if remember me is checked
			if (rememberMe) {
				await StorageService.saveRememberedEmail(
					formData.email.trim().toLowerCase(),
				);
			} else {
				await StorageService.removeRememberedEmail();
			}

			// Navigation will be handled by the auth context
		} catch (error) {
			const apiError = error as ApiError;

			if (apiError.needsVerification) {
				// Redirect to verification screen
				router.push({
					pathname: '/auth/verify-email',
					params: { email: formData.email.trim().toLowerCase() },
				});
			} else {
				Alert.alert('Login Failed', apiError.message);
			}
		}
	};

	const handleGoogleSuccess = () => {
		// Navigation will be handled by the auth context
		console.log('Google sign-in successful');
	};

	const handleGoogleError = (errorMessage: string) => {
		Alert.alert('Google Sign-in Failed', errorMessage);
	};

	// const handleTestConnection = async () => {
	// 	try {
	// 		const result = await testBackendConnection();
	// 		Alert.alert(
	// 			result.success
	// 				? 'Connection Test Successful'
	// 				: 'Connection Test Failed',
	// 			result.message,
	// 			[{ text: 'OK' }],
	// 		);
	// 	} catch (error) {
	// 		Alert.alert('Connection Test Error', 'Failed to test connection');
	// 	}
	// };

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			className='flex-1'>
			<ScrollView
				className={`flex-1 ${themed.bg.background}`}
				contentContainerStyle={{ flexGrow: 1 }}
				keyboardShouldPersistTaps='handled'>
				<View className='flex-1 px-6 py-8'>
					{/* Logo and Header */}
					<View className='items-center mb-8 mt-12'>
						<Image
							source={icons.logo}
							className='w-20 h-20 mb-4 rounded-lg'
							resizeMode='contain'
						/>
						<Text
							className={`text-3xl font-extrabold mb-2 ${themed.text.primary}`}>
							Welcome Back
						</Text>
						<Text
							className={`text-xl font-bold text-center ${themed.text.text}`}>
							Sign in to your UploadDoc account
						</Text>
					</View>

					{/* Login Form */}
					<View className='mb-6'>
						<AuthInput
							label='Email Address'
							value={formData.email}
							onChangeText={(text) =>
								setFormData((prev) => ({ ...prev, email: text }))
							}
							placeholder='Enter your email'
							keyboardType='email-address'
							autoCapitalize='none'
							error={formErrors.email}
						/>

						<AuthInput
							label='Password'
							value={formData.password}
							onChangeText={(text) =>
								setFormData((prev) => ({ ...prev, password: text }))
							}
							placeholder='Enter your password'
							secureTextEntry
							error={formErrors.password}
						/>

						{/* Remember Me */}
						<TouchableOpacity
							onPress={() => setRememberMe(!rememberMe)}
							className='flex-row items-center mb-6'>
							<View
								className={`
                w-5 h-5 rounded border-2 mr-3 items-center justify-center
                ${
									rememberMe
										? 'bg-primary border-primary'
										: `border-gray-300 dark:border-gray-600 ${themed.bg.background}`
								}
              `}>
								{rememberMe && <Text className='text-white text-xs'>✓</Text>}
							</View>
							<Text className={`text-sm ${themed.text.primary} font-bold`}>
								Remember my email
							</Text>
						</TouchableOpacity>

						{/* Error Message */}
						{error && (
							<View className='mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'>
								<Text className='text-red-600 dark:text-red-400 text-sm'>
									{error}
								</Text>
							</View>
						)}

						{/* Login Button */}
						<AuthButton
							title='Sign In'
							onPress={handleLogin}
							loading={isLoading}
							size='large'
						/>
					</View>

					{/* Divider */}
					<View className='flex-row items-center mb-6'>
						<View className={`flex-1 h-px ${themed.bg.secondary}`} />
						<Text
							className={`mx-4 font-medium text-base ${themed.text.accent}`}>
							or continue with
						</Text>
						<View className={`flex-1 h-px ${themed.bg.secondary}`} />
					</View>

					{/* Google Sign In */}
					<GoogleSignInButton
						onSuccess={handleGoogleSuccess}
						onError={handleGoogleError}
					/>

					{/* Debug: Test Connection Button (Development Only)
					{__DEV__ && (
						<View className='mb-4'>
							<TouchableOpacity
								onPress={handleTestConnection}
								className={`p-3 rounded-lg border border-gray-300 dark:border-gray-600 ${themed.bg.background}`}>
								<Text
									className={`text-center text-sm ${themed.text.secondary}`}>
									🔧 Test Backend Connection
								</Text>
							</TouchableOpacity>
						</View>
					)} */}

					{/* Footer Links */}
					<View className='mt-8 items-center'>
						<TouchableOpacity className='mb-4'>
							<Text className={`${themed.text.text} text-base font-medium`}>
								Forgot Password?
							</Text>
						</TouchableOpacity>

						<View className='flex-row items-center'>
							<Text className={`text-base ${themed.text.text}`}>
								Don't have an account?{' '}
							</Text>
							<Link
								href='/auth/register'
								asChild>
								<TouchableOpacity>
									<Text
										className={`${themed.text.primary} underline text-base font-medium`}>
										Sign Up
									</Text>
								</TouchableOpacity>
							</Link>
						</View>
					</View>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}
