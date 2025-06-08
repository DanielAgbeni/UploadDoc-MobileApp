import React, { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface FormInputProps {
	label: string;
	value: string;
	onChangeText: (text: string) => void;
	placeholder?: string;
	keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
	autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
	error?: string;
	disabled?: boolean;
	multiline?: boolean;
	numberOfLines?: number;
	maxLength?: number;
}

export const FormInput: React.FC<FormInputProps> = ({
	label,
	value,
	onChangeText,
	placeholder,
	keyboardType = 'default',
	autoCapitalize = 'sentences',
	error,
	disabled = false,
	multiline = false,
	numberOfLines = 1,
	maxLength,
}) => {
	const { themed } = useTheme();
	const [isFocused, setIsFocused] = useState(false);

	return (
		<View className='mb-4'>
			<Text className={`text-lg font-medium mb-2 ${themed.text.primary}`}>
				{label}
			</Text>

			<View className='relative'>
				<TextInput
					value={value}
					onChangeText={onChangeText}
					placeholder={placeholder}
					keyboardType={keyboardType}
					autoCapitalize={autoCapitalize}
					editable={!disabled}
					multiline={multiline}
					numberOfLines={multiline ? numberOfLines : 1}
					maxLength={maxLength}
					textAlignVertical={multiline ? 'top' : 'center'}
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
					className={`
            w-full px-4 py-3 rounded-lg border text-base
            ${themed.text.text}
            ${disabled ? 'opacity-50' : ''}
            ${multiline ? 'min-h-[100px]' : ''}
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
			</View>

			{error && <Text className='text-red-500 text-sm mt-1'>{error}</Text>}
		</View>
	);
};
