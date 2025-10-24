// 联系人数据模型和模拟数据

export interface Contact {
  id: string;
  name: string;
  avatar?: string;
  phone?: string;
  wechatId?: string;
  description?: string;
  initial: string; // 拼音首字母，用于排序和分组
  isStarred?: boolean;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

// 模拟联系人数据
export const mockContacts: Contact[] = [
  {
    id: '1',
    name: '张三',
    avatar: 'Z',
    phone: '13800138001',
    wechatId: 'zhangsan_wx',
    description: '同事，技术部',
    initial: 'Z',
    isStarred: true,
    lastMessage: '明天开会讨论项目进度',
    lastMessageTime: '10:30',
    unreadCount: 2
  },
  {
    id: '2',
    name: '李四',
    avatar: 'L',
    phone: '13800138002',
    wechatId: 'lisi_wx',
    description: '大学同学',
    initial: 'L',
    lastMessage: '周末一起吃饭吗？',
    lastMessageTime: '昨天',
    unreadCount: 0
  },
  {
    id: '3',
    name: '王五',
    avatar: 'W',
    phone: '13800138003',
    wechatId: 'wangwu_wx',
    description: '客户',
    initial: 'W',
    isStarred: true,
    lastMessage: '合同已发送，请查收',
    lastMessageTime: '星期一',
    unreadCount: 1
  },
  {
    id: '4',
    name: '赵六',
    avatar: 'Z',
    phone: '13800138004',
    wechatId: 'zhaoliu_wx',
    description: '朋友',
    initial: 'Z',
    lastMessage: '生日快乐！🎂',
    lastMessageTime: '上周',
    unreadCount: 0
  },
  {
    id: '5',
    name: '陈七',
    avatar: 'C',
    phone: '13800138005',
    wechatId: 'chenqi_wx',
    description: '家人',
    initial: 'C',
    isStarred: true,
    lastMessage: '周末回家吃饭',
    lastMessageTime: '星期三',
    unreadCount: 0
  },
  {
    id: '6',
    name: '刘八',
    avatar: 'L',
    phone: '13800138006',
    wechatId: 'liuba_wx',
    description: '同事，产品部',
    initial: 'L',
    lastMessage: '新功能需求文档已更新',
    lastMessageTime: '09:15',
    unreadCount: 3
  },
  {
    id: '7',
    name: '周九',
    avatar: 'Z',
    phone: '13800138007',
    wechatId: 'zhoujiu_wx',
    description: '朋友',
    initial: 'Z',
    lastMessage: '照片已发给你',
    lastMessageTime: '昨天',
    unreadCount: 0
  },
  {
    id: '8',
    name: '吴十',
    avatar: 'W',
    phone: '13800138008',
    wechatId: 'wushi_wx',
    description: '邻居',
    initial: 'W',
    lastMessage: '快递已帮你代收',
    lastMessageTime: '14:20',
    unreadCount: 0
  },
  {
    id: '9',
    name: '安迪',
    avatar: 'A',
    phone: '13800138009',
    wechatId: 'andy_wx',
    description: '朋友',
    initial: 'A',
    lastMessage: '下次见！',
    lastMessageTime: '上个月',
    unreadCount: 0
  },
  {
    id: '10',
    name: '贝拉',
    avatar: 'B',
    phone: '13800138010',
    wechatId: 'bella_wx',
    description: '朋友',
    initial: 'B',
    lastMessage: '假期照片',
    lastMessageTime: '上周',
    unreadCount: 0
  },
  {
    id: '11',
    name: '陈经理',
    avatar: 'C',
    phone: '13800138011',
    wechatId: 'chen_manager_wx',
    description: '上级领导',
    initial: 'C',
    isStarred: true,
    lastMessage: '明天上午10点开会',
    lastMessageTime: '16:45',
    unreadCount: 1
  },
  {
    id: '12',
    name: '丁医生',
    avatar: 'D',
    phone: '13800138012',
    wechatId: 'ding_doctor_wx',
    description: '家庭医生',
    initial: 'D',
    lastMessage: '体检报告已出',
    lastMessageTime: '星期二',
    unreadCount: 0
  }
];

// 通讯录功能列表
export interface ContactFeature {
  id: string;
  name: string;
  icon: string;
  bgColor?: string;
  iconColor?: string;
  route?: string;
}

export const contactFeatures: ContactFeature[] = [
  {
    id: 'group-chats',
    name: '群聊',
    icon: 'people',
    bgColor: '#007aff',
    iconColor: '#ffffff',
    route: '/wechat/group-chats'
  }
];

// 按首字母分组联系人
export const groupContactsByInitial = (contacts: Contact[]): Record<string, Contact[]> => {
  const grouped: Record<string, Contact[]> = {};
  
  contacts.forEach(contact => {
    const initial = contact.initial.toUpperCase();
    if (!grouped[initial]) {
      grouped[initial] = [];
    }
    grouped[initial].push(contact);
  });
  
  // 对每个分组内的联系人按名字排序
  Object.keys(grouped).forEach(initial => {
    grouped[initial].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
  });
  
  // 返回按字母顺序排序的分组
  const sortedGrouped: Record<string, Contact[]> = {};
  Object.keys(grouped).sort().forEach(initial => {
    sortedGrouped[initial] = grouped[initial];
  });
  
  return sortedGrouped;
};

// 获取所有首字母
export const getAllInitials = (contacts: Contact[]): string[] => {
  const initials = new Set(contacts.map(contact => contact.initial.toUpperCase()));
  return Array.from(initials).sort();
};

// 搜索联系人
export const searchContacts = (contacts: Contact[], query: string): Contact[] => {
  if (!query.trim()) return contacts;
  
  const lowerQuery = query.toLowerCase();
  return contacts.filter(contact => 
    contact.name.toLowerCase().includes(lowerQuery) ||
    contact.wechatId?.toLowerCase().includes(lowerQuery) ||
    contact.phone?.includes(query)
  );
};