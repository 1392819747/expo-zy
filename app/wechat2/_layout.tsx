import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks/useThemeColors';
import { Text } from 'react-native';

export default function WeChat2Layout() {
  const { colors } = useThemeColors();

  const TabBarLabel = ({ label, color }: { label: string; color: string }) => (
    <Text style={{ fontSize: 10, color, marginTop: -4 }}>{label}</Text>
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.backgroundSecondary,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
        },
        tabBarActiveTintColor: colors.primary || '#07C160',
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: ({ color }) => <TabBarLabel label="微信" color={color} />,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          tabBarLabel: ({ color }) => <TabBarLabel label="通讯录" color={color} />,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          tabBarLabel: ({ color }) => <TabBarLabel label="发现" color={color} />,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="me"
        options={{
          tabBarLabel: ({ color }) => <TabBarLabel label="我" color={color} />,
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
