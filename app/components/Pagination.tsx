import { icons } from '@/constants/icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

const Pagination = ({ currentPage, totalPages, onPageChange }: any) => {
	return (
		<View className='flex-row justify-center items-center mt-4 space-x-4'>
			<TouchableOpacity
				className='px-3 py-1 rounded'
				disabled={currentPage === 1}
				onPress={() => onPageChange(currentPage - 1)}>
				<Image
					source={icons.arrowForward}
					className='w-6 h-6 rotate-180'
				/>
			</TouchableOpacity>

			<Text className='text-black dark:text-white font-semibold'>
				Page {currentPage} of {totalPages}
			</Text>

			<TouchableOpacity
				className={`px-3 py-1 rounded`}
				disabled={currentPage === totalPages}
				onPress={() => onPageChange(currentPage + 1)}>
				<Image
					source={icons.arrowForward}
					className='w-6 h-6'
				/>
			</TouchableOpacity>
		</View>
	);
};

export default Pagination;
