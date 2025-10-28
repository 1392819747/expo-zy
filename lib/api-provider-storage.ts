import AsyncStorage from '@react-native-async-storage/async-storage';

export type ApiProviderVendor = 'openai' | 'gemini' | 'claude' | 'ollama' | 'custom';
export type ApiProviderStatus = 'unknown' | 'connected' | 'error';

export interface ApiProvider {
  id: string;
  name: string;
  provider: ApiProviderVendor;
  model: string;
  baseUrl: string;
  apiKey: string;
  temperature: number;
  maxTokens: number;
  createdAt: number;
  updatedAt: number;
  lastConnectedAt?: string;
  status: ApiProviderStatus;
  expiresAt?: string;
  notes?: string;
  secureStore?: boolean;
}

const PROVIDERS_KEY = 'zhiyin.api.providers';
const ACTIVE_PROVIDER_KEY = 'zhiyin.api.providers.active';

export function createEmptyProvider(partial: Partial<ApiProvider> = {}): ApiProvider {
  const timestamp = Date.now();
  const normalizeNumber = (value: unknown, parser: (input: string) => number = Number): number | undefined => {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : undefined;
    }
    if (typeof value === 'string' && value.trim().length > 0) {
      const parsed = parser(value);
      return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
  };

  const temperatureValue = normalizeNumber(partial.temperature, Number.parseFloat);
  const maxTokensValue = normalizeNumber(partial.maxTokens, (input) => Number.parseInt(input, 10));
  const createdAtValue = normalizeNumber(partial.createdAt, (input) => Number.parseInt(input, 10));
  const updatedAtValue = normalizeNumber(partial.updatedAt, (input) => Number.parseInt(input, 10));
  return {
    id: partial.id ?? timestamp.toString(),
    name: partial.name ?? '未命名配置',
    provider: partial.provider ?? 'openai',
    model: partial.model ?? '',
    baseUrl: partial.baseUrl ?? '',
    apiKey: partial.apiKey ?? '',
    temperature: temperatureValue ?? 0.7,
    maxTokens: maxTokensValue ?? 1024,
    createdAt: createdAtValue ?? timestamp,
    updatedAt: updatedAtValue ?? timestamp,
    lastConnectedAt: partial.lastConnectedAt,
    status: partial.status ?? 'unknown',
    expiresAt: partial.expiresAt,
    notes: partial.notes,
    secureStore: partial.secureStore ?? false,
  };
}

export async function loadApiProviders() {
  const [rawProviders, rawActive] = await Promise.all([
    AsyncStorage.getItem(PROVIDERS_KEY),
    AsyncStorage.getItem(ACTIVE_PROVIDER_KEY),
  ]);

  let providers: ApiProvider[] = [];

  if (rawProviders) {
    try {
      const parsed: ApiProvider[] = JSON.parse(rawProviders);
      providers = parsed
        .filter((item): item is ApiProvider => !!item && typeof item === 'object')
        .map((item) => ({
          ...createEmptyProvider(item),
          id: item.id ?? createEmptyProvider().id,
        }))
        .sort((a, b) => b.updatedAt - a.updatedAt);
    } catch (error) {
      console.error('Failed to parse api providers', error);
      providers = [];
    }
  }

  const activeProviderId = rawActive ?? null;

  return { providers, activeProviderId };
}

export async function persistApiProviders(providers: ApiProvider[]) {
  await AsyncStorage.setItem(PROVIDERS_KEY, JSON.stringify(providers));
}

export async function saveApiProvider(provider: ApiProvider) {
  const { providers, activeProviderId } = await loadApiProviders();
  const nextProviders = [...providers];
  const index = nextProviders.findIndex((item) => item.id === provider.id);
  const payload = { ...provider, updatedAt: Date.now() };

  if (index >= 0) {
    nextProviders[index] = { ...nextProviders[index], ...payload };
  } else {
    nextProviders.unshift(payload);
  }

  await persistApiProviders(nextProviders);

  // ensure active provider still exists
  if (activeProviderId && !nextProviders.some((item) => item.id === activeProviderId)) {
    await setActiveApiProvider(nextProviders[0]?.id ?? null);
  }

  return { providers: nextProviders, activeProviderId: await getActiveApiProviderId() };
}

export async function deleteApiProvider(id: string) {
  const { providers } = await loadApiProviders();
  const nextProviders = providers.filter((item) => item.id !== id);
  await persistApiProviders(nextProviders);

  const activeProviderId = await getActiveApiProviderId();
  if (activeProviderId === id) {
    await setActiveApiProvider(nextProviders[0]?.id ?? null);
  }

  return { providers: nextProviders, activeProviderId: await getActiveApiProviderId() };
}

export async function setActiveApiProvider(id: string | null) {
  if (id) {
    await AsyncStorage.setItem(ACTIVE_PROVIDER_KEY, id);
  } else {
    await AsyncStorage.removeItem(ACTIVE_PROVIDER_KEY);
  }
}

export async function getActiveApiProviderId() {
  const stored = await AsyncStorage.getItem(ACTIVE_PROVIDER_KEY);
  return stored ?? null;
}

export function getStatusMeta(status: ApiProviderStatus) {
  switch (status) {
    case 'connected':
      return { label: '正常', color: '#22c55e', indicator: '✓' } as const;
    case 'error':
      return { label: '失败', color: '#ef4444', indicator: '!' } as const;
    default:
      return { label: '未知', color: '#f59e0b', indicator: '?' } as const;
  }
}
