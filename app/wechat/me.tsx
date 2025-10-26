import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useLayoutEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  View,
} from 'react-native';
import type { Edge } from 'react-native-safe-area-context';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../../hooks/useThemeColors';

// 模拟用户信息
type UserInfo = {
  name: string;
  id: string;
  avatar: string;
  description: string;
};

const mockUserInfo: UserInfo = {
  name: '张三',
  id: 'zhangsan',
  avatar: 'https://via.placeholder.com/100x100',
  description: '这个人很懒，还没有写简介～'
};

// 功能列表项
type FeatureItem = {
  id: string;
  title: string;
  icon: string;
  iconColor: string;
  iconBgColor: string;
  rightText?: string; // 可选的右侧文字
  rightIcon?: string; // 可选的右侧图标
  badge?: number; // 可选的徽标数字
  route?: string; // 可选的跳转路由
};

// 顶部个人信息区域
const UserProfileCard = ({ userInfo, colors, onEditPress }: {
  userInfo: UserInfo;
  colors: any;
  onEditPress: () => void;
}) => {
  return (
    <View style={[styles.profileCard, { backgroundColor: colors.backgroundSecondary, borderBottomColor: colors.borderLight }]}>
      <TouchableOpacity style={styles.profileInfo} onPress={onEditPress}>
        <View style={[styles.avatar, { backgroundColor: colors.avatarBackground }]}>
          <Text style={styles.avatarText}>{userInfo.name.charAt(0)}</Text>
        </View>
        <View style={styles.userInfo}>
          <View style={styles.userNameContainer}>
            <Text style={[styles.userName, { color: colors.text }]}>{userInfo.name}</Text>
            <Ionicons name="qr-code" size={20} color={colors.textTertiary} style={styles.qrCodeIcon} />
          </View>
          <Text style={[styles.userId, { color: colors.textSecondary }]}>微信号: {userInfo.id}</Text>
          <Text style={[styles.userDescription, { color: colors.textSecondary }]} numberOfLines={2}>
            {userInfo.description || '点击头像完善个人介绍'}
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.rightArrow} onPress={onEditPress}>
        <Ionicons name="chevron-forward" size={24} color={colors.textTertiary} />
      </TouchableOpacity>
    </View>
  );
};

// 功能列表项组件
const FeatureListItem = ({
  item,
  colors,
  onPress
}: {
  item: FeatureItem;
  colors: any;
  onPress: () => void;
}) => {
  return (
    <TouchableOpacity style={[styles.featureItem, { borderBottomColor: colors.borderLight }]} onPress={onPress}>
      <View style={[styles.featureIcon, { backgroundColor: item.iconBgColor }]}>
        <Ionicons name={item.icon as any} size={24} color={item.iconColor} />
      </View>
      <Text style={[styles.featureTitle, { color: colors.text }]}>{item.title}</Text>
      <View style={styles.featureRight}>
        {item.rightText && <Text style={[styles.featureRightText, { color: colors.textSecondary }]}>{item.rightText}</Text>}
        {item.badge !== undefined && item.badge > 0 && (
          <View style={[styles.badge, { backgroundColor: colors.destructive }]}>
            <Text style={styles.badgeText}>{item.badge > 99 ? '99+' : item.badge}</Text>
          </View>
        )}
        {item.rightIcon ? (
          <Ionicons name={item.rightIcon as any} size={24} color={colors.textTertiary} />
        ) : (
          <Ionicons name="chevron-forward" size={24} color={colors.textTertiary} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const EditProfileModal = ({
  visible,
  colors,
  initialName,
  initialDescription,
  onClose,
  onSave,
}: {
  visible: boolean;
  colors: any;
  initialName: string;
  initialDescription: string;
  onClose: () => void;
  onSave: (name: string, description: string) => void;
}) => {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);

  useEffect(() => {
    if (visible) {
      setName(initialName);
      setDescription(initialDescription);
    }
  }, [visible, initialName, initialDescription]);

  const handleSave = () => {
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName) {
      Alert.alert('提示', '昵称不能为空');
      return;
    }

    onSave(trimmedName, trimmedDescription);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.editModalContainer}
      >
        <Pressable style={styles.editModalBackdrop} onPress={onClose} />
        <View style={[styles.editModalContent, { backgroundColor: colors.backgroundSecondary }]}> 
          <Text style={[styles.editModalTitle, { color: colors.text }]}>编辑个人信息</Text>
          <View style={styles.editFieldGroup}>
            <Text style={[styles.editLabel, { color: colors.textSecondary }]}>昵称</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="请输入昵称"
              placeholderTextColor={colors.placeholder}
              style={[styles.editInput, { color: colors.text, borderColor: colors.border }]}
            />
          </View>
          <View style={styles.editFieldGroup}>
            <Text style={[styles.editLabel, { color: colors.textSecondary }]}>个人简介</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="写点什么介绍自己吧"
              placeholderTextColor={colors.placeholder}
              style={[styles.editTextarea, { color: colors.text, borderColor: colors.border }]}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          <View style={styles.editModalActions}>
            <TouchableOpacity style={styles.editModalButton} onPress={onClose}>
              <Text style={[styles.editModalButtonText, { color: colors.textSecondary }]}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.editModalButton, styles.editModalSaveButton, { backgroundColor: colors.primary }]}
              onPress={handleSave}
            >
              <Text style={[styles.editModalButtonText, { color: '#fff' }]}>保存</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default function MeScreen() {
  const { colors, isDark } = useThemeColors();
  const navigation = useNavigation();
  const router = useRouter();
  const safeAreaInsets = useSafeAreaInsets();
  const [userInfo, setUserInfo] = useState<UserInfo>(mockUserInfo);
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  
  // 判断是否为iOS 26及以上系统
  const isIOS26OrAbove = Platform.OS === 'ios' && Number.parseInt(String(Platform.Version), 10) >= 26;
  
  // iOS 26+ 使用原生导航栏（已包含状态栏），不需要 top edge
  // iOS 26以下使用自定义导航栏，需要 top edge
  const safeAreaEdges: Edge[] = isIOS26OrAbove
    ? ['left', 'right', 'bottom']
    : ['top', 'left', 'right', 'bottom'];

  // 配置 iOS 26+ 的原生导航栏深色模式
  useLayoutEffect(() => {
    if (isIOS26OrAbove) {
      navigation.setOptions({
        title: '我',
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          color: colors.text,
        },
        headerShadowVisible: false,
      });
    }
  }, [isIOS26OrAbove, colors, navigation]);

  // 功能列表数据
  const featureSections = [
    {
      id: 'section1',
      items: [
        {
          id: 'posts',
          title: '朋友圈',
          icon: 'images',
          iconColor: '#63B3ED',
          iconBgColor: '#EBF8FF',
          route: '/wechat/me/posts'
        },
      ]
    },
    {
      id: 'section2',
      items: [
        {
          id: 'favorites',
          title: '收藏',
          icon: 'star',
          iconColor: '#F6AD55',
          iconBgColor: '#FFFAF0',
          rightText: '0个',
          route: '/wechat/me/favorites'
        },
        {
          id: 'albums',
          title: '相册',
          icon: 'albums',
          iconColor: '#4FD1C7',
          iconBgColor: '#F0FFF4',
          rightText: '0张',
          route: '/wechat/me/albums'
        },
        {
          id: 'cards',
          title: '卡包',
          icon: 'card',
          iconColor: '#9F7AEA',
          iconBgColor: '#F3E8FF',
          route: '/wechat/me/cards'
        },
        {
          id: 'emojis',
          title: '表情',
          icon: 'happy',
          iconColor: '#ED64A6',
          iconBgColor: '#FEE7F0',
          rightText: '0个',
          route: '/wechat/me/emojis'
        },
      ]
    },
    {
      id: 'section3',
      items: [
        {
          id: 'settings',
          title: '设置',
          icon: 'settings',
          iconColor: '#A0AEC0',
          iconBgColor: '#F7FAFC',
          route: '/wechat/me/settings'
        },
      ]
    }
  ];

  const handleOpenEditProfile = () => {
    setEditProfileVisible(true);
  };

  const handleSaveProfile = (name: string, description: string) => {
    setUserInfo(prev => ({ ...prev, name, description }));
    setEditProfileVisible(false);
    Alert.alert('已更新', '个人资料已保存');
  };

  // 处理功能项点击
  const handleFeaturePress = (item: FeatureItem) => {
    if (item.route) {
      router.push(item.route as any);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {/* 顶部导航栏 - iOS 26以下显示自定义导航栏 */}
        {!isIOS26OrAbove && (
          <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
            <View style={styles.headerCenter}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>我</Text>
            </View>
          </View>
        )}

        {/* 内容区域 */}
        <ScrollView style={styles.scrollView}>
        {/* 个人信息卡片 */}
          <UserProfileCard userInfo={userInfo} colors={colors} onEditPress={handleOpenEditProfile} />

          {/* 功能列表 */}
          {featureSections.map((section, sectionIndex) => (
            <View key={section.id} style={[styles.section, { backgroundColor: colors.backgroundSecondary }]}>
              {section.items.map((item, itemIndex) => (
                <FeatureListItem
                  key={item.id}
                  item={item}
                  colors={colors}
                  onPress={() => handleFeaturePress(item)}
                />
              ))}
            </View>
          ))}

          {/* 底部填充 */}
          <View style={{ height: 20 }} />
        </ScrollView>
        <EditProfileModal
          visible={editProfileVisible}
          colors={colors}
          initialName={userInfo.name}
          initialDescription={userInfo.description}
          onClose={() => setEditProfileVisible(false)}
          onSave={handleSaveProfile}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ededed',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#ededed',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#d9d9d9',
    position: 'relative',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  
  // 个人信息卡片样式
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 0.5,
  },
  profileInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#07C160',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  userInfo: {
    flex: 1,
  },
  userNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  qrCodeIcon: {
    marginLeft: 8,
  },
  userId: {
    fontSize: 14,
    color: '#666',
  },
  userDescription: {
    fontSize: 13,
    color: '#888',
    marginTop: 6,
    lineHeight: 18,
  },
  rightArrow: {
    paddingLeft: 16,
  },

  editModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  editModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  editModalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  editModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  editFieldGroup: {
    marginBottom: 16,
  },
  editLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  editInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
  },
  editTextarea: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 120,
  },
  editModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  editModalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
  },
  editModalSaveButton: {
    minWidth: 90,
    alignItems: 'center',
  },
  editModalButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  
  // 功能列表样式
  section: {
    marginTop: 12,
    backgroundColor: '#ffffff',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureTitle: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  featureRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  featureRightText: {
    fontSize: 14,
    color: '#999',
    marginRight: 8,
  },
  badge: {
    backgroundColor: '#FA5151',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
});