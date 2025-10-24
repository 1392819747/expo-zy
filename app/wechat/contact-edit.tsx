import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { mockContacts } from '../../models/contacts';

export default function ContactEditScreen() {
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

  const [name, setName] = useState(contact?.name ?? '');
  const [description, setDescription] = useState(contact?.description ?? '');

  useEffect(() => {
    if (contact) {
      setName(contact.name);
      setDescription(contact.description ?? '');
    }
  }, [contact]);

  if (!contact) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>联系人不存在，无法编辑</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSave = () => {
    Alert.alert('已保存', '这是一个演示界面，暂未接入真实数据。');
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>编辑联系人</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>完成</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.formWrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>姓名</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="请输入姓名"
              placeholderTextColor="#999999"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>人物象形描述</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={description}
              onChangeText={setDescription}
              placeholder="描述性别、发型、表情、服饰以及场景等形象特征"
              placeholderTextColor="#999999"
              multiline
              textAlignVertical="top"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  saveButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#07C160',
    fontWeight: '600',
  },
  formWrapper: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 24,
  },
  fieldGroup: {
    gap: 12,
  },
  label: {
    fontSize: 14,
    color: '#666666',
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#222222',
    backgroundColor: '#fafafa',
  },
  multilineInput: {
    minHeight: 140,
    lineHeight: 22,
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
