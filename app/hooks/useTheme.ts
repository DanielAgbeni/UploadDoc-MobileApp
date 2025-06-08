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
			// New Dashboard specific backgrounds
			'button-accept': getThemedClassName(
				'bg-light-button-accept-bg',
				'bg-dark-button-accept-bg',
			),
			'button-delete': getThemedClassName(
				'bg-light-button-delete-bg',
				'bg-dark-button-delete-bg',
			),
			'button-download': getThemedClassName(
				'bg-light-button-download-bg',
				'bg-dark-button-download-bg',
			),
			input: getThemedClassName('bg-light-input-bg', 'bg-dark-input-bg'),
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
			),
			// New Dashboard specific texts
			'on-button-accept': getThemedClassName(
				'text-light-on-button-accept',
				'text-dark-on-button-accept',
			),
			'on-button-delete': getThemedClassName(
				'text-light-on-button-delete',
				'text-dark-on-button-delete',
			),
			'on-button-download': getThemedClassName(
				'text-light-on-button-download',
				'text-dark-on-button-download',
			),
			input: getThemedClassName(
				'text-light-input-text',
				'text-dark-input-text',
			),
			'input-placeholder': getThemedClassName(
				'text-light-input-placeholder',
				'text-dark-input-placeholder',
			),
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
			// New Dashboard specific borders
			input: getThemedClassName(
				'border-light-input-border',
				'border-dark-input-border',
			),
		},
	};

	return {
		...context,
		getThemedClassName,
		getThemedStyle,
		themed,
	};
};
