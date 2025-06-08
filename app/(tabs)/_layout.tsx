import { icons } from '@/constants/icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Image, Text } from 'react-native';
import Animated, {
	useAnimatedStyle,
	withTiming,
} from 'react-native-reanimated';
import { useAuth } from '../context/AuthContext';
import { useTab } from '../context/TabContext';
import { useTheme } from '../hooks/useTheme';

const TabIcon = ({ focused, icons, title }: any) => {
	const { themed, colors } = useTheme(); // Access both 'themed' (for classes) and 'colors' (for direct values)

	const animatedStyle = useAnimatedStyle(() => {
		return {
			transform: [{ scale: withTiming(focused ? 1.1 : 1, { duration: 200 }) }],
			opacity: withTiming(focused ? 1 : 0.6, { duration: 200 }),
		};
	}, [focused]);

	return (
		<Animated.View
			style={animatedStyle}
			className={`flex-row items-center justify-center mt-4 ${
				focused
					? `w-full flex-1 min-w-[112px] min-h-16 rounded-xl ${themed.bg.secondary}`
					: 'size-full rounded-full'
			}`}>
			<Image
				source={icons}
				// Use direct color values from 'colors' for tintColor
				tintColor={focused ? colors['on-secondary'] : colors.text}
				className='size-8'
			/>
			{focused && (
				<Text
					className={`text-base font-semibold ml-2 ${themed.text['on-secondary']}`}>
					{title}
				</Text>
			)}
		</Animated.View>
	);
};

const _layout = () => {
	const { colors, themed } = useTheme(); // Get both 'colors' (for direct values) and 'themed' (for classes)
	const { user } = useAuth();
	const { lastActiveTab, setLastActiveTab } = useTab();

	// Determine the initial tab name based on the last active tab
	let initialTabRoute = 'index'; // Default to 'index' if no specific tab was saved or it's not a tab route
	if (lastActiveTab && lastActiveTab.startsWith('(tabs)/')) {
		// Extract the actual route name (e.g., 'explore' from '(tabs)/explore')
		initialTabRoute = lastActiveTab.replace('(tabs)/', '');
	}

	return (
		<Tabs
			// Set the initial route name for the Tabs component
			initialRouteName={initialTabRoute}
			screenOptions={{
				tabBarShowLabel: false,
				tabBarItemStyle: {
					width: '100%',
					height: '100%',
					justifyContent: 'center',
					alignItems: 'center',
				},
				tabBarStyle: {
					backgroundColor: colors.background, // Use direct color value from 'colors'
					height: 70,
					position: 'fixed',
					overflow: 'hidden',
				},
			}}
			screenListeners={{
				tabPress: (e) => {
					const routeName = e.target?.split('-')[0];
					if (routeName) {
						setLastActiveTab(routeName);
					}
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
					title: user?.name?.split(' ')[0] || 'Profile',
					headerShown: false,
					tabBarIcon: ({ focused }) => (
						<TabIcon
							focused={focused}
							icons={icons.profileIcon}
							title={user?.name?.split(' ')[0] || 'Profile'}
						/>
					),
				}}
			/>
		</Tabs>
	);
};

export default _layout;
