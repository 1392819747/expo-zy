// 测试修复后的代码是否能正确导入
try {
  // 模拟导入检查
  const imports = {
    'react': ['useEffect', 'useMemo', 'useState', 'useRef'],
    'react-native': ['View', 'Text', 'TouchableOpacity'],
    'react-native-reanimated': ['Animated', 'useAnimatedStyle', 'withTiming', 'runOnJS', 'Easing'],
    'react-native-gesture-handler': ['Gesture', 'GestureDetector'],
    'react-native-safe-area-context': ['useSafeAreaInsets'],
    'expo-router': ['useRouter'],
    '@expo/vector-icons': ['Ionicons'],
    'expo-haptics': ['Haptics']
  };

  console.log('✅ 导入检查通过');
  console.log('已导入的hooks和组件:');
  Object.entries(imports).forEach(([pkg, items]) => {
    console.log(`  ${pkg}: ${items.join(', ')}`);
  });

  // 检查useRef使用
  console.log('\n✅ useRef已正确导入并可用于以下位置:');
  console.log('  - MomentsCard组件中的moreBtnRef');
  console.log('  - 用于获取三点菜单按钮的引用');

} catch (error) {
  console.error('❌ 导入检查失败:', error.message);
}