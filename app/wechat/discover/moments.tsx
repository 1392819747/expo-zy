import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { Easing, runOnJS, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  likes: { id: string; name: string; avatar?: string }[];
  comments: { id: string; name: string; content: string; replyTo?: string; avatar?: string }[];
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

// 样式定义 - 移到组件之前
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // 移除背景色，让页面全屏显示
    paddingTop: 0, // 完全移除顶部padding
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
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
  singleImageWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    maxWidth: SCREEN_WIDTH * 0.7,
    maxHeight: SCREEN_WIDTH * 0.75,
    backgroundColor: '#f4f4f4',
    marginBottom: 8,
  },
  singleImage: {
    width: '100%',
    aspectRatio: 4 / 3,
  },
  multiImageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  multiImageItem: {
    borderRadius: 6,
    overflow: 'hidden',
    width: (SCREEN_WIDTH - 32 - 46 - 18) / 3,
    height: (SCREEN_WIDTH - 32 - 46 - 18) / 3,
    backgroundColor: '#f4f4f4',
  },
  multiImage: {
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
  imagePreviewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  imagePreview: {
    width: '100%',
    height: '80%',
  },
  imagePreviewIndex: {
    position: 'absolute',
    bottom: 40,
    color: '#fff',
    fontSize: 14,
  },
});

// 朋友圈操作菜单组件（使用RNGH + Reanimated重构）
function MomentsActionMenu({ visible, onClose, onLike, onComment, liked, position }: {
  visible: boolean;
  onClose: () => void;
  onLike: () => void;
  onComment: () => void;
  liked: boolean;
  position: { x: number; y: number } | null;
}) {
  const insets = useSafeAreaInsets();
  const menuWidth = 150;

  // 使用Reanimated动画值
  const [menuVisible, setMenuVisible] = useState(visible);
  const [menuOpacity, setMenuOpacity] = useState(0);
  const [menuScale, setMenuScale] = useState(0.8);

  // 计算菜单位置 - 根据平台调整菜单位置
  const computedLeft = position
    ? Math.min(Math.max(position.x - menuWidth - 12, 12), SCREEN_WIDTH - menuWidth - 12)
    : 0;
  const computedTop = position ? Math.max(60, position.y + (isAndroid ? 20 : -20)) : 0; // 安卓向下偏移20，iOS向上偏移20

  // Reanimated样式
  const menuStyle = useAnimatedStyle(() => ({
    opacity: withTiming(menuOpacity, { duration: 140 }),
    transform: [{
      scale: withTiming(menuScale, {
        duration: 180,
        easing: Easing.out(Easing.quad)
      })
    }],
  }));

  // 外部点击手势
  const tapGesture = Gesture.Tap()
    .onStart(() => {
      runOnJS(onClose)();
    })
    .runOnJS(true);

  // 滚动手势（与ScrollView协调）
  const panGesture = Gesture.Pan()
    .onStart(() => {
      runOnJS(onClose)();
    })
    .runOnJS(true);

  // 同时识别点击和滚动手势
  const combinedGesture = Gesture.Simultaneous(tapGesture, panGesture);

  useEffect(() => {
    if (visible) {
      setMenuVisible(true);
      // 延迟设置动画值以确保DOM渲染完成
      setTimeout(() => {
        setMenuOpacity(1);
        setMenuScale(1);
      }, 16);
    } else {
      setMenuOpacity(0);
      setMenuScale(0.8);
      setTimeout(() => {
        setMenuVisible(false);
      }, 180);
    }
  }, [visible]);

  if (!menuVisible || !position) return null;

  return (
    <GestureDetector gesture={combinedGesture}>
      <View style={[StyleSheet.absoluteFill, { paddingBottom: isAndroid ? insets.bottom : 0 }]} pointerEvents="box-none">
        {/* 全屏手势检测区域 */}
        <View style={[StyleSheet.absoluteFill, { pointerEvents: 'auto' }]} />

        {/* 菜单胶囊 */}
        <Animated.View
          style={[
            styles.menuCapsule,
            {
              width: menuWidth,
              position: 'absolute',
              left: computedLeft,
              top: computedTop,
            },
            menuStyle
          ]}
          pointerEvents="box-none"
        >
          <View style={styles.menuRow}>
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
              <Text style={[styles.menuText, liked && styles.menuTextLiked, { width: 35 }]}>
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
              <Text style={[styles.menuText, { width: 50 }]}>
                评论
              </Text>
            </Pressable>
          </View>

          {/* 右侧小三角，指向"..."按钮 */}
          <View style={styles.arrowWrapper}>
            <View style={styles.arrow} />
          </View>
        </Animated.View>
      </View>
    </GestureDetector>
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
const MomentsCard = ({
  momentData,
  onLike,
  onComment,
  onImagePress,
  isMenuOpen,
  onOpenMenu,
  onCloseMenu,
}: {
  momentData: MomentItem;
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  onImagePress?: (momentId: string, images: string[], imgUri: string, index: number) => void;
  isMenuOpen: boolean;
  onOpenMenu: (id: string, position: { x: number; y: number }) => void;
  onCloseMenu: () => void;
}) => {
  const moreBtnRef = useRef<View>(null);

  const toggleMenu = () => {
    if (isMenuOpen) {
      onCloseMenu();
      return;
    }

    if (moreBtnRef.current) {
      moreBtnRef.current.measureInWindow((x, y, width, height) => {
        onOpenMenu(momentData.id, { x, y: y + height / 2 });
      });
    }
  };
  
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
            <MomentsImg
              momentId={momentData.id}
              imgList={momentData.images}
              onImagePress={onImagePress}
            />
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
            <TouchableOpacity ref={moreBtnRef} style={styles.moreBtn} onPress={toggleMenu}>
              <Ionicons name="ellipsis-horizontal" size={20} color="#888" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

// 图片组件
const MomentsImg = ({
  momentId,
  imgList,
  onImagePress,
}: {
  momentId: string;
  imgList: string[];
  onImagePress?: (momentId: string, images: string[], imgUri: string, index: number) => void;
}) => {
  if (!imgList || imgList.length === 0) return null;
  const imageCount = imgList.length;

  if (imageCount === 1) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.singleImageWrapper}
        onPress={() => onImagePress && onImagePress(momentId, imgList, imgList[0], 0)}
      >
        <Image
          source={{ uri: imgList[0] }}
          style={styles.singleImage}
          resizeMode="cover"
          onError={() => console.log('图片加载失败:', imgList[0])}
        />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.multiImageGrid}>
      {imgList.map((imgUri, index) => (
        <TouchableOpacity
          key={index}
          activeOpacity={0.8}
          style={styles.multiImageItem}
          onPress={() => onImagePress && onImagePress(momentId, imgList, imgUri, index)}
        >
          <Image
            source={{ uri: imgUri }}
            style={styles.multiImage}
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

  const allItems: {
    type: 'like' | 'comment';
    id: string;
    content: string;
    name?: string;
    replyTo?: string;
  }[] = [];

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
}

function MomentsScreen() {
  const router = useRouter();
  const [moments, setMoments] = useState<MomentItem[]>(mockMoments);
  const insets = useSafeAreaInsets();
  const [commentModalVisible, setCommentModalVisible] = useState(false); // 添加评论模态框状态
  const [currentCommentId, setCurrentCommentId] = useState<string | null>(null); // 添加当前评论的动态ID
  const [commentText, setCommentText] = useState(''); // 添加评论文本状态
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [previewImage, setPreviewImage] = useState<{
    uri: string;
    index: number;
    images: string[];
    momentId: string;
  } | null>(null);

  // 添加滚动偏移量状态来控制标题显示
  const [scrollY, setScrollY] = useState(0);

  // 头部透明度动画 - 用于控制顶部标题栏的显示/隐藏
  const headerOpacity = { opacity: 1 }; // 暂时简化，避免复杂的Animated API

  // insets 变量已经在第863行声明，这里不需要重复声明

  const currentUser = '当前用户';

  const currentActiveMoment = useMemo(() => {
    if (!activeMenuId) {
      return null;
    }
    return moments.find(moment => moment.id === activeMenuId) ?? null;
  }, [activeMenuId, moments]);

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

    setActiveMenuId(null);
    // 设置当前评论的动态ID并显示评论模态框
    setCurrentCommentId(id);
    setCommentModalVisible(true);
    setCommentText('');

    console.log(`添加评论到动态: ${id}, 回复: ${replyTo || '动态'}`);
  };

  const handleImagePress = (momentId: string, images: string[], imgUri: string, index: number) => {
    // 添加触觉反馈
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setPreviewImage({ uri: imgUri, index, images, momentId });
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
    <>
      {/* 移除容器的背景色设置，让页面全屏显示，完全去除顶部安全区 */}
      <View style={[styles.container, { paddingTop: 0, marginTop: 0 }]}>
      {/* 背景图区域的顶部安全区域容器（只在背景图状态时显示） */}
      {scrollY <= 100 && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: insets.top,
            backgroundColor: 'transparent',
            zIndex: 10,
          }}
        />
      )}
      
      {/* 统一的标题栏 - 根据滚动位置动态显示/隐藏 */}
      <View
        style={[
          styles.headerOverlay,
          {
            // 标题栏在安全区域下面
            paddingTop: scrollY <= 100 ? insets.top : 0,
            paddingHorizontal: 24,
            top: 0,
            // 滚动到内容区域时显示背景，背景图区域时透明
            backgroundColor: scrollY > 100 ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
            // 透明状态下移除阴影和高度，避免出现方块
            shadowOpacity: scrollY > 100 ? 0.1 : 0,
            shadowOffset: {
              width: 0,
              height: scrollY > 100 ? 2 : 0,
            },
            shadowRadius: scrollY > 100 ? 3.84 : 0,
            elevation: scrollY > 100 ? 5 : 0,
            height: scrollY > 100 ? 110 : 44,
          }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.headerButton,
            {
              // 统一在scrollY > 100时改变样式，封面模式下往下移动更多
              marginTop: scrollY > 100 ? 50 : (isAndroid ? 65 : 45),
            }
          ]}
          onPress={() => router.back()}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={scrollY > 100 ? '#000' : '#fff'}
          />
        </TouchableOpacity>

        <Text style={[
          styles.headerTitle,
          {
            color: scrollY > 100 ? '#000' : '#fff',
            opacity: scrollY > 100 ? 1 : 0, // 同步标题显示逻辑
            // 标题同样调整，往下移动
            marginTop: scrollY > 100 ? 50 : (isAndroid ? 65 : 45),
          }
        ]}>朋友圈</Text>

        <TouchableOpacity
          style={[
            styles.headerButton,
            {
              // 统一在scrollY > 100时改变样式，封面模式下往下移动更多
              marginTop: scrollY > 100 ? 50 : (isAndroid ? 65 : 45),
            }
          ]}
          onPress={() => console.log('打开相机')}
        >
          <Ionicons
            name="camera"
            size={24}
            color={scrollY > 100 ? '#000' : '#fff'}
          />
        </TouchableOpacity>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        scrollEventThrottle={16}
        onScroll={(event) => {
          const scrollY = event.nativeEvent.contentOffset.y;
          setScrollY(scrollY);

          // 关闭菜单
          if (activeMenuId) {
            setActiveMenuId(null);
          }
        }}
        showsVerticalScrollIndicator={false}
        // 安全区域处理 - 只在内容区域应用，顶部完全去除
        contentContainerStyle={{
          // 只在内容区域（不是封面区域）添加底部安全区域padding
          paddingBottom: insets.bottom,
          // 封面区域不添加任何顶部padding，延伸到屏幕顶部
          paddingTop: 0,
          // 背景色只应用到内容区域，封面区域保持透明
          backgroundColor: '#fff',
          // 底部安全区使用与背景相同的颜色
          borderBottomWidth: 0,
        }}
      >
        {/* 添加透明的TouchableWithoutFeedback来检测点击 */}
        <TouchableWithoutFeedback
          style={[StyleSheet.absoluteFill, { paddingTop: 0 }]}
          onPress={() => {
            if (activeMenuId) {
              setActiveMenuId(null);
            }
          }}
        >
        <View style={{ flex: 1, paddingTop: 0 }}>
          {/* 背景图片 - 移除所有边距，延伸到屏幕边缘 */}
          <View style={[
            styles.headerCover,
            {
              // 移除所有边距，让背景图延伸到屏幕边缘
              marginLeft: -24,
              marginRight: -24,
              width: SCREEN_WIDTH + 48,
            }
          ]}>
            <Image
              source={{ uri: 'https://img1.baidu.com/it/u=713295211,1805964126&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=281' }}
              style={styles.headerBackground}
              resizeMode="cover"
            />
          </View>

          {/* 个人信息区域 */}
          <MomentsAvatar />

          {/* 内容区域分隔 */}
          <View style={{
            height: 50,
            backgroundColor: '#fff',
            marginLeft: -24,
            marginRight: -24,
            width: SCREEN_WIDTH + 48,
          }} />

          {/* 动态列表 */}
          {moments.map((moment, index) => (
            <MomentsCard
              key={moment.id}
              momentData={moment}
              onLike={handleLike}
              onComment={handleAddComment}
              onImagePress={handleImagePress}
              isMenuOpen={activeMenuId === moment.id}
              onOpenMenu={(id, position) => {
                setMenuPosition(position);
                setActiveMenuId(id);
              }}
              onCloseMenu={() => {
                setActiveMenuId(null);
              }}
            />
          ))}
        </View>
      </TouchableWithoutFeedback>
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

      <MomentsActionMenu
        visible={!!activeMenuId && !!menuPosition}
        liked={!!currentActiveMoment?.liked}
        position={menuPosition}
        onClose={() => {
          setActiveMenuId(null);
        }}
        onLike={() => {
          if (activeMenuId) {
            handleLike(activeMenuId);
          }
        }}
        onComment={() => {
          if (activeMenuId) {
            handleAddComment(activeMenuId);
          }
        }}
      />

      <Modal
        visible={!!previewImage}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setPreviewImage(null)}
      >
        <Pressable style={styles.imagePreviewOverlay} onPress={() => setPreviewImage(null)}>
          {previewImage && (
            <>
              <Image source={{ uri: previewImage.uri }} style={styles.imagePreview} resizeMode="contain" />
              <Text style={styles.imagePreviewIndex}>
                {`${previewImage.index + 1}/${previewImage.images.length}`}
              </Text>
            </>
          )}
        </Pressable>
      </Modal>
    </View>
  </>
  );
}

export default MomentsScreen;