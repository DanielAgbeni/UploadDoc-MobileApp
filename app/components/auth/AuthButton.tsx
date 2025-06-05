import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface AuthButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  icon,
}) => {
  const { themed } = useTheme();

  const getButtonStyles = () => {
    const baseStyles = 'rounded-lg flex-row items-center justify-center';
    
    const sizeStyles = {
      small: 'px-4 py-2',
      medium: 'px-6 py-3',
      large: 'px-8 py-4',
    };

    const variantStyles = {
      primary: `${themed.bg.primary}`,
      secondary: `${themed.bg.secondary}`,
      outline: `border-2 border-primary ${themed.bg.background}`,
    };

    const disabledStyles = disabled || loading ? 'opacity-50' : '';

    return `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${disabledStyles}`;
  };

  const getTextStyles = () => {
    const baseStyles = 'font-semibold text-center';
    
    const sizeStyles = {
      small: 'text-sm',
      medium: 'text-base',
      large: 'text-lg',
    };

    const variantStyles = {
      primary: 'text-white',
      secondary: 'text-white',
      outline: 'text-primary',
    };

    return `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]}`;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={getButtonStyles()}
      activeOpacity={0.8}
    >
      {loading ? (
        <View className="flex-row items-center">
          <ActivityIndicator 
            size="small" 
            color={variant === 'outline' ? '#444ebb' : 'white'} 
            className="mr-2"
          />
          <Text className={getTextStyles()}>Loading...</Text>
        </View>
      ) : (
        <View className="flex-row items-center">
          {icon && <View className="mr-2">{icon}</View>}
          <Text className={getTextStyles()}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
