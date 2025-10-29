import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
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
  addWorldBookEntry,
  deleteWorldBookEntry,
  loadWorldBookEntries,
  loadWorldBookSettings,
  toggleWorldBookEntry,
  updateWorldBookEntry,
  updateWorldBookSettings,
  type WorldBookCategory,
  type WorldBookEntry,
  type WorldBookScope,
  type WorldBookSettings,
} from '@/lib/worldbook-storage';

type ScopeFilter = '全部' | WorldBookScope;
type CategoryFilter = '全部' | WorldBookCategory;

type Theme = {
  background: string;
  cardBackground: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentContrast: string;
  headerButtonBackground: string;
  searchBackground: string;
  searchPlaceholder: string;
  statusInjectedBackground: string;
  statusInjectedText: string;
  statusDisabledBackground: string;
  statusDisabledText: string;
  badgeBackground: string;
  badgeText: string;
  keywordBackground: string;
  keywordText: string;
  divider: string;
  switchTrackOn: string;
  switchTrackOff: string;
  switchThumb: string;
  actionButtonBackground: string;
  actionButtonText: string;
  destructive: string;
  warning: string;
  pinned: string;
  modalBackdrop: string;
  modalCard: string;
  inputBackground: string;
  inputBorder: string;
  placeholder: string;
};

const getTheme = (isDark: boolean): Theme =>
  isDark
    ? {
        background: '#020617',
        cardBackground: '#0b1120',
        border: 'rgba(148, 163, 184, 0.2)',
        textPrimary: '#f8fafc',
        textSecondary: '#cbd5f5',
        textMuted: '#64748b',
        accent: '#38bdf8',
        accentContrast: '#020617',
        headerButtonBackground: 'rgba(15, 23, 42, 0.8)',
        searchBackground: 'rgba(15, 23, 42, 0.65)',
        searchPlaceholder: '#64748b',
        statusInjectedBackground: 'rgba(56, 189, 248, 0.16)',
        statusInjectedText: '#38bdf8',
        statusDisabledBackground: 'rgba(148, 163, 184, 0.18)',
        statusDisabledText: '#cbd5f5',
        badgeBackground: 'rgba(59, 130, 246, 0.18)',
        badgeText: '#bfdbfe',
        keywordBackground: 'rgba(59, 130, 246, 0.22)',
        keywordText: '#dbeafe',
        divider: 'rgba(71, 85, 105, 0.45)',
        switchTrackOn: '#0ea5e9',
        switchTrackOff: 'rgba(30, 41, 59, 0.9)',
        switchThumb: '#f8fafc',
        actionButtonBackground: 'rgba(59, 130, 246, 0.16)',
        actionButtonText: '#bfdbfe',
        destructive: '#f87171',
        warning: '#fbbf24',
        pinned: '#facc15',
        modalBackdrop: 'rgba(2, 6, 23, 0.85)',
        modalCard: '#0f172a',
        inputBackground: 'rgba(15, 23, 42, 0.8)',
        inputBorder: 'rgba(148, 163, 184, 0.25)',
        placeholder: '#74829a',
      }
    : {
        background: '#f8fafc',
        cardBackground: '#ffffff',
        border: '#e2e8f0',
        textPrimary: '#0f172a',
        textSecondary: '#475569',
        textMuted: '#94a3b8',
        accent: '#2563eb',
        accentContrast: '#ffffff',
        headerButtonBackground: '#e2e8f0',
        searchBackground: '#e2e8f0',
        searchPlaceholder: '#94a3b8',
        statusInjectedBackground: 'rgba(37, 99, 235, 0.12)',
        statusInjectedText: '#2563eb',
        statusDisabledBackground: 'rgba(148, 163, 184, 0.2)',
        statusDisabledText: '#475569',
        badgeBackground: 'rgba(59, 130, 246, 0.12)',
        badgeText: '#2563eb',
        keywordBackground: 'rgba(191, 219, 254, 0.7)',
        keywordText: '#1d4ed8',
        divider: '#e2e8f0',
        switchTrackOn: '#3b82f6',
        switchTrackOff: '#cbd5f5',
        switchThumb: '#ffffff',
        actionButtonBackground: 'rgba(37, 99, 235, 0.12)',
        actionButtonText: '#2563eb',
        destructive: '#dc2626',
        warning: '#f59e0b',
        pinned: '#d97706',
        modalBackdrop: 'rgba(15, 23, 42, 0.2)',
        modalCard: '#ffffff',
        inputBackground: '#ffffff',
        inputBorder: '#dbe2f0',
        placeholder: '#94a3b8',
      };

const CATEGORY_OPTIONS: WorldBookCategory[] = ['设定', '人物', '地点', '剧情', '道具', '其他'];
const SCOPE_FILTERS: ScopeFilter[] = ['全部', '全局', '会话'];

const formatRelativeTime = (timestamp: number | null): string => {
  if (!timestamp) {
    return '未注入';
  }
  const now = Date.now();
  const diff = now - timestamp;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
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

const getStatusMeta = (entry: WorldBookEntry, theme: Theme) =>
  entry.enabled
    ? {
        label: '注入',
        backgroundColor: theme.statusInjectedBackground,
        color: theme.statusInjectedText,
      }
    : {
        label: '失效',
        backgroundColor: theme.statusDisabledBackground,
        color: theme.statusDisabledText,
      };

type EntryFormState = {
  title: string;
  keywords: string;
  content: string;
  category: WorldBookCategory;
  scope: WorldBookScope;
};

const createInitialFormState = (): EntryFormState => ({
  title: '',
  keywords: '',
  content: '',
  category: '设定',
  scope: '全局',
});

export default function WorldBookScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = useMemo(() => getTheme(isDark), [isDark]);
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [entries, setEntries] = useState<WorldBookEntry[]>([]);
  const [settings, setSettings] = useState<WorldBookSettings>({ enabled: true });
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('全部');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [formState, setFormState] = useState<EntryFormState>(createInitialFormState());

  const loadData = useCallback(async () => {
    const [loadedEntries, loadedSettings] = await Promise.all([
      loadWorldBookEntries(),
      loadWorldBookSettings(),
    ]);
    setEntries(loadedEntries);
    setSettings(loadedSettings);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData]),
  );

  const handleToggleGlobal = async () => {
    const updated = await updateWorldBookSettings({ enabled: !settings.enabled });
    setSettings(updated);
  };

  const handleToggleEntry = async (entry: WorldBookEntry) => {
    const updated = await toggleWorldBookEntry(entry.id);
    if (updated) {
      setEntries(updated);
    }
  };

  const handleDeleteEntry = (entry: WorldBookEntry) => {
    Alert.alert('删除词条', `确定要删除「${entry.title}」吗？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          const updated = await deleteWorldBookEntry(entry.id);
          setEntries(updated);
        },
      },
    ]);
  };

  const handleTogglePin = async (entry: WorldBookEntry) => {
    const updated = await updateWorldBookEntry(entry.id, { pinned: !entry.pinned });
    if (updated) {
      setEntries(updated);
    }
  };

  const handleSubmit = async () => {
    if (!formState.title.trim()) {
      Alert.alert('提示', '请输入词条标题');
      return;
    }
    const keywords = formState.keywords
      .split(',')
      .map(keyword => keyword.trim())
      .filter(Boolean);
    try {
      await addWorldBookEntry({
        title: formState.title,
        keywords,
        content: formState.content,
        category: formState.category,
        scope: formState.scope,
      });
      const updated = await loadWorldBookEntries();
      setEntries(updated);
      setFormState(createInitialFormState());
      setIsModalVisible(false);
    } catch (error) {
      console.error('新增词条失败', error);
      Alert.alert('错误', '新增词条失败，请稍后再试');
    }
  };

  const uniqueCategories = useMemo(() => {
    const values = new Set<WorldBookCategory>();
    entries.forEach(entry => values.add(entry.category));
    return ['全部', ...Array.from(values)] as CategoryFilter[];
  }, [entries]);

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      if (scopeFilter !== '全部' && entry.scope !== scopeFilter) {
        return false;
      }
      if (categoryFilter !== '全部' && entry.category !== categoryFilter) {
        return false;
      }
      const keyword = searchQuery.trim();
      if (keyword.length > 0) {
        const haystack = `${entry.title} ${entry.content} ${entry.keywords.join(' ')}`;
        if (!haystack.includes(keyword)) {
          return false;
        }
      }
      return true;
    });
  }, [entries, scopeFilter, categoryFilter, searchQuery]);

  const activeCount = useMemo(
    () => entries.filter(entry => entry.enabled).length,
    [entries],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerButton}
          >
            <Ionicons name='chevron-back' size={20} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>世界书</Text>
          <TouchableOpacity
            onPress={() => setIsModalVisible(true)}
            style={styles.headerButton}
          >
            <Ionicons name='add' size={22} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          为对话注入背景知识：触发关键词时会将世界书内容自动注入上下文。
        </Text>

        <View style={styles.segmentRow}>
          {SCOPE_FILTERS.map(scope => {
            const isActive = scopeFilter === scope;
            return (
              <TouchableOpacity
                key={scope}
                onPress={() => setScopeFilter(scope)}
                style={[styles.segmentButton, isActive && styles.segmentButtonActive]}
              >
                <Text
                  style={[styles.segmentButtonText, isActive && styles.segmentButtonTextActive]}
                >
                  {scope}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.searchBar}>
          <Ionicons name='search' size={18} color={theme.accent} />
          <TextInput
            placeholder='搜索词条或关键词'
            placeholderTextColor={theme.searchPlaceholder}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name='close-circle' size={18} color={theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.settingsCard}>
          <View style={styles.settingsHeader}>
            <Text style={styles.settingsTitle}>基础设置</Text>
            <Text style={styles.settingsHint}>已启用 {activeCount} / {entries.length}</Text>
          </View>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingTitle}>启用世界书</Text>
              <Text style={styles.settingDescription}>
                控制是否在会话中自动注入匹配词条
              </Text>
            </View>
            <Switch
              value={settings.enabled}
              onValueChange={handleToggleGlobal}
              trackColor={{ false: theme.switchTrackOff, true: theme.switchTrackOn }}
              thumbColor={theme.switchThumb}
            />
          </View>
          <View style={styles.divider} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterChips}
          >
            {uniqueCategories.map(category => {
              const isActive = categoryFilter === category;
              return (
                <TouchableOpacity
                  key={category}
                  onPress={() => setCategoryFilter(category)}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                >
                  <Text
                    style={[styles.filterChipText, isActive && styles.filterChipTextActive]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Alert.alert('筛选词条', '筛选功能即将上线')}
          >
            <Ionicons name='funnel-outline' size={16} color={theme.actionButtonText} />
            <Text style={styles.actionButtonText}>筛选词条</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Alert.alert('导入', 'JSON 导入功能即将上线')}
          >
            <Ionicons name='download-outline' size={16} color={theme.actionButtonText} />
            <Text style={styles.actionButtonText}>导入 JSON</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonLast]}
            onPress={() => Alert.alert('导出', 'JSON 导出功能即将上线')}
          >
            <Ionicons name='cloud-upload-outline' size={16} color={theme.actionButtonText} />
            <Text style={styles.actionButtonText}>导出 JSON</Text>
          </TouchableOpacity>
        </View>

        {filteredEntries.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name='book-outline' size={42} color={theme.textMuted} />
            <Text style={styles.emptyTitle}>暂无匹配词条</Text>
            <Text style={styles.emptyDescription}>尝试调整筛选条件或添加新的世界书条目。</Text>
          </View>
        ) : (
          filteredEntries.map(entry => {
            const statusMeta = getStatusMeta(entry, theme);
            return (
              <View key={entry.id} style={styles.entryCard}>
                <View style={styles.entryHeader}>
                  <View style={styles.entryTitleRow}>
                    <TouchableOpacity onPress={() => handleTogglePin(entry)}>
                      <Ionicons
                        name={entry.pinned ? 'bookmark' : 'bookmark-outline'}
                        size={18}
                        color={entry.pinned ? theme.pinned : theme.textMuted}
                      />
                    </TouchableOpacity>
                    <Text style={styles.entryTitle}>{entry.title}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleToggleEntry(entry)}
                    style={[styles.statusBadge, { backgroundColor: statusMeta.backgroundColor }]}
                  >
                    <Text style={[styles.statusText, { color: statusMeta.color }]}>{statusMeta.label}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.entryMetaRow}>
                  <View style={styles.metaBadge}>
                    <Text style={styles.metaBadgeText}>{entry.category}</Text>
                  </View>
                  <View style={styles.metaBadge}>
                    <Text style={styles.metaBadgeText}>{entry.scope}</Text>
                  </View>
                  <Text style={styles.metaHint}>最近注入 {formatRelativeTime(entry.lastInjectedAt)}</Text>
                </View>

                {entry.content ? (
                  <Text numberOfLines={3} style={styles.entryContent}>
                    {entry.content}
                  </Text>
                ) : null}

                {entry.keywords.length > 0 && (
                  <View style={styles.keywordRow}>
                    {entry.keywords.slice(0, 6).map(keyword => (
                      <View key={keyword} style={styles.keywordChip}>
                        <Text style={styles.keywordText}>{keyword}</Text>
                      </View>
                    ))}
                    {entry.keywords.length > 6 && (
                      <View style={styles.keywordChip}>
                        <Text style={styles.keywordText}>+{entry.keywords.length - 6}</Text>
                      </View>
                    )}
                  </View>
                )}

                <View style={styles.entryFooter}>
                  <TouchableOpacity
                    onPress={() => handleToggleEntry(entry)}
                    style={styles.entryFooterButton}
                  >
                    <Ionicons
                      name={entry.enabled ? 'pause-circle-outline' : 'play-circle-outline'}
                      size={18}
                      color={theme.accent}
                    />
                    <Text style={styles.entryFooterButtonText}>
                      {entry.enabled ? '停用词条' : '启用词条'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => Alert.alert('预览词条', entry.content || '暂无内容')}
                    style={styles.entryFooterButton}
                  >
                    <Ionicons name='eye-outline' size={18} color={theme.accent} />
                    <Text style={styles.entryFooterButtonText}>预览内容</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteEntry(entry)}
                    style={styles.entryFooterButton}
                  >
                    <Ionicons name='trash-outline' size={18} color={theme.destructive} />
                    <Text style={[styles.entryFooterButtonText, { color: theme.destructive }]}>删除</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <Modal
        animationType='fade'
        transparent
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>新建词条</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name='close' size={22} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalLabel}>标题</Text>
              <TextInput
                placeholder='请输入词条名称'
                placeholderTextColor={theme.placeholder}
                style={styles.modalInput}
                value={formState.title}
                onChangeText={title => setFormState(prev => ({ ...prev, title }))}
              />

              <Text style={styles.modalLabel}>关键词 (用逗号分隔)</Text>
              <TextInput
                placeholder='关键词1, 关键词2'
                placeholderTextColor={theme.placeholder}
                style={styles.modalInput}
                value={formState.keywords}
                onChangeText={keywords => setFormState(prev => ({ ...prev, keywords }))}
              />

              <Text style={styles.modalLabel}>词条分类</Text>
              <View style={styles.modalChipRow}>
                {CATEGORY_OPTIONS.map(category => {
                  const isActive = formState.category === category;
                  return (
                    <TouchableOpacity
                      key={category}
                      onPress={() => setFormState(prev => ({ ...prev, category }))}
                      style={[styles.modalChip, isActive && styles.modalChipActive]}
                    >
                      <Text
                        style={[styles.modalChipText, isActive && styles.modalChipTextActive]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.modalLabel}>适用范围</Text>
              <View style={styles.modalChipRow}>
                {(['全局', '会话'] as WorldBookScope[]).map(scope => {
                  const isActive = formState.scope === scope;
                  return (
                    <TouchableOpacity
                      key={scope}
                      onPress={() => setFormState(prev => ({ ...prev, scope }))}
                      style={[styles.modalChip, isActive && styles.modalChipActive]}
                    >
                      <Text
                        style={[styles.modalChipText, isActive && styles.modalChipTextActive]}
                      >
                        {scope}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.modalLabel}>详细描述</Text>
              <TextInput
                multiline
                numberOfLines={6}
                placeholder='补充背景、设定或剧情...'
                placeholderTextColor={theme.placeholder}
                style={[styles.modalInput, styles.modalTextArea]}
                value={formState.content}
                onChangeText={content => setFormState(prev => ({ ...prev, content }))}
              />
            </ScrollView>
            <TouchableOpacity onPress={handleSubmit} style={styles.modalSubmit}>
              <Ionicons name='save-outline' size={18} color={theme.accentContrast} />
              <Text style={styles.modalSubmitText}>保存词条</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    contentContainer: {
      padding: 20,
      paddingBottom: 120,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    headerButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.headerButtonBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.textPrimary,
    },
    subtitle: {
      fontSize: 13,
      color: theme.textMuted,
      lineHeight: 20,
      marginBottom: 16,
    },
    segmentRow: {
      flexDirection: 'row',
      backgroundColor: theme.cardBackground,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 4,
      marginBottom: 16,
    },
    segmentButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 999,
      alignItems: 'center',
    },
    segmentButtonActive: {
      backgroundColor: theme.accent,
    },
    segmentButtonText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    segmentButtonTextActive: {
      color: theme.accentContrast,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.searchBackground,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginBottom: 20,
    },
    searchInput: {
      flex: 1,
      marginHorizontal: 12,
      color: theme.textPrimary,
      fontSize: 14,
    },
    settingsCard: {
      backgroundColor: theme.cardBackground,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 20,
      marginBottom: 20,
    },
    settingsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    settingsTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.textPrimary,
    },
    settingsHint: {
      fontSize: 12,
      color: theme.textMuted,
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    settingTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.textPrimary,
    },
    settingDescription: {
      fontSize: 12,
      color: theme.textMuted,
      marginTop: 4,
    },
    divider: {
      height: 1,
      backgroundColor: theme.divider,
      marginBottom: 16,
    },
    filterChips: {
      paddingVertical: 4,
    },
    filterChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: 'transparent',
      backgroundColor: 'transparent',
      marginRight: 12,
    },
    filterChipActive: {
      backgroundColor: theme.accent,
      borderColor: theme.accent,
    },
    filterChipText: {
      fontSize: 12,
      color: theme.textSecondary,
      fontWeight: '600',
    },
    filterChipTextActive: {
      color: theme.accentContrast,
    },
    actionRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 20,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.actionButtonBackground,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 14,
      marginRight: 12,
      marginBottom: 12,
    },
    actionButtonLast: {
      marginRight: 0,
    },
    actionButtonText: {
      marginLeft: 6,
      color: theme.actionButtonText,
      fontSize: 12,
      fontWeight: '600',
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
    },
    emptyTitle: {
      fontSize: 16,
      color: theme.textSecondary,
      fontWeight: '600',
      marginTop: 12,
    },
    emptyDescription: {
      fontSize: 13,
      color: theme.textMuted,
      textAlign: 'center',
      lineHeight: 18,
      paddingHorizontal: 12,
    },
    entryCard: {
      backgroundColor: theme.cardBackground,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 18,
      marginBottom: 16,
    },
    entryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    entryTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    entryTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.textPrimary,
      marginLeft: 8,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 999,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '700',
    },
    entryMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    metaBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: theme.badgeBackground,
      marginRight: 8,
    },
    metaBadgeText: {
      fontSize: 11,
      color: theme.badgeText,
      fontWeight: '600',
    },
    metaHint: {
      fontSize: 11,
      color: theme.textMuted,
    },
    entryContent: {
      fontSize: 14,
      lineHeight: 20,
      color: theme.textSecondary,
      marginBottom: 12,
    },
    keywordRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 12,
    },
    keywordChip: {
      backgroundColor: theme.keywordBackground,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      marginRight: 8,
      marginBottom: 8,
    },
    keywordText: {
      fontSize: 11,
      color: theme.keywordText,
      fontWeight: '600',
    },
    entryFooter: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    entryFooterButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 16,
      marginBottom: 8,
    },
    entryFooterButtonText: {
      marginLeft: 6,
      fontSize: 12,
      fontWeight: '600',
      color: theme.accent,
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: theme.modalBackdrop,
      justifyContent: 'center',
      padding: 24,
    },
    modalCard: {
      backgroundColor: theme.modalCard,
      borderRadius: 24,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.border,
      maxHeight: '90%',
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.textPrimary,
    },
    modalLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.textSecondary,
      marginTop: 12,
      marginBottom: 6,
    },
    modalInput: {
      borderWidth: 1,
      borderColor: theme.inputBorder,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 14,
      color: theme.textPrimary,
      backgroundColor: theme.inputBackground,
    },
    modalTextArea: {
      minHeight: 120,
      textAlignVertical: 'top',
    },
    modalChipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 4,
    },
    modalChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.border,
      marginRight: 8,
      marginBottom: 8,
    },
    modalChipActive: {
      backgroundColor: theme.accent,
      borderColor: theme.accent,
    },
    modalChipText: {
      fontSize: 12,
      color: theme.textSecondary,
      fontWeight: '600',
    },
    modalChipTextActive: {
      color: theme.accentContrast,
    },
    modalSubmit: {
      marginTop: 16,
      backgroundColor: theme.accent,
      borderRadius: 16,
      paddingVertical: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalSubmitText: {
      marginLeft: 8,
      color: theme.accentContrast,
      fontSize: 15,
      fontWeight: '700',
    },
  });
