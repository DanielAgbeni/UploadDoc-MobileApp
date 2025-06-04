import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../hooks/useTheme';

const index = () => {
	const { colorScheme, themed } = useTheme();

	return (
		<View
			className={`flex-1 items-center justify-center p-4 ${themed.bg.background}`}>
			<Text className={`text-2xl font-bold mb-4 ${themed.text.primary}`}>
				Welcome to UploadDoc
			</Text>

			<Text className={`text-lg mb-2 ${themed.text.primary}`}>
				Current theme: {colorScheme}
			</Text>

			<Text className={`text-base mb-6 text-center ${themed.text.secondary}`}>
				NativeWind is working! The theme automatically switches based on your
				device settings.
			</Text>

			<TouchableOpacity
				className={`px-6 py-3 rounded-lg mb-4 ${themed.bg.primary}`}>
				<Text className='text-white font-semibold text-center'>
					Primary Button
				</Text>
			</TouchableOpacity>

			<TouchableOpacity
				className={`px-6 py-3 rounded-lg mb-4 ${themed.bg.accent}`}>
				<Text className='text-white font-semibold text-center'>
					Accent Button
				</Text>
			</TouchableOpacity>

			<View className={`p-4 rounded-lg mt-4 ${themed.bg.secondary}`}>
				<Text className='text-white text-center'>Secondary Background</Text>
			</View>

			{/* Example with border */}
			<View
				className={`p-4 rounded-lg mt-4 border-2 ${themed.border.primary} ${themed.bg.background}`}>
				<Text className={`text-center ${themed.text.primary}`}>
					Bordered Container
				</Text>
			</View>
			<View
				className={`p-4 rounded-lg mt-4 border-2 border-accent ${themed.bg.background}`}>
				<Text className={`text-center ${themed.text.primary}`}>
					Bordered Container
				</Text>
			</View>
		</View>
	);
};

export default index;
