/**
 * 主题颜色配置
 * 支持深色和浅色模式
 */

export const Colors = {
  light: {
    // 基础颜色
    text: '#000000',
    textSecondary: '#666666',
    textTertiary: '#999999',
    background: '#ededed',
    backgroundSecondary: '#ffffff',
    backgroundTertiary: '#f5f5f5',
    border: '#d9d9d9',
    borderLight: '#e5e5e5',
    
    // 微信特色
    primary: '#07C160',
    chatBubbleMe: '#95ec69',
    chatBubbleOther: '#ffffff',
    
    // 功能色
    destructive: '#FA5151',
    warning: '#f97316',
    info: '#3b82f6',
    
    // 标签栏
    tabBarBackground: '#ededed',
    tabBarBorder: '#d9d9d9',
    tabBarActive: '#07C160',
    tabBarInactive: '#999999',
    
    // 头像
    avatarBackground: '#07C160',
    avatarBackgroundMe: '#3b82f6',
    
    // 输入框
    inputBackground: '#f7f7f7',
    inputBorder: '#e5e7eb',
    placeholder: '#999999',
    
    // 卡片
    cardBackground: '#ffffff',
    cardShadow: 'rgba(0, 0, 0, 0.08)',
    
    // 状态栏
    statusBar: 'dark-content' as const,
  },
  dark: {
    // 基础颜色
    text: '#ffffff',
    textSecondary: '#b0b0b0',
    textTertiary: '#808080',
    background: '#1c1c1e',
    backgroundSecondary: '#2c2c2e',
    backgroundTertiary: '#3a3a3c',
    border: '#38383a',
    borderLight: '#48484a',
    
    // 微信特色
    primary: '#07C160',
    chatBubbleMe: '#056b33',
    chatBubbleOther: '#2c2c2e',
    
    // 功能色
    destructive: '#ff6b6b',
    warning: '#fb923c',
    info: '#60a5fa',
    
    // 标签栏
    tabBarBackground: '#1c1c1e',
    tabBarBorder: '#38383a',
    tabBarActive: '#07C160',
    tabBarInactive: '#808080',
    
    // 头像
    avatarBackground: '#056b33',
    avatarBackgroundMe: '#1e40af',
    
    // 输入框
    inputBackground: '#3a3a3c',
    inputBorder: '#48484a',
    placeholder: '#808080',
    
    // 卡片
    cardBackground: '#2c2c2e',
    cardShadow: 'rgba(0, 0, 0, 0.3)',
    
    // 状态栏
    statusBar: 'light-content' as const,
  },
};

export type ColorScheme = keyof typeof Colors;
export type ThemeColors = typeof Colors.light;
