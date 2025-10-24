import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
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

type ApiProvider = {
  apiKey: string;
  baseUrl: string;
  description?: string;
  id: string;
  name: string;
  protocol: string;
  createdAt: number;
};

const PROVIDER_STORAGE_KEY = 'zhiyin.api-settings.providers';
const ACTIVE_PROVIDER_KEY = 'zhiyin.api-settings.active-provider';

const PROTOCOL_OPTIONS = [
  {
    id: 'openai',
    label: 'OpenAI 兼容',
    description: '支持 OpenAI 官方及兼容的 GPT、O系列接口。',
    defaultUrl: 'https://api.openai.com/v1'
  },
  {
    id: 'gemini',
    label: 'Gemini/Google AI',
    description: '适配 Google AI Studio 或企业 Gemini 接口。',
    defaultUrl: 'https://generativelanguage.googleapis.com'
  },
  {
    id: 'ollama',
    label: 'Ollama / 本地推理',
    description: '用于本地模型或自建代理，如 SillyTavern 自托管。',
    defaultUrl: 'http://localhost:11434'
  },
  {
    id: 'custom',
    label: '自定义协议',
    description: '完全自定义参数，自行在聊天逻辑中解析。',
    defaultUrl: ''
  }
];

const createDefaultProviders = (): ApiProvider[] => [
  {
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1',
    createdAt: Date.now(),
    description: '示例：填写你自己的 OpenAI Key 后即可使用。',
    id: 'default-openai',
    name: 'OpenAI 官方',
    protocol: 'openai'
  },
  {
    apiKey: '',
    baseUrl: 'https://generativelanguage.googleapis.com',
    createdAt: Date.now(),
    description: '示例：可接入 Gemini Pro / Flash 等模型。',
    id: 'default-gemini',
    name: 'Gemini',
    protocol: 'gemini'
  }
];

const maskApiKey = (key: string) => {
  if (!key) return '未填写';
  if (key.length <= 6) return `${key.slice(0, 3)}***`;
  return `${key.slice(0, 3)}***${key.slice(-3)}`;
};

const createEmptyForm = () => ({
  apiKey: '',
  baseUrl: '',
  description: '',
  id: '',
  name: '',
  protocol: PROTOCOL_OPTIONS[0].id
});

export default function ApiSettingsScreen() {
  const router = useRouter();
  const [providers, setProviders] = useState<ApiProvider[]>([]);
  const [activeProviderId, setActiveProviderId] = useState<string | null>(null);
  const [formState, setFormState] = useState(() => createEmptyForm());
  const [isEditing, setIsEditing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const protocolMap = useMemo(() => {
    return PROTOCOL_OPTIONS.reduce<Record<string, (typeof PROTOCOL_OPTIONS)[number]>>((acc, option) => {
      acc[option.id] = option;
      return acc;
    }, {});
  }, []);

  const activeProvider = useMemo(
    () => providers.find(item => item.id === activeProviderId) ?? null,
    [activeProviderId, providers]
  );

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [storedProviders, storedActive] = await Promise.all([
          AsyncStorage.getItem(PROVIDER_STORAGE_KEY),
          AsyncStorage.getItem(ACTIVE_PROVIDER_KEY)
        ]);

        if (storedProviders) {
          const parsed: ApiProvider[] = JSON.parse(storedProviders);
          setProviders(parsed);
        } else {
          const defaults = createDefaultProviders();
          setProviders(defaults);
          await AsyncStorage.setItem(PROVIDER_STORAGE_KEY, JSON.stringify(defaults));
        }

        if (storedActive) {
          setActiveProviderId(storedActive);
        }
      } catch (error) {
        console.warn('加载 API 设置失败', error);
        setProviders(createDefaultProviders());
      }
    };

    void bootstrap();
  }, []);

  const persistProviders = useCallback(async (nextProviders: ApiProvider[]) => {
    setProviders(nextProviders);
    try {
      await AsyncStorage.setItem(PROVIDER_STORAGE_KEY, JSON.stringify(nextProviders));
      return true;
    } catch (error) {
      console.warn('保存 API 设置失败', error);
      return false;
    }
  }, []);

  const handleSetActive = useCallback(
    async (providerId: string) => {
      setActiveProviderId(providerId);
      try {
        await AsyncStorage.setItem(ACTIVE_PROVIDER_KEY, providerId);
        setStatusMessage('已切换默认接口。');
      } catch (error) {
        console.warn('切换默认接口失败', error);
        setStatusMessage('切换失败，请稍后再试。');
      }
    },
    []
  );

  const resetForm = useCallback(() => {
    setFormState(createEmptyForm());
    setIsEditing(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!formState.name.trim()) {
      Alert.alert('请填写名称', '给接口起一个好记的名字。');
      return;
    }

    const protocolOption = protocolMap[formState.protocol];
    const normalizedBaseUrl = formState.baseUrl.trim() || protocolOption?.defaultUrl || '';

    if (!normalizedBaseUrl) {
      Alert.alert('请填写 Base URL', '自定义协议需要提供完整的接口地址。');
      return;
    }

    const existingProvider = formState.id ? providers.find(item => item.id === formState.id) : undefined;
    const createdAt = isEditing && formState.id ? existingProvider?.createdAt ?? Date.now() : Date.now();

    const payload: ApiProvider = {
      apiKey: formState.apiKey.trim(),
      baseUrl: normalizedBaseUrl,
      createdAt,
      description: formState.description?.trim(),
      id: formState.id || `${Date.now()}`,
      name: formState.name.trim(),
      protocol: formState.protocol
    };

    let success = false;

    if (isEditing) {
      const next = providers.map(item => (item.id === payload.id ? payload : item));
      success = await persistProviders(next);
      setStatusMessage(success ? '接口已更新。' : '保存失败，请稍后再试。');
    } else {
      const next = [...providers, payload];
      success = await persistProviders(next);
      setStatusMessage(success ? '已添加新的接口。' : '保存失败，请稍后再试。');
    }

    if (!success) {
      return;
    }

    if (!activeProviderId) {
      void handleSetActive(payload.id);
    }

    resetForm();
  }, [activeProviderId, formState, handleSetActive, isEditing, persistProviders, providers, protocolMap, resetForm]);

  const handleDelete = useCallback(
    (provider: ApiProvider) => {
      Alert.alert('删除接口', `确定要删除“${provider.name}”吗？`, [
        { text: '取消', style: 'cancel' },
        {
          style: 'destructive',
          text: '删除',
          onPress: () => {
            const next = providers.filter(item => item.id !== provider.id);
            void persistProviders(next).then(success => {
              setStatusMessage(success ? '接口已删除。' : '删除失败，请稍后再试。');
            });
            if (activeProviderId === provider.id) {
              const fallback = next[0]?.id ?? null;
              setActiveProviderId(fallback);
              if (fallback) {
                void AsyncStorage.setItem(ACTIVE_PROVIDER_KEY, fallback);
              } else {
                void AsyncStorage.removeItem(ACTIVE_PROVIDER_KEY);
              }
            }
          }
        }
      ]);
    },
    [activeProviderId, persistProviders, providers]
  );

  const handleEdit = useCallback((provider: ApiProvider) => {
    setFormState({
      apiKey: provider.apiKey,
      baseUrl: provider.baseUrl,
      description: provider.description ?? '',
      id: provider.id,
      name: provider.name,
      protocol: provider.protocol
    });
    setIsEditing(true);
  }, []);

  const handleProtocolChange = useCallback((protocol: string) => {
    const option = protocolMap[protocol];
    setFormState(prev => ({
      ...prev,
      protocol,
      baseUrl: prev.baseUrl || option?.defaultUrl || ''
    }));
  }, [protocolMap]);

  useEffect(() => {
    if (!statusMessage) return;
    const timer = setTimeout(() => setStatusMessage(''), 2000);
    return () => clearTimeout(timer);
  }, [statusMessage]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.safeArea}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
      >
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color="#0a0a0a" />
            </TouchableOpacity>
            <View style={styles.headerTitleGroup}>
              <Text style={styles.headerTitle}>API 设置</Text>
              <Text style={styles.headerSubtitle}>管理 OpenAI、Gemini、Ollama 等多路接入</Text>
            </View>
            <View style={styles.headerButtonPlaceholder} />
          </View>

          {statusMessage ? <Text style={styles.statusMessage}>{statusMessage}</Text> : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>默认接口</Text>
            {activeProvider ? (
              <View style={[styles.providerCard, styles.activeCard]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.providerName}>{activeProvider.name}</Text>
                  <View style={styles.activeBadge}>
                    <Ionicons name="sparkles" size={14} color="#fff" />
                    <Text style={styles.activeBadgeText}>正在使用</Text>
                  </View>
                </View>
                <Text style={styles.providerMeta}>
                  {protocolMap[activeProvider.protocol]?.label ?? activeProvider.protocol}
                </Text>
                <Text style={styles.providerMeta}>{activeProvider.baseUrl}</Text>
              </View>
            ) : (
              <Text style={styles.emptyText}>还没有默认接口，快去创建一个吧。</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>接口列表</Text>
            {providers.length === 0 ? (
              <Text style={styles.emptyText}>暂无接口配置，创建后会出现在这里。</Text>
            ) : (
              providers.map(provider => {
                const protocolLabel = protocolMap[provider.protocol]?.label ?? provider.protocol;
                const isActive = activeProviderId === provider.id;
                return (
                  <View key={provider.id} style={[styles.providerCard, isActive && styles.activeCard]}> 
                    <View style={styles.cardHeader}>
                      <Text style={styles.providerName}>{provider.name}</Text>
                      <Text style={styles.providerMeta}>{protocolLabel}</Text>
                    </View>
                    <Text style={styles.providerMeta}>{provider.baseUrl}</Text>
                    {provider.description ? (
                      <Text style={styles.providerDescription}>{provider.description}</Text>
                    ) : null}
                    <Text style={styles.providerMeta}>API Key：{maskApiKey(provider.apiKey)}</Text>
                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        style={[styles.cardActionButton, styles.primaryAction]}
                        onPress={() => handleSetActive(provider.id)}
                      >
                        <Ionicons
                          name={isActive ? 'checkmark-circle' : 'radio-button-off'}
                          size={18}
                          color="#fff"
                        />
                        <Text style={styles.cardActionText}>{isActive ? '正在使用' : '设为默认'}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cardActionButton}
                        onPress={() => handleEdit(provider)}
                      >
                        <Ionicons name="create-outline" size={18} color="#4B9BFF" />
                        <Text style={[styles.cardActionText, styles.secondaryText]}>编辑</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cardActionButton}
                        onPress={() => handleDelete(provider)}
                      >
                        <Ionicons name="trash-outline" size={18} color="#fa5252" />
                        <Text style={[styles.cardActionText, styles.deleteText]}>删除</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{isEditing ? '编辑接口' : '新增接口'}</Text>
            <View style={styles.protocolSelector}>
              {PROTOCOL_OPTIONS.map(option => {
                const isActive = formState.protocol === option.id;
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[styles.protocolChip, isActive && styles.protocolChipActive]}
                    onPress={() => handleProtocolChange(option.id)}
                  >
                    <Text style={[styles.protocolChipText, isActive && styles.protocolChipTextActive]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {formState.protocol !== 'custom' && (
              <Text style={styles.protocolHint}>{protocolMap[formState.protocol]?.description}</Text>
            )}
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>名称</Text>
              <TextInput
                style={styles.input}
                placeholder="例如：生产环境 OpenAI"
                value={formState.name}
                onChangeText={value => setFormState(prev => ({ ...prev, name: value }))}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Base URL</Text>
              <TextInput
                style={styles.input}
                placeholder={protocolMap[formState.protocol]?.defaultUrl ?? 'https://'}
                value={formState.baseUrl}
                autoCapitalize="none"
                onChangeText={value => setFormState(prev => ({ ...prev, baseUrl: value }))}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>API Key</Text>
              <TextInput
                style={styles.input}
                placeholder="sk-..."
                value={formState.apiKey}
                autoCapitalize="none"
                secureTextEntry
                onChangeText={value => setFormState(prev => ({ ...prev, apiKey: value }))}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>备注</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="给这个接口写个用途说明吧"
                value={formState.description}
                multiline
                numberOfLines={3}
                onChangeText={value => setFormState(prev => ({ ...prev, description: value }))}
              />
            </View>
            <View style={styles.formActions}>
              {isEditing && (
                <TouchableOpacity style={styles.secondaryButton} onPress={resetForm}>
                  <Text style={[styles.buttonText, styles.secondaryText]}>取消编辑</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Ionicons name="save-outline" size={18} color="#fff" />
                <Text style={styles.buttonText}>{isEditing ? '保存修改' : '添加接口'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f9fc'
  },
  container: {
    paddingBottom: 32
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e9eefc'
  },
  headerButtonPlaceholder: {
    width: 40,
    height: 40
  },
  headerTitleGroup: {
    flex: 1,
    marginHorizontal: 12
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#101828'
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#667085',
    marginTop: 4
  },
  statusMessage: {
    marginHorizontal: 16,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#e0f2ff',
    color: '#1760a5',
    fontSize: 12,
    textAlign: 'center'
  },
  section: {
    marginHorizontal: 16,
    marginTop: 18,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12
  },
  emptyText: {
    fontSize: 13,
    color: '#94a3b8'
  },
  providerCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginBottom: 12
  },
  activeCard: {
    borderColor: '#4B9BFF',
    backgroundColor: '#f2f7ff'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  providerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a'
  },
  providerMeta: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 4
  },
  providerDescription: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 8
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4B9BFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  activeBadgeText: {
    color: '#fff',
    fontSize: 11,
    marginLeft: 4
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: 12,
    justifyContent: 'space-between'
  },
  cardActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#edf2ff',
    marginRight: 8
  },
  primaryAction: {
    backgroundColor: '#4B9BFF'
  },
  cardActionText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#334155'
  },
  secondaryText: {
    color: '#2563eb'
  },
  deleteText: {
    color: '#fa5252'
  },
  protocolSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  protocolChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#eff1f5',
    marginRight: 8,
    marginBottom: 8
  },
  protocolChipActive: {
    backgroundColor: '#4B9BFF'
  },
  protocolChipText: {
    fontSize: 12,
    color: '#475569'
  },
  protocolChipTextActive: {
    color: '#fff',
    fontWeight: '600'
  },
  protocolHint: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 12
  },
  formGroup: {
    marginBottom: 12
  },
  inputLabel: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 6
  },
  input: {
    borderWidth: 1,
    borderColor: '#dbe2f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#fff'
  },
  multilineInput: {
    minHeight: 72,
    textAlignVertical: 'top'
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 12
  },
  secondaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
    marginRight: 12
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#4B9BFF'
  },
  buttonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 14
  }
});
