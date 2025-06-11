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
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import useTheme from '../hooks/useTheme';
import AdminService from '../services/adminService';
import DashboardService from '../services/dashboardService';
import { DocumentService } from '../services/documentService';
import { Admin, Project } from '../types/auth';

const HomeScreen = () => {
	const { themed, colors } = useTheme();
	const { user, token } = useAuth();
	const [documents, setDocuments] = useState<Project[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [page, setPage] = useState(1);

	const [adminResults, setAdminResults] = useState<Admin[]>([]);

	const getAdminName = (adminId: string | undefined) => {
		if (!adminId) return 'Unassigned';
		const admin = adminResults?.find((admin) => admin._id === adminId);
		return admin ? admin.name : 'Unknown Admin';
	};

	// Add modal state
	const [modalVisible, setModalVisible] = useState(false);
	const [modalConfig, setModalConfig] = useState<{
		title: string;
		message: string;
		buttons: Array<{
			text: string;
			onPress: () => void;
			variant?: 'primary' | 'secondary' | 'danger';
		}>;
	}>({
		title: '',
		message: '',
		buttons: [{ text: 'OK', onPress: () => {}, variant: 'primary' }],
	});

	const defaultFontClass = 'font-inter';

	const fetchDocuments = useCallback(
		async (pageNum: number) => {
			if (!user || !token) return;

			try {
				setIsLoading(!isRefreshing);
				const response = await DocumentService.getUserDocuments(
					user._id,
					pageNum,
					10,
					token,
				);

				// Fetch admin data for all documents
				const adminIds = [
					...new Set(
						response.projects
							.map((project) => project.assignedAdmin)
							.filter(Boolean),
					),
				];

				if (adminIds.length > 0) {
					try {
						// Fetch all admins in one request with a larger limit
						const adminResponse = await AdminService.getAdmins(1, 50);
						const admins = adminResponse.admins.filter((admin) =>
							adminIds.includes(admin._id),
						);

						setAdminResults(admins);
					} catch (error) {
						console.error('Error fetching admin data:', error);
					}
				}

				setDocuments(response.projects);
			} catch (err) {
				console.error('Error fetching documents:', err);
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

		setModalConfig({
			title: 'Confirm Delete',
			message: 'Are you sure you want to delete this project?',
			buttons: [
				{
					text: 'Cancel',
					onPress: () => setModalVisible(false),
					variant: 'secondary',
				},
				{
					text: 'Delete',
					onPress: async () => {
						setModalVisible(false);
						try {
							setIsLoading(true);
							await DashboardService.deleteProject(projectId, token);
							setModalConfig({
								title: 'Success',
								message: 'Project deleted successfully',
								buttons: [
									{
										text: 'OK',
										onPress: () => setModalVisible(false),
										variant: 'primary',
									},
								],
							});
							setModalVisible(true);
							await fetchDocuments(page);
						} catch (err: any) {
							setModalConfig({
								title: 'Error',
								message: err.message || 'Failed to delete project',
								buttons: [
									{
										text: 'OK',
										onPress: () => setModalVisible(false),
										variant: 'danger',
									},
								],
							});
							setModalVisible(true);
						} finally {
							setIsLoading(false);
						}
					},
					variant: 'danger',
				},
			],
		});
		setModalVisible(true);
	};

	const handleRefresh = useCallback(() => {
		setIsRefreshing(true);
		setPage(1);
		fetchDocuments(1);
	}, [fetchDocuments]);

	const navigateToUpload = (selectedAdmin?: string) => {
		router.push({
			pathname: '/screens/upload-document' as any,
			params: { selectedAdmin },
		});
	};

	const renderDocumentItem = ({ item }: { item: Project }) => (
		<View className={`p-5 mb-6 rounded-2xl shadow-lg ${themed.bg.card}`}>
			{/* Title */}
			<Text
				className={`text-2xl font-bold mb-4 ${themed.text.text} ${defaultFontClass}`}
				numberOfLines={1}
				ellipsizeMode='tail'>
				{item.title}
			</Text>

			{/* Student Info & Pages */}
			<View className='flex-row justify-between items-center mb-3'>
				<Text
					className={`text-base font-medium ${themed.text.text} ${defaultFontClass}`}
					numberOfLines={1}
					ellipsizeMode='tail'>
					Submitted to: {getAdminName(item.assignedAdmin)}
				</Text>
				<Text
					className={`text-base font-medium ${themed.text.text} ${defaultFontClass}`}
					numberOfLines={1}
					ellipsizeMode='tail'>
					Pages: {item.pageCount}
				</Text>
			</View>

			{/* Price */}
			{item.price && (
				<View className='flex-row justify-between items-center mb-3'>
					<Text
						className={`text-lg font-semibold ${themed.text.text} ${defaultFontClass}`}
						numberOfLines={1}
						ellipsizeMode='tail'>
						₦{item.price}
					</Text>
					{item.discountPercentage > 0 && (
						<Text
							className={`text-base ${themed.text.text} ${defaultFontClass}`}
							numberOfLines={1}
							ellipsizeMode='tail'>
							Discount: {item.discountPercentage}%
						</Text>
					)}
				</View>
			)}

			{/* Status & Discount */}
			<View className='flex-row justify-between items-center mb-3 flex-wrap gap-y-2'>
				{/* Status */}
				<View className='flex-row items-center'>
					<Text
						className={`text-base mr-2 ${themed.text.text} ${defaultFontClass}`}
						numberOfLines={1}
						ellipsizeMode='tail'>
						Status:
					</Text>
					<View
						className={`px-3 py-1 rounded-full ${
							item.status === 'accepted'
								? 'bg-green-500'
								: item.status === 'pending'
									? 'bg-yellow-500'
									: 'bg-red-500'
						}`}>
						<Text
							className={`text-white text-sm capitalize ${defaultFontClass}`}
							numberOfLines={1}
							ellipsizeMode='tail'>
							{item.status}
						</Text>
					</View>
				</View>

				<View className='flex-row justify-end mt-4'>
					<TouchableOpacity
						onPress={() => handleDeleteProject(item._id)}
						className={`px-4 py-2 rounded-lg ${themed.bg['button-delete']}`}>
						<Text
							className={`text-sm font-medium ${themed.text['on-button-delete']} ${defaultFontClass}`}
							numberOfLines={1}
							ellipsizeMode='tail'>
							Delete
						</Text>
					</TouchableOpacity>
				</View>
			</View>

			{/* Actions */}
		</View>
	);

	return (
		<View className={`flex-1 ${themed.bg.background}`}>
			{/* Modern Header with User Info */}
			<View className={`pt-12 px-6 pb-4 rounded-b-2xl ${themed.bg.primary}`}>
				<View className='flex-row justify-between items-center mb-6'>
					<Image
						source={icons.logo}
						className='w-14 h-14 rounded-lg'
						resizeMode='contain'
					/>

					{user && (
						<View className='flex-row items-center'>
							<View
								className={`w-10 h-10 rounded-full ${themed.bg.secondary} items-center justify-center mr-2`}>
								<Text
									className={`text-3xl font-bold ${themed.text['on-button-primary']}`}>
									{user.name ? user.name.charAt(0).toUpperCase() : 'U'}
								</Text>
							</View>
							<Text
								className={`text-xl ${themed.text['on-button-primary']} ${defaultFontClass}`}>
								{user.name || 'User'}
							</Text>
						</View>
					)}
				</View>

				<View className='mb-6'>
					<Text
						className={`text-4xl font-bold ${themed.text['on-button-primary']} ${defaultFontClass}`}>
						Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
					</Text>
					<Text
						className={`text-lg font-bold ${themed.text['on-button-primary']} ${defaultFontClass}`}>
						Manage your documents efficiently
					</Text>
				</View>
			</View>

			{/* Content Area */}
			<View className='flex-1 px-6 pt-4'>
				{/* Quick Action Button */}
				<TouchableOpacity
					onPress={() => navigateToUpload()}
					className={`
            mb-6 p-4 rounded-xl shadow-lg
            ${themed.bg.primary} flex-row items-center justify-between
          `}
					style={{
						shadowColor: colors.primary,
						shadowOffset: { width: 0, height: 4 },
						shadowOpacity: 0.2,
						shadowRadius: 8,
						elevation: 6,
					}}>
					<View className='flex-row items-center'>
						<Image
							source={icons.upload}
							className='w-6 h-6 mr-3'
							tintColor={colors['on-button-primary']}
						/>
						<Text
							className={`text-lg font-bold ${themed.text['on-button-primary']} ${defaultFontClass}`}>
							Submit New Document
						</Text>
					</View>
					<Image
						source={icons.arrowForward}
						className='w-5 h-5'
						tintColor={colors['on-button-primary']}
					/>
				</TouchableOpacity>

				{/* Documents Section */}
				<View className='flex-row justify-between items-center mb-4'>
					<Text
						className={`text-xl font-bold ${themed.text.text} ${defaultFontClass}`}>
						Your Documents
					</Text>
					<Text className={`text-base ${themed.text.text} ${defaultFontClass}`}>
						{documents.length} document{documents.length > 1 ? 's' : ''}
					</Text>
				</View>

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
							<View className='flex-1 items-center justify-center p-4 mt-10'>
								<Image
									source={icons.document}
									className='w-20 h-20 mb-4 opacity-50'
									tintColor={colors.text}
								/>
								<Text
									className={`text-lg text-center ${themed.text.text} ${defaultFontClass} mb-2`}>
									No documents found
								</Text>
								<Text
									className={`text-sm text-center ${themed.text.text} ${defaultFontClass}`}>
									Submit your first document to get started
								</Text>
							</View>
						}
					/>
				)}
			</View>

			{/* Modal Component */}
			<Modal
				visible={modalVisible}
				onClose={() => setModalVisible(false)}
				title={modalConfig.title}
				message={modalConfig.message}
				buttons={modalConfig.buttons}
			/>
		</View>
	);
};

export default HomeScreen;
