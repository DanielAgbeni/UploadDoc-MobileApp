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
				},
				dark: {
					text: '#e4e6f6',
					background: '#000914',
					primary: '#444ebb',
					secondary: '#172082',
					accent: '#1724ab',
				},
			},
		},
	},
	plugins: [],
};
