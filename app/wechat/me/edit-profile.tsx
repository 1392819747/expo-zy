import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { getUserProfile, updateUserProfile } from '../../../models/user';

export default function EditProfileScreen() {
  const { colors } = useThemeColors();
  const router = useRouter();
  
  // 判断是否为iOS 26及以上系统
  const isIOS26OrAbove = Platform.OS === 'ios' && Number.parseInt(String(Platform.Version), 10) >= 26;
  
  // 用户信息状态
  const [name, setName] = useState('');
  const [wechatId, setWechatId] = useState('');
  const [region, setRegion] = useState('');
  const [signature, setSignature] = useState('');

  // 加载用户信息
  useEffect(() => {
    const profile = getUserProfile();
    setName(profile.name);
    setWechatId(profile.wechatId);
    setRegion(profile.region);
    setSignature(profile.signature);
  }, []);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('提示', '名字不能为空');
      return;
    }
    
    if (!wechatId.trim()) {
      Alert.alert('提示', '微信号不能为空');
      return;
    }
    
    // 保存用户信息
    updateUserProfile({
      name: name.trim(),
      wechatId: wechatId.trim(),
      region,
      signature: signature.trim(),
    });
    
    Alert.alert('成功', '个人信息已保存', [
      { text: '确定', onPress: () => router.back() }
    ]);
  };

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      edges={isIOS26OrAbove ? ['left', 'right', 'bottom'] : ['top', 'left', 'right', 'bottom']}
    >
      {isIOS26OrAbove && <StatusBar barStyle="dark-content" />}
      
      {/* 顶部导航栏 */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>个人信息</Text>
        <TouchableOpacity style={styles.headerButton} onPress={handleSave}>
          <Text style={[styles.saveButton, { color: colors.primary }]}>保存</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 头像 */}
        <TouchableOpacity 
          style={[styles.itemContainer, { backgroundColor: colors.backgroundSecondary, borderBottomColor: colors.borderLight }]}
          onPress={() => Alert.alert('提示', '头像修改功能开发中')}
        >
          <Text style={[styles.label, { color: colors.text }]}>头像</Text>
          <View style={styles.rightContent}>
            <View style={[styles.avatar, { backgroundColor: colors.avatarBackground }]}>
              <Text style={styles.avatarText}>{name.charAt(0)}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </View>
        </TouchableOpacity>

        {/* 名字 */}
        <View style={[styles.itemContainer, { backgroundColor: colors.backgroundSecondary, borderBottomColor: colors.borderLight }]}>
          <Text style={[styles.label, { color: colors.text }]}>名字</Text>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            value={name}
            onChangeText={setName}
            placeholder="请输入名字"
            placeholderTextColor={colors.textTertiary}
            maxLength={20}
          />
        </View>

        {/* 微信号 */}
        <View style={[styles.itemContainer, { backgroundColor: colors.backgroundSecondary, borderBottomColor: colors.borderLight }]}>
          <Text style={[styles.label, { color: colors.text }]}>微信号</Text>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            value={wechatId}
            onChangeText={setWechatId}
            placeholder="请输入微信号"
            placeholderTextColor={colors.textTertiary}
            maxLength={20}
            autoCapitalize="none"
          />
        </View>

        {/* 地区 */}
        <TouchableOpacity 
          style={[styles.itemContainer, { backgroundColor: colors.backgroundSecondary, borderBottomColor: colors.borderLight, marginTop: 12 }]}
          onPress={() => Alert.alert('提示', '地区选择功能开发中')}
        >
          <Text style={[styles.label, { color: colors.text }]}>地区</Text>
          <View style={styles.rightContent}>
            <Text style={[styles.valueText, { color: colors.textSecondary }]}>{region}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </View>
        </TouchableOpacity>

        {/* 个性签名 */}
        <View style={[styles.itemContainer, { backgroundColor: colors.backgroundSecondary, borderBottomColor: colors.borderLight }]}>
          <Text style={[styles.label, { color: colors.text }]}>个性签名</Text>
          <TextInput
            style={[styles.input, styles.signatureInput, { color: colors.text }]}
            value={signature}
            onChangeText={setSignature}
            placeholder="设置个性签名"
            placeholderTextColor={colors.textTertiary}
            maxLength={50}
            multiline
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  headerButton: {
    width: 60,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'right',
  },
  content: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
  },
  label: {
    fontSize: 16,
    width: 80,
  },
  rightContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  input: {
    flex: 1,
    fontSize: 16,
    textAlign: 'right',
    padding: 0,
  },
  signatureInput: {
    textAlign: 'left',
    minHeight: 40,
  },
  valueText: {
    fontSize: 16,
    marginRight: 8,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#07C160',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
});
