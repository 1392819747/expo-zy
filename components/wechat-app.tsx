import { Ionicons } from '@expo/vector-icons';
import { memo, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export type WeChatTabKey = 'chats' | 'contacts' | 'discover' | 'me';

type WeChatAppProps = {
  activeTab: WeChatTabKey;
  onClose: () => void;
  onTabChange: (key: WeChatTabKey) => void;
};

type TabItem = {
  activeIcon: keyof typeof Ionicons.glyphMap;
  icon: keyof typeof Ionicons.glyphMap;
  key: WeChatTabKey;
  label: string;
};

const TAB_ITEMS: TabItem[] = [
  { activeIcon: 'chatbubble-ellipses', icon: 'chatbubble-ellipses-outline', key: 'chats', label: '微信' },
  { activeIcon: 'people', icon: 'people-outline', key: 'contacts', label: '通讯录' },
  { activeIcon: 'compass', icon: 'compass-outline', key: 'discover', label: '发现' },
  { activeIcon: 'person', icon: 'person-outline', key: 'me', label: '我' }
];

type ChatThread = {
  avatar: string;
  id: string;
  message: string;
  muted?: boolean;
  name: string;
  time: string;
  unread?: number;
};

const CHAT_THREADS: ChatThread[] = [
  {
    avatar: '微',
    id: 'thread-1',
    message: '企业周报已生成，点击查看详情。',
    name: '企业微信助手',
    time: '09:20',
    unread: 2
  },
  {
    avatar: '林',
    id: 'thread-2',
    message: '今天的设计稿我已经传到云盘了～',
    name: '林晓晓',
    time: '昨天'
  },
  {
    avatar: '团',
    id: 'thread-3',
    message: '欢迎加入「周末野餐团」，一起发现生活里的小确幸！',
    name: '周末野餐团',
    time: '周三',
    unread: 6
  },
  {
    avatar: '设',
    id: 'thread-4',
    message: '最新一期的灵感合集上新啦～',
    name: '知音灵感营',
    time: '周二',
    muted: true
  }
];

type ContactSection = {
  id: string;
  items: {
    description?: string;
    icon: string;
    id: string;
    label: string;
    tint: string;
  }[];
  title: string;
};

const CONTACT_SECTIONS: ContactSection[] = [
  {
    id: 'services',
    items: [
      { description: '查看新的好友申请', icon: '🧑‍🤝‍🧑', id: 'new-friends', label: '新的朋友', tint: '#10b981' },
      { description: '雷达加朋友', icon: '📡', id: 'radar', label: '雷达加朋友', tint: '#38bdf8' },
      { description: '扫一扫加好友', icon: '🔲', id: 'scan', label: '扫一扫', tint: '#f97316' },
      { description: '手机通讯录联系人', icon: '📱', id: 'mobile', label: '手机联系人', tint: '#8b5cf6' }
    ],
    title: '常用功能'
  },
  {
    id: 'contacts',
    items: [
      { icon: '👩🏻‍💼', id: 'amy', label: 'Amy Chen', tint: '#f59e0b' },
      { icon: '🧑🏽‍💻', id: 'leo', label: 'Leo Tan', tint: '#0ea5e9' },
      { icon: '🎨', id: 'studio', label: '北岸设计工作室', tint: '#a855f7' },
      { icon: '🎧', id: 'pod', label: '创意播客小组', tint: '#f97316' }
    ],
    title: '我的联系人'
  }
];

const DISCOVER_FEATURES = [
  {
    description: '记录生活的精彩瞬间',
    icon: '🌄',
    id: 'moments',
    label: '朋友圈',
    tint: '#fb7185'
  },
  {
    description: '精选创作者内容',
    icon: '🎬',
    id: 'channels',
    label: '视频号',
    tint: '#38bdf8'
  },
  {
    description: '发现附近的生活方式',
    icon: '🧭',
    id: 'nearby',
    label: '附近',
    tint: '#4ade80'
  },
  {
    description: '小程序、游戏与工具集合',
    icon: '🧩',
    id: 'mini-apps',
    label: '小程序',
    tint: '#facc15'
  }
] as const;

const ME_SHORTCUTS = [
  { icon: '💳', id: 'pay', label: '服务 · 微信支付', tint: '#10b981' },
  { icon: '⭐', id: 'favorites', label: '收藏', tint: '#6366f1' },
  { icon: '🗂️', id: 'cards', label: '卡包', tint: '#f59e0b' },
  { icon: '⚙️', id: 'settings', label: '设置', tint: '#94a3b8' }
] as const;

type SectionProps = {
  title: string;
};

const SectionHeader = ({ title }: SectionProps) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

const ChatList = ({ threads }: { threads: ChatThread[] }) => (
  <View style={styles.sectionBlock}>
    <SectionHeader title="聊天" />
    <View style={styles.cardSurface}>
      {threads.map((thread, index) => {
        const isLast = index === threads.length - 1;
        return (
          <Pressable key={thread.id} style={[styles.chatRow, isLast && styles.rowWithoutBorder]}>
            <View style={styles.avatarWrapper}>
              <Text style={styles.avatarText}>{thread.avatar}</Text>
            </View>
            <View style={styles.chatContent}>
              <View style={styles.chatHeader}>
                <Text style={styles.chatName}>{thread.name}</Text>
                <Text style={styles.chatTime}>{thread.time}</Text>
              </View>
              <Text numberOfLines={1} style={styles.chatSnippet}>
                {thread.message}
              </Text>
            </View>
            <View style={styles.chatMeta}>
              {typeof thread.unread === 'number' ? (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{thread.unread}</Text>
                </View>
              ) : thread.muted ? (
                <Ionicons color="#9ca3af" name="volume-mute" size={18} />
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  </View>
);

const ContactList = ({ sections }: { sections: ContactSection[] }) => (
  <View style={styles.sectionBlock}>
    <SectionHeader title="联系人" />
    {sections.map(section => (
      <View key={section.id} style={styles.cardSurface}>
        <Text style={styles.subSectionTitle}>{section.title}</Text>
        {section.items.map((item, index) => {
          const isLast = index === section.items.length - 1;
          return (
            <Pressable key={item.id} style={[styles.listRow, isLast && styles.rowWithoutBorder]}>
              <View style={[styles.listIcon, { backgroundColor: `${item.tint}1a` }]}> 
                <Text style={[styles.listIconText, { color: item.tint }]}>{item.icon}</Text>
              </View>
              <View style={styles.listContent}>
                <Text style={styles.listLabel}>{item.label}</Text>
                {item.description ? (
                  <Text numberOfLines={1} style={styles.listDescription}>
                    {item.description}
                  </Text>
                ) : null}
              </View>
              <Ionicons color="#cbd5f5" name="chevron-forward" size={18} />
            </Pressable>
          );
        })}
      </View>
    ))}
  </View>
);

const DiscoverList = () => (
  <View style={styles.sectionBlock}>
    <SectionHeader title="今日推荐" />
    {DISCOVER_FEATURES.map(feature => (
      <Pressable key={feature.id} style={styles.discoverRow}>
        <View style={[styles.discoverIcon, { backgroundColor: `${feature.tint}1a` }]}> 
          <Text style={[styles.discoverIconText, { color: feature.tint }]}>{feature.icon}</Text>
        </View>
        <View style={styles.discoverContent}>
          <Text style={styles.discoverLabel}>{feature.label}</Text>
          <Text numberOfLines={2} style={styles.discoverDescription}>
            {feature.description}
          </Text>
        </View>
        <Ionicons color="#cbd5f5" name="chevron-forward" size={18} />
      </Pressable>
    ))}
  </View>
);

const MePanel = () => (
  <View style={styles.sectionBlock}>
    <SectionHeader title="我" />
    <View style={styles.profileCard}>
      <View style={styles.profileAvatar}>
        <Text style={styles.profileAvatarText}>ZY</Text>
      </View>
      <View style={styles.profileDetails}>
        <Text style={styles.profileName}>知音实验室</Text>
        <Text style={styles.profileSubtitle}>微信号：zy_lab</Text>
      </View>
      <Ionicons color="#d1d5db" name="qr-code" size={24} />
    </View>
    <View style={styles.cardSurface}>
      {ME_SHORTCUTS.map((shortcut, index) => {
        const isLast = index === ME_SHORTCUTS.length - 1;
        return (
          <Pressable key={shortcut.id} style={[styles.listRow, isLast && styles.rowWithoutBorder]}>
            <View style={[styles.listIcon, { backgroundColor: `${shortcut.tint}1a` }]}> 
              <Text style={[styles.listIconText, { color: shortcut.tint }]}>{shortcut.icon}</Text>
            </View>
            <Text style={styles.listLabel}>{shortcut.label}</Text>
            <Ionicons color="#cbd5f5" name="chevron-forward" size={18} />
          </Pressable>
        );
      })}
    </View>
  </View>
);

const WeChatApp = memo(function WeChatApp({ activeTab, onClose, onTabChange }: WeChatAppProps) {
  const content = useMemo(() => {
    switch (activeTab) {
      case 'chats':
        return <ChatList threads={CHAT_THREADS} />;
      case 'contacts':
        return <ContactList sections={CONTACT_SECTIONS} />;
      case 'discover':
        return <DiscoverList />;
      case 'me':
        return <MePanel />;
      default:
        return null;
    }
  }, [activeTab]);

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <View style={styles.backdrop} />
      <SafeAreaView edges={['top', 'bottom']} style={StyleSheet.absoluteFill}>
        <View style={styles.overlayRoot}>
          <View style={styles.phoneFrame}>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons color="#0f172a" name="close" size={20} />
            </Pressable>
            <View style={styles.appShell}>
              <View style={styles.statusBar}>
                <Text style={styles.statusTime}>19:47</Text>
                <View style={styles.statusIcons}>
                  <Text style={styles.statusGlyph}>📶</Text>
                  <Text style={styles.statusGlyph}>📡</Text>
                  <Text style={styles.statusGlyph}>🔋</Text>
                </View>
              </View>
              <View style={styles.navBar}>
                <Text style={styles.navTitle}>微信</Text>
                <View style={styles.navActions}>
                  <Pressable style={styles.navIconButton}>
                    <Ionicons color="#111827" name="search" size={20} />
                  </Pressable>
                  <Pressable style={styles.navIconButton}>
                    <Ionicons color="#111827" name="add" size={22} />
                  </Pressable>
                </View>
              </View>
              <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                style={styles.scrollView}>
                {content}
              </ScrollView>
              <View style={styles.tabBar}>
                {TAB_ITEMS.map(tab => {
                  const isActive = tab.key === activeTab;
                  return (
                    <Pressable key={tab.key} onPress={() => onTabChange(tab.key)} style={styles.tabItem}>
                      <Ionicons
                        color={isActive ? '#07c160' : '#707275'}
                        name={isActive ? tab.activeIcon : tab.icon}
                        size={24}
                      />
                      <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
});

export default WeChatApp;

const styles = StyleSheet.create({
  appShell: {
    backgroundColor: '#f5f5f5',
    borderRadius: 32,
    flex: 1,
    overflow: 'hidden'
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600'
  },
  avatarWrapper: {
    alignItems: 'center',
    backgroundColor: '#12b44a',
    borderRadius: 16,
    height: 48,
    justifyContent: 'center',
    marginRight: 12,
    width: 48
  },
  backdrop: {
    backgroundColor: 'rgba(3, 7, 18, 0.68)',
    ...StyleSheet.absoluteFillObject
  },
  cardSurface: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    marginHorizontal: 16,
    marginTop: 8,
    overflow: 'hidden'
  },
  chatContent: {
    flex: 1
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  chatMeta: {
    alignItems: 'flex-end',
    marginLeft: 12
  },
  chatName: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600'
  },
  chatRow: {
    alignItems: 'center',
    borderBottomColor: '#f3f4f6',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  chatSnippet: {
    color: '#6b7280',
    fontSize: 13
  },
  chatTime: {
    color: '#9ca3af',
    fontSize: 12
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 999,
    height: 36,
    justifyContent: 'center',
    position: 'absolute',
    right: 12,
    top: -18,
    width: 36
  },
  discoverContent: {
    flex: 1
  },
  discoverDescription: {
    color: '#6b7280',
    fontSize: 13,
    marginTop: 4
  },
  discoverIcon: {
    alignItems: 'center',
    borderRadius: 14,
    height: 44,
    justifyContent: 'center',
    marginRight: 14,
    width: 44
  },
  discoverIconText: {
    fontSize: 20
  },
  discoverLabel: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600'
  },
  discoverRow: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 18,
    paddingVertical: 16
  },
  listContent: {
    flex: 1
  },
  listDescription: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 4
  },
  listIcon: {
    alignItems: 'center',
    borderRadius: 12,
    height: 36,
    justifyContent: 'center',
    marginRight: 12,
    width: 36
  },
  listIconText: {
    fontSize: 18,
    fontWeight: '600'
  },
  listLabel: {
    color: '#111827',
    fontSize: 15
  },
  listRow: {
    alignItems: 'center',
    borderBottomColor: '#f3f4f6',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  navActions: {
    flexDirection: 'row',
    gap: 10
  },
  navBar: {
    alignItems: 'center',
    backgroundColor: '#ededed',
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12
  },
  navIconButton: {
    alignItems: 'center',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32
  },
  navTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700'
  },
  overlayRoot: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32
  },
  phoneFrame: {
    backgroundColor: '#050b18',
    borderRadius: 44,
    height: 720,
    padding: 14,
    shadowColor: '#0f172a',
    shadowOffset: { height: 20, width: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 40,
    width: 360
  },
  profileAvatar: {
    alignItems: 'center',
    backgroundColor: '#12b44a',
    borderRadius: 16,
    height: 60,
    justifyContent: 'center',
    marginRight: 16,
    width: 60
  },
  profileAvatarText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700'
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 18
  },
  profileDetails: {
    flex: 1
  },
  profileName: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700'
  },
  profileSubtitle: {
    color: '#6b7280',
    fontSize: 13,
    marginTop: 4
  },
  rowWithoutBorder: {
    borderBottomWidth: 0
  },
  scrollContent: {
    paddingBottom: 100
  },
  scrollView: {
    flex: 1
  },
  sectionBlock: {
    marginTop: 12
  },
  sectionHeader: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 4,
    marginLeft: 24,
    textTransform: 'uppercase'
  },
  statusBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 10
  },
  statusGlyph: {
    fontSize: 13
  },
  statusIcons: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6
  },
  statusTime: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '600'
  },
  subSectionTitle: {
    color: '#6b7280',
    fontSize: 12,
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 12,
    textTransform: 'uppercase'
  },
  tabBar: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderTopColor: '#e5e7eb',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 8,
    paddingTop: 8
  },
  tabItem: {
    alignItems: 'center',
    flex: 1
  },
  tabLabel: {
    color: '#707275',
    fontSize: 11,
    marginTop: 4
  },
  tabLabelActive: {
    color: '#07c160',
    fontWeight: '600'
  },
  unreadBadge: {
    alignItems: 'center',
    backgroundColor: '#f43f5e',
    borderRadius: 999,
    minWidth: 20,
    paddingHorizontal: 6,
    paddingVertical: 2
  },
  unreadText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600'
  }
});
