import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function WeChatScreen() {
  const [activeTab, setActiveTab] = useState('chats');
  const router = useRouter();

  type ChatListItem = {
    avatar: string;
    highlightColor?: string;
    id: number;
    isOfficial: boolean;
    message: string;
    name: string;
    route?: string;
    tag?: string;
    time: string;
    unread: number;
  };

  // 聊天列表数据
  const chatList: ChatListItem[] = [
    {
      id: 1,
      name: '文件传输助手',
      avatar: '📄',
      message: '仅你和文件传输助手可见',
      time: '上午 10:30',
      unread: 0,
      isOfficial: true
    },
    {
      id: 2,
      name: '张三',
      avatar: '张',
      message: '明天见！',
      time: '上午 9:15',
      unread: 2,
      isOfficial: false
    },
    {
      id: 3,
      name: '李四',
      avatar: '李',
      message: '好的，我知道了',
      time: '昨天',
      unread: 0,
      isOfficial: false
    },
    {
      id: 4,
      name: '工作群',
      avatar: '工',
      message: '王五: 会议改到下午3点',
      time: '星期三',
      unread: 12,
      isOfficial: false
    },
    {
      id: 5,
      name: '微信团队',
      avatar: '微',
      message: '欢迎加入微信！',
      time: '星期二',
      unread: 1,
      isOfficial: true
    },
    {
      id: 6,
      name: 'AI 酒馆',
      avatar: 'AI',
      message: '随时召唤你的角色伙伴聊天',
      time: '刚刚',
      unread: 3,
      isOfficial: true,
      route: '/wechat/ai-chat',
      tag: 'AI 助手',
      highlightColor: '#4B9BFF'
    }
  ];

  const handleChatPress = (chat: ChatListItem) => {
    if (chat.route) {
      router.push(chat.route);
    }
  };

  // 通讯录数据
  const contactsData = [
    {
      title: '',
      items: [
        { id: 'newFriends', name: '新的朋友', icon: 'person-add', color: '#07C160' },
        { id: 'groupChats', name: '群聊', icon: 'people', color: '#07C160' },
        { id: 'tags', name: '标签', icon: 'pricetag', color: '#07C160' },
        { id: 'officialAccounts', name: '公众号', icon: 'star', color: '#07C160' }
      ]
    },
    {
      title: '联系人',
      items: [
        { id: 'contact1', name: 'A-阿明', icon: '', color: '', avatar: 'A' },
        { id: 'contact2', name: 'B-白露', icon: '', color: '', avatar: 'B' },
        { id: 'contact3', name: 'C-陈晨', icon: '', color: '', avatar: 'C' },
        { id: 'contact4', name: 'D-丁丁', icon: '', color: '', avatar: 'D' },
        { id: 'contact5', name: 'E-二娃', icon: '', color: '', avatar: 'E' }
      ]
    }
  ];
  
  // 发现页面数据
  const discoverData = [
    { id: 'moments', name: '朋友圈', icon: 'images', color: '#07C160' },
    { id: 'scan', name: '扫一扫', icon: 'qr-code', color: '#07C160' },
    { id: 'shake', name: '摇一摇', icon: 'phone-portrait', color: '#07C160' },
    { id: 'nearby', name: '附近的人', icon: 'location', color: '#07C160' },
    { id: 'shopping', name: '购物', icon: 'cart', color: '#07C160' },
    { id: 'games', name: '游戏', icon: 'game-controller', color: '#07C160' }
  ];
  
  // 发现页面更多功能
  const discoverMore = [
    [
      { id: 'miniPrograms', name: '小程序', icon: 'apps', color: '#07C160' }
    ],
    [
      { id: 'search', name: '搜一搜', icon: 'search', color: '#07C160' },
      { id: 'topStories', name: '看一看', icon: 'book', color: '#07C160' }
    ],
    [
      { id: 'nearbyShops', name: '附近', icon: 'map', color: '#07C160' },
      { id: 'query', name: '查询', icon: 'help-circle', color: '#07C160' }
    ]
  ];
  
  // 我页面数据
  const profileData = {
    name: '知音实验室',
    wechatId: 'wxid_zhiyinlab',
    avatar: 'ZY'
  };
  
  const myFeatures = [
    [
      { id: 'pay', name: '支付', icon: 'wallet', color: '#07C160' }
    ],
    [
      { id: 'favorites', name: '收藏', icon: 'bookmark', color: '#07C160' },
      { id: 'files', name: '文件', icon: 'document', color: '#07C160' }
    ],
    [
      { id: 'cards', name: '卡包', icon: 'card', color: '#07C160' },
      { id: 'stickers', name: '表情', icon: 'happy', color: '#07C160' }
    ],
    [
      { id: 'settings', name: '设置', icon: 'settings', color: '#07C160' }
    ]
  ];
  
  // 渲染聊天列表
  const renderChats = () => {
    return (
      <ScrollView style={styles.scrollView}>
        {chatList.map(chat => (
          <TouchableOpacity key={chat.id} style={styles.chatItem} onPress={() => handleChatPress(chat)}>
            <View style={styles.avatarContainer}>
              <View style={[styles.avatar, { backgroundColor: chat.isOfficial ? '#07C160' : '#ddd' }]}>
                <Text style={styles.avatarText}>{chat.avatar}</Text>
              </View>
            </View>
            <View style={styles.chatContent}>
              <View style={styles.chatHeader}>
                <View style={styles.chatTitleRow}>
                  <Text style={styles.chatName}>{chat.name}</Text>
                  {chat.tag ? (
                    <View style={[styles.chatTag, { backgroundColor: chat.highlightColor ?? '#07C160' }]}>
                      <Text style={styles.chatTagText}>{chat.tag}</Text>
                    </View>
                  ) : null}
                  {chat.isOfficial ? (
                    <Ionicons name="shield-checkmark" size={14} color="#07C160" style={styles.officialIcon} />
                  ) : null}
                </View>
                <Text style={styles.chatTime}>{chat.time}</Text>
              </View>
              <View style={styles.chatMessageRow}>
                <Text style={styles.chatMessage} numberOfLines={1}>{chat.message}</Text>
                {chat.unread > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{chat.unread > 99 ? '99+' : chat.unread}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };
  
  // 渲染通讯录
  const renderContacts = () => {
    return (
      <ScrollView style={styles.scrollView}>
        {contactsData.map((section, sectionIndex) => (
          <View key={sectionIndex}>
            {section.title ? <Text style={styles.sectionTitle}>{section.title}</Text> : null}
            {section.items.map(item => (
              <TouchableOpacity key={item.id} style={styles.contactItem}>
                {item.icon ? (
                  <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                    <Ionicons name={item.icon} size={24} color="white" />
                  </View>
                ) : (
                  <View style={[styles.avatar, { backgroundColor: '#ddd' }]}>
                    <Text style={styles.avatarText}>{item.avatar}</Text>
                  </View>
                )}
                <Text style={styles.contactName}>{item.name}</Text>
                <Ionicons name="chevron-forward" size={16} color="#c7c7cc" />
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
    );
  };
  
  // 渲染发现页面
  const renderDiscover = () => {
    return (
      <ScrollView style={styles.scrollView}>
        {/* 主要功能 */}
        <View style={styles.section}>
          {discoverData.map(item => (
            <TouchableOpacity key={item.id} style={styles.discoverItem}>
              <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon} size={24} color="white" />
              </View>
              <Text style={styles.discoverName}>{item.name}</Text>
              <Ionicons name="chevron-forward" size={16} color="#c7c7cc" />
            </TouchableOpacity>
          ))}
        </View>
        
        {/* 更多功能 */}
        {discoverMore.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.section}>
            {group.map(item => (
              <TouchableOpacity key={item.id} style={styles.discoverItem}>
                <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                  <Ionicons name={item.icon} size={24} color="white" />
                </View>
                <Text style={styles.discoverName}>{item.name}</Text>
                <Ionicons name="chevron-forward" size={16} color="#c7c7cc" />
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
    );
  };
  
  // 渲染"我"页面
  const renderMe = () => {
    return (
      <ScrollView style={styles.scrollView}>
        {/* 个人信息 */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: '#07C160', width: 60, height: 60 }]}>
              <Text style={[styles.avatarText, { fontSize: 24 }]}>{profileData.avatar}</Text>
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profileData.name}</Text>
            <Text style={styles.profileId}>微信号：{profileData.wechatId}</Text>
          </View>
          <View style={styles.qrCodeContainer}>
            <Ionicons name="qr-code" size={20} color="#000" />
          </View>
        </View>
        
        {/* 功能列表 */}
        {myFeatures.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.section}>
            {group.map(item => (
              <TouchableOpacity key={item.id} style={styles.discoverItem}>
                <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                  <Ionicons name={item.icon} size={24} color="white" />
                </View>
                <Text style={styles.discoverName}>{item.name}</Text>
                <Ionicons name="chevron-forward" size={16} color="#c7c7cc" />
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
    );
  };
  
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ededed" />

      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>微信</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="search" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/wechat/ai-chat')}>
            <Ionicons name="add-circle" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* 内容区域 */}
      <View style={styles.content}>
        {renderContent()}
      </View>
      
      {/* 底部标签栏 */}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#d9d9d9',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  headerRight: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 16,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e5e5',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 5,
    backgroundColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  chatTag: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  chatTagText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  officialIcon: {
    marginLeft: 6,
  },
  chatTime: {
    fontSize: 12,
    color: '#999',
  },
  chatMessageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatMessage: {
    fontSize: 14,
    color: '#999',
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: '#fa5151',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#999',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f7f7f7',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e5e5',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 5,
    backgroundColor: '#07C160',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactName: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  discoverItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e5e5',
  },
  discoverName: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginBottom: 10,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  profileId: {
    fontSize: 14,
    color: '#999',
  },
  qrCodeContainer: {
    padding: 8,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#f7f7f7',
    borderTopWidth: 0.5,
    borderTopColor: '#d9d9d9',
    paddingBottom: 20,
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
});