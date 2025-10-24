import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// 创建一个简单的Web兼容组件
const SimpleSearchBar = ({ 
  placeholder, 
  placeholderTextColor, 
  value, 
  onChangeText, 
  style 
}: {
  placeholder: string;
  placeholderTextColor: string;
  value: string;
  onChangeText: (text: string) => void;
  style: any;
}) => (
  <View style={[styles.searchInputGroup, style]}>
    <Ionicons name="search" size={16} color="#999999" style={styles.searchIcon} />
    <TextInput
      style={styles.searchInput}
      placeholder={placeholder}
      placeholderTextColor={placeholderTextColor}
      value={value}
      onChangeText={onChangeText}
      autoFocus={true}
    />
  </View>
);

// 原生环境的搜索组件
type SearchBarComponent = React.ComponentType<{
  placeholder: string;
  placeholderTextColor: string;
  fontColor: string;
  iconColor: string;
  shadowColor: string;
  backgroundColor: string;
  value: string;
  onChangeText: (text: string) => void;
  onClearPress: () => void;
  height: number;
  fontSize: number;
  style: any;
  textInputStyle: any;
  searchIconImageStyle: any;
  autoFocus: boolean;
}>;

let NativeSearchBar: SearchBarComponent | null = null;

// 动态导入原生搜索组件的函数
const loadNativeSearchBar = (): SearchBarComponent | null => {
  if (Platform.OS === 'web') {
    return null;
  }
  
  if (NativeSearchBar) {
    return NativeSearchBar;
  }
  
  try {
    NativeSearchBar = require('react-native-dynamic-search-bar').default as SearchBarComponent;
    return NativeSearchBar;
  } catch (error) {
    console.log('Failed to load react-native-dynamic-search-bar:', error);
    return null;
  }
};

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // 检测iOS 26及以上版本
  const isIOS26OrAbove = Platform.OS === 'ios' && parseInt(Platform.Version, 10) >= 26;
  
  // 获取原生搜索栏传递的查询参数
  const params = useLocalSearchParams<{ query?: string }>();
  
  // 如果有原生搜索栏的查询参数，则使用它
  useEffect(() => {
    if (params.query) {
      handleSearch(params.query);
    }
  }, [params.query]);

  // 模拟搜索结果
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim()) {
      setIsSearching(true);
      
      // 模拟搜索延迟
      setTimeout(() => {
        const mockResults = [
          `${query} - 聊天消息`,
          `${query} - 联系人`,
          `${query} - 群聊`,
          `${query} - 公众号`,
          `${query} - 小程序`,
        ];
        
        setSearchResults(mockResults);
        setIsSearching(false);
      }, 500);
    } else {
      setSearchResults([]);
    }
  };

  const handleResultClick = (result: string) => {
    // 点击搜索结果后返回
    router.back();
  };

  // iOS 26+使用原生搜索栏，不需要自定义搜索头部
  if (isIOS26OrAbove) {
    return (
      <SafeAreaView style={styles.nativeContainer}>
        {/* 搜索结果 */}
        <ScrollView style={styles.resultsContainer}>
          {searchQuery.trim() ? (
            <View>
              {isSearching ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>搜索中...</Text>
                </View>
              ) : (
                <View>
                  {searchResults.map((result, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.resultItem}
                      onPress={() => handleResultClick(result)}
                    >
                      <View style={styles.resultContent}>
                        <Ionicons name="search" size={16} color="#576b95" style={styles.resultIcon} />
                        <Text style={styles.resultText}>{result}</Text>
                      </View>
                      {index < searchResults.length - 1 && <View style={styles.separator} />}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>输入关键词开始搜索</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // 非iOS 26+使用 react-native-dynamic-search-bar 实现
  return (
    <SafeAreaView style={styles.container}>
      {/* 非iOS 26+使用 react-native-dynamic-search-bar 实现 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          {(() => {
            const searchBar = loadNativeSearchBar();
            return searchBar ? (
              React.createElement(searchBar, {
                placeholder: "搜索",
                placeholderTextColor: "#999999",
                fontColor: "#000",
                iconColor: "#999999",
                shadowColor: "transparent",
                backgroundColor: "#f0f0f0",
                value: searchQuery,
                onChangeText: handleSearch,
                onClearPress: () => {
                  setSearchQuery('');
                  setSearchResults([]);
                },
                height: 36,
                fontSize: 16,
                style: styles.dynamicSearchBar,
                textInputStyle: styles.searchInput,
                searchIconImageStyle: styles.searchIcon,
                autoFocus: true,
              })
            ) : (
              // Web环境或SearchBar不可用时使用简单替代方案
              <SimpleSearchBar
                placeholder="搜索"
                placeholderTextColor="#999999"
                value={searchQuery}
                onChangeText={handleSearch}
                style={styles.dynamicSearchBar}
              />
            );
          })()}
        </View>
        {Platform.OS === 'web' && searchQuery.length > 0 && (
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => {
              setSearchQuery('');
              setSearchResults([]);
            }}
          >
            <Text style={styles.cancelText}>取消</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 搜索结果 */}
      <ScrollView style={styles.resultsContainer}>
        {searchQuery.trim() ? (
          <View>
            {isSearching ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>搜索中...</Text>
              </View>
            ) : (
              <View>
                {searchResults.map((result, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.resultItem}
                    onPress={() => handleResultClick(result)}
                  >
                    <View style={styles.resultContent}>
                      <Ionicons name="search" size={16} color="#576b95" style={styles.resultIcon} />
                      <Text style={styles.resultText}>{result}</Text>
                    </View>
                    {index < searchResults.length - 1 && <View style={styles.separator} />}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>输入关键词开始搜索</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  nativeContainer: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    marginTop: 0, // 原生搜索栏已经占据顶部空间
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  backButton: {
    paddingRight: 12,
  },
  searchContainer: {
    flex: 1,
  },
  searchInputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dynamicSearchBar: {
    borderRadius: 6,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    padding: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
    paddingTop: 4,
    paddingBottom: 0,
    textAlign: 'left',
    textAlignVertical: 'center',
    includeFontPadding: false,
    height: 36,
    lineHeight: 20,
  },
  cancelButton: {
    paddingLeft: 12,
  },
  cancelText: {
    fontSize: 16,
    color: '#576b95',
  },
  resultsContainer: {
    flex: 1,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#999999',
  },
  resultItem: {
    backgroundColor: '#fff',
  },
  resultContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultIcon: {
    marginRight: 12,
  },
  resultText: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 44,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999999',
  },
});