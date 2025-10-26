import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useGlobalSearchParams, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, Text, TouchableOpacity } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';

// 自定义 HeaderRight 组件
const HeaderRight = () => {
  const router = useRouter();
  const { colors } = useThemeColors();
  
  // 从路由参数中获取ID信息
  const searchParams = useLocalSearchParams();
  const id = searchParams.id;
  const contactId = searchParams.contactId;
  
  // 确定要使用的ID
  let chatId = '';
  if (contactId) {
    chatId = Array.isArray(contactId) ? contactId[0] : contactId;
  } else if (id) {
    chatId = Array.isArray(id) ? id[0] : id;
  }
  
  // 判断是否是联系人聊天（排除特殊聊天）
  // 检查是否是有效的联系人ID（数字ID）
  const isContactChat = chatId && !isNaN(Number(chatId)) && chatId !== 'assistant' && chatId !== 'group' && chatId !== 'notifications';
  
  if (isContactChat) {
    return (
      <TouchableOpacity
        onPress={() => router.push(`/wechat/contact-detail?id=${chatId}`)}
        style={{ paddingRight: 16 }}
      >
        <Text style={{ fontSize: 16, color: colors.primary, fontWeight: '600' }}>编辑</Text>
      </TouchableOpacity>
    );
  }
  
  return null;
};

export default function WeChatLayout() {
  const router = useRouter();
  const params = useGlobalSearchParams();
  const { colors, isDark } = useThemeColors(); // 获取主题颜色
  
  // 检测iOS 26及以上版本
  const isIOS26OrAbove = Platform.OS === 'ios' && Number.parseInt(String(Platform.Version), 10) >= 26;
  const isAndroid = Platform.OS === 'android';
  const shouldShowStackHeader = isIOS26OrAbove || isAndroid;
  
  // 朋友圈页面应该隐藏导航栏，实现沉浸式体验
  const shouldShowMomentsHeader = false;
  
  // 使用状态来跟踪当前标签页
  const [currentTab, setCurrentTab] = useState(params.tab as string || 'chats');
  
  // 监听焦点变化，更新当前标签页
  useFocusEffect(() => {
    setCurrentTab(params.tab as string || 'chats');
  });
  
  // 根据当前标签页获取标题
  const getTitle = () => {
    switch(currentTab) {
      case 'chats': return '微信';
      case 'contacts': return '通讯录';
      case 'discover': return '发现';
      case 'me': return '我';
      default: return '微信';
    }
  };
  
  // 判断是否在通讯录页面
  const isContactsPage = currentTab === 'contacts';
  
  return (
    <Stack
      screenOptions={{
        // 只在iOS 26+启用原生导航栏效果
        headerTransparent: false,
        headerLargeTitle: false,
        headerShadowVisible: true,
        headerTitleStyle: {
          fontSize: 17,
          fontWeight: '600',
          color: colors.text, // 使用主题颜色
          fontFamily: 'System',
        },
        headerStyle: {
          backgroundColor: colors.background, // 使用主题颜色
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          // iOS 26+使用原生导航栏，低版本使用自定义导航栏
          headerShown: isIOS26OrAbove,
          title: getTitle(),
          headerTitleAlign: 'center',
          // iOS 26+使用系统原生返回图标样式
          headerBackTitle: '',
          // iOS 26+添加左侧返回按钮和右侧加号按钮
          headerLeft: isIOS26OrAbove && !isContactsPage ? () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                marginLeft: 2,
                paddingHorizontal: 4,
                paddingVertical: 6,
                backgroundColor: 'transparent',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Ionicons name="chevron-back" size={22} color={colors.text} />
              <Text style={{ marginLeft: 3, fontSize: 14, color: colors.text, fontWeight: 'bold' }}>🏠</Text>
            </TouchableOpacity>
          ) : undefined,
          headerRight: isIOS26OrAbove ? () => (
            <TouchableOpacity
              onPress={() => {
                if (isContactsPage) {
                  // 通讯录页面显示添加好友功能
                  router.push('/wechat/contact-add' as any);
                } else {
                  // 其他页面显示AI聊天功能
                  router.push('/wechat/ai-chat' as any);
                }
              }}
              style={{
                marginLeft: 3,
                marginRight: 0,
                paddingHorizontal: 4,
                paddingVertical: 6,
                backgroundColor: 'transparent',
              }}
            >
              <Ionicons name={isContactsPage ? "person-add" : "add"} size={22} color={colors.text} />
            </TouchableOpacity>
          ) : undefined,
        }}
      />
      <Stack.Screen
        name="search"
        options={{
          headerShown: shouldShowStackHeader,
          title: '搜索',
          headerTransparent: false,
          headerStyle: {
            backgroundColor: colors.background, // 使用主题颜色
          },
          presentation: 'card',
          // iOS 26+添加原生搜索栏
          headerSearchBarOptions: isIOS26OrAbove ? {
            placeholder: '搜索',
            cancelButtonText: '取消',
            autoFocus: true,
          } : undefined,
        }}
      />
      <Stack.Screen
        name="ai-chat"
        options={{
          headerShown: shouldShowStackHeader,
          title: 'AI聊天',
          headerTransparent: false,
          headerStyle: {
            backgroundColor: colors.background, // 使用主题颜色
          },
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="chat-detail"
        options={{
          headerShown: shouldShowStackHeader,
          title: '聊天',
          headerTransparent: false,
          headerStyle: {
            backgroundColor: colors.background, // 使用主题颜色
          },
          presentation: 'card',
          // 动态设置标题和右侧按钮
          headerRight: HeaderRight,
        }}
      />
      <Stack.Screen
        name="contacts"
        options={{
          headerShown: false,
          presentation: 'card',
          // 当在通讯录页面时，修改index页面的导航栏
          animation: 'none',
        }}
      />
      <Stack.Screen
        name="contact-list"
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="contact-detail"
        options={{
          headerShown: isIOS26OrAbove,
          title: '详情',
          headerTransparent: false,
          headerStyle: {
            backgroundColor: colors.background, // 使用主题颜色
          },
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="contact-add"
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="contact-edit"
        options={{
          headerShown: isIOS26OrAbove,
          title: '编辑联系人',
          headerTransparent: false,
          headerStyle: {
            backgroundColor: colors.background, // 使用主题颜色
          },
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="discover/moments"
        options={{
          headerShown: shouldShowMomentsHeader,
          title: '朋友圈',
          headerTransparent: false,
          headerStyle: {
            backgroundColor: colors.background, // 使用主题颜色
          },
          presentation: 'card',
        }}
      />
    </Stack>
  );
}
