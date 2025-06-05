import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { Link, router } from 'expo-router';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';
import { AuthInput } from '../components/auth/AuthInput';
import { AuthButton } from '../components/auth/AuthButton';
import { GoogleSignInButton } from '../components/auth/GoogleSignInButton';
import { icons } from '../../constants/icons';
import { ApiError } from '../types/auth';

export default function RegisterScreen() {
  const { themed } = useTheme();
  const { register, isLoading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    matricNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [acceptTerms, setAcceptTerms] = useState(false);

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.matricNumber.trim()) {
      errors.matricNumber = 'Matric number is required';
    } else if (formData.matricNumber.trim().length < 3) {
      errors.matricNumber = 'Please enter a valid matric number';
    }
    
    if (!formData.password.trim()) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword.trim()) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (!acceptTerms) {
      errors.terms = 'You must accept the terms and conditions';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    
    try {
      clearError();
      
      const response = await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        matricNumber: formData.matricNumber.trim(),
        password: formData.password,
      });

      // Show success message and redirect to verification
      Alert.alert(
        'Registration Successful',
        response.message,
        [
          {
            text: 'OK',
            onPress: () => {
              router.push({
                pathname: '/auth/verify-email',
                params: { email: formData.email.trim().toLowerCase() }
              });
            }
          }
        ]
      );
    } catch (error) {
      const apiError = error as ApiError;
      Alert.alert('Registration Failed', apiError.message);
    }
  };

  const handleGoogleSuccess = () => {
    console.log('Google sign-in successful');
  };

  const handleGoogleError = (errorMessage: string) => {
    Alert.alert('Google Sign-in Failed', errorMessage);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView 
        className={`flex-1 ${themed.bg.background}`}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 py-8">
          {/* Logo and Header */}
          <View className="items-center mb-8 mt-8">
            <Image 
              source={icons.logo} 
              className="w-20 h-20 mb-4"
              resizeMode="contain"
            />
            <Text className={`text-3xl font-bold mb-2 ${themed.text.primary}`}>
              Create Account
            </Text>
            <Text className={`text-base text-center ${themed.text.secondary}`}>
              Join UploadDoc to manage your documents
            </Text>
          </View>

          {/* Registration Form */}
          <View className="mb-6">
            <AuthInput
              label="Full Name"
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              placeholder="Enter your full name"
              autoCapitalize="words"
              error={formErrors.name}
            />

            <AuthInput
              label="Email Address"
              value={formData.email}
              onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              error={formErrors.email}
            />

            <AuthInput
              label="Matric Number"
              value={formData.matricNumber}
              onChangeText={(text) => setFormData(prev => ({ ...prev, matricNumber: text }))}
              placeholder="Enter your matric number"
              autoCapitalize="characters"
              error={formErrors.matricNumber}
            />

            <AuthInput
              label="Password"
              value={formData.password}
              onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
              placeholder="Create a password"
              secureTextEntry
              error={formErrors.password}
            />

            <AuthInput
              label="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
              placeholder="Confirm your password"
              secureTextEntry
              error={formErrors.confirmPassword}
            />

            {/* Terms and Conditions */}
            <TouchableOpacity
              onPress={() => setAcceptTerms(!acceptTerms)}
              className="flex-row items-start mb-6"
            >
              <View className={`
                w-5 h-5 rounded border-2 mr-3 items-center justify-center mt-0.5
                ${acceptTerms ? 'bg-primary border-primary' : `border-gray-300 dark:border-gray-600 ${themed.bg.background}`}
              `}>
                {acceptTerms && (
                  <Text className="text-white text-xs">✓</Text>
                )}
              </View>
              <Text className={`text-sm flex-1 ${themed.text.primary}`}>
                I agree to the{' '}
                <Text className="text-primary font-medium">Terms of Service</Text>
                {' '}and{' '}
                <Text className="text-primary font-medium">Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            {formErrors.terms && (
              <Text className="text-red-500 text-sm mb-4 -mt-4">
                {formErrors.terms}
              </Text>
            )}

            {/* Error Message */}
            {error && (
              <View className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <Text className="text-red-600 dark:text-red-400 text-sm">
                  {error}
                </Text>
              </View>
            )}

            {/* Register Button */}
            <AuthButton
              title="Create Account"
              onPress={handleRegister}
              loading={isLoading}
              size="large"
            />
          </View>

          {/* Divider */}
          <View className="flex-row items-center mb-6">
            <View className={`flex-1 h-px ${themed.bg.secondary}`} />
            <Text className={`mx-4 text-sm ${themed.text.secondary}`}>
              or continue with
            </Text>
            <View className={`flex-1 h-px ${themed.bg.secondary}`} />
          </View>

          {/* Google Sign In */}
          <GoogleSignInButton
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
          />

          {/* Footer Links */}
          <View className="mt-8 items-center">
            <View className="flex-row items-center">
              <Text className={`text-base ${themed.text.secondary}`}>
                Already have an account?{' '}
              </Text>
              <Link href="/auth/login" asChild>
                <TouchableOpacity>
                  <Text className="text-primary text-base font-medium">
                    Sign In
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
