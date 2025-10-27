import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { SectionList as SectionListType } from 'react-native';
import {
  Alert,
  Animated,
  FlatList,
  Platform,
  ScrollView,
  SectionList,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import type { Edge } from 'react-native-safe-area-context';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../../hooks/useThemeColors';
import {
  Contact,
  contactFeatures,
  getAllInitials,
  groupContactsByInitial,
  mockContacts,
  searchContacts
} from '../../models/contacts';
import { getUserProfile } from '../../models/user';

type ChatItem = {
  id: string;
  name: string;
  message: string;
  time: string;
  unread: number;
  pinned?: boolean;
};

const initialChats: ChatItem[] = [
  { id: 'assistant', name: '文件传输助手', message: '你可以在这里接收文件', time: '上午 10:30', unread: 0, pinned: true },
  { id: '1', name: '张三', message: '好的，明天见！', time: '上午 9:45', unread: 2 },
  { id: '2', name: '李四', message: '项目进展如何？', time: '昨天', unread: 1 },
  { id: '3', name: '王五', message: '收到，谢谢！', time: '星期三', unread: 0 },
  { id: 'group', name: '团队群', message: '赵六: 会议改到下午3点', time: '星期二', unread: 5 },
  { id: 'notifications', name: '通知', message: '系统维护通知', time: '星期一', unread: 0 },
];

export default function WeChatScreen() {
  const { colors, isDark } = useThemeColors();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('chats');
  const [contactsSearchQuery, setContactsSearchQuery] = useState('');
  const [chats, setChats] = useState<ChatItem[]>(() => initialChats);
  const sectionListRef = useRef<SectionListType<Contact>>(null);
  const swipeableRefs = useRef<{ [key: string]: Swipeable }>({});
  const [userProfile, setUserProfile] = useState(getUserProfile());
  const [showMenu, setShowMenu] = useState(false);
  // 判断是否为iOS 26及以上系统
  const isIOS26OrAbove = Platform.OS === 'ios' && Number.parseInt(String(Platform.Version), 10) >= 26;
  const router = useRouter();
  const safeAreaInsets = useSafeAreaInsets();
  const topInset = safeAreaInsets?.top ?? 0;
  const computedMenuTop = useMemo(() => {
    if (isIOS26OrAbove) {
      // Native header height ~44 + safe area inset + small offset
      return Math.max(8, topInset) + 44 + 6;
    }
    // Custom header heights
    return Platform.OS === 'ios' ? 50 : 60;
  }, [isIOS26OrAbove, topInset]);
  // iOS 26+ 使用原生导航栏（已包含状态栏），不需要 top edge
  // iOS 26以下使用自定义导航栏，需要 top edge
  const safeAreaEdges: Edge[] = isIOS26OrAbove
    ? ['left', 'right', 'bottom']
    : ['top', 'left', 'right', 'bottom'];
  const [searchQuery, setSearchQuery] = useState('');

  // 配置 iOS 26+ 的原生导航栏深色模式
  useLayoutEffect(() => {
    if (isIOS26OrAbove) {
      const title = activeTab === 'chats' ? '微信' :
        activeTab === 'contacts' ? '通讯录' :
          activeTab === 'discover' ? '发现' : '我';

      navigation.setOptions({
        title,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          color: colors.text,
        },
        headerShadowVisible: false,
        headerRight: () => (
          activeTab === 'contacts' ? (
            <TouchableOpacity style={{ paddingHorizontal: 8 }} onPress={() => router.push('/wechat/contact-add' as any)}>
              <Ionicons name="person-add" size={22} color={colors.text} />
            </TouchableOpacity>
          ) : activeTab === 'chats' ? (
            <TouchableOpacity style={{ paddingHorizontal: 8 }} onPress={() => setShowMenu((v) => !v)}>
              <Ionicons name="add-circle" size={22} color={colors.text} />
            </TouchableOpacity>
          ) : null
        ),
      });
    }
  }, [isIOS26OrAbove, activeTab, colors, navigation, router]);

  // 更新导航栏标题的函数
  // 监听标签页变化，更新导航栏标题
  useEffect(() => {
    if (isIOS26OrAbove) {
      router.setParams({ tab: activeTab });
    }
  }, [activeTab, isIOS26OrAbove, router]);

  // 确保路由参数与当前标签页同步
  useFocusEffect(
    useCallback(() => {
      if (isIOS26OrAbove) {
        router.setParams({ tab: activeTab });
      }
      // 页面获得焦点时关闭所有Swipeable
      closeAllSwipeables();
      // 刷新用户信息
      setUserProfile(getUserProfile());
    }, [router, activeTab, isIOS26OrAbove])
  );

  // 时间格式化函数
  const formatTime = (timeString: string) => {
    // 如果已经是特殊格式（如"昨天"、"星期三"等），则直接返回
    if (['昨天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'].includes(timeString)) {
      return timeString;
    }

    // 尝试解析时间格式
    const time = new Date(timeString);
    if (isNaN(time.getTime())) {
      // 如果无法解析，直接返回原始字符串
      return timeString;
    }

    const now = new Date();
    const diff = now.getTime() - time.getTime();
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

    // 如果是今天
    if (diffDays === 0) {
      return time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    }

    // 如果是昨天
    if (diffDays === 1) {
      return '昨天';
    }

    // 如果是今年
    if (time.getFullYear() === now.getFullYear()) {
      // 显示月份和日期
      return `${time.getMonth() + 1}月${time.getDate()}日`;
    }

    // 如果是其他年份
    return `${time.getFullYear()}年${time.getMonth() + 1}月${time.getDate()}日`;
  };

  // 过滤和分组联系人
  const { groupedContacts, initials } = useMemo(() => {
    const filtered = searchContacts(mockContacts, contactsSearchQuery);
    const grouped = groupContactsByInitial(filtered);
    const initialsList = getAllInitials(filtered);

    return {
      groupedContacts: grouped,
      initials: initialsList,
    };
  }, [contactsSearchQuery]);

  const contactSections = useMemo(
    () =>
      Object.entries(groupedContacts).map(([title, contacts]) => ({
        title,
        data: contacts,
      })),
    [groupedContacts]
  );

  // 渲染聊天页面
  const sortedChats = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) {
      return chats;
    }

    return chats.filter(
      (chat) =>
        chat.name.toLowerCase().includes(keyword) || chat.message.toLowerCase().includes(keyword)
    );
  }, [chats, searchQuery]);

  const handleTogglePin = (chatId: string) => {
    setChats((prev) => {
      const next = prev.map((chat) =>
        chat.id === chatId ? { ...chat, pinned: !chat.pinned } : chat
      );
      return next
        .filter((chat) => chat.pinned)
        .concat(next.filter((chat) => !chat.pinned));
    });
  };

  const handleDeleteChat = (chatId: string) => {
    setChats((prev) => prev.filter((chat) => chat.id !== chatId));
  };

  // 关闭所有打开的Swipeable
  const closeAllSwipeables = () => {
    Object.values(swipeableRefs.current).forEach(ref => {
      ref?.close();
    });
  };

  const renderRightActions = (
    item: ChatItem,
    _progress: Animated.AnimatedInterpolation<string | number>,
    dragX: Animated.AnimatedInterpolation<string | number>
  ) => {
    const translateX = dragX.interpolate({
      inputRange: [-120, 0],
      outputRange: [0, 60],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[styles.swipeActionsContainer, { transform: [{ translateX }] }]}
      >
        <TouchableOpacity
          style={[styles.swipeActionButton, styles.pinAction]}
          onPress={() => handleTogglePin(item.id)}
        >
          <Text style={styles.swipeActionText}>{item.pinned ? '取消置顶' : '置顶'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.swipeActionButton, styles.deleteAction]}
          onPress={() =>
            Alert.alert('删除聊天', `确定要删除与${item.name}的聊天吗？`, [
              { text: '取消', style: 'cancel' },
              { text: '删除', style: 'destructive', onPress: () => handleDeleteChat(item.id) },
            ])
          }
        >
          <Text style={styles.swipeActionText}>删除</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderChats = () => {
    const renderChatItem = ({ item }: { item: ChatItem }) => {
      // 统一使用 Swipeable，安卓和iOS都支持滑动删除
      return (
        <Swipeable
          ref={(ref) => {
            if (ref) {
              swipeableRefs.current[item.id] = ref;
            }
          }}
          overshootRight={false}
          renderRightActions={(progress, dragX) => renderRightActions(item, progress, dragX)}
          onSwipeableOpen={() => {
            // 关闭其他所有Swipeable
            Object.keys(swipeableRefs.current).forEach(key => {
              if (key !== item.id) {
                swipeableRefs.current[key]?.close();
              }
            });
          }}
          // 配置滑动阈值来区分垂直滚动和水平滑动
          friction={2}
          leftThreshold={30}
          rightThreshold={30}
          // 设置垂直方向的失败阈值，使垂直滑动更容易传递给父组件
          failOffsetY={[-15, 15]}  // 当垂直移动超过15px时，不触发Swipeable，而是传递给父级（FlatList）
          // 安卓特定优化
          {...(Platform.OS === 'android' && {
            friction: 2.5,
            overshootFriction: 8,
          })}
        >
          <TouchableOpacity
            style={[
              styles.chatItem,
              { backgroundColor: colors.backgroundSecondary, borderBottomColor: colors.borderLight },
              item.pinned && { backgroundColor: colors.backgroundTertiary }
            ]}
            onPress={() => {
              // 点击聊天项时关闭所有Swipeable
              closeAllSwipeables();
              router.push(`/wechat/chat-detail?id=${item.id}` as any);
            }}
          >
            <View style={[styles.avatar, { backgroundColor: colors.avatarBackground }]}>
              <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
            </View>
            <View style={styles.chatInfo}>
              <View style={styles.chatHeader}>
                <Text style={[styles.chatName, { color: colors.text }]}>{item.name}</Text>
                <View style={styles.chatHeaderRight}>
                  <Text style={[styles.chatTime, { color: colors.textTertiary }]}>{formatTime(item.time)}</Text>
                  {item.unread > 0 && (
                    <View style={[styles.unreadBadge, { backgroundColor: colors.destructive }]}>
                      <Text style={styles.unreadText}>{item.unread > 99 ? '99+' : item.unread}</Text>
                    </View>
                  )}
                </View>
              </View>
              <Text style={[styles.chatMessage, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.message}
              </Text>
            </View>
          </TouchableOpacity>
        </Swipeable>
      );
    };

    return (
      <View style={[styles.chatsContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.chatsSearchContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.chatsSearchInputContainer, {
            backgroundColor: isDark ? 'rgba(118, 118, 128, 0.24)' : 'rgba(142, 142, 147, 0.12)',
          }]}>
            <Ionicons name="search" size={18} color={isDark ? 'rgba(235, 235, 245, 0.6)' : 'rgba(60, 60, 67, 0.6)'} style={styles.searchIcon} />
            <TextInput
              style={[styles.chatsSearchInput, { color: colors.text }]}
              placeholder="搜索"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={isDark ? 'rgba(235, 235, 245, 0.6)' : 'rgba(60, 60, 67, 0.6)'}
              underlineColorAndroid="transparent"
              onFocus={() => closeAllSwipeables()}
              multiline={false}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
          </View>
        </View>

        <FlatList
          data={sortedChats}
          keyExtractor={(item) => item.id}
          renderItem={renderChatItem}
          contentContainerStyle={[
            styles.chatItemsContainer,
            { backgroundColor: colors.background },
            // 确保内容至少占满屏幕高度，以便能够滚动
            sortedChats.length === 0 ? { flex: 1, justifyContent: 'center' } : { minHeight: '100%' }
          ]}
          showsVerticalScrollIndicator={false}
          style={styles.chatsListContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>没有找到相关聊天</Text>
            </View>
          }
          scrollEnabled={true}
          nestedScrollEnabled={false}  // 禁用嵌套滚动，因为Swipeables在其中
          removeClippedSubviews={false}  // 防止在安卓上截断子视图
          onScrollBeginDrag={() => closeAllSwipeables()}  // 开始滚动时关闭所有Swipeable
          overScrollMode="never"  // 防止过度滚动效果
          // 确保列表可以滚动，即使内容不够多
          scrollEventThrottle={16}
        />
      </View>
    );
  };

  // 渲染通讯录页面
  const renderContacts = () => {
    // 渲染联系人项
    const renderContactItem = ({ item }: { item: Contact }) => (
      <TouchableOpacity
        style={[styles.contactItem, { backgroundColor: colors.backgroundSecondary, borderBottomColor: colors.borderLight }]}
        onPress={() => {
          // 点击联系人时关闭所有Swipeable
          closeAllSwipeables();
          router.push(`/wechat/contact-detail?id=${item.id}` as any);
        }}
      >
        <View style={[styles.avatar, { backgroundColor: colors.avatarBackground }]}>
          <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
        </View>
        <Text style={[styles.contactName, { color: colors.text }]}>{item.name}</Text>
      </TouchableOpacity>
    );

    // 渲染分组标题
    const renderSectionHeader = ({ title }: { title: string }) => (
      <View style={[styles.sectionHeader, { backgroundColor: colors.backgroundTertiary }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{title}</Text>
      </View>
    );

    // 渲染右侧字母索引
    const renderAlphabetIndex = () => (
      <View style={styles.alphabetIndex}>
        {initials.map((initial, index) => (
          <TouchableOpacity
            key={initial}
            style={styles.alphabetItem}
            onPress={() => {
              closeAllSwipeables();
              sectionListRef.current?.scrollToLocation({
                sectionIndex: index,
                itemIndex: 0,
                animated: true,
              });
            }}
          >
            <Text style={[styles.alphabetText, { color: colors.textSecondary }]}>{initial}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );

    return (
      <View style={[styles.contactsContainer, { backgroundColor: colors.backgroundSecondary }]}
        onStartShouldSetResponder={() => {
          // 在容器上点击时关闭所有Swipeable
          closeAllSwipeables();
          return false;
        }}
      >
        <SectionList
          ref={sectionListRef}
          sections={contactSections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => renderContactItem({ item })}
          renderSectionHeader={({ section }) => renderSectionHeader({ title: section.title })}
          stickySectionHeadersEnabled
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.contactsListContent, { backgroundColor: colors.backgroundSecondary }]}
          ListHeaderComponent={(
            <>
              <View style={[styles.contactsSearchContainer, { backgroundColor: colors.background }]}>
                <View style={[styles.contactsSearchInput, {
                  backgroundColor: isDark ? 'rgba(118, 118, 128, 0.24)' : 'rgba(142, 142, 147, 0.12)',
                }]}>
                  <Ionicons name="search" size={18} color={isDark ? 'rgba(235, 235, 245, 0.6)' : 'rgba(60, 60, 67, 0.6)'} />
                  <TextInput
                    style={[styles.contactsSearchTextInput, { color: colors.text }]}
                    placeholder="搜索"
                    value={contactsSearchQuery}
                    onChangeText={setContactsSearchQuery}
                    placeholderTextColor={isDark ? 'rgba(235, 235, 245, 0.6)' : 'rgba(60, 60, 67, 0.6)'}
                    underlineColorAndroid="transparent"
                    onFocus={() => closeAllSwipeables()}
                    returnKeyType="search"
                  />
                </View>
              </View>

              <View style={[styles.featuresContainer, { backgroundColor: colors.backgroundSecondary, borderBottomColor: colors.backgroundTertiary }]}>
                {contactFeatures.map((feature, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.featureItem, { borderBottomColor: colors.borderLight }]}
                    onPress={() => {
                      if (feature.route) {
                        // 点击功能项时关闭所有Swipeable
                        closeAllSwipeables();
                        router.push(feature.route as any);
                      }
                    }}
                  >
                    <View style={[styles.featureIcon, { backgroundColor: feature.bgColor }]}>
                      <Ionicons name={feature.icon as any} size={24} color={feature.iconColor} />
                    </View>
                    <Text style={[styles.featureName, { color: colors.text }]}>{feature.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        />

        {/* 右侧字母索引 */}
        {renderAlphabetIndex()}
      </View>
    );
  };

  // 渲染发现页面
  const renderDiscover = () => {
    return (
      <ScrollView style={[styles.scrollView, { backgroundColor: colors.background }]}>
        {/* 发现页面功能项 */}
        <TouchableOpacity
          style={[styles.meFeatureItem, {
            backgroundColor: colors.backgroundSecondary,
            borderBottomColor: colors.borderLight
          }]}
          onPress={() => router.push('/wechat/discover/moments')}
        >
          <View style={[styles.meFeatureIcon, { backgroundColor: '#FFFAF0' }]}>
            <Ionicons name="images" size={24} color="#F6AD55" />
          </View>
          <Text style={[styles.meFeatureTitle, { color: colors.text }]}>朋友圈</Text>
          <View style={styles.meFeatureRight}>
            <Ionicons name="chevron-forward" size={24} color={colors.textTertiary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.meFeatureItem, {
            backgroundColor: colors.backgroundSecondary,
            borderBottomColor: colors.borderLight
          }]}
        >
          <View style={[styles.meFeatureIcon, { backgroundColor: '#F0FFF4' }]}>
            <Ionicons name="scan" size={24} color="#4FD1C7" />
          </View>
          <Text style={[styles.meFeatureTitle, { color: colors.text }]}>扫一扫</Text>
          <View style={styles.meFeatureRight}>
            <Ionicons name="chevron-forward" size={24} color={colors.textTertiary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.meFeatureItem, {
            backgroundColor: colors.backgroundSecondary,
            borderBottomColor: colors.borderLight
          }]}
        >
          <View style={[styles.meFeatureIcon, { backgroundColor: '#F3E8FF' }]}>
            <Ionicons name="reload" size={24} color="#9F7AEA" />
          </View>
          <Text style={[styles.meFeatureTitle, { color: colors.text }]}>摇一摇</Text>
          <View style={styles.meFeatureRight}>
            <Ionicons name="chevron-forward" size={24} color={colors.textTertiary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.meFeatureItem, {
            backgroundColor: colors.backgroundSecondary,
            borderBottomColor: colors.borderLight
          }]}
        >
          <View style={[styles.meFeatureIcon, { backgroundColor: '#FEE7F0' }]}>
            <Ionicons name="eye" size={24} color="#ED64A6" />
          </View>
          <Text style={[styles.meFeatureTitle, { color: colors.text }]}>看一看</Text>
          <View style={styles.meFeatureRight}>
            <Ionicons name="chevron-forward" size={24} color={colors.textTertiary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.meFeatureItem, {
            backgroundColor: colors.backgroundSecondary,
            borderBottomColor: colors.borderLight
          }]}
        >
          <View style={[styles.meFeatureIcon, { backgroundColor: '#EBF8FF' }]}>
            <Ionicons name="search" size={24} color="#63B3ED" />
          </View>
          <Text style={[styles.meFeatureTitle, { color: colors.text }]}>搜一搜</Text>
          <View style={styles.meFeatureRight}>
            <Ionicons name="chevron-forward" size={24} color={colors.textTertiary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.meFeatureItem, {
            backgroundColor: colors.backgroundSecondary,
            borderBottomColor: colors.borderLight
          }]}
        >
          <View style={[styles.meFeatureIcon, { backgroundColor: '#F3E8FF' }]}>
            <Ionicons name="game-controller" size={24} color="#805AD5" />
          </View>
          <Text style={[styles.meFeatureTitle, { color: colors.text }]}>游戏</Text>
          <View style={styles.meFeatureRight}>
            <Ionicons name="chevron-forward" size={24} color={colors.textTertiary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.meFeatureItem, {
            backgroundColor: colors.backgroundSecondary,
            borderBottomColor: colors.borderLight
          }]}
        >
          <View style={[styles.meFeatureIcon, { backgroundColor: '#F0FDFA' }]}>
            <Ionicons name="apps" size={24} color="#38B2AC" />
          </View>
          <Text style={[styles.meFeatureTitle, { color: colors.text }]}>小程序</Text>
          <View style={styles.meFeatureRight}>
            <Ionicons name="chevron-forward" size={24} color={colors.textTertiary} />
          </View>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  // 渲染个人页面
  const renderMe = () => {
    return (
      <ScrollView style={[styles.scrollView, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[styles.profileCard, { backgroundColor: colors.backgroundSecondary, borderBottomColor: colors.borderLight }]}
          onPress={() => router.push('/wechat/me/edit-profile' as any)}
        >
          <View style={styles.profileInfo}>
            <View style={[styles.meAvatar, { backgroundColor: colors.avatarBackground }]}>
              <Text style={styles.meAvatarText}>{userProfile.name.charAt(0)}</Text>
            </View>
            <View style={styles.userInfo}>
              <View style={styles.userNameContainer}>
                <Text style={[styles.meUserName, { color: colors.text }]}>{userProfile.name}</Text>
                <Ionicons name="qr-code" size={20} color={colors.textTertiary} style={styles.qrCodeIcon} />
              </View>
              <Text style={[styles.userId, { color: colors.textSecondary }]}>微信号: {userProfile.wechatId}</Text>
            </View>
          </View>
          <View style={styles.rightArrow}>
            <Ionicons name="chevron-forward" size={24} color={colors.textTertiary} />
          </View>
        </TouchableOpacity>

        {/* 功能列表 */}
        <View style={[styles.meSection, { backgroundColor: colors.backgroundSecondary, marginTop: 12 }]}>
          <TouchableOpacity
            style={[styles.meFeatureItem, { borderBottomColor: colors.borderLight }]}
            onPress={() => router.push('/wechat/discover/moments' as any)}
          >
            <View style={[styles.meFeatureIcon, { backgroundColor: '#EBF8FF' }]}>
              <Ionicons name="images" size={24} color="#63B3ED" />
            </View>
            <Text style={[styles.meFeatureTitle, { color: colors.text }]}>朋友圈</Text>
            <View style={styles.meFeatureRight}>
              <Ionicons name="chevron-forward" size={24} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={[styles.meSection, { backgroundColor: colors.backgroundSecondary, marginTop: 12 }]}>
          <TouchableOpacity
            style={[styles.meFeatureItem, { borderBottomColor: colors.borderLight }]}
            onPress={() => router.push('/wechat/me/favorites' as any)}
          >
            <View style={[styles.meFeatureIcon, { backgroundColor: '#FFFAF0' }]}>
              <Ionicons name="star" size={24} color="#F6AD55" />
            </View>
            <Text style={[styles.meFeatureTitle, { color: colors.text }]}>收藏</Text>
            <View style={styles.meFeatureRight}>
              <Text style={[styles.meFeatureRightText, { color: colors.textSecondary }]}>0个</Text>
              <Ionicons name="chevron-forward" size={24} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.meFeatureItem, { borderBottomColor: colors.borderLight }]}
            onPress={() => router.push('/wechat/me/albums' as any)}
          >
            <View style={[styles.meFeatureIcon, { backgroundColor: '#F0FFF4' }]}>
              <Ionicons name="albums" size={24} color="#4FD1C7" />
            </View>
            <Text style={[styles.meFeatureTitle, { color: colors.text }]}>相册</Text>
            <View style={styles.meFeatureRight}>
              <Text style={[styles.meFeatureRightText, { color: colors.textSecondary }]}>0张</Text>
              <Ionicons name="chevron-forward" size={24} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.meFeatureItem, { borderBottomColor: colors.borderLight }]}
            onPress={() => router.push('/wechat/me/wallet' as any)}
          >
            <View style={[styles.meFeatureIcon, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="wallet" size={24} color="#9F7AEA" />
            </View>
            <Text style={[styles.meFeatureTitle, { color: colors.text }]}>钱包</Text>
            <View style={styles.meFeatureRight}>
              <Ionicons name="chevron-forward" size={24} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={[styles.meSection, { backgroundColor: colors.backgroundSecondary, marginTop: 12 }]}>
          <TouchableOpacity
            style={[styles.meFeatureItem, { borderBottomColor: colors.borderLight }]}
            onPress={() => router.push('/wechat/me/settings' as any)}
          >
            <View style={[styles.meFeatureIcon, { backgroundColor: '#F7FAFC' }]}>
              <Ionicons name="settings" size={24} color="#A0AEC0" />
            </View>
            <Text style={[styles.meFeatureTitle, { color: colors.text }]}>设置</Text>
            <View style={styles.meFeatureRight}>
              <Ionicons name="chevron-forward" size={24} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };



  // WebView 相关功能已移除 - 直接在页面内显示搜索结果

  // WebView 消息处理 - 已简化，不再需要

  // 渲染内容区域
  const renderContent = () => {
    switch (activeTab) {
      case 'chats':
        return renderChats();
      case 'contacts':
        return renderContacts();
      case 'discover':
        return renderDiscover();
      case 'me':
        return renderMe();
      default:
        return renderChats();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={safeAreaEdges}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* 顶部导航栏 - iOS 26以下显示自定义导航栏 */}
      {!isIOS26OrAbove && (
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: 'transparent' }]}>
          {/* 返回桌面按钮 - 在通讯录页面不显示 */}
          {activeTab !== 'contacts' && (
            <TouchableOpacity style={styles.headerLeftButton} onPress={() => {
              closeAllSwipeables();
              router.back();
            }}>
              <Ionicons name="home-outline" size={24} color={colors.text} />
            </TouchableOpacity>
          )}

          {/* 居中的标题 */}
          <View style={[styles.headerCenter, { backgroundColor: colors.background }]}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {activeTab === 'chats' ? '微信' :
                activeTab === 'contacts' ? '通讯录' :
                  activeTab === 'discover' ? '发现' : '我'}
            </Text>
          </View>

          {/* 右侧按钮 */}
          <View style={styles.headerRight}>
            {activeTab === 'contacts' ? (
              // 通讯录页面显示添加好友按钮
              <TouchableOpacity style={styles.headerButton} onPress={() => {
                closeAllSwipeables();
                router.push('/wechat/contact-add' as any);
              }}>
                <Ionicons name="person-add" size={24} color={colors.text} />
              </TouchableOpacity>
            ) : activeTab === 'chats' ? (
              // 微信页面显示加号菜单按钮
              <TouchableOpacity style={styles.headerButton} onPress={() => {
                closeAllSwipeables();
                setShowMenu(!showMenu);
              }}>
                <Ionicons name="add-circle" size={24} color={colors.text} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      )}

      {/* 弹出菜单 - 气泡样式 */}
      {showMenu && (
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={[
            styles.menuWrapper,
            { top: Platform.OS === 'ios' ? (isIOS26OrAbove ? 50 : 90) : 60 }
          ]}>
            {/* 顶部箭头 - 指向加号按钮 */}
            <View style={[styles.menuArrowTop, { borderBottomColor: colors.backgroundSecondary }]} />
            
            {/* 菜单气泡 */}
            <View style={[
              styles.menuContainer,
              { backgroundColor: colors.backgroundSecondary }
            ]}>
              <TouchableOpacity
                style={[styles.menuItem, { borderBottomColor: colors.borderLight }]}
                onPress={() => {
                  setShowMenu(false);
                  Alert.alert('提示', '发起聊天功能开发中');
                }}
              >
                <View style={[styles.menuIcon, { backgroundColor: '#FFF5E6' }]}>
                  <Ionicons name="chatbubble-ellipses" size={20} color="#FF9500" />
                </View>
                <Text style={[styles.menuText, { color: colors.text }]}>发起聊天</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setShowMenu(false);
                  Alert.alert('提示', '发起群聊功能开发中');
                }}
              >
                <View style={[styles.menuIcon, { backgroundColor: '#E6F7FF' }]}>
                  <Ionicons name="people" size={20} color="#1890FF" />
                </View>
                <Text style={[styles.menuText, { color: colors.text }]}>发起群聊</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      )}

      {/* 内容区域 - 始终在搜索框下方 */}
      <View style={styles.content}>
        {renderContent()}
      </View>

      {/* 底部标签栏 */}
      <View style={[styles.tabBar, { backgroundColor: colors.tabBarBackground, borderTopColor: colors.tabBarBorder }]}>
        <TouchableOpacity style={styles.tabItem} onPress={() => {
          // 切换标签时关闭所有Swipeable
          closeAllSwipeables();
          setActiveTab('chats');
        }}>
          <Ionicons
            name="chatbubble"
            size={Platform.OS === 'ios' ? 28 : 24}
            color={activeTab === 'chats' ? colors.tabBarActive : colors.tabBarInactive}
          />
          <Text style={[styles.tabLabel, { color: activeTab === 'chats' ? colors.tabBarActive : colors.tabBarInactive }]}>
            微信
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => {
          // 切换标签时关闭所有Swipeable
          closeAllSwipeables();
          setActiveTab('contacts');
        }}>
          <Ionicons
            name="people"
            size={Platform.OS === 'ios' ? 28 : 24}
            color={activeTab === 'contacts' ? colors.tabBarActive : colors.tabBarInactive}
          />
          <Text style={[styles.tabLabel, { color: activeTab === 'contacts' ? colors.tabBarActive : colors.tabBarInactive }]}>
            通讯录
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => {
          // 切换标签时关闭所有Swipeable
          closeAllSwipeables();
          setActiveTab('discover');
        }}>
          <Ionicons
            name="compass"
            size={Platform.OS === 'ios' ? 28 : 24}
            color={activeTab === 'discover' ? colors.tabBarActive : colors.tabBarInactive}
          />
          <Text style={[styles.tabLabel, { color: activeTab === 'discover' ? colors.tabBarActive : colors.tabBarInactive }]}>
            发现
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => {
          // 切换标签时关闭所有Swipeable
          closeAllSwipeables();
          setActiveTab('me');
        }}>
          <Ionicons
            name="person"
            size={Platform.OS === 'ios' ? 28 : 24}
            color={activeTab === 'me' ? colors.tabBarActive : colors.tabBarInactive}
          />
          <Text style={[styles.tabLabel, { color: activeTab === 'me' ? colors.tabBarActive : colors.tabBarInactive }]}>
            我
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ededed',
  },
  header: {
    backgroundColor: '#ededed',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#d9d9d9',
    position: 'relative',
  },
  headerLeftButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    position: 'absolute',
    right: 16,
    zIndex: 1,
  },
  headerButton: {
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  searchContainer: {
    backgroundColor: '#ededed',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#d9d9d9',
  },
  searchInputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 36,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    padding: 0,
    outlineWidth: 0,
  },

  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  simplePageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  simplePageText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  simplePageSubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ededed',
    borderTopWidth: 0.5,
    borderTopColor: '#d9d9d9',
    paddingTop: 8,
    paddingBottom: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: Platform.OS === 'ios' ? 11 : 10,
    marginTop: 4,
  },
  // 通讯录相关样式
  contactsContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5', // 微信风格的浅灰色背景
  },
  contactsSearchContainer: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  contactsSearchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
  },
  contactsSearchTextInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: '400',
    color: '#000',
    marginLeft: 8,
    padding: 0,
    includeFontPadding: false,
    ...Platform.select({
      android: {
        textAlignVertical: 'center',
        paddingTop: 10,
        paddingBottom: 0,
        paddingVertical: 0,
        paddingHorizontal: 0,
        height: 40,
      },
      ios: {
        paddingVertical: 0,
        paddingHorizontal: 0,
        paddingTop: -10,
        paddingBottom: 0,
        height: 40,
      }
    })
  },
  featuresContainer: {
    backgroundColor: '#ffffff', // 功能区域保持白色
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 8,
    borderBottomColor: '#f5f5f5',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureName: {
    fontSize: 16,
    color: '#333',
  },
  contactsListContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5', // 与整体背景一致
  },
  contactsListContent: {
    backgroundColor: '#f5f5f5', // 与整体背景一致
    paddingBottom: 32,
  },
  sectionHeader: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e5e5', // 添加分隔线
  },
  sectionTitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e5e5', // 更深的分隔线颜色
    backgroundColor: '#ffffff', // 联系人项保持白色背景
    // 添加微妙的阴影效果
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#07C160',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  contactName: {
    fontSize: 16,
    color: '#333',
  },
  alphabetIndex: {
    position: 'absolute',
    right: 8,
    top: '50%',
    transform: [{ translateY: -100 }],
    backgroundColor: 'transparent',
  },
  alphabetItem: {
    paddingVertical: 2,
  },
  alphabetText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  // 聊天页面相关样式
  chatsContainer: {
    flex: 1,
    // 确保容器可以正确处理内部元素的高度
    flexDirection: 'column',
    backgroundColor: '#f5f5f5', // 微信风格的浅灰色背景
  },
  chatsSearchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
  },
  chatsSearchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
  },
  chatsSearchInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: '400',
    color: '#333',
    padding: 0,
    margin: 0,
    includeFontPadding: false,
    ...Platform.select({
      android: {
        textAlignVertical: 'center',
        paddingTop: 10,
        paddingBottom: 0,
        paddingVertical: 0,
        paddingHorizontal: 0,
        height: 40,
      },
      ios: {
        paddingVertical: 0,
        paddingHorizontal: 0,
        paddingTop: -10,
        paddingBottom: 0,
        height: 40,
      }
    })
  },
  chatsListContainer: {
    flex: 1,
  },
  chatsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e5e5',
  },
  chatsCount: {
    fontSize: 14,
    color: '#666',
  },
  addChatButton: {
    padding: 4,
  },
  chatItemsContainer: {
    paddingBottom: 24,
    backgroundColor: '#f5f5f5', // 与整体背景一致
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    backgroundColor: '#fff',
    // 添加微妙的阴影效果，模拟真实微信
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  chatItemPinned: {
    backgroundColor: '#e8f4fd', // 微信置顶聊天的浅蓝色背景
  },
  chatInfo: {
    flex: 1,
    marginLeft: 12,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatHeaderRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '500',
  },
  chatTime: {
    fontSize: 12,
  },
  chatMessage: {
    fontSize: 14,
    marginTop: 2,
  },
  unreadBadge: {
    backgroundColor: '#FA5151',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  swipeActionsContainer: {
    flexDirection: 'row',
    height: '100%',
  },
  swipeActionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    minWidth: 80,
  },
  pinAction: {
    backgroundColor: '#07C160',
  },
  deleteAction: {
    backgroundColor: '#FA5151',
  },
  swipeActionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },

  // "我"页面相关样式
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 0.5,
  },
  profileInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  meAvatar: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#07C160',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  meAvatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  userInfo: {
    flex: 1,
  },
  userNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  meUserName: {
    fontSize: 18,
    fontWeight: '600',
  },
  qrCodeIcon: {
    marginLeft: 8,
  },
  userId: {
    fontSize: 14,
  },
  rightArrow: {
    paddingLeft: 16,
  },
  meSection: {
    marginTop: 12,
  },
  meFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
  },
  meFeatureIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  meFeatureTitle: {
    flex: 1,
    fontSize: 16,
  },
  meFeatureRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  meFeatureRightText: {
    fontSize: 14,
    marginRight: 8,
  },
  // 弹出菜单样式
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  menuWrapper: {
    position: 'absolute',
    right: 10,
    alignItems: 'flex-end',
  },
  menuArrowTop: {
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
    marginRight: 10,
  },
  menuContainer: {
    width: 140,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '400',
  },
});
