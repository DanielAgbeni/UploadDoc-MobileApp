// screens/ExploreScreen.tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	FlatList,
	RefreshControl,
	SafeAreaView,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import AdminCard from '../components/AdminCard';
import Pagination from '../components/Pagination';
import useTheme from '../hooks/useTheme';
import AdminService from '../services/adminService';
import { Admin } from '../types/auth';

const ExploreScreen = () => {
	const [admins, setAdmins] = useState<Admin[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [error, setError] = useState<null | string>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);

	// State for search functionality
	const [searchQuery, setSearchQuery] = useState('');
	const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

	const { themed } = useTheme();
	const LIMIT = 10;

	// Debounce effect for search query
	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedSearchQuery(searchQuery);
		}, 500);
		return () => {
			clearTimeout(handler);
		};
	}, [searchQuery]);

	// Memoized fetch function to prevent unnecessary re-creations
	const fetchAdmins = useCallback(
		async (pageToFetch: number, currentSearchQuery: string) => {
			try {
				if (!isRefreshing) {
					setIsLoading(true);
				}
				setError(null);

				const response = await AdminService.getAdmins(
					pageToFetch,
					LIMIT,
					currentSearchQuery,
				);

				setAdmins(response.admins);
				setTotalPages(response.pagination.totalPages);
				setCurrentPage(response.pagination.currentPage);
			} catch (err: any) {
				const errorMessage = err.message || 'An unexpected error occurred.';
				Alert.alert('Error', `Could not fetch providers: ${errorMessage}`);
				console.error('Error fetching admins:', err);
				setError(errorMessage);
			} finally {
				setIsLoading(false);
				setIsRefreshing(false);
			}
		},
		[isRefreshing],
	);

	// Effect to trigger data fetching whenever currentPage or debouncedSearchQuery changes
	useEffect(() => {
		if (currentPage === 1) {
			fetchAdmins(1, debouncedSearchQuery);
		} else {
			fetchAdmins(currentPage, debouncedSearchQuery);
		}
	}, [currentPage, debouncedSearchQuery, fetchAdmins]);

	const handleRefresh = () => {
		setIsRefreshing(true);
		setCurrentPage(1);
	};

	const handlePageChange = (page: number) => {
		if (page > 0 && page <= totalPages) {
			setCurrentPage(page);
		}
	};

	const handleSearchClear = () => {
		setSearchQuery('');
		setCurrentPage(1);
	};

	// Header Component
	const renderHeader = () => (
		<View
			className={`${themed.bg.background} border-b border-gray-200 dark:border-gray-700 mt-14`}>
			{/* Title Section */}
			<View className='px-6 pt-4 pb-6 flex flex-col items-center justify-center'>
				<Text className={`text-4xl font-extrabold ${themed.text.text} mb-2`}>
					Find a Provider
				</Text>
				<Text
					className={`text-lg mb-6 ${themed.text.text} text-center font-medium leading-5`}>
					Connect with trusted providers in your area who can help with your
					printing needs.
				</Text>
			</View>

			{/* Search Input Section */}
			<View className='px-6 pb-4'>
				<View className='relative'>
					<TextInput
						className={`border rounded-xl px-4 py-3 text-base ${themed.text.text} ${themed.border.primary} ${themed.bg.background} pr-10`}
						placeholder='Search by name, location, or contact...'
						value={searchQuery}
						placeholderTextColor='#808080'
						onChangeText={setSearchQuery}
						autoCorrect={false}
						autoCapitalize='none'
						returnKeyType='search'
						onSubmitEditing={() => {
							setDebouncedSearchQuery(searchQuery);
							setCurrentPage(1);
						}}
					/>
					{searchQuery.length > 0 && (
						<TouchableOpacity
							onPress={handleSearchClear}
							className='absolute right-3 top-1/2 -mt-3 w-6 h-6 rounded-full items-center justify-center bg-gray-400 dark:bg-gray-600'
							activeOpacity={0.7}>
							<Text className='text-white font-bold text-xs'>✕</Text>
						</TouchableOpacity>
					)}
				</View>
			</View>
		</View>
	);

	// Loading state for initial load
	if (isLoading && !isRefreshing && admins.length === 0) {
		return (
			<SafeAreaView className={`flex-1 ${themed.bg.background}`}>
				{renderHeader()}
				<View className='flex-1 items-center justify-center'>
					<ActivityIndicator
						size='large'
						color='#3B82F6'
					/>
					<Text className={`mt-4 text-2xl font-semibold ${themed.text.text}`}>
						Loading providers...
					</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className={`flex-1 ${themed.bg.background}`}>
			{renderHeader()}

			{error ? (
				<View className='flex-1 items-center justify-center px-6'>
					<Text className='text-red-500 text-lg mb-4 text-center'>{error}</Text>
					<TouchableOpacity
						onPress={() => fetchAdmins(currentPage, debouncedSearchQuery)}
						className='px-6 py-3 bg-blue-500 rounded-xl'
						activeOpacity={0.8}>
						<Text className='text-white text-base font-medium'>Retry</Text>
					</TouchableOpacity>
				</View>
			) : admins.length === 0 && !isLoading ? (
				<View className='flex-1 items-center justify-center px-6'>
					<Text
						className={`text-xl font-bold ${themed.text.text} mb-2 text-center`}>
						No providers found
					</Text>
					<Text className={`${themed.text.text} text-center mb-6 leading-5`}>
						{searchQuery.length > 0
							? `No results for "${searchQuery}". Try a different search term.`
							: 'No providers available at the moment. Pull down to refresh.'}
					</Text>
					{searchQuery.length > 0 && (
						<TouchableOpacity
							onPress={handleSearchClear}
							className='px-6 py-3 bg-blue-500 rounded-xl'
							activeOpacity={0.8}>
							<Text className='text-white text-base font-medium'>
								Clear Search
							</Text>
						</TouchableOpacity>
					)}
				</View>
			) : (
				<FlatList
					data={admins}
					keyExtractor={(item) => item._id}
					renderItem={({ item }) => <AdminCard admin={item} />}
					className='px-4'
					showsVerticalScrollIndicator={false}
					refreshControl={
						<RefreshControl
							refreshing={isRefreshing}
							onRefresh={handleRefresh}
							colors={['#3B82F6']}
							tintColor='#3B82F6'
						/>
					}
					ListFooterComponent={
						totalPages > 1 ? (
							<View className='pt-4 pb-6'>
								<Pagination
									currentPage={currentPage}
									totalPages={totalPages}
									onPageChange={handlePageChange}
								/>
							</View>
						) : (
							<View className='pb-6' />
						)
					}
					contentContainerStyle={{
						paddingTop: 16,
						flexGrow: 1,
					}}
				/>
			)}
		</SafeAreaView>
	);
};

export default ExploreScreen;
