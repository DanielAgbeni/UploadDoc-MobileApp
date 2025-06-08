import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	FlatList,
	Image,
	RefreshControl,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { icons } from '../../constants/icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { DashboardService } from '../services/dashboardService';
import { DocumentService } from '../services/documentService';
import { Project } from '../types/auth';

const HomeScreen = () => {
	const { themed, colors } = useTheme();
	const { user, token } = useAuth();
	const [documents, setDocuments] = useState<Project[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);

	// Define a default font class to apply to all text components
	const defaultFontClass = 'font-inter'; // Ensure 'Inter' font is loaded in your app

	const fetchDocuments = useCallback(
		async (pageNum: number) => {
			if (!user || !token) return;

			try {
				setIsLoading(!isRefreshing); // Only show full loader if not refreshing
				const response = await DocumentService.getUserDocuments(
					user._id,
					pageNum,
					10, // Assuming 10 items per page
					token,
				);
				setDocuments(response.projects);
				setTotalPages(response.pagination.totalPages);
			} catch (err) {
				console.error('Error fetching documents:', err);
				// Optionally set an error state to display to the user
			} finally {
				setIsLoading(false);
				setIsRefreshing(false);
			}
		},
		[user, token, isRefreshing],
	);

	useEffect(() => {
		fetchDocuments(page);
	}, [fetchDocuments, page]);

	const handleDeleteProject = async (projectId: string) => {
		if (!token) return;

		Alert.alert(
			'Confirm Delete',
			'Are you sure you want to delete this project?',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Delete',
					style: 'destructive',
					onPress: async () => {
						try {
							setIsLoading(true);
							await DashboardService.deleteProject(projectId, token);
							Alert.alert('Success', 'Project deleted successfully');
							await fetchDocuments(page);
						} catch (err: any) {
							Alert.alert('Error', err.message || 'Failed to delete project');
						} finally {
							setIsLoading(false);
						}
					},
				},
			],
		);
	};

	const handleRefresh = useCallback(() => {
		setIsRefreshing(true);
		setPage(1); // Reset to first page on refresh
		fetchDocuments(1);
	}, [fetchDocuments]);

	const navigateToUpload = (selectedAdmin?: string) => {
		router.push({
			pathname: '/screens/upload-document' as any,
			params: { selectedAdmin },
		});
	};

	const renderDocumentItem = ({ item }: { item: Project }) => (
		<View
			className={`
    p-5 mb-4 rounded-xl border-2 shadow-md
    ${themed.bg.card} ${themed.border.card}
  `}>
			{/* Title */}
			<Text
				className={`text-xl font-bold mb-3 ${themed.text.text} ${defaultFontClass}`}>
				{item.title}
			</Text>

			{/* Status Badge */}
			<View className='flex-row items-center mb-3'>
				<View
					className={`px-3 py-1 rounded-full ${
						item.status === 'accepted'
							? 'bg-green-500'
							: item.status === 'pending'
							? 'bg-yellow-500'
							: 'bg-red-500'
					}`}>
					<Text className={`text-white text-sm capitalize ${defaultFontClass}`}>
						{item.status}
					</Text>
				</View>
			</View>

			{/* Detail Rows */}
			<View className='mb-2'>
				<Text
					className={`${themed.text['card-detail']} mb-1 ${defaultFontClass}`}>
					Pages: <Text className='font-medium'>{item.pageCount}</Text>
				</Text>
				<Text
					className={`${themed.text['card-detail']} mb-1 ${defaultFontClass}`}>
					Price: <Text className='font-medium'>₦{item.price}</Text>
				</Text>

				{item.discountPercentage > 0 && (
					<Text className={`${themed.text['card-detail']} ${defaultFontClass}`}>
						Discount Applied:{' '}
						<Text className='font-medium'>{item.discountPercentage}%</Text>
					</Text>
				)}
			</View>

			{/* Action Button */}
			<TouchableOpacity
				onPress={() => handleDeleteProject(item._id)}
				className={`mt-3 px-4 py-2 rounded-lg self-start ${themed.bg['button-delete']}`}>
				<Text
					className={`${themed.text['on-button-delete']} font-medium ${defaultFontClass}`}
					numberOfLines={1}
					ellipsizeMode='tail'>
					Delete
				</Text>
			</TouchableOpacity>
		</View>
	);

	return (
		<View className={`flex-1 ${themed.bg.background}`}>
			{/* Header */}
			<View className={`items-center mt-6 px-6 pt-16 pb-8`}>
				<Image
					source={icons.logo}
					className='w-24 h-24 mb-6 rounded-lg' // Added rounded-lg
					resizeMode='contain'
				/>
				<Text
					className={`text-4xl font-extrabold mb-3 text-center ${themed.text.primary} ${defaultFontClass}`}>
					UploadDoc
				</Text>
				<Text
					className={`text-xl text-center mb-6 ${themed.text.text} ${defaultFontClass}`}>
					Simplify Your Document Management
				</Text>
			</View>

			{/* Submit Document Button */}
			<TouchableOpacity
				onPress={() => navigateToUpload()}
				className={`
					mx-6 mb-8 p-4 rounded-xl shadow-lg
					${themed.bg.primary} flex-row items-center justify-center
				`}>
				<Image
					source={icons.upload}
					className='w-7 h-7 mr-3'
					tintColor={colors['on-button-primary']} // Use direct color for tint
				/>
				<Text
					className={`text-xl font-bold ${themed.text['on-button-primary']} ${defaultFontClass}`}>
					Submit Document
				</Text>
			</TouchableOpacity>

			{/* Submitted Documents Heading */}
			<Text
				className={`text-2xl font-bold mx-6 mb-4 ${themed.text.text} ${defaultFontClass}`}>
				Submitted Documents
			</Text>

			{/* Documents List */}
			{isLoading && !isRefreshing ? (
				<View className='flex-1 justify-center items-center'>
					<ActivityIndicator
						size='large'
						color={colors.primary}
					/>
					<Text className={`mt-4 ${themed.text.text} ${defaultFontClass}`}>
						Loading documents...
					</Text>
				</View>
			) : (
				<FlatList
					data={documents}
					renderItem={renderDocumentItem}
					keyExtractor={(item) => item._id}
					className='px-6' // Changed to px-6 for consistency
					showsVerticalScrollIndicator={false}
					refreshControl={
						<RefreshControl
							refreshing={isRefreshing}
							onRefresh={handleRefresh}
							colors={[colors.primary]}
							tintColor={colors.primary}
						/>
					}
					ListEmptyComponent={
						<View className='flex-1 items-center justify-center p-4'>
							<Text
								className={`text-lg text-center ${themed.text.text} ${defaultFontClass}`}>
								No documents found. Submit your first document!
							</Text>
						</View>
					}
				/>
			)}
		</View>
	);
};

export default HomeScreen;
