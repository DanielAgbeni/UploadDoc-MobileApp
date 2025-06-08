import { Stack } from 'expo-router';

export default function ScreenLayout() {
	return (
		<Stack>
			<Stack.Screen
				name='upload-document'
				options={{
					headerShown: false,
				}}
			/>
		</Stack>
	);
}
