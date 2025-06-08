// components/AdminCard.tsx
import { router } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Admin } from '../types/auth';

const AdminCard = ({ admin }: { admin: Admin }) => {
	const { themed } = useTheme();

	const handleSelectProvider = () => {
		router.push({
			pathname: '/screens/upload-document' as any,
			params: { selectedAdmin: admin._id },
		});
	};

	return (
		<View
			className={`
				rounded-xl p-4 mb-4
				${themed.bg.card}                  
				shadow-md dark:shadow-lg
			`}>
			<Text className={`text-2xl font-semibold mb-1 ${themed.text.text}`}>
				{admin.name}
			</Text>
			{/* Use themed.text.card-detail for less prominent info */}
			<Text className={`text-base mb-1 ${themed.text['card-detail']}`}>
				{admin.additionalInfo || 'No description provided'}
			</Text>
			<Text className={`text-base mb-1 ${themed.text['card-detail']}`}>
				📍 {admin.printingLocation || 'No location'}
			</Text>
			<Text className={`text-base mb-1 ${themed.text['card-detail']}`}>
				🕒 {admin.openingHours || 'No hours set'}
			</Text>
			<Text className={`text-base mb-1 ${themed.text['card-detail']}`}>
				💵 ₦{admin.printingCost ?? 'N/A'}
			</Text>
			<Text className={`text-base mb-2 ${themed.text['rating-star']}`}>
				⭐ {admin.rating || 0}
			</Text>

			<TouchableOpacity
				className={`
					mt-2 rounded-lg py-2 px-4
					${themed.bg['button-primary']}  
					shadow-md dark:shadow-lg
				`}
				onPress={handleSelectProvider}>
				<Text
					className={`text-center font-medium ${themed.text['on-button-primary']}`}>
					Select Provider
				</Text>
			</TouchableOpacity>
		</View>
	);
};

export default AdminCard;
