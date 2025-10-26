// 语法验证测试
const fs = require('fs');

try {
  const content = fs.readFileSync('/Volumes/64G/expo-zy/app/wechat/discover/moments.tsx', 'utf8');

  // 检查大括号平衡
  let braceCount = 0;
  for (let char of content) {
    if (char === '{') braceCount++;
    if (char === '}') braceCount--;
  }

  console.log('大括号平衡检查:', braceCount === 0 ? '✓ 平衡' : '✗ 不平衡 (' + braceCount + ')');

  // 检查关键结构
  const lines = content.split('\n');
  console.log('文件总行数:', lines.length);

  // 检查第771行和第774行
  if (lines[770]) console.log('第771行:', lines[770].trim());
  if (lines[773]) console.log('第774行:', lines[773].trim());

  // 检查是否有export default
  const hasExport = content.includes('export default MomentsScreen;');
  console.log('export default:', hasExport ? '✓ 存在' : '✗ 缺失');

  if (braceCount === 0 && hasExport) {
    console.log('\n✅ 语法检查通过！');
  } else {
    console.log('\n❌ 语法检查失败');
  }

} catch (error) {
  console.error('❌ 文件读取错误:', error.message);
}