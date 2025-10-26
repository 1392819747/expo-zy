// 语法检查
const fs = require('fs');

try {
  const content = fs.readFileSync('/Volumes/64G/expo-zy/app/wechat/discover/moments.tsx', 'utf8');

  // 检查大括号平衡
  let open = 0, close = 0;
  for (let char of content) {
    if (char === '{') open++;
    if (char === '}') close++;
  }

  console.log('大括号平衡:', open === close ? '✓' : '✗ (' + (open - close) + ')');

  // 检查关键结构
  const hasReturn = content.includes('return (');
  const hasReturnEnd = content.includes('});');
  const hasFunctionEnd = content.includes('};');
  const hasStyles = content.includes('const styles = StyleSheet.create');
  const hasExport = content.includes('export default MomentsScreen;');

  console.log('结构检查:');
  console.log('  return (:', hasReturn ? '✓' : '✗');
  console.log('  });:', hasReturnEnd ? '✓' : '✗');
  console.log('  }; 函数结束:', hasFunctionEnd ? '✓' : '✗');
  console.log('  styles:', hasStyles ? '✓' : '✗');
  console.log('  export:', hasExport ? '✓' : '✗');

  if (open === close && hasReturn && hasReturnEnd && hasFunctionEnd && hasStyles && hasExport) {
    console.log('\n✅ 语法检查通过！');
  } else {
    console.log('\n❌ 语法检查失败');
  }

} catch (error) {
  console.error('❌ 读取错误:', error.message);
}