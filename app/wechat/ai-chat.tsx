import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const PERSONAS = [
  {
    accentColor: '#4C8BFF',
    avatar: '守',
    description: '掌管知音酒馆的守门人，熟悉 SillyTavern 的一切，擅长帮助你规划角色与世界观。',
    id: 'innkeeper',
    name: '酒馆店主',
    role: '世界架构'
  },
  {
    accentColor: '#7C5CFF',
    avatar: '灵',
    description: '负责角色的情绪调度，擅长编织背景故事与代入感十足的对白。',
    id: 'bard',
    name: '灵感缪斯',
    role: '设定润色'
  },
  {
    accentColor: '#18A999',
    avatar: '技',
    description: '熟悉各大模型 API 协议，擅长把 Stream Chat 的 UI 与你的后端串联。',
    id: 'tactician',
    name: '战术策士',
    role: '接口编排'
  }
] as const;

type PersonaId = (typeof PERSONAS)[number]['id'];

type Message = {
  id: string;
  personaId: PersonaId;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
};

const QUICK_REPLIES: Record<PersonaId, string[]> = {
  bard: ['润色一下这个角色对白', '帮我写一段 tavern 场景描写', '给我几句更戏剧化的回应'],
  innkeeper: ['为新角色创建入场提示词', '帮我整理一下世界观设定', '列一个 SillyTavern 风格的人设卡'],
  tactician: ['生成一个 OpenAI 接入模板', '我该如何切换到 Gemini 协议？', '把 Stream UI 的消息结构给我']
};

const PERSONA_RESPONSES: Record<PersonaId, string[]> = {
  bard: [
    '灵感像晚风一样涌来，我把你的想法织成更动人的台词。',
    '我会在 Tavern 的灯光下，为这段故事添上一抹诗意。',
    '好主意，让我用更华丽的语言把情绪层层铺开。'
  ],
  innkeeper: [
    '记好了，这位旅人的新角色已登记在 SillyTavern 的账本里。',
    '让我帮你把世界观按章节整理好，随时可以取用。',
    '酒馆的桌面已经备好，你想切换到哪个角色，都一键就绪。'
  ],
  tactician: [
    '我已经为你准备好接口脚手架，随时可以调用 Stream UI。',
    '好的，我来整理一份多协议并存的请求封装。',
    '收到，我们把各个模型的差异都标注清楚，方便切换。'
  ]
};

const STORAGE_KEY = 'wechat.ai-chat.drafts';

const formatTime = (date = new Date()) =>
  `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

const withOpacity = (hex: string, opacity: number) => {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) {
    return hex;
  }
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const createInitialMessages = (): Message[] => [
  {
    id: 'intro-1',
    personaId: 'innkeeper',
    sender: 'ai',
    text: '欢迎来到知音酒馆，SillyTavern 的副本已经为你开启。需要我帮你接入哪个角色吗？',
    timestamp: formatTime()
  },
  {
    id: 'intro-2',
    personaId: 'innkeeper',
    sender: 'user',
    text: '先从店主开始吧，想梳理一下 Tavern 场景里的角色和提示词。',
    timestamp: formatTime()
  },
  {
    id: 'intro-3',
    personaId: 'innkeeper',
    sender: 'ai',
    text: '没问题。选择角色后，我会把提示词、标签和默认设定全都记录在案。',
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

type PersonaCardProps = {
  isActive: boolean;
  onPress: () => void;
  persona: (typeof PERSONAS)[number];
};

const PersonaCard = ({ isActive, onPress, persona }: PersonaCardProps) => {
  return (
    <TouchableOpacity
      accessibilityRole='button'
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.personaCard,
        isActive && {
          backgroundColor: withOpacity(persona.accentColor, 0.14),
          borderColor: withOpacity(persona.accentColor, 0.5)
        }
      ]}>
      <View
        style={[
          styles.personaAvatar,
          {
            backgroundColor: withOpacity(persona.accentColor, 0.18),
            borderColor: withOpacity(persona.accentColor, 0.45)
          }
        ]}>
        <Text style={[styles.personaAvatarText, { color: persona.accentColor }]}>{persona.avatar}</Text>
      </View>
      <View style={styles.personaMeta}>
        <Text style={styles.personaName}>{persona.name}</Text>
        <Text style={styles.personaRole}>{persona.role}</Text>
      </View>
      <Ionicons
        color={isActive ? persona.accentColor : '#A0AEC0'}
        name={isActive ? 'checkmark-circle' : 'ellipse-outline'}
        size={18}
      />
    </TouchableOpacity>
  );
};

type MessageBubbleProps = {
  message: Message;
  personaMap: Record<PersonaId, (typeof PERSONAS)[number]>;
};

const MessageBubble = ({ message, personaMap }: MessageBubbleProps) => {
  const persona = personaMap[message.personaId];
  const isUser = message.sender === 'user';
  const accentColor = isUser ? '#0ABF53' : persona?.accentColor ?? '#4C8BFF';
  const bubbleStyles = [
    styles.messageBubble,
    isUser ? styles.userBubble : styles.aiBubble,
    !isUser && persona && { borderColor: withOpacity(persona.accentColor, 0.35) }
  ];

  return (
    <View style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowAI]}>
      {!isUser && (
        <View
          style={[
            styles.avatar,
            {
              backgroundColor: withOpacity(accentColor, 0.15),
              borderColor: withOpacity(accentColor, 0.5)
            }
          ]}>
          <Text style={[styles.avatarText, { color: accentColor }]}>{persona?.avatar ?? 'AI'}</Text>
        </View>
      )}
      <View style={bubbleStyles}>
        <Text style={[styles.messageText, isUser && styles.userMessageText]}>{message.text}</Text>
        <View style={styles.messageMetaRow}>
          <Text style={styles.timestamp}>{message.timestamp}</Text>
          {!isUser && persona && (
            <View
              style={[
                styles.personaPill,
                {
                  backgroundColor: withOpacity(persona.accentColor, 0.16)
                }
              ]}>
              <Text style={[styles.personaPillText, { color: persona.accentColor }]}>{persona.name}</Text>
            </View>
          )}
        </View>
      </View>
      {isUser && (
        <View style={[styles.avatar, styles.userAvatar]}> 
          <Text style={[styles.avatarText, styles.userAvatarText]}>我</Text>
        </View>
      )}
    </View>
  );
};

export default function AIChatScreen() {
  const router = useRouter();
  const [selectedPersonaId, setSelectedPersonaId] = useState<PersonaId>('innkeeper');
  const [messages, setMessages] = useState<Message[]>(() => createInitialMessages());
  const [inputValue, setInputValue] = useState('');
  const [isResponding, setIsResponding] = useState(false);
  const flatListRef = useRef<FlatList<Message>>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<TextInput>(null);
  const { draft, persist } = useDraftStorage();

  const personaMap = useMemo(
    () =>
      PERSONAS.reduce(
        (acc, persona) => {
          acc[persona.id] = persona;
          return acc;
        },
        {} as Record<PersonaId, (typeof PERSONAS)[number]>
      ),
    []
  );

  const selectedPersona = personaMap[selectedPersonaId];

  useEffect(() => {
    if (draft && !inputValue) {
      setInputValue(draft);
    }
  }, [draft, inputValue]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 80);
    return () => clearTimeout(timeout);
  }, [messages, isResponding]);

  const sendMessage = useCallback(
    (rawText: string) => {
      const trimmed = rawText.trim();
      if (!trimmed) {
        return;
      }

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        personaId: selectedPersonaId,
        sender: 'user',
        text: trimmed,
        timestamp: formatTime()
      };

      setMessages(prev => [...prev, userMessage]);
      setInputValue('');
      void persist('');
      setIsResponding(true);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = window.setTimeout(() => {
        const candidateResponses = PERSONA_RESPONSES[selectedPersonaId];
        const replyText =
          candidateResponses[Math.floor(Math.random() * candidateResponses.length)] ??
          '好的，我会持续记录你的设定需求。';

        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          personaId: selectedPersonaId,
          sender: 'ai',
          text: replyText,
          timestamp: formatTime()
        };

        setMessages(prev => [...prev, aiMessage]);
        setIsResponding(false);
      }, 700 + Math.random() * 900);
    },
    [persist, selectedPersonaId]
  );

  const handleSend = useCallback(() => {
    sendMessage(inputValue);
  }, [inputValue, sendMessage]);

  const handleQuickReply = useCallback(
    (value: string) => {
      sendMessage(value);
    },
    [sendMessage]
  );

  const handlePersonaChange = useCallback(
    (id: PersonaId) => {
      setSelectedPersonaId(id);
    },
    []
  );

  const handleInputChange = useCallback(
    (value: string) => {
      setInputValue(value);
      void persist(value);
    },
    [persist]
  );

  const renderMessage = useCallback(
    ({ item }: { item: Message }) => <MessageBubble message={item} personaMap={personaMap} />,
    [personaMap]
  );

  const keyExtractor = useCallback((item: Message) => item.id, []);

  const quickReplies = QUICK_REPLIES[selectedPersonaId];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            accessibilityRole='button'
            onPress={() => router.back()}
            style={styles.headerButton}>
            <Ionicons color='#1A202C' name='chevron-back' size={24} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>知音酒馆 · SillyTavern</Text>
            <Text style={styles.headerSubtitle}>使用 Stream Chat 风格的对话界面</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity accessibilityRole='button' style={styles.headerIconButton}>
              <Ionicons color='#4A5568' name='search-outline' size={20} />
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole='button' style={styles.headerIconButton}>
              <Ionicons color='#4A5568' name='ellipsis-horizontal' size={20} />
            </TouchableOpacity>
          </View>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.select({ android: 12, ios: 0 }) ?? 0}
          style={styles.flex}>
          <View style={styles.chatSurface}>
            <FlatList
              ListHeaderComponent={
                <View style={styles.listHeader}>
                  <Text style={styles.channelTitle}>{selectedPersona.name}</Text>
                  <Text style={styles.channelDescription}>{selectedPersona.description}</Text>
                  <View style={styles.personaList}>
                    {PERSONAS.map(persona => (
                      <PersonaCard
                        isActive={persona.id === selectedPersonaId}
                        key={persona.id}
                        onPress={() => handlePersonaChange(persona.id)}
                        persona={persona}
                      />
                    ))}
                  </View>
                  <Text style={styles.sectionLabel}>对话记录</Text>
                </View>
              }
              ListFooterComponent={
                isResponding ? (
                  <View style={styles.typingIndicator}>
                    <ActivityIndicator color={selectedPersona.accentColor} size='small' />
                    <Text style={styles.typingText}>{selectedPersona.name} 正在整理回复...</Text>
                  </View>
                ) : (
                  <View style={styles.listFooterSpace} />
                )
              }
              contentContainerStyle={styles.listContent}
              data={messages}
              keyExtractor={keyExtractor}
              ref={flatListRef}
              renderItem={renderMessage}
              showsVerticalScrollIndicator={false}
            />
            <View style={styles.quickReplyContainer}>
              <Text style={styles.quickReplyLabel}>快捷提示</Text>
              <View style={styles.quickReplyChips}>
                {quickReplies.map(reply => (
                  <TouchableOpacity
                    accessibilityRole='button'
                    key={reply}
                    onPress={() => handleQuickReply(reply)}
                    style={styles.quickReplyChip}>
                    <Ionicons color={selectedPersona.accentColor} name='flash-outline' size={14} />
                    <Text style={[styles.quickReplyText, { color: selectedPersona.accentColor }]}>{reply}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.inputBar}>
              <TouchableOpacity
                accessibilityRole='button'
                onPress={() => inputRef.current?.focus()}
                style={styles.inputActionButton}>
                <Ionicons color='#4A5568' name='add-circle-outline' size={26} />
              </TouchableOpacity>
              <View style={styles.inputWrapper}>
                <TextInput
                  multiline
                  onChangeText={handleInputChange}
                  placeholder='发送一条 SillyTavern 风格的请求...'
                  placeholderTextColor='#A0AEC0'
                  ref={inputRef}
                  style={styles.input}
                  value={inputValue}
                />
              </View>
              <TouchableOpacity
                accessibilityRole='button'
                disabled={!inputValue.trim()}
                onPress={handleSend}
                style={[styles.sendButton, !inputValue.trim() && styles.sendButtonDisabled]}>
                <Ionicons color={inputValue.trim() ? '#FFFFFF' : '#CBD5E0'} name='send' size={18} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F2F5F9',
    flex: 1
  },
  container: {
    flex: 1
  },
  flex: {
    flex: 1
  },
  header: {
    alignItems: 'center',
    borderBottomColor: '#E2E8F0',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  headerButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36
  },
  headerCenter: {
    flex: 1
  },
  headerTitle: {
    color: '#1A202C',
    fontSize: 16,
    fontWeight: '600'
  },
  headerSubtitle: {
    color: '#718096',
    fontSize: 12,
    marginTop: 2
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10
  },
  headerIconButton: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 32
  },
  chatSurface: {
    backgroundColor: '#EDF2F7',
    flex: 1
  },
  listContent: {
    paddingBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 8
  },
  listHeader: {
    marginBottom: 12
  },
  channelTitle: {
    color: '#1A202C',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4
  },
  channelDescription: {
    color: '#4A5568',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12
  },
  personaList: {
    gap: 8
  },
  personaCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: 'transparent',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  personaAvatar: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36
  },
  personaAvatarText: {
    fontSize: 16,
    fontWeight: '600'
  },
  personaMeta: {
    flex: 1
  },
  personaName: {
    color: '#1A202C',
    fontSize: 14,
    fontWeight: '600'
  },
  personaRole: {
    color: '#718096',
    fontSize: 12,
    marginTop: 2
  },
  sectionLabel: {
    color: '#A0AEC0',
    fontSize: 12,
    letterSpacing: 1,
    marginTop: 16,
    textTransform: 'uppercase'
  },
  messageRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    marginBottom: 10
  },
  messageRowAI: {
    justifyContent: 'flex-start'
  },
  messageRowUser: {
    justifyContent: 'flex-end'
  },
  avatar: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    marginHorizontal: 6,
    width: 32
  },
  userAvatar: {
    backgroundColor: '#0ABF53'
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600'
  },
  userAvatarText: {
    color: '#FFFFFF'
  },
  messageBubble: {
    borderRadius: 16,
    borderWidth: 1,
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0'
  },
  userBubble: {
    backgroundColor: '#0ABF53',
    borderColor: '#0ABF53'
  },
  messageText: {
    color: '#2D3748',
    fontSize: 15,
    lineHeight: 20
  },
  userMessageText: {
    color: '#FFFFFF'
  },
  messageMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 6
  },
  timestamp: {
    color: '#A0AEC0',
    fontSize: 11
  },
  personaPill: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2
  },
  personaPillText: {
    fontSize: 11,
    fontWeight: '600'
  },
  typingIndicator: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 4
  },
  typingText: {
    color: '#4A5568',
    fontSize: 12
  },
  listFooterSpace: {
    height: 4
  },
  quickReplyContainer: {
    backgroundColor: '#F7FAFC',
    borderTopColor: '#E2E8F0',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingTop: 12
  },
  quickReplyLabel: {
    color: '#4A5568',
    fontSize: 12,
    marginBottom: 8
  },
  quickReplyChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8
  },
  quickReplyChip: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  quickReplyText: {
    fontSize: 12,
    fontWeight: '600'
  },
  inputBar: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 10,
    paddingBottom: Platform.select({ android: 12, ios: 20 }),
    paddingHorizontal: 16,
    paddingTop: 8
  },
  inputActionButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36
  },
  inputWrapper: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    maxHeight: 140,
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  input: {
    color: '#2D3748',
    fontSize: 15,
    lineHeight: 20,
    maxHeight: 120,
    padding: 0
  },
  sendButton: {
    alignItems: 'center',
    backgroundColor: '#3182CE',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    paddingHorizontal: 16
  },
  sendButtonDisabled: {
    backgroundColor: '#E2E8F0'
  }
});
