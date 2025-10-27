import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
    FlatList,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';
import { Contact, getAllInitials, groupContactsByInitial, mockContacts, searchContacts } from '../../models/contacts';

const ContactListScreen = () => {
  const { colors, isDark } = useThemeColors();
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
      <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.searchInputContainer, {
          backgroundColor: isDark ? 'rgba(118, 118, 128, 0.24)' : 'rgba(142, 142, 147, 0.12)',
        }]}>
          <Ionicons name="search" size={18} color={isDark ? 'rgba(235, 235, 245, 0.6)' : 'rgba(60, 60, 67, 0.6)'} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="搜索"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={isDark ? 'rgba(235, 235, 245, 0.6)' : 'rgba(60, 60, 67, 0.6)'}
            returnKeyType="search"
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
    backgroundColor: '#f5f5f5', // 微信风格的浅灰色背景
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: '400',
    color: '#333',
    padding: 0,
    margin: 0,
    includeFontPadding: false,
    ...Platform.select({
      android: {
        textAlignVertical: 'center',
        paddingTop: 10,
        paddingBottom: 0,
        paddingVertical: 0,
        paddingHorizontal: 0,
        height: 40,
      },
      ios: {
        paddingVertical: 0,
        paddingHorizontal: 0,
        paddingTop: -10,
        paddingBottom: 0,
        height: 40,
      }
    })
  },
  listContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f5f5f5', // 与整体背景一致
  },
  flatList: {
    flex: 1,
    paddingRight: 20,
    backgroundColor: '#f5f5f5', // 与整体背景一致
  },
  sectionHeader: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e5e5', // 添加分隔线
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase', // 字母索引大写显示
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e5e5',
    backgroundColor: '#ffffff', // 联系人项保持白色背景
    // 添加微妙的阴影效果
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#07C160',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    // 添加微妙的阴影效果
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
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
    marginBottom: 2, // 为描述留出空间
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
    right: 8,
    top: '50%',
    transform: [{ translateY: -100 }],
    justifyContent: 'center',
    alignItems: 'center',
    width: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)', // 半透明背景
    borderRadius: 10,
  },
  alphabetItem: {
    paddingVertical: 2,
    paddingHorizontal: 4, // 增加水平内边距
  },
  alphabetText: {
    fontSize: 12,
    color: '#07C160',
    fontWeight: '600', // 更粗的字体
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5', // 与整体背景一致
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default ContactListScreen;