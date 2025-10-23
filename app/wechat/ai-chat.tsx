import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

type AsyncStorageType = typeof import('@react-native-async-storage/async-storage').default;
const AsyncStorage =
  require('@react-native-async-storage/async-storage').default as AsyncStorageType;

type Message = {
  id: string;
  personaId: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
};

const PERSONAS = [
  {
    description: '调酒、讲故事、记住每位旅人的心愿，最适合陪你畅聊奇幻冒险。',
    id: 'innkeeper',
    label: '酒保'
  },
  {
    description: '熟悉各大模型协议，擅长帮你梳理复杂问题和接入细节。',
    id: 'tactician',
    label: '情报官'
  },
  {
    description: '擅长把回答写成优美的段落或诗歌，适合灵感采集。',
    id: 'bard',
    label: '吟游诗人'
  }
];

const QUICK_REPLIES: Record<string, string[]> = {
  bard: ['帮我润色一段台词', '把这个回答写成歌谣', '来首关于旅人的短诗'],
  innkeeper: ['推荐一个新的冒险故事', '记住我喜欢的角色设定', '帮我设计一个任务线索'],
  tactician: ['给我一份调用 OpenAI 的示例', '分析一下这个模型协议差异', '帮我拟定一个 API 封装结构']
};

const PERSONA_RESPONSES: Record<string, string[]> = {
  bard: [
    '好的，我会把答案写得充满韵律与节奏。',
    '这听起来像是一首未完成的歌谣，让我来补完它。',
    '灵感来了，容我为你谱上一段诗行。'
  ],
  innkeeper: [
    '坐下来先喝口热茶，我已经想好了新的故事。',
    '我们老朋友啦，我会把你的喜好记在账本里。',
    '今晚的篝火边正适合听一个英雄的传说。'
  ],
  tactician: [
    '我已经把各家协议梳理成清单，随时可以查阅。',
    '让我来比对一下这些参数的差异，马上给你结果。',
    '好主意，我们可以把这个流程拆成三层来实现。'
  ]
};

const STORAGE_KEY = 'wechat.ai-chat.drafts';

const formatTime = (date = new Date()) => {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const createInitialMessages = (): Message[] => [
  {
    id: 'intro-1',
    personaId: 'innkeeper',
    sender: 'ai',
    text: '欢迎来到知音酒馆，我是负责招待的酒保。准备好创建你的 AI 角色了吗？',
    timestamp: formatTime()
  },
  {
    id: 'intro-2',
    personaId: 'user',
    sender: 'user',
    text: '我想试试，让它像桌游里的伙伴一样。',
    timestamp: formatTime()
  },
  {
    id: 'intro-3',
    personaId: 'innkeeper',
    sender: 'ai',
    text: '没问题，把你的想法告诉我，我们一起把角色记在酒馆的账本上。',
    timestamp: formatTime()
  }
];

const useDraftStorage = () => {
  const [draft, setDraft] = useState('');

  useEffect(() => {
    const loadDraft = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setDraft(stored);
        }
      } catch (error) {
        console.warn('无法读取草稿', error);
      }
    };

    void loadDraft();
  }, []);

  const persist = useCallback(async (value: string) => {
    try {
      setDraft(value);
      if (value) {
        await AsyncStorage.setItem(STORAGE_KEY, value);
      } else {
        await AsyncStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.warn('无法保存草稿', error);
    }
  }, []);

  return { draft, persist };
};

export default function AIChatScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(() => createInitialMessages());
  const [inputValue, setInputValue] = useState('');
  const [selectedPersona, setSelectedPersona] = useState<string>(PERSONAS[0].id);
  const [isResponding, setIsResponding] = useState(false);
  const flatListRef = useRef<FlatList<Message>>(null);
  const { draft, persist } = useDraftStorage();

  useEffect(() => {
    if (draft && !inputValue) {
      setInputValue(draft);
    }
  }, [draft, inputValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    return () => {
      clearTimeout(timeout);
    };
  }, [messages]);

  const personaMap = useMemo(() => {
    return PERSONAS.reduce<Record<string, (typeof PERSONAS)[number]>>((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {});
  }, []);

  const currentPersona = personaMap[selectedPersona];
  const quickReplies = QUICK_REPLIES[selectedPersona] ?? [];

  const createAssistantReply = useCallback(
    (prompt: string): Message => {
      const variants = PERSONA_RESPONSES[selectedPersona] ?? PERSONA_RESPONSES.innkeeper;
      const response = variants[(prompt.length + messages.length) % variants.length];

      return {
        id: `${Date.now()}-ai`,
        personaId: selectedPersona,
        sender: 'ai',
        text: `${response}\n\n> ${prompt}`,
        timestamp: formatTime()
      };
    },
    [messages.length, selectedPersona]
  );

  const handleSend = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed || isResponding) {
      return;
    }

    const newMessage: Message = {
      id: `${Date.now()}-user`,
      personaId: 'user',
      sender: 'user',
      text: trimmed,
      timestamp: formatTime()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    void persist('');
    setIsResponding(true);

    const reply = createAssistantReply(trimmed);
    setTimeout(() => {
      setMessages(prev => [...prev, reply]);
      setIsResponding(false);
    }, 600);
  }, [createAssistantReply, inputValue, isResponding, persist]);

  const handleChangeText = useCallback(
    (value: string) => {
      setInputValue(value);
      void persist(value);
    },
    [persist]
  );

  const handleQuickReply = useCallback(
    (text: string) => {
      setInputValue(text);
      flatListRef.current?.scrollToEnd({ animated: true });
    },
    []
  );

  const renderMessage = useCallback(
    ({ item }: { item: Message }) => {
      const isUser = item.sender === 'user';
      const personaLabel = item.sender === 'ai' ? personaMap[item.personaId]?.label ?? 'AI' : '我';

      return (
        <View style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowAI]}>
          {!isUser && (
            <View style={[styles.avatar, styles.avatarAI]}>
              <Text style={styles.avatarText}>{personaLabel.slice(0, 2)}</Text>
            </View>
          )}
          <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
            {!isUser && <Text style={styles.personaLabel}>{personaLabel}</Text>}
            <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>{item.text}</Text>
            <Text style={[styles.timestamp, isUser ? styles.timestampUser : styles.timestampAI]}>{item.timestamp}</Text>
          </View>
          {isUser && (
            <View style={[styles.avatar, styles.avatarUser]}>
              <Text style={styles.avatarText}>我</Text>
            </View>
          )}
        </View>
      );
    },
    [personaMap]
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#0a0a0a" />
        </TouchableOpacity>
        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerTitle}>AI 酒馆</Text>
          <Text style={styles.headerSubtitle}>Stream 风格的角色聊天界面</Text>
        </View>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/api-settings')}>
          <Ionicons name="settings-outline" size={22} color="#0a0a0a" />
        </TouchableOpacity>
      </View>

      <View style={styles.personaSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.personaListContent}
        >
          {PERSONAS.map(persona => {
            const isActive = persona.id === selectedPersona;
            return (
              <TouchableOpacity
                key={persona.id}
                style={[styles.personaChip, isActive && styles.personaChipActive]}
                onPress={() => setSelectedPersona(persona.id)}
              >
                <Text style={[styles.personaChipText, isActive && styles.personaChipTextActive]}>
                  {persona.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        {currentPersona ? (
          <Text style={styles.personaDescription}>{currentPersona.description}</Text>
        ) : null}
      </View>

      <View style={styles.quickRepliesSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {quickReplies.map(text => (
            <TouchableOpacity
              key={text}
              style={styles.quickReplyChip}
              onPress={() => handleQuickReply(text)}
            >
              <Text style={styles.quickReplyText}>{text}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        showsVerticalScrollIndicator={false}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 16 : 0}
      >
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.toolButton}>
            <Ionicons name="flash-outline" size={20} color="#4B9BFF" />
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            value={inputValue}
            onChangeText={handleChangeText}
            placeholder="向你的角色发起对话..."
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputValue.trim() || isResponding) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputValue.trim() || isResponding}
          >
            {isResponding ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={18} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f5f7fb'
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitleGroup: {
    flex: 1,
    marginHorizontal: 8
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0a0a0a'
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#7a7f87',
    marginTop: 4
  },
  personaSection: {
    paddingHorizontal: 16,
    paddingBottom: 12
  },
  personaListContent: {
    paddingVertical: 6
  },
  personaChip: {
    borderWidth: 1,
    borderColor: '#c8d4ff',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 10
  },
  personaChipActive: {
    backgroundColor: '#4B9BFF',
    borderColor: '#4B9BFF'
  },
  personaChipText: {
    fontSize: 13,
    color: '#3f4a5a'
  },
  personaChipTextActive: {
    color: '#fff',
    fontWeight: '600'
  },
  personaDescription: {
    marginTop: 8,
    fontSize: 13,
    color: '#5b6270',
    lineHeight: 18
  },
  quickRepliesSection: {
    paddingHorizontal: 16,
    paddingBottom: 8
  },
  quickReplyChip: {
    backgroundColor: '#eef3ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 10,
    marginBottom: 6
  },
  quickReplyText: {
    fontSize: 12,
    color: '#395185'
  },
  messageList: {
    flex: 1
  },
  messageListContent: {
    paddingHorizontal: 16,
    paddingBottom: 20
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12
  },
  messageRowAI: {
    justifyContent: 'flex-start'
  },
  messageRowUser: {
    justifyContent: 'flex-end'
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#d6def0',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarAI: {
    marginRight: 8,
    backgroundColor: '#4B9BFF'
  },
  avatarUser: {
    marginLeft: 8,
    backgroundColor: '#07C160'
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff'
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  aiBubble: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4
  },
  userBubble: {
    backgroundColor: '#07C160',
    borderBottomRightRadius: 4
  },
  personaLabel: {
    fontSize: 11,
    color: '#4B9BFF',
    marginBottom: 4,
    fontWeight: '600'
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20
  },
  aiText: {
    color: '#1a1d21'
  },
  userText: {
    color: '#fff'
  },
  timestamp: {
    fontSize: 10,
    marginTop: 6
  },
  timestampAI: {
    color: '#8a9099',
    textAlign: 'left'
  },
  timestampUser: {
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'right'
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f0f3f8'
  },
  toolButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e1e8ff',
    marginRight: 8
  },
  textInput: {
    flex: 1,
    minHeight: 36,
    maxHeight: 120,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    textAlignVertical: 'top',
    fontSize: 14,
    color: '#1a1d21'
  },
  sendButton: {
    width: 44,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4B9BFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10
  },
  sendButtonDisabled: {
    backgroundColor: '#9dbcf5'
  }
});
