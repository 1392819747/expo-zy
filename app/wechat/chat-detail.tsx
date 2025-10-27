import { Ionicons } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import { Asset } from 'expo-asset';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  setIsAudioActiveAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
} from 'expo-audio';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system/legacy';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  GestureResponderEvent,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import type { Edge } from 'react-native-safe-area-context';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../../hooks/useThemeColors';
import { mockContacts } from '../../models/contacts';
import { transcribeAudio } from '../../services/stt';
import { cancelSystemSTT, isSystemSTTAvailable, startSystemSTT, stopSystemSTT } from '../../services/system-stt';

interface Message {
  id: string;
  sender: 'me' | 'other' | 'system';
  text: string;
  time?: string;
  type?: 'text' | 'voice';
  duration?: number; // 语音时长（秒）
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
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const isRecordingRef = useRef(false);
  const [slideUpAction, setSlideUpAction] = useState<'none' | 'convert' | 'cancel'>('none');
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const voiceWaveAnim = useRef(new Animated.Value(1)).current;
  const slideStartY = useRef(0);
  const slideStartX = useRef(0);
  const bubbleSlideAnim = useRef(new Animated.Value(0)).current;
  const recordingStartTimeRef = useRef(0);
  const currentSlideAction = useRef<'none' | 'convert' | 'cancel'>('none');
  const sttListeningRef = useRef(false);
  const prevSlideActionRef = useRef<'none' | 'convert' | 'cancel'>('none');
  const [recorderReinitToggle, setRecorderReinitToggle] = useState(false);
  const recorderOptions = useMemo(() => ({
    ...RecordingPresets.HIGH_QUALITY,
    // Toggle a benign flag to force SharedObject re-create when needed
    isMeteringEnabled: recorderReinitToggle,
  }), [recorderReinitToggle]);
  const audioRecorder = useAudioRecorder(recorderOptions);
  const audioPlayer = useAudioPlayer(null, { keepAudioSessionActive: true, updateInterval: 200 });
  const playerStatus = useAudioPlayerStatus(audioPlayer);
  const playingPlayerRef = useRef<ReturnType<typeof useAudioPlayer> | null>(null);
  const recordingLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const playbackWaveAnim = useRef(new Animated.Value(0)).current;
  const playbackLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const headerHeight = useHeaderHeight();

  // 测试音效按钮相关代码已移除

  const playUriWhenReady = (uri: string) => {
    audioPlayer.muted = false;
    audioPlayer.volume = 1.0;
    audioPlayer.loop = false;
    audioPlayer.replace({ uri });
    let tries = 0;
    const maxTries = 12;
    const tryStart = () => {
      const st = audioPlayer.currentStatus;
      console.log('tryStart isLoaded:', st?.isLoaded, 'duration:', st?.duration, 'buffering:', st?.isBuffering);
      if (st?.isLoaded && (st?.duration ?? 0) > 0) {
        audioPlayer.seekTo(0).finally(() => audioPlayer.play());
      } else if (tries < maxTries) {
        tries++;
        setTimeout(tryStart, 120);
      } else {
        audioPlayer.play();
      }
    };
    setTimeout(tryStart, 60);
  };

  // 等待本地文件写入完成，确保可被播放器读取
  const waitForFileReady = async (uri: string, timeoutMs = 3000) => {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
      try {
        const info = await FileSystem.getInfoAsync(uri);
        if (info.exists && (info.size ?? 0) > 200) {
          return true;
        }
      } catch { }
      await new Promise((r) => setTimeout(r, 120));
    }
    return false;
  };

  // 请求录音权限并设置音频模式
  useEffect(() => {
    (async () => {
      try {
        const { granted } = await requestRecordingPermissionsAsync();
        if (!granted) {
          Alert.alert('提示', '需要麦克风权限才能录音');
          return;
        }

        // 设置音频模式以允许录音和播放
        await setAudioModeAsync({
          // iOS 相关
          allowsRecording: true,
          playsInSilentMode: true,
          interruptionMode: 'doNotMix',
          // Android 相关
          interruptionModeAndroid: 'duckOthers',
          shouldPlayInBackground: false,
          shouldRouteThroughEarpiece: false,
        });
        console.log('音频模式已设置');
      } catch (err) {
        console.error('设置音频模式失败:', err);
      }
    })();

    // 清理函数
    return () => {
      // 避免在卸载阶段触碰已释放的 SharedObject，直接释放会话并清引用
      setIsAudioActiveAsync(false).catch(() => { });
      playingPlayerRef.current = null;
    };
  }, []);

  const ensureRecordingMode = async () => {
    try {
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
        interruptionMode: 'doNotMix',
        interruptionModeAndroid: 'duckOthers',
        shouldRouteThroughEarpiece: false,
      });
    } catch { }
  };

  // 语音动画
  useEffect(() => {
    if (isRecording) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(voiceWaveAnim, {
            toValue: 1.3,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(voiceWaveAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      recordingLoopRef.current = loop;
      loop.start();
    } else {
      // 平滑结束动画
      recordingLoopRef.current?.stop();
      recordingLoopRef.current = null;
      Animated.timing(voiceWaveAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [isRecording]);

  // 监听播放器完成事件，统一收尾逻辑
  useEffect(() => {
    if (playingVoiceId && playerStatus?.didJustFinish) {
      audioPlayer.pause();
      setPlayingVoiceId(null);
      setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
        interruptionMode: 'doNotMix',
        interruptionModeAndroid: 'duckOthers',
      }).catch(() => { });
      setIsAudioActiveAsync(false).catch(() => { });
    }
  }, [playerStatus?.didJustFinish, playingVoiceId]);

  // 播放中波形动画（仅当某条语音在播放时）
  useEffect(() => {
    if (playingVoiceId) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(playbackWaveAnim, { toValue: 1, duration: 420, useNativeDriver: true }),
          Animated.timing(playbackWaveAnim, { toValue: 0, duration: 420, useNativeDriver: true }),
        ])
      );
      playbackLoopRef.current = loop;
      loop.start();
    } else {
      playbackLoopRef.current?.stop();
      playbackLoopRef.current = null;
      playbackWaveAnim.setValue(0);
    }
  }, [playingVoiceId]);

  // 气泡上移动画
  useEffect(() => {
    if (slideUpAction !== 'none') {
      Animated.spring(bubbleSlideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      Animated.spring(bubbleSlideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    }
  }, [slideUpAction]);

  // 根据 slideUpAction 进入/离开“转文字”时机切换系统 STT，避免在 move 回调里 await
  useEffect(() => {
    (async () => {
      const prev = prevSlideActionRef.current;
      const next = slideUpAction;
      if (next === 'convert' && prev !== 'convert' && isSystemSTTAvailable()) {
        if (isRecordingRef.current) {
          try { await audioRecorder.stop(); } catch { }
          isRecordingRef.current = false;
          setIsRecording(false);
        }
        try {
          await requestSystemSTTAuthorization();
          await ensureRecordingMode();
          await startSystemSTT('zh-CN');
          sttListeningRef.current = true;
        } catch (e) {
          console.warn('系统转写启动失败，继续走文件转写:', e);
          sttListeningRef.current = false;
        }
      }
      if (prev === 'convert' && next !== 'convert' && sttListeningRef.current) {
        try { await cancelSystemSTT(); } catch { }
        sttListeningRef.current = false;
      }
      prevSlideActionRef.current = next;
    })();
  }, [slideUpAction]);

  // 发送语音消息
  const sendVoiceMessage = (duration: number, uri: string) => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    console.log('发送语音消息 - 时长:', duration, 'URI:', uri, '时间:', timeStr);

    const newMessage: Message = {
      id: `m${Date.now()}`,
      sender: 'me',
      text: uri, // 存储录音URI
      type: 'voice',
      duration: duration,
      time: timeStr,
    };
    setConversation(prev => [...prev, newMessage]);
  };

  // 语音按钮手势处理
  const voicePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: async (evt: GestureResponderEvent) => {
        slideStartY.current = evt.nativeEvent.pageY;
        slideStartX.current = evt.nativeEvent.pageX;
        currentSlideAction.current = 'none';
        setSlideUpAction('none');

        // 开始录音（带一次重试与重建）
        const startRecording = async () => {
          await ensureRecordingMode();
          await audioRecorder.prepareToRecordAsync();
          await audioRecorder.record();
        };
        try {
          await startRecording();
          recordingStartTimeRef.current = Date.now();
          isRecordingRef.current = true;
          setIsRecording(true);
          console.log('录音已开始，起始位置 X:', slideStartX.current, 'Y:', slideStartY.current);
        } catch (err: any) {
          console.warn('录音启动失败，尝试重建并重试:', err?.message || err);
          try {
            setRecorderReinitToggle((v) => !v);
            // 等待下一帧以便 hook 重新创建 SharedObject
            await new Promise((r) => setTimeout(r, 50));
            await startRecording();
            recordingStartTimeRef.current = Date.now();
            isRecordingRef.current = true;
            setIsRecording(true);
            console.log('录音重试成功');
          } catch (err2) {
            console.error('录音失败:', err2);
            Alert.alert('提示', '录音失败，请检查麦克风权限或重启页面');
          }
        }
      },
      onPanResponderMove: (evt: GestureResponderEvent) => {
        const currentY = evt.nativeEvent.pageY;
        const currentX = evt.nativeEvent.pageX;

        // 获取实际屏幕尺寸
        const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

        // 气泡位置（从底部往上的位置）
        // 输入框大约在底部60px，气泡在输入框上方60px
        const inputHeight = 60;
        const gapAboveInput = 60;
        const bubbleHeight = 60;
        const bubbleY = screenHeight - inputHeight - gapAboveInput - bubbleHeight; // 气泡顶部位置
        const bubbleWidth = 120;
        const bubblePadding = 40;

        // 左侧气泡区域（转文字）
        const convertBubble = {
          left: bubblePadding,
          right: bubblePadding + bubbleWidth,
          top: bubbleY,
          bottom: bubbleY + bubbleHeight,
        };

        // 右侧气泡区域（取消）
        const cancelBubble = {
          left: screenWidth - bubblePadding - bubbleWidth,
          right: screenWidth - bubblePadding,
          top: bubbleY,
          bottom: bubbleY + bubbleHeight,
        };

        let newAction: 'none' | 'convert' | 'cancel' = 'none';

        // 判断手指是否在气泡区域内
        if (currentX >= convertBubble.left && currentX <= convertBubble.right &&
          currentY >= convertBubble.top && currentY <= convertBubble.bottom) {
          newAction = 'convert';
        } else if (currentX >= cancelBubble.left && currentX <= cancelBubble.right &&
          currentY >= cancelBubble.top && currentY <= cancelBubble.bottom) {
          newAction = 'cancel';
        }

        if (newAction !== currentSlideAction.current) {
          console.log('✨ 气泡检测 - X:', currentX.toFixed(1), 'Y:', currentY.toFixed(1),
            '左气泡:', convertBubble.left, '-', convertBubble.right,
            '右气泡:', cancelBubble.left, '-', cancelBubble.right,
            '状态:', newAction);
          // 当切换到“转文字”时，尝试使用系统 STT 开始监听
          if (newAction === 'convert' && currentSlideAction.current !== 'convert' && isSystemSTTAvailable()) {
            // 停掉已有录音，切换为系统 STT（避免冲突）
            if (isRecordingRef.current) {
              (async () => {
                try { await audioRecorder.stop(); } catch { }
                isRecordingRef.current = false;
                setIsRecording(false);
              })();
            }
            (async () => {
              try {
                await ensureRecordingMode();
                await startSystemSTT('zh-CN');
                sttListeningRef.current = true;
              } catch (e) {
                console.warn('系统转写启动失败，继续走文件转写:', e);
                sttListeningRef.current = false;
              }
            })();
          }
          // 离开“转文字”区域则取消系统 STT（不发送）
          if (currentSlideAction.current === 'convert' && newAction !== 'convert' && sttListeningRef.current) {
            (async () => {
              try { await cancelSystemSTT(); } catch { }
              sttListeningRef.current = false;
            })();
          }
          currentSlideAction.current = newAction;
          setSlideUpAction(newAction);
        }
      },
      onPanResponderRelease: async () => {
        const endTime = Date.now();
        const startTime = recordingStartTimeRef.current;
        const durationMs = startTime ? endTime - startTime : 0;
        const duration = Math.max(1, Math.floor(durationMs / 1000));
        const finalAction = currentSlideAction.current;

        console.log('松开手指 - 开始时间:', startTime, '结束时间:', endTime, '时长(秒):', duration, '最终状态:', finalAction);

        // 停止录音
        let uri: string | null = null;
        try {
          if (isRecordingRef.current) {
            await audioRecorder.stop();
            uri = audioRecorder.uri;
            console.log('录音已保存:', uri);
          } else {
            console.warn('未处于录音状态，跳过停止');
          }
        } catch (err) {
          console.error('停止录音失败:', err);
        }

        if (finalAction === 'cancel') {
          console.log('取消发送');
          // 删除本地录音文件，避免占用空间
          if (uri) {
            try { await FileSystem.deleteAsync(uri, { idempotent: true }); } catch { }
          }
          if (sttListeningRef.current) {
            await cancelSystemSTT();
            sttListeningRef.current = false;
          }
        } else if (finalAction === 'convert') {
          try {
            let text = '';
            if (sttListeningRef.current && isSystemSTTAvailable()) {
              // 优先使用系统 STT
              text = (await stopSystemSTT()) || '';
              sttListeningRef.current = false;
            } else if (uri) {
              // 回退：文件转写（占位实现，可接入云端）
              await waitForFileReady(uri);
              const result = await transcribeAudio(uri);
              text = result.text;
              try { await FileSystem.deleteAsync(uri, { idempotent: true }); } catch { }
            }
            if (!text) text = '（未识别到有效语音）';
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            setConversation(prev => [
              ...prev,
              { id: `m${Date.now()}`, sender: 'me', text, type: 'text', time: timeStr },
            ]);
          } catch (err) {
            console.error('转文字失败:', err);
            Alert.alert('转文字失败', '请稍后重试或检查系统语音识别权限/服务');
          }
        } else {
          // 发送语音消息
          if (uri && isRecordingRef.current) {
            sendVoiceMessage(duration, uri);
          }
        }
        isRecordingRef.current = false;
        setIsRecording(false);
        setSlideUpAction('none');
        currentSlideAction.current = 'none';
      },
      onPanResponderTerminate: async () => {
        console.log('手势被中断');
        try {
          await audioRecorder.stop();
        } catch (err) {
          console.error('停止录音失败:', err);
        }
        setIsRecording(false);
        setSlideUpAction('none');
      },
    })
  ).current;
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
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const [messageMenuPosition, setMessageMenuPosition] = useState<{ x: number; y: number; message: Message; showBelow: boolean } | null>(null);

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

  const handleMessageLongPress = (message: Message, event: any) => {
    if (message.sender === 'system') {
      return;
    }
    if (isMultiSelectMode) {
      toggleMessageSelection(message.id);
      return;
    }
    // 获取触摸位置
    const { pageX, pageY } = event.nativeEvent;
    const screenHeight = Dimensions.get('window').height;
    const menuHeight = 90; // 菜单实际高度
    const messageHeight = 60; // 消息气泡大约高度
    const arrowHeight = 8; // 箭头高度
    const spacing = 10; // 间距

    // 计算上方和下方的可用空间
    const topSpace = pageY - messageHeight / 2;
    const bottomSpace = screenHeight - pageY - messageHeight / 2;

    // 判断应该显示在上方还是下方
    // 如果上方空间不足以显示菜单，则显示在下方
    const showBelow = topSpace < menuHeight + arrowHeight + spacing;

    setMessageMenuPosition({ x: pageX, y: pageY, message, showBelow });
  };

  const closeMessageMenu = () => {
    setMessageMenuPosition(null);
  };

  const closeActionSheet = () => {
    setActionSheetVisible(false);
    setSelectedMessage(null);
  };

  const toggleMessageSelection = (messageId: string) => {
    setSelectedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const exitMultiSelectMode = () => {
    setIsMultiSelectMode(false);
    setSelectedMessages(new Set());
  };

  const deleteSelectedMessages = () => {
    Alert.alert('删除消息', `确定要删除选中的 ${selectedMessages.size} 条消息吗？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => {
          setConversation(prev => prev.filter(msg => !selectedMessages.has(msg.id)));
          exitMultiSelectMode();
        }
      }
    ]);
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
    closeMessageMenu();
    setIsMultiSelectMode(true);
    if (messageMenuPosition?.message) {
      setSelectedMessages(new Set([messageMenuPosition.message.id]));
    }
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

    const isSelected = selectedMessages.has(item.id);

    return (
      <TouchableOpacity
        style={[styles.messageRow, isMe ? styles.messageRowMe : styles.messageRowOther]}
        onPress={() => {
          if (isMultiSelectMode) {
            toggleMessageSelection(item.id);
          }
        }}
        onLongPress={(e) => handleMessageLongPress(item, e)}
        delayLongPress={250}
        activeOpacity={isMultiSelectMode ? 0.7 : 1}
      >
        {isMultiSelectMode && (
          <View style={styles.checkboxContainer}>
            <View style={[styles.checkbox, isSelected && styles.checkboxSelected, { borderColor: colors.border }]}>
              {isSelected && <Ionicons name="checkmark" size={16} color="#ffffff" />}
            </View>
          </View>
        )}
        <View style={[isMe ? styles.avatarMe : styles.avatar, { backgroundColor: isMe ? colors.avatarBackgroundMe : colors.avatarBackground }]}>
          <Text style={isMe ? styles.avatarTextMe : styles.avatarText}>
            {isMe ? '我' : contact?.avatar || contact?.name?.charAt(0) || chatId === 'assistant' ? '文' : chatId === 'group' ? '团' : chatId === 'notifications' ? '通' : '联'}
          </Text>
        </View>
        <View
          style={[styles.messageContent, isMe && styles.messageContentMe]}
        >
          {item.type === 'voice' ? (
            <TouchableOpacity
              style={[
                styles.voiceMessageBubble,
                isMe ? { backgroundColor: colors.chatBubbleMe } : { backgroundColor: colors.chatBubbleOther }
              ]}
              onPress={async () => {
                if (playingVoiceId === item.id) {
                  // 停止播放
                  try {
                    if (playingPlayerRef.current) {
                      playingPlayerRef.current.pause();
                      playingPlayerRef.current = null;
                    }
                    setPlayingVoiceId(null);
                    console.log('停止播放');

                    // 恢复录音模式
                    await setAudioModeAsync({
                      allowsRecording: true,
                      playsInSilentMode: true,
                      interruptionMode: 'doNotMix',
                      interruptionModeAndroid: 'duckOthers',
                    });
                    await setIsAudioActiveAsync(false);
                  } catch (err) {
                    console.error('停止播放失败:', err);
                  }
                } else {
                  // 开始播放
                  try {
                    const voiceUri = item.text; // URI存储在text字段
                    if (voiceUri) {
                      console.log('开始播放语音:', voiceUri);
                      // 确保录音文件已完全写入
                      const ready = await waitForFileReady(voiceUri);
                      if (!ready) {
                        console.warn('录音文件尚未就绪，强制尝试播放');
                      }
                      // iOS 上通过 Asset 下载到本地缓存，确保 AVPlayer 能读取
                      let finalUri = voiceUri;
                      try {
                        let asset = Asset.fromURI(voiceUri);
                        if (!asset.type) {
                          asset = new Asset({ name: asset.name, type: 'm4a', uri: asset.uri });
                        }
                        await asset.downloadAsync();
                        if (asset.localUri) {
                          finalUri = asset.localUri;
                        }
                      } catch (e) {
                        console.warn('通过 Asset 准备录音资源失败，使用原始 URI:', e);
                      }

                      // 设置音频模式为播放模式
                      await setAudioModeAsync({
                        allowsRecording: false,
                        playsInSilentMode: true,
                        interruptionMode: 'doNotMix',
                        interruptionModeAndroid: 'duckOthers',
                        shouldRouteThroughEarpiece: false,
                      });
                      await setIsAudioActiveAsync(true);

                      // 使用统一的等待加载逻辑
                      playUriWhenReady(finalUri);

                      setPlayingVoiceId(item.id);
                      console.log('播放已启动，时长:', item.duration, '秒');

                      // 保存定时器引用以便可以取消
                      playingPlayerRef.current = audioPlayer;
                    }
                  } catch (err) {
                    console.error('播放失败:', err);
                    Alert.alert('提示', `播放失败，请检查音量设置`);
                  }
                }
              }}
            >
              <View style={styles.voiceMessageContent}>
                <Ionicons
                  name={playingVoiceId === item.id ? "volume-high" : "mic"}
                  size={24}
                  color={isMe ? '#ffffff' : colors.text}
                />
                <View style={styles.voiceWaveContainer}>
                  {([8, 12, 16, 12] as const).map((baseH, idx) => {
                    const amp = [0.7, 1.2, 1.7, 1.0][idx];
                    const scaleY = playingVoiceId === item.id
                      ? playbackWaveAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1 + 0.6 * amp] })
                      : 1;
                    return (
                      <Animated.View
                        key={idx}
                        style={[
                          styles.voiceWave,
                          {
                            height: baseH,
                            backgroundColor: isMe ? '#ffffff' : colors.primary,
                            transform: [{ scaleY }],
                          },
                        ]}
                      />
                    );
                  })}
                </View>
                <Text style={[styles.voiceDuration, { color: isMe ? '#ffffff' : colors.text }]}>
                  {item.duration}"
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={[styles.messageBubble, isMe ? { backgroundColor: colors.chatBubbleMe } : { backgroundColor: colors.chatBubbleOther }]}>
              <Text style={[styles.messageText, { color: colors.text }]}>{item.text}</Text>
            </View>
          )}
          {item.time && <Text style={[styles.messageTime, { color: colors.textTertiary }, isMe && styles.messageTimeMe]}>{item.time}</Text>}
        </View>
      </TouchableOpacity>
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
          {/* 横向滑动提示气泡 */}
          {isRecording && (
            <View style={styles.slideHintContainer}>
              <Animated.View
                style={[
                  styles.slideHintBubble,
                  slideUpAction === 'convert' && styles.slideHintActive,
                  {
                    transform: [{
                      scale: slideUpAction === 'convert' ? 1.15 : 1
                    }]
                  }
                ]}
              >
                <Ionicons name="text" size={24} color={slideUpAction === 'convert' ? '#07C160' : '#666'} />
                <Text style={[styles.slideHintText, slideUpAction === 'convert' && styles.slideHintTextActive]}>
                  转文字
                </Text>
              </Animated.View>
              <Animated.View
                style={[
                  styles.slideHintBubble,
                  slideUpAction === 'cancel' && styles.slideHintActive,
                  {
                    transform: [{
                      scale: slideUpAction === 'cancel' ? 1.15 : 1
                    }]
                  }
                ]}
              >
                <Ionicons name="close-circle" size={24} color={slideUpAction === 'cancel' ? '#FA5151' : '#666'} />
                <Text style={[styles.slideHintText, slideUpAction === 'cancel' && styles.slideHintTextActive]}>
                  取消发送
                </Text>
              </Animated.View>
            </View>
          )}

          <View style={[styles.inputBubble, { backgroundColor: colors.backgroundSecondary, shadowColor: colors.cardShadow }]}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.backgroundTertiary }]}
              onPress={() => setIsVoiceMode(!isVoiceMode)}
            >
              <Ionicons
                name={isVoiceMode ? "keypad" : "mic"}
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>

            {isVoiceMode ? (
              <View
                {...voicePanResponder.panHandlers}
                style={[
                  styles.voiceButton,
                  {
                    backgroundColor: isRecording
                      ? (slideUpAction === 'cancel' ? '#FA5151' : colors.primary)
                      : colors.backgroundTertiary
                  },
                ]}
              >
                <Animated.View style={{ transform: [{ scale: voiceWaveAnim }] }}>
                  <Ionicons
                    name="mic"
                    size={20}
                    color={isRecording ? '#ffffff' : colors.text}
                  />
                </Animated.View>
                <Text style={[styles.voiceButtonText, { color: isRecording ? '#ffffff' : colors.text }]}>
                  {isRecording
                    ? (slideUpAction === 'cancel' ? '松开 取消' : slideUpAction === 'convert' ? '松开 转文字' : '松开 发送')
                    : '按住 说话'}
                </Text>
              </View>
            ) : (
              <>
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
              </>
            )}

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.backgroundTertiary }]}
              onPress={() => setShowPlusMenu(!showPlusMenu)}
            >
              <Ionicons name="add" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

      </KeyboardAvoidingView>

      {/* 加号菜单 - 在输入框下方 */}
      {showPlusMenu && (
        <View style={[styles.plusMenuContainer, { backgroundColor: colors.background }]}>
          <View style={styles.plusMenuGrid}>
            <TouchableOpacity
              style={styles.plusMenuItem}
              onPress={async () => {
                setShowPlusMenu(false);
                try {
                  const ImagePicker = await import('expo-image-picker');
                  const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: false,
                    quality: 0.8,
                  });
                  if (!result.canceled) {
                    Alert.alert('成功', '图片已选择');
                  }
                } catch (error) {
                  Alert.alert('提示', '图片选择功能需要安装 expo-image-picker');
                }
              }}
            >
              <View style={[styles.plusMenuIcon, { backgroundColor: '#FFF5E6' }]}>
                <Ionicons name="image" size={28} color="#FF9500" />
              </View>
              <Text style={[styles.plusMenuText, { color: colors.text }]}>相册</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.plusMenuItem}
              onPress={async () => {
                setShowPlusMenu(false);
                try {
                  const ImagePicker = await import('expo-image-picker');
                  const result = await ImagePicker.launchCameraAsync({
                    allowsEditing: false,
                    quality: 0.8,
                  });
                  if (!result.canceled) {
                    Alert.alert('成功', '照片已拍摄');
                  }
                } catch (error) {
                  Alert.alert('提示', '相机功能需要安装 expo-image-picker');
                }
              }}
            >
              <View style={[styles.plusMenuIcon, { backgroundColor: '#E6F7FF' }]}>
                <Ionicons name="camera" size={28} color="#1890FF" />
              </View>
              <Text style={[styles.plusMenuText, { color: colors.text }]}>拍摄</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.plusMenuItem}
              onPress={() => {
                setShowPlusMenu(false);
                Alert.alert('提示', '转账功能开发中');
              }}
            >
              <View style={[styles.plusMenuIcon, { backgroundColor: '#F0FFF4' }]}>
                <Ionicons name="cash" size={28} color="#52C41A" />
              </View>
              <Text style={[styles.plusMenuText, { color: colors.text }]}>转账</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {/* 消息长按菜单 - 智能显示在消息上方或下方 */}
      {messageMenuPosition && (
        <Modal
          visible={true}
          transparent
          animationType="fade"
          onRequestClose={closeMessageMenu}
        >
          <TouchableOpacity
            style={styles.messageMenuOverlay}
            activeOpacity={1}
            onPress={closeMessageMenu}
          >
            <View
              style={[
                styles.messageMenuWrapper,
                {
                  top: messageMenuPosition.showBelow
                    ? messageMenuPosition.y + 40  // 消息下方，留出消息高度的一半
                    : messageMenuPosition.y - 120, // 消息上方，菜单高度 + 箭头 + 间距
                  left: Math.max(10, Math.min(messageMenuPosition.x - 120, Dimensions.get('window').width - 250)),
                }
              ]}
            >
              {/* 顶部小箭头 - 当菜单在下方时显示 */}
              {messageMenuPosition.showBelow && (
                <View style={[styles.messageMenuArrowTop, { borderBottomColor: colors.backgroundSecondary }]} />
              )}

              <View
                style={[
                  styles.messageMenuContainer,
                  { backgroundColor: colors.backgroundSecondary }
                ]}
              >
                <View style={styles.messageMenuGrid}>
                  <TouchableOpacity
                    style={styles.messageMenuItem}
                    onPress={async () => {
                      await Clipboard.setStringAsync(messageMenuPosition.message.text);
                      closeMessageMenu();
                      Alert.alert('已复制');
                    }}
                  >
                    <Ionicons name="copy-outline" size={20} color={colors.text} />
                    <Text style={[styles.messageMenuText, { color: colors.text }]}>复制</Text>
                  </TouchableOpacity>

                  {messageMenuPosition.message.sender === 'me' && (
                    <TouchableOpacity
                      style={styles.messageMenuItem}
                      onPress={() => {
                        setConversation(prev => prev.filter(msg => msg.id !== messageMenuPosition.message.id));
                        closeMessageMenu();
                      }}
                    >
                      <Ionicons name="arrow-undo-outline" size={20} color={colors.text} />
                      <Text style={[styles.messageMenuText, { color: colors.text }]}>撤回</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.messageMenuItem}
                    onPress={handleMultiSelect}
                  >
                    <Ionicons name="checkmark-circle-outline" size={20} color={colors.text} />
                    <Text style={[styles.messageMenuText, { color: colors.text }]}>多选</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.messageMenuItem}
                    onPress={() => {
                      closeMessageMenu();
                      Alert.alert('收藏成功');
                    }}
                  >
                    <Ionicons name="star-outline" size={20} color={colors.text} />
                    <Text style={[styles.messageMenuText, { color: colors.text }]}>收藏</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 底部小箭头 - 当菜单在上方时显示 */}
              {!messageMenuPosition.showBelow && (
                <View style={[styles.messageMenuArrowBottom, { borderTopColor: colors.backgroundSecondary }]} />
              )}
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* 多选模式工具栏 */}
      {isMultiSelectMode && (
        <View style={[styles.multiSelectToolbar, { backgroundColor: colors.backgroundSecondary, borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={exitMultiSelectMode}
          >
            <Text style={[styles.toolbarButtonText, { color: colors.text }]}>取消</Text>
          </TouchableOpacity>
          <Text style={[styles.toolbarTitle, { color: colors.text }]}>
            已选择 {selectedMessages.size} 条
          </Text>
          <TouchableOpacity
            style={[styles.toolbarButton, selectedMessages.size === 0 && styles.toolbarButtonDisabled]}
            onPress={deleteSelectedMessages}
            disabled={selectedMessages.size === 0}
          >
            <Text style={[styles.toolbarButtonText, { color: selectedMessages.size > 0 ? colors.destructive : colors.textTertiary }]}>
              删除
            </Text>
          </TouchableOpacity>
        </View>
      )}

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
  slideHintContainer: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
  },
  slideHintBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    minWidth: 120,
  },
  slideHintActive: {
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  slideHintText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  slideHintTextActive: {
    color: '#07C160',
    fontWeight: '700',
  },
  voiceMessageBubble: {
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minWidth: 120,
    maxWidth: 220,
  },
  voiceMessageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  voiceWaveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flex: 1,
  },
  voiceWave: {
    width: 4,
    borderRadius: 2,
  },
  voiceDuration: {
    fontSize: 15,
    fontWeight: '600',
  },
  voiceButton: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  voiceButtonText: {
    fontSize: 16,
    fontWeight: '500',
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
  plusMenuContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  plusMenuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  plusMenuItem: {
    alignItems: 'center',
    gap: 10,
    width: 70,
  },
  plusMenuIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusMenuText: {
    fontSize: 13,
    textAlign: 'center',
  },
  messageMenuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  messageMenuWrapper: {
    position: 'absolute',
    alignItems: 'center',
  },
  messageMenuContainer: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 240,
  },
  messageMenuGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 4,
  },
  messageMenuItem: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    gap: 4,
    flex: 1,
  },
  messageMenuText: {
    fontSize: 11,
  },
  messageMenuArrowTop: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginBottom: -1,
    alignSelf: 'center',
  },
  messageMenuArrowBottom: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
    alignSelf: 'center',
  },
  checkboxContainer: {
    justifyContent: 'center',
    marginRight: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#07C160',
    borderColor: '#07C160',
  },
  multiSelectToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 0.5,
  },
  toolbarButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  toolbarButtonText: {
    fontSize: 16,
  },
  toolbarButtonDisabled: {
    opacity: 0.5,
  },
  toolbarTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
});
