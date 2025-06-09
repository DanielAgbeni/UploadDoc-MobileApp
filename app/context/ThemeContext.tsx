// context/ThemeContext.tsx
import React, { createContext, ReactNode, useContext } from 'react';
import { useColorScheme } from 'react-native';

type ColorScheme = 'light' | 'dark';

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
	'on-secondary': string;
	// New Dashboard specific colors
	'button-accept-bg': string;
	'on-button-accept': string;
	'button-delete-bg': string;
	'on-button-delete': string;
	'button-download-bg': string;
	'on-button-download': string;
	'input-bg': string;
	'input-text': string;
	'input-border': string;
	'input-placeholder': string;
}

interface ThemeContextType {
	colorScheme: ColorScheme;
	colors: ThemeColors; // Re-introduced for direct color value access
	isDark: boolean;
}

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
	'button-accept-bg': '#28a745',
	'on-button-accept': '#ffffff',
	'button-delete-bg': '#dc3545',
	'on-button-delete': '#ffffff',
	'button-download-bg': '#007bff',
	'on-button-download': '#ffffff',
	'input-bg': '#ffffff',
	'input-text': '#090b1b',
	'input-border': '#cccccc',
	'input-placeholder': '#999999',
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
	'button-accept-bg': '#218838',
	'on-button-accept': '#ffffff',
	'button-delete-bg': '#c82333',
	'on-button-delete': '#ffffff',
	'button-download-bg': '#0056b3',
	'on-button-download': '#ffffff',
	'input-bg': '#0d1a2b',
	'input-text': '#e4e6f6',
	'input-border': '#3a3a5a',
	'input-placeholder': '#888888',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const systemColorScheme = useColorScheme();
	const colorScheme: ColorScheme =
		systemColorScheme === 'dark' ? 'dark' : 'light';
	const colors = colorScheme === 'dark' ? darkColors : lightColors;
	const isDark = colorScheme === 'dark';

	const value: ThemeContextType = {
		colorScheme,
		colors,
		isDark,
	};

	return (
		<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
	);
};

export const useTheme = () => {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error('useTheme must be used within a ThemeProvider');
	}
	return context;
};

export default ThemeProvider;
