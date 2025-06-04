// Utility functions for working with themes

export const lightTheme = {
  text: '#090b1b',
  background: '#ebf4ff',
  primary: '#444ebb',
  secondary: '#7d86e8',
  accent: '#5461e8',
};

export const darkTheme = {
  text: '#e4e6f6',
  background: '#000914',
  primary: '#444ebb',
  secondary: '#172082',
  accent: '#1724ab',
};

// Helper to create themed styles
export const createThemedStyles = (isDark: boolean) => {
  const colors = isDark ? darkTheme : lightTheme;
  
  return {
    container: {
      backgroundColor: colors.background,
    },
    text: {
      color: colors.text,
    },
    primaryButton: {
      backgroundColor: colors.primary,
    },
    secondaryButton: {
      backgroundColor: colors.secondary,
    },
    accentButton: {
      backgroundColor: colors.accent,
    },
    colors,
  };
};
