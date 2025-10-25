import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useWeChatTheme } from '../useWeChatTheme';

type ChatItem = {
  id: string;
  name: string;
  message: string;
  time: string;
  unread: number;
  avatar: any;
  isGroup?: boolean;
};

const MOCK_CHATS: ChatItem[] = [
  {
    id: '1',
    name: '文件传输助手',
    message: '[文件]',
    time: '上午 9:15',
    unread: 0,
    avatar: require('../../../../assets/images/wechat/avatar-assistant.png'),
  },
  {
    id: '2',
    name: '张华',
    message: '明天记得开会',
    time: '昨天',
    unread: 2,
    avatar: require('../../../../assets/images/wechat/avatar-man.png'),
  },
  {
    id: '3',
    name: '小美',
    message: '晚饭吃什么？',
    time: '星期三',
    unread: 0,
    avatar: require('../../../../assets/images/wechat/avatar-girl.png'),
  },
  {
    id: '4',
    name: '微信团队',
    message: '欢迎体验全新的 WeChat 2',
    time: '星期二',
    unread: 1,
    avatar: require('../../../../assets/images/wechat/avatar-wechat.png'),
  },
  {
    id: '5',
    name: '产品设计群',
    message: '李明: 今天的设计稿已发送',
    time: '星期一',
    unread: 0,
    avatar: require('../../../../assets/images/wechat/avatar-man.png'),
    isGroup: true,
  },
];

export default function WeChat2ChatsScreen() {
  const theme = useWeChatTheme();
  const router = useRouter();

  const renderChatItem = ({ item }: { item: ChatItem }) => {
    return (
      <TouchableOpacity
        style={[styles.chatItem, { backgroundColor: theme.bg1 }]}
        activeOpacity={0.8}
        onPress={() => router.push(`/wechat2/chats/${item.id}?name=${encodeURIComponent(item.name)}`)}
      >
        <Image source={item.avatar} style={[styles.avatar, item.isGroup && styles.groupAvatar]} />
        
        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={[styles.chatName, { color: theme.text5 }]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[styles.chatTime, { color: theme.text3 }]}>{item.time}</Text>
          </View>
          
          <View style={styles.chatFooter}>
            <Text style={[styles.chatMessage, { color: theme.text3 }]} numberOfLines={1}>
              {item.message}
            </Text>
            {item.unread > 0 && (
              <View style={[styles.unreadBadge, { backgroundColor: theme.danger5 }]}>
                <Text style={styles.unreadText}>{item.unread}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg2 }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.bg2 }]}>
        <Text style={[styles.headerTitle, { color: theme.text5 }]}>微信</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="search" size={22} color={theme.text5} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="add-circle-outline" size={22} color={theme.text5} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat List */}
      <FlatList
        data={MOCK_CHATS}
        keyExtractor={item => item.id}
        renderItem={renderChatItem}
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: theme.fillColor }]} />
        )}
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
    paddingVertical: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 12,
  },
  groupAvatar: {
    borderRadius: 8,
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '400',
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
  },
  chatMessage: {
    fontSize: 14,
    flex: 1,
    marginRight: 12,
  },
  unreadBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  separator: {
    height: 0.5,
    marginLeft: 78,
  },
});
