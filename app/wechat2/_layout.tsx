import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from 'react-native';
import { useWeChatTheme } from './useWeChatTheme';

const WeChatTabLabel = ({ label, color }: { label: string; color: string }) => (
  <Text style={{ fontSize: 12, marginTop: 2, color }}>{label}</Text>
);

export default function WeChat2Layout() {
  const theme = useWeChatTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.bg1,
          borderTopColor: theme.fillColor,
          borderTopWidth: 0.5,
          height: 60,
          paddingTop: 6,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.text3,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: ({ color }) => <WeChatTabLabel label="微信" color={color} />,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          tabBarLabel: ({ color }) => <WeChatTabLabel label="通讯录" color={color} />,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          tabBarLabel: ({ color }) => <WeChatTabLabel label="发现" color={color} />,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="me"
        options={{
          tabBarLabel: ({ color }) => <WeChatTabLabel label="我" color={color} />,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chats/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="contacts/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
