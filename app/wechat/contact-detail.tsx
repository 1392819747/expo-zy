import React, { useMemo } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { mockContacts } from '../../models/contacts';

export default function ContactDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();

  const contactId = useMemo(() => {
    if (Array.isArray(id)) {
      return id[0];
    }
    return id ?? '';
  }, [id]);

  const contact = useMemo(
    () => mockContacts.find((item) => item.id === contactId),
    [contactId],
  );

  if (!contact) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>联系人不存在</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleEditContact = () => {
    router.push({
      pathname: '/wechat/contact-edit',
      params: { id: contact.id },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>详情</Text>
        <TouchableOpacity style={styles.editButton} onPress={handleEditContact}>
          <Text style={styles.editButtonText}>编辑</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{contact.avatar || contact.name.charAt(0)}</Text>
          </View>
          <Text style={styles.contactName}>{contact.name}</Text>
          <Text style={styles.contactDescription}>
            {contact.description || '这是一位神秘的联系人，快去完善描述吧～'}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5e5',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  editButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  editButtonText: {
    fontSize: 16,
    color: '#07C160',
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 24,
    paddingVertical: 40,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#07C160',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ffffff',
  },
  contactName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 16,
  },
  contactDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555555',
    textAlign: 'center',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666666',
  },
});
