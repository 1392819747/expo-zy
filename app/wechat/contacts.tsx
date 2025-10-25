import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { 
  Contact, 
  mockContacts, 
  groupContactsByInitial, 
  getAllInitials, 
  searchContacts,
  contactFeatures 
} from '../../models/contacts';

const ContactsScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // 过滤和分组联系人
  const { groupedContacts, initials, filteredContacts } = useMemo(() => {
    const filtered = searchContacts(mockContacts, searchQuery);
    const grouped = groupContactsByInitial(filtered);
    const initialsList = getAllInitials(filtered);
    
    return { 
      groupedContacts: grouped, 
      initials: initialsList,
      filteredContacts: filtered
    };
  }, [searchQuery]);

  // 渲染功能项
  const renderFeatureItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.featureItem}
      onPress={() => {
        if (item.route) {
          router.push(item.route as any);
        } else {
          Alert.alert('功能提示', `${item.name}功能待实现`);
        }
      }}
    >
      <View style={styles.featureIcon}>
        <Ionicons name={item.icon as any} size={20} color="#07C160" />
      </View>
      <Text style={styles.featureName}>{item.name}</Text>
      <Ionicons name="chevron-forward" size={16} color="#c7c7cc" />
    </TouchableOpacity>
  );

  // 渲染联系人项
  const renderContactItem = ({ item }: { item: Contact }) => (
    <TouchableOpacity 
      style={styles.contactItem}
      onPress={() => router.push({
        pathname: '/wechat/contact-detail',
        params: { id: item.id }
      } as any)}
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
  const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
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

  // 准备SectionList数据
  const sections = initials.map(initial => ({
    title: initial,
    data: groupedContacts[initial] || []
  }));

  // 计算联系人总数
  const totalContacts = mockContacts.length;

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

      {/* 功能区域 */}
      <View style={styles.featuresContainer}>
        {contactFeatures.map((feature, index) => (
          <View key={feature.id}>
            {renderFeatureItem({ item: feature })}
            {index < contactFeatures.length - 1 && <View style={styles.separator} />}
          </View>
        ))}
      </View>

      {/* 联系人列表 */}
      <View style={styles.listContainer}>
        <View style={styles.contactsHeader}>
          <Text style={styles.contactsCount}>通讯录 ({totalContacts})</Text>
          <TouchableOpacity style={styles.addContactButton} onPress={() => router.push('/wechat/contact-add' as any)}>
            <Ionicons name="person-add" size={20} color="#07C160" />
          </TouchableOpacity>
        </View>
        
        {sections.length > 0 ? (
          <SectionList
            style={styles.sectionList}
            contentContainerStyle={styles.sectionListContent}
            sections={sections}
            keyExtractor={(item, index) => `contact-${item.id}-${index}`}
            renderItem={renderContactItem}
            renderSectionHeader={renderSectionHeader}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={true}
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
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e5e5',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
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
  featuresContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 8,
    borderBottomColor: '#f5f5f5',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureName: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  separator: {
    height: 0.5,
    backgroundColor: '#e5e5e5',
    marginLeft: 64,
  },
  listContainer: {
    flex: 1,
  },
  contactsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e5e5',
  },
  contactsCount: {
    fontSize: 14,
    color: '#666',
  },
  addContactButton: {
    padding: 4,
  },
  sectionList: {
    flex: 1,
  },
  sectionListContent: {
    paddingBottom: 20,
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
    backgroundColor: '#fff',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 4,
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

export default ContactsScreen;