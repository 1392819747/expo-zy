import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../../../hooks/useThemeColors';

export default function FavoritesScreen() {
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>收藏</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.emptyContainer}>
        <Ionicons name="star-outline" size={80} color={colors.textTertiary} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>暂无收藏</Text>
        <Text style={[styles.emptyHint, { color: colors.textTertiary }]}>
          在聊天中长按消息可以收藏
        </Text>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
  emptyHint: {
    fontSize: 14,
    marginTop: 8,
  },
});
