import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const discoverItems = [
  { id: "moments", name: "朋友圈", icon: "📷" },
  { id: "channels", name: "视频号", icon: "📹" },
  { id: "scan", name: "扫一扫", icon: "📱" },
  { id: "shake", name: "摇一摇", icon: "📳" },
  { id: "nearby", name: "看一看", icon: "👀" },
  { id: "search", name: "搜一搜", icon: "🔍" },
  { id: "miniprogram", name: "小程序", icon: "🎮" },
];

export default function DiscoverScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.section}>
          <TouchableOpacity style={styles.item}>
            <Text style={styles.icon}>📷</Text>
            <Text style={styles.itemText}>朋友圈</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.item}>
            <Text style={styles.icon}>📹</Text>
            <Text style={styles.itemText}>视频号</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.item}>
            <Text style={styles.icon}>📱</Text>
            <Text style={styles.itemText}>扫一扫</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.item}>
            <Text style={styles.icon}>📳</Text>
            <Text style={styles.itemText}>摇一摇</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.item}>
            <Text style={styles.icon}>👀</Text>
            <Text style={styles.itemText}>看一看</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.item}>
            <Text style={styles.icon}>🔍</Text>
            <Text style={styles.itemText}>搜一搜</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.item}>
            <Text style={styles.icon}>🎮</Text>
            <Text style={styles.itemText}>小程序</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
