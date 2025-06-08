// hooks/useTheme.ts
import { useTheme as useThemeContext } from '../context/ThemeContext';

export const useTheme = () => {
	const context = useThemeContext();

	const getThemedClassName = (
		lightClass: string,
		darkClass: string,
	): string => {
		return context.isDark ? darkClass : lightClass;
	};

	const getThemedStyle = (lightStyle: object, darkStyle: object): object => {
		return context.isDark ? darkStyle : lightStyle;
	};

	const themed = {
		bg: {
			primary: getThemedClassName('bg-light-primary', 'bg-dark-primary'),
			secondary: getThemedClassName('bg-light-secondary', 'bg-dark-secondary'),
			accent: getThemedClassName('bg-light-accent', 'bg-dark-accent'),
			background: getThemedClassName(
				'bg-light-background',
				'bg-dark-background',
			),
			card: getThemedClassName('bg-light-card-bg', 'bg-dark-card-bg'),
			'button-primary': getThemedClassName(
				'bg-light-button-primary-bg',
				'bg-dark-button-primary-bg',
			),
		},
		text: {
			primary: getThemedClassName('text-light-primary', 'text-dark-primary'),
			secondary: getThemedClassName(
				'text-light-secondary',
				'text-dark-secondary',
			),
			accent: getThemedClassName('text-light-accent', 'text-dark-accent'),
			text: getThemedClassName('text-light-text', 'text-dark-text'),
			'on-button-primary': getThemedClassName(
				'text-light-on-button-primary',
				'text-dark-on-button-primary',
			),
			'card-detail': getThemedClassName(
				'text-light-card-detail-text',
				'text-dark-card-detail-text',
			),
			'rating-star': getThemedClassName(
				'text-light-rating-star',
				'text-dark-rating-star',
			),
			'on-secondary': getThemedClassName(
				'text-light-on-secondary',
				'text-dark-on-secondary',
			), // Added here
		},
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
			card: getThemedClassName(
				'border-light-border-card',
				'border-dark-border-card',
			),
		},
	};

	return {
		...context, // Now includes `colors` object
		getThemedClassName,
		getThemedStyle,
		themed,
	};
};
