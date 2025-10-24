import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
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
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const navigation = useNavigation();
  const [draftMessage, setDraftMessage] = useState('');

  const chatId = useMemo(() => {
    if (Array.isArray(id)) {
      return id[0];
    }
    return id ?? '';
  }, [id]);

  const contact = useMemo(() => mockContacts.find((item) => item.id === chatId), [chatId]);

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

  useEffect(() => {
    navigation.setOptions({ title: conversationTitle } as NativeStackNavigationOptions);
  }, [conversationTitle, navigation]);

  const messages = chatHistories[chatId] ?? defaultHistory;

  const renderMessageItem = ({ item }: { item: Message }) => {
    if (item.sender === 'system') {
      return (
        <View style={styles.systemMessageContainer}>
          <Text style={styles.systemMessageText}>{item.text}</Text>
        </View>
      );
    }

    const isMe = item.sender === 'me';

    return (
      <View style={[styles.messageRow, isMe ? styles.messageRowMe : styles.messageRowOther]}>
        <View style={[styles.messageBubble, isMe ? styles.messageBubbleMe : styles.messageBubbleOther]}>
          <Text style={styles.messageText}>{item.text}</Text>
        </View>
        {item.time && <Text style={styles.messageTime}>{item.time}</Text>}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="add" size={24} color="#333" />
          </TouchableOpacity>
          <View style={styles.textInputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="发送消息"
              value={draftMessage}
              onChangeText={setDraftMessage}
              placeholderTextColor="#999"
              multiline
            />
          </View>
          <TouchableOpacity style={styles.sendButton}>
            <Text style={styles.sendButtonText}>发送</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ededed',
  },
  container: {
    flex: 1,
    backgroundColor: '#e5e5e5',
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
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
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  messageRowMe: {
    alignItems: 'flex-end',
  },
  messageRowOther: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f7f7f7',
    borderTopWidth: 0.5,
    borderTopColor: '#dcdcdc',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInputWrapper: {
    flex: 1,
    minHeight: 36,
    maxHeight: 120,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  textInput: {
    fontSize: 16,
    color: '#111',
    padding: 0,
  },
  sendButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#07C160',
  },
  sendButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
});
