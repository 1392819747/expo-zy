import { Tabs } from "expo-router";
import { Text, View } from "react-native";

const Layout = () => {
  
  const TabText = ({ children, color }) => {
    return <Text style={{ fontSize: 12, color }}>{children}</Text>;
  };

  return (
    <Tabs
            initialRouteName="chats"
            screenOptions={{
              headerTitleAlign: "center",
              headerStyle: {
                backgroundColor: "#f5f5f5",
              },
              tabBarActiveTintColor: "#07C160",
            }}
          >
            <Tabs.Screen
              name="chats"
              options={{
                tabBarLabel: ({ color }) => {
                  return <TabText color={color}>聊天</TabText>;
                },
                headerTitle: "知之乎",
                tabBarIcon: ({ size, color, focused }) => {
                  return (
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        backgroundColor: focused ? "#07C160" : "#999",
                        borderRadius: 4,
                      }}
                    />
                  );
                },
              }}
            />
            <Tabs.Screen
              name="contacts"
              options={{
                tabBarLabel: ({ color }) => {
                  return <TabText color={color}>通讯录</TabText>;
                },
                headerTitle: "通讯录",
                tabBarIcon: ({ size, color, focused }) => {
                  return (
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        backgroundColor: focused ? "#07C160" : "#999",
                        borderRadius: 4,
                      }}
                    />
                  );
                },
              }}
            />
            <Tabs.Screen
              name="discover"
              options={{
                tabBarLabel: ({ color }) => {
                  return <TabText color={color}>发现</TabText>;
                },
                headerTitle: "发现",
                tabBarIcon: ({ size, color, focused }) => {
                  return (
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        backgroundColor: focused ? "#07C160" : "#999",
                        borderRadius: 4,
                      }}
                    />
                  );
                },
              }}
            />
            <Tabs.Screen
              name="me"
              options={{
                tabBarLabel: ({ color }) => {
                  return <TabText color={color}>我</TabText>;
                },
                headerTitle: "我",
                headerShown: false,
                tabBarIcon: ({ size, color, focused }) => {
                  return (
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        backgroundColor: focused ? "#07C160" : "#999",
                        borderRadius: 4,
                      }}
                    />
                  );
                },
              }}
            />
          </Tabs>
  );
};

export default Layout;
