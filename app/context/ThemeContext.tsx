import React, { createContext, useContext, ReactNode } from 'react';
import { useColorScheme } from 'react-native';

type ColorScheme = 'light' | 'dark';

interface ThemeColors {
  text: string;
  background: string;
  primary: string;
  secondary: string;
  accent: string;
}

interface ThemeContextType {
  colorScheme: ColorScheme;
  colors: ThemeColors;
  isDark: boolean;
}

const lightColors: ThemeColors = {
  text: '#090b1b',
  background: '#ebf4ff',
  primary: '#444ebb',
  secondary: '#7d86e8',
  accent: '#5461e8',
};

const darkColors: ThemeColors = {
  text: '#e4e6f6',
  background: '#000914',
  primary: '#444ebb',
  secondary: '#172082',
  accent: '#1724ab',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const colorScheme: ColorScheme = systemColorScheme === 'dark' ? 'dark' : 'light';
  const colors = colorScheme === 'dark' ? darkColors : lightColors;
  const isDark = colorScheme === 'dark';

  const value: ThemeContextType = {
    colorScheme,
    colors,
    isDark,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
