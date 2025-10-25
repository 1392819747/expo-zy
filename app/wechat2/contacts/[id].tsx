import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useThemeColors } from '../../../hooks/useThemeColors';

const CONTACTS = {
  '1': {
    name: 'Alice',
    avatar: require('../../../assets/images/wechat/avatar-girl.png'),
    wechatId: 'alice_2024',
    region: '美国 · 纽约',
    description: '设计是一种生活方式',
    moments: ['刚完成一个新的UI设计稿', '周末逛了现代艺术博物馆'],
  },
  '2': {
    name: '李明',
    avatar: require('../../../assets/images/wechat/avatar-man.png'),
    wechatId: 'liming_work',
    region: '中国 · 上海',
    description: '开发者·咖啡迷',
    moments: ['新的React Native项目上线了', '今天的咖啡是肯尼亚AA'],
  },
  '3': {
    name: '王华',
    avatar: require('../../../assets/images/wechat/avatar-man.png'),
    wechatId: 'wanghua',
    region: '中国 · 深圳',
    description: '产品经理·跑步爱好者',
    moments: ['成功上线了新的产品版本', '早起跑步5公里'],
  },
  '4': {
    name: '张伟',
    avatar: require('../../../assets/images/wechat/avatar-man.png'),
    wechatId: 'zhangwei1990',
    region: '中国 · 北京',
    description: '摄影师',
    moments: ['拍了一组城市夜景', '准备下次旅拍行程'],
  },
  '5': {
    name: '赵静',
    avatar: require('../../../assets/images/wechat/avatar-girl.png'),
    wechatId: 'zhaojing',
    region: '中国 · 成都',
    description: '美食·旅行爱好者',
    moments: ['探店了一家超好吃的火锅', '规划下一次旅行目的地'],
  },
};

export default function ContactDetailScreen() {
  const router = useRouter();
  const { colors } = useThemeColors();
  const params = useLocalSearchParams();
  const id = params.id as keyof typeof CONTACTS;
  const contact = CONTACTS[id] ?? CONTACTS['1'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { backgroundColor: colors.background }]}> 
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{contact.name}</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <View style={[styles.profileCard, { backgroundColor: colors.background }]}> 
          <Image source={contact.avatar} style={styles.avatar} />
          <View style={styles.profileInfo}>
            <Text style={[styles.name, { color: colors.text }]}>{contact.name}</Text>
            <Text style={[styles.wechatId, { color: colors.textSecondary }]}>微信号：{contact.wechatId}</Text>
            <View style={styles.profileMeta}>
              <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.region, { color: colors.textSecondary }]}>{contact.region}</Text>
            </View>
            <Text style={[styles.description, { color: colors.textSecondary }]}>{contact.description}</Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.background }]}> 
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>朋友圈</Text>
          {contact.moments.map((moment, index) => (
            <View key={index} style={styles.momentItem}>
              <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.momentText, { color: colors.text }]}>{moment}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.actionSection, { backgroundColor: colors.background }]}> 
          <TouchableOpacity
            style={[styles.actionButton, { borderBottomColor: colors.border }]}
            onPress={() => router.push(`/wechat2/chats/${id}?name=${encodeURIComponent(contact.name)}`)}
          >
            <Ionicons name="chatbubbles-outline" size={20} color={colors.primary || '#07C160'} />
            <Text style={[styles.actionText, { color: colors.text }]}>发消息</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="videocam-outline" size={20} color={colors.primary || '#07C160'} />
            <Text style={[styles.actionText, { color: colors.text }]}>音视频通话</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerPlaceholder: {
    width: 40,
    height: 40,
  },
  profileCard: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 12,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
    gap: 6,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
  },
  wechatId: {
    fontSize: 14,
  },
  profileMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  region: {
    fontSize: 14,
  },
  description: {
    fontSize: 14,
    marginTop: 6,
  },
  section: {
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 12,
    letterSpacing: 1,
  },
  momentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  momentText: {
    fontSize: 14,
  },
  actionSection: {
    padding: 16,
    marginBottom: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#eee',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  actionText: {
    fontSize: 16,
  },
});
