import * as DocumentPicker from 'expo-document-picker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Image,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import { icons } from '../../constants/icons';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import useTheme from '../hooks/useTheme';
import { AdminService } from '../services/adminService';
import { DocumentService } from '../services/documentService';
import { Admin } from '../types/auth';

export default function UploadDocumentScreen() {
	const { themed, colors } = useTheme();
	const { user, token } = useAuth();
	const params = useLocalSearchParams();
	const selectedAdminId = params.selectedAdmin as string;
	const [adminResults, setAdminResults] = useState<Admin[]>([]);
	const [title, setTitle] = useState('');
	const [document, setDocument] =
		useState<DocumentPicker.DocumentPickerResult | null>(null);
	const [adminSearch, setAdminSearch] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);

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

	useEffect(() => {
		if (selectedAdminId && token) {
			setIsLoading(true);

			AdminService.getAdmins(1, 1, selectedAdminId)
				.then((response) => {
					if (response.admins && response.admins.length > 0) {
						setSelectedAdmin(response.admins[0]);
					} else {
						setModalConfig({
							title: 'Error',
							message: 'Provider not found.',
							buttons: [
								{
									text: 'OK',
									onPress: () => setModalVisible(false),
									variant: 'danger',
								},
							],
						});
						setModalVisible(true);
					}
				})
				.catch((error) => {
					setModalConfig({
						title: 'Error',
						message: 'Failed to load pre-selected provider.',
						buttons: [
							{
								text: 'OK',
								onPress: () => setModalVisible(false),
								variant: 'danger',
							},
						],
					});
					setModalVisible(true);
				})
				.finally(() => {
					setIsLoading(false);
				});
		}
	}, [selectedAdminId, token]);

	const pickDocument = async () => {
		try {
			const result = await DocumentPicker.getDocumentAsync({
				type: [
					'application/pdf',
					'image/*',
					'application/msword',
					'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
				],
				multiple: false,
			});

			if (result.canceled) {
				setDocument(null);
			} else if (result.assets && result.assets.length > 0) {
				setDocument(result);
			}
		} catch (error) {
			console.error('Error picking document:', error);
			setModalConfig({
				title: 'Error',
				message: 'Failed to pick document. Please try again.',
				buttons: [
					{
						text: 'OK',
						onPress: () => setModalVisible(false),
						variant: 'danger',
					},
				],
			});
			setModalVisible(true);
		}
	};

	const uploadDocument = async () => {
		if (!document || !title.trim() || !selectedAdmin || !user || !token) {
			setModalConfig({
				title: 'Missing Info',
				message:
					'Please fill in all fields and select a document/provider to upload.',
				buttons: [
					{
						text: 'OK',
						onPress: () => setModalVisible(false),
						variant: 'danger',
					},
				],
			});
			setModalVisible(true);
			return;
		}

		setIsLoading(true);

		try {
			const formData = new FormData();
			formData.append('title', title);
			formData.append('assignedAdmin', selectedAdmin._id);
			formData.append('studentId', user._id);
			formData.append('studentName', user.name);
			formData.append('matricNumber', user.matricNumber || '');

			if (document.assets && document.assets[0]) {
				const asset = document.assets[0];
				formData.append('file', {
					uri: asset.uri,
					type: asset.mimeType,
					name: asset.name,
				} as any);
			}

			await DocumentService.uploadDocument(formData, token);

			setModalConfig({
				title: 'Success',
				message: 'Document uploaded successfully',
				buttons: [
					{
						text: 'OK',
						onPress: () => {
							setModalVisible(false);
							router.back();
						},
						variant: 'primary',
					},
				],
			});
			setModalVisible(true);
		} catch (error: any) {
			console.error(
				'Upload error:',
				error.response?.data || error.message || error,
			);
			setModalConfig({
				title: 'Upload Failed',
				message:
					error.response?.data?.message ||
					error.message ||
					'Failed to upload document. Please try again.',
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
	};

	const searchAdmins = useCallback(
		async (query: string) => {
			if (!token) return;
			if (query.trim() === '') {
				setModalConfig({
					title: 'Search Empty',
					message: 'Please enter a provider name or ID to search.',
					buttons: [
						{
							text: 'OK',
							onPress: () => setModalVisible(false),
							variant: 'danger',
						},
					],
				});
				setModalVisible(true);
				return;
			}
			setIsLoading(true);
			try {
				const response = await AdminService.getAdmins(1, 5, query);
				if (response.admins.length === 0) {
					setModalConfig({
						title: 'No Providers Found',
						message: 'No providers matched your search. Try a different term.',
						buttons: [
							{
								text: 'OK',
								onPress: () => setModalVisible(false),
								variant: 'danger',
							},
						],
					});
					setModalVisible(true);
				} else {
					setAdminResults(response.admins);
				}
			} catch (error: any) {
				console.error('Error searching admins:', error);
				setModalConfig({
					title: 'Search Error',
					message: error.message || 'Failed to search for providers.',
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
		[token],
	);

	const handleRemoveAdmin = () => {
		setModalConfig({
			title: 'Remove Provider',
			message: 'Are you sure you want to remove this provider?',
			buttons: [
				{
					text: 'Cancel',
					onPress: () => setModalVisible(false),
					variant: 'secondary',
				},
				{
					text: 'Remove',
					onPress: () => {
						setSelectedAdmin(null);
						setModalVisible(false);
					},
					variant: 'danger',
				},
			],
		});
		setModalVisible(true);
	};

	return (
		<ScrollView
			className={`flex-1 ${themed.bg.background}`}
			contentContainerStyle={{ paddingBottom: 40 }}>
			<View className='p-6 pt-14'>
				<TouchableOpacity
					onPress={() => router.back()}
					className='flex-row items-center mb-8'>
					<Image
						source={icons.arrowBack}
						className='w-7 h-7 mr-3'
						tintColor={colors.primary}
					/>
					<Text
						className={`text-xl font-semibold ${themed.text.primary} ${defaultFontClass}`}>
						Back
					</Text>
				</TouchableOpacity>

				<Text
					className={`text-4xl font-extrabold mb-8 ${themed.text.text} ${defaultFontClass}`}>
					Upload Document
				</Text>

				<View className='space-y-8 mb-8'>
					<View>
						<Text
							className={`text-lg font-semibold mb-2 ${themed.text.text} ${defaultFontClass}`}>
							Document Title
						</Text>
						<TextInput
							value={title}
							onChangeText={setTitle}
							placeholder='Enter document title (e.g., Final Year Project)'
							className={`border-2 rounded-xl p-5 ${themed.border.input} ${themed.bg.input} ${themed.text.input} ${defaultFontClass}`}
							placeholderTextColor={colors['input-placeholder']}
						/>
					</View>

					<View>
						<Text
							className={`text-lg font-semibold mb-2 mt-5 ${themed.text.text} ${defaultFontClass}`}>
							{selectedAdmin ? 'Selected Provider' : 'Provider'}
						</Text>

						{selectedAdmin && (
							<View className='mb-3'>
								<View
									className={`p-5 rounded-xl border-2 shadow-sm ${themed.bg.card} ${themed.border.card}`}>
									<Text className={`font-medium text-lg ${themed.text.text}`}>
										{selectedAdmin.name}
									</Text>
									<Text
										className={`${themed.text['card-detail']} mt-1 ${defaultFontClass}`}>
										📍{' '}
										{selectedAdmin.printingLocation || 'No location provided'}
									</Text>
								</View>
								<TouchableOpacity
									onPress={handleRemoveAdmin}
									className={`mt-2 p-3 rounded-lg ${themed.bg['button-delete']}`}>
									<Text
										className={`text-center font-medium ${themed.text['on-button-delete']}`}>
										Remove Provider
									</Text>
								</TouchableOpacity>
							</View>
						)}
						{!selectedAdmin && (
							<View>
								<TextInput
									value={adminSearch}
									onChangeText={setAdminSearch}
									placeholder='Search for a provider by name'
									className={`border-2 rounded-xl p-5 mb-3 ${themed.border.input} ${themed.bg.input} ${themed.text.input} ${defaultFontClass}`}
									placeholderTextColor={colors['input-placeholder']}
								/>
								<TouchableOpacity
									onPress={() => searchAdmins(adminSearch)}
									className={`p-4 rounded-xl shadow-md mb-4 ${themed.bg.secondary}`}>
									<Text
										className={`text-lg font-semibold text-center ${themed.text['on-secondary']} ${defaultFontClass}`}>
										Search Provider
									</Text>
								</TouchableOpacity>

								{/* Admin Results */}
								{adminResults.length > 0 && (
									<View className='space-y-4'>
										{adminResults.map((admin: Admin) => (
											<TouchableOpacity
												key={admin._id}
												onPress={() => setSelectedAdmin(admin)}
												className={`p-5 rounded-xl border-2 mb-3 shadow-sm ${themed.bg.card} ${themed.border.card}`}>
												<Text
													className={`font-medium text-lg ${themed.text.text} ${defaultFontClass}`}>
													{admin.name}
												</Text>
												<Text
													className={`${themed.text['card-detail']} mt-1 ${defaultFontClass}`}>
													📍 {admin.printingLocation || 'No location provided'}
												</Text>
											</TouchableOpacity>
										))}
									</View>
								)}
							</View>
						)}
					</View>

					<View>
						<Text
							className={`text-lg font-semibold mb-3 ${themed.text.text} ${defaultFontClass}`}>
							Upload Document
						</Text>
						<TouchableOpacity
							onPress={pickDocument}
							className={`border-2 border-dashed rounded-xl p-8 items-center justify-center ${themed.border.primary}`}>
							<Image
								source={icons.upload}
								className='w-16 h-16 mb-5'
								tintColor={colors.primary}
							/>
							<Text
								className={`text-lg font-medium text-center ${themed.text.text} ${defaultFontClass}`}>
								{document?.assets
									? document.assets[0].name
									: 'Tap to select a document (PDF, Word, Image)'}
							</Text>
							<Text
								className={`text-base mt-3 ${themed.text.secondary} ${defaultFontClass}`}>
								Supported: PDF, Word, Images
							</Text>
						</TouchableOpacity>
					</View>

					<TouchableOpacity
						onPress={uploadDocument}
						disabled={isLoading}
						className={`py-5 rounded-xl mt-4 shadow-lg ${themed.bg.primary} ${
							isLoading ? 'opacity-50' : ''
						}`}>
						{isLoading ? (
							<ActivityIndicator color={colors['on-button-primary']} />
						) : (
							<Text
								className={`text-lg font-semibold text-center ${themed.text['on-button-primary']} ${defaultFontClass}`}>
								Upload Document
							</Text>
						)}
					</TouchableOpacity>
				</View>
			</View>

			{/* Modal Component */}
			<Modal
				visible={modalVisible}
				onClose={() => setModalVisible(false)}
				title={modalConfig.title}
				message={modalConfig.message}
				buttons={modalConfig.buttons}
			/>
		</ScrollView>
	);
}
