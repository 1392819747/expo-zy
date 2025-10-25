import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useLayoutEffect, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Dimensions
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../../../hooks/useThemeColors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_SIZE = (SCREEN_WIDTH - 16 * 2 - 4 * 2) / 3; // 3列图片时每张图片的尺寸，间距减小到4
const SPACING = 4; // 图片间距，微信使用较小间距

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
    images: ['https://via.placeholder.com/300x300'],
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
      'https://via.placeholder.com/300x300',
      'https://via.placeholder.com/300x300',
      'https://via.placeholder.com/300x300'
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
      'https://via.placeholder.com/300x300',
      'https://via.placeholder.com/300x300'
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

export default function MomentsScreen() {
  const { colors, isDark } = useThemeColors();
  const navigation = useNavigation();
  const router = useRouter();
  const [moments, setMoments] = useState<MomentItem[]>(mockMoments);
  const insets = useSafeAreaInsets();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: '朋友圈',
      headerStyle: {
        backgroundColor: '#07C160',  // 微信标准绿色
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        color: '#fff',
      },
      headerShadowVisible: false,
    });
  }, [navigation]);  // 移除[colors, navigation]依赖以确保绿色背景

  // 模拟当前用户
  const currentUser = '当前用户';

  // 处理点赞
  const handleLike = (id: string) => {
    setMoments(prev => prev.map(moment => {
      if (moment.id === id) {
        const isLiked = moment.likes.some(like => like.name === currentUser);
        let newLikes = [...moment.likes];
        
        if (isLiked) {
          // 取消点赞 - 移除当前用户
          newLikes = newLikes.filter(like => like.name !== currentUser);
        } else {
          // 添加点赞
          newLikes = [...newLikes, { id: `${Date.now()}`, name: currentUser }];
        }
        
        return { ...moment, likes: newLikes, liked: !isLiked };
      }
      return moment;
    }));
  };

  // 处理评论
  const handleAddComment = (id: string, replyTo?: string) => {
    // 这里应该打开评论输入框
    console.log(`添加评论到动态: ${id}, 回复: ${replyTo || '动态'}`);
  };

  // 渲染多张图片的网格布局
  const renderImageGrid = (images: string[], id: string) => {
    if (!images || images.length === 0) return null;

    // 根据图片数量生成不同布局
    if (images.length === 1) {
      // 单张图片：宽高比3:2左右，最大宽度不超过屏幕宽度
      return (
        <TouchableOpacity 
          style={styles.singleImage}
          onPress={() => console.log(`查看图片: ${images[0]}`)}
        >
          <Image source={{ uri: images[0] }} style={styles.imageInner} resizeMode="cover" />
        </TouchableOpacity>
      );
    } else {
      // 多张图片：使用网格布局
      const renderRow = (start: number, count: number) => {
        const rowImages = images.slice(start, start + count);
        return (
          <View key={start} style={styles.imageRow}>
            {rowImages.map((image, index) => (
              <TouchableOpacity 
                key={`${id}-${start}-${index}`} 
                style={[styles.gridImage, { width: IMAGE_SIZE, height: IMAGE_SIZE }]}
                onPress={() => console.log(`查看图片: ${image}`)}
              >
                <Image source={{ uri: image }} style={styles.imageInner} resizeMode="cover" />
              </TouchableOpacity>
            ))}
            {/* 如果行未满，用空View填充以保持布局 */}
            {Array.from({ length: 3 - count }).map((_, idx) => (
              <View 
                key={`empty-${start}-${idx}`} 
                style={[styles.gridImage, { width: IMAGE_SIZE, height: IMAGE_SIZE }]}
              />
            ))}
          </View>
        );
      };

      if (images.length === 2) {
        // 2张图片：水平排列
        return (
          <View style={styles.imageRow}>
            {images.map((image, index) => (
              <TouchableOpacity 
                key={`${id}-2-${index}`} 
                style={[styles.gridImage, { width: (SCREEN_WIDTH - 16 * 2 - SPACING) / 2, height: (SCREEN_WIDTH - 16 * 2 - SPACING) / 2 }]}
                onPress={() => console.log(`查看图片: ${image}`)}
              >
                <Image source={{ uri: image }} style={styles.imageInner} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </View>
        );
      } else if (images.length === 3) {
        // 3张图片：单行
        return renderRow(0, 3);
      } else if (images.length === 4) {
        // 4张图片：2x2
        return (
          <View>
            {renderRow(0, 2)}
            {renderRow(2, 2)}
          </View>
        );
      } else if (images.length === 5) {
        // 5张图片：2x3布局，第2行2个
        return (
          <View>
            {renderRow(0, 3)}
            {renderRow(3, 2)}
          </View>
        );
      } else if (images.length === 6) {
        // 6张图片：2x3
        return (
          <View>
            {renderRow(0, 3)}
            {renderRow(3, 3)}
          </View>
        );
      } else if (images.length === 7) {
        // 7张图片：3x3布局，最后一行1个
        return (
          <View>
            {renderRow(0, 3)}
            {renderRow(3, 3)}
            {renderRow(6, 1)}
          </View>
        );
      } else if (images.length === 8) {
        // 8张图片：3x3布局，最后一行2个
        return (
          <View>
            {renderRow(0, 3)}
            {renderRow(3, 3)}
            {renderRow(6, 2)}
          </View>
        );
      } else { // 9张图片
        return (
          <View>
            {renderRow(0, 3)}
            {renderRow(3, 3)}
            {renderRow(6, 3)}
          </View>
        );
      }
    }
  };

  // 渲染点赞和评论列表
  const renderLikeAndComment = (moment: MomentItem) => {
    if (moment.likes.length === 0 && moment.comments.length === 0) return null;

    // 合并点赞和评论，按微信的显示方式
    const allItems = [];
    
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
        ...comment
      });
    });

    return (
      <View style={[styles.likeCommentContainer, { 
        backgroundColor: '#f8f8f8',
      }]}>
        {allItems.map((item, index) => (
          <View key={item.id || `item-${index}`} style={styles.likeCommentItem}>
            {item.type === 'like' ? (
              <View style={styles.likeSection}>
                <Ionicons name="heart-outline" size={16} color="#FA5151" style={styles.likeIcon} />
                <Text style={[styles.likeText, { color: '#FA5151' }]}>
                  {item.content}
                </Text>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.commentItem} 
                onPress={() => handleAddComment(moment.id, item.name)}
              >
                <Text style={[styles.commentUser, { color: '#1877f2' }]}>
                  {item.name}
                </Text>
                <Text style={[styles.commentText, { color: '#333' }]}>
                  {item.replyTo ? ` 回复 ${item.replyTo}` : ''}: {item.content}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScrollView style={styles.scrollView}>
        {/* 顶部封面区域 */}
        <View style={styles.headerCover}>
          {/* 渐变背景 */}
          <View style={[styles.headerCover, { backgroundColor: '#07C160' }]} />
          {/* 顶部标题和相机按钮 */}
          <View style={styles.headerPlaceholder}>
            <Text style={styles.headerTitle}>朋友圈</Text>
          </View>
          <TouchableOpacity 
            style={styles.cameraButton}
            onPress={() => console.log('打开相机')}
          >
            <Ionicons name="camera" size={28} color="#fff" />
          </TouchableOpacity>
          {/* 个人信息区域 */}
          <View style={styles.profileHeader}>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>当前用户</Text>
            </View>
            <View style={styles.profileAvatar}>
              <Text style={{ fontSize: 24, color: '#07C160', fontWeight: '600' }}>我</Text>
            </View>
          </View>
        </View>

        {/* 动态列表 */}
        {moments.map((moment) => (
          <View 
            key={moment.id} 
            style={styles.momentItem}
          >
            {/* 用户信息 */}
            <View style={styles.userInfo}>
              <View style={[styles.avatar, { backgroundColor: '#07C160' }]}>
                <Text style={styles.avatarText}>{moment.userName.charAt(0)}</Text>
              </View>
              <View style={styles.userInfoRight}>
                <Text style={styles.userName}>{moment.userName}</Text>
                <View style={styles.userInfoBottom}>
                  <Text style={styles.time}>{moment.time}</Text>
                  {moment.location && (
                    <View style={styles.locationContainer}>
                      <Ionicons name="location" size={12} color="#888" />
                      <Text style={styles.location}>{moment.location}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* 动态内容 */}
            <Text style={styles.textContent}>{moment.content}</Text>

            {/* 图片网格 */}
            {moment.images && moment.images.length > 0 && (
              <View style={styles.imageGridContainer}>
                {renderImageGrid(moment.images, moment.id)}
              </View>
            )}

            {/* 点赞和评论 */}
            {renderLikeAndComment(moment)}

            {/* 操作按钮 */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleLike(moment.id)}
              >
                <Ionicons 
                  name={moment.liked ? 'heart' : 'heart-outline'} 
                  size={20} 
                  color={moment.liked ? '#FA5151' : '#888'} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton} onPress={() => handleAddComment(moment.id)}>
                <Ionicons name="chatbubble-outline" size={20} color="#888" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="ellipsis-horizontal" size={20} color="#888" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
        
        {/* 底部填充 */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',  // 微信朋友圈背景色
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#f5f5f5',  // 微信朋友圈背景色
  },
  headerCover: {
    height: 460,  // 真实微信朋友圈顶部高度
    backgroundColor: '#07C160',  // 微信绿色
    position: 'relative',
    overflow: 'hidden',
  },
  headerPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  cameraButton: {
    position: 'absolute',
    right: 16,
    top: 50,
  },
  // 添加头像覆盖层样式
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  profileInfo: {
    flex: 1,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 4,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 8,
  },
  momentItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
    borderStyle: 'solid',
    backgroundColor: '#fff',
  },
  userInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 4,  // 微信使用稍微大一点的圆角
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: '#07C160',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#fff',
  },
  userInfoRight: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  userInfoBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  time: {
    fontSize: 14,
    color: '#888',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  location: {
    fontSize: 14,
    color: '#888',
    marginLeft: 4,
  },
  textContent: {
    fontSize: 17,
    lineHeight: 24,
    marginBottom: 8,
    color: '#333',
  },
  imageGridContainer: {
    marginBottom: 8,
  },
  singleImage: {
    width: (SCREEN_WIDTH - 32) * 0.6,  // 按屏幕宽度的比例
    maxHeight: (SCREEN_WIDTH - 32) * 0.8,  // 最大高度限制
    borderRadius: 4,
    overflow: 'hidden',
  },
  imageGrid2Col: {
    flexDirection: 'column',
  },
  imageGrid3Col: {
    flexDirection: 'column',
  },
  imageGrid5: {
    flexDirection: 'column',
  },
  imageRow: {
    flexDirection: 'row',
    marginBottom: SPACING,
  },
  gridImage: {
    borderRadius: 4,
    marginRight: SPACING,
    marginBottom: SPACING,
    overflow: 'hidden',
  },
  imageInner: {
    width: '100%',
    height: '100%',
  },
  likeCommentContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderStyle: 'solid',
    borderTopWidth: 0.5,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#f8f8f8',  // 微信背景色
    marginTop: 8,
  },
  likeCommentItem: {
    marginBottom: 6,
  },
  likeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  likeIcon: {
    marginRight: 6,
  },
  likeText: {
    fontSize: 15,
    lineHeight: 20,
  },
  commentItem: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  commentUser: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
  },
  commentText: {
    fontSize: 15,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderStyle: 'solid',
    borderTopColor: '#f0f0f0',
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    borderRightWidth: 0.5,
    borderStyle: 'solid',
    borderRightColor: '#f0f0f0',
    paddingVertical: 8,
  },
});