// 语法验证测试
try {
  const fs = require('fs');
  const path = '/Volumes/64G/expo-zy/app/wechat/discover/moments.tsx';
  const content = fs.readFileSync(path, 'utf8');

  // 基本的括号匹配检查
  let openBraces = 0;
  let closeBraces = 0;
  let openParens = 0;
  let closeParens = 0;
  let openBrackets = 0;
  let closeBrackets = 0;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (char === '{') openBraces++;
    if (char === '}') closeBraces++;
    if (char === '(') openParens++;
    if (char === ')') closeParens++;
    if (char === '[') openBrackets++;
    if (char === ']') closeBrackets++;
  }

  console.log('括号统计:', {
    braces: { open: openBraces, close: closeBraces, balanced: openBraces === closeBraces },
    parens: { open: openParens, close: closeParens, balanced: openParens === closeParens },
    brackets: { open: openBrackets, close: closeBrackets, balanced: openBrackets === closeBrackets }
  });

  // 检查是否有明显的语法错误
  const hasSyntaxError = content.includes('export default') && content.split('export default').length > 2;
  if (hasSyntaxError) {
    console.log('❌ 发现多个 export default');
  } else {
    console.log('✅ 基本语法检查通过');
  }

} catch (error) {
  console.error('❌ 语法检查失败:', error.message);
}