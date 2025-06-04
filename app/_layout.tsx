import { Stack } from 'expo-router';
import { ThemeProvider } from './context/ThemeContext';
import './globals.css';

export default function RootLayout() {
	return (
		<ThemeProvider>
			<Stack>
				<Stack.Screen
					name='(tabs)'
					options={{ headerShown: false }}
				/>
			</Stack>
		</ThemeProvider>
	);
}
