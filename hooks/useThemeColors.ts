import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';

/**
 * 自定义 Hook：获取当前主题颜色
 * 根据系统设置自动切换深色/浅色模式
 */
export function useThemeColors() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  
  return { colors, isDark, colorScheme: colorScheme || 'light' };
}
