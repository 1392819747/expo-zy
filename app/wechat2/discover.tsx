import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWeChatTheme } from './useWeChatTheme';

type DiscoverItem = {
  id: string;
  title: string;
  icon: string;
  color: string;
};

const DISCOVER_ITEMS: DiscoverItem[] = [
  { id: 'moments', title: '朋友圈', icon: 'camera-outline', color: '#628CFC' },
  { id: 'channels', title: '视频号', icon: 'videocam-outline', color: '#FD9B39' },
  { id: 'live', title: '直播', icon: 'tv-outline', color: '#FD5B3F' },
  { id: 'scan', title: '扫一扫', icon: 'scan-outline', color: '#628CFC' },
  { id: 'shake', title: '摇一摇', icon: 'phone-portrait-outline', color: '#628CFC' },
  { id: 'nearby', title: '看一看', icon: 'eye-outline', color: '#628CFC' },
  { id: 'search', title: '搜一搜', icon: 'search-outline', color: '#FD9B39' },
  { id: 'shopping', title: '购物', icon: 'cart-outline', color: '#FD5B3F' },
  { id: 'game', title: '游戏', icon: 'game-controller-outline', color: '#628CFC' },
];

export default function WeChat2DiscoverScreen() {
  const theme = useWeChatTheme();

  const renderGroup = (items: DiscoverItem[]) => (
    <View style={[styles.group, { backgroundColor: theme.bg1 }]}>
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          <TouchableOpacity style={styles.item} activeOpacity={0.8}>
            <View style={styles.itemLeft}>
              <Ionicons name={item.icon as any} size={22} color={item.color} />
              <Text style={[styles.itemTitle, { color: theme.text5 }]}>{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.text3} />
          </TouchableOpacity>
          {index < items.length - 1 && (
            <View style={[styles.separator, { backgroundColor: theme.fillColor }]} />
          )}
        </React.Fragment>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg2 }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: theme.bg2 }]}>
        <Text style={[styles.headerTitle, { color: theme.text5 }]}>发现</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {renderGroup(DISCOVER_ITEMS.slice(0, 2))}
        {renderGroup(DISCOVER_ITEMS.slice(2, 5))}
        {renderGroup(DISCOVER_ITEMS.slice(5, 7))}
        {renderGroup(DISCOVER_ITEMS.slice(7))}
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
    paddingVertical: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  group: {
    marginTop: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  itemTitle: {
    fontSize: 16,
  },
  separator: {
    height: 0.5,
    marginLeft: 54,
  },
});
