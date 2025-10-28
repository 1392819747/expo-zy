import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  ApiProvider,
  ApiProviderStatus,
  ApiProviderVendor,
  createEmptyProvider,
  getStatusMeta,
  loadApiProviders,
  saveApiProvider,
} from '@/lib/api-provider-storage';

const PROVIDER_OPTIONS: { id: ApiProviderVendor; label: string }[] = [
  { id: 'openai', label: 'OpenAI' },
  { id: 'gemini', label: 'Gemini' },
];

export default function ApiConfigScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const providerId = useMemo(() => {
    if (!params.id) return undefined;
    return Array.isArray(params.id) ? params.id[0] : params.id;
  }, [params.id]);

  const [initialProvider, setInitialProvider] = useState<ApiProvider | null>(null);
  const [name, setName] = useState('');
  const [provider, setProvider] = useState<ApiProviderVendor>('openai');
  const [model, setModel] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [secureStore, setSecureStore] = useState(false);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<ApiProviderStatus>('unknown');
  const [lastConnectedAt, setLastConnectedAt] = useState<string | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProvider = async () => {
      if (!providerId) return;
      const { providers } = await loadApiProviders();
      const target = providers.find((item) => item.id === providerId);
      if (target) {
        setInitialProvider(target);
        setName(target.name);
        setProvider(target.provider);
        setModel(target.model);
        setBaseUrl(target.baseUrl);
        setApiKey(target.apiKey);
        setTemperature(target.temperature);
        setMaxTokens(target.maxTokens);
        setSecureStore(Boolean(target.secureStore));
        setNotes(target.notes ?? '');
        setStatus(target.status);
        setLastConnectedAt(target.lastConnectedAt);
      }
    };

    loadProvider();
  }, [providerId]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('提示', '请填写配置名称');
      return;
    }

    setSaving(true);
    try {
      const payload = createEmptyProvider({
        id: providerId,
        name: name.trim(),
        provider,
        model: model.trim(),
        baseUrl: baseUrl.trim(),
        apiKey: apiKey.trim(),
        temperature,
        maxTokens,
        secureStore,
        notes: notes.trim() || undefined,
        status,
        lastConnectedAt,
        createdAt: initialProvider?.createdAt,
      });

      await saveApiProvider(payload);
      Alert.alert('保存成功', '配置已保存');
      router.back();
    } catch (error) {
      console.error('保存失败', error);
      Alert.alert('保存失败', '无法保存配置，请稍后再试');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = () => {
    if (!apiKey.trim()) {
      Alert.alert('测试连接', '请先填写 API 密钥');
      return;
    }

    const now = new Date().toISOString();
    setStatus('connected');
    setLastConnectedAt(now);
    Alert.alert('测试连接', '模拟连接成功');
  };

  const handleExportJson = () => {
    Alert.alert('导出 JSON', '此功能将在后续版本中提供。');
  };

  const handleImportJson = () => {
    Alert.alert('导入 JSON', '此功能将在后续版本中提供。');
  };

  const statusMeta = getStatusMeta(status);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.select({ ios: 12, android: 0 })}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color="#e2e8f0" />
            </TouchableOpacity>
            <View>
              <Text style={styles.title}>API 设置</Text>
              <Text style={styles.subtitle}>为 OpenAI / Gemini 设置网关、模型与密钥</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Provider</Text>
            <View style={styles.segmentedControl}>
              {PROVIDER_OPTIONS.map((option) => {
                const selected = option.id === provider;
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[styles.segmentButton, selected && styles.segmentButtonActive]}
                    onPress={() => setProvider(option.id)}
                  >
                    <Text style={[styles.segmentText, selected && styles.segmentTextActive]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>模型昵称</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="如：OpenAI - Prod"
              placeholderTextColor="#475569"
            />

            <Text style={styles.label}>模型 (model)</Text>
            <TextInput
              style={styles.input}
              value={model}
              onChangeText={setModel}
              placeholder={provider === 'gemini' ? 'gemini-1.5-flash' : 'gpt-4.1-mini'}
              placeholderTextColor="#475569"
              autoCapitalize="none"
            />

            <View style={styles.sliderLabelRow}>
              <Text style={styles.label}>温度</Text>
              <Text style={styles.sliderValue}>{temperature.toFixed(1)}</Text>
            </View>
            <View style={styles.sliderRow}>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={2}
                step={0.1}
                value={temperature}
                minimumTrackTintColor="#3b82f6"
                maximumTrackTintColor="#1f2937"
                thumbTintColor="#38bdf8"
                onValueChange={setTemperature}
              />
            </View>

            <View style={styles.sliderLabelRow}>
              <Text style={styles.label}>最大 Token</Text>
              <Text style={styles.sliderValue}>{maxTokens}</Text>
            </View>
            <View style={styles.sliderRow}>
              <Slider
                style={styles.slider}
                minimumValue={256}
                maximumValue={32000}
                step={256}
                value={maxTokens}
                minimumTrackTintColor="#3b82f6"
                maximumTrackTintColor="#1f2937"
                thumbTintColor="#38bdf8"
                onValueChange={(value) => setMaxTokens(Math.round(value))}
              />
            </View>

            <Text style={styles.label}>网关 (可选)</Text>
            <TextInput
              style={styles.input}
              value={baseUrl}
              onChangeText={setBaseUrl}
              placeholder="https://api.example.com"
              placeholderTextColor="#475569"
              autoCapitalize="none"
            />

            <Text style={styles.label}>密钥 ({provider === 'gemini' ? 'Gemini' : 'OpenAI'})</Text>
            <TextInput
              style={[styles.input, styles.secretInput]}
              value={apiKey}
              onChangeText={setApiKey}
              placeholder={provider === 'gemini' ? 'AIza...或来自Google Cloud的密钥' : 'sk-xxxxx'}
              placeholderTextColor="#475569"
              autoCapitalize="none"
              secureTextEntry
            />

            <View style={styles.secureRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.secureTitle}>密钥保存到 SecureStore</Text>
                <Text style={styles.secureCaption}>离线保存在本地设备中</Text>
              </View>
              <Switch
                value={secureStore}
                onValueChange={setSecureStore}
                trackColor={{ false: '#1e293b', true: '#22c55e' }}
                thumbColor="#0f172a"
                ios_backgroundColor="#1e293b"
              />
            </View>

            <Text style={styles.label}>备注</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="可选：补充说明或使用场景"
              placeholderTextColor="#475569"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <View style={styles.statusRow}>
              <View style={[styles.statusBadge, { backgroundColor: `${statusMeta.color}1a` }]}>
                <View style={[styles.statusDot, { backgroundColor: statusMeta.color }]} />
                <Text style={[styles.statusText, { color: statusMeta.color }]}>{statusMeta.label}</Text>
              </View>
              <Text style={styles.statusDescription}>
                {lastConnectedAt
                  ? `上次测试 ${formatFullDate(lastConnectedAt)}`
                  : '尚未进行连接测试'}
              </Text>
            </View>

            <View style={styles.primaryActions}>
              <TouchableOpacity
                style={[styles.primaryButton, saving && styles.primaryButtonDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                <Ionicons name="save" size={18} color="#0f172a" />
                <Text style={styles.primaryButtonText}>{saving ? '保存中…' : '保存'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={handleTestConnection}>
                <Ionicons name="link" size={18} color="#38bdf8" />
                <Text style={styles.secondaryButtonText}>测试连接</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.utilityRow}>
              <TouchableOpacity style={styles.utilityButton} onPress={handleExportJson}>
                <Ionicons name="download" size={16} color="#94a3b8" />
                <Text style={styles.utilityText}>导出 JSON</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.utilityButton} onPress={handleImportJson}>
                <Ionicons name="cloud-upload" size={16} color="#94a3b8" />
                <Text style={styles.utilityText}>导入 JSON</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function formatFullDate(input: string | number) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return '未知时间';
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes(),
  ).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#06070b',
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: '#0b1120',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 6,
  },
  card: {
    backgroundColor: '#0b1120',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1f2937',
    gap: 16,
  },
  label: {
    color: '#cbd5f5',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#07090f',
    borderRadius: 18,
    padding: 6,
  },
  segmentButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  segmentButtonActive: {
    backgroundColor: '#1d4ed8',
  },
  segmentText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: '#e2e8f0',
  },
  input: {
    backgroundColor: '#07090f',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    color: '#e2e8f0',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#111827',
  },
  secretInput: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
  },
  sliderLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderValue: {
    color: '#e2e8f0',
    fontWeight: '700',
  },
  sliderRow: {
    paddingHorizontal: 4,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  secureTitle: {
    color: '#cbd5f5',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  secureCaption: {
    color: '#475569',
    fontSize: 12,
  },
  notesInput: {
    height: 96,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusDescription: {
    color: '#64748b',
    fontSize: 12,
  },
  primaryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingVertical: 14,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e40af',
    height: 52,
    justifyContent: 'center',
    backgroundColor: '#081226',
  },
  secondaryButtonText: {
    color: '#38bdf8',
    fontSize: 15,
    fontWeight: '600',
  },
  utilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  utilityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  utilityText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
});
