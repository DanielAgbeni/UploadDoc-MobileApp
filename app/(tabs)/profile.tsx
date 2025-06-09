import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
	Alert,
	Image,
	Linking,
	RefreshControl,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { icons } from '../../constants/icons';
import { AuthButton } from '../components/auth/AuthButton';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';

const Profile = () => {
	const { themed } = useTheme();
	const { user, logout, checkAuthStatus } = useAuth();
	const router = useRouter();

	const [refreshing, setRefreshing] = useState(false);

	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		try {
			if (checkAuthStatus) {
				await checkAuthStatus(); // This function should fetch /api/auth/status and update the user context
			} else {
				console.warn(
					'checkAuthStatus function is not available on useAuth hook',
				);
			}
		} catch (error) {
			console.error('Failed to refresh user status:', error);
			Alert.alert(
				'Refresh Error',
				'Could not update profile data. Please try again.',
			);
		} finally {
			setRefreshing(false);
		}
	}, [checkAuthStatus]);

	const handleLogout = () => {
		Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Sign Out',
				style: 'destructive',
				onPress: async () => {
					try {
						await logout();
						router.replace('/auth/login');
					} catch (error) {
						console.log(error);

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
		<View className={`${themed.bg.card} rounded-2xl p-5 mb-4 shadow-sm`}>
			<View className='flex-row items-center mb-1'>
				<Text className='text-lg mr-2'>{icon}</Text>
				<Text className={`text-xs uppercase font-semibold ${themed.text.text}`}>
					{title}
				</Text>
			</View>
			<Text className={`text-base font-medium ${themed.text.text}`}>
				{value || 'Not provided'}
			</Text>
		</View>
	);

	const getAccountTypeColor = () => {
		if (user?.superAdmin) return 'bg-purple-600';
		if (user?.isAdmin) return 'bg-blue-600';
		return 'bg-emerald-600';
	};

	const getAccountTypeText = () => {
		if (user?.superAdmin) return 'Super Administrator';
		if (user?.isAdmin) return 'Provider';
		return 'User';
	};

	return (
		<ScrollView
			className={`flex-1 ${themed.bg.background}`}
			showsVerticalScrollIndicator={false}
			refreshControl={
				<RefreshControl
					refreshing={refreshing}
					onRefresh={onRefresh}
					colors={['#444ebb']}
					tintColor={'#444ebb'}
				/>
			}>
			{/* Header */}
			<View className={`${themed.bg.primary} pt-16 pb-10 px-6 rounded-b-3xl`}>
				<View className='items-center'>
					<View className='relative mb-4'>
						<View className='w-28 h-28 rounded-full bg-white/10 border-4 border-white/30 items-center justify-center'>
							<Text className='text-white text-6xl font-bold'>
								{user?.name?.charAt(0).toUpperCase() || 'U'}
							</Text>
						</View>
						<View className='absolute bottom-2 right-2 w-5 h-5 bg-green-400 rounded-full border-2 border-white' />
					</View>

					<Text className='text-white text-2xl font-bold mb-1'>
						{user?.name || 'User'}
					</Text>
					<Text className='text-white/80 text-lg font-normal'>
						{user?.email}
					</Text>

					<View
						className={`mt-4 px-4 py-1 rounded-full ${getAccountTypeColor()} flex-row items-center`}>
						<View className='w-2 h-2 bg-white rounded-full mr-2' />
						<Text className='text-white text-lg font-semibold'>
							{getAccountTypeText()}
						</Text>
					</View>
				</View>
			</View>

			{/* Body */}
			<View className='px-6 pt-6 -mt-4'>
				<Text className={`text-xl font-bold ${themed.text.primary} mb-4`}>
					Account Details
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

				{/* Provider-specific information */}
				{(user?.isAdmin || user?.superAdmin) && (
					<>
						<Text
							className={`text-xl font-bold ${themed.text.primary} mb-4 mt-6`}>
							Provider Details
						</Text>

						<ProfileCard
							title='Printing Cost'
							value={user?.printingCost}
							icon='💰'
						/>
						<ProfileCard
							title='Printing Location'
							value={user?.printingLocation}
							icon='📍'
						/>
						<ProfileCard
							title='Opening Hours'
							value={user?.openingHours}
							icon='🕒'
						/>
						<ProfileCard
							title='Support Contact'
							value={user?.supportContact}
							icon='📞'
						/>
						{user?.additionalInfo && (
							<ProfileCard
								title='Additional Information'
								value={user?.additionalInfo}
								icon='ℹ️'
							/>
						)}

						{/* Discount Rates */}
						{user?.discountRates && user.discountRates.length > 0 && (
							<View
								className={`${themed.bg.background} border ${themed.border.primary} rounded-2xl p-5 mb-4 shadow-sm`}>
								<View className='flex-row items-center mb-3'>
									<Text className='text-lg mr-2'>🏷️</Text>
									<Text
										className={`text-xs uppercase font-semibold ${themed.text.text}`}>
										Discount Rates
									</Text>
								</View>
								{user.discountRates.map((discount, index) => (
									<Text
										key={index}
										className={`text-sm ${themed.text.text} mb-1`}>
										{discount.minPages}-{discount.maxPages} pages:{' '}
										{discount.discount}% off
									</Text>
								))}
							</View>
						)}
					</>
				)}

				{/* Document Token */}
				{user?.isAdmin && (
					<View className={`${themed.bg.card} rounded-2xl p-5 mb-6 shadow-sm`}>
						<View className='flex-row items-center mb-2'>
							<Text className='text-lg mr-2'>🔑</Text>
							<Text
								className={`text-xs uppercase font-semibold tracking-wide ${themed.text.text}`}>
								Document Token
							</Text>
						</View>
						<Text className={`text-sm font-semibold ${themed.text.text}`}>
							{user?.documentToken || 'Not assigned'}
						</Text>
					</View>
				)}
				{/* Action Items */}
				<View className='gap-4 mb-8'>
					{[
						...(user?.isAdmin || user?.superAdmin
							? [
									{
										label: 'Edit Provider Profile',
										icon: '✏️',
										onPress: () => router.push('/screens/EditProfile' as any),
									},
							  ]
							: []),
						{
							label: 'Privacy Policy',
							icon: '🔒',
							onPress: () =>
								Linking.openURL('https://uploaddoc.vercel.app/privacy-policy'),
						},
						// { label: 'Help & Support', icon: '❓', onPress: () => {} },
					].map((item, index) => (
						<TouchableOpacity
							key={index}
							onPress={item.onPress}
							className={`${themed.bg.card} border ${themed.border.card} flex-row items-center justify-between p-4 rounded-xl`}>
							<View className='flex-row items-center'>
								<Text className='text-lg mr-3'>{item.icon}</Text>
								<Text className={`text-base font-medium ${themed.text.text}`}>
									{item.label}
								</Text>
							</View>
							<Text className={`text-xl ${themed.text.text}`}>›</Text>
						</TouchableOpacity>
					))}
				</View>

				<AuthButton
					title='Sign Out'
					onPress={handleLogout}
					variant='primary'
					size='large'
				/>

				{/* Footer */}
				<View className='items-center mt-10'>
					<View className='flex-row items-center mb-2'>
						<Image
							source={icons.logo}
							className='w-6 h-6 mr-2 rounded'
							resizeMode='contain'
						/>
						<Text className={`text-sm font-medium ${themed.text.primary}`}>
							UploadDoc
						</Text>
					</View>
					<Text
						className={`text-xs mb-4 font-semibold ${themed.text.secondary}`}>
						Version 1.0.2
					</Text>
				</View>
			</View>
		</ScrollView>
	);
};

export default Profile;
