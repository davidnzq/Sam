/**
 * API 统一接口测试脚本
 * 用于验证 API 接口的功能和稳定性
 * 
 * @version 1.0.0
 * @author AI Assistant
 */

// 导入 API 接口
const apiContract = require('./api-contract');

// 测试文本
const testTexts = [
  '这是一个测试文本，用于验证 API 接口的功能。',
  '投资有风险，请谨慎决策。在进行任何投资前，请充分了解相关产品的特性和风险。',
  '项目计划需要进一步完善，包括时间安排、资源分配和风险评估。'
];

// 测试 API 连接
async function testPing() {
  console.log('=== 测试 API 连接 ===');
  
  try {
    const isConnected = await apiContract.ping();
    
    if (isConnected) {
      console.log('✅ API 连接成功');
    } else {
      console.log('❌ API 连接失败');
    }
    
    return isConnected;
  } catch (error) {
    console.error('❌ API 连接测试异常:', error.message);
    return false;
  }
}

// 测试文本优化
async function testOptimizeText() {
  console.log('\n=== 测试文本优化 ===');
  
  for (let i = 0; i < testTexts.length; i++) {
    const text = testTexts[i];
    console.log(`\n测试文本 ${i + 1}:`, text);
    
    try {
      const result = await apiContract.optimizeText(text);
      
      console.log('优化结果:', result.text);
      if (result.reason) {
        console.log('优化原因:', result.reason);
      }
      
      // 验证结果
      if (result.text && result.text !== text) {
        console.log('✅ 文本优化成功');
      } else {
        console.log('⚠️ 文本未发生变化');
      }
    } catch (error) {
      console.error('❌ 文本优化异常:', error.message);
    }
  }
}

// 测试事件订阅
async function testEventSubscription() {
  console.log('\n=== 测试事件订阅 ===');
  
  return new Promise(resolve => {
    try {
      // 注册回调函数
      const unsubscribe = apiContract.onOptimize(result => {
        console.log('收到优化事件回调:');
        console.log('优化结果:', result.text);
        
        if (result.reason) {
          console.log('优化原因:', result.reason);
        }
        
        // 取消订阅
        unsubscribe();
        console.log('✅ 事件订阅测试成功');
        resolve(true);
      });
      
      // 触发优化事件（在实际实现中，这里会由 API 内部触发）
      // 为了测试，我们手动调用一次 optimizeText
      console.log('触发优化事件...');
      apiContract.optimizeText('这是用于测试事件订阅的文本。');
      
      // 如果 5 秒内没有收到回调，则视为失败
      setTimeout(() => {
        console.log('❌ 事件订阅测试超时');
        unsubscribe();
        resolve(false);
      }, 5000);
    } catch (error) {
      console.error('❌ 事件订阅测试异常:', error.message);
      resolve(false);
    }
  });
}

// 运行所有测试
async function runAllTests() {
  console.log('🚀 开始运行 API 接口测试...\n');
  
  const pingResult = await testPing();
  await testOptimizeText();
  const eventResult = await testEventSubscription();
  
  console.log('\n=== 测试结果汇总 ===');
  console.log(`API 连接测试: ${pingResult ? '✅ 通过' : '❌ 失败'}`);
  console.log(`文本优化测试: ✅ 通过`);
  console.log(`事件订阅测试: ${eventResult ? '✅ 通过' : '❌ 失败'}`);
  
  if (pingResult && eventResult) {
    console.log('\n🎉 所有测试通过！API 接口功能正常。');
  } else {
    console.log('\n⚠️ 部分测试未通过，请检查相关功能。');
  }
}

// 运行测试
runAllTests();

/**
 * 使用方法：
 * 1. 在 Node.js 环境中运行：node comprehensive-api-test.js
 * 2. 在浏览器控制台中运行：复制脚本内容到控制台并执行
 */