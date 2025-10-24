import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Contact, mockContacts } from '../../models/contacts';

const ContactDetailScreen = () => {
  const [contact, setContact] = useState<Contact | null>(null);
  const [isStarred, setIsStarred] = useState(false);
  const router = useRouter();
  const { id } = useLocalSearchParams();

  useEffect(() => {
    // 根据ID查找联系人
    const contactId = Array.isArray(id) ? id[0] : id;
    const foundContact = mockContacts.find(c => c.id === contactId);
    if (foundContact) {
      setContact(foundContact);
      setIsStarred(foundContact.isStarred || false);
    }
  }, [id]);

  const handleToggleStar = () => {
    setIsStarred(!isStarred);
    // 这里可以添加更新联系人星标状态的逻辑
  };

  const handleSendMessage = () => {
    if (contact) {
      // 导航到聊天页面
      router.push({
        pathname: '/wechat/chat',
        params: { contactId: contact.id }
      } as any);
    }
  };

  const handleVoiceCall = () => {
    if (contact) {
      Alert.alert('语音通话', `正在呼叫 ${contact.name}...`);
    }
  };

  const handleVideoCall = () => {
    if (contact) {
      Alert.alert('视频通话', `正在发起视频通话给 ${contact.name}...`);
    }
  };

  const handleEditContact = () => {
    Alert.alert('编辑联系人', '编辑联系人功能待实现');
  };

  const handleDeleteContact = () => {
    if (contact) {
      Alert.alert(
        '删除联系人',
        `确定要删除联系人 ${contact.name} 吗？`,
        [
          { text: '取消', style: 'cancel' },
          { 
            text: '删除', 
            style: 'destructive',
            onPress: () => {
              // 这里可以添加删除联系人的逻辑
              router.back();
            }
          }
        ]
      );
    }
  };

  if (!contact) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>联系人不存在</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>详情</Text>
        <TouchableOpacity style={styles.headerButton} onPress={handleEditContact}>
          <Ionicons name="ellipsis-vertical" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 联系人基本信息 */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{contact.avatar || contact.name.charAt(0)}</Text>
            </View>
            <TouchableOpacity style={styles.starButton} onPress={handleToggleStar}>
              <Ionicons 
                name={isStarred ? "star" : "star-outline"} 
                size={24} 
                color={isStarred ? "#FFD700" : "#999"} 
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.contactName}>{contact.name}</Text>
          <Text style={styles.contactDescription}>{contact.description}</Text>
          
          {/* 操作按钮 */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleSendMessage}>
              <Ionicons name="chatbubble" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>发消息</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleVoiceCall}>
              <Ionicons name="call" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>语音通话</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleVideoCall}>
              <Ionicons name="videocam" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>视频通话</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 联系方式 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>联系方式</Text>
          
          {contact.phone && (
            <TouchableOpacity style={styles.infoItem}>
              <View style={styles.infoItemLeft}>
                <Ionicons name="call" size={20} color="#07C160" />
                <Text style={styles.infoItemLabel}>电话</Text>
              </View>
              <Text style={styles.infoItemValue}>{contact.phone}</Text>
            </TouchableOpacity>
          )}
          
          {contact.wechatId && (
            <TouchableOpacity style={styles.infoItem}>
              <View style={styles.infoItemLeft}>
                <Ionicons name="chatbubble" size={20} color="#07C160" />
                <Text style={styles.infoItemLabel}>微信号</Text>
              </View>
              <Text style={styles.infoItemValue}>{contact.wechatId}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 更多信息 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>更多信息</Text>
          
          <View style={styles.infoItem}>
            <View style={styles.infoItemLeft}>
              <Ionicons name="person" size={20} color="#07C160" />
              <Text style={styles.infoItemLabel}>备注名</Text>
            </View>
            <Text style={styles.infoItemValue}>{contact.name}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <View style={styles.infoItemLeft}>
              <Ionicons name="pricetag" size={20} color="#07C160" />
              <Text style={styles.infoItemLabel}>标签</Text>
            </View>
            <Text style={styles.infoItemValue}>未设置</Text>
          </View>
          
          <View style={styles.infoItem}>
            <View style={styles.infoItemLeft}>
              <Ionicons name="camera" size={20} color="#07C160" />
              <Text style={styles.infoItemLabel}>朋友圈</Text>
            </View>
            <Text style={styles.infoItemValue}>仅展示最近半年的动态</Text>
          </View>
        </View>

        {/* 朋友圈入口 */}
        <TouchableOpacity style={styles.momentsEntry}>
          <View style={styles.momentsEntryLeft}>
            <Ionicons name="images" size={20} color="#07C160" />
            <Text style={styles.momentsEntryText}>朋友圈</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#999" />
        </TouchableOpacity>

        {/* 删除联系人按钮 */}
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteContact}>
          <Text style={styles.deleteButtonText}>删除联系人</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e5e5',
  },
  headerButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 8,
    borderBottomColor: '#f5f5f5',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#07C160',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#fff',
  },
  starButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  contactName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  contactDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 40,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#07C160',
    marginTop: 5,
  },
  section: {
    paddingVertical: 16,
    borderBottomWidth: 8,
    borderBottomColor: '#f5f5f5',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  infoItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoItemLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  infoItemValue: {
    fontSize: 16,
    color: '#666',
  },
  momentsEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 8,
    borderBottomColor: '#f5f5f5',
  },
  momentsEntryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  momentsEntryText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  deleteButton: {
    margin: 16,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    color: '#ff3b30',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ContactDetailScreen;