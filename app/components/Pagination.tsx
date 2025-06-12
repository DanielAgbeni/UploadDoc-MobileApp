import { icons } from '@/constants/icons';
import React, { useRef } from 'react';
import {
	Image,
	PanResponder,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';

const Pagination = ({ currentPage, totalPages, onPageChange }: any) => {
	const panResponder = useRef(
		PanResponder.create({
			onMoveShouldSetPanResponder: (evt, gestureState) => {
				// Activate pan responder if horizontal movement is greater than vertical
				return (
					Math.abs(gestureState.dx) > Math.abs(gestureState.dy) &&
					Math.abs(gestureState.dx) > 10
				);
			},
			onPanResponderMove: (evt, gestureState) => {
				// Optional: Add visual feedback during swipe
			},
			onPanResponderRelease: (evt, gestureState) => {
				const swipeThreshold = 50;

				if (gestureState.dx > swipeThreshold && currentPage > 1) {
					// Swipe right - go to previous page
					onPageChange(currentPage - 1);
				} else if (
					gestureState.dx < -swipeThreshold &&
					currentPage < totalPages
				) {
					// Swipe left - go to next page
					onPageChange(currentPage + 1);
				}
			},
		}),
	).current;

	return (
		<View
			{...panResponder.panHandlers}
			className='flex-row justify-center items-center my-2 space-x-4'>
			<TouchableOpacity
				className='px-3 py-1 rounded'
				disabled={currentPage === 1}
				onPress={() => onPageChange(currentPage - 1)}>
				<Image
					source={icons.arrowForward}
					className='w-7 h-7 rotate-180'
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
					className='w-7 h-7'
				/>
			</TouchableOpacity>
		</View>
	);
};

export default Pagination;
