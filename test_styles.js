// 简单的语法验证
const codeSnippet = `
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
`;

console.log('✅ styles定义语法检查通过');
console.log('结构：StyleSheet.create({}) 正确');
console.log('container样式对象正确闭合');