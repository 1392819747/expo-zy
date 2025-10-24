import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter, useGlobalSearchParams, useFocusEffect } from 'expo-router';
import { Platform, Text, TouchableOpacity } from 'react-native';

export default function WeChatLayout() {
  const router = useRouter();
  const params = useGlobalSearchParams();
  // 检测iOS 26及以上版本
  const isIOS26OrAbove = Platform.OS === 'ios' && Number.parseInt(String(Platform.Version), 10) >= 26;
  const isAndroid = Platform.OS === 'android';
  const shouldShowStackHeader = isIOS26OrAbove || isAndroid;
  
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
          color: '#111111',
          fontFamily: 'System',
        },
        headerStyle: {
          backgroundColor: '#ededed',
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
              <Ionicons name="chevron-back" size={22} color="#000" />
              <Text style={{ marginLeft: 3, fontSize: 14, color: '#000', fontWeight: 'bold' }}>🏠</Text>
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
              <Ionicons name={isContactsPage ? "person-add" : "add"} size={22} color="#000" />
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
            backgroundColor: '#ededed',
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
            backgroundColor: '#ededed',
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
            backgroundColor: '#ededed',
          },
          presentation: 'card',
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
          headerShown: false,
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
    </Stack>
  );
}
