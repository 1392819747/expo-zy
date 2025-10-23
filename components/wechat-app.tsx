import { LinearGradient } from 'expo-linear-gradient';
import { memo, useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export type WeChatTabKey = 'chats' | 'contacts' | 'discover' | 'me';

type WeChatAppProps = {
  activeTab: WeChatTabKey;
  onClose: () => void;
  onTabChange: (key: WeChatTabKey) => void;
};

type TabItem = {
  icon: string;
  key: WeChatTabKey;
  label: string;
};

const TAB_ITEMS: TabItem[] = [
  { icon: '💬', key: 'chats', label: '聊天' },
  { icon: '👥', key: 'contacts', label: '通讯录' },
  { icon: '✨', key: 'discover', label: '发现' },
  { icon: '😊', key: 'me', label: '我的' }
];

type ChatThread = {
  id: string;
  message: string;
  name: string;
  time: string;
  unread?: number;
  avatar: string;
  status?: string;
};

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

const CHAT_THREADS: ChatThread[] = [
  {
    avatar: '微',
    id: 'thread-1',
    message: '已为你准备好团队同步的会议纪要。',
    name: '企业微信助手',
    time: '09:20',
    unread: 3
  },
  {
    avatar: '林',
    id: 'thread-2',
    message: '今天的设计稿我已经更新在云盘里。',
    name: '林晓晓',
    time: '昨天',
    status: '已读'
  },
  {
    avatar: '团',
    id: 'thread-3',
    message: '欢迎加入「热爱生活研究所」🎉',
    name: '周末野餐团',
    time: '周三',
    unread: 6
  }
];

const CONTACT_SECTIONS: ContactSection[] = [
  {
    id: 'quick',
    items: [
      {
        description: '管理好友请求与新的联系人',
        icon: '🧑‍🤝‍🧑',
        id: 'new-friends',
        label: '新的朋友',
        tint: '#60a5fa'
      },
      { description: '快速找到身边的朋友', icon: '📡', id: 'radar', label: '雷达加朋友', tint: '#34d399' },
      { description: '扫一扫即可添加', icon: '🔲', id: 'scan', label: '扫一扫', tint: '#facc15' }
    ],
    title: '常用工具'
  },
  {
    id: 'friends',
    items: [
      { icon: '👩🏻‍💼', id: 'amy', label: 'Amy Chen', tint: '#f59e0b' },
      { icon: '🧑🏽‍💻', id: 'leo', label: 'Leo Tan', tint: '#38bdf8' },
      { icon: '🎨', id: 'studio', label: '北岸设计工作室', tint: '#a855f7' }
    ],
    title: '好友与服务号'
  }
];

const DISCOVER_FEATURES = [
  { description: '记录生活与灵感', icon: '📸', id: 'moments', label: '朋友圈', tint: '#fb7185' },
  { description: '精选创作者内容', icon: '🎥', id: 'channels', label: '视频号', tint: '#60a5fa' },
  { description: '探索附近和城市活动', icon: '🧭', id: 'nearby', label: '附近的精彩', tint: '#4ade80' },
  { description: '小程序、游戏与工具集合', icon: '🧩', id: 'mini-apps', label: '小程序', tint: '#f97316' }
] as const;

const ME_SHORTCUTS = [
  { icon: '💳', id: 'pay', label: '服务 · 微信支付', tint: '#34d399' },
  { icon: '📁', id: 'favorites', label: '收藏', tint: '#818cf8' },
  { icon: '🗂️', id: 'cards', label: '卡包', tint: '#fbbf24' },
  { icon: '⚙️', id: 'settings', label: '设置', tint: '#94a3b8' }
] as const;

const ChatList = ({ threads }: { threads: ChatThread[] }) => (
  <View style={styles.sectionBlock}>
    <Text style={styles.sectionTitle}>最近聊天</Text>
    <View style={styles.cardStack}>
      {threads.map(thread => (
        <Pressable key={thread.id} style={styles.surfaceCard}>
          <View style={styles.surfaceAccent}>
            <LinearGradient
              colors={['rgba(96, 165, 250, 0.25)', 'rgba(129, 140, 248, 0.05)']}
              end={{ x: 1, y: 1 }}
              start={{ x: 0, y: 0 }}
              style={styles.avatarBackground}>
              <Text style={styles.avatarText}>{thread.avatar}</Text>
            </LinearGradient>
          </View>
          <View style={styles.surfaceBody}>
            <View style={styles.surfaceHeader}>
              <Text style={styles.surfaceTitle}>{thread.name}</Text>
              <Text style={styles.surfaceTime}>{thread.time}</Text>
            </View>
            <Text numberOfLines={1} style={styles.surfaceSubtitle}>
              {thread.message}
            </Text>
          </View>
          <View style={styles.surfaceMeta}>
            {typeof thread.unread === 'number' ? (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{thread.unread}</Text>
              </View>
            ) : (
              <Text style={styles.statusText}>{thread.status}</Text>
            )}
          </View>
        </Pressable>
      ))}
    </View>
  </View>
);

const ContactList = ({ sections }: { sections: ContactSection[] }) => (
  <View style={styles.sectionGap}>
    {sections.map(section => (
      <View key={section.id} style={styles.sectionBlock}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <View style={styles.cardStack}>
          {section.items.map(item => (
            <Pressable key={item.id} style={styles.surfaceRow}>
              <View style={[styles.iconChip, { backgroundColor: `${item.tint}33` }]}> 
                <Text style={[styles.iconChipText, { color: item.tint }]}>{item.icon}</Text>
              </View>
              <View style={styles.surfaceBody}>
                <Text style={styles.surfaceTitle}>{item.label}</Text>
                {item.description ? (
                  <Text numberOfLines={1} style={styles.surfaceSubtitle}>
                    {item.description}
                  </Text>
                ) : null}
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))}
        </View>
      </View>
    ))}
  </View>
);

const DiscoverList = () => (
  <View style={styles.sectionBlock}>
    <Text style={styles.sectionTitle}>今日推荐</Text>
    <View style={styles.discoverGrid}>
      {DISCOVER_FEATURES.map(feature => (
        <Pressable key={feature.id} style={styles.discoverCard}>
          <View style={[styles.iconChip, { backgroundColor: `${feature.tint}33` }]}> 
            <Text style={[styles.iconChipText, { color: feature.tint }]}>{feature.icon}</Text>
          </View>
          <Text style={styles.surfaceTitle}>{feature.label}</Text>
          <Text numberOfLines={2} style={styles.surfaceSubtitle}>
            {feature.description}
          </Text>
        </Pressable>
      ))}
    </View>
  </View>
);

const MePanel = () => (
  <View style={styles.sectionGap}>
    <LinearGradient
      colors={['rgba(96, 165, 250, 0.2)', 'rgba(129, 140, 248, 0.05)']}
      end={{ x: 1, y: 1 }}
      start={{ x: 0, y: 0 }}
      style={styles.profileCard}>
      <View style={styles.profileAvatar}>
        <Text style={styles.profileAvatarText}>ZY</Text>
      </View>
      <View style={styles.profileInfo}>
        <Text style={styles.profileName}>知音实验室</Text>
        <Text style={styles.profileSubtitle}>探索创造力与效率的数字工作室</Text>
      </View>
      <View style={styles.profileTag}>
        <Text style={styles.profileTagText}>WeChat ID · zy_lab</Text>
      </View>
    </LinearGradient>
    <View style={styles.cardStack}>
      {ME_SHORTCUTS.map(shortcut => (
        <Pressable key={shortcut.id} style={styles.surfaceRow}>
          <View style={[styles.iconChip, { backgroundColor: `${shortcut.tint}33` }]}> 
            <Text style={[styles.iconChipText, { color: shortcut.tint }]}>{shortcut.icon}</Text>
          </View>
          <Text style={styles.surfaceTitle}>{shortcut.label}</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      ))}
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
    <View pointerEvents='box-none' style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={['rgba(4, 7, 16, 0.96)', 'rgba(6, 12, 24, 0.98)']}
        end={{ x: 0.7, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={[StyleSheet.absoluteFill, styles.overlayBackground]}
      />
      <SafeAreaView edges={['top', 'bottom']} style={StyleSheet.absoluteFill}>
        <View style={styles.overlayContainer}>
          <View style={styles.overlayHeader}>
            <View>
              <Text style={styles.appTitle}>WeChat</Text>
              <Text style={styles.appSubtitle}>连接人与灵感的灵感工作台</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </Pressable>
          </View>
          <View style={styles.utilityRow}>
            <Pressable style={styles.utilityButton}>
              <Text style={styles.utilityButtonText}>🔍 全局搜索</Text>
            </Pressable>
            <Pressable style={styles.utilityButton}>
              <Text style={styles.utilityButtonText}>➕ 发起聊天</Text>
            </Pressable>
            <Pressable style={styles.utilityButton}>
              <Text style={styles.utilityButtonText}>📌 我的收藏</Text>
            </Pressable>
          </View>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            style={styles.content}>
            {content}
          </ScrollView>
          <View style={styles.tabBar}>
            {TAB_ITEMS.map(tab => {
              const isActive = tab.key === activeTab;
              return (
                <Pressable key={tab.key} onPress={() => onTabChange(tab.key)} style={styles.tabItem}>
                  <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>{tab.icon}</Text>
                  <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
                  {isActive ? <View style={styles.tabIndicator} /> : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
});

export default WeChatApp;

const styles = StyleSheet.create({
  appSubtitle: {
    color: 'rgba(226, 232, 255, 0.72)',
    fontSize: 14,
    marginTop: 6
  },
  appTitle: {
    color: '#f9fafb',
    fontSize: 28,
    fontWeight: '700'
  },
  avatarBackground: {
    alignItems: 'center',
    borderRadius: 16,
    height: 54,
    justifyContent: 'center',
    width: 54
  },
  avatarText: {
    color: '#f9fafb',
    fontSize: 22,
    fontWeight: '700'
  },
  cardStack: {
    gap: 12
  },
  chevron: {
    color: 'rgba(226, 232, 255, 0.45)',
    fontSize: 24,
    marginLeft: 12
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36
  },
  closeButtonText: {
    color: '#e2e8f0',
    fontSize: 22,
    fontWeight: '600'
  },
  content: {
    flex: 1,
    width: '100%'
  },
  discoverCard: {
    alignItems: 'flex-start',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    borderColor: 'rgba(148, 163, 184, 0.14)',
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
    padding: 18
  },
  discoverGrid: {
    columnGap: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 14
  },
  iconChip: {
    alignItems: 'center',
    borderRadius: 16,
    height: 44,
    justifyContent: 'center',
    width: 44
  },
  iconChipText: {
    fontSize: 20,
    fontWeight: '700'
  },
  overlayBackground: {
    borderCurve: 'continuous'
  },
  overlayContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16
  },
  overlayHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  profileAvatar: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 24,
    height: 64,
    justifyContent: 'center',
    width: 64
  },
  profileAvatarText: {
    color: '#e0f2fe',
    fontSize: 22,
    fontWeight: '700'
  },
  profileCard: {
    alignItems: 'center',
    borderRadius: 28,
    flexDirection: 'row',
    gap: 16,
    padding: 20
  },
  profileInfo: {
    flex: 1,
    gap: 6
  },
  profileName: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '700'
  },
  profileSubtitle: {
    color: 'rgba(226, 232, 255, 0.75)',
    fontSize: 13
  },
  profileTag: {
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  profileTagText: {
    color: 'rgba(148, 163, 184, 0.85)',
    fontSize: 12
  },
  scrollContent: {
    paddingBottom: 120,
    paddingTop: 18
  },
  sectionBlock: {
    gap: 16
  },
  sectionGap: {
    gap: 24
  },
  sectionTitle: {
    color: 'rgba(226, 232, 255, 0.8)',
    fontSize: 14,
    fontWeight: '600'
  },
  statusText: {
    color: 'rgba(148, 163, 184, 0.9)',
    fontSize: 12
  },
  surfaceAccent: {
    marginRight: 16
  },
  surfaceBody: {
    flex: 1,
    gap: 6
  },
  surfaceCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    borderColor: 'rgba(148, 163, 184, 0.14)',
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    padding: 18
  },
  surfaceHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  surfaceMeta: {
    alignItems: 'flex-end',
    gap: 8,
    marginLeft: 12
  },
  surfaceRow: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    borderColor: 'rgba(148, 163, 184, 0.14)',
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    columnGap: 16,
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingVertical: 14
  },
  surfaceSubtitle: {
    color: 'rgba(203, 213, 225, 0.8)',
    fontSize: 13
  },
  surfaceTime: {
    color: 'rgba(148, 163, 184, 0.8)',
    fontSize: 12
  },
  surfaceTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600'
  },
  tabBar: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderColor: 'rgba(148, 163, 184, 0.12)',
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12
  },
  tabIcon: {
    color: 'rgba(148, 163, 184, 0.7)',
    fontSize: 20,
    marginBottom: 4,
    textAlign: 'center'
  },
  tabIconActive: {
    color: '#60a5fa'
  },
  tabIndicator: {
    backgroundColor: '#60a5fa',
    borderRadius: 999,
    height: 3,
    marginTop: 6,
    width: 36
  },
  tabItem: {
    alignItems: 'center',
    flex: 1
  },
  tabLabel: {
    color: 'rgba(148, 163, 184, 0.7)',
    fontSize: 12,
    fontWeight: '600'
  },
  tabLabelActive: {
    color: '#60a5fa'
  },
  unreadBadge: {
    alignItems: 'center',
    backgroundColor: '#60a5fa',
    borderRadius: 999,
    minWidth: 24,
    paddingHorizontal: 6,
    paddingVertical: 4
  },
  unreadText: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '700'
  },
  utilityButton: {
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    borderColor: 'rgba(148, 163, 184, 0.18)',
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 18,
    paddingVertical: 12
  },
  utilityButtonText: {
    color: 'rgba(226, 232, 255, 0.85)',
    fontSize: 13,
    fontWeight: '600'
  },
  utilityRow: {
    columnGap: 12,
    flexDirection: 'row',
    marginTop: 18
  }
});
