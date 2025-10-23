import React from 'react';
import { View, Text } from 'react-native';

// NativeWind 示例组件
export default function NativeWindExample() {
  return (
    <View className="flex-1 items-center justify-center bg-gray-100">
      <View className="bg-blue-500 rounded-lg p-4 shadow-lg">
        <Text className="text-white text-xl font-bold mb-2">NativeWind 示例</Text>
        <Text className="text-white text-base">
          这是一个使用 Tailwind CSS 样式的 React Native 组件
        </Text>
      </View>
      
      <View className="mt-4 flex-row space-x-2">
        <View className="bg-red-500 w-16 h-16 rounded-full" />
        <View className="bg-green-500 w-16 h-16 rounded-full" />
        <View className="bg-purple-500 w-16 h-16 rounded-full" />
      </View>
    </View>
  );
}