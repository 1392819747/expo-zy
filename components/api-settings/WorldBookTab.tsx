import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

type AsyncStorageType = typeof import('@react-native-async-storage/async-storage').default;
const AsyncStorage =
  require('@react-native-async-storage/async-storage').default as AsyncStorageType;

type WorldBookEntry = {
  id: string;
  title: string;
  keywords: string[];
  content: string;
  enabled: boolean;
  createdAt: number;
};

const WORLDBOOK_STORAGE_KEY = 'zhiyin.worldbook.entries';

export default function WorldBookTab() {
  const [entries, setEntries] = useState<WorldBookEntry[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    keywords: '',
    content: ''
  });

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const stored = await AsyncStorage.getItem(WORLDBOOK_STORAGE_KEY);
      if (stored) {
        setEntries(JSON.parse(stored));
      }
    } catch (error) {
      console.error('加载失败', error);
    }
  };

  const saveEntry = async () => {
    if (!formData.title.trim()) {
      Alert.alert('提示', '请输入标题');
      return;
    }

    const newEntry: WorldBookEntry = {
      id: Date.now().toString(),
      title: formData.title,
      keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k),
      content: formData.content,
      enabled: true,
      createdAt: Date.now()
    };

    const newEntries = [...entries, newEntry];
    setEntries(newEntries);
    await AsyncStorage.setItem(WORLDBOOK_STORAGE_KEY, JSON.stringify(newEntries));

    setIsAdding(false);
    setFormData({ title: '', keywords: '', content: '' });
  };

  const deleteEntry = async (id: string) => {
    Alert.alert('删除', '确定要删除这个条目吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          const newEntries = entries.filter(e => e.id !== id);
          setEntries(newEntries);
          await AsyncStorage.setItem(WORLDBOOK_STORAGE_KEY, JSON.stringify(newEntries));
        }
      }
    ]);
  };

  const toggleEntry = async (id: string) => {
    const newEntries = entries.map(e =>
      e.id === id ? { ...e, enabled: !e.enabled } : e
    );
    setEntries(newEntries);
    await AsyncStorage.setItem(WORLDBOOK_STORAGE_KEY, JSON.stringify(newEntries));
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
            style={styles.addButton}
            onPress={() => setIsAdding(!isAdding)}
          >
            <Ionicons name={isAdding ? "close" : "add-circle"} size={24} color="#4B9BFF" />
          </TouchableOpacity>
        </View>

        {isAdding && (
          <View style={styles.form}>
            <Text style={styles.label}>标题</Text>
            <TextInput
              style={styles.input}
              placeholder="例如: 主角背景"
              value={formData.title}
              onChangeText={title => setFormData({ ...formData, title })}
            />

            <Text style={styles.label}>关键词 (用逗号分隔)</Text>
            <TextInput
              style={styles.input}
              placeholder="例如: 主角, 张三, 背景"
              value={formData.keywords}
              onChangeText={keywords => setFormData({ ...formData, keywords })}
            />

            <Text style={styles.label}>内容</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="详细描述..."
              value={formData.content}
              onChangeText={content => setFormData({ ...formData, content })}
              multiline
              numberOfLines={6}
            />

            <TouchableOpacity style={styles.saveButton} onPress={saveEntry}>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>保存</Text>
            </TouchableOpacity>
          </View>
        )}

        {entries.length === 0 ? (
          <Text style={styles.emptyText}>暂无条目，点击右上角添加</Text>
        ) : (
          entries.map(entry => (
            <View key={entry.id} style={[styles.card, !entry.enabled && styles.cardDisabled]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{entry.title}</Text>
                <TouchableOpacity onPress={() => toggleEntry(entry.id)}>
                  <Ionicons
                    name={entry.enabled ? "toggle" : "toggle-outline"}
                    size={32}
                    color={entry.enabled ? "#4B9BFF" : "#94a3b8"}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.keywords}>
                {entry.keywords.map((keyword, index) => (
                  <View key={index} style={styles.keywordChip}>
                    <Text style={styles.keywordText}>{keyword}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.cardContent} numberOfLines={3}>
                {entry.content}
              </Text>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteEntry(entry.id)}
              >
                <Ionicons name="trash-outline" size={18} color="#fa5252" />
                <Text style={styles.deleteButtonText}>删除</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc'
  },
  section: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  description: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 20
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937'
  },
  addButton: {
    padding: 4
  },
  emptyText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    paddingVertical: 20
  },
  form: {
    marginBottom: 16
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#475569',
    marginBottom: 6,
    marginTop: 12
  },
  input: {
    borderWidth: 1,
    borderColor: '#dbe2f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#fff'
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top'
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4B9BFF',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8
  },
  card: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    marginBottom: 12
  },
  cardDisabled: {
    opacity: 0.5
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a'
  },
  keywords: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8
  },
  keywordChip: {
    backgroundColor: '#e0f2ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6
  },
  keywordText: {
    fontSize: 11,
    color: '#1760a5'
  },
  cardContent: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 8
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#fee2e2'
  },
  deleteButtonText: {
    fontSize: 12,
    color: '#fa5252',
    marginLeft: 4,
    fontWeight: '500'
  }
});
