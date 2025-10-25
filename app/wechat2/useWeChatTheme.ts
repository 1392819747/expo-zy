import { useMemo } from 'react';
import { useThemeColors } from '../../hooks/useThemeColors';
import { themeColors, darkThemeColors } from './theme';

export function useWeChatTheme() {
  const { isDark } = useThemeColors();
  
  const palette = useMemo(() => (isDark ? darkThemeColors : themeColors), [isDark]);
  
  return palette;
}
