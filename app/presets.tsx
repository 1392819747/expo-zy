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
  loadPresetDefinitions,
  togglePresetEnabled,
  type PresetDefinition,
} from '@/lib/preset-storage';

type Theme = {
  background: string;
  cardBackground: string;
  border: string;
  headerText: string;
  subHeaderText: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  searchBackground: string;
  searchPlaceholder: string;
  iconBackground: string;
  iconText: string;
  badgeBackground: string;
  badgeText: string;
  variableBackground: string;
  variableText: string;
  actionBackground: string;
  actionText: string;
  primaryActionBackground: string;
  primaryActionText: string;
  toggleTrackOn: string;
  toggleTrackOff: string;
  toggleThumb: string;
  divider: string;
  highlight: string;
};

const getTheme = (isDark: boolean): Theme =>
  isDark
    ? {
        background: '#020617',
        cardBackground: '#0b1120',
        border: 'rgba(148, 163, 184, 0.18)',
        headerText: '#f8fafc',
        subHeaderText: '#94a3b8',
        textPrimary: '#e2e8f0',
        textSecondary: '#cbd5f5',
        textMuted: '#64748b',
        searchBackground: 'rgba(15, 23, 42, 0.75)',
        searchPlaceholder: '#74829a',
        iconBackground: 'rgba(37, 99, 235, 0.16)',
        iconText: '#38bdf8',
        badgeBackground: 'rgba(56, 189, 248, 0.18)',
        badgeText: '#bae6fd',
        variableBackground: 'rgba(100, 116, 139, 0.25)',
        variableText: '#e2e8f0',
        actionBackground: 'rgba(59, 130, 246, 0.18)',
        actionText: '#bfdbfe',
        primaryActionBackground: '#22c55e',
        primaryActionText: '#f0fdf4',
        toggleTrackOn: '#38bdf8',
        toggleTrackOff: 'rgba(30, 41, 59, 0.75)',
        toggleThumb: '#f8fafc',
        divider: 'rgba(51, 65, 85, 0.5)',
        highlight: '#38bdf8',
      }
    : {
        background: '#f1f5f9',
        cardBackground: '#ffffff',
        border: '#e2e8f0',
        headerText: '#0f172a',
        subHeaderText: '#475569',
        textPrimary: '#0f172a',
        textSecondary: '#1f2937',
        textMuted: '#64748b',
        searchBackground: '#e2e8f0',
        searchPlaceholder: '#94a3b8',
        iconBackground: 'rgba(59, 130, 246, 0.12)',
        iconText: '#2563eb',
        badgeBackground: 'rgba(37, 99, 235, 0.12)',
        badgeText: '#2563eb',
        variableBackground: 'rgba(148, 163, 184, 0.22)',
        variableText: '#1f2937',
        actionBackground: 'rgba(37, 99, 235, 0.12)',
        actionText: '#2563eb',
        primaryActionBackground: '#22c55e',
        primaryActionText: '#f0fdf4',
        toggleTrackOn: '#3b82f6',
        toggleTrackOff: '#cbd5f5',
        toggleThumb: '#ffffff',
        divider: '#e2e8f0',
        highlight: '#2563eb',
      };

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingBottom: 16,
      paddingTop: 12,
      gap: 16,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.searchBackground,
    },
    headerTextContainer: {
      flex: 1,
      marginLeft: 12,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.headerText,
    },
    subtitle: {
      fontSize: 14,
      color: theme.subHeaderText,
      marginTop: 6,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.searchBackground,
      gap: 12,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: theme.textPrimary,
    },
    section: {
      flex: 1,
    },
    content: {
      paddingBottom: 32,
      paddingHorizontal: 20,
      gap: 16,
    },
    card: {
      borderRadius: 20,
      padding: 20,
      backgroundColor: theme.cardBackground,
      borderWidth: 1,
      borderColor: theme.border,
      gap: 16,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 16,
    },
    iconBadge: {
      width: 50,
      height: 50,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconText: {
      fontSize: 22,
      fontWeight: '700',
    },
    cardTitleContainer: {
      flex: 1,
      gap: 6,
    },
    cardTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.textPrimary,
      flexShrink: 1,
    },
    switchContainer: {
      marginLeft: 12,
    },
    cardSubtitle: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    badge: {
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 4,
      backgroundColor: theme.badgeBackground,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.badgeText,
    },
    metaText: {
      fontSize: 12,
      color: theme.textMuted,
    },
    divider: {
      height: 1,
      backgroundColor: theme.divider,
    },
    tagRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    tag: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
      backgroundColor: theme.variableBackground,
    },
    tagText: {
      fontSize: 12,
      color: theme.variableText,
    },
    variablesRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    variableLabel: {
      fontSize: 12,
      color: theme.textMuted,
      fontWeight: '600',
    },
    variableChip: {
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 4,
      backgroundColor: theme.badgeBackground,
      marginRight: 8,
    },
    variableText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.badgeText,
    },
    variableGroup: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
    },
    actionsRow: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      gap: 12,
    },
    actionButton: {
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: theme.actionBackground,
    },
    actionText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.actionText,
    },
    footer: {
      paddingHorizontal: 20,
      paddingBottom: 32,
      paddingTop: 8,
      gap: 16,
    },
    footerSummary: {
      fontSize: 14,
      color: theme.textMuted,
    },
    footerActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    primaryAction: {
      backgroundColor: theme.primaryActionBackground,
    },
    primaryActionText: {
      color: theme.primaryActionText,
    },
    emptyState: {
      paddingVertical: 60,
      alignItems: 'center',
      gap: 12,
    },
    emptyTitle: {
      fontSize: 16,
      color: theme.textSecondary,
      fontWeight: '600',
    },
    emptyDescription: {
      fontSize: 14,
      color: theme.textMuted,
      textAlign: 'center',
      lineHeight: 20,
    },
    loading: {
      paddingVertical: 48,
    },
  });

const formatRelativeTime = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) {
    return '刚刚更新';
  }
  if (diff < hour) {
    return `${Math.floor(diff / minute)} 分钟前更新`;
  }
  if (diff < day) {
    return `${Math.floor(diff / hour)} 小时前更新`;
  }
  return `${Math.floor(diff / day)} 天前更新`;
};

export default function PresetScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = useMemo(() => getTheme(isDark), [isDark]);
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [presets, setPresets] = useState<PresetDefinition[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      const loaded = await loadPresetDefinitions();
      setPresets(loaded);
    } catch (error) {
      console.error('加载预设失败', error);
      Alert.alert('加载失败', '无法读取预设，请稍后重试。');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const handleToggle = useCallback(
    (id: string, value: boolean) => {
      setPresets(prev => prev.map(item => (item.id === id ? { ...item, enabled: value } : item)));
      togglePresetEnabled(id, value)
        .then(updated => {
          setPresets(updated);
        })
        .catch(error => {
          console.error('切换预设状态失败', error);
          setPresets(prev => prev.map(item => (item.id === id ? { ...item, enabled: !value } : item)));
          Alert.alert('操作失败', '暂时无法更新预设状态，请稍后再试。');
        });
    },
    [],
  );

  const handleEdit = useCallback((preset: PresetDefinition) => {
    Alert.alert('编辑预设', `即将提供对“${preset.name}”的编辑能力。`);
  }, []);

  const handlePreview = useCallback((preset: PresetDefinition) => {
    Alert.alert('预览预设', `将在后续版本提供对“${preset.name}”的拼装预览。`);
  }, []);

  const handleAssemble = useCallback(() => {
    Alert.alert('拼装预览', '拼装预览功能即将上线，敬请期待。');
  }, []);

  const handleImport = useCallback(() => {
    Alert.alert('导入 JSON', '稍后将支持从 JSON 导入预设。');
  }, []);

  const handleExport = useCallback(() => {
    Alert.alert('导出 JSON', '稍后将支持导出预设为 JSON。');
  }, []);

  const filteredPresets = useMemo(() => {
    if (search.trim().length === 0) {
      return presets;
    }

    const keyword = search.trim().toLowerCase();
    return presets.filter(preset => {
      const base = `${preset.name} ${preset.description} ${preset.category}`.toLowerCase();
      if (base.includes(keyword)) {
        return true;
      }

      return (
        preset.tags.some(tag => tag.toLowerCase().includes(keyword)) ||
        preset.variables.some(variable => variable.toLowerCase().includes(keyword))
      );
    });
  }, [presets, search]);

  const activeCount = useMemo(() => presets.filter(preset => preset.enabled).length, [presets]);

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity accessibilityRole='button' onPress={() => router.back()} style={styles.backButton}>
            <Ionicons color={theme.highlight} name='chevron-back' size={22} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>预设库</Text>
            <Text style={styles.subtitle}>管理常用提示词模板，快速切换适配不同场景。</Text>
          </View>
        </View>
        <View style={styles.searchContainer}>
          <Ionicons color={theme.textMuted} name='search' size={18} />
          <TextInput
            autoCorrect={false}
            onChangeText={setSearch}
            placeholder='搜索预设'
            placeholderTextColor={theme.searchPlaceholder}
            style={styles.searchInput}
            value={search}
          />
        </View>
      </View>
      <View style={styles.section}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {isLoading ? (
            <View style={[styles.loading, { alignItems: 'center' }]}>
              <ActivityIndicator color={theme.highlight} size='small' />
            </View>
          ) : filteredPresets.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons color={theme.textMuted} name='sparkles-outline' size={28} />
              <Text style={styles.emptyTitle}>没有匹配的预设</Text>
              <Text style={styles.emptyDescription}>
                尝试调整搜索关键词，或点击下方按钮导入新的预设模板。
              </Text>
            </View>
          ) : (
            filteredPresets.map(preset => (
              <View key={preset.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={[styles.iconBadge, { backgroundColor: theme.iconBackground }]}>
                    <Text style={[styles.iconText, { color: theme.iconText }]}>P</Text>
                  </View>
                  <View style={styles.cardTitleContainer}>
                    <View style={styles.cardTitleRow}>
                      <Text numberOfLines={1} style={styles.cardTitle}>
                        {preset.name}
                      </Text>
                    </View>
                    <Text numberOfLines={2} style={styles.cardSubtitle}>
                      {preset.description}
                    </Text>
                    <View style={styles.metaRow}>
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{preset.scope}</Text>
                      </View>
                      <Text style={styles.metaText}>{preset.category}</Text>
                      <Text style={styles.metaText}>{formatRelativeTime(preset.updatedAt)}</Text>
                    </View>
                  </View>
                  <View style={styles.switchContainer}>
                    <Switch
                      onValueChange={value => handleToggle(preset.id, value)}
                      ios_backgroundColor={theme.toggleTrackOff}
                      thumbColor={theme.toggleThumb}
                      trackColor={{ false: theme.toggleTrackOff, true: theme.toggleTrackOn }}
                      value={preset.enabled}
                    />
                  </View>
                </View>
                <View style={styles.divider} />
                {preset.tags.length > 0 && (
                  <View style={styles.tagRow}>
                    {preset.tags.map(tag => (
                      <View key={tag} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
                {preset.variables.length > 0 && (
                  <View style={styles.variablesRow}>
                    <Text style={styles.variableLabel}>变量</Text>
                    <View style={styles.variableGroup}>
                      {preset.variables.map(variable => (
                        <View key={variable} style={styles.variableChip}>
                          <Text style={styles.variableText}>{variable}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                <View style={styles.actionsRow}>
                  <TouchableOpacity onPress={() => handleEdit(preset)} style={styles.actionButton}>
                    <Text style={styles.actionText}>编辑</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handlePreview(preset)} style={styles.actionButton}>
                    <Text style={styles.actionText}>预览</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerSummary}>
          已启用 {activeCount} / {presets.length} 个预设
        </Text>
        <View style={styles.footerActions}>
          <TouchableOpacity onPress={handleAssemble} style={[styles.actionButton, styles.primaryAction]}>
            <Text style={[styles.actionText, styles.primaryActionText]}>拼装预览</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleImport} style={styles.actionButton}>
            <Text style={styles.actionText}>导入 JSON</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleExport} style={styles.actionButton}>
            <Text style={styles.actionText}>导出 JSON</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
