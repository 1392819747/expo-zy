import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Contact, mockContacts, groupContactsByInitial, getAllInitials, searchContacts } from '../../models/contacts';

const ContactListScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const router = useRouter();

  // 过滤和分组联系人
  const { groupedContacts, initials } = useMemo(() => {
    const filteredContacts = searchContacts(mockContacts, searchQuery);
    const grouped = groupContactsByInitial(filteredContacts);
    const initialsList = getAllInitials(filteredContacts);
    
    return { groupedContacts: grouped, initials: initialsList };
  }, [searchQuery]);

  // 渲染联系人项
  const renderContactItem = ({ item }: { item: Contact }) => (
    <TouchableOpacity 
      style={styles.contactItem}
      onPress={() => {
        setSelectedContact(item);
        router.push({
          pathname: '/wechat/contact-detail',
          params: { id: item.id }
        } as any);
      }}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.avatar || item.name.charAt(0)}</Text>
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        {item.description && (
          <Text style={styles.contactDescription}>{item.description}</Text>
        )}
      </View>
      {item.isStarred && (
        <Ionicons name="star" size={16} color="#FFD700" style={styles.starIcon} />
      )}
    </TouchableOpacity>
  );

  // 渲染分组标题
  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  );

  // 渲染右侧字母索引
  const renderAlphabetIndex = () => (
    <View style={styles.alphabetIndex}>
      {initials.map(initial => (
        <TouchableOpacity
          key={initial}
          style={styles.alphabetItem}
          onPress={() => {
            // 滚动到对应分组
            // 这里可以添加滚动逻辑
          }}
        >
          <Text style={styles.alphabetText}>{initial}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // 准备FlatList数据
  const data = initials.map(initial => ({
    title: initial,
    data: groupedContacts[initial] || []
  }));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* 搜索框 */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={16} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索联系人"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {/* 联系人列表 */}
      <View style={styles.listContainer}>
        {data.length > 0 ? (
          <FlatList
            style={styles.flatList}
            data={data}
            keyExtractor={(item, index) => `section-${item.title}-${index}`}
            renderItem={({ item }) => (
              <View>
                {renderSectionHeader({ section: { title: item.title } })}
                {item.data.map(contact => (
                  <View key={contact.id}>
                    {renderContactItem({ item: contact })}
                  </View>
                ))}
              </View>
            )}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>没有找到相关联系人</Text>
          </View>
        )}
      </View>

      {/* 右侧字母索引 */}
      {initials.length > 0 && renderAlphabetIndex()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e5e5',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 36,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  listContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  flatList: {
    flex: 1,
    paddingRight: 20,
  },
  sectionHeader: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e5e5',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#07C160',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  contactDescription: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  starIcon: {
    marginLeft: 8,
  },
  alphabetIndex: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 20,
    backgroundColor: 'transparent',
  },
  alphabetItem: {
    paddingVertical: 2,
  },
  alphabetText: {
    fontSize: 12,
    color: '#07C160',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});

export default ContactListScreen;