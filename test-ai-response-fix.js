// 测试AI响应修复的脚本

console.log('🧪 开始测试AI响应修复...');

// 模拟Chrome扩展环境
const mockChrome = {
  runtime: {
    sendMessage: async (message) => {
      console.log('📤 发送消息:', message);
      
      // 模拟background.js的响应
      if (message.action === 'callAI') {
        console.log('🤖 模拟AI调用...');
        
        // 模拟延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 模拟优化结果
        const mockResult = `这是优化后的文案：${message.text}。已进行专业优化，提升了表达清晰度和专业性。`;
        
        console.log('✅ 模拟AI返回结果:', mockResult);
        
        return {
          success: true,
          optimizedText: mockResult,
          result: mockResult,
          text: mockResult,
          message: 'AI优化成功'
        };
      }
      
      return { success: false, error: '未知操作' };
    }
  }
};

// 模拟options.js中的startAITest函数
async function testStartAITest() {
  console.log('🚀 测试startAITest函数...');
  
  const inputText = '这是一个测试文案，需要优化。';
  const siteType = 'longport';
  const optimizationType = 'deep_optimization';
  
  try {
    // 调用AI进行优化
    const response = await mockChrome.runtime.sendMessage({
      action: 'callAI',
      text: inputText,
      apiType: 'company',
      siteType: siteType,
      optimizationType: optimizationType
    });
    
    console.log('📥 AI响应:', response);
    
    if (response && response.success) {
      // 安全地获取优化后的文本 - 支持多种可能的字段名
      let optimizedText = '';
      
      // 按优先级尝试不同的字段
      if (response.optimizedText && typeof response.optimizedText === 'string' && response.optimizedText.trim().length > 0) {
        optimizedText = response.optimizedText;
        console.log('✅ 从optimizedText字段获取到结果');
      } else if (response.result && typeof response.result === 'string' && response.result.trim().length > 0) {
        optimizedText = response.result;
        console.log('✅ 从result字段获取到结果');
      } else if (response.text && typeof response.text === 'string' && response.text.trim().length > 0) {
        optimizedText = response.text;
        console.log('✅ 从text字段获取到结果');
      } else if (response.optimized_text && typeof response.optimized_text === 'string' && response.optimized_text.trim().length > 0) {
        optimizedText = response.optimized_text;
        console.log('✅ 从optimized_text字段获取到结果');
      } else if (response.data && typeof response.data === 'string' && response.data.trim().length > 0) {
        optimizedText = response.data;
        console.log('✅ 从data字段获取到结果');
      }
      
      // 检查是否成功获取到优化文本
      if (optimizedText && optimizedText.trim().length > 0) {
        console.log('🎉 测试成功！获取到优化文本:', optimizedText);
        return { success: true, optimizedText: optimizedText };
      } else {
        // 优化结果为空或无效
        console.error('❌ AI返回的优化结果为空或格式无效:', response);
        return { success: false, error: 'AI返回的优化结果为空或格式无效' };
      }
    } else {
      // 显示错误结果
      const errorMessage = response?.error || response?.message || 'AI优化失败';
      console.error('❌ AI优化失败:', errorMessage);
      return { success: false, error: errorMessage };
    }
    
  } catch (error) {
    console.error('❌ AI测试失败:', error);
    return { success: false, error: error.message };
  }
}

// 运行测试
async function runTest() {
  console.log('🧪 运行AI响应修复测试...');
  
  const result = await testStartAITest();
  
  if (result.success) {
    console.log('🎉 测试通过！AI响应修复成功！');
    console.log('📊 优化结果:', result.optimizedText);
  } else {
    console.log('❌ 测试失败:', result.error);
  }
}

// 执行测试
runTest();
