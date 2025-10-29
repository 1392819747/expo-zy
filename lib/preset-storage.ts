import AsyncStorage from '@react-native-async-storage/async-storage';

export const PRESET_STORAGE_KEY = 'zhiyin.presets.entries';

export type PresetScope = '全局' | '会话';

export type PresetDefinition = {
  id: string;
  name: string;
  description: string;
  scope: PresetScope;
  tags: string[];
  variables: string[];
  enabled: boolean;
  updatedAt: number;
  category: string;
};

const DEFAULT_PRESETS: PresetDefinition[] = [
  {
    id: 'assistant-clean',
    name: '通用助理 · 简洁格式',
    description: '保持回答紧凑并带有结构化小标题，适合日常问答与总结。',
    scope: '全局',
    tags: ['结构化输出', '小标题'],
    variables: ['role', 'lang', 'tone', 'format'],
    enabled: true,
    updatedAt: Date.now() - 1000 * 60 * 60 * 4,
    category: '日常辅助',
  },
  {
    id: 'roleplay-ancient',
    name: '角色扮演 · 古风',
    description: '以文言雅致的口吻扮演古风角色，适用于剧情演绎与写作。',
    scope: '会话',
    tags: ['角色扮演', '写作灵感'],
    variables: ['role', 'background', 'tone'],
    enabled: true,
    updatedAt: Date.now() - 1000 * 60 * 60 * 12,
    category: '创作灵感',
  },
  {
    id: 'structured-json',
    name: '结构化输出 · JSON',
    description: '约束模型输出符合 JSON Schema，便于后续程序解析。',
    scope: '全局',
    tags: ['结构化', '自动化'],
    variables: ['schema', 'lang', 'examples'],
    enabled: false,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24,
    category: '数据处理',
  },
];

const normalizeStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map(item => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean);
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    return value
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizeScope = (scope: unknown): PresetScope =>
  scope === '会话' ? '会话' : '全局';

const normalizePreset = (raw: Partial<PresetDefinition> & { id?: string; name?: string }): PresetDefinition => {
  const now = Date.now();
  return {
    id: raw.id ?? `${now}`,
    name: raw.name && raw.name.trim().length > 0 ? raw.name : '未命名预设',
    description: typeof raw.description === 'string' ? raw.description : '',
    scope: normalizeScope(raw.scope),
    tags: normalizeStringArray(raw.tags),
    variables: normalizeStringArray(raw.variables),
    enabled: raw.enabled !== false,
    updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : now,
    category: typeof raw.category === 'string' && raw.category.trim().length > 0 ? raw.category : '未分类',
  };
};

const sortPresets = (presets: PresetDefinition[]): PresetDefinition[] =>
  [...presets].sort((a, b) => {
    if (a.enabled && !b.enabled) return -1;
    if (!a.enabled && b.enabled) return 1;
    return b.updatedAt - a.updatedAt;
  });

export const loadPresetDefinitions = async (): Promise<PresetDefinition[]> => {
  try {
    const stored = await AsyncStorage.getItem(PRESET_STORAGE_KEY);
    if (!stored) {
      return sortPresets(DEFAULT_PRESETS);
    }

    const parsed = JSON.parse(stored) as unknown;
    if (!Array.isArray(parsed)) {
      return sortPresets(DEFAULT_PRESETS);
    }

    const normalized = parsed
      .map(item => {
        try {
          return normalizePreset(item as Partial<PresetDefinition>);
        } catch (error) {
          console.warn('解析预设失败', error);
          return null;
        }
      })
      .filter((preset): preset is PresetDefinition => preset !== null);

    if (normalized.length === 0) {
      return sortPresets(DEFAULT_PRESETS);
    }

    return sortPresets(normalized);
  } catch (error) {
    console.error('读取预设失败', error);
    return sortPresets(DEFAULT_PRESETS);
  }
};

export const savePresetDefinitions = async (presets: PresetDefinition[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(presets));
  } catch (error) {
    console.error('保存预设失败', error);
    throw error;
  }
};

export const togglePresetEnabled = async (
  id: string,
  enabled: boolean,
): Promise<PresetDefinition[]> => {
  const existing = await loadPresetDefinitions();
  const now = Date.now();

  const updated = existing.map(preset => {
    if (preset.id !== id) {
      return preset;
    }

    return {
      ...preset,
      enabled,
      updatedAt: now,
    };
  });

  const sorted = sortPresets(updated.map(item => normalizePreset(item)));
  await savePresetDefinitions(sorted);
  return sorted;
};

export const upsertPresetDefinition = async (
  payload: Partial<PresetDefinition> & { id?: string },
): Promise<PresetDefinition[]> => {
  const existing = await loadPresetDefinitions();
  const normalized = normalizePreset(payload);

  const hasPreset = existing.some(item => item.id === normalized.id);
  const updated = hasPreset
    ? existing.map(item => (item.id === normalized.id ? { ...item, ...normalized } : item))
    : [...existing, normalized];

  const sorted = sortPresets(updated.map(item => normalizePreset(item)));
  await savePresetDefinitions(sorted);
  return sorted;
};

export const removePresetDefinition = async (id: string): Promise<PresetDefinition[]> => {
  const existing = await loadPresetDefinitions();
  const filtered = existing.filter(item => item.id !== id);
  const sorted = sortPresets(filtered.map(item => normalizePreset(item)));
  await savePresetDefinitions(sorted);
  return sorted;
};
