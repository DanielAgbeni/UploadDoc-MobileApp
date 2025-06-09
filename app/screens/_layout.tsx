import { Stack } from 'expo-router';
import { KeyboardProvider } from 'react-native-keyboard-controller';

export default function ScreenLayout() {
	return (
		<KeyboardProvider>
			<Stack>
				<Stack.Screen
					name='upload-document'
					options={{
						headerShown: false,
					}}
				/>
				<Stack.Screen
					name='EditProfile'
					options={{
						headerShown: false,
					}}
				/>
			</Stack>
		</KeyboardProvider>
	);
}
