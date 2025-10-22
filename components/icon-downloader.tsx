import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';

interface AppInfo {
  bundleId: string;
  name: string;
  iconUrl?: string;
  localIconPath?: string;
}

interface IconDownloaderProps {
  onIconDownloaded?: (appInfo: AppInfo) => void;
}

/**
 * 应用图标下载器组件
 * 用于下载桌面应用的图标到本地存储
 */
export default function IconDownloader({ onIconDownloaded }: IconDownloaderProps) {
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloadedIcons, setDownloadedIcons] = useState<Set<string>>(new Set());

  // 模拟一些常见的应用信息
  const commonApps: AppInfo[] = [
    { bundleId: 'com.apple.mobilesafari', name: 'Safari' },
    { bundleId: 'com.apple.mobilemail', name: '邮件' },
    { bundleId: 'com.apple.mobilecal', name: '日历' },
    { bundleId: 'com.apple.mobilephone', name: '电话' },
    { bundleId: 'com.apple.mobilecamera', name: '相机' },
    { bundleId: 'com.apple.mobilephotos', name: '照片' },
    { bundleId: 'com.apple.mobilemusic', name: '音乐' },
    { bundleId: 'com.apple.mobilemaps', name: '地图' },
    { bundleId: 'com.apple.mobileweather', name: '天气' },
    { bundleId: 'com.apple.mobileclock', name: '时钟' },
    { bundleId: 'com.apple.mobilecalculator', name: '计算器' },
    { bundleId: 'com.apple.mobilecompass', name: '指南针' },
    { bundleId: 'com.apple.mobilemeasure', name: '测距仪' },
    { bundleId: 'com.apple.mobilevoice-memos', name: '语音备忘录' },
    { bundleId: 'com.apple.mobilewallet', name: '钱包' },
    { bundleId: 'com.apple.mobilehealth', name: '健康' },
    { bundleId: 'com.apple.mobilehome', name: '家庭' },
    { bundleId: 'com.apple.mobilecontrol-center', name: '控制中心' },
    { bundleId: 'com.apple.mobilesettings', name: '设置' },
    { bundleId: 'com.apple.mobileapp-store', name: 'App Store' },
  ];

  useEffect(() => {
    setApps(commonApps);
    loadDownloadedIcons();
  }, []);

  /**
   * 加载已下载的图标列表
   */
  const loadDownloadedIcons = async () => {
    try {
      const iconsDir = `${FileSystem.documentDirectory}app-icons/`;
      const dirInfo = await FileSystem.getInfoAsync(iconsDir);
      
      if (dirInfo.exists) {
        const files = await FileSystem.readDirectoryAsync(iconsDir);
        const downloadedSet = new Set(files.map(file => file.replace('.png', '')));
        setDownloadedIcons(downloadedSet);
      }
    } catch (error) {
      console.error('加载已下载图标失败:', error);
    }
  };

  /**
   * 生成应用图标的URL
   * 这里使用一个公开的图标API服务
   */
  const generateIconUrl = (bundleId: string): string => {
    // 使用icon.horse API服务获取应用图标
    return `https://icon.horse/icon/${bundleId}`;
  };

  /**
   * 下载单个应用图标
   */
  const downloadIcon = async (app: AppInfo) => {
    if (downloading) return;

    setDownloading(app.bundleId);
    
    try {
      // 创建图标存储目录
      const iconsDir = `${FileSystem.documentDirectory}app-icons/`;
      const dirInfo = await FileSystem.getInfoAsync(iconsDir);
      
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(iconsDir, { intermediates: true });
      }

      // 生成图标URL
      const iconUrl = generateIconUrl(app.bundleId);
      const localPath = `${iconsDir}${app.bundleId}.png`;

      // 下载图标
      const downloadResult = await FileSystem.downloadAsync(iconUrl, localPath);
      
      if (downloadResult.status === 200) {
        // 更新应用信息
        const updatedApp = {
          ...app,
          iconUrl,
          localIconPath: downloadResult.uri
        };

        // 更新已下载图标列表
        setDownloadedIcons(prev => new Set([...prev, app.bundleId]));
        
        // 通知父组件
        onIconDownloaded?.(updatedApp);
        
        Alert.alert('成功', `${app.name} 图标下载成功！`);
      } else {
        throw new Error(`下载失败，状态码: ${downloadResult.status}`);
      }
    } catch (error) {
      console.error('下载图标失败:', error);
      Alert.alert('错误', `下载 ${app.name} 图标失败: ${error.message}`);
    } finally {
      setDownloading(null);
    }
  };

  /**
   * 批量下载所有图标
   */
  const downloadAllIcons = async () => {
    const notDownloadedApps = apps.filter(app => !downloadedIcons.has(app.bundleId));
    
    if (notDownloadedApps.length === 0) {
      Alert.alert('提示', '所有图标都已下载完成！');
      return;
    }

    Alert.alert(
      '确认下载',
      `将下载 ${notDownloadedApps.length} 个应用图标，这可能需要一些时间。`,
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '确认', 
          onPress: async () => {
            for (const app of notDownloadedApps) {
              await downloadIcon(app);
              // 添加延迟避免请求过于频繁
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        }
      ]
    );
  };

  /**
   * 删除已下载的图标
   */
  const deleteIcon = async (app: AppInfo) => {
    try {
      const localPath = `${FileSystem.documentDirectory}app-icons/${app.bundleId}.png`;
      await FileSystem.deleteAsync(localPath);
      
      setDownloadedIcons(prev => {
        const newSet = new Set(prev);
        newSet.delete(app.bundleId);
        return newSet;
      });
      
      Alert.alert('成功', `${app.name} 图标已删除！`);
    } catch (error) {
      console.error('删除图标失败:', error);
      Alert.alert('错误', `删除 ${app.name} 图标失败: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>应用图标下载器</Text>
        <Text style={styles.subtitle}>下载桌面应用的图标到本地</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.downloadAllButton}
          onPress={downloadAllIcons}
          disabled={downloading !== null}
        >
          <Ionicons name="download-outline" size={20} color="white" />
          <Text style={styles.buttonText}>下载全部图标</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.appList}>
        {apps.map((app) => {
          const isDownloaded = downloadedIcons.has(app.bundleId);
          const isDownloading = downloading === app.bundleId;
          const localPath = `${FileSystem.documentDirectory}app-icons/${app.bundleId}.png`;

          return (
            <View key={app.bundleId} style={styles.appItem}>
              <View style={styles.appInfo}>
                <View style={styles.iconContainer}>
                  {isDownloaded ? (
                    <Image 
                      source={{ uri: localPath }} 
                      style={styles.appIcon}
                      defaultSource={require('../../assets/images/icon.png')}
                    />
                  ) : (
                    <View style={styles.placeholderIcon}>
                      <Ionicons name="apps-outline" size={24} color="#666" />
                    </View>
                  )}
                </View>
                
                <View style={styles.appDetails}>
                  <Text style={styles.appName}>{app.name}</Text>
                  <Text style={styles.bundleId}>{app.bundleId}</Text>
                </View>
              </View>

              <View style={styles.appActions}>
                {isDownloaded ? (
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => deleteIcon(app)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#ff4444" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={[
                      styles.downloadButton,
                      isDownloading && styles.downloadingButton
                    ]}
                    onPress={() => downloadIcon(app)}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <Ionicons name="hourglass-outline" size={16} color="#666" />
                    ) : (
                      <Ionicons name="download-outline" size={16} color="#007AFF" />
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.stats}>
        <Text style={styles.statsText}>
          已下载: {downloadedIcons.size} / {apps.length}
        </Text>
      </View>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  downloadAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  appList: {
    flex: 1,
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  appIcon: {
    width: 48,
    height: 48,
  },
  placeholderIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appDetails: {
    flex: 1,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  bundleId: {
    fontSize: 12,
    color: '#666',
  },
  appActions: {
    marginLeft: 12,
  },
  downloadButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f8ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadingButton: {
    backgroundColor: '#f0f0f0',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stats: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 14,
    color: '#666',
  },
});
