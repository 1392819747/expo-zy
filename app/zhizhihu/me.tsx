import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MeScreen() {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView>
          {/* Profile Header */}
          <View style={styles.profileSection}>
            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>我</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.name}>知之乎用户</Text>
                <Text style={styles.wechatId}>知之乎号: zhizhihu_user</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </View>
          </View>

          {/* Services Section */}
          <View style={styles.section}>
            <TouchableOpacity style={styles.item}>
              <Text style={styles.icon}>💳</Text>
              <Text style={styles.itemText}>服务</Text>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Menu Items */}
          <View style={styles.section}>
            <TouchableOpacity style={styles.item}>
              <Text style={styles.icon}>💰</Text>
              <Text style={styles.itemText}>支付</Text>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <TouchableOpacity style={styles.item}>
              <Text style={styles.icon}>⭐</Text>
              <Text style={styles.itemText}>收藏</Text>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity style={styles.item}>
              <Text style={styles.icon}>📷</Text>
              <Text style={styles.itemText}>朋友圈</Text>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity style={styles.item}>
              <Text style={styles.icon}>🎴</Text>
              <Text style={styles.itemText}>卡包</Text>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity style={styles.item}>
              <Text style={styles.icon}>😊</Text>
              <Text style={styles.itemText}>表情</Text>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <TouchableOpacity style={styles.item}>
              <Text style={styles.icon}>⚙️</Text>
              <Text style={styles.itemText}>设置</Text>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  safeArea: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: "#fff",
    marginBottom: 10,
    paddingTop: 20,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  avatar: {
    width: 65,
    height: 65,
    borderRadius: 4,
    backgroundColor: "#07C160",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "600",
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: "600",
    color: "#000",
    marginBottom: 5,
  },
  wechatId: {
    fontSize: 14,
    color: "#999",
  },
  section: {
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
  },
  icon: {
    fontSize: 24,
    marginRight: 15,
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  arrow: {
    fontSize: 20,
    color: "#999",
  },
  separator: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginLeft: 54,
  },
});
