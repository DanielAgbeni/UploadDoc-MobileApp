const config = {
	// Exclude types directory from routing
	unstable_ignoreWarnings: true,
	// Explicitly ignore routes that should not be included
	ignoredRoutesPattern: ['**/types/*', '**/utils/*'],
};

export default config;
