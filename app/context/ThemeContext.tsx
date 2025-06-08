// context/ThemeContext.tsx
import React, { createContext, ReactNode, useContext } from 'react';
import { useColorScheme } from 'react-native';

type ColorScheme = 'light' | 'dark';

// Define the structure of the colors object, matching your tailwind config
interface ThemeColors {
	text: string;
	background: string;
	primary: string;
	secondary: string;
	accent: string;
	'card-bg': string;
	'border-card': string;
	'card-detail-text': string;
	'button-primary-bg': string;
	'on-button-primary': string;
	'rating-star': string;
	'on-secondary': string; // Added here
}

interface ThemeContextType {
	colorScheme: ColorScheme;
	colors: ThemeColors; // Re-introduced for direct color value access
	isDark: boolean;
}

// These direct color definitions are duplicates of tailwind.config.js
// but are necessary for native component props that expect direct color values.
const lightColors: ThemeColors = {
	text: '#090b1b',
	background: '#ebf4ff',
	primary: '#444ebb',
	secondary: '#7d86e8',
	accent: '#5461e8',
	'card-bg': '#ffffff',
	'border-card': '#e0e0e0',
	'card-detail-text': '#555555',
	'button-primary-bg': '#444ebb',
	'on-button-primary': '#ffffff',
	'rating-star': '#FFD700',
	'on-secondary': '#ffffff',
};

const darkColors: ThemeColors = {
	text: '#e4e6f6',
	background: '#000914',
	primary: '#5d5dec',
	secondary: '#172082',
	accent: '#1724ab',
	'card-bg': '#1a1a2e',
	'border-card': '#2a2a4a',
	'card-detail-text': '#bbbbbb',
	'button-primary-bg': '#5d5dec',
	'on-button-primary': '#ffffff',
	'rating-star': '#FFD700',
	'on-secondary': '#ffffff',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
	children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
	const systemColorScheme = useColorScheme();
	const colorScheme: ColorScheme =
		systemColorScheme === 'dark' ? 'dark' : 'light';
	const colors = colorScheme === 'dark' ? darkColors : lightColors;
	const isDark = colorScheme === 'dark';

	const value: ThemeContextType = {
		colorScheme,
		colors, // Now part of the context value
		isDark,
	};

	return (
		<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
	);
};

export const useTheme = (): ThemeContextType => {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error('useTheme must be used within a ThemeProvider');
	}
	return context;
};
