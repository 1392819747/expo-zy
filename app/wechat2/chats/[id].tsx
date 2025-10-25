import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useWeChatTheme } from '../useWeChatTheme';

type Message = {
  id: string;
  text: string;
  time: string;
  isSent: boolean;
};

const MOCK_MESSAGES: Message[] = [
  { id: '1', text: '你好！', time: '10:30', isSent: false },
  { id: '2', text: '你好，有什么可以帮你的吗？', time: '10:31', isSent: true },
  { id: '3', text: '我想了解一下微信的新功能', time: '10:32', isSent: false },
  { id: '4', text: '好的，我们最近更新了很多新功能，包括视频号、直播等', time: '10:33', isSent: true },
];

const EMOJIS = ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳'];

const MORE_OPTIONS = [
  { id: 'photo', label: '相册', icon: 'images-outline', color: '#628CFC' },
  { id: 'camera', label: '拍摄', icon: 'camera-outline', color: '#FF9500' },
  { id: 'video-call', label: '视频通话', icon: 'videocam-outline', color: '#34C759' },
  { id: 'location', label: '位置', icon: 'location-outline', color: '#5856D6' },
  { id: 'file', label: '文件', icon: 'document-outline', color: '#FF2D55' },
  { id: 'contact', label: '联系人', icon: 'person-outline', color: '#FF9500' },
];

export default function ChatDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const theme = useWeChatTheme();
  
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const name = (params.name as string) || '聊天';

  useEffect(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
  }, []);

  const handleSend = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputText.trim(),
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        isSent: true,
      };
      setMessages(prev => [...prev, newMessage]);
      setInputText('');
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setInputText(prev => prev + emoji);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageContainer, item.isSent ? styles.sentContainer : styles.receivedContainer]}>
      {!item.isSent && (
        <Image source={require('../../../assets/images/wechat/avatar-assistant.png')} style={styles.avatar} />
      )}
      <View style={styles.messageContent}>
        <View
          style={[
            styles.messageBubble,
            item.isSent
              ? { backgroundColor: theme.brand2 }
              : { backgroundColor: theme.bg1 },
          ]}
        >
          <Text style={[styles.messageText, { color: item.isSent ? '#000' : theme.text5 }]}>
            {item.text}
          </Text>
        </View>
      </View>
      {item.isSent && (
        <Image source={require('../../../assets/images/wechat/avatar-wechat.png')} style={styles.avatar} />
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg2 }]} edges={['top']}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.header, { backgroundColor: theme.bg1, borderBottomColor: theme.fillColor }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.text5} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text5 }]} numberOfLines={1}>{name}</Text>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-horizontal" size={24} color={theme.text5} />
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <View style={[styles.inputBar, { backgroundColor: theme.bg1, borderTopColor: theme.fillColor }]}>
          <TouchableOpacity style={styles.inputButton}>
            <Ionicons name="mic-outline" size={26} color={theme.text5} />
          </TouchableOpacity>
          <View style={[styles.inputContainer, { backgroundColor: theme.bg2 }]}>
            <TextInput
              style={[styles.input, { color: theme.text5 }]}
              value={inputText}
              onChangeText={setInputText}
              placeholder="..."
              placeholderTextColor={theme.text3}
              multiline
              maxLength={500}
            />
          </View>
          <TouchableOpacity style={styles.inputButton} onPress={() => {
            setShowEmojiPicker(!showEmojiPicker);
            setShowMoreOptions(false);
          }}>
            <Ionicons name="happy-outline" size={26} color={theme.text5} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.inputButton} onPress={() => {
            setShowMoreOptions(!showMoreOptions);
            setShowEmojiPicker(false);
          }}>
            <Ionicons name="add-circle-outline" size={26} color={theme.text5} />
          </TouchableOpacity>
          {inputText.trim() ? (
            <TouchableOpacity style={[styles.sendButton, { backgroundColor: theme.primary }]} onPress={handleSend}>
              <Text style={styles.sendButtonText}>发送</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Emoji Picker Modal */}
        <Modal visible={showEmojiPicker} transparent animationType="slide">
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowEmojiPicker(false)}>
            <View style={[styles.emojiPicker, { backgroundColor: theme.bg1 }]}>
              <View style={styles.emojiHeader}>
                <Text style={[styles.emojiTitle, { color: theme.text5 }]}>表情</Text>
                <TouchableOpacity onPress={() => setShowEmojiPicker(false)}>
                  <Ionicons name="close" size={24} color={theme.text5} />
                </TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={styles.emojiGrid} showsVerticalScrollIndicator={false}>
                {EMOJIS.map((emoji, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.emojiButton}
                    onPress={() => {
                      handleEmojiSelect(emoji);
                      setShowEmojiPicker(false);
                    }}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* More Options Modal */}
        <Modal visible={showMoreOptions} transparent animationType="slide">
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowMoreOptions(false)}>
            <View style={[styles.moreOptions, { backgroundColor: theme.bg1 }]}>
              <View style={styles.moreHeader}>
                <Text style={[styles.moreTitle, { color: theme.text5 }]}>更多</Text>
                <TouchableOpacity onPress={() => setShowMoreOptions(false)}>
                  <Ionicons name="close" size={24} color={theme.text5} />
                </TouchableOpacity>
              </View>
              <View style={styles.moreGrid}>
                {MORE_OPTIONS.map(option => (
                  <TouchableOpacity key={option.id} style={styles.moreButton} onPress={() => setShowMoreOptions(false)}>
                    <View style={[styles.moreIcon, { backgroundColor: option.color }]}>
                      <Ionicons name={option.icon as any} size={28} color="#fff" />
                    </View>
                    <Text style={[styles.moreLabel, { color: theme.text5 }]}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '400', textAlign: 'center', marginHorizontal: 16 },
  moreButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' },
  messagesList: { paddingVertical: 12 },
  messageContainer: { flexDirection: 'row', paddingHorizontal: 12, marginBottom: 16 },
  sentContainer: { justifyContent: 'flex-end' },
  receivedContainer: { justifyContent: 'flex-start' },
  avatar: { width: 40, height: 40, borderRadius: 4 },
  messageContent: { maxWidth: '70%', marginHorizontal: 8 },
  messageBubble: { padding: 12, borderRadius: 6 },
  messageText: { fontSize: 16, lineHeight: 22 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 0.5,
    gap: 8,
  },
  inputButton: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  inputContainer: { flex: 1, maxHeight: 100, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  input: { fontSize: 16, maxHeight: 84, minHeight: 20 },
  sendButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  sendButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  emojiPicker: {
    height: 320,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
  },
  emojiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  emojiTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
  },
  emojiButton: {
    width: '12.5%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiText: {
    fontSize: 28,
  },
  moreOptions: {
    height: 280,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
  },
  moreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  moreTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  moreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  moreButton: {
    width: '22%',
    alignItems: 'center',
    gap: 8,
  },
  moreIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
});
