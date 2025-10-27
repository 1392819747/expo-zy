import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../../../hooks/useThemeColors';

export default function WalletScreen() {
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>钱包</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.content}>
        {/* 余额卡片 */}
        <View style={[styles.balanceCard, { backgroundColor: colors.backgroundSecondary }]}>
          <View style={styles.balanceHeader}>
            <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>零钱</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </View>
          <Text style={[styles.balanceAmount, { color: colors.text }]}>¥ 0.00</Text>
        </View>

        {/* 功能列表 */}
        <View style={[styles.section, { backgroundColor: colors.backgroundSecondary, marginTop: 12 }]}>
          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.borderLight }]}>
            <View style={[styles.menuIcon, { backgroundColor: '#FFF5E6' }]}>
              <Ionicons name="card" size={24} color="#FF9500" />
            </View>
            <Text style={[styles.menuText, { color: colors.text }]}>银行卡</Text>
            <View style={styles.menuRight}>
              <Text style={[styles.menuHint, { color: colors.textSecondary }]}>未绑定</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.borderLight }]}>
            <View style={[styles.menuIcon, { backgroundColor: '#E6F7FF' }]}>
              <Ionicons name="receipt" size={24} color="#1890FF" />
            </View>
            <Text style={[styles.menuText, { color: colors.text }]}>账单</Text>
            <View style={styles.menuRight}>
              <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: '#F0FFF4' }]}>
              <Ionicons name="shield-checkmark" size={24} color="#52C41A" />
            </View>
            <Text style={[styles.menuText, { color: colors.text }]}>安全保障</Text>
            <View style={styles.menuRight}>
              <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* 支付服务 */}
        <View style={[styles.section, { backgroundColor: colors.backgroundSecondary, marginTop: 12 }]}>
          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.borderLight }]}>
            <View style={[styles.menuIcon, { backgroundColor: '#FEE7F0' }]}>
              <Ionicons name="qr-code" size={24} color="#ED64A6" />
            </View>
            <Text style={[styles.menuText, { color: colors.text }]}>收付款</Text>
            <View style={styles.menuRight}>
              <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="swap-horizontal" size={24} color="#9F7AEA" />
            </View>
            <Text style={[styles.menuText, { color: colors.text }]}>转账</Text>
            <View style={styles.menuRight}>
              <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
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
  balanceCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 15,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '600',
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
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
});
