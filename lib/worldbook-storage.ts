import AsyncStorage from '@react-native-async-storage/async-storage';

export const WORLDBOOK_STORAGE_KEY = 'zhiyin.worldbook.entries';
const WORLDBOOK_SETTINGS_KEY = 'zhiyin.worldbook.settings';

export type WorldBookScope = '全局' | '会话';
export type WorldBookCategory = '设定' | '人物' | '地点' | '剧情' | '道具' | '其他';

export type WorldBookEntry = {
  id: string;
  title: string;
  keywords: string[];
  content: string;
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
  category: WorldBookCategory;
  scope: WorldBookScope;
  injectionCount: number;
  lastInjectedAt: number | null;
  pinned: boolean;
  note?: string;
};

export type WorldBookSettings = {
  enabled: boolean;
  autoInject?: boolean;
  lastSyncedAt?: number | null;
};

const DEFAULT_SETTINGS: WorldBookSettings = {
  enabled: true,
  autoInject: true,
  lastSyncedAt: null,
};

const WORLD_BOOK_CATEGORIES: WorldBookCategory[] = ['设定', '人物', '地点', '剧情', '道具', '其他'];

const isWorldBookCategory = (value: unknown): value is WorldBookCategory =>
  typeof value === 'string' && (WORLD_BOOK_CATEGORIES as string[]).includes(value);

const isWorldBookScope = (value: unknown): value is WorldBookScope =>
  value === '全局' || value === '会话';

const normalizeKeywords = (keywords: unknown): string[] => {
  if (Array.isArray(keywords)) {
    return keywords
      .map(keyword => (typeof keyword === 'string' ? keyword.trim() : ''))
      .filter(Boolean);
  }

  if (typeof keywords === 'string' && keywords.trim().length > 0) {
    return keywords
      .split(',')
      .map(keyword => keyword.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizeEntry = (raw: Partial<WorldBookEntry> & { id?: string; title?: string }): WorldBookEntry => {
  const createdAt = typeof raw.createdAt === 'number' ? raw.createdAt : Date.now();
  const keywords = normalizeKeywords(raw.keywords);

  return {
    id: raw.id ?? `${createdAt}`,
    title: raw.title && raw.title.trim().length > 0 ? raw.title : '未命名词条',
    keywords,
    content: typeof raw.content === 'string' ? raw.content : '',
    enabled: raw.enabled !== false,
    createdAt,
    updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : createdAt,
    category: isWorldBookCategory(raw.category) ? raw.category : '设定',
    scope: isWorldBookScope(raw.scope) ? raw.scope : '全局',
    injectionCount: typeof raw.injectionCount === 'number' && raw.injectionCount >= 0 ? raw.injectionCount : 0,
    lastInjectedAt:
      typeof raw.lastInjectedAt === 'number' && Number.isFinite(raw.lastInjectedAt)
        ? raw.lastInjectedAt
        : null,
    pinned: Boolean(raw.pinned),
    note: typeof raw.note === 'string' ? raw.note : undefined,
  };
};

const sortEntries = (entries: WorldBookEntry[]): WorldBookEntry[] =>
  [...entries].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;

    const aTime = a.lastInjectedAt ?? a.updatedAt ?? a.createdAt;
    const bTime = b.lastInjectedAt ?? b.updatedAt ?? b.createdAt;

    return bTime - aTime;
  });

export const loadWorldBookEntries = async (): Promise<WorldBookEntry[]> => {
  try {
    const stored = await AsyncStorage.getItem(WORLDBOOK_STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    const normalized = parsed
      .map(item => {
        try {
          return normalizeEntry(item as Partial<WorldBookEntry>);
        } catch (error) {
          console.warn('世界书词条解析失败', error);
          return null;
        }
      })
      .filter((entry): entry is WorldBookEntry => entry !== null);

    return sortEntries(normalized);
  } catch (error) {
    console.error('读取世界书词条失败', error);
    return [];
  }
};

export const saveWorldBookEntries = async (entries: WorldBookEntry[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(WORLDBOOK_STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('保存世界书词条失败', error);
    throw error;
  }
};

export type CreateWorldBookEntryPayload = {
  title: string;
  keywords: string[];
  content: string;
  category?: WorldBookCategory;
  scope?: WorldBookScope;
  note?: string;
};

export const addWorldBookEntry = async (
  payload: CreateWorldBookEntryPayload,
): Promise<WorldBookEntry> => {
  const existing = await loadWorldBookEntries();
  const now = Date.now();

  const entry: WorldBookEntry = normalizeEntry({
    id: `${now}`,
    title: payload.title,
    keywords: payload.keywords,
    content: payload.content,
    enabled: true,
    createdAt: now,
    updatedAt: now,
    category: payload.category,
    scope: payload.scope,
    pinned: false,
    note: payload.note,
    injectionCount: 0,
    lastInjectedAt: null,
  });

  const updated = sortEntries([...existing, entry]);
  await saveWorldBookEntries(updated);
  return entry;
};

export const updateWorldBookEntry = async (
  id: string,
  patch: Partial<Omit<WorldBookEntry, 'id'>>,
): Promise<WorldBookEntry[] | null> => {
  const existing = await loadWorldBookEntries();
  let hasUpdated = false;
  const now = Date.now();

  const updated = existing.map(entry => {
    if (entry.id !== id) {
      return entry;
    }

    hasUpdated = true;
    const merged = {
      ...entry,
      ...patch,
      updatedAt: patch.updatedAt ?? now,
    } as WorldBookEntry;

    return merged;
  });

  if (!hasUpdated) {
    return null;
  }

  const sorted = sortEntries(updated.map(entry => normalizeEntry(entry)));
  await saveWorldBookEntries(sorted);
  return sorted;
};

export const toggleWorldBookEntry = async (id: string): Promise<WorldBookEntry[] | null> => {
  const existing = await loadWorldBookEntries();
  let hasUpdated = false;
  const now = Date.now();

  const updated = existing.map(entry => {
    if (entry.id !== id) {
      return entry;
    }

    hasUpdated = true;
    const enabled = !entry.enabled;
    return {
      ...entry,
      enabled,
      updatedAt: now,
      injectionCount: enabled ? entry.injectionCount + 1 : entry.injectionCount,
      lastInjectedAt: enabled ? now : entry.lastInjectedAt,
    } satisfies WorldBookEntry;
  });

  if (!hasUpdated) {
    return null;
  }

  const sorted = sortEntries(updated);
  await saveWorldBookEntries(sorted);
  return sorted;
};

export const deleteWorldBookEntry = async (id: string): Promise<WorldBookEntry[]> => {
  const existing = await loadWorldBookEntries();
  const filtered = existing.filter(entry => entry.id !== id);
  await saveWorldBookEntries(filtered);
  return filtered;
};

export const loadWorldBookSettings = async (): Promise<WorldBookSettings> => {
  try {
    const stored = await AsyncStorage.getItem(WORLDBOOK_SETTINGS_KEY);
    if (!stored) {
      return DEFAULT_SETTINGS;
    }

    const parsed = JSON.parse(stored) as WorldBookSettings;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
    };
  } catch (error) {
    console.error('读取世界书设置失败', error);
    return DEFAULT_SETTINGS;
  }
};

export const updateWorldBookSettings = async (
  patch: Partial<WorldBookSettings>,
): Promise<WorldBookSettings> => {
  const current = await loadWorldBookSettings();
  const merged = {
    ...current,
    ...patch,
  } satisfies WorldBookSettings;

  try {
    await AsyncStorage.setItem(WORLDBOOK_SETTINGS_KEY, JSON.stringify(merged));
  } catch (error) {
    console.error('保存世界书设置失败', error);
    throw error;
  }

  return merged;
};

export const clearWorldBookData = async (): Promise<void> => {
  await AsyncStorage.multiRemove([WORLDBOOK_STORAGE_KEY, WORLDBOOK_SETTINGS_KEY]);
};

