import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {
	ActivityIndicator,
	FlatList,
	Image,
	Linking,
	Platform,
	RefreshControl,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import { icons } from '../../constants/icons';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import { useAuth } from '../context/AuthContext';
import useTheme from '../hooks/useTheme';
import DashboardService from '../services/dashboardService';
import { Project } from '../types/auth';

const Dashboard = () => {
	const { themed, colors } = useTheme();
	const { user, token } = useAuth();
	const [projects, setProjects] = useState<Project[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState('');
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [searchQuery, setSearchQuery] = useState('');
	const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	type ButtonVariant = 'primary' | 'secondary' | 'danger';

	// Add modal state
	const [modalVisible, setModalVisible] = useState(false);
	const [modalConfig, setModalConfig] = useState<{
		title: string;
		message: string;
		buttons: Array<{
			text: string;
			onPress: () => void;
			variant?: ButtonVariant;
		}>;
	}>({
		title: '',
		message: '',
		buttons: [{ text: 'OK', onPress: () => {}, variant: 'primary' }],
	});

	const fetchProjects = async (pageNum = page) => {
		if (!user?._id || !token) {
			setError('Authentication required');
			setLoading(false);
			return;
		}

		setLoading(true); // Set loading true at the start of fetch
		try {
			const response = await DashboardService.getProject(
				user._id,
				pageNum,
				10, // Assuming 10 items per page
				token,
			);
			setProjects(response.projects);
			setTotalPages(response.pagination.totalPages);
			setError('');
		} catch (err: any) {
			setError(err.message || 'Failed to fetch projects');
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	useEffect(() => {
		fetchProjects();
	}, [user, token]); // Removed 'page' from dependencies, as page change is handled by handlePageChange

	const onRefresh = () => {
		setRefreshing(true);
		setSearchQuery(''); // Clear search on refresh
		setPage(1); // Reset to first page
		fetchProjects(1);
	};

	const handlePageChange = (newPage: number) => {
		setPage(newPage);
		fetchProjects(newPage);
	};

	const handleSearchChange = useCallback((text: string) => {
		setSearchQuery(text);
		if (searchDebounceRef.current) {
			clearTimeout(searchDebounceRef.current);
		}

		searchDebounceRef.current = setTimeout(() => {
			setSearchQuery(text);
		}, 500); // 500ms delay
	}, []);

	// Filter projects based on search query
	const filteredProjects = useMemo(() => {
		if (!searchQuery) {
			return projects;
		}
		const lowerCaseQuery = searchQuery.toLowerCase();
		return projects.filter(
			(project) =>
				project.title.toLowerCase().includes(lowerCaseQuery) ||
				project.studentName.toLowerCase().includes(lowerCaseQuery),
		);
	}, [projects, searchQuery]);

	const handleAcceptProject = async (projectId: string) => {
		if (!token) return;

		try {
			setLoading(true);
			await DashboardService.acceptProject(projectId, token);
			setModalConfig({
				title: 'Success',
				message: 'Project accepted successfully',
				buttons: [
					{
						text: 'OK',
						onPress: () => setModalVisible(false),
						variant: 'primary',
					},
				],
			});
			setModalVisible(true);
			await fetchProjects(page);
		} catch (err: any) {
			setModalConfig({
				title: 'Error',
				message: err.message || 'Failed to accept project',
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
			setLoading(false);
		}
	};

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
							setLoading(true);
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
							await fetchProjects(page);
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
							setLoading(false);
						}
					},
					variant: 'danger',
				},
			],
		});
		setModalVisible(true);
	};

	const handleDownload = async (fileUrl: string, fileName: string) => {
		try {
			setModalConfig({
				title: 'Download PDF',
				message: 'Choose how to open this document:',
				buttons: [
					// {
					// 	text: 'Download to Device',
					// 	onPress: async () => {
					// 		setModalVisible(false);
					// 		await downloadToDevice(fileUrl, fileName);
					// 	},
					// 	variant: 'primary',
					// },
					{
						text: 'Open in Browser',
						onPress: async () => {
							setModalVisible(false);
							await openInBrowser(fileUrl);
						},
						variant: 'secondary',
					},
					{
						text: 'Cancel',
						onPress: () => setModalVisible(false),
						variant: 'secondary',
					},
				],
			});
			setModalVisible(true);
		} catch (error) {
			console.error('Unexpected error:', error);
			showErrorModal('An unexpected error occurred while processing the file');
		}
	};

	const downloadToDevice = async (fileUrl: string, fileName: string) => {
		try {
			// Request permissions first
			const hasPermission = await requestPermissions();
			if (!hasPermission) {
				return;
			}

			// Show downloading modal
			showDownloadingModal();

			// Ensure filename has .pdf extension
			const formattedFileName = fileName.endsWith('.pdf')
				? fileName
				: `${fileName}.pdf`;

			let downloadPath: string;
			let finalPath: string;

			if (Platform.OS === 'android') {
				// For Android, download to cache first, then move to Downloads
				downloadPath = `${FileSystem.cacheDirectory}${formattedFileName}`;
			} else {
				// For iOS, use document directory
				downloadPath = `${FileSystem.documentDirectory}${formattedFileName}`;
			}

			// Download the file
			const downloadResumable = FileSystem.createDownloadResumable(
				fileUrl,
				downloadPath,
				{},
				(downloadProgress) => {
					const progress =
						downloadProgress.totalBytesWritten /
						downloadProgress.totalBytesExpectedToWrite;
					console.log(`Download progress: ${(progress * 100).toFixed(2)}%`);
				},
			);

			const downloadResult = await downloadResumable.downloadAsync();

			if (!downloadResult?.uri) {
				throw new Error('Download failed - no URI returned');
			}

			if (Platform.OS === 'android') {
				// Move file to Downloads folder using MediaLibrary
				const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
				const album = await MediaLibrary.getAlbumAsync('Downloads');

				if (album) {
					await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
				} else {
					// Create Downloads album if it doesn't exist
					await MediaLibrary.createAlbumAsync('Downloads', asset, false);
				}

				finalPath = asset.uri;

				// Clean up temporary file
				try {
					await FileSystem.deleteAsync(downloadResult.uri);
				} catch (cleanupError) {
					console.log('Cleanup error:', cleanupError);
				}
			} else {
				finalPath = downloadResult.uri;
			}

			// Show success modal with options
			showSuccessModal(finalPath, formattedFileName);
		} catch (error) {
			console.error('Download error:', error);
			showErrorModal(
				'Could not download the file. Please check your internet connection and try again.',
			);
		}
	};

	const requestPermissions = async (): Promise<boolean> => {
		try {
			if (Platform.OS === 'android') {
				// Request media library permissions for Android
				const { status } = await MediaLibrary.requestPermissionsAsync();

				if (status !== 'granted') {
					setModalConfig({
						title: 'Permission Required',
						message:
							'Please grant media library permissions to save files to Downloads folder.',
						buttons: [
							{
								text: 'OK',
								onPress: () => setModalVisible(false),
								variant: 'primary',
							},
						],
					});
					setModalVisible(true);
					return false;
				}
			}
			return true;
		} catch (error) {
			console.error('Permission request error:', error);
			showErrorModal('Failed to request permissions');
			return false;
		}
	};

	const openInBrowser = async (fileUrl: string) => {
		try {
			const supported = await Linking.canOpenURL(fileUrl);
			if (supported) {
				await Linking.openURL(fileUrl);
			} else {
				showErrorModal(
					'Unable to open this file. Please check if you have a web browser installed.',
				);
			}
		} catch (error) {
			console.error('Browser open error:', error);
			showErrorModal('Failed to open the file in browser');
		}
	};

	const showDownloadingModal = () => {
		setModalConfig({
			title: 'Downloading',
			message: 'Please wait while the file is being downloaded...',
			buttons: [
				{
					text: 'OK',
					onPress: () => setModalVisible(false),
					variant: 'primary',
				},
			],
		});
		setModalVisible(true);
	};

	const showSuccessModal = (filePath: string, fileName: string) => {
		const message =
			Platform.OS === 'android'
				? 'File has been saved to Downloads folder successfully.'
				: 'File has been saved successfully.';

		setModalConfig({
			title: 'Download Complete',
			message,
			buttons: [
				{
					text: 'Open File',
					onPress: async () => {
						setModalVisible(false);
						await openFile(filePath, fileName);
					},
					variant: 'primary',
				},
				{
					text: 'Close',
					onPress: () => setModalVisible(false),
					variant: 'secondary',
				},
			],
		});
		setModalVisible(true);
	};

	const openFile = async (filePath: string, fileName: string) => {
		try {
			if (await Sharing.isAvailableAsync()) {
				await Sharing.shareAsync(filePath, {
					mimeType: 'application/pdf',
					dialogTitle: `Open ${fileName}`,
				});
			} else {
				await Linking.openURL(`file://${filePath}`);
			}
		} catch (error) {
			console.error('Error opening file:', error);
			showErrorModal('No application available to open PDF files.');
		}
	};

	const showErrorModal = (message: string) => {
		setModalConfig({
			title: 'Error',
			message,
			buttons: [
				{
					text: 'OK',
					onPress: () => setModalVisible(false),
					variant: 'primary',
				},
			],
		});
		setModalVisible(true);
	};

	// Define a default font class to apply to all text components
	const defaultFontClass = 'font-inter';

	if (!user?.isAdmin && !user?.superAdmin) {
		return (
			<View
				className={`flex-1 justify-center items-center p-6 ${themed.bg.background}`}>
				<Image
					source={icons.lock}
					className='w-24 h-24 mb-6'
					tintColor={colors.accent}
				/>
				<Text
					className={`text-2xl font-extrabold text-center mb-3 ${themed.text.text} ${defaultFontClass}`}>
					Access Denied
				</Text>
				<Text
					className={`text-base text-center mb-6 ${themed.text['card-detail']} ${defaultFontClass}`}>
					You do not have the necessary permissions to view this dashboard. This
					area is restricted to authorized providers.
				</Text>

				<TouchableOpacity
					onPress={() => Linking.openURL('https://uploaddoc.vercel.app')}
					className={`
						py-3 px-6 rounded-lg shadow-md
						${themed.bg['button-primary']} // Using the existing primary button styles
					`}>
					<Text
						className={`
							text-lg font-semibold text-center
							${themed.text['on-button-primary']} // Text color for primary button
							${defaultFontClass}
						`}>
						Become a Provider
					</Text>
				</TouchableOpacity>

				<Text
					className={`text-sm text-center mt-4 ${themed.text['card-detail']} ${defaultFontClass}`}>
					If you believe this is an error, please contact support.
				</Text>
			</View>
		);
	}

	if (loading && projects.length === 0) {
		// Show full-screen loader only on initial load or if no data is present
		return (
			<View
				className={`flex-1 justify-center items-center ${themed.bg.background}`}>
				<ActivityIndicator
					size='large'
					color={colors.primary} // Use direct color value
				/>
			</View>
		);
	}

	if (error) {
		return (
			<View
				className={`flex-1 justify-center items-center p-4 ${themed.bg.background}`}>
				<Text
					className={`text-lg font-medium text-red-500 text-center ${defaultFontClass}`}>
					{error}
				</Text>
			</View>
		);
	}

	return (
		<View className={`flex-1 ${themed.bg.background}`}>
			{/* Dashboard Title */}
			<View className='p-4 pt-12'>
				<Text
					className={`text-5xl my-5 font-bold ${themed.text.text} text-center ${defaultFontClass}`}>
					Dashboard
				</Text>
			</View>

			{/* Search Input */}
			<View className='px-4 pb-4 mb-3'>
				<TextInput
					className={`
						h-12 px-4 rounded-lg border-2
						${themed.bg.input}
						${themed.border.input}
						${themed.text.input}
						${defaultFontClass}
					`}
					placeholder='Search by title or student name...'
					placeholderTextColor={colors['input-placeholder']} // Use direct color value for placeholder
					value={searchQuery}
					onChangeText={handleSearchChange}
					autoCapitalize='none'
				/>
			</View>

			<FlatList
				data={filteredProjects} // Use filtered projects here
				keyExtractor={(item) => item._id}
				renderItem={({ item }) => (
					<View
						className={`p-4 mx-4 mb-4 rounded-lg shadow-md ${themed.bg.card}`}>
						<Text
							className={`text-2xl font-bold mb-4 ${themed.text.text} ${defaultFontClass}`}
							numberOfLines={1}
							ellipsizeMode='tail'>
							{item.title}
						</Text>

						{/* Student Info */}
						<View className='flex-row justify-between items-center mb-2'>
							<Text
								className={`${themed.text.text} ${defaultFontClass} text-lg font-medium`}
								numberOfLines={1}
								ellipsizeMode='tail'>
								Student: {item.studentName}
							</Text>
							<Text
								className={`${themed.text.text} ${defaultFontClass} text-lg font-medium`}
								numberOfLines={1}
								ellipsizeMode='tail'>
								Matric: {item.matricNumber}
							</Text>
						</View>

						{/* Pages and Price */}
						<View className='flex-row justify-between items-center mb-2'>
							<Text
								className={`${themed.text.text} ${defaultFontClass}`}
								numberOfLines={1}
								ellipsizeMode='tail'>
								Pages: {item.pageCount}
							</Text>
							<Text
								className={`${themed.text.text} font-semibold text-lg ${defaultFontClass}`}
								numberOfLines={1}
								ellipsizeMode='tail'>
								₦{item.price}
							</Text>
						</View>

						{/* Status and Discount */}
						<View className='flex-row justify-between items-center mb-2 flex-wrap'>
							<View className='flex-row items-center min-w-0'>
								<Text
									className={`${themed.text.text} mr-2 ${defaultFontClass}`}
									numberOfLines={1}
									ellipsizeMode='tail'>
									Status:
								</Text>
								<View
									className={`px-2 py-1 rounded-full ${
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

							{item.discountPercentage > 0 && (
								<Text
									className={`${themed.text.text} ${defaultFontClass}`}
									numberOfLines={1}
									ellipsizeMode='tail'>
									Discount: {item.discountPercentage}%
								</Text>
							)}
						</View>

						{/* Action Buttons */}
						<View className='flex-row justify-end mt-2 flex-wrap'>
							{item.status === 'pending' ? (
								<>
									<TouchableOpacity
										onPress={() => handleAcceptProject(item._id)}
										className={`px-4 py-2 rounded-lg ${themed.bg['button-accept']}`}>
										<Text
											className={`${themed.text['on-button-accept']} font-medium ${defaultFontClass}`}
											numberOfLines={1}
											ellipsizeMode='tail'>
											Accept
										</Text>
									</TouchableOpacity>
									<TouchableOpacity
										onPress={() => handleDeleteProject(item._id)}
										className={`px-4 py-2 rounded-lg ml-3 ${themed.bg['button-delete']}`}>
										<Text
											className={`${themed.text['on-button-delete']} font-medium ${defaultFontClass}`}
											numberOfLines={1}
											ellipsizeMode='tail'>
											Delete
										</Text>
									</TouchableOpacity>
								</>
							) : (
								item.status === 'accepted' &&
								item.fileUrl && (
									<View className='flex-row items-center flex-wrap gap-4 space-x-2'>
										<Text
											className={`${themed.text['on-button-primary']} text-sm ${defaultFontClass}`}
											numberOfLines={1}
											ellipsizeMode='tail'>
											{item.pageCount} pages
										</Text>
										<TouchableOpacity
											onPress={() => handleDeleteProject(item._id)}
											className={`px-4 py-2 rounded-lg ml-3 ${themed.bg['button-delete']}`}>
											<Text
												className={`${themed.text['on-button-delete']} font-medium ${defaultFontClass}`}
												numberOfLines={1}
												ellipsizeMode='tail'>
												Delete
											</Text>
										</TouchableOpacity>
										<TouchableOpacity
											onPress={() => handleDownload(item.fileUrl, item.title)}
											className={`px-4 py-2 rounded-lg flex-row items-center space-x-2 ${themed.bg['button-download']}`}>
											<Image
												source={icons.download}
												className='w-5 h-5'
												tintColor={colors['on-button-download']}
											/>
											<Text
												className={`${themed.text['on-button-download']} font-medium ${defaultFontClass}`}
												numberOfLines={1}
												ellipsizeMode='tail'>
												Download
											</Text>
										</TouchableOpacity>
									</View>
								)
							)}
						</View>
					</View>
				)}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						colors={[colors.primary]} // Use direct color value
						tintColor={colors.primary} // Use direct color value
					/>
				}
				ListEmptyComponent={
					<View className='p-4'>
						{loading ? null : ( // Don't show "No projects" if still loading on refresh
							<Text
								className={`text-center ${themed.text.primary} ${defaultFontClass}`}>
								{searchQuery
									? 'No matching projects found.'
									: 'No projects found.'}
							</Text>
						)}
					</View>
				}
			/>
			{/* Only show pagination if there's no active search and total pages > 1 */}
			{totalPages > 1 && !searchQuery && (
				<Pagination
					currentPage={page}
					totalPages={totalPages}
					onPageChange={handlePageChange}
				/>
			)}

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

export default Dashboard;
