import React, { useState, useEffect } from 'react';
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
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';
import { AuthInput } from '../components/auth/AuthInput';
import { AuthButton } from '../components/auth/AuthButton';
import { icons } from '../../constants/icons';
import { ApiError } from '../types/auth';

export default function VerifyEmailScreen() {
  const { themed } = useTheme();
  const { verifyEmail, resendVerificationCode, isLoading, error, clearError } = useAuth();
  const { email } = useLocalSearchParams<{ email: string }>();
  
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!email) {
      router.replace('/auth/login');
      return;
    }
  }, [email]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const validateOtp = () => {
    if (!otp.trim()) {
      setOtpError('Verification code is required');
      return false;
    }
    if (otp.trim().length !== 6) {
      setOtpError('Verification code must be 6 digits');
      return false;
    }
    if (!/^\d+$/.test(otp.trim())) {
      setOtpError('Verification code must contain only numbers');
      return false;
    }
    setOtpError('');
    return true;
  };

  const handleVerifyEmail = async () => {
    if (!validateOtp() || !email) return;
    
    try {
      clearError();
      
      await verifyEmail({
        email: email,
        otp: otp.trim(),
      });

      Alert.alert(
        'Email Verified!',
        'Your email has been successfully verified. You can now access your account.',
        [
          {
            text: 'Continue',
            onPress: () => {
              // Navigation will be handled by the auth context
            }
          }
        ]
      );
    } catch (error) {
      const apiError = error as ApiError;
      
      if (apiError.needsRegistration) {
        Alert.alert(
          'Registration Required',
          apiError.message,
          [
            {
              text: 'Register',
              onPress: () => router.replace('/auth/register')
            }
          ]
        );
      } else {
        Alert.alert('Verification Failed', apiError.message);
      }
    }
  };

  const handleResendCode = async () => {
    if (!email || resendCooldown > 0) return;
    
    try {
      setIsResending(true);
      clearError();
      
      const response = await resendVerificationCode(email);
      
      Alert.alert('Code Sent', response.message);
      setResendCooldown(60); // 60 second cooldown
      setOtp(''); // Clear current OTP
    } catch (error) {
      const apiError = error as ApiError;
      Alert.alert('Resend Failed', apiError.message);
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToLogin = () => {
    router.replace('/auth/login');
  };

  if (!email) {
    return null; // Will redirect to login
  }

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
          <View className="items-center mb-8 mt-12">
            <Image 
              source={icons.logo} 
              className="w-20 h-20 mb-4"
              resizeMode="contain"
            />
            <Text className={`text-3xl font-bold mb-2 ${themed.text.primary}`}>
              Verify Your Email
            </Text>
            <Text className={`text-base text-center mb-4 ${themed.text.secondary}`}>
              We've sent a 6-digit verification code to
            </Text>
            <Text className={`text-base font-medium text-center ${themed.text.primary}`}>
              {email}
            </Text>
          </View>

          {/* Verification Form */}
          <View className="mb-6">
            <AuthInput
              label="Verification Code"
              value={otp}
              onChangeText={(text) => {
                // Only allow numbers and limit to 6 digits
                const numericText = text.replace(/[^0-9]/g, '').slice(0, 6);
                setOtp(numericText);
                if (otpError) setOtpError('');
              }}
              placeholder="Enter 6-digit code"
              keyboardType="numeric"
              error={otpError}
            />

            {/* Error Message */}
            {error && (
              <View className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <Text className="text-red-600 dark:text-red-400 text-sm">
                  {error}
                </Text>
              </View>
            )}

            {/* Verify Button */}
            <AuthButton
              title="Verify Email"
              onPress={handleVerifyEmail}
              loading={isLoading}
              size="large"
            />
          </View>

          {/* Resend Code */}
          <View className="items-center mb-8">
            <Text className={`text-sm mb-4 ${themed.text.secondary}`}>
              Didn't receive the code?
            </Text>
            
            <TouchableOpacity
              onPress={handleResendCode}
              disabled={resendCooldown > 0 || isResending}
              className={`
                px-6 py-2 rounded-lg
                ${resendCooldown > 0 || isResending ? 'opacity-50' : ''}
              `}
            >
              <Text className="text-primary text-base font-medium">
                {isResending 
                  ? 'Sending...' 
                  : resendCooldown > 0 
                    ? `Resend in ${resendCooldown}s`
                    : 'Resend Code'
                }
              </Text>
            </TouchableOpacity>
          </View>

          {/* Instructions */}
          <View className={`p-4 rounded-lg mb-6 ${themed.bg.secondary} bg-opacity-10`}>
            <Text className={`text-sm ${themed.text.primary} mb-2 font-medium`}>
              Verification Tips:
            </Text>
            <Text className={`text-sm ${themed.text.secondary} mb-1`}>
              • Check your spam/junk folder
            </Text>
            <Text className={`text-sm ${themed.text.secondary} mb-1`}>
              • Code expires in 5 minutes
            </Text>
            <Text className={`text-sm ${themed.text.secondary}`}>
              • Make sure you entered the correct email
            </Text>
          </View>

          {/* Footer */}
          <View className="mt-auto items-center">
            <TouchableOpacity onPress={handleBackToLogin}>
              <Text className="text-primary text-base font-medium">
                Back to Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
