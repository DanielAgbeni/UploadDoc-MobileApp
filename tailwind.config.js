/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
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
					'on-secondary': '#ffffff',
					// New Dashboard specific colors
					'button-accept-bg': '#28a745', // Green for accept
					'on-button-accept': '#ffffff',
					'button-delete-bg': '#dc3545', // Red for delete
					'on-button-delete': '#ffffff',
					'button-download-bg': '#007bff', // Blue for download
					'on-button-download': '#ffffff',
					'input-bg': '#ffffff',
					'input-text': '#090b1b',
					'input-border': '#cccccc',
					'input-placeholder': '#999999',
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
					'on-secondary': '#ffffff',
					// New Dashboard specific colors
					'button-accept-bg': '#218838', // Darker green for accept
					'on-button-accept': '#ffffff',
					'button-delete-bg': '#c82333', // Darker red for delete
					'on-button-delete': '#ffffff',
					'button-download-bg': '#0056b3', // Darker blue for download
					'on-button-download': '#ffffff',
					'input-bg': '#0d1a2b',
					'input-text': '#e4e6f6',
					'input-border': '#3a3a5a',
					'input-placeholder': '#888888',
				},
			},
			fontFamily: {
				// Add your custom font here. Make sure it's loaded via expo-font or similar.
				// For example, if you have 'Inter-Regular.ttf' loaded as 'Inter':
				inter: ['Inter', 'sans-serif'],
			},
		},
	},
	plugins: [],
};
