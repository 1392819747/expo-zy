import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function DiscoverScreen() {
  const { colors, isDark } = useThemeColors();
  const navigation = useNavigation();
  const router = useRouter();

  useEffect(() => {
    navigation.setOptions({
      title: '发现',
      headerStyle: {
        backgroundColor: colors.background,
      },
      headerTintColor: colors.text,
      headerTitleStyle: {
        color: colors.text,
      },
      headerShadowVisible: false,
    });
  }, [colors, navigation]);

  // 发现页面功能项
  const discoverFeatures = [
    {
      id: 'moments',
      title: '朋友圈',
      icon: 'images',
      iconColor: '#F6AD55',
      iconBgColor: '#FFFAF0',
      route: '/wechat/discover/moments'
    },
    {
      id: 'scan',
      title: '扫一扫',
      icon: 'scan',
      iconColor: '#4FD1C7',
      iconBgColor: '#F0FFF4'
    },
    {
      id: 'shake',
      title: '摇一摇',
      icon: 'reload',
      iconColor: '#9F7AEA',
      iconBgColor: '#F3E8FF'
    },
    {
      id: 'nearby',
      title: '看一看',
      icon: 'eye',
      iconColor: '#ED64A6',
      iconBgColor: '#FEE7F0'
    },
    {
      id: 'nearby_people',
      title: '搜一搜',
      icon: 'search',
      iconColor: '#63B3ED',
      iconBgColor: '#EBF8FF'
    },
    {
      id: 'games',
      title: '游戏',
      icon: 'game-controller',
      iconColor: '#805AD5',
      iconBgColor: '#F3E8FF'
    },
    {
      id: 'mini_programs',
      title: '小程序',
      icon: 'apps',
      iconColor: '#38B2AC',
      iconBgColor: '#F0FDFA'
    }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView}>
        {discoverFeatures.map((feature) => (
          <TouchableOpacity 
            key={feature.id}
            style={[styles.featureItem, { 
              backgroundColor: colors.backgroundSecondary, 
              borderBottomColor: colors.borderLight 
            }]}
            onPress={() => {
              if (feature.route) {
                router.push(feature.route as any);
              }
            }}
          >
            <View style={[styles.featureIcon, { backgroundColor: feature.iconBgColor }]}>
              <Ionicons name={feature.icon as any} size={24} color={feature.iconColor} />
            </View>
            <Text style={[styles.featureTitle, { color: colors.text }]}>{feature.title}</Text>
            <View style={styles.featureRight}>
              <Ionicons name="chevron-forward" size={24} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>
        ))}
        
        {/* 更多服务区域 */}
        <View style={[styles.section, { backgroundColor: colors.backgroundSecondary, marginTop: 12 }]}>
          <TouchableOpacity 
            style={[styles.featureItem, { borderBottomColor: colors.borderLight }]}
          >
            <View style={[styles.featureIcon, { backgroundColor: '#E6F4FF' }]}>
              <Ionicons name="storefront" size={24} color="#4285F4" />
            </View>
            <Text style={[styles.featureTitle, { color: colors.text }]}>购物</Text>
            <View style={styles.featureRight}>
              <Ionicons name="chevron-forward" size={24} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.featureItem, { borderBottomColor: colors.borderLight }]}
          >
            <View style={[styles.featureIcon, { backgroundColor: '#F0F8FF' }]}>
              <Ionicons name="newspaper" size={24} color="#EA4335" />
            </View>
            <Text style={[styles.featureTitle, { color: colors.text }]}>直播与视频</Text>
            <View style={styles.featureRight}>
              <Ionicons name="chevron-forward" size={24} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5', // 微信风格的浅灰色背景
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#f5f5f5', // 与容器背景一致
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    backgroundColor: '#ffffff', // 功能项保持白色背景
    // 添加微妙的阴影效果
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    // 添加微妙的阴影效果
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  featureTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500', // 更粗的字体
    color: '#333', // 明确指定颜色
  },
  featureRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  section: {
    marginTop: 12,
    backgroundColor: '#f5f5f5', // 与整体背景一致
  },
});