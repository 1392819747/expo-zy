import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
  Animated,
  TouchableWithoutFeedback,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeColors } from '../../hooks/useThemeColors';
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
  const { colors, isDark } = useThemeColors();
  const sectionListRef = useRef(null);
  const alphabetIndexOpacity = useRef(new Animated.Value(0)).current;

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
      style={[styles.featureItem, { backgroundColor: colors.backgroundSecondary, borderBottomColor: colors.borderLight }]}
      onPress={() => {
        if (item.route) {
          router.push(item.route as any);
        } else {
          Alert.alert('功能提示', `${item.name}功能待实现`);
        }
      }}
    >
      <View style={[styles.featureIcon, { backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1 }]}>
        <Ionicons name={item.icon as any} size={20} color={colors.primary} />
      </View>
      <Text style={[styles.featureName, { color: colors.text }]}>{item.name}</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
    </TouchableOpacity>
  );

  // 渲染联系人项
  const renderContactItem = ({ item }: { item: Contact }) => (
    <TouchableOpacity 
      style={[styles.contactItem, { backgroundColor: colors.backgroundSecondary, borderBottomColor: colors.borderLight }]}
      onPress={() => router.push({
        pathname: '/wechat/contact-detail',
        params: { id: item.id }
      } as any)}
    >
      <View style={[styles.avatar, { backgroundColor: colors.avatarBackground }]}>
        <Text style={styles.avatarText}>{item.avatar || item.name.charAt(0)}</Text>
      </View>
      <View style={styles.contactInfo}>
        <Text style={[styles.contactName, { color: colors.text }]}>{item.name}</Text>
        {item.description && (
          <Text style={[styles.contactDescription, { color: colors.textSecondary }]}>{item.description}</Text>
        )}
      </View>
      {item.isStarred && (
        <Ionicons name="star" size={16} color="#FFD700" style={styles.starIcon} />
      )}
    </TouchableOpacity>
  );

  // 渲染分组标题
  const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
    <View style={[styles.sectionHeader, { backgroundColor: colors.backgroundTertiary }]}>
      <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>{title}</Text>
    </View>
  );

  // 渲染右侧字母索引
  const renderAlphabetIndex = () => (
    <View style={styles.alphabetIndex}>
      {initials.map((initial, index) => (
        <TouchableOpacity
          key={initial}
          style={styles.alphabetItem}
          onPress={() => {
            // 滚动到对应分组
            if (sectionListRef.current) {
              (sectionListRef.current as any).scrollToLocation({
                sectionIndex: index,
                itemIndex: 0,
                viewOffset: 0,
                animated: true,
              });
            }
          }}
        >
          <Text style={[styles.alphabetText, { color: colors.primary }]}>{initial}</Text>
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      
      {/* 搜索框 */}
      <View style={[styles.searchContainer, { backgroundColor: colors.backgroundSecondary, borderBottomColor: colors.borderLight }]}>
        <View style={[styles.searchInputContainer, { 
          backgroundColor: colors.background, 
          borderColor: colors.border,
          borderWidth: 1,
        }]}>
          <Ionicons name="search" size={16} color={colors.textTertiary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="搜索联系人"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.placeholder}
          />
        </View>
      </View>

      {/* 功能区域 */}
      <View style={[styles.featuresContainer, { backgroundColor: colors.backgroundSecondary, borderBottomColor: colors.background, borderBottomWidth: 8 }]}>
        {contactFeatures.map((feature, index) => (
          <View key={feature.id}>
            {renderFeatureItem({ item: feature })}
            {index < contactFeatures.length - 1 && <View style={[styles.separator, { backgroundColor: colors.borderLight, marginLeft: 64 }]} />}
          </View>
        ))}
      </View>

      {/* 联系人列表 */}
      <View style={styles.listContainer}>
        <View style={[styles.contactsHeader, { backgroundColor: colors.backgroundSecondary, borderBottomColor: colors.borderLight }]}>
          <Text style={[styles.contactsCount, { color: colors.textSecondary }]}>通讯录 ({totalContacts})</Text>
          <TouchableOpacity style={styles.addContactButton} onPress={() => router.push('/wechat/contact-add' as any)}>
            <Ionicons name="person-add" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        {sections.length > 0 ? (
          <SectionList
            ref={sectionListRef}
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
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>没有找到相关联系人</Text>
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
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    padding: 0,  // 重置默认padding
    margin: 0,   // 重置默认margin
    textAlignVertical: 'center', // 垂直居中文字
    includeFontPadding: false, // 防止字体padding影响布局
    ...Platform.select({
      android: {
        textAlignVertical: 'center', // 确保安卓上文字垂直居中
        padding: 0,
      },
      ios: {
        padding: 0,
      }
    })
  },
  featuresContainer: {
    borderBottomWidth: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureName: {
    flex: 1,
    fontSize: 16,
  },
  separator: {
    height: 0.5,
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
    borderBottomWidth: 0.5,
  },
  contactsCount: {
    fontSize: 14,
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
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 4,
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
  },
  contactDescription: {
    fontSize: 12,
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
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});

export default ContactsScreen;