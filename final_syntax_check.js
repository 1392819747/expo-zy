// 简单的语法检查
console.log('开始语法检查...');

// 读取文件
const fs = require('fs');
const path = '/Volumes/64G/expo-zy/app/wechat/discover/moments.tsx';

try {
  const content = fs.readFileSync(path, 'utf8');

  // 基本检查
  console.log('文件读取成功，长度:', content.length);

  // 检查关键部分
  const hasReturnStart = content.includes('return (');
  const hasReturnEnd = content.includes(');');
  const hasFunctionEnd = content.includes('};');
  const hasStylesStart = content.includes('const styles = StyleSheet.create({');
  const hasStylesEnd = content.includes('});');
  const hasExport = content.includes('export default MomentsScreen;');

  console.log('结构检查:');
  console.log('  return ( 开始:', hasReturnStart ? '✓' : '✗');
  console.log('  ); 结束:', hasReturnEnd ? '✓' : '✗');
  console.log('  }; 函数结束:', hasFunctionEnd ? '✓' : '✗');
  console.log('  styles 开始:', hasStylesStart ? '✓' : '✗');
  console.log('  styles 结束:', hasStylesEnd ? '✓' : '✗');
  console.log('  export default:', hasExport ? '✓' : '✗');

  // 检查大括号平衡
  let open = 0, close = 0;
  for (let char of content) {
    if (char === '{') open++;
    if (char === '}') close++;
  }
  console.log('大括号计数: 开', open, '闭', close, open === close ? '✓' : '✗');

  if (hasReturnStart && hasReturnEnd && hasFunctionEnd && hasStylesStart && hasStylesEnd && hasExport && open === close) {
    console.log('\n✅ 所有检查通过！语法应该正确。');
  } else {
    console.log('\n❌ 某些检查失败');
  }

} catch (error) {
  console.error('❌ 读取失败:', error.message);
}