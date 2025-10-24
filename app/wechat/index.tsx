import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, SafeAreaView, Platform, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';

export default function WeChatScreen() {
  const [activeTab, setActiveTab] = useState('chats');
  
  // 判断是否为iOS 26及以上系统
  const isIOS26OrAbove = Platform.OS === 'ios' && parseInt(Platform.Version, 10) >= 26;
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // 渲染聊天页面
  const renderChats = () => {
    return (
      <ScrollView style={styles.scrollView}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>聊天页面 - 待重新设计</Text>
        </View>
      </ScrollView>
    );
  };
  
  // 渲染通讯录页面
  const renderContacts = () => {
    return (
      <ScrollView style={styles.scrollView}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>通讯录页面 - 待重新设计</Text>
        </View>
      </ScrollView>
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
            {/* 返回桌面按钮 */}
            <TouchableOpacity style={styles.headerLeftButton} onPress={() => router.back()}>
              <Ionicons name="home-outline" size={24} color="#000" />
            </TouchableOpacity>
            
            {/* 居中的标题 */}
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>微信</Text>
            </View>
            
            {/* 右侧按钮 */}
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/wechat/ai-chat')}>
                <Ionicons name="add-circle" size={24} color="#000" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {/* 搜索框按钮 - 保持样式不变，暂时无功能 */}
        <TouchableOpacity 
          style={styles.searchContainer}
          onPress={() => {
            // 暂时无功能，只保持样式
          }}
          activeOpacity={0.9}
        >
          <View style={styles.searchInputGroup}>
            <Ionicons name="search" size={16} color="#999999" style={styles.searchIcon} />
            <Text style={styles.searchInput}>
              搜索
            </Text>
          </View>
        </TouchableOpacity>
        
        {/* 搜索功能已移至独立页面 */}
        
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
});