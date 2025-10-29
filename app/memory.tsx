import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  calculateMemoryUsage,
  clearConversationMemories,
  loadMemoryEntries,
  loadMemorySettings,
  removeMemoryEntry,
  toggleMemoryAutoLearning,
  toggleMemoryPinned,
  toggleMemoryPrivacyShield,
  toggleMemoryReviewed,
  updateMemorySettings,
  type MemoryEntry,
  type MemorySettings,
} from '@/lib/memory-storage';

const formatRelativeTime = (timestamp: number | null | undefined): string => {
  if (!timestamp) {
    return '尚未清理';
  }

  const now = Date.now();
  const diff = now - timestamp;
  const minute = 60 * 1000;
  const hour = minute * 60;
  const day = hour * 24;

  if (diff < minute) {
    return '刚刚';
  }

  if (diff < hour) {
    return `${Math.floor(diff / minute)} 分钟前`;
  }

  if (diff < day) {
    return `${Math.floor(diff / hour)} 小时前`;
  }

  return `${Math.floor(diff / day)} 天前`;
};

type FilterOption = '全部' | '置顶' | '长期' | '会话';
const FILTERS: FilterOption[] = ['全部', '置顶', '长期', '会话'];

type Theme = {
  background: string;
  headerText: string;
  subHeaderText: string;
  cardBackground: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentSoft: string;
  accentText: string;
  success: string;
  successBackground: string;
  successText: string;
  searchBackground: string;
  searchPlaceholder: string;
  toggleTrackOn: string;
  toggleTrackOff: string;
  toggleThumb: string;
  chipBackground: string;
  chipActiveBackground: string;
  chipText: string;
  chipActiveText: string;
  progressTrack: string;
  progressFill: string;
  buttonBackground: string;
  buttonText: string;
  outlineButtonBackground: string;
  outlineButtonText: string;
  divider: string;
  confidenceBadgeBackground: string;
  confidenceBadgeText: string;
  danger: string;
};

const getTheme = (isDark: boolean): Theme =>
  isDark
    ? {
        background: '#020617',
        headerText: '#f8fafc',
        subHeaderText: '#94a3b8',
        cardBackground: '#0b1120',
        cardBorder: 'rgba(148, 163, 184, 0.2)',
        textPrimary: '#e2e8f0',
        textSecondary: '#cbd5f5',
        textMuted: '#64748b',
        accent: '#38bdf8',
        accentSoft: 'rgba(56, 189, 248, 0.18)',
        accentText: '#bae6fd',
        success: '#34d399',
        successBackground: 'rgba(52, 211, 153, 0.18)',
        successText: '#bbf7d0',
        searchBackground: 'rgba(15, 23, 42, 0.75)',
        searchPlaceholder: '#74829a',
        toggleTrackOn: '#38bdf8',
        toggleTrackOff: 'rgba(30, 41, 59, 0.75)',
        toggleThumb: '#f8fafc',
        chipBackground: 'rgba(30, 41, 59, 0.65)',
        chipActiveBackground: 'rgba(56, 189, 248, 0.22)',
        chipText: '#94a3b8',
        chipActiveText: '#e0f2fe',
        progressTrack: 'rgba(51, 65, 85, 0.55)',
        progressFill: '#38bdf8',
        buttonBackground: '#22d3ee',
        buttonText: '#04131c',
        outlineButtonBackground: 'rgba(56, 189, 248, 0.14)',
        outlineButtonText: '#38bdf8',
        divider: 'rgba(51, 65, 85, 0.5)',
        confidenceBadgeBackground: 'rgba(52, 211, 153, 0.18)',
        confidenceBadgeText: '#bbf7d0',
        danger: '#f87171',
      }
    : {
        background: '#f1f5f9',
        headerText: '#0f172a',
        subHeaderText: '#475569',
        cardBackground: '#ffffff',
        cardBorder: '#e2e8f0',
        textPrimary: '#0f172a',
        textSecondary: '#1f2937',
        textMuted: '#64748b',
        accent: '#2563eb',
        accentSoft: 'rgba(37, 99, 235, 0.12)',
        accentText: '#2563eb',
        success: '#16a34a',
        successBackground: 'rgba(22, 163, 74, 0.12)',
        successText: '#166534',
        searchBackground: '#e2e8f0',
        searchPlaceholder: '#94a3b8',
        toggleTrackOn: '#3b82f6',
        toggleTrackOff: '#cbd5f5',
        toggleThumb: '#ffffff',
        chipBackground: '#e2e8f0',
        chipActiveBackground: 'rgba(59, 130, 246, 0.18)',
        chipText: '#475569',
        chipActiveText: '#1d4ed8',
        progressTrack: '#e2e8f0',
        progressFill: '#2563eb',
        buttonBackground: '#2563eb',
        buttonText: '#ffffff',
        outlineButtonBackground: 'rgba(37, 99, 235, 0.12)',
        outlineButtonText: '#2563eb',
        divider: '#e2e8f0',
        confidenceBadgeBackground: 'rgba(22, 163, 74, 0.12)',
        confidenceBadgeText: '#166534',
        danger: '#dc2626',
      };

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 8,
      gap: 12,
    },
    backButton: {
      height: 36,
      width: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.accentSoft,
    },
    headerContent: {
      flex: 1,
      gap: 4,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.headerText,
    },
    headerSubtitle: {
      fontSize: 13,
      color: theme.subHeaderText,
    },
    spacer: {
      width: 36,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 20,
      marginBottom: 16,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 16,
      backgroundColor: theme.searchBackground,
      gap: 10,
    },
    searchInput: {
      flex: 1,
      color: theme.textPrimary,
      fontSize: 15,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 32,
      gap: 16,
    },
    card: {
      backgroundColor: theme.cardBackground,
      borderRadius: 18,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      gap: 16,
    },
    rowBetween: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.textPrimary,
    },
    cardDescription: {
      fontSize: 13,
      color: theme.textMuted,
      lineHeight: 20,
    },
    progressWrapper: {
      gap: 12,
    },
    progressRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    progressLabel: {
      fontSize: 13,
      color: theme.textMuted,
    },
    progressValue: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    progressBar: {
      height: 10,
      borderRadius: 999,
      backgroundColor: theme.progressTrack,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 999,
      backgroundColor: theme.progressFill,
    },
    filterRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    filterChip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: theme.chipBackground,
    },
    filterChipActive: {
      backgroundColor: theme.chipActiveBackground,
    },
    filterChipText: {
      fontSize: 13,
      color: theme.chipText,
    },
    filterChipTextActive: {
      color: theme.chipActiveText,
      fontWeight: '600',
    },
    sectionLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    sectionSubLabel: {
      fontSize: 13,
      color: theme.textMuted,
    },
    memoryList: {
      gap: 14,
    },
    memoryCard: {
      backgroundColor: theme.cardBackground,
      borderRadius: 18,
      padding: 18,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      gap: 12,
    },
    memoryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    memoryTitle: {
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
      color: theme.textPrimary,
    },
    memoryActions: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'center',
    },
    tagRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    tagChip: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: theme.accentSoft,
    },
    tagText: {
      fontSize: 12,
      color: theme.accentText,
      fontWeight: '500',
    },
    memoryDetail: {
      fontSize: 13,
      lineHeight: 20,
      color: theme.textSecondary,
    },
    confidenceBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: theme.confidenceBadgeBackground,
    },
    confidenceText: {
      fontSize: 12,
      color: theme.confidenceBadgeText,
      fontWeight: '600',
    },
    metaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 4,
    },
    metaText: {
      fontSize: 12,
      color: theme.textMuted,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 48,
      gap: 12,
    },
    emptyText: {
      fontSize: 15,
      color: theme.textMuted,
    },
    emptySubText: {
      fontSize: 13,
      color: theme.textMuted,
    },
    buttonPrimary: {
      paddingVertical: 12,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.buttonBackground,
    },
    buttonPrimaryText: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.buttonText,
    },
    buttonOutline: {
      paddingVertical: 10,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.outlineButtonBackground,
      borderWidth: 1,
      borderColor: theme.accentSoft,
    },
    buttonOutlineText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.outlineButtonText,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.divider,
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  });

const MemoryScreen = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = useMemo(() => getTheme(isDark), [isDark]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const switchTrackColor = useMemo(
    () => ({ false: theme.toggleTrackOff, true: theme.toggleTrackOn }),
    [theme.toggleTrackOff, theme.toggleTrackOn],
  );
  const switchThumbColor = theme.toggleThumb;

  const [settings, setSettings] = useState<MemorySettings | null>(null);
  const [entries, setEntries] = useState<MemoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterOption>('全部');

  const loadState = useCallback(async () => {
    setLoading(true);
    try {
      const [settingsValue, entriesValue] = await Promise.all([
        loadMemorySettings(),
        loadMemoryEntries(),
      ]);
      setSettings(settingsValue);
      setEntries(entriesValue);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadState();
    }, [loadState]),
  );

  const handleToggleAutoLearning = useCallback(
    async (value: boolean) => {
      const updated = await toggleMemoryAutoLearning(value);
      setSettings(updated);
    },
    [],
  );

  const handleTogglePrivacy = useCallback(
    async (value: boolean) => {
      const updated = await toggleMemoryPrivacyShield(value);
      setSettings(updated);
    },
    [],
  );

  const handleClearConversations = useCallback(() => {
    Alert.alert('清除会话记忆', '将删除所有会话范围的记忆并保留长期项目，确定继续？', [
      { text: '取消', style: 'cancel' },
      {
        text: '清除',
        style: 'destructive',
        onPress: async () => {
          const updatedEntries = await clearConversationMemories();
          setEntries(updatedEntries);
          const updatedSettings = await updateMemorySettings({ lastCleanupAt: Date.now() });
          setSettings(updatedSettings);
        },
      },
    ]);
  }, []);

  const handleTogglePinned = useCallback(async (id: string) => {
    const updated = await toggleMemoryPinned(id);
    if (updated) {
      setEntries(updated);
    }
  }, []);

  const handleToggleReviewed = useCallback(async (id: string) => {
    const updated = await toggleMemoryReviewed(id);
    if (updated) {
      setEntries(updated);
    }
  }, []);

  const handleDeleteEntry = useCallback((id: string) => {
    Alert.alert('删除记忆', '删除后该记忆将无法恢复，是否确认？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          const updatedEntries = await removeMemoryEntry(id);
          setEntries(updatedEntries);
        },
      },
    ]);
  }, []);

  const usage = useMemo(
    () => calculateMemoryUsage(entries, settings?.capacityLimit ?? 50),
    [entries, settings?.capacityLimit],
  );

  const filteredEntries = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return entries
      .filter(entry => {
        if (activeFilter === '置顶') {
          return entry.pinned;
        }
        if (activeFilter === '长期') {
          return !entry.conversationScoped;
        }
        if (activeFilter === '会话') {
          return entry.conversationScoped;
        }
        return true;
      })
      .filter(entry => {
        if (!keyword) {
          return true;
        }
        return (
          entry.summary.toLowerCase().includes(keyword) ||
          entry.detail.toLowerCase().includes(keyword) ||
          entry.tags.some(tag => tag.toLowerCase().includes(keyword))
        );
      });
  }, [entries, activeFilter, search]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name='chevron-back' size={20} color={theme.accentText} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>记忆系统</Text>
          <Text style={styles.headerSubtitle}>自动捕捉偏好，保持上下文与隐私守护</Text>
        </View>
        <View style={styles.spacer} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name='search' size={18} color={theme.searchPlaceholder} />
        <TextInput
          style={styles.searchInput}
          placeholder='搜索记忆'
          placeholderTextColor={theme.searchPlaceholder}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={styles.cardTitle}>自动学习</Text>
              <Text style={styles.cardDescription}>新的高置信度信息会自动写入记忆库</Text>
            </View>
            <Switch
              value={settings?.autoLearning ?? true}
              onValueChange={handleToggleAutoLearning}
              trackColor={switchTrackColor}
              thumbColor={switchThumbColor}
              ios_backgroundColor={theme.toggleTrackOff}
            />
          </View>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={styles.cardTitle}>敏感信息过滤</Text>
              <Text style={styles.cardDescription}>脱敏处理与清理后自动重新应用过滤规则</Text>
            </View>
            <Switch
              value={settings?.privacyShieldEnabled ?? true}
              onValueChange={handleTogglePrivacy}
              trackColor={switchTrackColor}
              thumbColor={switchThumbColor}
              ios_backgroundColor={theme.toggleTrackOff}
            />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>隐私与过滤</Text>
            <TouchableOpacity onPress={handleClearConversations} style={styles.buttonOutline}>
              <Text style={styles.buttonOutlineText}>清除会话记忆</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.progressWrapper}>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>记忆容量</Text>
              <Text style={styles.progressValue}>
                {usage.usedTokens}/{usage.limit} · {usage.status}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(100, Math.max(8, usage.ratio * 100))}%` },
                ]}
              />
            </View>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>最近清理</Text>
              <Text style={styles.progressValue}>{formatRelativeTime(settings?.lastCleanupAt)}</Text>
            </View>
          </View>
        </View>

        <View style={{ gap: 12 }}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionLabel}>记忆列表</Text>
            <Text style={styles.sectionSubLabel}>{filteredEntries.length} 条结果</Text>
          </View>
          <View style={styles.filterRow}>
            {FILTERS.map(filter => {
              const isActive = activeFilter === filter;
              return (
                <TouchableOpacity
                  key={filter}
                  onPress={() => setActiveFilter(filter)}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                >
                  <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>{filter}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.memoryList}>
          {loading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator color={theme.accent} />
              <Text style={styles.emptyText}>正在加载记忆...</Text>
            </View>
          ) : filteredEntries.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name='sparkles-outline' size={28} color={theme.searchPlaceholder} />
              <Text style={styles.emptyText}>暂无匹配的记忆</Text>
              <Text style={styles.emptySubText}>尝试调整搜索关键词或切换筛选条件</Text>
            </View>
          ) : (
            filteredEntries.map(entry => (
              <View key={entry.id} style={styles.memoryCard}>
                <View style={styles.memoryHeader}>
                  <Text style={styles.memoryTitle}>{entry.summary}</Text>
                  <View style={styles.memoryActions}>
                    <TouchableOpacity onPress={() => handleToggleReviewed(entry.id)}>
                      <Ionicons
                        name={entry.reviewed ? 'shield-checkmark' : 'shield-outline'}
                        size={18}
                        color={entry.reviewed ? theme.success : theme.textMuted}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleTogglePinned(entry.id)}>
                      <Ionicons
                        name={entry.pinned ? 'bookmark' : 'bookmark-outline'}
                        size={18}
                        color={entry.pinned ? theme.accent : theme.textMuted}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteEntry(entry.id)}>
                      <Ionicons name='trash-outline' size={18} color={theme.danger} />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.memoryDetail}>{entry.detail}</Text>

                <View style={styles.tagRow}>
                  <View style={styles.tagChip}>
                    <Text style={styles.tagText}>{entry.conversationScoped ? '会话记忆' : '长期记忆'}</Text>
                  </View>
                  {entry.tags.map(tag => (
                    <View key={tag} style={styles.tagChip}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.confidenceBadge}>
                  <Ionicons name='checkmark-circle' size={14} color={theme.success} />
                  <Text style={styles.confidenceText}>置信度 {entry.confidence.toFixed(2)}</Text>
                </View>

                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>更新于 {formatRelativeTime(entry.updatedAt)}</Text>
                  <Text style={styles.metaText}>{entry.tokenFootprint} tokens</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MemoryScreen;
