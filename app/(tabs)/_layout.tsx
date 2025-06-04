import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';

const _layout = () => {
	return (
		<Tabs
			screenOptions={{
				tabBarShowLabel: false,
				// tabBarItemStyle: {
				// 	width: '100%',
				// 	height: '100%',
				// 	justifyContent: 'center',
				// 	alignItems: 'center',
				// },
				// tabBarStyle: {
				// 	backgroundColor: '#0f0D23',
				// 	borderRadius: 50,
				// 	marginHorizontal: 20,
				// 	marginBottom: 36,
				// 	height: 52,
				// 	position: 'absolute',
				// 	overflow: 'hidden',
				// 	borderWidth: 1,
				// 	borderColor: '#0f0d23',
				// },
			}}>
			<Tabs.Screen
				name='index'
				options={{
					title: '',
					headerShown: false,
					tabBarIcon: ({ focused }) => (
						// <TabIcon
						// 	focused={focused}
						// 	icons={icons.home}
						// 	title='Home'
						// />
						<Text>hhfj</Text>
					),
				}}
			/>
			<Tabs.Screen
				name='search'
				options={{
					title: 'Search',
					headerShown: false,
					tabBarIcon: ({ focused }) => (
						// <TabIcon
						// 	focused={focused}
						// 	icons={icons.home}
						// 	title='Home'
						// />
						<Text>hhfj</Text>
					),
				}}
			/>
			<Tabs.Screen
				name='saved'
				options={{
					title: 'Saved',
					headerShown: false,
					tabBarIcon: ({ focused }) => (
						// <TabIcon
						// 	focused={focused}
						// 	icons={icons.home}
						// 	title='Home'
						// />
						<Text>hhfj</Text>
					),
				}}
			/>
			<Tabs.Screen
				name='profile'
				options={{
					title: 'Profile',
					headerShown: false,
					tabBarIcon: ({ focused }) => (
						// <TabIcon
						// 	focused={focused}
						// 	icons={icons.home}
						// 	title='Home'
						// />
						<Text>hhfj</Text>
					),
				}}
			/>
		</Tabs>
	);
};

export default _layout;
