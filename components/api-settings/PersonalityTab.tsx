import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
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

type PersonalitySettings = {
  name: string;
  personality: string;
  speakingStyle: string;
  emotionalTone: number;
  creativity: number;
  formality: number;
  customPrompt: string;
};

const PERSONALITY_STORAGE_KEY = 'zhiyin.personality.settings';

const PERSONALITY_PRESETS = [
  { id: 'friendly', label: '友好', icon: 'happy', desc: '温暖、友善、乐于助人' },
  { id: 'professional', label: '专业', icon: 'briefcase', desc: '正式、严谨、专注' },
  { id: 'casual', label: '随意', icon: 'cafe', desc: '轻松、幽默、不拘小节' },
  { id: 'creative', label: '创意', icon: 'color-palette', desc: '富有想象力、独特' },
  { id: 'analytical', label: '分析', icon: 'analytics', desc: '理性、逻辑、深入' }
];

export default function PersonalityTab() {
  const [settings, setSettings] = useState<PersonalitySettings>({
    name: 'AI 助手',
    personality: 'friendly',
    speakingStyle: '',
    emotionalTone: 70,
    creativity: 50,
    formality: 30,
    customPrompt: ''
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(PERSONALITY_STORAGE_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error('加载失败', error);
    }
  };

  const saveSettings = async (newSettings: PersonalitySettings) => {
    setSettings(newSettings);
    try {
      await AsyncStorage.setItem(PERSONALITY_STORAGE_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('保存失败', error);
    }
  };

  const renderValueSelector = (
    label: string,
    value: number,
    onChange: (value: number) => void,
    leftLabel: string,
    rightLabel: string
  ) => (
    <View style={styles.valueGroup}>
      <View style={styles.valueHeader}>
        <Text style={styles.valueLabel}>{label}</Text>
        <Text style={styles.valueText}>{value}%</Text>
      </View>
      <View style={styles.valueButtons}>
        {[0, 25, 50, 75, 100].map(v => (
          <TouchableOpacity
            key={v}
            style={[styles.valueButton, value === v && styles.valueButtonActive]}
            onPress={() => onChange(v)}
          >
            <Text style={[styles.valueButtonText, value === v && styles.valueButtonTextActive]}>
              {v}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.valueLabels}>
        <Text style={styles.valueLabelText}>{leftLabel}</Text>
        <Text style={styles.valueLabelText}>{rightLabel}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.description}>
          定制 AI 的个性、说话风格和情感表达，让对话更符合你的期望。
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>基础信息</Text>

        <Text style={styles.label}>名称</Text>
        <TextInput
          style={styles.input}
          placeholder="给 AI 起个名字"
          value={settings.name}
          onChangeText={name => saveSettings({ ...settings, name })}
        />

        <Text style={styles.label}>说话风格</Text>
        <TextInput
          style={styles.input}
          placeholder="例如: 简洁明了、详细解释、幽默风趣"
          value={settings.speakingStyle}
          onChangeText={speakingStyle => saveSettings({ ...settings, speakingStyle })}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>个性预设</Text>
        <View style={styles.presetGrid}>
          {PERSONALITY_PRESETS.map(preset => (
            <TouchableOpacity
              key={preset.id}
              style={[
                styles.presetCard,
                settings.personality === preset.id && styles.presetCardActive
              ]}
              onPress={() => saveSettings({ ...settings, personality: preset.id })}
            >
              <Ionicons
                name={preset.icon as any}
                size={32}
                color={settings.personality === preset.id ? '#4B9BFF' : '#64748b'}
              />
              <Text style={[
                styles.presetLabel,
                settings.personality === preset.id && styles.presetLabelActive
              ]}>
                {preset.label}
              </Text>
              <Text style={styles.presetDesc}>{preset.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>情感与风格</Text>

        {renderValueSelector(
          '情感丰富度',
          settings.emotionalTone,
          (emotionalTone) => saveSettings({ ...settings, emotionalTone }),
          '冷静',
          '热情'
        )}

        {renderValueSelector(
          '创造力',
          settings.creativity,
          (creativity) => saveSettings({ ...settings, creativity }),
          '保守',
          '创新'
        )}

        {renderValueSelector(
          '正式程度',
          settings.formality,
          (formality) => saveSettings({ ...settings, formality }),
          '随意',
          '正式'
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>自定义提示词</Text>
        <Text style={styles.description}>
          高级选项：直接编写系统提示词来精确控制 AI 行为
        </Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="例如: You are a helpful assistant..."
          value={settings.customPrompt}
          onChangeText={customPrompt => saveSettings({ ...settings, customPrompt })}
          multiline
          numberOfLines={8}
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
    minHeight: 150,
    textAlignVertical: 'top'
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6
  },
  presetCard: {
    width: '48%',
    margin: '1%',
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center'
  },
  presetCardActive: {
    borderColor: '#4B9BFF',
    backgroundColor: '#f2f7ff'
  },
  presetLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginTop: 8
  },
  presetLabelActive: {
    color: '#4B9BFF'
  },
  presetDesc: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4
  },
  valueGroup: {
    marginBottom: 20
  },
  valueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  valueLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a'
  },
  valueText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B9BFF'
  },
  valueButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  valueButton: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 2,
    borderRadius: 6,
    backgroundColor: '#eff1f5',
    alignItems: 'center'
  },
  valueButtonActive: {
    backgroundColor: '#4B9BFF'
  },
  valueButtonText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500'
  },
  valueButtonTextActive: {
    color: '#fff',
    fontWeight: '600'
  },
  valueLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  valueLabelText: {
    fontSize: 11,
    color: '#94a3b8'
  }
});
