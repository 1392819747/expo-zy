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
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../../hooks/useThemeColors';
import { mockContacts } from '../../models/contacts';

export default function ContactEditScreen() {
  const { colors, isDark } = useThemeColors();
  const router = useRouter();
  const navigation = useNavigation();
  const safeAreaInsets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  
  // 判断是否为 iOS 26+ 或 Android
  const isIOS26OrAbove = Platform.OS === 'ios' && Number.parseInt(String(Platform.Version), 10) >= 26;
  const isAndroid = Platform.OS === 'android';
  const hasNativeHeader = isIOS26OrAbove; // 只有iOS 26+有原生导航栏
  const safeAreaEdges = hasNativeHeader ? ['left', 'right', 'bottom'] : ['top', 'left', 'right', 'bottom'];

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

  // 配置 iOS 原生导航栏深色模式和右侧按钮
  useEffect(() => {
    if (isIOS26OrAbove) {
      navigation.setOptions({
        title: '编辑联系人',
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          color: colors.text,
        },
        headerShadowVisible: false,
        headerRight: () => (
          <TouchableOpacity onPress={handleSave} style={{ paddingRight: 4 }}>
            <Text style={{ fontSize: 16, color: colors.primary, fontWeight: '600' }}>完成</Text>
          </TouchableOpacity>
        ),
      });
    }
  }, [navigation, colors, isIOS26OrAbove]);

  if (!contact) {
    return (
      <>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={safeAreaEdges}>
          <View style={styles.emptyStateContainer}>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>联系人不存在，无法编辑</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  const handleSave = () => {
    Alert.alert('已保存', '这是一个演示界面，暂未接入真实数据。');
    router.back();
  };

  const handleAvatarPress = () => {
    Alert.alert('上传头像', '此功能暂未开放', [
      { text: '取消', style: 'cancel' },
      { text: '从相册选择', onPress: () => Alert.alert('提示', '功能开发中') },
    ]);
  };

  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={safeAreaEdges}>
        {/* Android 状态栏安全区 */}
        {isAndroid && (
          <View style={{ height: safeAreaInsets.top, backgroundColor: colors.background }} />
        )}
        
        {/* Android 自定义导航栏 */}
        {isAndroid && (
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>编辑联系人</Text>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={[styles.saveButtonText, { color: colors.primary }]}>完成</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* iOS 26 以下自定义导航栏 */}
      {!isAndroid && !isIOS26OrAbove && (
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>编辑联系人</Text>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={[styles.saveButtonText, { color: colors.primary }]}>完成</Text>
          </TouchableOpacity>
        </View>
      )}

      <KeyboardAvoidingView
        style={styles.formWrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <ScrollView
          style={[styles.scrollView, { backgroundColor: colors.background }]}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* 头像编辑 */}
          <View style={styles.avatarSection}>
            <TouchableOpacity 
              style={styles.avatarEditButton}
              onPress={handleAvatarPress}
              activeOpacity={0.7}
            >
              <View style={[styles.avatarLarge, { backgroundColor: colors.avatarBackground }]}>
                <Text style={styles.avatarTextLarge}>{contact?.avatar || contact?.name.charAt(0)}</Text>
              </View>
              <View style={[styles.avatarEditBadge, { backgroundColor: colors.primary }]}>
                <Ionicons name="camera" size={16} color="#ffffff" />
              </View>
            </TouchableOpacity>
            <Text style={[styles.avatarHint, { color: colors.textTertiary }]}>点击更换头像</Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>姓名</Text>
            <TextInput
              style={[styles.input, { 
                color: colors.text, 
                backgroundColor: colors.inputBackground,
                borderColor: colors.inputBorder,
              }]}
              value={name}
              onChangeText={setName}
              placeholder="请输入姓名"
              placeholderTextColor={colors.placeholder}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>人物形象描述</Text>
            <TextInput
              style={[styles.input, styles.multilineInput, { 
                color: colors.text,
                backgroundColor: colors.inputBackground,
                borderColor: colors.inputBorder,
              }]}
              value={description}
              onChangeText={setDescription}
              placeholder="描述性别、发型、表情、服饰以及场景等形象特征"
              placeholderTextColor={colors.placeholder}
              multiline
              textAlignVertical="top"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      </SafeAreaView>
    </>
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
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  avatarEditButton: {
    position: 'relative',
  },
  avatarLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#07C160',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarTextLarge: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ffffff',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#07C160',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  avatarHint: {
    fontSize: 14,
    color: '#999999',
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
    paddingTop: 14,
    paddingBottom: 10,
    fontSize: 16,
    color: '#222222',
    backgroundColor: '#fafafa',
    textAlignVertical: 'center',
    textAlign: 'left',
    includeFontPadding: false,
    height: 48,
    lineHeight: 20,
  },
  multilineInput: {
    minHeight: 140,
    height: 140,
    lineHeight: 22,
    textAlignVertical: 'top',
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
