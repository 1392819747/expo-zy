import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { Ionicons } from '@expo/vector-icons';

interface DownloadedIcon {
  bundleId: string;
  name: string;
  localPath: string;
  downloadDate: string;
}

interface IconGalleryProps {
  onIconSelect?: (icon: DownloadedIcon) => void;
  showDeleteOption?: boolean;
}

/**
 * 图标展示组件
 * 用于展示已下载的应用图标
 */
export default function IconGallery({ onIconSelect, showDeleteOption = true }: IconGalleryProps) {
  const [downloadedIcons, setDownloadedIcons] = useState<DownloadedIcon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDownloadedIcons();
  }, []);

  /**
   * 加载已下载的图标列表
   */
  const loadDownloadedIcons = async () => {
    try {
      const iconsDir = `${FileSystem.documentDirectory as string}app-icons/`;
      const dirInfo = await FileSystem.getInfoAsync(iconsDir);
      
      if (!dirInfo.exists) {
        setDownloadedIcons([]);
        setLoading(false);
        return;
      }

      const files = await FileSystem.readDirectoryAsync(iconsDir);
      const iconFiles = files.filter(file => file.endsWith('.png'));
      
      const icons: DownloadedIcon[] = [];
      
      for (const file of iconFiles) {
        const bundleId = file.replace('.png', '');
        const filePath = `${iconsDir}${file}`;
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        
        if (fileInfo.exists) {
          icons.push({
            bundleId,
            name: getAppName(bundleId),
            localPath: filePath,
            downloadDate: new Date(fileInfo.modificationTime * 1000).toLocaleDateString()
          });
        }
      }
      
      setDownloadedIcons(icons);
    } catch (error) {
      console.error('加载图标失败:', error);
      Alert.alert('错误', '加载图标失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 根据bundleId获取应用名称
   */
  const getAppName = (bundleId: string): string => {
    const appNames: { [key: string]: string } = {
      'com.apple.mobilesafari': 'Safari',
      'com.apple.mobilemail': '邮件',
      'com.apple.mobilecal': '日历',
      'com.apple.mobilephone': '电话',
      'com.apple.mobilecamera': '相机',
      'com.apple.mobilephotos': '照片',
      'com.apple.mobilemusic': '音乐',
      'com.apple.mobilemaps': '地图',
      'com.apple.mobileweather': '天气',
      'com.apple.mobileclock': '时钟',
      'com.apple.mobilecalculator': '计算器',
      'com.apple.mobilecompass': '指南针',
      'com.apple.mobilemeasure': '测距仪',
      'com.apple.mobilevoice-memos': '语音备忘录',
      'com.apple.mobilewallet': '钱包',
      'com.apple.mobilehealth': '健康',
      'com.apple.mobilehome': '家庭',
      'com.apple.mobilecontrol-center': '控制中心',
      'com.apple.mobilesettings': '设置',
      'com.apple.mobileapp-store': 'App Store',
    };
    
    return appNames[bundleId] || bundleId;
  };

  /**
   * 删除图标
   */
  const deleteIcon = async (icon: DownloadedIcon) => {
    Alert.alert(
      '确认删除',
      `确定要删除 ${icon.name} 的图标吗？`,
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '删除', 
          style: 'destructive',
          onPress: async () => {
            try {
              await FileSystem.deleteAsync(icon.localPath);
              await loadDownloadedIcons(); // 重新加载列表
              Alert.alert('成功', '图标已删除');
            } catch (error) {
              console.error('删除图标失败:', error);
              Alert.alert('错误', '删除图标失败');
            }
          }
        }
      ]
    );
  };

  /**
   * 选择图标
   */
  const selectIcon = (icon: DownloadedIcon) => {
    onIconSelect?.(icon);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  if (downloadedIcons.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="images-outline" size={64} color="#ccc" />
        <Text style={styles.emptyTitle}>暂无下载的图标</Text>
        <Text style={styles.emptySubtitle}>请先下载一些应用图标</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>已下载的图标</Text>
        <Text style={styles.subtitle}>共 {downloadedIcons.length} 个图标</Text>
      </View>

      <ScrollView style={styles.iconGrid}>
        <View style={styles.gridContainer}>
          {downloadedIcons.map((icon) => (
            <TouchableOpacity
              key={icon.bundleId}
              style={styles.iconItem}
              onPress={() => selectIcon(icon)}
            >
              <View style={styles.iconWrapper}>
                <Image 
                  source={{ uri: icon.localPath }} 
                  style={styles.iconImage}
                  defaultSource={require('../../assets/images/icon.png')}
                />
                {showDeleteOption && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteIcon(icon)}
                  >
                    <Ionicons name="close-circle" size={20} color="#ff4444" />
                  </TouchableOpacity>
                )}
              </View>
              
              <Text style={styles.iconName} numberOfLines={1}>
                {icon.name}
              </Text>
              
              <Text style={styles.iconDate} numberOfLines={1}>
                {icon.downloadDate}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  iconGrid: {
    flex: 1,
    padding: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  iconItem: {
    width: '30%',
    marginBottom: 20,
    alignItems: 'center',
  },
  iconWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  iconImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  deleteButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 2,
  },
  iconDate: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
