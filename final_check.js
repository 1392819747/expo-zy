// 最终语法检查
const fs = require('fs');

try {
  const content = fs.readFileSync('/Volumes/64G/expo-zy/app/wechat/discover/moments.tsx', 'utf8');

  // 简单的语法检查
  console.log('文件长度:', content.length);

  // 检查关键结构
  const hasReturn = content.includes('return (');
  const hasReturnEnd = content.includes(');');
  const hasFunctionEnd = content.includes('};');
  const hasStyles = content.includes('const styles = StyleSheet.create');
  const hasExport = content.includes('export default MomentsScreen;');

  console.log('结构检查:');
  console.log('  return (:', hasReturn ? '✓' : '✗');
  console.log('  );:', hasReturnEnd ? '✓' : '✗');
  console.log('  };:', hasFunctionEnd ? '✓' : '✗');
  console.log('  styles:', hasStyles ? '✓' : '✗');
  console.log('  export:', hasExport ? '✓' : '✗');

  if (hasReturn && hasReturnEnd && hasFunctionEnd && hasStyles && hasExport) {
    console.log('\n✅ 基本结构检查通过！');
  } else {
    console.log('\n❌ 基本结构检查失败');
  }

} catch (error) {
  console.error('❌ 文件读取错误:', error.message);
}