import React, { useMemo, useEffect } from 'react';
import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../../hooks/useThemeColors';
import { mockContacts } from '../../models/contacts';

export default function ContactDetailScreen() {
  const { colors, isDark } = useThemeColors();
  const router = useRouter();
  const navigation = useNavigation();
  const safeAreaInsets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  
  // 判断是否为 iOS 26+ 或 Android
  const isIOS26OrAbove = Platform.OS === 'ios' && Number.parseInt(String(Platform.Version), 10) >= 26;
  const isAndroid = Platform.OS === 'android';
  const hasNativeHeader = isIOS26OrAbove; // 只有iOS 26+有原生导航栏
  const safeAreaEdges = hasNativeHeader ? ['left', 'right', 'bottom'] : ['top', 'left', 'right', 'bottom'];

  const contactId = useMemo(() => {
    if (Array.isArray(id)) {
      return id[0];
    }
    return id ?? '';
  }, [id]);

  const contact = useMemo(
    () => mockContacts.find((item) => item.id === contactId),
    [contactId],
  );

  const handleEditContact = () => {
    router.push({
      pathname: '/wechat/contact-edit',
      params: { id: contact?.id },
    });
  };

  const handleSendMessage = () => {
    // 导航到聊天详情页面，并传递联系人信息
    router.push({
      pathname: '/wechat/chat-detail',
      params: { 
        contactId: contact?.id,
        contactName: contact?.name,
        avatar: contact?.avatar 
      },
    });
  };

  // 配置 iOS 原生导航栏深色模式和右侧按钮
  useEffect(() => {
    if (isIOS26OrAbove) {
      navigation.setOptions({
        title: '详情',
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          color: colors.text,
        },
        headerShadowVisible: false,
        headerRight: () => (
          <TouchableOpacity onPress={handleEditContact} style={{ paddingRight: 4 }}>
            <Text style={{ fontSize: 16, color: colors.primary, fontWeight: '600' }}>编辑</Text>
          </TouchableOpacity>
        ),
      });
    }
  }, [navigation, colors, isIOS26OrAbove, contact]);

  if (!contact) {
    return (
      <>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={safeAreaEdges}>
          <View style={styles.emptyStateContainer}>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>联系人不存在</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={safeAreaEdges}>
        {/* Android 状态栏安全区 */}
        {isAndroid && (
          <View style={{ height: safeAreaInsets.top, backgroundColor: colors.background }} />
        )}
        
        {/* Android 自定义导航栏 */}
        {isAndroid && (
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>详情</Text>
          <TouchableOpacity style={styles.editButton} onPress={handleEditContact}>
            <Text style={[styles.editButtonText, { color: colors.primary }]}>编辑</Text>
          </TouchableOpacity>
        </View>
        )}
        
        {/* iOS 26 以下自定义导航栏 */}
        {!isAndroid && !isIOS26OrAbove && (
          <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
            <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>详情</Text>
            <TouchableOpacity style={styles.editButton} onPress={handleEditContact}>
              <Text style={[styles.editButtonText, { color: colors.primary }]}>编辑</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.contentContainer}>
          <View style={[styles.profileCard, { backgroundColor: colors.backgroundSecondary, shadowColor: colors.cardShadow }]}>
            <View style={[styles.avatar, { backgroundColor: colors.avatarBackground }]}>
              <Text style={styles.avatarText}>{contact.avatar || contact.name.charAt(0)}</Text>
            </View>
            <Text style={[styles.contactName, { color: colors.text }]}>{contact.name}</Text>
            <Text style={[styles.contactDescription, { color: colors.textSecondary }]}>
              {contact.description || '这是一位神秘的联系人，快去完善描述吧～'}
            </Text>
          </View>
          
          {/* 发消息按钮 */}
          <TouchableOpacity 
            style={[styles.messageButton, { backgroundColor: colors.primary }]} 
            onPress={handleSendMessage}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#ffffff" />
            <Text style={[styles.messageButtonText, { color: '#ffffff' }]}>发消息</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5e5',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  editButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  editButtonText: {
    fontSize: 16,
    color: '#07C160',
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 24,
    paddingVertical: 40,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#07C160',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ffffff',
  },
  contactName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 16,
  },
  contactDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555555',
    textAlign: 'center',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666666',
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginTop: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  messageButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
