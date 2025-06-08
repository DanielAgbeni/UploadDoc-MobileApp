import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../hooks/useTheme';

const AdminCard = ({ admin }: { admin: any }) => {
	const { themed } = useTheme();
	return (
		<View className={`rounded-xl ${themed.border.accent} border-2  p-4 mb-4`}>
			<Text className={`text-xl font-semibold ${themed.text.text}`}>
				{admin.name}
			</Text>
			<Text className={`text-sm font-semibold ${themed.text.text}`}>
				{admin.additionalInfo || 'No description provided'}
			</Text>
			<Text
				className={`text-sm font-semibold ${themed.text.text}`}
				style={{ opacity: 0.9 }}>
				📍 {admin.printingLocation || 'No location'}
			</Text>
			<Text
				className={`text-sm font-semibold ${themed.text.text}`}
				style={{ opacity: 0.9 }}>
				🕒 {admin.openingHours || 'No hours set'}
			</Text>
			<Text
				className={`text-sm font-semibold ${themed.text.text}`}
				style={{ opacity: 0.9 }}>
				💵 ₦{admin.printingCost ?? 'N/A'}
			</Text>
			<Text
				className={`text-sm mb-2 ${themed.text.text}`}
				style={{ opacity: 0.9 }}>
				⭐ {admin.rating || 0}
			</Text>

			<TouchableOpacity
				className='mt-2 rounded-lg py-2 px-4'
				style={{
					backgroundColor: 'rgba(37, 99, 235, 0.8)', // Semi-transparent blue
					backdropFilter: 'blur(8px)',
					borderWidth: 1,
					borderColor: 'rgba(59, 130, 246, 0.3)',
					shadowColor: '#2563eb',
					shadowOffset: {
						width: 0,
						height: 2,
					},
					shadowOpacity: 0.25,
					shadowRadius: 8,
					elevation: 4,
				}}
				onPress={() => alert(`Selected: ${admin.name}`)}>
				<Text className='text-white text-center font-medium'>
					Select Provider
				</Text>
			</TouchableOpacity>
		</View>
	);
};

export default AdminCard;
