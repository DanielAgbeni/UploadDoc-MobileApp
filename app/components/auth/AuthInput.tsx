import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import useTheme from '../../hooks/useTheme';

interface AuthInputProps {
	label: string;
	value: string;
	onChangeText: (text: string) => void;
	placeholder?: string;
	secureTextEntry?: boolean;
	keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
	autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
	error?: string;
	disabled?: boolean;
}

const AuthInput: React.FC<AuthInputProps> = ({
	label,
	value,
	onChangeText,
	placeholder,
	secureTextEntry = false,
	keyboardType = 'default',
	autoCapitalize = 'none',
	error,
	disabled = false,
}) => {
	const { themed } = useTheme();
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [isFocused, setIsFocused] = useState(false);

	const togglePasswordVisibility = () => {
		setIsPasswordVisible(!isPasswordVisible);
	};

	return (
		<View className='mb-4'>
			<Text className={`text-sm font-medium mb-2 ${themed.text.primary}`}>
				{label}
			</Text>

			<View className='relative'>
				<TextInput
					value={value}
					onChangeText={onChangeText}
					placeholder={placeholder}
					secureTextEntry={secureTextEntry && !isPasswordVisible}
					keyboardType={keyboardType}
					autoCapitalize={autoCapitalize}
					editable={!disabled}
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
					className={`
            w-full px-4 py-3 rounded-lg border text-base
            ${themed.text.primary}
            ${disabled ? 'opacity-50' : ''}
            ${
							error
								? 'border-red-500 bg-red-50 dark:bg-red-900/20'
								: isFocused
								? `${themed.border.primary} border-2 ${themed.bg.background}`
								: `${themed.border.primary} ${themed.bg.background} placeholder:${themed.text.text}`
						}
          `}
					placeholderTextColor='#808080'
				/>

				{secureTextEntry && (
					<TouchableOpacity
						onPress={togglePasswordVisibility}
						className='absolute right-3 top-3'
						disabled={disabled}>
						<Text className={`text-sm font-normal ${themed.text.accent}`}>
							{isPasswordVisible ? 'Hide' : 'Show'}
						</Text>
					</TouchableOpacity>
				)}
			</View>

			{error && <Text className='text-red-500 text-sm mt-1'>{error}</Text>}
		</View>
	);
};

export default AuthInput;
