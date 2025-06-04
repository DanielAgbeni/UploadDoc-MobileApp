import { useTheme as useThemeContext } from '../context/ThemeContext';

// Re-export the theme hook for easier imports
export const useTheme = () => {
	const context = useThemeContext();

	// Helper function to get themed class names
	const getThemedClassName = (
		lightClass: string,
		darkClass: string,
	): string => {
		return context.isDark ? darkClass : lightClass;
	};

	// Helper function to get themed styles
	const getThemedStyle = (lightStyle: object, darkStyle: object): object => {
		return context.isDark ? darkStyle : lightStyle;
	};

	// Utility to create themed classes for common patterns
	const themed = {
		// Background colors
		bg: {
			primary: getThemedClassName('bg-light-primary', 'bg-dark-primary'),
			secondary: getThemedClassName('bg-light-secondary', 'bg-dark-secondary'),
			accent: getThemedClassName('bg-light-accent', 'bg-dark-accent'),
			background: getThemedClassName(
				'bg-light-background',
				'bg-dark-background',
			),
		},
		// Text colors
		text: {
			primary: getThemedClassName('text-light-text', 'text-dark-text'),
			secondary: getThemedClassName(
				'text-light-secondary',
				'text-dark-secondary',
			),
			accent: getThemedClassName('text-light-accent', 'text-dark-accent'),
		},
		// Border colors
		border: {
			primary: getThemedClassName(
				'border-light-primary',
				'border-dark-primary',
			),
			secondary: getThemedClassName(
				'border-light-secondary',
				'border-dark-secondary',
			),
			accent: getThemedClassName('border-light-accent', 'border-dark-accent'),
		},
	};

	return {
		...context,
		getThemedClassName,
		getThemedStyle,
		themed,
	};
};
