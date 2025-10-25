import { Stack } from 'expo-router';

export default function WeChat2Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="chats/[id]" options={{ headerShown: false, presentation: 'card' }} />
      <Stack.Screen name="contacts/[id]" options={{ headerShown: false, presentation: 'card' }} />
      <Stack.Screen name="discover/moments" options={{ headerShown: false, presentation: 'card' }} />
    </Stack>
  );
}
