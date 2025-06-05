import React from 'react';
import {
	Alert,
	Image,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { icons } from '../../constants/icons';
import { AuthButton } from '../components/auth/AuthButton';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';

const profile = () => {
	const { themed } = useTheme();
	const { user, logout } = useAuth();

	const handleLogout = () => {
		Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
			{
				text: 'Cancel',
				style: 'cancel',
			},
			{
				text: 'Sign Out',
				style: 'destructive',
				onPress: async () => {
					await logout();
				},
			},
		]);
	};

	return (
		<ScrollView className={`flex-1 ${themed.bg.background}`}>
			<View className='px-6 py-8'>
				{/* Header */}
				<View className='items-center mb-8 mt-8'>
					<View
						className={`w-24 h-24 rounded-full items-center justify-center mb-4 ${themed.bg.primary}`}>
						<Text className='text-white text-2xl font-bold'>
							{user?.name?.charAt(0).toUpperCase() || 'U'}
						</Text>
					</View>
					<Text className={`text-2xl font-bold mb-2 ${themed.text.primary}`}>
						{user?.name || 'User'}
					</Text>
					<Text className={`text-base ${themed.text.secondary}`}>
						{user?.email}
					</Text>
				</View>

				{/* User Info Cards */}
				<View className='mb-8'>
					<View
						className={`p-4 rounded-lg mb-4 border ${themed.bg.background} ${themed.border.primary}`}>
						<Text
							className={`text-sm font-medium mb-1 ${themed.text.secondary}`}>
							Matric Number
						</Text>
						<Text className={`text-base ${themed.text.primary}`}>
							{user?.matricNumber || 'Not provided'}
						</Text>
					</View>

					<View
						className={`p-4 rounded-lg mb-4 border ${themed.bg.background} ${themed.border.primary}`}>
						<Text
							className={`text-sm font-medium mb-1 ${themed.text.secondary}`}>
							Account Type
						</Text>
						<Text className={`text-base ${themed.text.primary}`}>
							{user?.isAdmin ? 'Administrator' : 'Student'}
							{user?.superAdmin && ' (Super Admin)'}
						</Text>
					</View>

					<View
						className={`p-4 rounded-lg mb-4 border ${themed.bg.background} ${themed.border.primary}`}>
						<Text
							className={`text-sm font-medium mb-1 ${themed.text.secondary}`}>
							Documents Received
						</Text>
						<Text className={`text-base ${themed.text.primary}`}>
							{user?.documentsReceived || 0}
						</Text>
					</View>

					<View
						className={`p-4 rounded-lg mb-4 border ${themed.bg.background} ${themed.border.primary}`}>
						<Text
							className={`text-sm font-medium mb-1 ${themed.text.secondary}`}>
							Verification Status
						</Text>
						<View className='flex-row items-center'>
							<View
								className={`w-2 h-2 rounded-full mr-2 ${
									user?.isVerified ? 'bg-green-500' : 'bg-red-500'
								}`}
							/>
							<Text className={`text-base ${themed.text.primary}`}>
								{user?.isVerified ? 'Verified' : 'Not Verified'}
							</Text>
						</View>
					</View>
				</View>

				{/* Actions */}
				<View className='mb-8'>
					<TouchableOpacity
						className={`p-4 rounded-lg mb-4 border ${themed.bg.background} ${themed.border.primary}`}>
						<Text className={`text-base font-medium ${themed.text.primary}`}>
							Edit Profile
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						className={`p-4 rounded-lg mb-4 border ${themed.bg.background} ${themed.border.primary}`}>
						<Text className={`text-base font-medium ${themed.text.primary}`}>
							Change Password
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						className={`p-4 rounded-lg mb-4 border ${themed.bg.background} ${themed.border.primary}`}>
						<Text className={`text-base font-medium ${themed.text.primary}`}>
							Settings
						</Text>
					</TouchableOpacity>
				</View>

				{/* Logout Button */}
				<AuthButton
					title='Sign Out'
					onPress={handleLogout}
					variant='outline'
					size='large'
				/>

				{/* App Info */}
				<View className='items-center mt-8 pt-8 border-t border-gray-200 dark:border-gray-700'>
					<Image
						source={icons.logo}
						className='w-8 h-8 mb-2'
						resizeMode='contain'
					/>
					<Text className={`text-sm ${themed.text.secondary}`}>
						UploadDoc v1.0.2
					</Text>
				</View>
			</View>
		</ScrollView>
	);
};

export default profile;
