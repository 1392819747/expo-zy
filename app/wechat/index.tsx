import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, SafeAreaView, Platform, TextInput, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import Constants from 'expo-constants';
import { 
  Contact, 
  mockContacts, 
  groupContactsByInitial, 
  getAllInitials, 
  searchContacts,
  contactFeatures 
} from '../../models/contacts';

export default function WeChatScreen() {
  const [activeTab, setActiveTab] = useState('chats');
  const [contactsSearchQuery, setContactsSearchQuery] = useState('');
  
  // 判断是否为iOS 26及以上系统
  const isIOS26OrAbove = Platform.OS === 'ios' && parseInt(Platform.Version, 10) >= 26;
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // 更新导航栏标题的函数
  const updateNavigationTitle = () => {
    if (isIOS26OrAbove) {
      // 对于iOS 26+，我们需要通过其他方式更新标题
      // 这里我们可以使用状态管理或者全局事件来通知layout更新
      const title = activeTab === 'chats' ? '微信' : 
                   activeTab === 'contacts' ? '通讯录' : 
                   activeTab === 'discover' ? '发现' : '我';
      
      // 通过路由参数传递当前标签页信息
      router.setParams({ tab: activeTab });
    }
  };

  // 监听标签页变化，更新导航栏标题
  useEffect(() => {
    updateNavigationTitle();
  }, [activeTab]);

  // 确保路由参数与当前标签页同步
  useFocusEffect(() => {
    router.setParams({ tab: activeTab });
  });

  // 过滤和分组联系人
  const { groupedContacts, initials, filteredContacts } = useMemo(() => {
    const filtered = searchContacts(mockContacts, contactsSearchQuery);
    const grouped = groupContactsByInitial(filtered);
    const initialsList = getAllInitials(filtered);
    
    return { 
      groupedContacts: grouped, 
      initials: initialsList,
      filteredContacts: filtered
    };
  }, [contactsSearchQuery]);

  // 渲染聊天页面
  const renderChats = () => {
    // 渲染聊天项
    const renderChatItem = ({ item }: { item: any }) => (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => Alert.alert('聊天详情', `打开与 ${item.name} 的聊天`)}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
        </View>
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName}>{item.name}</Text>
            <Text style={styles.chatTime}>{item.time}</Text>
          </View>
          <Text style={styles.chatMessage} numberOfLines={1}>{item.message}</Text>
        </View>
        {item.unread > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unread > 99 ? '99+' : item.unread}</Text>
          </View>
        )}
      </TouchableOpacity>
    );

    // 模拟聊天数据
    const mockChats = [
      { id: 1, name: '文件传输助手', message: '你可以在这里接收文件', time: '上午 10:30', unread: 0 },
      { id: 2, name: '张三', message: '好的，明天见！', time: '上午 9:45', unread: 2 },
      { id: 3, name: '李四', message: '项目进展如何？', time: '昨天', unread: 1 },
      { id: 4, name: '王五', message: '收到，谢谢！', time: '星期三', unread: 0 },
      { id: 5, name: '团队群', message: '赵六: 会议改到下午3点', time: '星期二', unread: 5 },
      { id: 6, name: '通知', message: '系统维护通知', time: '星期一', unread: 0 },
    ];

    return (
      <View style={styles.chatsContainer}>
        {/* 搜索框 */}
        <View style={styles.chatsSearchContainer}>
          <View style={styles.chatsSearchInputContainer}>
            <Ionicons name="search" size={16} color="#999" style={styles.chatsSearchIcon} />
            <TextInput
              style={styles.chatsSearchInput}
              placeholder="搜索聊天记录"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* 聊天列表 */}
        <View style={styles.chatsListContainer}>
          <View style={styles.chatsHeader}>
            <Text style={styles.chatsCount}>聊天 ({mockChats.length})</Text>
            <TouchableOpacity style={styles.addChatButton} onPress={() => Alert.alert('发起聊天', '发起聊天功能待实现')}>
              <Ionicons name="add-circle" size={20} color="#07C160" />
            </TouchableOpacity>
          </View>
          
          {mockChats.length > 0 ? (
            <View style={styles.chatItemsContainer}>
              {mockChats.map((chat) => (
                <View key={chat.id}>
                  {renderChatItem({ item: chat })}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>没有找到相关聊天</Text>
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
        style={styles.contactItem}
        onPress={() => router.push(`/wechat/contact-detail?id=${item.id}` as any)}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
        </View>
        <Text style={styles.contactName}>{item.name}</Text>
      </TouchableOpacity>
    );

    // 渲染分组标题
    const renderSectionHeader = ({ title }: { title: string }) => (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
    );

    // 渲染右侧字母索引
    const renderAlphabetIndex = () => (
      <View style={styles.alphabetIndex}>
        {initials.map((initial) => (
          <TouchableOpacity
            key={initial}
            style={styles.alphabetItem}
            onPress={() => {
              // 这里可以添加滚动到对应字母的逻辑
            }}
          >
            <Text style={styles.alphabetText}>{initial}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );

    return (
      <View style={styles.contactsContainer}>
        {/* 搜索框 */}
        <View style={styles.contactsSearchContainer}>
          <View style={styles.contactsSearchInput}>
            <Ionicons name="search" size={16} color="#999999" />
            <TextInput
              style={styles.contactsSearchTextInput}
              placeholder="搜索联系人"
              value={contactsSearchQuery}
              onChangeText={setContactsSearchQuery}
              placeholderTextColor="#999999"
            />
          </View>
        </View>

        {/* 功能区域 */}
        <View style={styles.featuresContainer}>
          {contactFeatures.map((feature, index) => (
            <TouchableOpacity
              key={index}
              style={styles.featureItem}
              onPress={() => {
                if (feature.route) {
                  router.push(feature.route as any);
                }
              }}
            >
              <View style={[styles.featureIcon, { backgroundColor: feature.bgColor }]}>
                <Ionicons name={feature.icon as any} size={24} color={feature.iconColor} />
              </View>
              <Text style={styles.featureName}>{feature.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 联系人列表 */}
        <View style={styles.contactsListContainer}>
          {Object.entries(groupedContacts).map(([title, contacts]) => (
            <View key={title}>
              {renderSectionHeader({ title })}
              {contacts.map((contact) => (
                <View key={contact.id}>
                  {renderContactItem({ item: contact })}
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* 右侧字母索引 */}
        {renderAlphabetIndex()}
      </View>
    );
  };
  
  // 渲染发现页面
  const renderDiscover = () => {
    return (
      <ScrollView style={styles.scrollView}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>发现页面 - 待重新设计</Text>
        </View>
      </ScrollView>
    );
  };
  
  // 渲染个人页面
  const renderMe = () => {
    return (
      <ScrollView style={styles.scrollView}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>个人页面 - 待重新设计</Text>
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
    <View style={{ flex: 1 }}>
      {/* iOS底部安全区域背景色 */}
      {Platform.OS === 'ios' && (
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#f7f7f7', height: 50 }} />
      )}
      
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ededed" />

        {/* 顶部导航栏 - iOS 26以下显示自定义导航栏 */}
        {!isIOS26OrAbove && (
          <View style={styles.header}>
            {/* 返回桌面按钮 - 在通讯录页面不显示 */}
            {activeTab !== 'contacts' && (
              <TouchableOpacity style={styles.headerLeftButton} onPress={() => router.back()}>
                <Ionicons name="home-outline" size={24} color="#000" />
              </TouchableOpacity>
            )}
            
            {/* 居中的标题 */}
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>
                {activeTab === 'chats' ? '微信' : 
                 activeTab === 'contacts' ? '通讯录' : 
                 activeTab === 'discover' ? '发现' : '我'}
              </Text>
            </View>
            
            {/* 右侧按钮 */}
            <View style={styles.headerRight}>
              {activeTab === 'contacts' ? (
                // 通讯录页面显示添加好友按钮
                <TouchableOpacity style={styles.headerButton} onPress={() => Alert.alert('添加好友', '添加好友功能待实现')}>
                  <Ionicons name="person-add" size={24} color="#000" />
                </TouchableOpacity>
              ) : (
                // 其他页面显示AI聊天按钮
                <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/wechat/ai-chat' as any)}>
                  <Ionicons name="add-circle" size={24} color="#000" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        
        {/* 内容区域 - 始终在搜索框下方 */}
        <View style={styles.content}>
          {renderContent()}
        </View>
      </SafeAreaView>
      
      {/* 底部标签栏 - 移出SafeAreaView以突破安全区域限制 */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('chats')}>
          <Ionicons 
            name="chatbubble" 
            size={24} 
            color={activeTab === 'chats' ? '#07C160' : '#999999'} 
          />
          <Text style={[styles.tabLabel, { color: activeTab === 'chats' ? '#07C160' : '#999999' }]}>
            微信
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('contacts')}>
          <Ionicons 
            name="people" 
            size={24} 
            color={activeTab === 'contacts' ? '#07C160' : '#999999'} 
          />
          <Text style={[styles.tabLabel, { color: activeTab === 'contacts' ? '#07C160' : '#999999' }]}>
            通讯录
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('discover')}>
          <Ionicons 
            name="compass" 
            size={24} 
            color={activeTab === 'discover' ? '#07C160' : '#999999'} 
          />
          <Text style={[styles.tabLabel, { color: activeTab === 'discover' ? '#07C160' : '#999999' }]}>
            发现
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('me')}>
          <Ionicons 
            name="person" 
            size={24} 
            color={activeTab === 'me' ? '#07C160' : '#999999'} 
          />
          <Text style={[styles.tabLabel, { color: activeTab === 'me' ? '#07C160' : '#999999' }]}>
            我
          </Text>
        </TouchableOpacity>
      </View>
    </View>
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
    backgroundColor: '#f7f7f7',
    borderTopWidth: 0.5,
    borderTopColor: '#d9d9d9',
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 10,
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
    flex: 1,
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
  chatInfo: {
    flex: 1,
    marginLeft: 12,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
});