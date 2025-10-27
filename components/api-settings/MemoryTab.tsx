import { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

type AsyncStorageType = typeof import('@react-native-async-storage/async-storage').default;
const AsyncStorage =
  require('@react-native-async-storage/async-storage').default as AsyncStorageType;

type MemorySettings = {
  enabled: boolean;
  maxTokens: number;
  summaryEnabled: boolean;
  longTermMemory: string;
  shortTermMemory: string;
};

const MEMORY_STORAGE_KEY = 'zhiyin.memory.settings';

export default function MemoryTab() {
  const [settings, setSettings] = useState<MemorySettings>({
    enabled: true,
    maxTokens: 2000,
    summaryEnabled: true,
    longTermMemory: '',
    shortTermMemory: ''
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(MEMORY_STORAGE_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error('加载失败', error);
    }
  };

  const saveSettings = async (newSettings: MemorySettings) => {
    setSettings(newSettings);
    try {
      await AsyncStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('保存失败', error);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.description}>
          记忆系统帮助 AI 记住对话历史和重要信息，提供更连贯的对话体验。
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>基础设置</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>启用记忆系统</Text>
            <Text style={styles.settingDesc}>保存对话历史和上下文</Text>
          </View>
          <Switch
            value={settings.enabled}
            onValueChange={enabled => saveSettings({ ...settings, enabled })}
            trackColor={{ false: '#e2e8f0', true: '#4B9BFF' }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>自动总结</Text>
            <Text style={styles.settingDesc}>定期总结对话内容</Text>
          </View>
          <Switch
            value={settings.summaryEnabled}
            onValueChange={summaryEnabled => saveSettings({ ...settings, summaryEnabled })}
            trackColor={{ false: '#e2e8f0', true: '#4B9BFF' }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>最大记忆 Token 数</Text>
          <Text style={styles.settingDesc}>控制记忆占用的上下文长度</Text>
          <View style={styles.tokenSelector}>
            {[1000, 2000, 4000, 8000].map(value => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.tokenChip,
                  settings.maxTokens === value && styles.tokenChipActive
                ]}
                onPress={() => saveSettings({ ...settings, maxTokens: value })}
              >
                <Text
                  style={[
                    styles.tokenChipText,
                    settings.maxTokens === value && styles.tokenChipTextActive
                  ]}
                >
                  {value}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>长期记忆</Text>
        <Text style={styles.description}>
          始终保留的核心信息，不会被遗忘
        </Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="例如: 用户是一名软件工程师，喜欢编程和阅读..."
          value={settings.longTermMemory}
          onChangeText={longTermMemory => saveSettings({ ...settings, longTermMemory })}
          multiline
          numberOfLines={6}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>短期记忆</Text>
        <Text style={styles.description}>
          最近的对话摘要，会随着对话更新
        </Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="系统会自动更新..."
          value={settings.shortTermMemory}
          onChangeText={shortTermMemory => saveSettings({ ...settings, shortTermMemory })}
          multiline
          numberOfLines={6}
        />
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12
  },
  description: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 12
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  settingItem: {
    paddingVertical: 12
  },
  settingInfo: {
    flex: 1,
    marginRight: 12
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0f172a',
    marginBottom: 4
  },
  settingDesc: {
    fontSize: 12,
    color: '#64748b'
  },
  tokenSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8
  },
  tokenChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#eff1f5',
    marginRight: 8,
    marginBottom: 8
  },
  tokenChipActive: {
    backgroundColor: '#4B9BFF'
  },
  tokenChipText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500'
  },
  tokenChipTextActive: {
    color: '#fff',
    fontWeight: '600'
  },
  input: {
    borderWidth: 1,
    borderColor: '#dbe2f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#fff',
    marginTop: 8
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top'
  }
});
