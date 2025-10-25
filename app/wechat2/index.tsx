import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks/useThemeColors';

const CHAT_LIST = [
  {
    id: '1',
    name: '文件传输助手',
    message: '可以在这里发送文件给自己',
    time: '上午 9:15',
    unread: 0,
    avatar: require('../../assets/images/wechat/avatar-assistant.png'),
  },
  {
    id: '2',
    name: '张华',
    message: '明天记得开会',
    time: '昨天',
    unread: 2,
    avatar: require('../../assets/images/wechat/avatar-man.png'),
  },
  {
    id: '3',
    name: '小美',
    message: '晚饭吃什么？',
    time: '星期三',
    unread: 0,
    avatar: require('../../assets/images/wechat/avatar-girl.png'),
  },
  {
    id: '4',
    name: '微信团队',
    message: '欢迎体验全新的 WeChat 2',
    time: '星期二',
    unread: 1,
    avatar: require('../../assets/images/wechat/avatar-wechat.png'),
  },
];

export default function WeChat2ChatsScreen() {
  const { colors } = useThemeColors();

  const headerStyle = useMemo(
    () => ({
      backgroundColor: colors.background,
      borderBottomColor: colors.border,
    }),
    [colors.background, colors.border]
  );

  const renderItem = ({ item }: { item: (typeof CHAT_LIST)[number] }) => {
    return (
      <TouchableOpacity
        style={[styles.chatItem, { borderBottomColor: colors.border }]}
        activeOpacity={0.8}
      >
        <Image source={item.avatar} style={styles.chatAvatar} />
        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={[styles.chatName, { color: colors.text }]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[styles.chatTime, { color: colors.textSecondary }]}>{item.time}</Text>
          </View>
          <View style={styles.chatFooter}>
            <Text style={[styles.chatMessage, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.message}
            </Text>
            {item.unread > 0 ? (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{item.unread}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, headerStyle]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>WeChat 2</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="search" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="add" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.searchBar, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
        <Ionicons name="search" size={18} color={colors.textSecondary} />
        <TextInput
          placeholder="搜索"
          placeholderTextColor={colors.textSecondary}
          style={[styles.searchInput, { color: colors.text }]}
        />
      </View>

      <FlatList
        data={CHAT_LIST}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 36,
  },
  listContent: {
    paddingBottom: 16,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  chatAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  chatContent: {
    flex: 1,
    gap: 6,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  chatTime: {
    fontSize: 12,
  },
  chatFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  chatMessage: {
    flex: 1,
    fontSize: 14,
  },
  unreadBadge: {
    backgroundColor: '#FF3B30',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});
