import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ApiTab from '../components/api-settings/ApiTab';
import MemoryTab from '../components/api-settings/MemoryTab';
import PersonalityTab from '../components/api-settings/PersonalityTab';
import WorldBookTab from '../components/api-settings/WorldBookTab';

type TabType = 'api' | 'worldbook' | 'memory' | 'personality';

export default function ApiSettingsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('api');

  const renderContent = () => {
    switch (activeTab) {
      case 'api':
        return <ApiTab />;
      case 'worldbook':
        return <WorldBookTab />;
      case 'memory':
        return <MemoryTab />;
      case 'personality':
        return <PersonalityTab />;
      default:
        return <ApiTab />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#0a0a0a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI 设置</Text>
        <View style={styles.headerButtonPlaceholder} />
      </View>

      <View style={styles.content}>
        {renderContent()}
      </View>

      {/* 底部标签栏 */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'api' && styles.tabItemActive]}
          onPress={() => setActiveTab('api')}
        >
          <Ionicons
            name="cloud"
            size={24}
            color={activeTab === 'api' ? '#4B9BFF' : '#94a3b8'}
          />
          <Text style={[styles.tabLabel, activeTab === 'api' && styles.tabLabelActive]}>
            API
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'worldbook' && styles.tabItemActive]}
          onPress={() => setActiveTab('worldbook')}
        >
          <Ionicons
            name="book"
            size={24}
            color={activeTab === 'worldbook' ? '#4B9BFF' : '#94a3b8'}
          />
          <Text style={[styles.tabLabel, activeTab === 'worldbook' && styles.tabLabelActive]}>
            世界书
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'memory' && styles.tabItemActive]}
          onPress={() => setActiveTab('memory')}
        >
          <Ionicons
            name="albums"
            size={24}
            color={activeTab === 'memory' ? '#4B9BFF' : '#94a3b8'}
          />
          <Text style={[styles.tabLabel, activeTab === 'memory' && styles.tabLabelActive]}>
            记忆系统
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'personality' && styles.tabItemActive]}
          onPress={() => setActiveTab('personality')}
        >
          <Ionicons
            name="happy"
            size={24}
            color={activeTab === 'personality' ? '#4B9BFF' : '#94a3b8'}
          />
          <Text style={[styles.tabLabel, activeTab === 'personality' && styles.tabLabelActive]}>
            情感个性
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f9fc'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e9eefc'
  },
  headerButtonPlaceholder: {
    width: 40,
    height: 40
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#101828'
  },
  content: {
    flex: 1
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 8
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8
  },
  tabItemActive: {
    borderTopWidth: 2,
    borderTopColor: '#4B9BFF'
  },
  tabLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4
  },
  tabLabelActive: {
    color: '#4B9BFF',
    fontWeight: '600'
  }
});
