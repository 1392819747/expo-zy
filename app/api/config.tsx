import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';
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

type ThemeColors = {
  background: string;
  card: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  inputBackground: string;
  placeholder: string;
  headerButton: string;
  icon: string;
  iconMuted: string;
  segmentBackground: string;
  segmentActiveBackground: string;
  segmentText: string;
  segmentTextActive: string;
  primaryButtonBackground: string;
  primaryButtonText: string;
  secondaryButtonBackground: string;
  secondaryButtonBorder: string;
  secondaryButtonText: string;
  utilityBackground: string;
  utilityBorder: string;
  utilityText: string;
  sliderTrack: string;
  sliderThumb: string;
  modelOptionBackground: string;
  modelOptionSelectedBackground: string;
  modelOptionText: string;
  modelOptionSelectedText: string;
  errorText: string;
};

const getThemeColors = (isDark: boolean): ThemeColors =>
  isDark
    ? {
        background: '#06070b',
        card: '#0b1120',
        border: '#1f2937',
        textPrimary: '#f8fafc',
        textSecondary: '#cbd5f5',
        textMuted: '#64748b',
        accent: '#3b82f6',
        inputBackground: '#07090f',
        placeholder: '#475569',
        headerButton: '#0b1120',
        icon: '#e2e8f0',
        iconMuted: '#94a3b8',
        segmentBackground: '#07090f',
        segmentActiveBackground: '#1d4ed8',
        segmentText: '#64748b',
        segmentTextActive: '#e2e8f0',
        primaryButtonBackground: '#f8fafc',
        primaryButtonText: '#0f172a',
        secondaryButtonBackground: '#081226',
        secondaryButtonBorder: '#1e40af',
        secondaryButtonText: '#38bdf8',
        utilityBackground: '#0f172a',
        utilityBorder: '#1f2937',
        utilityText: '#94a3b8',
        sliderTrack: '#1f2937',
        sliderThumb: '#38bdf8',
        modelOptionBackground: '#0f172a',
        modelOptionSelectedBackground: '#1e40af',
        modelOptionText: '#cbd5f5',
        modelOptionSelectedText: '#f8fafc',
        errorText: '#f87171',
      }
    : {
        background: '#f8fafc',
        card: '#ffffff',
        border: '#e2e8f0',
        textPrimary: '#0f172a',
        textSecondary: '#1e293b',
        textMuted: '#64748b',
        accent: '#2563eb',
        inputBackground: '#f1f5f9',
        placeholder: '#94a3b8',
        headerButton: '#e2e8f0',
        icon: '#0f172a',
        iconMuted: '#64748b',
        segmentBackground: '#e2e8f0',
        segmentActiveBackground: '#2563eb',
        segmentText: '#1f2937',
        segmentTextActive: '#ffffff',
        primaryButtonBackground: '#2563eb',
        primaryButtonText: '#ffffff',
        secondaryButtonBackground: '#e0f2fe',
        secondaryButtonBorder: '#bfdbfe',
        secondaryButtonText: '#1d4ed8',
        utilityBackground: '#f8fafc',
        utilityBorder: '#e2e8f0',
        utilityText: '#475569',
        sliderTrack: '#cbd5f5',
        sliderThumb: '#2563eb',
        modelOptionBackground: '#f1f5f9',
        modelOptionSelectedBackground: '#dbeafe',
        modelOptionText: '#1f2937',
        modelOptionSelectedText: '#1d4ed8',
        errorText: '#dc2626',
      };

const createStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
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
      backgroundColor: theme.headerButton,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      color: theme.textPrimary,
      fontSize: 24,
      fontWeight: '800',
    },
    subtitle: {
      color: theme.textMuted,
      fontSize: 14,
      marginTop: 6,
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: 24,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.border,
      gap: 16,
    },
    label: {
      color: theme.textSecondary,
      fontSize: 13,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    segmentedControl: {
      flexDirection: 'row',
      backgroundColor: theme.segmentBackground,
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
      backgroundColor: theme.segmentActiveBackground,
    },
    segmentText: {
      color: theme.segmentText,
      fontSize: 14,
      fontWeight: '600',
    },
    segmentTextActive: {
      color: theme.segmentTextActive,
    },
    input: {
      backgroundColor: theme.inputBackground,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: Platform.OS === 'ios' ? 14 : 12,
      color: theme.textPrimary,
      fontSize: 15,
      borderWidth: 1,
      borderColor: theme.border,
    },
    secretInput: {
      fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    },
    fetchModelsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    fetchButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.secondaryButtonBackground,
      borderWidth: 1,
      borderColor: theme.secondaryButtonBorder,
    },
    fetchButtonText: {
      color: theme.secondaryButtonText,
      fontSize: 14,
      fontWeight: '600',
    },
    fetchError: {
      flex: 1,
      color: theme.errorText,
      fontSize: 13,
    },
    modelPicker: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.inputBackground,
      padding: 6,
      gap: 6,
    },
    modelOption: {
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 12,
      backgroundColor: theme.modelOptionBackground,
    },
    modelOptionSelected: {
      backgroundColor: theme.modelOptionSelectedBackground,
    },
    modelOptionText: {
      color: theme.modelOptionText,
      fontSize: 14,
      fontWeight: '600',
    },
    modelOptionTextSelected: {
      color: theme.modelOptionSelectedText,
    },
    sliderLabelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    sliderValue: {
      color: theme.textPrimary,
      fontWeight: '700',
    },
    sliderRow: {
      paddingHorizontal: 4,
    },
    slider: {
      width: '100%',
      height: 40,
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
      color: theme.textMuted,
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
      backgroundColor: theme.primaryButtonBackground,
      borderRadius: 16,
      paddingVertical: 14,
    },
    primaryButtonDisabled: {
      opacity: 0.7,
    },
    primaryButtonText: {
      color: theme.primaryButtonText,
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
      borderColor: theme.secondaryButtonBorder,
      height: 52,
      justifyContent: 'center',
      backgroundColor: theme.secondaryButtonBackground,
    },
    secondaryButtonText: {
      color: theme.secondaryButtonText,
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
      backgroundColor: theme.utilityBackground,
      borderWidth: 1,
      borderColor: theme.utilityBorder,
    },
    utilityText: {
      color: theme.utilityText,
      fontSize: 13,
      fontWeight: '600',
    },
  });

export default function ApiConfigScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const providerId = useMemo(() => {
    if (!params.id) return undefined;
    return Array.isArray(params.id) ? params.id[0] : params.id;
  }, [params.id]);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = useMemo(() => getThemeColors(isDark), [isDark]);
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [initialProvider, setInitialProvider] = useState<ApiProvider | null>(null);
  const [name, setName] = useState('');
  const [provider, setProvider] = useState<ApiProviderVendor>('openai');
  const [model, setModel] = useState('');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);
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
        setNotes(target.notes ?? '');
        setStatus(target.status);
        setLastConnectedAt(target.lastConnectedAt);
      }
    };

    loadProvider();
  }, [providerId]);

  useEffect(() => {
    setAvailableModels([]);
    setModelsError(null);
  }, [provider, baseUrl]);

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

  const handleFetchModels = useCallback(async () => {
    if (!apiKey.trim()) {
      Alert.alert('获取模型', '请先填写 API 密钥');
      return;
    }

    setModelsError(null);
    setModelsLoading(true);

    try {
      const trimmedBaseUrl = baseUrl.trim();
      const trimmedKey = apiKey.trim();

      let url: string;
      let init: RequestInit = {};

      if (provider === 'openai') {
        const base = (trimmedBaseUrl || 'https://api.openai.com/v1').replace(/\/$/, '');
        url = `${base}/models`;
        init = {
          headers: {
            Authorization: `Bearer ${trimmedKey}`,
          },
        };
      } else {
        const base = (trimmedBaseUrl || 'https://generativelanguage.googleapis.com/v1beta').replace(/\/$/, '');
        url = `${base}/models?key=${encodeURIComponent(trimmedKey)}`;
      }

      const response = await fetch(url, init);
      if (!response.ok) {
        throw new Error(`Failed to load models: ${response.status}`);
      }

      const data = await response.json();
      const modelsList =
        provider === 'openai'
          ? Array.isArray(data?.data)
            ? data.data
                .map((item: { id?: string }) => item?.id)
                .filter((value: unknown): value is string => typeof value === 'string' && value.length > 0)
          : []
          : Array.isArray(data?.models)
          ? data.models
              .map((item: { name?: string; id?: string }) => item?.name ?? item?.id)
              .filter((value: unknown): value is string => typeof value === 'string' && value.length > 0)
          : [];

      const uniqueModels = Array.from(new Set(modelsList));

      if (uniqueModels.length === 0) {
        setModelsError('未获取到可用模型');
        setAvailableModels([]);
        return;
      }

      setAvailableModels(uniqueModels);
      if (!uniqueModels.includes(model) && uniqueModels[0]) {
        setModel(uniqueModels[0]);
      }
    } catch (error) {
      console.error('获取模型失败', error);
      setModelsError('获取模型失败，请稍后再试');
    } finally {
      setModelsLoading(false);
    }
  }, [apiKey, baseUrl, model, provider]);

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
              <Ionicons name="chevron-back" size={22} color={theme.icon} />
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
              placeholderTextColor={theme.placeholder}
            />

            <View style={styles.fetchModelsRow}>
              <TouchableOpacity style={styles.fetchButton} onPress={handleFetchModels} disabled={modelsLoading}>
                {modelsLoading ? (
                  <ActivityIndicator size="small" color={theme.secondaryButtonText} />
                ) : (
                  <Ionicons name="cloud-download" size={18} color={theme.secondaryButtonText} />
                )}
                <Text style={styles.fetchButtonText}>{modelsLoading ? '获取中…' : '获取模型'}</Text>
              </TouchableOpacity>
              {modelsError ? <Text style={styles.fetchError}>{modelsError}</Text> : null}
            </View>

            <Text style={styles.label}>模型 (model)</Text>
            {availableModels.length > 0 ? (
              <View style={styles.modelPicker}>
                {availableModels.map((item) => {
                  const selected = item === model;
                  return (
                    <TouchableOpacity
                      key={item}
                      style={[styles.modelOption, selected && styles.modelOptionSelected]}
                      onPress={() => setModel(item)}
                    >
                      <Text
                        style={[styles.modelOptionText, selected && styles.modelOptionTextSelected]}
                        numberOfLines={1}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <TextInput
                style={styles.input}
                value={model}
                onChangeText={setModel}
                placeholder={provider === 'gemini' ? 'models/gemini-1.5-flash' : 'gpt-4.1-mini'}
                placeholderTextColor={theme.placeholder}
                autoCapitalize="none"
              />
            )}

            <Text style={styles.label}>网关 (可选)</Text>
            <TextInput
              style={styles.input}
              value={baseUrl}
              onChangeText={setBaseUrl}
              placeholder="https://api.example.com"
              placeholderTextColor={theme.placeholder}
              autoCapitalize="none"
            />

            <Text style={styles.label}>密钥 ({provider === 'gemini' ? 'Gemini' : 'OpenAI'})</Text>
            <TextInput
              style={[styles.input, styles.secretInput]}
              value={apiKey}
              onChangeText={setApiKey}
              placeholder={
                provider === 'gemini'
                  ? 'AIza...或来自Google Cloud的密钥'
                  : 'sk-xxxxx'
              }
              placeholderTextColor={theme.placeholder}
              autoCapitalize="none"
              secureTextEntry
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
                minimumTrackTintColor={theme.accent}
                maximumTrackTintColor={theme.sliderTrack}
                thumbTintColor={theme.sliderThumb}
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
                minimumTrackTintColor={theme.accent}
                maximumTrackTintColor={theme.sliderTrack}
                thumbTintColor={theme.sliderThumb}
                onValueChange={(value) => setMaxTokens(Math.round(value))}
              />
            </View>

            <Text style={styles.label}>备注</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="可选：补充说明或使用场景"
              placeholderTextColor={theme.placeholder}
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
                <Ionicons
                  name="save"
                  size={18}
                  color={theme.primaryButtonText}
                />
                <Text style={styles.primaryButtonText}>{saving ? '保存中…' : '保存'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={handleTestConnection}>
                <Ionicons name="link" size={18} color={theme.secondaryButtonText} />
                <Text style={styles.secondaryButtonText}>测试连接</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.utilityRow}>
              <TouchableOpacity style={styles.utilityButton} onPress={handleExportJson}>
                <Ionicons name="download" size={16} color={theme.iconMuted} />
                <Text style={styles.utilityText}>导出 JSON</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.utilityButton} onPress={handleImportJson}>
                <Ionicons name="cloud-upload" size={16} color={theme.iconMuted} />
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
