import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="login" 
        options={{
          title: 'Sign In',
        }}
      />
      <Stack.Screen 
        name="register" 
        options={{
          title: 'Create Account',
        }}
      />
      <Stack.Screen 
        name="verify-email" 
        options={{
          title: 'Verify Email',
          gestureEnabled: false, // Prevent going back during verification
        }}
      />
    </Stack>
  );
}
