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

type ModelProvider = {
    id: string;
    name: string;
    type: 'openai' | 'claude' | 'gemini' | 'ollama' | 'custom';
    apiKey: string;
    baseUrl: string;
    models: string[];
    selectedModel?: string;
    description?: string;
    createdAt: number;
};

const PROVIDER_STORAGE_KEY = 'zhiyin.api-settings.providers';
const ACTIVE_PROVIDER_KEY = 'zhiyin.api-settings.active-provider';

const MODEL_TYPES = [
    { id: 'openai', label: 'OpenAI', icon: 'logo-openai', defaultUrl: 'https://api.openai.com/v1', defaultModels: ['gpt-4', 'gpt-3.5-turbo'] },
    { id: 'claude', label: 'Claude', icon: 'chatbubbles', defaultUrl: 'https://api.anthropic.com', defaultModels: ['claude-3-opus', 'claude-3-sonnet'] },
    { id: 'gemini', label: 'Gemini', icon: 'diamond', defaultUrl: 'https://generativelanguage.googleapis.com', defaultModels: ['gemini-pro', 'gemini-pro-vision'] },
    { id: 'ollama', label: 'Ollama', icon: 'server', defaultUrl: 'http://localhost:11434', defaultModels: ['llama2', 'mistral'] },
    { id: 'custom', label: '自定义', icon: 'construct', defaultUrl: '', defaultModels: [] }
];

export default function ApiTab() {
    const [providers, setProviders] = useState<ModelProvider[]>([]);
    const [activeProviderId, setActiveProviderId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: 'openai' as ModelProvider['type'],
        apiKey: '',
        baseUrl: '',
        models: [] as string[],
        selectedModel: '',
        description: ''
    });

    useEffect(() => {
        loadProviders();
    }, []);

    const loadProviders = async () => {
        try {
            const [storedProviders, storedActive] = await Promise.all([
                AsyncStorage.getItem(PROVIDER_STORAGE_KEY),
                AsyncStorage.getItem(ACTIVE_PROVIDER_KEY)
            ]);

            if (storedProviders) {
                setProviders(JSON.parse(storedProviders));
            }
            if (storedActive) {
                setActiveProviderId(storedActive);
            }
        } catch (error) {
            console.error('加载失败', error);
        }
    };

    const saveProvider = async () => {
        if (!formData.name.trim()) {
            Alert.alert('提示', '请输入名称');
            return;
        }

        const newProvider: ModelProvider = {
            id: Date.now().toString(),
            name: formData.name,
            type: formData.type,
            apiKey: formData.apiKey,
            baseUrl: formData.baseUrl || MODEL_TYPES.find(t => t.id === formData.type)?.defaultUrl || '',
            models: formData.models.length > 0 ? formData.models : MODEL_TYPES.find(t => t.id === formData.type)?.defaultModels || [],
            selectedModel: formData.selectedModel,
            description: formData.description,
            createdAt: Date.now()
        };

        const newProviders = [...providers, newProvider];
        setProviders(newProviders);
        await AsyncStorage.setItem(PROVIDER_STORAGE_KEY, JSON.stringify(newProviders));

        if (!activeProviderId) {
            setActiveProviderId(newProvider.id);
            await AsyncStorage.setItem(ACTIVE_PROVIDER_KEY, newProvider.id);
        }

        setIsAdding(false);
        resetForm();
    };

    const deleteProvider = async (id: string) => {
        Alert.alert('删除', '确定要删除这个模型吗？', [
            { text: '取消', style: 'cancel' },
            {
                text: '删除',
                style: 'destructive',
                onPress: async () => {
                    const newProviders = providers.filter(p => p.id !== id);
                    setProviders(newProviders);
                    await AsyncStorage.setItem(PROVIDER_STORAGE_KEY, JSON.stringify(newProviders));
                    if (activeProviderId === id) {
                        const newActive = newProviders[0]?.id || null;
                        setActiveProviderId(newActive);
                        if (newActive) {
                            await AsyncStorage.setItem(ACTIVE_PROVIDER_KEY, newActive);
                        } else {
                            await AsyncStorage.removeItem(ACTIVE_PROVIDER_KEY);
                        }
                    }
                }
            }
        ]);
    };

    const setActive = async (id: string) => {
        setActiveProviderId(id);
        await AsyncStorage.setItem(ACTIVE_PROVIDER_KEY, id);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            type: 'openai',
            apiKey: '',
            baseUrl: '',
            models: [],
            selectedModel: '',
            description: ''
        });
    };

    const activeProvider = providers.find(p => p.id === activeProviderId);

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

            {/* 当前使用的模型 */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>当前模型</Text>
                {activeProvider ? (
                    <View style={[styles.card, styles.activeCard]}>
                        <View style={styles.cardHeader}>
                            <Ionicons name={MODEL_TYPES.find(t => t.id === activeProvider.type)?.icon as any || 'cloud'} size={24} color="#4B9BFF" />
                            <View style={styles.cardInfo}>
                                <Text style={styles.cardTitle}>{activeProvider.name}</Text>
                                <Text style={styles.cardMeta}>{MODEL_TYPES.find(t => t.id === activeProvider.type)?.label}</Text>
                                <Text style={styles.cardMeta}>模型: {activeProvider.selectedModel || (activeProvider.models && activeProvider.models[0]) || '未选择'}</Text>
                            </View>
                        </View>
                    </View>
                ) : (
                    <Text style={styles.emptyText}>暂无活动模型</Text>
                )}
            </View>

            {/* 模型列表 */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>模型列表</Text>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => setIsAdding(!isAdding)}
                    >
                        <Ionicons name={isAdding ? "close" : "add-circle"} size={24} color="#4B9BFF" />
                    </TouchableOpacity>
                </View>

                {isAdding && (
                    <View style={styles.form}>
                        <Text style={styles.label}>模型类型</Text>
                        <View style={styles.typeSelector}>
                            {MODEL_TYPES.map(type => (
                                <TouchableOpacity
                                    key={type.id}
                                    style={[styles.typeChip, formData.type === type.id && styles.typeChipActive]}
                                    onPress={() => setFormData({ ...formData, type: type.id as any })}
                                >
                                    <Ionicons name={type.icon as any} size={16} color={formData.type === type.id ? '#fff' : '#64748b'} />
                                    <Text style={[styles.typeChipText, formData.type === type.id && styles.typeChipTextActive]}>
                                        {type.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>名称</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="例如: GPT-4 生产环境"
                            value={formData.name}
                            onChangeText={name => setFormData({ ...formData, name })}
                        />

                        <Text style={styles.label}>API Key</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="sk-..."
                            value={formData.apiKey}
                            onChangeText={apiKey => setFormData({ ...formData, apiKey })}
                            secureTextEntry
                            autoCapitalize="none"
                        />

                        <Text style={styles.label}>Base URL (可选)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder={MODEL_TYPES.find(t => t.id === formData.type)?.defaultUrl}
                            value={formData.baseUrl}
                            onChangeText={baseUrl => setFormData({ ...formData, baseUrl })}
                            autoCapitalize="none"
                        />

                        <TouchableOpacity style={styles.saveButton} onPress={saveProvider}>
                            <Ionicons name="checkmark-circle" size={20} color="#fff" />
                            <Text style={styles.saveButtonText}>保存</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {providers.map(provider => (
                    <View key={provider.id} style={[styles.card, provider.id === activeProviderId && styles.activeCard]}>
                        <View style={styles.cardHeader}>
                            <Ionicons name={MODEL_TYPES.find(t => t.id === provider.type)?.icon as any || 'cloud'} size={20} color="#64748b" />
                            <View style={styles.cardInfo}>
                                <Text style={styles.cardTitle}>{provider.name}</Text>
                                <Text style={styles.cardMeta}>{MODEL_TYPES.find(t => t.id === provider.type)?.label}</Text>
                            </View>
                        </View>
                        <View style={styles.cardActions}>
                            <TouchableOpacity
                                style={[styles.actionButton, provider.id === activeProviderId && styles.actionButtonActive]}
                                onPress={() => setActive(provider.id)}
                            >
                                <Text style={[styles.actionButtonText, provider.id === activeProviderId && styles.actionButtonTextActive]}>
                                    {provider.id === activeProviderId ? '使用中' : '使用'}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => deleteProvider(provider.id)}
                            >
                                <Ionicons name="trash-outline" size={18} color="#fa5252" />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
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
    card: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        padding: 12,
        marginBottom: 12
    },
    activeCard: {
        borderColor: '#4B9BFF',
        backgroundColor: '#f2f7ff'
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8
    },
    cardInfo: {
        marginLeft: 12,
        flex: 1
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#0f172a'
    },
    cardMeta: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2
    },
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8
    },
    actionButton: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: '#e2e8f0',
        marginRight: 8,
        alignItems: 'center'
    },
    actionButtonActive: {
        backgroundColor: '#4B9BFF'
    },
    actionButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569'
    },
    actionButtonTextActive: {
        color: '#fff'
    },
    deleteButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#fee2e2',
        alignItems: 'center',
        justifyContent: 'center'
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
    typeSelector: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 8
    },
    typeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#eff1f5',
        marginRight: 8,
        marginBottom: 8
    },
    typeChipActive: {
        backgroundColor: '#4B9BFF'
    },
    typeChipText: {
        fontSize: 12,
        color: '#64748b',
        marginLeft: 4
    },
    typeChipTextActive: {
        color: '#fff',
        fontWeight: '600'
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
    }
});
