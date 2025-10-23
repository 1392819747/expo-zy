import { Stack } from 'expo-router';

export default function WeChatLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="ai-chat"
        options={{
          headerShown: false,
          presentation: 'card'
        }}
      />
    </Stack>
  );
}
