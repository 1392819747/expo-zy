// 用户信息模型
export interface UserProfile {
  name: string;
  wechatId: string;
  avatar?: string;
  region: string;
  signature: string;
}

// 默认用户信息
export const defaultUserProfile: UserProfile = {
  name: '张三',
  wechatId: 'zhangsan',
  region: '中国大陆',
  signature: '',
};

// 简单的内存存储（实际项目中应该使用 AsyncStorage）
let currentUserProfile: UserProfile = { ...defaultUserProfile };

// 获取用户信息
export const getUserProfile = (): UserProfile => {
  return { ...currentUserProfile };
};

// 更新用户信息
export const updateUserProfile = (profile: Partial<UserProfile>): void => {
  currentUserProfile = {
    ...currentUserProfile,
    ...profile,
  };
};

// 重置用户信息
export const resetUserProfile = (): void => {
  currentUserProfile = { ...defaultUserProfile };
};
