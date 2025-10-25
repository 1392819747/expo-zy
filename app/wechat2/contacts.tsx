import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  SectionList,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks/useThemeColors';

const QUICK_ACTIONS = [
  { id: 'new-friends', name: '新的朋友', icon: 'person-add', color: '#FF9500' },
  { id: 'group-chats', name: '群聊', icon: 'people', color: '#07C160' },
  { id: 'tags', name: '标签', icon: 'pricetag', color: '#1296DB' },
  { id: 'official', name: '公众号', icon: 'newspaper', color: '#0088FF' },
];

const CONTACTS = [
  {
    title: 'A',
    data: [
      { id: '1', name: 'Alice', pinyin: 'Alice', avatar: require('../../assets/images/wechat/avatar-girl.png') },
    ],
  },
  {
    title: 'L',
    data: [
      { id: '2', name: '李明', pinyin: 'Li Ming', avatar: require('../../assets/images/wechat/avatar-man.png') },
    ],
  },
  {
    title: 'W',
    data: [
      { id: '3', name: '王华', pinyin: 'Wang Hua', avatar: require('../../assets/images/wechat/avatar-man.png') },
    ],
  },
  {
    title: 'Z',
    data: [
      { id: '4', name: '张伟', pinyin: 'Zhang Wei', avatar: require('../../assets/images/wechat/avatar-man.png') },
      { id: '5', name: '赵静', pinyin: 'Zhao Jing', avatar: require('../../assets/images/wechat/avatar-girl.png') },
    ],
  },
];

export default function WeChat2ContactsScreen() {
  const { colors } = useThemeColors();

  const renderQuickAction = ({ item }: { item: (typeof QUICK_ACTIONS)[number] }) => {
    return (
      <TouchableOpacity style={[styles.quickAction, { borderBottomColor: colors.border }]}>
        <View style={[styles.quickActionIcon, { backgroundColor: item.color }]}>
          <Ionicons name={item.icon as any} size={24} color="#fff" />
        </View>
        <Text style={[styles.quickActionText, { color: colors.text }]}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  const renderContact = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity style={[styles.contactItem, { borderBottomColor: colors.border }]}>
        <Image source={item.avatar} style={styles.contactAvatar} />
        <Text style={[styles.contactName, { color: colors.text }]}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section }: { section: any }) => {
    return (
      <View style={[styles.sectionHeader, { backgroundColor: colors.backgroundSecondary }]}>
        <Text style={[styles.sectionHeaderText, { color: colors.textSecondary }]}>{section.title}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>通讯录</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="search" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="person-add" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <SectionList
        sections={CONTACTS}
        keyExtractor={item => item.id}
        renderItem={renderContact}
        renderSectionHeader={renderSectionHeader}
        ListHeaderComponent={
          <FlatList
            data={QUICK_ACTIONS}
            keyExtractor={item => item.id}
            renderItem={renderQuickAction}
            scrollEnabled={false}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    fontSize: 16,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '600',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  contactName: {
    fontSize: 16,
  },
});
