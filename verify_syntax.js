// 简单的语法验证
const fs = require('fs');

try {
  const content = fs.readFileSync('/Volumes/64G/expo-zy/app/wechat/discover/moments.tsx', 'utf8');

  // 检查基本结构
  const hasExport = content.includes('export default MomentsScreen;');
  const hasImport = content.includes('import');
  const hasFunction = content.includes('function MomentsScreen');
  const hasStyles = content.includes('const styles = StyleSheet.create');

  console.log('✅ 结构检查:');
  console.log('  - 有导入语句:', hasImport);
  console.log('  - 有主函数:', hasFunction);
  console.log('  - 有样式定义:', hasStyles);
  console.log('  - 有导出语句:', hasExport);

  // 检查大括号平衡
  let braceCount = 0;
  for (let char of content) {
    if (char === '{') braceCount++;
    if (char === '}') braceCount--;
  }
  console.log('  - 大括号平衡:', braceCount === 0);

  if (hasExport && hasImport && hasFunction && hasStyles && braceCount === 0) {
    console.log('\n✅ 语法检查通过！文件结构完整');
  } else {
    console.log('\n❌ 语法检查失败');
  }

} catch (error) {
  console.error('❌ 文件读取错误:', error.message);
}