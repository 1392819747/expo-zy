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
import { useRouter } from 'expo-router';
import { useWeChatTheme } from '../useWeChatTheme';

type QuickAction = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

type ContactInfo = {
  id: string;
  name: string;
  pinyin: string;
  avatar: any;
};

type ContactSection = {
  title: string;
  data: ContactInfo[];
};

const QUICK_ACTIONS: QuickAction[] = [
  { id: 'new-friends', name: '新的朋友', icon: 'person-add-outline', color: '#F8D74A' },
  { id: 'group-chats', name: '群聊', icon: 'people-outline', color: '#57BE6A' },
  { id: 'tags', name: '标签', icon: 'pricetag-outline', color: '#628CFC' },
  { id: 'official', name: '公众号', icon: 'newspaper-outline', color: '#FB7675' },
];

const CONTACT_SECTIONS: ContactSection[] = [
  {
    title: 'A',
    data: [
      { id: '1', name: 'Alice', pinyin: 'Alice', avatar: require('../../../assets/images/wechat/avatar-girl.png') },
    ],
  },
  {
    title: 'L',
    data: [
      { id: '2', name: '李明', pinyin: 'Li Ming', avatar: require('../../../assets/images/wechat/avatar-man.png') },
    ],
  },
  {
    title: 'W',
    data: [
      { id: '3', name: '王华', pinyin: 'Wang Hua', avatar: require('../../../assets/images/wechat/avatar-man.png') },
    ],
  },
  {
    title: 'Z',
    data: [
      { id: '4', name: '张伟', pinyin: 'Zhang Wei', avatar: require('../../../assets/images/wechat/avatar-man.png') },
      { id: '5', name: '赵静', pinyin: 'Zhao Jing', avatar: require('../../../assets/images/wechat/avatar-girl.png') },
    ],
  },
];

export default function WeChat2ContactsScreen() {
  const theme = useWeChatTheme();
  const router = useRouter();

  const renderQuickAction = ({ item }: { item: QuickAction }) => (
    <TouchableOpacity style={[styles.quickAction, { backgroundColor: theme.bg1 }]}>
      <View style={[styles.quickActionIcon, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon as any} size={22} color="#fff" />
      </View>
      <Text style={[styles.quickActionText, { color: theme.text5 }]}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderContact = ({ item }: { item: ContactInfo }) => (
    <TouchableOpacity
      style={[styles.contactItem, { backgroundColor: theme.bg1 }]}
      onPress={() => router.push(`/wechat2/contacts/${item.id}`)}
      activeOpacity={0.8}
    >
      <Image source={item.avatar} style={styles.contactAvatar} />
      <Text style={[styles.contactName, { color: theme.text5 }]}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: { section: ContactSection }) => (
    <View style={[styles.sectionHeader, { backgroundColor: theme.bg2 }]}> 
      <Text style={[styles.sectionHeaderText, { color: theme.text3 }]}>{section.title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg2 }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: theme.bg2 }]}> 
        <Text style={[styles.headerTitle, { color: theme.text5 }]}>通讯录</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="person-add-outline" size={22} color={theme.text5} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="add-circle-outline" size={22} color={theme.text5} />
          </TouchableOpacity>
        </View>
      </View>

      <SectionList
        sections={CONTACT_SECTIONS}
        keyExtractor={item => item.id}
        renderItem={renderContact}
        renderSectionHeader={renderSectionHeader}
        ListHeaderComponent={
          <FlatList
            data={QUICK_ACTIONS}
            keyExtractor={item => item.id}
            renderItem={renderQuickAction}
            scrollEnabled={false}
            ItemSeparatorComponent={() => (
              <View style={[styles.quickActionSeparator, { backgroundColor: theme.fillColor }]} />
            )}
          />
        }
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={({ leadingItem }) => (
          <View style={[styles.contactSeparator, { backgroundColor: theme.fillColor }]} />
        )}
        stickySectionHeadersEnabled
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
    paddingVertical: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  quickActionText: {
    fontSize: 16,
  },
  quickActionSeparator: {
    height: 0.5,
    marginLeft: 64,
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
    paddingVertical: 12,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
  },
  contactName: {
    fontSize: 16,
  },
  contactSeparator: {
    height: 0.5,
    marginLeft: 68,
  },
});
