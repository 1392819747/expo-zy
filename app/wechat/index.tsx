import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
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
import {
  Contact,
  contactFeatures,
  getAllInitials,
  groupContactsByInitial,
  mockContacts,
  searchContacts
} from '../../models/contacts';
import { useThemeColors } from '../../hooks/useThemeColors';

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
  
  // 判断是否为iOS 26及以上系统
  const isIOS26OrAbove = Platform.OS === 'ios' && Number.parseInt(String(Platform.Version), 10) >= 26;
  const router = useRouter();
  const safeAreaInsets = useSafeAreaInsets();
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
      });
    }
  }, [isIOS26OrAbove, activeTab, colors, navigation]);

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
    }, [router, activeTab, isIOS26OrAbove])
  );

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
    const renderChatItem = ({ item }: { item: ChatItem }) => (
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
                <Text style={[styles.chatTime, { color: colors.textTertiary }]}>{item.time}</Text>
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

    return (
      <View style={[styles.chatsContainer, { backgroundColor: colors.backgroundSecondary }]} 
        onStartShouldSetResponder={() => {
          // 在容器上点击时关闭所有Swipeable
          closeAllSwipeables();
          return false;
        }}
      >
        <View style={[styles.chatsSearchContainer, { backgroundColor: colors.backgroundSecondary, borderBottomColor: colors.borderLight }]}>
          <View style={[styles.chatsSearchInputContainer, { 
            backgroundColor: colors.inputBackground, 
            borderColor: colors.border,
            borderWidth: 1,
          }]}>
            <Ionicons name="search" size={16} color={colors.textTertiary} style={styles.chatsSearchIcon} />
            <TextInput
              style={[styles.chatsSearchInput, { color: colors.text }]}
              placeholder="搜索聊天记录"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.placeholder}
              underlineColorAndroid="transparent"
              onFocus={() => closeAllSwipeables()}
            />
          </View>
        </View>

        <View style={styles.chatsListContainer}>
          {sortedChats.length > 0 ? (
            <FlatList
              data={sortedChats}
              keyExtractor={(item) => item.id}
              renderItem={renderChatItem}
              contentContainerStyle={[styles.chatItemsContainer, { backgroundColor: colors.backgroundSecondary }]}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>没有找到相关聊天</Text>
            </View>
          )}
        </View>
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
              <View style={[styles.contactsSearchContainer, { backgroundColor: colors.backgroundSecondary }]}>
                <View style={[styles.contactsSearchInput, { 
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                  borderWidth: 1,
                }]}>
                  <Ionicons name="search" size={16} color={colors.textTertiary} />
                  <TextInput
                    style={[styles.contactsSearchTextInput, { color: colors.text }]}
                    placeholder="搜索联系人"
                    value={contactsSearchQuery}
                    onChangeText={setContactsSearchQuery}
                    placeholderTextColor={colors.placeholder}
                    underlineColorAndroid="transparent"
                    onFocus={() => closeAllSwipeables()}
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
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>发现页面 - 待重新设计</Text>
        </View>
      </ScrollView>
    );
  };
  
  // 渲染个人页面
  const renderMe = () => {
    return (
      <ScrollView style={[styles.scrollView, { backgroundColor: colors.background }]}>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>个人页面 - 待重新设计</Text>
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
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
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
                Alert.alert('添加好友', '添加好友功能待实现');
              }}>
                <Ionicons name="person-add" size={24} color={colors.text} />
              </TouchableOpacity>
            ) : (
              // 其他页面显示AI聊天按钮
              <TouchableOpacity style={styles.headerButton} onPress={() => {
                closeAllSwipeables();
                router.push('/wechat/ai-chat' as any);
              }}>
                <Ionicons name="add-circle" size={24} color={colors.text} />
              </TouchableOpacity>
            )}
          </View>
        </View>
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
    backgroundColor: '#ffffff',
  },
  contactsSearchContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  contactsSearchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 36,
  },
  contactsSearchTextInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    marginLeft: 8,
    padding: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
    paddingTop: 4,
    paddingBottom: 0,
    textAlign: 'left',
    textAlignVertical: 'center',
    includeFontPadding: false,
    height: 36,
    lineHeight: 20,
  },
  featuresContainer: {
    backgroundColor: '#ffffff',
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
    backgroundColor: '#ffffff',
  },
  contactsListContent: {
    backgroundColor: '#ffffff',
    paddingBottom: 32,
  },
  sectionHeader: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 6,
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
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#07C160',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
    backgroundColor: '#fff',
  },
  chatsSearchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e5e5',
  },
  chatsSearchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 36,
  },
  chatsSearchIcon: {
    marginRight: 8,
  },
  chatsSearchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'center',
    textAlign: 'left',
    paddingVertical: 0,
    paddingHorizontal: 0,
    paddingTop: 4,
    paddingBottom: 0,
    includeFontPadding: false,
    height: 36,
    lineHeight: 20,
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
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e5e5',
    backgroundColor: '#fff',
  },
  chatItemPinned: {
    backgroundColor: '#f9f9f9',
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
    color: '#333',
  },
  chatTime: {
    fontSize: 12,
    color: '#999',
  },
  chatMessage: {
    fontSize: 14,
    color: '#999',
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
});
