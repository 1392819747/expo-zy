import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../../../hooks/useThemeColors';

export default function SettingsScreen() {
  const { colors } = useThemeColors();
  const router = useRouter();
  
  const isIOS26OrAbove = Platform.OS === 'ios' && Number.parseInt(String(Platform.Version), 10) >= 26;

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      edges={isIOS26OrAbove ? ['left', 'right', 'bottom'] : ['top', 'left', 'right', 'bottom']}
    >
      {isIOS26OrAbove && <StatusBar barStyle="dark-content" />}
      
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>设置</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.content}>
        {/* 账号设置 */}
        <View style={[styles.section, { backgroundColor: colors.backgroundSecondary }]}>
          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: colors.borderLight }]}
            onPress={() => router.push('/wechat/me/edit-profile' as any)}
          >
            <Text style={[styles.menuText, { color: colors.text }]}>账号与安全</Text>
            <View style={styles.menuRight}>
              <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.borderLight }]}>
            <Text style={[styles.menuText, { color: colors.text }]}>新消息通知</Text>
            <View style={styles.menuRight}>
              <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={[styles.menuText, { color: colors.text }]}>隐私</Text>
            <View style={styles.menuRight}>
              <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* 通用设置 */}
        <View style={[styles.section, { backgroundColor: colors.backgroundSecondary, marginTop: 12 }]}>
          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.borderLight }]}>
            <Text style={[styles.menuText, { color: colors.text }]}>通用</Text>
            <View style={styles.menuRight}>
              <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={[styles.menuText, { color: colors.text }]}>聊天</Text>
            <View style={styles.menuRight}>
              <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* 其他 */}
        <View style={[styles.section, { backgroundColor: colors.backgroundSecondary, marginTop: 12 }]}>
          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.borderLight }]}>
            <Text style={[styles.menuText, { color: colors.text }]}>帮助与反馈</Text>
            <View style={styles.menuRight}>
              <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={[styles.menuText, { color: colors.text }]}>关于微信</Text>
            <View style={styles.menuRight}>
              <Text style={[styles.menuHint, { color: colors.textSecondary }]}>v8.0.0</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* 退出登录 */}
        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: colors.backgroundSecondary, marginTop: 40 }]}
          onPress={() => Alert.alert('提示', '确定要退出登录吗？', [
            { text: '取消', style: 'cancel' },
            { text: '退出', style: 'destructive' }
          ])}
        >
          <Text style={[styles.logoutText, { color: colors.destructive }]}>退出登录</Text>
        </TouchableOpacity>
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
    borderBottomWidth: 0.5,
  },
  headerButton: {
    width: 60,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    marginHorizontal: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuHint: {
    fontSize: 14,
    marginRight: 8,
  },
  logoutButton: {
    marginHorizontal: 16,
    marginBottom: 40,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
