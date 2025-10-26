// 语法验证测试
const fs = require('fs');

try {
  const content = fs.readFileSync('/Volumes/64G/expo-zy/app/wechat/discover/moments.tsx', 'utf8');

  // 检查大括号平衡
  let braceCount = 0;
  let parenCount = 0;
  let bracketCount = 0;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (char === '{') braceCount++;
    if (char === '}') braceCount--;
    if (char === '(') parenCount++;
    if (char === ')') parenCount--;
    if (char === '[') bracketCount++;
    if (char === ']') bracketCount--;
  }

  console.log('括号统计:');
  console.log('  大括号:', braceCount === 0 ? '✓ 平衡' : '✗ 不平衡 (' + braceCount + ')');
  console.log('  小括号:', parenCount === 0 ? '✓ 平衡' : '✗ 不平衡 (' + parenCount + ')');
  console.log('  方括号:', bracketCount === 0 ? '✓ 平衡' : '✗ 不平衡 (' + bracketCount + ')');

  // 检查关键结构
  const hasExport = content.includes('export default MomentsScreen;');
  const hasImport = content.includes('import');
  const hasFunction = content.includes('function MomentsScreen');
  const hasStyles = content.includes('const styles = StyleSheet.create');

  console.log('\n结构检查:');
  console.log('  导入语句:', hasImport ? '✓ 存在' : '✗ 缺失');
  console.log('  主函数:', hasFunction ? '✓ 存在' : '✗ 缺失');
  console.log('  样式定义:', hasStyles ? '✓ 存在' : '✗ 缺失');
  console.log('  导出语句:', hasExport ? '✓ 存在' : '✗ 缺失');

  if (braceCount === 0 && hasExport && hasImport && hasFunction && hasStyles) {
    console.log('\n✅ 语法检查通过！');
  } else {
    console.log('\n❌ 语法检查失败');
  }

} catch (error) {
  console.error('❌ 文件读取错误:', error.message);
}