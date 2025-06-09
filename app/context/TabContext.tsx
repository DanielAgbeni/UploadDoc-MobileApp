// Create a new file TabContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

type TabContextType = {
	lastActiveTab: string;
	setLastActiveTab: (tab: string) => void;
};

const TabContext = createContext<TabContextType>({
	lastActiveTab: '(home)',
	setLastActiveTab: () => {},
});

export const TabProvider = ({ children }: { children: React.ReactNode }) => {
	const [lastActiveTab, setLastActiveTab] = useState('(home)');

	// Load saved tab on initial render
	useEffect(() => {
		const loadTab = async () => {
			const savedTab = await AsyncStorage.getItem('lastActiveTab');
			if (savedTab) {
				setLastActiveTab(savedTab);
			}
		};
		loadTab();
	}, []);

	// Update storage when tab changes
	useEffect(() => {
		const saveTab = async () => {
			await AsyncStorage.setItem('lastActiveTab', lastActiveTab);
		};
		saveTab();
	}, [lastActiveTab]);

	return (
		<TabContext.Provider value={{ lastActiveTab, setLastActiveTab }}>
			{children}
		</TabContext.Provider>
	);
};

export const useTab = () => useContext(TabContext);

export default TabProvider;
