import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useWeChatTheme } from '../useWeChatTheme';

const MENU_GROUPS = [
  [
    { id: 'services', title: '服务', icon: 'grid-outline', badge: false },
    { id: 'favorites', title: '收藏', icon: 'star-outline', badge: false },
    { id: 'moments', title: '朋友圈', icon: 'camera-outline', badge: true },
  ],
  [
    { id: 'cards', title: '卡包', icon: 'card-outline', badge: false },
    { id: 'stickers', title: '表情', icon: 'happy-outline', badge: false },
  ],
  [
    { id: 'settings', title: '设置', icon: 'settings-outline', badge: false },
  ],
];

export default function WeChat2MeScreen() {
  const theme = useWeChatTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg2 }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={[styles.profileCard, { backgroundColor: theme.bg1 }]}>
          <Image
            source={require('../../../assets/images/wechat/avatar-wechat.png')}
            style={styles.profileAvatar}
          />
          <View style={styles.profileInfo}>
            <View style={styles.profileHeader}>
              <Text style={[styles.profileName, { color: theme.text5 }]}>微信用户</Text>
              <Ionicons name="qr-code-outline" size={22} color={theme.text3} />
            </View>
            <View style={styles.profileMeta}>
              <Text style={[styles.profileId, { color: theme.text3 }]}>微信号：wechat2_demo</Text>
              <Ionicons name="chevron-forward" size={18} color={theme.text3} />
            </View>
            <Text style={[styles.profileStatus, { color: theme.text3 }]}>状态：在线</Text>
          </View>
        </View>

        {MENU_GROUPS.map((group, groupIndex) => (
          <View key={groupIndex} style={[styles.menuGroup, { backgroundColor: theme.bg1 }]}> 
            {group.map((item, index) => (
              <React.Fragment key={item.id}>
                <TouchableOpacity style={styles.menuItem} activeOpacity={0.8}>
                  <View style={styles.menuItemLeft}>
                    <Ionicons name={item.icon as any} size={22} color={theme.text5} />
                    <Text style={[styles.menuItemTitle, { color: theme.text5 }]}>{item.title}</Text>
                  </View>
                  <View style={styles.menuItemRight}>
                    {item.badge && <View style={[styles.badge, { backgroundColor: theme.danger5 }]} />}
                    <Ionicons name="chevron-forward" size={18} color={theme.text3} />
                  </View>
                </TouchableOpacity>
                {index < group.length - 1 && (
                  <View style={[styles.separator, { backgroundColor: theme.fillColor }]} />
                )}
              </React.Fragment>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 6,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
    gap: 6,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
  },
  profileMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileId: {
    fontSize: 14,
  },
  profileStatus: {
    fontSize: 14,
  },
  menuGroup: {
    marginTop: 12,
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
    gap: 16,
  },
  menuItemTitle: {
    fontSize: 16,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  separator: {
    height: 0.5,
    marginLeft: 54,
  },
});
