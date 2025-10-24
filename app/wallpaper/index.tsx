import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeColors } from '../../hooks/useThemeColors';

const STORAGE_KEY = 'desktop_wallpaper';
const CUSTOM_WALLPAPERS_KEY = 'custom_wallpapers';

const DEFAULT_WALLPAPERS = [
  { id: '1', uri: 'https://picsum.photos/seed/wallpaper1/1080/1920', name: '默认壁纸 1' },
  { id: '2', uri: 'https://picsum.photos/seed/wallpaper2/1080/1920', name: '默认壁纸 2' },
  { id: '3', uri: 'https://picsum.photos/seed/wallpaper3/1080/1920', name: '默认壁纸 3' },
  { id: '4', uri: 'https://picsum.photos/seed/wallpaper4/1080/1920', name: '默认壁纸 4' },
  { id: '5', uri: 'https://picsum.photos/seed/wallpaper5/1080/1920', name: '默认壁纸 5' },
  { id: '6', uri: 'https://picsum.photos/seed/wallpaper6/1080/1920', name: '默认壁纸 6' },
];

export default function WallpaperScreen() {
  const { colors, isDark } = useThemeColors();
  const [selectedWallpaper, setSelectedWallpaper] = useState<string | null>(null);
  const [customWallpapers, setCustomWallpapers] = useState<{ id: string; uri: string; name: string }[]>([]);

  // 加载已保存的壁纸和自定义壁纸列表
  useEffect(() => {
    loadSavedWallpaper();
    loadCustomWallpapers();
  }, []);

  const loadSavedWallpaper = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSelectedWallpaper(saved);
      }
    } catch (error) {
      console.error('加载壁纸失败:', error);
    }
  };

  const loadCustomWallpapers = async () => {
    try {
      const saved = await AsyncStorage.getItem(CUSTOM_WALLPAPERS_KEY);
      if (saved) {
        setCustomWallpapers(JSON.parse(saved));
      }
    } catch (error) {
      console.error('加载自定义壁纸失败:', error);
    }
  };

  const saveCustomWallpapers = async (wallpapers: { id: string; uri: string; name: string }[]) => {
    try {
      await AsyncStorage.setItem(CUSTOM_WALLPAPERS_KEY, JSON.stringify(wallpapers));
    } catch (error) {
      console.error('保存自定义壁纸失败:', error);
    }
  };

  const pickImage = async () => {
    // 请求权限
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('需要权限', '请允许访问相册以选择壁纸');
      return;
    }

    // 选择图片
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const newWallpaper = {
        id: `custom-${Date.now()}`,
        uri: result.assets[0].uri,
        name: `自定义壁纸 ${customWallpapers.length + 1}`,
      };
      const updatedWallpapers = [...customWallpapers, newWallpaper];
      setCustomWallpapers(updatedWallpapers);
      await saveCustomWallpapers(updatedWallpapers);
    }
  };

  const selectWallpaper = async (uri: string) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, uri);
      setSelectedWallpaper(uri);
      Alert.alert('成功', '壁纸已设置，返回桌面查看效果');
    } catch (error) {
      Alert.alert('错误', '设置壁纸失败');
    }
  };

  const deleteCustomWallpaper = async (wallpaper: { id: string; uri: string; name: string }) => {
    Alert.alert(
      '删除壁纸',
      `确定要删除"${wallpaper.name}"吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            const updatedWallpapers = customWallpapers.filter(w => w.id !== wallpaper.id);
            setCustomWallpapers(updatedWallpapers);
            await saveCustomWallpapers(updatedWallpapers);
            
            // 如果删除的是当前壁纸，清除选择
            if (selectedWallpaper === wallpaper.uri) {
              setSelectedWallpaper(null);
              await AsyncStorage.removeItem(STORAGE_KEY);
            }
          },
        },
      ]
    );
  };

  const allWallpapers = [...DEFAULT_WALLPAPERS, ...customWallpapers];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* 顶部导航栏 */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>壁纸</Text>
        <TouchableOpacity style={styles.addButton} onPress={pickImage}>
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* 壁纸网格 */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.grid}>
          {allWallpapers.map((wallpaper) => {
            const isCustom = wallpaper.id.startsWith('custom-');
            return (
              <View
                key={wallpaper.id}
                style={[
                  styles.wallpaperItem,
                  selectedWallpaper === wallpaper.uri && styles.selectedWallpaperItem,
                ]}
              >
                <TouchableOpacity
                  style={styles.wallpaperTouchable}
                  onPress={() => selectWallpaper(wallpaper.uri)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: wallpaper.uri }}
                    style={styles.wallpaperImage}
                    resizeMode="cover"
                  />
                  {selectedWallpaper === wallpaper.uri && (
                    <View style={styles.selectedOverlay}>
                      <View style={styles.checkCircle}>
                        <Ionicons name="checkmark" size={20} color="#fff" />
                      </View>
                    </View>
                  )}
                  <Text style={styles.wallpaperName} numberOfLines={1}>
                    {wallpaper.name}
                  </Text>
                </TouchableOpacity>
                
                {/* 自定义壁纸显示删除按钮 */}
                {isCustom && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteCustomWallpaper(wallpaper)}
                  >
                    <Ionicons name="close-circle" size={24} color="#ff4444" />
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  wallpaperItem: {
    width: '47%',
    aspectRatio: 9 / 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedWallpaperItem: {
    borderColor: '#07C160',
  },
  wallpaperTouchable: {
    width: '100%',
    height: '100%',
  },
  wallpaperImage: {
    width: '100%',
    height: '100%',
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(7, 193, 96, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#07C160',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wallpaperName: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    fontSize: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
  },
});
