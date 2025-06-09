import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import {
	PermissionStatus,
	getPermissionsAsync,
	requestPermissionsAsync,
} from 'expo-media-library';
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
	Alert,
	FlatList,
	Image,
	Linking,
	Platform,
	RefreshControl,
	Share,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import { icons } from '../../constants/icons';
import Pagination from '../components/Pagination';
import { useAuth } from '../context/AuthContext';
import useTheme from '../hooks/useTheme';
import DashboardService from '../services/dashboardService';
import { Project } from '../types/auth';

const Dashboard = () => {
	const { themed, colors } = useTheme(); // Access both 'themed' (for classes) and 'colors' (for direct values)
	const { user, token } = useAuth();
	const [projects, setProjects] = useState<Project[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState('');
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [searchQuery, setSearchQuery] = useState(''); // New: search query state
	const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null); // New: debounce ref

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
			Alert.alert('Success', 'Project accepted successfully');
			await fetchProjects(page);
		} catch (err: any) {
			Alert.alert('Error', err.message || 'Failed to accept project');
		} finally {
			setLoading(false);
		}
	};

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
							setLoading(true);
							await DashboardService.deleteProject(projectId, token);
							Alert.alert('Success', 'Project deleted successfully');
							await fetchProjects(page);
						} catch (err: any) {
							Alert.alert('Error', err.message || 'Failed to delete project');
						} finally {
							setLoading(false);
						}
					},
				},
			],
		);
	};

	const handleDownload = async (fileUrl: string, fileName: string) => {
		try {
			Alert.alert(
				'Download PDF',
				'Choose how to open this document:',
				[
					{
						text: 'Download to Device',
						onPress: async () => {
							try {
								// Check and request permissions for Android
								if (Platform.OS === 'android') {
									const { status } = await getPermissionsAsync();
									if (status !== PermissionStatus.GRANTED) {
										const { status: newStatus } =
											await requestPermissionsAsync();
										if (newStatus !== PermissionStatus.GRANTED) {
											Alert.alert(
												'Permission required',
												'Please grant storage permissions to download files.',
											);
											return;
										}
									}
								}

								// Ensure the filename has a .pdf extension
								const formattedFileName = fileName.endsWith('.pdf')
									? fileName
									: `${fileName}.pdf`;
								const downloadPath = `${FileSystem.documentDirectory}${formattedFileName}`;

								// Show downloading alert
								Alert.alert(
									'Downloading',
									'Please wait while the file is being downloaded...',
								);

								const downloadResumable = FileSystem.createDownloadResumable(
									fileUrl,
									downloadPath,
									{},
									(downloadProgress) => {
										const progress =
											downloadProgress.totalBytesWritten /
											downloadProgress.totalBytesExpectedToWrite;
										console.log(`Download progress: ${progress * 100}%`);
									},
								);

								const downloadResult = await downloadResumable.downloadAsync();

								if (downloadResult && downloadResult.uri) {
									// For Android, we need to explicitly make the file visible in the gallery/media store
									if (Platform.OS === 'android') {
										try {
											await IntentLauncher.startActivityAsync(
												'android.intent.action.MEDIA_SCANNER_SCAN_FILE',
												{
													data: downloadResult.uri,
												},
											);
										} catch (scanError) {
											console.log('Error scanning file:', scanError);
										}
									}

									// Give user options after download
									Alert.alert(
										'Download Complete',
										'File has been saved successfully.',
										[
											{
												text: 'Open File',
												onPress: async () => {
													try {
														if (await Sharing.isAvailableAsync()) {
															await Sharing.shareAsync(downloadResult.uri, {
																mimeType: 'application/pdf',
																dialogTitle: `Open ${formattedFileName}`,
															});
														} else {
															await Linking.openURL(
																`file://${downloadResult.uri}`,
															);
														}
													} catch (openError) {
														console.error('Error opening file:', openError);
														Alert.alert(
															'Error',
															'No application available to open PDF files.',
														);
													}
												},
											},
											{
												text: 'OK',
												style: 'cancel',
											},
										],
									);
								} else {
									throw new Error('Download failed - no URI returned');
								}
							} catch (downloadError) {
								console.error('Download error:', downloadError);
								Alert.alert(
									'Download Failed',
									'Could not download the file. Please check your internet connection and try again.',
								);
							}
						},
					},
					{
						text: 'Open in Browser',
						onPress: async () => {
							try {
								const supported = await Linking.canOpenURL(fileUrl);
								if (supported) {
									await Linking.openURL(fileUrl);
								} else {
									Alert.alert(
										'Error',
										'Unable to open this file. Please check if you have a web browser installed.',
									);
								}
							} catch (browserError) {
								console.error('Browser open error:', browserError);
								Alert.alert('Error', 'Failed to open the file in browser');
							}
						},
					},
					{
						text: 'Share',
						onPress: async () => {
							try {
								await Share.share({
									url: fileUrl,
									title: fileName,
									message: `Check out this document: ${fileName}`,
								});
							} catch (shareError) {
								console.error('Share error:', shareError);
								Alert.alert('Error', 'Failed to share the file');
							}
						},
					},
					{
						text: 'Cancel',
						style: 'cancel',
					},
				],
				{ cancelable: true },
			);
		} catch (error) {
			console.error('Unexpected error:', error);
			Alert.alert(
				'Error',
				'An unexpected error occurred while processing the file',
			);
		}
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
		</View>
	);
};

export default Dashboard;
