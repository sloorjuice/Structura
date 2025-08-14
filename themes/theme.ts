// Optional: Custom hook for easier theme access
import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const radius = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 32,
};

const fonts = {
  regular: { fontFamily: 'System', fontWeight: '400' as const },
  medium: { fontFamily: 'System', fontWeight: '500' as const },
  bold: { fontFamily: 'System', fontWeight: '700' as const },
  heavy: { fontFamily: 'System', fontWeight: '900' as const },
  light: { fontFamily: 'System', fontWeight: '300' as const },
  thin: { fontFamily: 'System', fontWeight: '100' as const },
};

const lightColors = {
  background: '#fff',
  surface: '#f7f7f7',
  card: '#f0f0f0',
  border: '#e0e0e0',
  text: '#25292e',
  muted: '#888',
  accent: '#ffd33d',
  error: '#ff5252',
  success: '#4caf50',
  warning: '#ffb300',
  onSurface: '#25292e',
  shadow: 'rgba(0,0,0,0.08)',
  tabBarActiveTint: '#ffd33d', // accent
  tabBarBackground: '#fff',
  headerBackground: '#fff',
  headerText: '#25292e',
  star: '#ffd33d', // accent
  icon: '#888',
};

const darkColors = {
  background: '#181a20',
  surface: '#23262f',
  card: '#25292e',
  border: '#444',
  text: '#fff',
  muted: '#aaa',
  accent: '#ffd33d',
  error: '#ff5252',
  success: '#4caf50',
  warning: '#ffb300',
  onSurface: '#fff',
  shadow: 'rgba(0,0,0,0.32)',
  tabBarActiveTint: '#ffd33d', // accent
  tabBarBackground: '#181a20',
  headerBackground: '#23262f',
  headerText: '#fff',
  star: '#ffd33d', // accent
  icon: '#aaa',
};

export const lightTheme = {
  dark: false,
  colors: lightColors,
  fonts,
  spacing,
  radius,
};

export const darkTheme = {
  dark: true,
  colors: darkColors,
  fonts,
  spacing,
  radius,
};

export const getTheme = (colorScheme: 'light' | 'dark' | null | undefined) =>
  colorScheme === 'dark' ? darkTheme : lightTheme;

export function useTheme() {
  const colorScheme = useColorScheme();
  return useMemo(() => getTheme(colorScheme), [colorScheme]);
}