import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';

import {
  addWorldBookEntry,
  deleteWorldBookEntry,
  loadWorldBookEntries,
  toggleWorldBookEntry,
  type WorldBookCategory,
  type WorldBookEntry,
  type WorldBookScope,
} from '@/lib/worldbook-storage';

type FormState = {
  title: string;
  keywords: string;
  content: string;
  category: WorldBookCategory;
  scope: WorldBookScope;
};

type ThemeTokens = {
  background: string;
  cardBackground: string;
  textPrimary: string;
  textSecondary: string;
  muted: string;
  border: string;
  accent: string;
  accentContrast: string;
  chipBackground: string;
  chipText: string;
  chipActiveBackground: string;
  chipActiveText: string;
  inputBackground: string;
  inputBorder: string;
  placeholder: string;
  buttonBackground: string;
  buttonText: string;
  deleteBackground: string;
  deleteText: string;
  toggleActive: string;
  toggleInactive: string;
};

const getThemeTokens = (isDark: boolean): ThemeTokens =>
  isDark
    ? {
        background: '#05070c',
        cardBackground: '#0b1220',
        textPrimary: '#e2e8f0',
        textSecondary: '#cbd5f5',
        muted: '#64748b',
        border: 'rgba(148, 163, 184, 0.16)',
        accent: '#38bdf8',
        accentContrast: '#020617',
        chipBackground: 'rgba(59, 130, 246, 0.18)',
        chipText: '#bfdbfe',
        chipActiveBackground: '#38bdf8',
        chipActiveText: '#020617',
        inputBackground: '#111a2c',
        inputBorder: 'rgba(148, 163, 184, 0.2)',
        placeholder: '#74829a',
        buttonBackground: '#0ea5e9',
        buttonText: '#f8fafc',
        deleteBackground: 'rgba(239, 68, 68, 0.18)',
        deleteText: '#fca5a5',
        toggleActive: '#38bdf8',
        toggleInactive: '#475569',
      }
    : {
        background: '#f7f9fc',
        cardBackground: '#ffffff',
        textPrimary: '#1f2937',
        textSecondary: '#475569',
        muted: '#94a3b8',
        border: '#e2e8f0',
        accent: '#2563eb',
        accentContrast: '#ffffff',
        chipBackground: '#e0f2ff',
        chipText: '#1760a5',
        chipActiveBackground: '#2563eb',
        chipActiveText: '#ffffff',
        inputBackground: '#ffffff',
        inputBorder: '#dbe2f0',
        placeholder: '#94a3b8',
        buttonBackground: '#2563eb',
        buttonText: '#ffffff',
        deleteBackground: '#fee2e2',
        deleteText: '#fa5252',
        toggleActive: '#4B9BFF',
        toggleInactive: '#94a3b8',
      };

const createStyles = (theme: ThemeTokens) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    section: {
      margin: 16,
      padding: 16,
      backgroundColor: theme.cardBackground,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
    description: {
      fontSize: 13,
      color: theme.muted,
      lineHeight: 20,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.textPrimary,
    },
    addButton: {
      padding: 4,
      borderRadius: 16,
      backgroundColor: 'transparent',
    },
    emptyText: {
      fontSize: 13,
      color: theme.muted,
      textAlign: 'center',
      paddingVertical: 20,
    },
    form: {
      marginBottom: 16,
    },
    labelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    label: {
      fontSize: 13,
      fontWeight: '500',
      color: theme.textSecondary,
      marginBottom: 6,
      marginTop: 12,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.inputBorder,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 14,
      color: theme.textPrimary,
      backgroundColor: theme.inputBackground,
    },
    textArea: {
      minHeight: 120,
      textAlignVertical: 'top',
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 4,
    },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: theme.chipBackground,
      marginRight: 8,
      marginBottom: 8,
    },
    chipText: {
      fontSize: 12,
      color: theme.chipText,
      fontWeight: '500',
    },
    chipActive: {
      backgroundColor: theme.chipActiveBackground,
    },
    chipTextActive: {
      color: theme.chipActiveText,
    },
    saveButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.buttonBackground,
      paddingVertical: 12,
      borderRadius: 12,
      marginTop: 20,
    },
    saveButtonText: {
      color: theme.buttonText,
      fontSize: 15,
      fontWeight: '600',
      marginLeft: 8,
    },
    card: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 14,
      marginBottom: 12,
      backgroundColor: theme.cardBackground,
    },
    cardDisabled: {
      opacity: 0.6,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.textPrimary,
    },
    keywords: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 8,
    },
    keywordChip: {
      backgroundColor: theme.chipBackground,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginRight: 6,
      marginBottom: 6,
    },
    keywordText: {
      fontSize: 11,
      color: theme.chipText,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    metaBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: theme.chipBackground,
      marginRight: 8,
    },
    metaBadgeText: {
      fontSize: 11,
      color: theme.chipText,
      fontWeight: '600',
    },
    cardContent: {
      fontSize: 13,
      color: theme.textSecondary,
      lineHeight: 18,
      marginBottom: 8,
    },
    toggleButton: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.toggleActive,
    },
    toggleText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.toggleActive,
    },
    deleteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: theme.deleteBackground,
      marginTop: 4,
    },
    deleteButtonText: {
      fontSize: 12,
      color: theme.deleteText,
      marginLeft: 4,
      fontWeight: '600',
    },
  });

const CATEGORY_OPTIONS: WorldBookCategory[] = ['设定', '人物', '地点', '剧情', '道具', '其他'];
const SCOPE_OPTIONS: WorldBookScope[] = ['全局', '会话'];

export default function WorldBookTab() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = useMemo(() => getThemeTokens(isDark), [isDark]);
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [entries, setEntries] = useState<WorldBookEntry[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<FormState>({
    title: '',
    keywords: '',
    content: '',
    category: '设定',
    scope: '全局',
  });

  useEffect(() => {
    void loadEntries();
  }, []);

  const loadEntries = async () => {
    const stored = await loadWorldBookEntries();
    setEntries(stored);
  };

  const resetForm = () => {
    setFormData({ title: '', keywords: '', content: '', category: '设定', scope: '全局' });
  };

  const handleSaveEntry = async () => {
    if (!formData.title.trim()) {
      Alert.alert('提示', '请输入标题');
      return;
    }

    const keywords = formData.keywords
      .split(',')
      .map(keyword => keyword.trim())
      .filter(Boolean);

    try {
      await addWorldBookEntry({
        title: formData.title,
        keywords,
        content: formData.content,
        category: formData.category,
        scope: formData.scope,
      });
      const stored = await loadWorldBookEntries();
      setEntries(stored);
      setIsAdding(false);
      resetForm();
    } catch (error) {
      console.error('保存词条失败', error);
      Alert.alert('错误', '保存词条失败，请稍后再试');
    }
  };

  const handleDeleteEntry = (id: string) => {
    Alert.alert('删除词条', '确定要删除这个词条吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          const updated = await deleteWorldBookEntry(id);
          setEntries(updated);
        },
      },
    ]);
  };

  const handleToggleEntry = async (id: string) => {
    const updated = await toggleWorldBookEntry(id);
    if (updated) {
      setEntries(updated);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.description}>
          世界书用于存储角色、地点、事件等背景信息，当对话中出现关键词时会自动注入上下文。
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>条目列表 ({entries.length})</Text>
          <TouchableOpacity
            accessibilityRole='button'
            onPress={() => {
              setIsAdding(current => !current);
              if (isAdding) {
                resetForm();
              }
            }}
            style={styles.addButton}
          >
            <Ionicons name={isAdding ? 'close' : 'add-circle'} size={24} color={theme.accent} />
          </TouchableOpacity>
        </View>

        {isAdding && (
          <View style={styles.form}>
            <Text style={styles.label}>标题</Text>
            <TextInput
              placeholder='例如: 主角背景'
              placeholderTextColor={theme.placeholder}
              style={styles.input}
              value={formData.title}
              onChangeText={title => setFormData(prev => ({ ...prev, title }))}
            />

            <Text style={styles.label}>关键词 (用逗号分隔)</Text>
            <TextInput
              placeholder='例如: 主角, 张三, 背景'
              placeholderTextColor={theme.placeholder}
              style={styles.input}
              value={formData.keywords}
              onChangeText={keywords => setFormData(prev => ({ ...prev, keywords }))}
            />

            <Text style={styles.label}>词条分类</Text>
            <View style={styles.chipRow}>
              {CATEGORY_OPTIONS.map(category => {
                const isActive = formData.category === category;
                return (
                  <TouchableOpacity
                    key={category}
                    onPress={() => setFormData(prev => ({ ...prev, category }))}
                    style={[styles.chip, isActive && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{category}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>适用范围</Text>
            <View style={styles.chipRow}>
              {SCOPE_OPTIONS.map(scope => {
                const isActive = formData.scope === scope;
                return (
                  <TouchableOpacity
                    key={scope}
                    onPress={() => setFormData(prev => ({ ...prev, scope }))}
                    style={[styles.chip, isActive && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{scope}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>内容</Text>
            <TextInput
              multiline
              numberOfLines={6}
              placeholder='详细描述...'
              placeholderTextColor={theme.placeholder}
              style={[styles.input, styles.textArea]}
              value={formData.content}
              onChangeText={content => setFormData(prev => ({ ...prev, content }))}
            />

            <TouchableOpacity onPress={handleSaveEntry} style={styles.saveButton}>
              <Ionicons name='checkmark-circle' size={20} color={theme.accentContrast} />
              <Text style={styles.saveButtonText}>保存</Text>
            </TouchableOpacity>
          </View>
        )}

        {entries.length === 0 ? (
          <Text style={styles.emptyText}>暂无条目，点击右上角添加</Text>
        ) : (
          entries.map(entry => {
            const keywords = entry.keywords.slice(0, 6);
            return (
              <View key={entry.id} style={[styles.card, !entry.enabled && styles.cardDisabled]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{entry.title}</Text>
                  <TouchableOpacity
                    onPress={() => handleToggleEntry(entry.id)}
                    style={styles.toggleButton}
                  >
                    <Text style={styles.toggleText}>{entry.enabled ? '启用中' : '已停用'}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.metaRow}>
                  <View style={styles.metaBadge}>
                    <Text style={styles.metaBadgeText}>{entry.category}</Text>
                  </View>
                  <View style={styles.metaBadge}>
                    <Text style={styles.metaBadgeText}>{entry.scope}</Text>
                  </View>
                </View>
                <View style={styles.keywords}>
                  {keywords.map(keyword => (
                    <View key={keyword} style={styles.keywordChip}>
                      <Text style={styles.keywordText}>{keyword}</Text>
                    </View>
                  ))}
                </View>
                {entry.content ? (
                  <Text numberOfLines={3} style={styles.cardContent}>
                    {entry.content}
                  </Text>
                ) : null}
                <TouchableOpacity onPress={() => handleDeleteEntry(entry.id)} style={styles.deleteButton}>
                  <Ionicons name='trash-outline' size={18} color={theme.deleteText} />
                  <Text style={styles.deleteButtonText}>删除</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}
