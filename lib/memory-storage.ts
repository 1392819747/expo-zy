import AsyncStorage from '@react-native-async-storage/async-storage';

export const MEMORY_SETTINGS_KEY = 'zhiyin.memory.settings.v2';
const MEMORY_ENTRIES_KEY = 'zhiyin.memory.entries.v2';

export type MemorySettings = {
  autoLearning: boolean;
  privacyShieldEnabled: boolean;
  capacityLimit: number;
  lastCleanupAt: number | null;
};

export type MemoryEntry = {
  id: string;
  summary: string;
  detail: string;
  confidence: number; // 0 - 1
  tokenFootprint: number;
  updatedAt: number;
  pinned: boolean;
  reviewed: boolean;
  conversationScoped: boolean;
  tags: string[];
};

const DEFAULT_SETTINGS: MemorySettings = {
  autoLearning: true,
  privacyShieldEnabled: true,
  capacityLimit: 50,
  lastCleanupAt: null,
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const normalizeTags = (tags: unknown): string[] => {
  if (!tags) {
    return [];
  }

  if (Array.isArray(tags)) {
    return tags
      .map(tag => (typeof tag === 'string' ? tag.trim() : ''))
      .filter(Boolean);
  }

  if (typeof tags === 'string') {
    return tags
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizeEntry = (
  raw: Partial<MemoryEntry> & { id?: string; summary?: string }
): MemoryEntry => {
  const now = Date.now();

  return {
    id: raw.id ?? `${now}-${Math.random().toString(36).slice(2)}`,
    summary: raw.summary && raw.summary.trim().length > 0 ? raw.summary.trim() : '未命名记忆',
    detail: typeof raw.detail === 'string' ? raw.detail : '',
    confidence:
      typeof raw.confidence === 'number' && Number.isFinite(raw.confidence)
        ? clamp(raw.confidence, 0, 1)
        : 0.5,
    tokenFootprint:
      typeof raw.tokenFootprint === 'number' && Number.isFinite(raw.tokenFootprint)
        ? Math.max(1, Math.round(raw.tokenFootprint))
        : 1,
    updatedAt: typeof raw.updatedAt === 'number' && Number.isFinite(raw.updatedAt) ? raw.updatedAt : now,
    pinned: Boolean(raw.pinned),
    reviewed: Boolean(raw.reviewed ?? true),
    conversationScoped: raw.conversationScoped !== false,
    tags: normalizeTags(raw.tags),
  };
};

const sortEntries = (entries: MemoryEntry[]): MemoryEntry[] =>
  [...entries].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;

    if (a.reviewed && !b.reviewed) return 1;
    if (!a.reviewed && b.reviewed) return -1;

    return b.updatedAt - a.updatedAt;
  });

const DEFAULT_ENTRIES: MemoryEntry[] = sortEntries([
  {
    id: 'memory-1',
    summary: '*** 喜欢在晚上练习口语',
    detail: '用户习惯在睡前使用中文与英文混合提问，偏好温柔的语气回复。',
    confidence: 0.92,
    tokenFootprint: 8,
    updatedAt: Date.now() - 1000 * 60 * 20,
    pinned: true,
    reviewed: true,
    conversationScoped: false,
    tags: ['长期', '语气偏好'],
  },
  {
    id: 'memory-2',
    summary: '*** 的项目代号是「霓虹」',
    detail: '当前对话正在协助设计霓虹计划，需要保持上下文连贯，并记录阶段性目标。',
    confidence: 0.87,
    tokenFootprint: 6,
    updatedAt: Date.now() - 1000 * 60 * 45,
    pinned: false,
    reviewed: true,
    conversationScoped: true,
    tags: ['会话', '项目'],
  },
  {
    id: 'memory-3',
    summary: '*** 对隐私过滤开启',
    detail: '敏感信息需在写入前做脱敏处理，并标注来源对话编号。',
    confidence: 0.78,
    tokenFootprint: 5,
    updatedAt: Date.now() - 1000 * 60 * 65,
    pinned: false,
    reviewed: false,
    conversationScoped: false,
    tags: ['长期', '安全'],
  },
]);

export const loadMemorySettings = async (): Promise<MemorySettings> => {
  try {
    const stored = await AsyncStorage.getItem(MEMORY_SETTINGS_KEY);
    if (!stored) {
      await AsyncStorage.setItem(MEMORY_SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }

    const parsed = JSON.parse(stored) as Partial<MemorySettings> | null;
    return {
      ...DEFAULT_SETTINGS,
      ...(parsed ?? {}),
      lastCleanupAt:
        parsed && typeof parsed.lastCleanupAt === 'number' && Number.isFinite(parsed.lastCleanupAt)
          ? parsed.lastCleanupAt
          : null,
      capacityLimit:
        parsed && typeof parsed.capacityLimit === 'number' && parsed.capacityLimit > 0
          ? Math.round(parsed.capacityLimit)
          : DEFAULT_SETTINGS.capacityLimit,
    };
  } catch (error) {
    console.error('读取记忆设置失败', error);
    return DEFAULT_SETTINGS;
  }
};

export const updateMemorySettings = async (
  patch: Partial<MemorySettings>,
): Promise<MemorySettings> => {
  const current = await loadMemorySettings();
  const merged: MemorySettings = {
    ...current,
    ...patch,
    capacityLimit:
      patch.capacityLimit && patch.capacityLimit > 0
        ? Math.round(patch.capacityLimit)
        : current.capacityLimit,
    lastCleanupAt:
      patch.lastCleanupAt === null
        ? null
        : patch.lastCleanupAt && Number.isFinite(patch.lastCleanupAt)
          ? patch.lastCleanupAt
          : current.lastCleanupAt,
  };

  try {
    await AsyncStorage.setItem(MEMORY_SETTINGS_KEY, JSON.stringify(merged));
  } catch (error) {
    console.error('保存记忆设置失败', error);
  }

  return merged;
};

export const toggleMemoryAutoLearning = async (enabled: boolean): Promise<MemorySettings> =>
  updateMemorySettings({ autoLearning: enabled });

export const toggleMemoryPrivacyShield = async (enabled: boolean): Promise<MemorySettings> =>
  updateMemorySettings({ privacyShieldEnabled: enabled });

export const loadMemoryEntries = async (): Promise<MemoryEntry[]> => {
  try {
    const stored = await AsyncStorage.getItem(MEMORY_ENTRIES_KEY);
    if (!stored) {
      await AsyncStorage.setItem(MEMORY_ENTRIES_KEY, JSON.stringify(DEFAULT_ENTRIES));
      return DEFAULT_ENTRIES;
    }

    const parsed = JSON.parse(stored) as unknown;
    if (!Array.isArray(parsed)) {
      return DEFAULT_ENTRIES;
    }

    const normalized = parsed
      .map(item => {
        try {
          return normalizeEntry(item as Partial<MemoryEntry>);
        } catch (error) {
          console.warn('记忆条目解析失败', error);
          return null;
        }
      })
      .filter((entry): entry is MemoryEntry => entry !== null);

    return sortEntries(normalized);
  } catch (error) {
    console.error('读取记忆条目失败', error);
    return DEFAULT_ENTRIES;
  }
};

export const saveMemoryEntries = async (entries: MemoryEntry[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(MEMORY_ENTRIES_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('保存记忆条目失败', error);
    throw error;
  }
};

export const updateMemoryEntry = async (
  id: string,
  patch: Partial<Omit<MemoryEntry, 'id'>> | ((entry: MemoryEntry) => Partial<Omit<MemoryEntry, 'id'>>),
): Promise<MemoryEntry[] | null> => {
  const existing = await loadMemoryEntries();
  let hasUpdated = false;

  const updated = existing.map(entry => {
    if (entry.id !== id) {
      return entry;
    }

    hasUpdated = true;
    const resolvedPatch = typeof patch === 'function' ? patch(entry) : patch;
    return normalizeEntry({
      ...entry,
      ...resolvedPatch,
      updatedAt: resolvedPatch.updatedAt ?? Date.now(),
    });
  });

  if (!hasUpdated) {
    return null;
  }

  const sorted = sortEntries(updated);
  await saveMemoryEntries(sorted);
  return sorted;
};

export const toggleMemoryPinned = async (id: string): Promise<MemoryEntry[] | null> =>
  updateMemoryEntry(id, entry => ({ pinned: !entry.pinned }));

export const setMemoryPinned = async (
  id: string,
  pinned: boolean,
): Promise<MemoryEntry[] | null> => updateMemoryEntry(id, { pinned });

export const setMemoryReviewed = async (
  id: string,
  reviewed: boolean,
): Promise<MemoryEntry[] | null> => updateMemoryEntry(id, { reviewed });

export const toggleMemoryReviewed = async (id: string): Promise<MemoryEntry[] | null> =>
  updateMemoryEntry(id, entry => ({ reviewed: !entry.reviewed }));

export const clearConversationMemories = async (): Promise<MemoryEntry[]> => {
  const entries = await loadMemoryEntries();
  const filtered = entries.filter(entry => !entry.conversationScoped || entry.pinned);
  const sorted = sortEntries(filtered);
  await saveMemoryEntries(sorted);
  return sorted;
};

export const removeMemoryEntry = async (id: string): Promise<MemoryEntry[]> => {
  const entries = await loadMemoryEntries();
  const filtered = entries.filter(entry => entry.id !== id);
  const sorted = sortEntries(filtered);
  await saveMemoryEntries(sorted);
  return sorted;
};

export const calculateMemoryUsage = (entries: MemoryEntry[], capacityLimit: number) => {
  const usedTokens = entries.reduce((total, entry) => total + entry.tokenFootprint, 0);
  const limit = Math.max(1, capacityLimit);
  const ratio = Math.min(1, usedTokens / limit);

  let status: '充裕' | '良好' | '紧张';
  if (ratio < 0.45) {
    status = '充裕';
  } else if (ratio < 0.8) {
    status = '良好';
  } else {
    status = '紧张';
  }

  return {
    usedTokens,
    limit,
    ratio,
    status,
  };
};
