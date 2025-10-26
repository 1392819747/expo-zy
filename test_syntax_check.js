// 简单的语法检查脚本
const fs = require('fs');

try {
  const content = fs.readFileSync('/Volumes/64G/expo-zy/app/wechat/discover/moments.tsx', 'utf8');

  // 基本的括号和标签匹配检查
  let openTags = 0;
  let closeTags = 0;
  let openParens = 0;
  let closeParens = 0;

  // 检查JSX标签
  const tagMatches = content.match(/<[^>]+>/g) || [];
  tagMatches.forEach(tag => {
    if (tag.startsWith('<') && !tag.startsWith('</') && !tag.endsWith('/>')) {
      openTags++;
    } else if (tag.startsWith('</')) {
      closeTags++;
    }
  });

  // 检查括号
  const parenMatches = content.match(/[()]/g) || [];
  parenMatches.forEach(char => {
    if (char === '(') openParens++;
    if (char === ')') closeParens++;
  });

  console.log('标签统计:', { openTags, closeTags, balanced: openTags === closeTags });
  console.log('括号统计:', { openParens, closeParens, balanced: openParens === closeParens });

  if (openTags === closeTags && openParens === closeParens) {
    console.log('✅ 语法检查通过 - 标签和括号数量匹配');
  } else {
    console.log('❌ 语法检查失败 - 标签或括号不匹配');
  }

} catch (error) {
  console.error('❌ 文件读取错误:', error.message);
}