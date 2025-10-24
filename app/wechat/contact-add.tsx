import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AddContactScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ededed" />
      
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>添加朋友</Text>
        <View style={styles.placeholder} />
      </View>
      
      {/* 搜索框 */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInput}>
          <Ionicons name="search" size={16} color="#999999" />
          <TextInput
            style={styles.textInput}
            placeholder="微信号/手机号"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999999"
          />
        </View>
      </View>
      
      {/* 功能列表 */}
      <View style={styles.functionList}>
        <TouchableOpacity 
          style={styles.functionItem}
          onPress={() => Alert.alert('扫一扫', '扫一扫功能待实现')}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#4CAF50' }]}>
            <Ionicons name="qr-code" size={24} color="#fff" />
          </View>
          <Text style={styles.functionText}>扫一扫</Text>
          <Ionicons name="chevron-forward" size={16} color="#c7c7cc" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.functionItem}
          onPress={() => Alert.alert('手机联系人', '手机联系人功能待实现')}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#2196F3' }]}>
            <Ionicons name="people" size={24} color="#fff" />
          </View>
          <Text style={styles.functionText}>手机联系人</Text>
          <Ionicons name="chevron-forward" size={16} color="#c7c7cc" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ededed',
  },
  header: {
    backgroundColor: '#ededed',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#d9d9d9',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    backgroundColor: '#ededed',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  textInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#000',
  },
  functionList: {
    backgroundColor: '#fff',
    marginTop: 20,
  },
  functionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e5e5',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  functionText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
});