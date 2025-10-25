import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useWeChatTheme } from '../useWeChatTheme';

const MOMENTS = [
  {
    id: '1',
    user: '王小明',
    avatar: require('../../../assets/images/wechat/avatar-man.png'),
    content: '今天的天空格外湛蓝，忍不住用手机记录下这一刻。',
    images: [require('../../../assets/images/wechat/avatar-man.png')],
    time: '1分钟前',
    location: '深圳 · 南山区',
    likes: ['张伟', '李红'],
    comments: [
      { id: '1', user: '李红', text: '拍得太美了！' },
      { id: '2', user: '张伟', text: '好想去看看！' }
    ]
  },
  {
    id: '2',
    user: 'Alice',
    avatar: require('../../../assets/images/wechat/avatar-girl.png'),
    content: '新的一天，继续努力！',
    images: [],
    time: '3小时前',
    location: '',
    likes: ['王小明'],
    comments: []
  }
];

export default function MomentsScreen() {
  const theme = useWeChatTheme();
  const router = useRouter();

  const renderMoment = ({ item }: { item: typeof MOMENTS[number] }) => {
    const likeText = useMemo(() => {
      if (!item.likes.length) return '';
      return item.likes.join('，');
    }, [item.likes]);

    return (
      <View style={[styles.momentCard, { backgroundColor: theme.bg1 }]}>
        <View style={styles.momentHeader}>
          <Image source={item.avatar} style={styles.avatar} />
          <View style={styles.headerContent}>
            <Text style={[styles.userName, { color: theme.text5 }]}>{item.user}</Text>
            <Text style={[styles.timeText, { color: theme.text3 }]}>{item.time}</Text>
            {item.location ? (
              <Text style={[styles.locationText, { color: theme.text3 }]}>{item.location}</Text>
            ) : null}
          </View>
        </View>
        <Text style={[styles.contentText, { color: theme.text5 }]}>{item.content}</Text>

        {item.images.length ? (
          <View style={styles.imageGrid}>
            {item.images.map((image, index) => (
              <Image key={index} source={image} style={styles.momentImage} />
            ))}
          </View>
        ) : null}

        <View style={styles.momentFooter}>
          <TouchableOpacity style={styles.footerButton}>
            <Ionicons name="chatbubble-ellipses-outline" size={18} color={theme.text3} />
            <Text style={[styles.footerText, { color: theme.text3 }]}>评论</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerButton}>
            <Ionicons name="heart-outline" size={18} color={theme.text3} />
            <Text style={[styles.footerText, { color: theme.text3 }]}>赞</Text>
          </TouchableOpacity>
        </View>

        {likeText ? (
          <View style={[styles.likesContainer, { backgroundColor: theme.bg2 }]}> 
            <Ionicons name="heart" size={14} color={theme.primary} />
            <Text style={[styles.likesText, { color: theme.text4 }]}>{likeText}</Text>
          </View>
        ) : null}

        {item.comments.length ? (
          <View style={[styles.commentsContainer, { backgroundColor: theme.bg2 }]}>
            {item.comments.map(comment => (
              <Text key={comment.id} style={[styles.commentText, { color: theme.text5 }]}>
                <Text style={{ color: theme.text4 }}>{comment.user}：</Text>
                {comment.text}
              </Text>
            ))}
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg2 }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: theme.bg1, borderBottomColor: theme.fillColor }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text5} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text5 }]}>朋友圈</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="camera" size={24} color={theme.text5} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={MOMENTS}
        keyExtractor={item => item.id}
        renderItem={renderMoment}
        contentContainerStyle={{ padding: 12, gap: 12, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  momentCard: {
    borderRadius: 12,
    padding: 16,
  },
  momentHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 12,
  },
  locationText: {
    fontSize: 12,
  },
  contentText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  momentImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  momentFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 14,
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 8,
  },
  likesText: {
    fontSize: 13,
  },
  commentsContainer: {
    marginTop: 8,
    padding: 8,
    borderRadius: 8,
    gap: 6,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
