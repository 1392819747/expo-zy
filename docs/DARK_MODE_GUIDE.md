# 深色模式实现指南

## 已完成的配置

### 1. 基础配置
- ✅ `app.json` 已配置 `"userInterfaceStyle": "automatic"`
- ✅ 创建了 `constants/Colors.ts` 主题颜色系统
- ✅ 创建了 `hooks/useThemeColors.ts` 自定义 Hook

### 2. 颜色系统说明

#### 使用方法
```typescript
import { useThemeColors } from '../hooks/useThemeColors';

function MyComponent() {
  const { colors, isDark } = useThemeColors();
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>Hello</Text>
    </View>
  );
}
```

#### 可用颜色变量
- `colors.text` - 主文本颜色
- `colors.textSecondary` - 次要文本颜色
- `colors.background` - 主背景色
- `colors.backgroundSecondary` - 卡片背景色
- `colors.primary` - 主题色（微信绿）
- `colors.chatBubbleMe` - 我的消息气泡
- `colors.chatBubbleOther` - 对方消息气泡
- 等等...（查看 Colors.ts 了解完整列表）

## 实现步骤

### 步骤 1: 修改组件引入 Hook

在每个需要支持深色模式的组件顶部添加：

```typescript
import { useThemeColors } from '../../hooks/useThemeColors';

export default function MyScreen() {
  const { colors } = useThemeColors();
  // ... 其他代码
}
```

### 步骤 2: 修改 StatusBar

```typescript
<StatusBar 
  barStyle={colors.statusBar}
  backgroundColor={colors.background} 
/>
```

### 步骤 3: 将静态样式改为动态样式

#### 方法 A: 使用内联样式（推荐用于简单组件）
```typescript
<View style={{ backgroundColor: colors.background }}>
  <Text style={{ color: colors.text }}>Content</Text>
</View>
```

#### 方法 B: 创建动态 StyleSheet（推荐用于复杂组件）

**修改前：**
```typescript
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ededed',
    color: '#000',
  }
});
```

**修改后：**
```typescript
// 将 styles 移到组件内部，作为函数
export default function MyScreen() {
  const { colors } = useThemeColors();
  
  const styles = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      color: colors.text,
    }
  }), [colors]);
  
  return <View style={styles.container}>...</View>;
}
```

### 步骤 4: 关键组件改造示例

#### 微信主页 (app/wechat/index.tsx)

需要修改的关键样式：
```typescript
// 1. 容器背景
container: {
  backgroundColor: colors.background, // 替换 '#ededed'
}

// 2. 顶部导航栏
header: {
  backgroundColor: colors.background,
  borderBottomColor: colors.border,
}

// 3. 文本颜色
headerTitle: {
  color: colors.text,
}

// 4. 搜索框
searchInputGroup: {
  backgroundColor: colors.backgroundSecondary,
  borderColor: colors.inputBorder,
}

// 5. 聊天项
chatItem: {
  backgroundColor: colors.backgroundSecondary,
  borderBottomColor: colors.borderLight,
}

chatName: {
  color: colors.text,
}

chatMessage: {
  color: colors.textSecondary,
}

chatTime: {
  color: colors.textTertiary,
}

// 6. 标签栏
tabBar: {
  backgroundColor: colors.tabBarBackground,
  borderTopColor: colors.tabBarBorder,
}

// 7. 头像
avatar: {
  backgroundColor: colors.avatarBackground,
}
```

#### 聊天详情页 (app/wechat/chat-detail.tsx)

需要修改的关键样式：
```typescript
// 1. 背景
safeArea: {
  backgroundColor: colors.background,
}

// 2. 消息气泡
messageBubbleMe: {
  backgroundColor: colors.chatBubbleMe,
}

messageBubbleOther: {
  backgroundColor: colors.chatBubbleOther,
}

messageText: {
  color: isDark ? colors.text : '#111',
}

// 3. 输入区域
inputBubble: {
  backgroundColor: colors.backgroundSecondary,
}

textInput: {
  color: colors.text,
}

// 4. 按钮
sendButton: {
  backgroundColor: colors.primary,
}
```

## 完整示例：聊天详情页改造

```typescript
import { useThemeColors } from '../../hooks/useThemeColors';
import { useMemo } from 'react';

export default function ChatDetailScreen() {
  const { colors, isDark } = useThemeColors();
  
  const styles = useMemo(() => StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    messageBubbleMe: {
      backgroundColor: colors.chatBubbleMe,
      borderTopRightRadius: 4,
    },
    messageBubbleOther: {
      backgroundColor: colors.chatBubbleOther,
      borderTopLeftRadius: 4,
    },
    messageText: {
      fontSize: 16,
      color: isDark ? colors.text : '#111',
      lineHeight: 22,
    },
    inputBubble: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 28,
      paddingHorizontal: 12,
      paddingVertical: 10,
      gap: 8,
      shadowColor: colors.cardShadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 12,
    },
    textInput: {
      fontSize: 16,
      color: colors.text,
      // ... 其他样式
    },
    sendButton: {
      paddingHorizontal: 12,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 2,
    },
  }), [colors, isDark]);
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={colors.statusBar} />
      {/* ... 其他内容 */}
    </SafeAreaView>
  );
}
```

## 需要修改的文件列表

### 高优先级（主要用户界面）
1. ✅ `app/wechat/index.tsx` - 微信主页（已添加 Hook）
2. `app/wechat/chat-detail.tsx` - 聊天详情
3. `app/wechat/contacts.tsx` - 联系人页
4. `app/wechat/search.tsx` - 搜索页

### 中优先级（次要界面）
5. `app/wechat/contact-detail.tsx` - 联系人详情
6. `app/wechat/contact-edit.tsx` - 编辑联系人
7. `app/wechat/contact-add.tsx` - 添加联系人
8. `app/wechat/ai-chat.tsx` - AI 聊天
9. `app/(tabs)/index.tsx` - 主标签页

### 低优先级（组件）
10. `components/wechat-app.tsx` - 微信组件

## 测试深色模式

### iOS 模拟器
1. Settings → Developer → Dark Appearance
2. 或者：设置 → 显示与亮度 → 深色

### Android 模拟器
1. Settings → Display → Dark theme

### 程序内快速切换（开发用）
可以在设置页面添加手动切换按钮：
```typescript
import { Appearance } from 'react-native';

// 切换到深色
Appearance.setColorScheme('dark');

// 切换到浅色
Appearance.setColorScheme('light');

// 跟随系统
Appearance.setColorScheme(null);
```

## 注意事项

1. **图标颜色**：确保图标在深色背景下可见
2. **对比度**：确保文本和背景有足够对比度
3. **阴影**：深色模式下阴影可能需要调整
4. **边框**：浅色边框在深色背景下可能不可见
5. **测试**：在两种模式下都要测试所有页面

## 性能优化

使用 `useMemo` 包裹 StyleSheet.create，避免每次渲染都重新创建样式：

```typescript
const styles = useMemo(() => StyleSheet.create({
  // ... styles
}), [colors, isDark]);
```

## 完成情况

- [x] 创建颜色系统
- [x] 创建主题 Hook
- [x] 添加实现指南
- [ ] 修改微信主页完整支持
- [ ] 修改聊天详情页
- [ ] 修改其他页面
