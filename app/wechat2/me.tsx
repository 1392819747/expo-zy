import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks/useThemeColors';

const MENU_ITEMS = [
  {
    id: 'services',
    title: '服务',
    icon: 'grid-outline',
    showBadge: false,
  },
  {
    id: 'favorites',
    title: '收藏',
    icon: 'star-outline',
    showBadge: false,
  },
  {
    id: 'moments',
    title: '朋友圈',
    icon: 'camera-outline',
    showBadge: false,
  },
  {
    id: 'cards',
    title: '卡包',
    icon: 'card-outline',
    showBadge: false,
  },
  {
    id: 'stickers',
    title: '表情',
    icon: 'happy-outline',
    showBadge: false,
  },
  {
    id: 'settings',
    title: '设置',
    icon: 'settings-outline',
    showBadge: false,
  },
];

export default function WeChat2MeScreen() {
  const { colors } = useThemeColors();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.backgroundSecondary }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>我</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <TouchableOpacity
          style={[styles.profileCard, { backgroundColor: colors.background }]}
          activeOpacity={0.8}
        >
          <View style={styles.profileInfo}>
            <Image
              source={require('../../assets/images/wechat/avatar-wechat.png')}
              style={styles.profileAvatar}
            />
            <View style={styles.profileText}>
              <Text style={[styles.profileName, { color: colors.text }]}>微信用户</Text>
              <View style={styles.profileMeta}>
                <Text style={[styles.profileId, { color: colors.textSecondary }]}>微信号：wechat2_demo</Text>
              </View>
            </View>
          </View>
          <Ionicons name="qr-code-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Menu Items */}
        <View style={[styles.menuContainer, { backgroundColor: colors.background }]}>
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index !== MENU_ITEMS.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
              ]}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name={item.icon as any} size={22} color={colors.text} />
                <Text style={[styles.menuItemTitle, { color: colors.text }]}>{item.title}</Text>
              </View>
              <View style={styles.menuItemRight}>
                {item.showBadge && <View style={styles.badge} />}
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomSpace} />
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
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 16,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 6,
  },
  profileText: {
    flex: 1,
    gap: 6,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
  },
  profileMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  profileId: {
    fontSize: 14,
  },
  menuContainer: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemTitle: {
    fontSize: 16,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  bottomSpace: {
    height: 32,
  },
});
