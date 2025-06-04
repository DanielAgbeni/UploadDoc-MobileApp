// Utility for combining class names
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Theme-aware class builder
export const createThemedClasses = (isDark: boolean) => {
  const theme = isDark ? 'dark' : 'light';
  
  return {
    // Background utilities
    bgPrimary: `bg-${theme}-primary`,
    bgSecondary: `bg-${theme}-secondary`,
    bgAccent: `bg-${theme}-accent`,
    bgBackground: `bg-${theme}-background`,
    
    // Text utilities
    textPrimary: `text-${theme}-text`,
    textSecondary: `text-${theme}-secondary`,
    textAccent: `text-${theme}-accent`,
    
    // Border utilities
    borderPrimary: `border-${theme}-primary`,
    borderSecondary: `border-${theme}-secondary`,
    borderAccent: `border-${theme}-accent`,
    
    // Combined utilities for common patterns
    card: `bg-${theme}-background border border-${theme}-secondary`,
    button: `bg-${theme}-primary text-white`,
    buttonSecondary: `bg-${theme}-secondary text-white`,
    buttonAccent: `bg-${theme}-accent text-white`,
    input: `bg-${theme}-background border border-${theme}-secondary text-${theme}-text`,
  };
};

// Helper to build themed class strings
export const buildThemedClass = (baseClasses: string, themedClass: string): string => {
  return cn(baseClasses, themedClass);
};
