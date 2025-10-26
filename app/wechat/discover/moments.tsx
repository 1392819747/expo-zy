import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Pressable,
  Easing,
  TextInput,
  KeyboardAvoidingView,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../../../hooks/useThemeColors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 平台检测
const isIOS = Platform.OS === 'ios';
const isAndroid = Platform.OS === 'android';
const isIOS26OrAbove = Platform.OS === 'ios' && Number.parseInt(String(Platform.Version), 10) >= 26;

// 朋友圈动态项类型
type MomentItem = {
  id: string;
  userName: string;
  userAvatar: string;
  content: string;
  time: string;
  images?: string[];
  likes: Array<{ id: string; name: string; avatar?: string }>;
  comments: Array<{ id: string; name: string; content: string; replyTo?: string; avatar?: string }>;
  liked: boolean;
  location?: string;
};

// 模拟朋友圈数据
const mockMoments: MomentItem[] = [
  {
    id: '1',
    userName: '张三',
    userAvatar: 'https://via.placeholder.com/50x50',
    content: '今天天气真好，出去走走！',
    time: '2 小时前',
    images: ['https://picsum.photos/400/400?random=1'],
    likes: [
      { id: '1', name: '李四' },
      { id: '2', name: '王五' },
      { id: '3', name: '赵六' },
      { id: '4', name: '孙七' },
      { id: '5', name: '周八' }
    ],
    comments: [
      { id: '1', name: '李四', content: '好看！' },
      { id: '2', name: '王五', content: '哪里呀？' }
    ],
    liked: false
  },
  {
    id: '2',
    userName: '李四',
    userAvatar: 'https://via.placeholder.com/50x50',
    content: '刚刚完成了一个新项目，感觉很有成就感！',
    time: '5 小时前',
    images: [
      'https://picsum.photos/400/400?random=2',
      'https://picsum.photos/400/400?random=3',
      'https://picsum.photos/400/400?random=4'
    ],
    likes: [
      { id: '1', name: '张三' },
      { id: '2', name: '王五' },
      { id: '3', name: '赵六' },
      { id: '4', name: '孙七' },
      { id: '5', name: '周八' },
      { id: '6', name: '吴九' },
      { id: '7', name: '郑十' }
    ],
    comments: [
      { id: '1', name: '王五', content: '厉害了！' },
      { id: '2', name: '赵六', content: '恭喜恭喜' },
      { id: '3', name: '孙七', content: '什么时候请客？' },
      { id: '4', name: '周八', content: '向你学习' },
      { id: '5', name: '吴九', content: '太棒了' }
    ],
    liked: true
  },
  {
    id: '3',
    userName: '王五',
    userAvatar: 'https://via.placeholder.com/50x50',
    content: '周末和家人一起吃饭，很开心',
    time: '昨天',
    location: '北京',
    images: [
      'https://picsum.photos/400/400?random=5',
      'https://picsum.photos/400/400?random=6'
    ],
    likes: [
      { id: '1', name: '张三' },
      { id: '2', name: '李四' },
      { id: '3', name: '赵六' },
      { id: '4', name: '孙七' }
    ],
    comments: [
      { id: '1', name: '张三', content: '看起来很不错' },
      { id: '2', name: '李四', content: '下次带我一个' }
    ],
    liked: false
  }
];

// 微信绿色
const WECHAT_GREEN = "#1AAD19";

// 朋友圈操作菜单组件
function MomentsActionMenu({ visible, onClose, onLike, onComment, liked }: {
  visible: boolean;
  onClose: () => void;
  onLike: () => void;
  onComment: () => void;
  liked: boolean;
}) {
  const widthAnim = useRef(new Animated.Value(0)).current; // 胶囊宽度动画
  const opacity = useRef(new Animated.Value(0)).current;   // 内容淡入

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(widthAnim, {
          toValue: 150, // 调整胶囊最终宽度，从170减少到150，因为我们移除了中间的空隙
          duration: 180,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 140,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(widthAnim, {
          toValue: 0,
          duration: 180,
          easing: Easing.in(Easing.quad),
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [visible]);

  // 胶囊主体
  const Capsule = (
    <Animated.View style={[styles.menuCapsule, { width: widthAnim }]}>
      <Animated.View style={[styles.menuRow, { opacity }]}>
        <Pressable
          style={styles.menuItem}
          onPress={() => {
            onLike();
            onClose();
          }}
        >
          <Ionicons
            name={liked ? "heart" : "heart-outline"}
            size={18}
            style={styles.menuIcon}
          />
          {/* 为点赞文字设置固定宽度，避免影响其他元素 */}
          <Text style={[styles.menuText, liked && styles.menuTextLiked, { width: 40 }]}>
            {liked ? "取消" : "赞"}
          </Text>
        </Pressable>

        <View style={styles.divider} />

        <Pressable
          style={styles.menuItem}
          onPress={() => {
            onComment();
            onClose();
          }}
        >
          <Ionicons name="chatbubble-outline" size={18} style={styles.menuIcon} />
          <Text style={styles.menuText}>评论</Text>
        </Pressable>
      </Animated.View>

      {/* 右侧小三角，指向"..."按钮 */}
      <View style={styles.arrowWrapper}>
        <View style={styles.arrow} />
      </View>
    </Animated.View>
  );

  if (!visible) return null;

  return (
    <>
      {/* 透明遮罩：点击空白处收起菜单 */}
      <Pressable 
        style={StyleSheet.absoluteFill} 
        onPress={onClose}
        // 防止事件冒泡
        onStartShouldSetResponder={() => true}
        onResponderGrant={onClose}
      />
      {Capsule}
    </>
  );
}

// 朋友圈头像组件（封面用的）
const MomentsAvatar = () => (
  <View style={styles.momentsAvatar}>
    <Text style={styles.momentsAvatarName}>当前用户</Text>
    <View style={styles.momentsAvatarContainer}>
      <Text style={styles.momentsAvatarText}>我</Text>
    </View>
  </View>
);

// 头像组件
const AvatarComponent = ({ userName, userAvatar }: { userName: string; userAvatar: string }) => {
  return (
    <View style={styles.momentsCardAvatar}>
      <View style={styles.momentsCardAvatarImage}>
        <Text style={styles.avatarText}>{userName.charAt(0)}</Text>
      </View>
    </View>
  );
};

// 朋友圈动态卡片组件
const MomentsCard = ({ momentData, onLike, onComment, onImagePress }: {
  momentData: MomentItem;
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  onImagePress?: (imgUri: string) => void;
}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [liked, setLiked] = useState(momentData.liked);

  const toggleMenu = () => setMenuVisible((v) => !v);
  
  // 更新点赞状态
  useEffect(() => {
    setLiked(momentData.liked);
  }, [momentData.liked]);

  return (
    <View style={styles.momentsCardWrapper}>
      <AvatarComponent userName={momentData.userName} userAvatar={momentData.userAvatar} />
      <View style={styles.momentsCardContentWrapper}>
        {/* 用户名 */}
        <Text style={styles.momentsCardTextBlue}>{momentData.userName}</Text>
        <View style={styles.momentsCardContent}>
          <Text style={styles.momentsCardTextContent}>
            {momentData.content}
          </Text>
          {/* 图片网格 */}
          {momentData.images && momentData.images.length > 0 && (
            <MomentsImg imgList={momentData.images} onImagePress={onImagePress} />
          )}
        </View>
        
        {/* 点赞和评论 */}
        {renderLikeAndComment(momentData)}
        
        {/* 操作按钮 */}
        <View style={styles.momentsCardBottom}>
          <Text style={styles.momentsCardTime}>{momentData.time}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* 使用新的三点菜单替换原有的操作按钮 */}
            <View style={{ width: 20 }} />
            <View style={{ position: 'relative' }}>
              <TouchableOpacity style={styles.moreBtn} onPress={toggleMenu}>
                <Ionicons name="ellipsis-horizontal" size={20} color="#888" />
              </TouchableOpacity>
              
              {/* 菜单放在同一层，相对定位到"..."按钮左侧 */}
              <View pointerEvents="box-none" style={{
                position: 'absolute',
                right: 42,
                top: -2,
                bottom: 0,
                justifyContent: 'center',
                alignItems: 'flex-end',
                zIndex: 1000,
                width: 200,
              }}>
                <MomentsActionMenu
                  visible={menuVisible}
                  liked={liked}
                  onClose={() => setMenuVisible(false)}
                  onLike={() => {
                    setLiked(!liked);
                    onLike(momentData.id);
                  }}
                  onComment={() => {
                    onComment(momentData.id);
                  }}
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

// 图片组件
const MomentsImg = ({ imgList, onImagePress }: { imgList: string[]; onImagePress?: (imgUri: string) => void }) => {
  if (!imgList || imgList.length === 0) return null;

  return (
    <View style={styles.imageGridContainer}>
      {imgList.map((imgUri, index) => (
        <TouchableOpacity
          key={index}
          style={styles.imageItem}
          onPress={() => onImagePress && onImagePress(imgUri)}
        >
          <Image
            source={{ uri: imgUri }}
            style={styles.imageInner}
            resizeMode="cover"
            onError={() => console.log('图片加载失败:', imgUri)}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

// 点赞和评论渲染函数
const renderLikeAndComment = (moment: MomentItem) => {
  if (moment.likes.length === 0 && moment.comments.length === 0) return null;

  const allItems: Array<{
    type: 'like' | 'comment';
    id: string;
    content: string;
    name?: string;
    replyTo?: string;
  }> = [];

  if (moment.likes.length > 0) {
    allItems.push({
      type: 'like',
      id: 'like-header',
      content: moment.likes.map(l => l.name).join(', ')
    });
  }

  moment.comments.forEach(comment => {
    allItems.push({
      type: 'comment',
      id: comment.id,
      content: comment.content,
      name: comment.name,
      replyTo: comment.replyTo
    });
  });

  return (
    <View style={styles.momentsCardComment}>
      {allItems.map((item, index) => (
        <View key={item.id || `item-${index}`} style={styles.likeCommentItem}>
          {item.type === 'like' ? (
            <View style={styles.likeSection}>
              <Ionicons name="heart-outline" size={16} color="#1877f2" style={styles.likeIcon} />
              <Text style={[styles.likeText, { color: '#1877f2' }]} numberOfLines={0}>
                {item.content}
              </Text>
            </View>
          ) : (
            item.type === 'comment' && (
              <TouchableOpacity style={styles.commentItem}>
                <Text style={[styles.commentUser, { color: '#1877f2' }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={[styles.commentText, { color: '#333' }]} numberOfLines={0}>
                  {item.replyTo ? ` 回复 ${item.replyTo}` : ''}: {item.content}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>
      ))}
    </View>
  );
};

export default function MomentsScreen() {
  const { colors, isDark } = useThemeColors();
  const navigation = useNavigation();
  const router = useRouter();
  const [moments, setMoments] = useState<MomentItem[]>(mockMoments);
  const [scrollY] = useState(new Animated.Value(1));
  const insets = useSafeAreaInsets();
  const [commentModalVisible, setCommentModalVisible] = useState(false); // 添加评论模态框状态
  const [currentCommentId, setCurrentCommentId] = useState<string | null>(null); // 添加当前评论的动态ID
  const [commentText, setCommentText] = useState(''); // 添加评论文本状态
  
  // 头部透明度动画 - 用于控制顶部标题栏的显示/隐藏
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const currentUser = '当前用户';

  const handleLike = (id: string) => {
    // 添加触觉反馈
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    setMoments(prev => prev.map(moment => {
      if (moment.id === id) {
        const isLiked = moment.likes.some(like => like.name === currentUser);
        let newLikes = [...moment.likes];
        
        if (isLiked) {
          newLikes = newLikes.filter(like => like.name !== currentUser);
          // 取消点赞的反馈
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          newLikes = [...newLikes, { id: `${Date.now()}`, name: currentUser }];
          // 点赞的反馈
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        
        return { ...moment, likes: newLikes, liked: !isLiked };
      }
      return moment;
    }));
  };

  const handleAddComment = (id: string, replyTo?: string) => {
    // 添加触觉反馈
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // 设置当前评论的动态ID并显示评论模态框
    setCurrentCommentId(id);
    setCommentModalVisible(true);
    setCommentText('');
    
    console.log(`添加评论到动态: ${id}, 回复: ${replyTo || '动态'}`);
  };

  const handleImagePress = (imgUri: string) => {
    // 添加触觉反馈
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // 使用Alert来显示图片预览提示
    Alert.alert(
      '图片预览',
      `图片地址: ${imgUri}\n\n(此版本暂不支持图片预览)`,
      [
        { text: '确定', style: 'default' }
      ]
    );
    console.log('查看图片:', imgUri);
    // 这里可以添加图片预览逻辑，比如打开模态框
  };

  // 提交评论
  const submitComment = () => {
    if (commentText.trim() && currentCommentId) {
      // 这里可以添加实际的评论提交逻辑
      console.log(`提交评论: ${commentText} 到动态: ${currentCommentId}`);
      Alert.alert('评论成功', `您已评论: ${commentText}`);
      
      // 关闭模态框并清空输入框
      setCommentModalVisible(false);
      setCommentText('');
    }
  };

  // 取消评论
  const cancelComment = () => {
    setCommentModalVisible(false);
    setCommentText('');
  };

  return (
    // 移除容器的背景色设置，让页面全屏显示
    <View style={styles.container}>
      {/* 背景图区域的返回和相机按钮 - 始终显示 */}
      <View 
        style={[
          styles.backgroundButtonContainer,
          { 
            // 去掉所有设备的安全区域处理，实现沉浸式体验
            paddingTop: 0,
            top: 0,
            // 让背景图上的按钮向下一些，避免与状态栏重叠
            marginTop: 50,
          }
        ]}
      >
        <TouchableOpacity
          style={styles.backgroundHeaderButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.backgroundHeaderButton}
          onPress={() => console.log('打开相机')}
        >
          <Ionicons name="camera" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      {/* 顶部标题栏 - 滚动时显示，增加高度 */}
      <Animated.View 
        style={[
          styles.headerOverlay,
          { 
            opacity: headerOpacity,
            // 去掉所有设备的安全区域处理，实现沉浸式体验
            paddingTop: 0,
            top: 0,
          }
        ]}
      >
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>朋友圈</Text>
        
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => console.log('打开相机')}
        >
          <Ionicons name="camera" size={24} color="#000" />
        </TouchableOpacity>
      </Animated.View>
      
      <ScrollView
        style={styles.scrollView}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        showsVerticalScrollIndicator={false}
        // 为所有设备正确处理安全区域
        contentContainerStyle={{
          // 所有设备都需要额外的padding来避免内容被底部安全区域遮挡
          paddingBottom: insets.bottom,
          // 去掉所有设备的顶部安全区域处理
          paddingTop: 0,
          // 为所有设备设置背景色，确保底部安全区域颜色一致
          backgroundColor: '#fff',
        }}
      >
        {/* 背景图片 - 移除不必要的paddingTop */}
        <View style={styles.headerCover}>
          <Image
            source={{ uri: 'https://img1.baidu.com/it/u=713295211,1805964126&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=281' }}
            style={styles.headerBackground}
            resizeMode="cover"
          />
        </View>

        {/* 个人信息区域 */}
        <MomentsAvatar />

        {/* 空白区域，避免头像与动态内容重叠 */}
        <View style={{ height: 50, backgroundColor: '#fff' }} />

        {/* 动态列表 */}
        {moments.map((moment, index) => (
          <MomentsCard
            key={moment.id}
            momentData={moment}
            onLike={handleLike}
            onComment={handleAddComment}
            onImagePress={handleImagePress}
          />
        ))}
        
        {/* 
          移除底部填充，避免在安卓设备上出现多余的状态栏
          如果需要底部间距，应该使用安全区域insets.bottom来处理 
        */}
      </ScrollView>

      {/* 评论输入模态框 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={commentModalVisible}
        onRequestClose={cancelComment}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.commentModalContainer}
        >
          <View style={styles.commentModalOverlay} onStartShouldSetResponder={() => true} onResponderGrant={cancelComment}>
            <View style={styles.commentModalContent} onStartShouldSetResponder={() => true}>
              <View style={styles.commentInputContainer}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="请输入评论..."
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline={true}
                  autoFocus={true}
                  onSubmitEditing={submitComment}
                />
                <View style={styles.commentButtonContainer}>
                  <TouchableOpacity style={styles.commentCancelButton} onPress={cancelComment}>
                    <Text style={styles.commentButtonText}>取消</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.commentSubmitButton, !commentText.trim() && styles.commentSubmitButtonDisabled]} 
                    onPress={submitComment}
                    disabled={!commentText.trim()}
                  >
                    <Text style={styles.commentButtonText}>发送</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // 移除背景色，让页面全屏显示
  },
  scrollView: {
    flex: 1,
    // 移除背景色
  },
  headerCover: {
    height: 360,
    position: 'relative',
    overflow: 'hidden',
    // 移除paddingTop，避免在iOS上出现多余空白
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  // 背景图上的按钮容器
  backgroundButtonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 9,
    paddingTop: 0,
    height: 44, // 增加高度
  },
  backgroundHeaderButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    // 统一处理顶部间距，不再区分安卓和iOS
    paddingTop: 0,
    zIndex: 10,
    // 添加背景色以确保按钮可见
    backgroundColor: '#fff',
    // 添加阴影效果
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    height: 90, // 增加标题栏高度到90px
  },
  headerButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    // 让按钮内容向下更多一些，增加marginTop值
    marginTop: 50,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    // 让标题向下更多一些，增加marginTop值
    marginTop: 50,
  },
  momentsAvatar: {
    position: 'absolute',
    top: 315, // 进一步上移，让用户名也更高一点
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 5,
  },
  momentsAvatarName: {
    fontSize: 18,
    color: '#fff',
    marginRight: 12,
    fontWeight: '600',
    marginTop: -8, // 上移用户名
  },
  momentsAvatarContainer: {
    width: 75,
    height: 75,
    borderRadius: 4,
    backgroundColor: '#1E88E5', // 改为蓝色背景
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  momentsAvatarText: {
    fontSize: 24,
    color: '#fff', // 改为白色文字
    fontWeight: '600',
  },
  momentsCardWrapper: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
  },
  momentsCardAvatar: {
    marginRight: 12,
    width: 46,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  momentsCardAvatarImage: {
    width: 46,
    height: 46,
    borderRadius: 4,
    backgroundColor: '#07C160', // 添加背景色
    justifyContent: 'center',
    alignItems: 'center',
  },
  momentsCardContentWrapper: {
    flex: 1,
  },
  momentsCardTextBlue: {
    color: '#1877f2',
    fontWeight: 'bold',
    fontSize: 16,
  },
  momentsCardContent: {
    marginTop: 4,
  },
  momentsCardTextContent: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
    marginBottom: 8,
  },
  imageGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 8,
  },
  imageItem: {
    width: 80,
    height: 80,
    borderRadius: 4,
    overflow: 'hidden',
  },
  imageInner: {
    width: '100%',
    height: '100%',
  },
  momentsCardComment: {
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: '#f8f8f8',
    borderTopWidth: 0.5,
    borderTopColor: '#f0f0f0',
    borderStyle: 'solid',
    marginBottom: 8,
    // 添加以下样式以防止内容超出卡片边界
    flexWrap: 'wrap',
    maxWidth: '100%',
  },
  likeCommentItem: {
    marginBottom: 6,
    // 添加以下样式以防止内容超出卡片边界
    flexWrap: 'wrap',
    maxWidth: '100%',
  },
  likeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    // 添加以下样式以防止内容超出卡片边界
    flexWrap: 'wrap',
    maxWidth: '100%',
  },
  likeIcon: {
    marginRight: 6,
  },
  likeText: {
    fontSize: 15,
    lineHeight: 20,
    // 添加以下样式以防止文本超出边界
    flexWrap: 'wrap',
    maxWidth: '100%',
  },
  commentItem: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 8,
    // 添加以下样式以防止内容超出卡片边界
    flexWrap: 'wrap',
    maxWidth: '100%',
  },
  commentUser: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    // 添加以下样式以防止文本超出边界
    flexWrap: 'wrap',
    maxWidth: '100%',
  },
  commentText: {
    fontSize: 15,
    lineHeight: 20,
    // 添加以下样式以防止文本超出边界
    flexWrap: 'wrap',
    maxWidth: '100%',
  },
  momentsCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    position: 'relative', // 确保子元素可以绝对定位
  },
  momentsCardTime: {
    color: '#888',
    fontSize: 14,
  },
  momentsCardBottomImg: {
    flexDirection: 'row',
    alignItems: 'center',
    // 使用 marginLeft 来替代 gap 实现间距
  },
  // 头像样式
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  // 三点菜单相关样式
  moreBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F0F0',
  },
  menuCapsule: {
    height: 38,
    backgroundColor: '#2F2F2F',
    borderRadius: 6,
    flexDirection: 'row',
    overflow: 'visible',
  },
  menuRow: {
    // 移除 flex: 1，改为使用 flexDirection: 'row' 和 alignItems: 'center'
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    height: '100%',
  },
  menuIcon: { 
    marginRight: 6, 
    color: '#fff' 
  },
  menuText: { 
    color: '#fff', 
    fontSize: 14 
  },
  menuTextLiked: { 
    color: WECHAT_GREEN, 
    fontWeight: '600' 
  },
  divider: {
    width: 1,
    height: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: 6,
  },
  arrowWrapper: {
    position: 'absolute',
    right: -6,
    top: '50%',
    marginTop: -6,
    width: 12,
    height: 12,
    overflow: 'visible',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    width: 10,
    height: 10,
    backgroundColor: '#2F2F2F',
    transform: [{ rotate: '45deg' }],
    borderRadius: 2,
  },
  // 评论模态框相关样式
  commentModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  commentModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
  },
  commentModalContent: {
    backgroundColor: 'white',
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  commentInputContainer: {
    flexDirection: 'column',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  commentButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  commentCancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 12,
  },
  commentSubmitButton: {
    backgroundColor: '#1877f2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  commentSubmitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  commentButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '500',
  },
});