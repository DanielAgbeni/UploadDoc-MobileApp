import { Stack } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './globals.css';
import { useTheme } from './hooks/useTheme';

function RootLayoutNav() {
	const { isAuthenticated, isLoading } = useAuth();
	const { themed } = useTheme();

	if (isLoading) {
		return (
			<View
				className={`flex-1 items-center justify-center ${themed.bg.background}`}>
				<ActivityIndicator
					size='large'
					color='#444ebb'
				/>
			</View>
		);
	}

	return (
		<Stack screenOptions={{ headerShown: false }}>
			{isAuthenticated ? (
				<Stack.Screen
					name='(tabs)'
					options={{ headerShown: false }}
				/>
			) : (
				<Stack.Screen
					name='auth'
					options={{ headerShown: false }}
				/>
			)}
		</Stack>
	);
}

export default function RootLayout() {
	return (
		<ThemeProvider>
			<AuthProvider>
				<RootLayoutNav />
			</AuthProvider>
		</ThemeProvider>
	);
}
