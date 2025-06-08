/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./app/**/*.{js', './components/**/*.{js}'], // Shortened for brevity
	presets: [require('nativewind/preset')],
	theme: {
		extend: {
			colors: {
				light: {
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
					'on-secondary': '#ffffff', // Added: Text color that contrasts well with secondary
				},
				dark: {
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
					'on-secondary': '#ffffff', // Added: Text color that contrasts well with secondary
				},
			},
		},
	},
	plugins: [],
};
