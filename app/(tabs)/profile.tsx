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
	console.log('User', user);

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
					try {
						console.log('User initiated logout');
						await logout();
						console.log('Logout successful, user should be redirected to auth');
					} catch (error) {
						console.error('Logout failed:', error);
						Alert.alert(
							'Logout Error',
							'Failed to sign out. Please try again.',
						);
					}
				},
			},
		]);
	};

	const ProfileCard = ({ title, value, icon }: any) => (
		<View
			className={`${themed.bg.background} rounded-xl p-5 mb-4 shadow-sm border ${themed.border.primary}`}>
			<View className='flex-row items-center mb-2'>
				{icon && <Text className='text-lg mr-2'>{icon}</Text>}
				<Text
					className={`text-sm font-semibold ${themed.text.secondary} uppercase tracking-wide`}>
					{title}
				</Text>
			</View>
			<Text
				className={`text-base font-medium ${themed.text.primary} leading-relaxed`}>
				{value || 'Not provided'}
			</Text>
		</View>
	);

	const getAccountTypeColor = () => {
		if (user?.superAdmin) return 'bg-purple-500';
		if (user?.isAdmin) return 'bg-blue-500';
		return 'bg-green-500';
	};

	const getAccountTypeText = () => {
		if (user?.superAdmin) return 'Super Administrator';
		if (user?.isAdmin) return 'Provider';
		return 'User';
	};

	return (
		<ScrollView
			className={`flex-1 ${themed.bg.background}`}
			showsVerticalScrollIndicator={false}>
			{/* Header Section with Gradient Background */}
			<View className={`${themed.bg.primary} pt-16 pb-8 px-6 rounded-b-3xl`}>
				<View className='items-center'>
					{/* Profile Avatar */}
					<View className='relative mb-4'>
						<View className='w-28 h-28 rounded-full bg-white/20 backdrop-blur-sm items-center justify-center border-4 border-white/30'>
							<Text className='text-white text-7xl font-bold'>
								{user?.name?.charAt(0).toUpperCase() || 'U'}
							</Text>
						</View>
						{/* Online Status Indicator */}
						<View className='absolute bottom-2 right-2 w-6 h-6 bg-green-400 rounded-full border-3 border-white' />
					</View>

					{/* User Name and Email */}
					<Text className='text-white text-2xl font-bold mb-1'>
						{user?.name || 'User'}
					</Text>
					<Text className='text-white/80 text-base font-medium'>
						{user?.email}
					</Text>

					{/* Account Type Badge */}
					<View
						className={`mt-4 px-4 py-2 rounded-full ${getAccountTypeColor()} flex-row items-center`}>
						<View className='w-2 h-2 rounded-full bg-white mr-2' />
						<Text className='text-white text-sm font-semibold'>
							{getAccountTypeText()}
						</Text>
					</View>
				</View>
			</View>

			{/* Content Section */}
			<View className='px-6 py-6 -mt-4'>
				{/* Profile Information */}
				<Text className={`text-xl font-bold ${themed.text.primary} mb-4`}>
					Profile Information
				</Text>

				<ProfileCard
					title='Full Name'
					value={user?.name}
					icon='👤'
				/>

				<ProfileCard
					title='Email Address'
					value={user?.email}
					icon='📧'
				/>

				<ProfileCard
					title='Matric Number'
					value={user?.matricNumber}
					icon='🎓'
				/>

				{/* Document Token with Copy Action */}
				<View
					className={`${themed.bg.background} rounded-xl p-5 mb-6 shadow-sm border ${themed.border.primary}`}>
					<View className='flex-row items-center justify-between mb-2'>
						<View className='flex-row items-center'>
							<Text className='text-lg mr-2'>🔑</Text>
							<Text
								className={`text-sm font-semibold ${themed.text.secondary} uppercase tracking-wide`}>
								Document Token
							</Text>
						</View>
					</View>
					<Text
						className={`text-sm ${themed.text.primary} font-mono p-3 rounded-lg`}>
						{user?.documentToken || 'Not assigned'}
					</Text>
				</View>

				{/* Action Buttons */}
				<View className='mb-8'>
					<TouchableOpacity
						className={`${themed.bg.background} rounded-xl p-4 mb-4 shadow-sm border ${themed.border.primary} flex-row items-center justify-between`}>
						<View className='flex-row items-center'>
							<Text className='text-lg mr-3'>✏️</Text>
							<Text className={`text-base font-medium ${themed.text.primary}`}>
								Edit Profile
							</Text>
						</View>
						<Text className={`text-lg ${themed.text.secondary}`}>›</Text>
					</TouchableOpacity>

					<TouchableOpacity
						className={`${themed.bg.background} rounded-xl p-4 mb-4 shadow-sm border ${themed.border.primary} flex-row items-center justify-between`}>
						<View className='flex-row items-center'>
							<Text className='text-lg mr-3'>🔒</Text>
							<Text className={`text-base font-medium ${themed.text.primary}`}>
								Privacy Settings
							</Text>
						</View>
						<Text className={`text-lg ${themed.text.secondary}`}>›</Text>
					</TouchableOpacity>

					<TouchableOpacity
						className={`${themed.bg.background} rounded-xl p-4 mb-6 shadow-sm border ${themed.border.primary} flex-row items-center justify-between`}>
						<View className='flex-row items-center'>
							<Text className='text-lg mr-3'>❓</Text>
							<Text className={`text-base font-medium ${themed.text.primary}`}>
								Help & Support
							</Text>
						</View>
						<Text className={`text-lg ${themed.text.secondary}`}>›</Text>
					</TouchableOpacity>
				</View>

				{/* Logout Button */}
				<AuthButton
					title='Sign Out'
					onPress={handleLogout}
					variant='primary'
					size='large'
				/>

				{/* App Info */}
				<View className='items-center mt-8 pt-6'>
					<View className='flex-row items-center mb-3'>
						<Image
							source={icons.logo}
							className='w-6 h-6 mr-2 rounded'
							resizeMode='contain'
						/>
						<Text className={`text-sm font-medium ${themed.text.primary}`}>
							UploadDoc
						</Text>
					</View>
					<Text className={`text- font-semibold ${themed.text.secondary}`}>
						Version 1.0.2
					</Text>
				</View>
			</View>
		</ScrollView>
	);
};

export default profile;
