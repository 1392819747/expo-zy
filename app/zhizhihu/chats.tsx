import { View, Text, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const mockChats = [
  { id: "1", name: "张三", message: "你好啊", time: "10:30" },
  { id: "2", name: "李四", message: "今天天气不错", time: "09:15" },
  { id: "3", name: "王五", message: "周末一起吃饭？", time: "昨天" },
  { id: "4", name: "赵六", message: "[图片]", time: "昨天" },
  { id: "5", name: "小组群聊", message: "明天开会记得来", time: "星期五" },
];

export default function ChatsScreen() {
  const renderItem = ({ item }) => (
    <View style={styles.chatItem}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name[0]}</Text>
      </View>
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>{item.name}</Text>
          <Text style={styles.chatTime}>{item.time}</Text>
        </View>
        <Text style={styles.chatMessage} numberOfLines={1}>
          {item.message}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={mockChats}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  chatItem: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#fff",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 4,
    backgroundColor: "#07C160",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  chatContent: {
    flex: 1,
    justifyContent: "center",
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  chatTime: {
    fontSize: 12,
    color: "#999",
  },
  chatMessage: {
    fontSize: 14,
    color: "#999",
  },
  separator: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginLeft: 77,
  },
});
