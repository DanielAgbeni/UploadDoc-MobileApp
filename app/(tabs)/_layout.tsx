import { icons } from '@/constants/icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Image, Text, View } from 'react-native';

const TabIcon = ({ focused, icons, title }: any) => {
	if (focused)
		return (
			<View className='flex flex-row w-full flex-1 min-w-[112px] min-h-16 mt-4 justify-center items-center rounded-full overflow-hidden'>
				<Image
					source={icons}
					tintColor='#151312'
					className='size-8'
				/>
				<Text className='text-secondary text-base font-semibold ml-2'>
					{title}
				</Text>
			</View>
		);
	return (
		<View className=' items-center justify-center flex size-full mt-4 rounded-full'>
			<Image
				source={icons}
				tintColor=''
				className='size-8'
			/>
		</View>
	);
};

const _layout = () => {
	return (
		<Tabs
			screenOptions={{
				tabBarShowLabel: false,
				tabBarItemStyle: {
					width: '100%',
					height: '100%',
					justifyContent: 'center',
					alignItems: 'center',
				},
				tabBarStyle: {
					backgroundColor: '#0f0D23',
					// borderRadius: 50,
					// marginHorizontal: 20,
					// marginBottom: 36,
					height: 100,
					position: 'absolute',
					overflow: 'hidden',
					borderWidth: 1,
					borderColor: '#0f0d23',
				},
			}}>
			<Tabs.Screen
				name='index'
				options={{
					title: 'Home',
					headerShown: false,
					tabBarIcon: ({ focused }) => (
						<TabIcon
							focused={focused}
							icons={icons.home}
							title='Home'
						/>
					),
				}}
			/>
			<Tabs.Screen
				name='explore'
				options={{
					title: 'Discover',
					headerShown: false,
					tabBarIcon: ({ focused }) => (
						<TabIcon
							focused={focused}
							icons={icons.explore}
							title='Discover'
						/>
					),
				}}
			/>
			<Tabs.Screen
				name='dashboard'
				options={{
					title: 'Dashboard',
					headerShown: false,
					tabBarIcon: ({ focused }) => (
						<TabIcon
							focused={focused}
							icons={icons.dashboardIcon}
							title='Dashboard'
						/>
					),
				}}
			/>
			<Tabs.Screen
				name='profile'
				options={{
					title: 'Profile',
					headerShown: false,
					tabBarIcon: ({ focused }) => (
						<TabIcon
							focused={focused}
							icons={icons.profileIcon}
							title='Profile'
						/>
					),
				}}
			/>
		</Tabs>
	);
};

export default _layout;
