import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { Platform, Text, TouchableOpacity } from 'react-native';

export default function WeChatLayout() {
  const router = useRouter();
  // 检测iOS 26及以上版本
  const isIOS26OrAbove = Platform.OS === 'ios' && parseInt(Platform.Version, 10) >= 26;
  
  return (
    <Stack 
      screenOptions={{
        // 只在iOS 26+启用原生导航栏效果
        headerTransparent: isIOS26OrAbove,
        headerBlurEffect: isIOS26OrAbove ? 'systemMaterial' : undefined,
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          // iOS 26+使用原生导航栏，低版本使用自定义导航栏
          headerShown: isIOS26OrAbove,
          title: '微信',
          headerStyle: {
            backgroundColor: '#ededed',
          },
          headerTitleStyle: {
            fontWeight: '600',
          },
          // iOS 26+使用系统原生返回图标样式
          headerBackTitle: '',
          // iOS 26+添加左侧返回按钮和右侧加号按钮
          headerLeft: isIOS26OrAbove ? () => (
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
              onPress={() => router.push('/wechat/ai-chat')}
              style={{ 
                marginLeft: 3,
                marginRight: 0,
                paddingHorizontal: 4,
                paddingVertical: 6,
                backgroundColor: 'transparent',
              }}
            >
              <Ionicons name="add" size={22} color="#000" />
            </TouchableOpacity>
          ) : undefined,
        }} 
      />
      <Stack.Screen
        name="search"
        options={{
          headerShown: isIOS26OrAbove,
          title: '搜索',
          headerTransparent: true,
          headerBlurEffect: isIOS26OrAbove ? 'systemMaterial' : undefined,
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
          headerShown: isIOS26OrAbove,
          title: 'AI聊天',
          headerTransparent: true,
          headerBlurEffect: isIOS26OrAbove ? 'systemMaterial' : undefined,
          presentation: 'card',
        }}
      />
    </Stack>
  );
}
