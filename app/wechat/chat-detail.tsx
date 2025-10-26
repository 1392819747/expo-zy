import { Ionicons } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { Edge } from 'react-native-safe-area-context';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { useThemeColors } from '../../hooks/useThemeColors';
import { mockContacts } from '../../models/contacts';

interface Message {
  id: string;
  sender: 'me' | 'other' | 'system';
  text: string;
  time?: string;
}

const chatHistories: Record<string, Message[]> = {
  '1': [
    { id: 'm1', sender: 'system', text: '昨天 下午 5:20' },
    { id: 'm2', sender: 'other', text: '明天的会议确认了吗？', time: '17:20' },
    { id: 'm3', sender: 'me', text: '已经安排好了，下午三点。', time: '17:25' },
    { id: 'm4', sender: 'other', text: '好的，谢谢！', time: '17:26' },
  ],
  '2': [
    { id: 'm1', sender: 'system', text: '今天 上午 9:15' },
    { id: 'm2', sender: 'other', text: '项目进展如何？', time: '09:15' },
    { id: 'm3', sender: 'me', text: '已经完成初版，待你审核。', time: '09:20' },
  ],
  '3': [
    { id: 'm1', sender: 'system', text: '星期三 下午 2:00' },
    { id: 'm2', sender: 'other', text: '请查收合同。', time: '14:00' },
    { id: 'm3', sender: 'me', text: '收到，我稍后盖章回传。', time: '14:05' },
  ],
  assistant: [
    { id: 'm1', sender: 'system', text: '今天 上午 10:00' },
    { id: 'm2', sender: 'other', text: '欢迎使用文件传输助手。', time: '10:00' },
    { id: 'm3', sender: 'me', text: '你好！', time: '10:01' },
  ],
  group: [
    { id: 'm1', sender: 'system', text: '星期二 上午 11:00' },
    { id: 'm2', sender: 'other', text: '下午例会别忘了。', time: '11:00' },
    { id: 'm3', sender: 'me', text: '收到，感谢提醒。', time: '11:02' },
  ],
  notifications: [
    { id: 'm1', sender: 'system', text: '星期一 上午 8:00' },
    { id: 'm2', sender: 'other', text: '系统维护通知：今晚23:00-24:00。', time: '08:00' },
  ],
};

const defaultHistory: Message[] = [
  { id: 'm1', sender: 'system', text: '暂无历史消息' },
];

export default function ChatDetailScreen() {
  const { colors, isDark } = useThemeColors();
  const { id, contactId, contactName, avatar } = useLocalSearchParams<{ 
    id?: string | string[], 
    contactId?: string | string[],
    contactName?: string | string[],
    avatar?: string | string[]
  }>();
  const router = useRouter();
  const [draftMessage, setDraftMessage] = useState('');
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const isIOS26OrAbove = Platform.OS === 'ios' && Number.parseInt(String(Platform.Version), 10) >= 26;
  const hasNativeHeader = Platform.OS === 'android' || isIOS26OrAbove;
  const safeAreaEdges: Edge[] = hasNativeHeader
    ? ['left', 'right', 'bottom']
    : ['top', 'left', 'right', 'bottom'];
  const chatId = useMemo(() => {
    // 优先使用contactId参数，其次是id参数
    let idToUse = '';
    if (contactId) {
      idToUse = Array.isArray(contactId) ? contactId[0] : contactId;
    } else if (id) {
      idToUse = Array.isArray(id) ? id[0] : id;
    }
    return idToUse;
  }, [id, contactId]);
  const [conversation, setConversation] = useState<Message[]>(chatHistories[chatId] ?? defaultHistory);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);

  const contact = useMemo(() => {
    // 如果有传入的联系人信息，优先使用
    if (chatId && contactName) {
      return {
        id: chatId,
        name: Array.isArray(contactName) ? contactName[0] : contactName,
        avatar: avatar ? (Array.isArray(avatar) ? avatar[0] : avatar) : undefined,
      };
    }
    // 否则从mockContacts中查找
    return mockContacts.find((item) => item.id === chatId);
  }, [chatId, contactName, avatar]);

  const conversationTitle = useMemo(() => {
    if (contact) {
      return contact.name;
    }

    switch (chatId) {
      case 'assistant':
        return '文件传输助手';
      case 'group':
        return '团队群';
      case 'notifications':
        return '通知';
      default:
        return '聊天';
    }
  }, [contact, chatId]);

  const handleEditContact = () => {
    // 如果有联系人ID，导航到联系人详情页
    if (chatId && contact) {
      router.push(`/wechat/contact-detail?id=${chatId}`);
    }
  };

  useEffect(() => {
    // 在Expo Router中，我们不需要手动设置header选项
    // 这些选项应该在_layout.tsx中配置
  }, [conversationTitle, colors, contact, handleEditContact]);

  useEffect(() => {
    setConversation(chatHistories[chatId] ?? defaultHistory);
  }, [chatId]);

  const handleMessageLongPress = (message: Message) => {
    if (message.sender === 'system') {
      return;
    }
    setSelectedMessage(message);
    setActionSheetVisible(true);
  };

  const closeActionSheet = () => {
    setActionSheetVisible(false);
    setSelectedMessage(null);
  };

  const handleCopyMessage = async () => {
    if (!selectedMessage) return;
    await Clipboard.setStringAsync(selectedMessage.text);
    closeActionSheet();
    Alert.alert('已复制', '消息内容已复制到剪贴板');
  };

  const handleRecallMessage = () => {
    if (!selectedMessage) return;
    if (selectedMessage.sender !== 'me') {
      Alert.alert('提示', '只能撤回自己发送的消息');
      return;
    }
    setConversation(prev => prev.filter(message => message.id !== selectedMessage.id));
    closeActionSheet();
    Alert.alert('撤回成功', '消息已撤回');
  };

  const handleCollectMessage = () => {
    if (!selectedMessage) return;
    closeActionSheet();
    Alert.alert('收藏成功', '消息已收藏，可在“收藏”中查看');
  };

  const handleQuoteMessage = () => {
    if (!selectedMessage) return;
    setDraftMessage(prev => {
      const quoteText = `> ${selectedMessage.text}`;
      return prev ? `${prev}\n${quoteText}\n` : `${quoteText}\n`;
    });
    closeActionSheet();
  };

  const handleMultiSelect = () => {
    closeActionSheet();
    Alert.alert('提示', '多选功能正在开发中，敬请期待');
  };

  const actionItems = [
    { id: 'copy', label: '复制', onPress: handleCopyMessage, enabled: !!selectedMessage },
    { id: 'recall', label: '撤回', onPress: handleRecallMessage, enabled: selectedMessage?.sender === 'me' },
    { id: 'multi', label: '多选', onPress: handleMultiSelect, enabled: !!selectedMessage },
    { id: 'favorite', label: '收藏', onPress: handleCollectMessage, enabled: !!selectedMessage },
    { id: 'quote', label: '引用', onPress: handleQuoteMessage, enabled: !!selectedMessage },
  ];

  const renderMessageItem = ({ item }: { item: Message }) => {
    if (item.sender === 'system') {
      return (
        <View style={styles.systemMessageContainer}>
          <Text style={[styles.systemMessageText, { color: colors.textTertiary, backgroundColor: colors.border }]}>{item.text}</Text>
        </View>
      );
    }

    const isMe = item.sender === 'me';

    return (
      <View style={[styles.messageRow, isMe ? styles.messageRowMe : styles.messageRowOther]}>
        <View style={[isMe ? styles.avatarMe : styles.avatar, { backgroundColor: isMe ? colors.avatarBackgroundMe : colors.avatarBackground }]}>
          <Text style={isMe ? styles.avatarTextMe : styles.avatarText}>
            {isMe ? '我' : contact?.avatar || contact?.name?.charAt(0) || chatId === 'assistant' ? '文' : chatId === 'group' ? '团' : chatId === 'notifications' ? '通' : '联'}
          </Text>
        </View>
        <Pressable
          style={[styles.messageContent, isMe && styles.messageContentMe]}
          onLongPress={() => handleMessageLongPress(item)}
          delayLongPress={250}
        >
          <View style={[styles.messageBubble, isMe ? { backgroundColor: colors.chatBubbleMe } : { backgroundColor: colors.chatBubbleOther }]}>
            <Text style={[styles.messageText, { color: colors.text }]}>{item.text}</Text>
          </View>
          {item.time && <Text style={[styles.messageTime, { color: colors.textTertiary }, isMe && styles.messageTimeMe]}>{item.time}</Text>}
        </Pressable>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={safeAreaEdges}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={colors.background} 
      />
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : hasNativeHeader ? 90 : headerHeight + 90}
      >
        <View style={styles.messagesWrapper}>
          <FlatList
            data={conversation}
            keyExtractor={(item) => item.id}
            renderItem={renderMessageItem}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <View style={[styles.inputBubble, { backgroundColor: colors.backgroundSecondary, shadowColor: colors.cardShadow }]}>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.backgroundTertiary }]}>
              <Ionicons name="add" size={24} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.textInputWrapper}>
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                placeholder="发送消息"
                value={draftMessage}
                onChangeText={setDraftMessage}
                placeholderTextColor={colors.placeholder}
                multiline
                scrollEnabled={false}
                underlineColorAndroid="transparent"
              />
            </View>
            <TouchableOpacity style={[styles.sendButton, { backgroundColor: colors.primary }]}>
              <Text style={[styles.sendButtonText, { color: '#ffffff' }]}>发送</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
      <Modal
        visible={actionSheetVisible}
        transparent
        animationType="fade"
        onRequestClose={closeActionSheet}
      >
        <View style={styles.actionSheetOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeActionSheet} />
          <View
            style={[
              styles.actionSheetContainer,
              { backgroundColor: colors.backgroundSecondary, paddingBottom: Math.max(insets.bottom + 16, 24) },
            ]}
          >
            {selectedMessage && (
              <View style={styles.actionSheetPreview}>
                <Text style={[styles.actionSheetPreviewLabel, { color: colors.textSecondary }]}>已选消息</Text>
                <Text style={[styles.actionSheetPreviewText, { color: colors.text }]} numberOfLines={2}>
                  {selectedMessage.text}
                </Text>
              </View>
            )}
            {actionItems.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[styles.actionSheetOption, !item.enabled && styles.actionSheetOptionDisabled]}
                onPress={() => {
                  if (!item.enabled) {
                    return;
                  }
                  item.onPress();
                }}
                disabled={!item.enabled}
              >
                <Text
                  style={[
                    styles.actionSheetOptionText,
                    { color: item.enabled ? colors.text : colors.textTertiary },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#e5e5e5',
  },
  container: {
    flex: 1,
    backgroundColor: '#e5e5e5',
  },
  messagesWrapper: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  systemMessageText: {
    fontSize: 12,
    color: '#999',
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#d9d9d9',
    borderRadius: 12,
  },
  messageRow: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  messageRowMe: {
    flexDirection: 'row-reverse',
    alignSelf: 'flex-end',
  },
  messageRowOther: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
  },
  messageContent: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    maxWidth: '70%',
  },
  messageContentMe: {
    alignItems: 'flex-end',
    marginRight: 0,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: '#07C160',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  avatarMe: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarTextMe: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  messageBubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  messageBubbleMe: {
    backgroundColor: '#95ec69',
    borderTopRightRadius: 4,
  },
  messageBubbleOther: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#111',
    lineHeight: 22,
  },
  messageTime: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  messageTimeMe: {
    textAlign: 'right',
  },
  inputContainer: {
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 8,
  },
  inputBubble: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#ffffff',
    borderRadius: 28,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f3f3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  textInputWrapper: {
    flex: 1,
    minHeight: 32,
    maxHeight: 120,
    borderRadius: 18,
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 0,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 16,
    color: '#111',
    padding: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
    paddingTop: Platform.OS === 'ios' ? 2 : 0,
    paddingBottom: 0,
    textAlign: 'left',
    textAlignVertical: 'center',
    includeFontPadding: false,
    lineHeight: 20,
    height: 32,
  },
  sendButton: {
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#07C160',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  sendButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionSheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  actionSheetContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 8,
  },
  actionSheetPreview: {
    marginBottom: 12,
  },
  actionSheetPreviewLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  actionSheetPreviewText: {
    fontSize: 15,
    lineHeight: 21,
  },
  actionSheetOption: {
    paddingVertical: 14,
  },
  actionSheetOptionDisabled: {
    opacity: 0.5,
  },
  actionSheetOptionText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
