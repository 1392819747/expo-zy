import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type WallpaperIconProps = {
  size: number;
};

export default function WallpaperIcon({ size }: WallpaperIconProps) {
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.225, overflow: 'hidden' }}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name="image" size={size * 0.5} color="#fff" />
      </LinearGradient>
    </View>
  );
}
