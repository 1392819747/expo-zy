import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/**
 * 图标展示组件
 * 展示所有已生成的iOS应用图标
 */
export default function IconShowcase() {
  // 图标配置
  const icons = [
    { name: 'Safari', filename: 'safari.png', color: '#007AFF' },
    { name: '邮件', filename: 'mail.png', color: '#FF3B30' },
    { name: '日历', filename: 'calendar.png', color: '#FF9500' },
    { name: '电话', filename: 'phone.png', color: '#34C759' },
    { name: '相机', filename: 'camera.png', color: '#5856D6' },
    { name: '照片', filename: 'photos.png', color: '#FF2D92' },
    { name: '音乐', filename: 'music.png', color: '#FF3B30' },
    { name: '地图', filename: 'maps.png', color: '#007AFF' },
    { name: '天气', filename: 'weather.png', color: '#FF9500' },
    { name: '时钟', filename: 'clock.png', color: '#5856D6' },
    { name: '计算器', filename: 'calculator.png', color: '#8E8E93' },
    { name: '指南针', filename: 'compass.png', color: '#34C759' },
    { name: '设置', filename: 'settings.png', color: '#8E8E93' },
    { name: 'App Store', filename: 'app-store.png', color: '#007AFF' },
    { name: '微信', filename: 'wechat.png', color: '#07C160' },
    { name: 'QQ', filename: 'qq.png', color: '#12B7F5' },
    { name: '支付宝', filename: 'alipay.png', color: '#1677FF' },
    { name: '淘宝', filename: 'taobao.png', color: '#FF6900' },
    { name: '抖音', filename: 'douyin.png', color: '#000000' },
    { name: '微博', filename: 'weibo.png', color: '#E6162D' },
  ];

  const handleIconPress = (icon: { name: string; filename: string; color: string }) => {
    console.log(`点击了图标: ${icon.name}`);
    // 这里可以添加点击处理逻辑
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="apps" size={24} color="#007AFF" />
        <Text style={styles.title}>iOS应用图标展示</Text>
        <Text style={styles.subtitle}>本地生成的PNG图标</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.iconGrid}>
          {icons.map((icon, index) => (
            <TouchableOpacity
              key={index}
              style={styles.iconItem}
              onPress={() => handleIconPress(icon)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: icon.color }]}>
                <Image
                  source={require(`../../assets/images/${icon.filename}`)}
                  style={styles.iconImage}
                  contentFit="contain"
                />
              </View>
              <Text style={styles.iconName}>{icon.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          📱 共 {icons.length} 个iOS风格图标
        </Text>
        <Text style={styles.footerSubtext}>
          所有图标都是本地PNG文件，无需网络下载
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    justifyContent: 'space-between',
  },
  iconItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconImage: {
    width: 60,
    height: 60,
  },
  iconName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
