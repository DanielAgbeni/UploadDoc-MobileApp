import React from 'react';
import { Modal as RNModal, Text, TouchableOpacity, View } from 'react-native';
import useTheme from '../hooks/useTheme';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface ModalButton {
	text: string;
	onPress: () => void;
	variant?: ButtonVariant;
}

interface ModalProps {
	visible: boolean;
	onClose: () => void;
	title: string;
	message: string;
	buttons?: ModalButton[];
}

const Modal: React.FC<ModalProps> = ({
	visible,
	onClose,
	title,
	message,
	buttons = [{ text: 'OK', onPress: () => {}, variant: 'primary' }],
}) => {
	const { themed } = useTheme();

	const getButtonStyles = (variant: ButtonVariant = 'primary') => {
		switch (variant) {
			case 'danger':
				return `${themed.bg['button-delete']} ${themed.text['on-button-delete']}`;
			case 'secondary':
				return `${themed.bg.secondary} ${themed.text['on-secondary']}`;
			case 'primary':
			default:
				return `${themed.bg.primary} ${themed.text['on-button-primary']}`;
		}
	};

	return (
		<RNModal
			animationType='fade'
			transparent={true}
			visible={visible}
			onRequestClose={onClose}>
			<View className='flex-1 justify-center items-center bg-black/50'>
				<View
					className={`w-[90%] rounded-2xl p-6 ${themed.bg.background} shadow-lg`}>
					<Text className={`text-xl font-bold mb-4 ${themed.text.text}`}>
						{title}
					</Text>

					<Text className={`text-base mb-6 ${themed.text.text}`}>
						{message}
					</Text>

					<View className='flex-row justify-end gap-3'>
						{buttons.map((button, index) => (
							<TouchableOpacity
								key={index}
								onPress={() => {
									button.onPress();
									onClose();
								}}
								className={`px-4 py-2 rounded-lg ${getButtonStyles(
									button.variant,
								)}`}>
								<Text className='text-base font-medium text-white'>
									{button.text}
								</Text>
							</TouchableOpacity>
						))}
					</View>
				</View>
			</View>
		</RNModal>
	);
};

export default Modal;
