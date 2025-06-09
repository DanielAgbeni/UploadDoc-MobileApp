import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	Image,
	Platform,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import {
	KeyboardAwareScrollView,
	KeyboardToolbar,
} from 'react-native-keyboard-controller';
import { icons } from '../../constants/icons';
import { AuthButton } from '../components/auth/AuthButton';
import { FormInput } from '../components/FormInput';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { ProfileService } from '../services/profileService';
import { DiscountRate, UpdateProfileRequest } from '../types/auth';

const PRESET_OPENING_HOURS = [
	'8 AM - 5 PM',
	'9 AM - 6 PM',
	'10 AM - 7 PM',
	'Custom',
];

const EditProfile = () => {
	const router = useRouter();
	const { themed } = useTheme();
	const { user, token } = useAuth();

	// Safety timeout to prevent infinite loading
	useEffect(() => {
		const safetyTimeout = setTimeout(() => {
			setFetchLoading(false);
		}, 5000); // 5 seconds timeout

		return () => clearTimeout(safetyTimeout);
	}, []);

	const [profile, setProfile] = useState({
		printingCost: '',
		printingLocation: '',
		openingHours: '',
		customOpeningHours: '',
		discountRates: [] as DiscountRate[],
		supportContact: '',
		additionalInfo: '',
	});

	const [initialProfile, setInitialProfile] = useState<typeof profile | null>(
		null,
	);
	const [loading, setLoading] = useState(false);
	const [fetchLoading, setFetchLoading] = useState(true);
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');
	const [isAdmin, setIsAdmin] = useState(false);

	const [newDiscount, setNewDiscount] = useState({
		minPages: '',
		maxPages: '',
		discount: '',
	});

	// Check if user is admin
	useEffect(() => {
		if (user) {
			const adminStatus = user?.isAdmin || user?.superAdmin;

			setIsAdmin(adminStatus);

			if (!adminStatus) {
				Alert.alert(
					'Access Denied',
					'Only providers can edit profile details.',
					[{ text: 'OK', onPress: () => router.back() }],
				);
			}
		} else {
			setFetchLoading(false);
		}
	}, [user]);

	// Initialize profile data from user context
	useEffect(() => {
		const initializeProfile = () => {
			if (!user) {
				setFetchLoading(false);
				return;
			}

			if (!isAdmin) {
				setFetchLoading(false);
				return;
			}

			try {
				setFetchLoading(true);
				setError('');

				const initial = {
					printingCost: user.printingCost || '',
					printingLocation: user.printingLocation || '',
					openingHours: user.openingHours || '',
					customOpeningHours:
						!PRESET_OPENING_HOURS.includes(user.openingHours || '') &&
						user.openingHours
							? user.openingHours
							: '',
					discountRates: Array.isArray(user.discountRates)
						? user.discountRates
						: [],
					supportContact: user.supportContact || '',
					additionalInfo: user.additionalInfo || '',
				};

				setInitialProfile(initial);
				setProfile(initial);

				// Handle custom opening hours
				if (
					user.openingHours &&
					!PRESET_OPENING_HOURS.includes(user.openingHours)
				) {
					setProfile((prev) => ({
						...prev,
						openingHours: 'Custom',
						customOpeningHours: user.openingHours || '',
					}));
				}
			} catch (err) {
				console.error('Error initializing profile:', err);
				setError('Failed to load profile data. Please try again later.');
			} finally {
				setFetchLoading(false);
			}
		};

		// Add a small delay to ensure user state is properly set
		const timer = setTimeout(initializeProfile, 100);

		return () => clearTimeout(timer);
	}, [user, isAdmin]);

	const handleChange = (field: string, value: string) => {
		setProfile((prev) => ({ ...prev, [field]: value }));
	};

	// const handleOpeningHoursChange = (hours: string) => {
	// 	setProfile((prev) => ({
	// 		...prev,
	// 		openingHours: hours,
	// 		// Clear custom hours if selecting a preset
	// 		customOpeningHours: hours === 'Custom' ? prev.customOpeningHours : '',
	// 	}));
	// };

	const handleNewDiscountChange = (field: string, value: string) => {
		setNewDiscount({ ...newDiscount, [field]: value });
	};

	const addDiscountRate = () => {
		if (newDiscount.minPages && newDiscount.maxPages && newDiscount.discount) {
			const discountRate: DiscountRate = {
				minPages: parseInt(newDiscount.minPages),
				maxPages: parseInt(newDiscount.maxPages),
				discount: parseFloat(newDiscount.discount),
			};
			setProfile({
				...profile,
				discountRates: [...profile.discountRates, discountRate],
			});
			setNewDiscount({ minPages: '', maxPages: '', discount: '' });
		} else {
			setError('Please fill in all fields to add a new discount rate.');
		}
	};

	const removeDiscountRate = (index: number) => {
		const updatedDiscounts = [...profile.discountRates];
		updatedDiscounts.splice(index, 1);
		setProfile({
			...profile,
			discountRates: updatedDiscounts,
		});
	};

	const handleSubmit = async () => {
		if (!token) {
			setError('Authentication token not found');
			return;
		}

		setLoading(true);
		setMessage('');
		setError('');

		// Check if profile has changed
		const isProfileChanged =
			JSON.stringify(profile) !== JSON.stringify(initialProfile);

		if (!isProfileChanged) {
			setError('No changes to save.');
			setLoading(false);
			return;
		}

		const payload: UpdateProfileRequest = {
			...profile,
			openingHours:
				profile.openingHours === 'Custom'
					? profile.customOpeningHours
					: profile.openingHours,
		};

		try {
			await ProfileService.updateProfile(payload, token);
			setMessage('Profile updated successfully');
			setTimeout(() => setMessage(''), 5000);
		} catch (error: any) {
			setError(error?.message || 'Error updating profile');
		} finally {
			setLoading(false);
		}
	};

	if (fetchLoading) {
		return (
			<View
				className={`flex-1 ${themed.bg.background} justify-center items-center px-4`}>
				<View className='bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg min-w-[200px] items-center'>
					<ActivityIndicator
						size='large'
						color='#444ebb'
						className='mb-4'
					/>
					<Text className={`text-lg font-medium ${themed.text.primary} mb-2`}>
						Loading profile...
					</Text>
				</View>
			</View>
		);
	}

	return (
		<>
			<KeyboardAwareScrollView
				bottomOffset={62}
				className='flex-1'>
				<ScrollView
					className={`flex-1 ${themed.bg.background}`}
					contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
					keyboardShouldPersistTaps='handled'
					showsVerticalScrollIndicator={false}
					automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}>
					{/* Header Section */}
					<View
						className={`${themed.bg.background} border-b ${themed.border.primary} mt-3 pb-4 pt-12 px-6 shadow-sm`}>
						<View className='flex-row items-center justify-between'>
							<View className='flex-row items-center flex-1'>
								<TouchableOpacity
									onPress={() => router.back()}
									className={`w-10 h-10 rounded-full ${themed.bg.background} items-center justify-center mr-3 shadow-sm`}>
									<Image
										source={icons.arrowBack}
										resizeMode='cover'
										className='w-10 h-10'
										tintColor={'#444ebb'}
									/>
								</TouchableOpacity>
								<View>
									<Text className={`text-2xl font-bold ${themed.text.primary}`}>
										Edit Profile
									</Text>
								</View>
							</View>
						</View>
					</View>

					<View className='flex-1 px-6 py-6'>
						{/* Success/Error Messages */}
						{message && (
							<View className='mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 shadow-sm'>
								<View className='flex-row items-center'>
									<View className='w-2 h-2 bg-emerald-500 rounded-full mr-3' />
									<Text className='text-emerald-700 dark:text-emerald-300 font-medium flex-1'>
										{message}
									</Text>
								</View>
							</View>
						)}
						{error && (
							<View className='mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 shadow-sm'>
								<View className='flex-row items-center'>
									<View className='w-2 h-2 bg-red-500 rounded-full mr-3' />
									<Text className='text-red-700 dark:text-red-300 font-medium flex-1'>
										{error}
									</Text>
								</View>
							</View>
						)}
						{/* Basic Information Section */}
						<View
							className={`${themed.bg.card} rounded-2xl p-6 mb-6 shadow-sm border ${themed.border.card}`}>
							<Text className={`text-2xl font-bold ${themed.text.text} mb-1`}>
								Basic Information
							</Text>
							<Text
								className={`text-base font-medium ${themed.text.text} mb-6`}>
								Essential details about your printing service
							</Text>

							<View className='space-y-4'>
								<FormInput
									label='Printing Cost (per page)'
									value={profile.printingCost}
									onChangeText={(text) => handleChange('printingCost', text)}
									placeholder='e.g., ₦10 per page'
								/>

								<FormInput
									label='Printing Location'
									value={profile.printingLocation}
									onChangeText={(text) =>
										handleChange('printingLocation', text)
									}
									placeholder='e.g., Main Library, Ground Floor'
								/>

								<FormInput
									label='Support Contact'
									value={profile.supportContact}
									onChangeText={(text) => handleChange('supportContact', text)}
									placeholder='e.g., +234 123 456 7890'
									keyboardType='phone-pad'
								/>
							</View>
						</View>

						{/* <View
						className={`${themed.bg.background} rounded-2xl p-6 mb-6 shadow-sm border ${themed.border.primary}`}>
						<Text className={`text-xl font-bold ${themed.text.text} mb-1`}>
							Operating Hours
						</Text>
						<Text className={`text-sm ${themed.text.text} mb-6`}>
							When customers can access your service
						</Text>

						<View className='flex-row flex-wrap gap-3 mb-4'>
							{PRESET_OPENING_HOURS.map((hours) => (
								<TouchableOpacity
									key={hours}
									onPress={() => handleOpeningHoursChange(hours)}
									activeOpacity={0.7}
									className={`px-4 py-3 rounded-xl border-2 ${
										profile.openingHours === hours
											? `${themed.bg.primary} border-transparent shadow-md`
											: `${themed.bg.background} ${themed.border.primary}`
									}`}>
									<Text
										className={`text-sm font-medium ${
											profile.openingHours === hours
												? 'text-white'
												: themed.text.text
										}`}>
										{hours}
									</Text>
								</TouchableOpacity>
							))}
						</View>

						{profile.openingHours === 'Custom' && (
							<View className='mt-4'>
								<FormInput
									label='Custom Opening Hours'
									value={profile.customOpeningHours}
									onChangeText={(text) =>
										handleChange('customOpeningHours', text)
									}
									placeholder='e.g., Mon-Fri: 8AM-6PM, Sat: 9AM-3PM'
								/>
							</View>
						)}
					</View> */}
						{/* Discount Rates Section */}
						<View
							className={`${themed.bg.card} rounded-2xl p-6 mb-6 shadow-sm border ${themed.border.card}`}>
							<Text className={`text-2xl font-bold ${themed.text.text} mb-1`}>
								Discount Rates
							</Text>
							<Text
								className={`text-base font-medium ${themed.text.text} mb-6`}>
								Offer discounts based on page count
							</Text>

							{/* Existing Discount Rates */}
							{profile.discountRates.length > 0 && (
								<View className='mb-6'>
									<Text
										className={`text-sm font-semibold ${themed.text.text} mb-3`}>
										Current Discounts
									</Text>
									{profile.discountRates.map((discount, index) => (
										<View
											key={index}
											className={`${themed.bg.background} border-2 ${themed.border.primary} rounded-xl p-4 mb-3 flex-row justify-between items-center`}>
											<View className='flex-1'>
												<Text
													className={`text-base font-medium ${themed.text.text}`}>
													{discount.minPages}-{discount.maxPages} pages
												</Text>
												<Text className={`text-sm ${themed.text.secondary}`}>
													{discount.discount}% discount
												</Text>
											</View>
											<TouchableOpacity
												onPress={() => removeDiscountRate(index)}
												className='bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg shadow-sm'>
												<Text className='text-white text-sm font-medium'>
													Remove
												</Text>
											</TouchableOpacity>
										</View>
									))}
								</View>
							)}

							{/* Add New Discount Rate */}
							<View
								className={`${themed.bg.background} border-2 border-dashed ${themed.border.primary} rounded-xl p-5`}>
								<Text
									className={`text-sm font-semibold ${themed.text.text} mb-4`}>
									Add New Discount Rate
								</Text>
								<View className='flex-row gap-3 mb-4'>
									<View className='flex-1'>
										<FormInput
											label='Min Pages'
											value={newDiscount.minPages}
											onChangeText={(text) =>
												handleNewDiscountChange('minPages', text)
											}
											placeholder='10'
											keyboardType='numeric'
										/>
									</View>
									<View className='flex-1'>
										<FormInput
											label='Max Pages'
											value={newDiscount.maxPages}
											onChangeText={(text) =>
												handleNewDiscountChange('maxPages', text)
											}
											placeholder='50'
											keyboardType='numeric'
										/>
									</View>
									<View className='flex-1'>
										<FormInput
											label='Discount %'
											value={newDiscount.discount}
											onChangeText={(text) =>
												handleNewDiscountChange('discount', text)
											}
											placeholder='10'
											keyboardType='numeric'
										/>
									</View>
								</View>
								<TouchableOpacity
									onPress={addDiscountRate}
									className={`${themed.bg.secondary} hover:${themed.bg.primary} px-6 py-3 rounded-xl flex-row items-center justify-center shadow-sm`}>
									<Text className='text-white font-semibold mr-2'>+</Text>
									<Text className='text-white font-semibold'>Add Discount</Text>
								</TouchableOpacity>
							</View>
						</View>
						{/* Additional Information Section */}
						<View
							className={`${themed.bg.card} rounded-2xl p-6 mb-8 shadow-sm border ${themed.border.card}`}>
							<Text className={`text-2xl font-bold ${themed.text.text} mb-1`}>
								Additional Information
							</Text>
							<Text
								className={`text-base font-medium ${themed.text.text} mb-6`}>
								Any extra details about your service
							</Text>

							<FormInput
								label='Additional Information'
								value={profile.additionalInfo}
								onChangeText={(text) => handleChange('additionalInfo', text)}
								placeholder='Any additional details about your service (e.g., special offers, terms, contact hours)'
								multiline={true}
								numberOfLines={4}
								maxLength={500}
							/>
						</View>
						{/* Submit Button */}
						<View className='pb-6'>
							<AuthButton
								title='Update Profile'
								onPress={handleSubmit}
								loading={loading}
								size='large'
							/>
						</View>
					</View>
				</ScrollView>
			</KeyboardAwareScrollView>
			<KeyboardToolbar />
		</>
	);
};

export default EditProfile;
