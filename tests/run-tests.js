// tests/run-tests.js
// 测试运行脚本

console.log('=== 文案优化边界约束测试 ===');
console.log('开始时间:', new Date().toISOString());
console.log('-'.repeat(50));

// 运行测试
async function runAllTests() {
  try {
    // 测试lint功能
    console.log('\n运行Lint测试...');
    await require('./test-lint');
    
    // 测试API功能
    console.log('\n运行API测试...');
    await require('./test-api');
    
    console.log('\n所有测试已完成');
  } catch (error) {
    console.error('测试运行失败:', error);
    process.exit(1);
  }
}

runAllTests();
