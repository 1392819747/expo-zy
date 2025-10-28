import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
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
  deleteApiProvider,
  getStatusMeta,
  loadApiProviders,
  setActiveApiProvider,
} from '@/lib/api-provider-storage';

export default function ApiSettingsScreen() {
  const router = useRouter();
  const [providers, setProviders] = useState<ApiProvider[]>([]);
  const [activeProviderId, setActiveProviderId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const load = useCallback(async () => {
    const { providers: loadedProviders, activeProviderId: active } = await loadApiProviders();
    setProviders(loadedProviders);
    setActiveProviderId(active);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const filteredProviders = useMemo(() => {
    if (!search.trim()) {
      return providers;
    }
    const keyword = search.toLowerCase();
    return providers.filter((item) =>
      [item.name, item.model, item.baseUrl]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(keyword)),
    );
  }, [providers, search]);

  const handleToggleActive = async (provider: ApiProvider, nextValue: boolean) => {
    if (nextValue) {
      await setActiveApiProvider(provider.id);
      setActiveProviderId(provider.id);
    } else {
      await setActiveApiProvider(null);
      setActiveProviderId(null);
    }
  };

  const handleDelete = (provider: ApiProvider) => {
    Alert.alert('删除配置', `确定要删除“${provider.name}”吗？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          const { providers: nextProviders, activeProviderId: nextActive } = await deleteApiProvider(
            provider.id,
          );
          setProviders(nextProviders);
          setActiveProviderId(nextActive);
        },
      },
    ]);
  };

  const handleEdit = (provider: ApiProvider) => {
    router.push({ pathname: '/api/config', params: { id: provider.id } });
  };

  const handleCreate = () => {
    router.push('/api/config');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>选择配置</Text>
        <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing((prev) => !prev)}>
          <Text style={styles.editButtonText}>{isEditing ? '完成' : '编辑'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#64748b" />
        <TextInput
          style={styles.searchInput}
          placeholder="搜索配置"
          placeholderTextColor="#475569"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>已保存的配置</Text>
        {filteredProviders.length === 0 ? (
          <Text style={styles.emptyText}>暂无配置，请新建一个配置。</Text>
        ) : (
          filteredProviders.map((provider) => {
            const statusMeta = getStatusMeta(provider.status);
            const isActive = provider.id === activeProviderId;
            return (
              <TouchableOpacity
                key={provider.id}
                activeOpacity={0.9}
                style={[styles.providerCard, isActive && styles.providerCardActive]}
                onPress={() => handleEdit(provider)}
              >
                <View style={styles.providerHeader}>
                  <View style={styles.providerIconWrapper}>
                    <Ionicons name={provider.provider === 'gemini' ? 'sparkles' : 'planet'} size={20} color="#60a5fa" />
                  </View>
                  <View style={styles.providerInfo}>
                    <View style={styles.providerTitleRow}>
                      <Text style={styles.providerName}>{provider.name}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: `${statusMeta.color}1a` }]}> 
                        <View style={[styles.statusDot, { backgroundColor: statusMeta.color }]} />
                        <Text style={[styles.statusText, { color: statusMeta.color }]}>{statusMeta.label}</Text>
                      </View>
                    </View>
                    <Text style={styles.providerMeta}>{provider.provider === 'gemini' ? 'Gemini' : 'OpenAI'}</Text>
                    {provider.model ? (
                      <Text style={styles.providerMeta}>模型 {provider.model}</Text>
                    ) : null}
                    <Text style={styles.providerMeta} numberOfLines={1}>
                      网络 {provider.baseUrl || '未填写'}
                    </Text>
                    <View style={styles.providerFooterRow}>
                      <Text style={styles.providerFooterText}>
                        上次连接 {provider.lastConnectedAt ? formatDate(provider.lastConnectedAt) : '暂无记录'}
                      </Text>
                      <Text style={styles.providerFooterText}>
                        到期 {provider.expiresAt ? formatDate(provider.expiresAt) : '—'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.cardActions}>
                    <Switch
                      value={isActive}
                      onValueChange={(value) => handleToggleActive(provider, value)}
                      trackColor={{ false: '#1e293b', true: '#3b82f6' }}
                      thumbColor="#0f172a"
                      ios_backgroundColor="#1e293b"
                    />
                    <Ionicons name="chevron-forward" size={18} color="#475569" />
                    {isEditing && (
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDelete(provider)}
                      >
                        <Ionicons name="trash" size={18} color="#ef4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
        <Ionicons name="add" size={20} color="#0f172a" />
        <Text style={styles.createButtonText}>新建配置</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function formatDate(input: string | number) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return '未知';
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#07090f',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '700',
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#111827',
  },
  editButtonText: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 24,
  },
  searchInput: {
    marginLeft: 8,
    flex: 1,
    color: '#e2e8f0',
    fontSize: 15,
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    color: '#94a3b8',
    fontSize: 13,
    marginBottom: 12,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 32,
  },
  providerCard: {
    backgroundColor: '#0b1120',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  providerCardActive: {
    borderColor: '#3b82f6',
  },
  providerHeader: {
    flexDirection: 'row',
  },
  providerIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  providerInfo: {
    flex: 1,
  },
  providerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  providerName: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  providerMeta: {
    color: '#94a3b8',
    fontSize: 13,
    marginBottom: 4,
  },
  providerFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  providerFooterText: {
    color: '#64748b',
    fontSize: 12,
  },
  cardActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginLeft: 12,
  },
  deleteButton: {
    marginTop: 12,
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#1f2937',
  },
  createButton: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    paddingVertical: 16,
    borderRadius: 18,
  },
  createButtonText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 6,
  },
});
