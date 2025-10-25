import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks/useThemeColors';

const DISCOVER_ITEMS = [
  {
    id: 'moments',
    title: '朋友圈',
    icon: require('../../assets/images/wechat/avatar-girl.png'),
    iconType: 'image' as const,
  },
  {
    id: 'scan',
    title: '扫一扫',
    icon: 'scan-outline',
    iconType: 'icon' as const,
  },
  {
    id: 'shake',
    title: '摇一摇',
    icon: 'radio-outline',
    iconType: 'icon' as const,
  },
  {
    id: 'nearby',
    title: '附近的人',
    icon: 'location-outline',
    iconType: 'icon' as const,
  },
  {
    id: 'shopping',
    title: '购物',
    icon: 'bag-handle-outline',
    iconType: 'icon' as const,
  },
  {
    id: 'game',
    title: '游戏',
    icon: 'game-controller-outline',
    iconType: 'icon' as const,
  },
];

export default function WeChat2DiscoverScreen() {
  const { colors } = useThemeColors();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>发现</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {DISCOVER_ITEMS.map(item => (
          <TouchableOpacity
            key={item.id}
            style={[styles.item, { borderBottomColor: colors.border }]}
            activeOpacity={0.7}
          >
            {item.iconType === 'image' ? (
              <Image source={item.icon as any} style={styles.itemImage} />
            ) : (
              <View style={[styles.itemIconContainer, { backgroundColor: colors.backgroundSecondary }]}>
                <Ionicons name={item.icon as any} size={22} color={colors.primary || '#07C160'} />
              </View>
            )}
            <Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  content: {
    paddingVertical: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
  },
  itemIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: {
    flex: 1,
    fontSize: 16,
  },
});
