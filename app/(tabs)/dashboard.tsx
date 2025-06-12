import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing'; // <-- NEW: Import expo-sharing
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

// Utility function to extract file extension from URL (kept for reference, but the one inside component is used)
// const getFileExtension = (url: string): string => {
// 	try {
// 		const urlObj = new URL(url);
// 		const pathname = urlObj.pathname;
// 		const lastDotIndex = pathname.lastIndexOf('.');
// 		if (lastDotIndex !== -1 && lastDotIndex < pathname.length - 1) {
// 			return pathname.slice(lastDotIndex).toLowerCase(); // e.g., .pdf, .docx
// 		}
// 		return '.bin'; // Fallback for unknown types
// 	} catch (error) {
// 		console.warn('Invalid URL, using default extension:', error);
// 		return '.bin';
// 	}
// };

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
	const [warning, setWarning] = useState(true);

	// const [downloadedFiles, setDownloadedFiles] = useState<string[]>([]); // This state is not used in the provided logic
	// const [showFilesModal, setShowFilesModal] = useState(false); // This state is not used in the provided logic

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

	// NEW: State to hold the path of the last downloaded file for "View File" option
	const [downloadedFilePath, setDownloadedFilePath] = useState<string | null>(
		null,
	);

	// Add this near the top of the component with other state declarations
	const [downloadingItems, setDownloadingItems] = useState<{
		[key: string]: boolean;
	}>({});

	const fetchProjects = async (pageNum = page) => {
		if (!user?._id || !token) {
			setError('Authentication required');
			setLoading(false);
			return;
		}

		setLoading(true);
		try {
			const response = await DashboardService.getProject(
				user._id,
				pageNum,
				10,
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
	}, [user, token]);

	const onRefresh = () => {
		setRefreshing(true);
		setSearchQuery('');
		setPage(1);
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
		}, 500);
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

	// Updated getFileExtension to include more common types
	const getFileExtension = (url: string): string => {
		try {
			const urlObj = new URL(url);
			const pathname = urlObj.pathname;
			const lastDotIndex = pathname.lastIndexOf('.');

			if (lastDotIndex !== -1 && lastDotIndex < pathname.length - 1) {
				const extension = pathname.slice(lastDotIndex).toLowerCase();
				// Expanded list of common file extensions
				const validExtensions = [
					'.pdf',
					'.doc',
					'.docx',
					'.txt',
					'.png',
					'.jpg',
					'.jpeg',
					'.xls',
					'.xlsx',
					'.ppt',
					'.pptx',
					'.zip',
					'.rar',
					'.csv',
					'.odt',
					'.rtf',
					'.mov',
					'.mp4',
					'.mp3',
					'.avi',
					'.wav',
					'.gif',
					'.bmp',
					'.tiff',
				];
				if (validExtensions.includes(extension)) {
					return extension;
				}
			}
			// Fallback: assume PDF or generic binary
			return '.pdf'; // Most common case for your app, or .bin if you want true generic
		} catch (error) {
			console.warn('Invalid URL, using default extension:', error);
			return '.pdf';
		}
	};

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
			await downloadToDevice(fileUrl, fileName);
		} catch (error) {
			console.error('Unexpected error in handleDownload:', error);
			showErrorModal(
				'An unexpected error occurred while downloading the file.',
			);
		}
	};

	const downloadToDevice = async (fileUrl: string, fileName: string) => {
		try {
			const hasPermission = await requestPermissions();
			if (!hasPermission) return;

			// Mark this file as downloading
			setDownloadingItems((prev) => ({ ...prev, [fileName]: true }));

			const sanitizedFileName = fileName
				.replace(/[^a-zA-Z0-9._-]/g, '_')
				.toLowerCase();
			const fileExtension = getFileExtension(fileUrl);
			const finalFileName = sanitizedFileName.endsWith(fileExtension)
				? sanitizedFileName
				: `${sanitizedFileName}${fileExtension}`;

			// For non-media files (like PDFs), use the documents directory
			const isMediaFile = /\.(jpg|jpeg|png|gif|mp4|mov)$/i.test(fileExtension);
			const baseDir =
				Platform.OS === 'android'
					? `${FileSystem.documentDirectory}Download/`
					: FileSystem.documentDirectory;

			if (!baseDir) throw new Error('Could not determine download directory');

			const downloadPath = `${baseDir}${finalFileName}`;
			console.log('Starting download to:', downloadPath);

			// Ensure download directory exists
			if (Platform.OS === 'android') {
				const dirInfo = await FileSystem.getInfoAsync(baseDir);
				if (!dirInfo.exists) {
					await FileSystem.makeDirectoryAsync(baseDir, { intermediates: true });
				}
			}

			// Download the file
			const downloadResumable = FileSystem.createDownloadResumable(
				fileUrl,
				downloadPath,
				{
					headers: {
						'Content-Type': getContentType(fileExtension),
					},
				},
				(downloadProgress) => {
					if (downloadProgress.totalBytesExpectedToWrite > 0) {
						const progress =
							(downloadProgress.totalBytesWritten /
								downloadProgress.totalBytesExpectedToWrite) *
							100;
						if (progress >= 0 && progress <= 100) {
							console.log(`Download progress: ${progress.toFixed(2)}%`);
						}
					}
				},
			);

			const result = await downloadResumable.downloadAsync();
			if (!result?.uri) throw new Error('Download failed - no URI returned');

			console.log('Download completed to:', result.uri);

			if (Platform.OS === 'android' && isMediaFile) {
				try {
					const asset = await MediaLibrary.createAssetAsync(result.uri);
					console.log('File saved to MediaLibrary:', asset);
				} catch (mediaError) {
					console.warn('MediaLibrary save failed:', mediaError);
				}
			}

			setDownloadedFilePath(result.uri);
			showSuccessModal();
		} catch (error) {
			console.error('Download error:', error);
			showErrorModal('Failed to download the file. Please try again.');
		} finally {
			// Clear downloading state for this file
			setDownloadingItems((prev) => {
				const newState = { ...prev };
				delete newState[fileName];
				return newState;
			});
		}
	};

	// Helper function to determine content type
	const getContentType = (extension: string): string => {
		const mimeTypes: { [key: string]: string } = {
			'.pdf': 'application/pdf',
			'.doc': 'application/msword',
			'.docx':
				'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
			'.txt': 'text/plain',
			'.png': 'image/png',
			'.jpg': 'image/jpeg',
			'.jpeg': 'image/jpeg',
			'.xls': 'application/vnd.ms-excel',
			'.xlsx':
				'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'.ppt': 'application/vnd.ms-powerpoint',
			'.pptx':
				'application/vnd.openxmlformats-officedocument.presentationml.presentation',
		};
		return mimeTypes[extension] || 'application/octet-stream';
	};

	const requestPermissions = async (): Promise<boolean> => {
		try {
			if (Platform.OS === 'android') {
				// Request media library permissions which on Android covers storage access needed for MediaLibrary.createAssetAsync
				const mediaLibraryPermission =
					await MediaLibrary.requestPermissionsAsync();

				console.log(
					'MediaLibrary permission status:',
					mediaLibraryPermission.status,
				);

				if (mediaLibraryPermission.status !== 'granted') {
					showErrorModal(
						'Storage permission is required to save files. Please enable storage access in your device settings.',
					);
					return false;
				}
			}
			// For iOS, files downloaded to documentDirectory are generally accessible by the app
			return true;
		} catch (error) {
			console.error('Permission request error:', error);
			showErrorModal('Failed to request storage permissions.');
			return false;
		}
	};

	// NEW: Function to handle viewing the downloaded file
	const handleViewDownloadedFile = async () => {
		if (!downloadedFilePath) return;

		try {
			// Get file extension to determine handling
			const extension =
				downloadedFilePath.split('.').pop()?.toLowerCase() || '';
			const mimeType = getContentType(`.${extension}`);

			if (Platform.OS === 'android') {
				// For Android, we need to get a content URI that other apps can access
				const contentUri =
					await FileSystem.getContentUriAsync(downloadedFilePath);
				console.log('Content URI:', contentUri);

				// Try to open with a viewer app
				const canOpen = await Linking.canOpenURL(contentUri);
				if (canOpen) {
					await Linking.openURL(contentUri);
				} else {
					// If no app can directly open it, try sharing
					if (await Sharing.isAvailableAsync()) {
						await Sharing.shareAsync(downloadedFilePath, {
							mimeType,
							dialogTitle: 'Open with...',
						});
					} else {
						throw new Error('No application can view this file type');
					}
				}
			} else {
				// For iOS, use the sharing sheet which handles both viewing and saving
				if (await Sharing.isAvailableAsync()) {
					await Sharing.shareAsync(downloadedFilePath, {
						mimeType,
						UTI: getUTIForMimeType(mimeType),
						dialogTitle: 'Open with...',
					});
				} else {
					throw new Error('Sharing is not available');
				}
			}
		} catch (error) {
			console.error('Error opening file:', error);
			showErrorModal(
				'Could not open the file. Please ensure you have an app installed that can view this type of file.',
			);
		}
	};

	// Helper function for iOS UTI types
	const getUTIForMimeType = (mimeType: string): string => {
		const utiMap: { [key: string]: string } = {
			'application/pdf': 'com.adobe.pdf',
			'application/msword': 'com.microsoft.word.doc',
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
				'org.openxmlformats.wordprocessingml.document',
			'text/plain': 'public.plain-text',
			'image/png': 'public.png',
			'image/jpeg': 'public.jpeg',
			'application/vnd.ms-excel': 'com.microsoft.excel.xls',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
				'org.openxmlformats.spreadsheetml.sheet',
		};
		return utiMap[mimeType] || 'public.item';
	};

	const handleSaveToPhone = async () => {
		if (downloadedFilePath) {
			try {
				if (Platform.OS === 'android') {
					// For Android: Save to Downloads folder using MediaLibrary
					const asset = await MediaLibrary.createAssetAsync(downloadedFilePath);
					const album = await MediaLibrary.getAlbumAsync('Download');
					if (album) {
						await MediaLibrary.addAssetsToAlbumAsync([asset], album.id, false);
					}

					setModalConfig({
						title: 'Success',
						message: 'File has been saved to your Downloads folder',
						buttons: [
							{
								text: 'OK',
								onPress: () => {
									setModalVisible(false);
									setDownloadedFilePath(null);
								},
								variant: 'primary' as ButtonVariant,
							},
						],
					});
					setModalVisible(true);
				} else {
					// For iOS: Use share sheet to save
					await Sharing.shareAsync(downloadedFilePath, {
						dialogTitle: 'Save File',
						mimeType: 'application/octet-stream',
						UTI: 'public.item',
					});
					setModalVisible(false);
					setDownloadedFilePath(null);
				}
			} catch (error) {
				console.error('Error saving file:', error);
				showErrorModal(
					'Could not save the file to your phone. Please try again.',
				);
			}
		}
	};

	const showSuccessModal = () => {
		setModalConfig({
			title: 'File Downloaded',
			message: 'What would you like to do with this file?',
			buttons: [
				{
					text: 'View Now',
					onPress: handleViewDownloadedFile,
					variant: 'primary' as ButtonVariant,
				},
				{
					text: 'Save to Phone',
					onPress: handleSaveToPhone,
					variant: 'secondary' as ButtonVariant,
				},
				{
					text: 'Cancel',
					onPress: () => {
						setModalVisible(false);
						setDownloadedFilePath(null);
					},
					variant: 'danger' as ButtonVariant,
				},
			],
		});
		setModalVisible(true);
	};

	const showErrorModal = (message: string) => {
		setModalConfig({
			title: 'Error',
			message,
			buttons: [
				{
					text: 'OK',
					onPress: () => {
						setModalVisible(false);
						setDownloadedFilePath(null); // Clear path even on error
					},
					variant: 'primary' as ButtonVariant,
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
            ${themed.bg['button-primary']}
          `}>
					<Text
						className={`
              text-lg font-semibold text-center
              ${themed.text['on-button-primary']}
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
		return (
			<View
				className={`flex-1 justify-center items-center ${themed.bg.background}`}>
				<ActivityIndicator
					size='large'
					color={colors.primary}
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
					placeholderTextColor={colors['input-placeholder']}
					value={searchQuery}
					onChangeText={handleSearchChange}
					autoCapitalize='none'
				/>
			</View>
			{warning && (
				<TouchableOpacity
					onPress={() => setWarning(!warning)}
					className='mb-6 p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 shadow-sm'>
					<View className='flex-row items-center'>
						<View className='w-2 h-2 bg-yellow-500 rounded-full mr-3' />
						<Text className='text-white font-medium flex-1'>
							Not all functionalities are availabe on the app
						</Text>
					</View>
				</TouchableOpacity>
			)}

			<FlatList
				data={filteredProjects}
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
											disabled={downloadingItems[item.title]}
											className={`px-4 py-2 rounded-lg flex-row items-center space-x-2 ${
												downloadingItems[item.title] ? 'opacity-50' : ''
											} ${themed.bg['button-download']}`}>
											{downloadingItems[item.title] ? (
												<ActivityIndicator
													size='small'
													color={colors['on-button-download']}
												/>
											) : (
												<Image
													source={icons.download}
													className='w-5 h-5'
													tintColor={colors['on-button-download']}
												/>
											)}
											<Text
												className={`${themed.text['on-button-download']} font-medium ${defaultFontClass}`}
												numberOfLines={1}
												ellipsizeMode='tail'>
												{downloadingItems[item.title]
													? 'Downloading...'
													: 'Download'}
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
						colors={[colors.primary]}
						tintColor={colors.primary}
					/>
				}
				ListEmptyComponent={
					<View className='p-4'>
						{loading ? null : (
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
				onClose={() => setModalVisible(false)} // Allow closing with backdrop click
				title={modalConfig.title}
				message={modalConfig.message}
				buttons={modalConfig.buttons}
			/>
		</View>
	);
};

export default Dashboard;
