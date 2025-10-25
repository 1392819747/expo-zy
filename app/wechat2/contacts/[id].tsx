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
import { useWeChatTheme } from '../useWeChatTheme';

const CONTACTS_DATA = {
  '1': {
    name: 'Alice',
    avatar: require('../../../assets/images/wechat/avatar-girl.png'),
    wechatId: 'alice_2024',
    region: '美国 · 纽约',
    description: '设计是一种生活方式',
  },
  '2': {
    name: '李明',
    avatar: require('../../../assets/images/wechat/avatar-man.png'),
    wechatId: 'liming_work',
    region: '中国 · 上海',
    description: '开发者·咖啡迷',
  },
  '3': {
    name: '王华',
    avatar: require('../../../assets/images/wechat/avatar-man.png'),
    wechatId: 'wanghua',
    region: '中国 · 深圳',
    description: '产品经理·跑步爱好者',
  },
  '4': {
    name: '张伟',
    avatar: require('../../../assets/images/wechat/avatar-man.png'),
    wechatId: 'zhangwei1990',
    region: '中国 · 北京',
    description: '摄影师',
  },
  '5': {
    name: '赵静',
    avatar: require('../../../assets/images/wechat/avatar-girl.png'),
    wechatId: 'zhaojing',
    region: '中国 · 成都',
    description: '美食·旅行爱好者',
  },
};

export default function ContactDetailScreen() {
  const router = useRouter();
  const theme = useWeChatTheme();
  const params = useLocalSearchParams();
  const id = params.id as keyof typeof CONTACTS_DATA;
  const contact = CONTACTS_DATA[id] ?? CONTACTS_DATA['1'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg2 }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { backgroundColor: theme.bg1 }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.text5} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-horizontal" size={24} color={theme.text5} />
          </TouchableOpacity>
        </View>

        <View style={[styles.profileSection, { backgroundColor: theme.bg1 }]}>
          <Image source={contact.avatar} style={styles.avatar} />
          <Text style={[styles.name, { color: theme.text5 }]}>{contact.name}</Text>
          <Text style={[styles.description, { color: theme.text3 }]}>{contact.description}</Text>
        </View>

        <View style={[styles.infoSection, { backgroundColor: theme.bg1 }]}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.text3 }]}>微信号</Text>
            <Text style={[styles.infoValue, { color: theme.text5 }]}>{contact.wechatId}</Text>
          </View>
          <View style={[styles.separator, { backgroundColor: theme.fillColor }]} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.text3 }]}>地区</Text>
            <Text style={[styles.infoValue, { color: theme.text5 }]}>{contact.region}</Text>
          </View>
        </View>

        <View style={[styles.actionSection, { backgroundColor: theme.bg1 }]}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push(`/wechat2/chats/${id}?name=${encodeURIComponent(contact.name)}`)}
          >
            <View style={styles.actionButtonContent}>
              <Ionicons name="chatbubbles-outline" size={22} color={theme.text5} />
              <Text style={[styles.actionButtonText, { color: theme.text5 }]}>发消息</Text>
            </View>
          </TouchableOpacity>
          <View style={[styles.separator, { backgroundColor: theme.fillColor }]} />
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionButtonContent}>
              <Ionicons name="videocam-outline" size={22} color={theme.text5} />
              <Text style={[styles.actionButtonText, { color: theme.text5 }]}>音视频通话</Text>
            </View>
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
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  moreButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
  },
  infoSection: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  infoLabel: {
    fontSize: 16,
  },
  infoValue: {
    fontSize: 16,
  },
  separator: {
    height: 0.5,
    marginLeft: 16,
  },
  actionSection: {
    marginBottom: 24,
  },
  actionButton: {
    paddingVertical: 14,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  actionButtonText: {
    fontSize: 16,
  },
});
