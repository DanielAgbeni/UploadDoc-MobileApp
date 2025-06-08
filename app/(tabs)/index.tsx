import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
	ActivityIndicator,
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
			<Text
				className={`text-lg font-bold mb-2 ${themed.text.text} ${defaultFontClass}`}>
				{item.title}
			</Text>
			<View className='flex-row items-center mb-1'>
				<View
					className={`px-2 py-1 rounded-full ${
						item.status === 'accepted'
							? 'bg-green-500' // Keep these direct for distinct status colors
							: item.status === 'pending'
							? 'bg-yellow-500'
							: 'bg-red-500'
					}`}>
					<Text className={`text-white text-sm capitalize ${defaultFontClass}`}>
						{item.status}
					</Text>
				</View>
			</View>
			<Text
				className={`${themed.text['card-detail']} mb-1 ${defaultFontClass}`}>
				Pages: {item.pageCount}
			</Text>
			<Text
				className={`${themed.text['card-detail']} mb-1 ${defaultFontClass}`}>
				Price: ₦{item.price}
			</Text>
			{item.discountPercentage > 0 && (
				<Text className={`${themed.text['card-detail']} ${defaultFontClass}`}>
					Discount Applied: {item.discountPercentage}%
				</Text>
			)}
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
