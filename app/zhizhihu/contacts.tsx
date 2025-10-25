import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const mockContacts = [
  { id: "new", name: "新的朋友", type: "special" },
  { id: "group", name: "群聊", type: "special" },
  { id: "tag", name: "标签", type: "special" },
  { id: "official", name: "公众号", type: "special" },
  { id: "1", name: "张三", type: "contact", letter: "Z" },
  { id: "2", name: "李四", type: "contact", letter: "L" },
  { id: "3", name: "王五", type: "contact", letter: "W" },
  { id: "4", name: "赵六", type: "contact", letter: "Z" },
  { id: "5", name: "陈七", type: "contact", letter: "C" },
  { id: "6", name: "周八", type: "contact", letter: "Z" },
];

export default function ContactsScreen() {
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.contactItem}>
      <View
        style={[
          styles.avatar,
          item.type === "special" && styles.specialAvatar,
        ]}
      >
        <Text style={styles.avatarText}>
          {item.type === "special" ? "📋" : item.name[0]}
        </Text>
      </View>
      <View style={styles.contactContent}>
        <Text style={styles.contactName}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={mockContacts}
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
  contactItem: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 4,
    backgroundColor: "#07C160",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  specialAvatar: {
    backgroundColor: "#f5f5f5",
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  contactContent: {
    flex: 1,
    justifyContent: "center",
  },
  contactName: {
    fontSize: 16,
    color: "#000",
  },
  separator: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginLeft: 72,
  },
});
