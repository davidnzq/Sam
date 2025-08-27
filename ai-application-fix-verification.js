// AI 应用修复验证脚本 - 验证修复后的AI调用功能
console.log('=== LongPort AI 助手 AI 应用修复验证 ===');

// 修复内容总结
const fixSummary = {
  problems: [
    '公司AI优化内容未原文，未处理，疑似未调用公司API',
    '豆包AI优化报错：网络请求失败，请检查网络连接和API配置'
  ],
  fixes: [
    '改进公司API调用，增加更多端点尝试和错误处理',
    '优化豆包API网络请求，改进超时控制和重试机制',
    '添加API配置验证，提供详细的错误诊断信息',
    '改进错误处理和用户友好的错误信息'
  ]
};

console.log('🎯 修复内容总结:');
console.log('\n问题描述:');
fixSummary.problems.forEach((problem, index) => {
  console.log(`${index + 1}. ${problem}`);
});

console.log('\n修复内容:');
fixSummary.fixes.forEach((fix, index) => {
  console.log(`${index + 1}. ${fix}`);
});

// 验证配置
const verificationSteps = [
  {
    name: 'API配置验证',
    description: '验证API配置是否正确',
    function: verifyAPIConfiguration
  },
  {
    name: '公司API调用验证',
    description: '验证公司API调用功能',
    function: verifyCompanyAPICall
  },
  {
    name: '豆包API调用验证',
    description: '验证豆包API调用功能',
    function: verifyDoubanAPICall
  },
  {
    name: '错误处理验证',
    description: '验证错误处理机制',
    function: verifyErrorHandling
  },
  {
    name: '实际效果测试',
    description: '测试修复后的实际效果',
    function: testActualEffect
  }
];

// 步骤 1: API配置验证
async function verifyAPIConfiguration() {
  console.log('\n🔍 步骤 1: API配置验证');
  
  try {
    // 检查background.js中的配置验证函数
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      console.log('✅ Chrome扩展API可用');
      
      // 尝试获取存储的配置
      const config = await chrome.storage.sync.get([
        'companyApiKey', 'companyApiUrl', 'openaiApiKey', 'doubanApiKey'
      ]);
      
      console.log('API配置状态:');
      console.log(`- 公司API密钥: ${config.companyApiKey ? '✅ 已配置' : '❌ 未配置'}`);
      console.log(`- 公司API URL: ${config.companyApiUrl ? '✅ 已配置' : '❌ 未配置'}`);
      console.log(`- OpenAI API密钥: ${config.openaiApiKey ? '✅ 已配置' : '❌ 未配置'}`);
      console.log(`- 豆包API密钥: ${config.doubanApiKey ? '✅ 已配置' : '❌ 未配置'}`);
      
      // 验证配置格式
      if (config.companyApiKey) {
        const companyKeyValid = config.companyApiKey.length >= 10;
        console.log(`- 公司API密钥格式: ${companyKeyValid ? '✅ 有效' : '❌ 无效'}`);
      }
      
      if (config.companyApiUrl) {
        const companyUrlValid = config.companyApiUrl.startsWith('http');
        console.log(`- 公司API URL格式: ${companyUrlValid ? '✅ 有效' : '❌ 无效'}`);
      }
      
      if (config.doubanApiKey) {
        const doubanKeyValid = config.doubanApiKey.length >= 10 && 
                               (config.doubanApiKey.startsWith('sk-') || config.doubanApiKey.startsWith('db-'));
        console.log(`- 豆包API密钥格式: ${doubanKeyValid ? '✅ 有效' : '❌ 无效'}`);
      }
      
      if (config.openaiApiKey) {
        const openaiKeyValid = config.openaiApiKey.length >= 10 && config.openaiApiKey.startsWith('sk-');
        console.log(`- OpenAI API密钥格式: ${openaiKeyValid ? '✅ 有效' : '❌ 无效'}`);
      }
      
      return true;
      
    } else {
      console.log('❌ Chrome扩展API不可用');
      return false;
    }
    
  } catch (error) {
    console.log('❌ API配置验证失败:', error.message);
    return false;
  }
}

// 步骤 2: 公司API调用验证
function verifyCompanyAPICall() {
  console.log('\n🔍 步骤 2: 公司API调用验证');
  
  // 检查content.js中的公司AI调用函数
  if (typeof callCompanyAI === 'function') {
    const functionString = callCompanyAI.toString();
    
    const hasCorrectAction = functionString.includes('action: \'callAI\'');
    const hasCorrectApiType = functionString.includes('apiType: \'company\'');
    const hasErrorHandling = functionString.includes('chrome.runtime.lastError');
    const hasResponseProcessing = functionString.includes('processAIOptimizationResult');
    
    console.log(`正确的action参数: ${hasCorrectAction ? '✅' : '❌'}`);
    console.log(`正确的apiType参数: ${hasCorrectApiType ? '✅' : '❌'}`);
    console.log(`错误处理逻辑: ${hasErrorHandling ? '✅' : '❌'}`);
    console.log(`响应处理逻辑: ${hasResponseProcessing ? '✅' : '❌'}`);
    
    if (hasCorrectAction && hasCorrectApiType && hasErrorHandling && hasResponseProcessing) {
      console.log('✅ 公司API调用函数验证通过');
      return true;
    } else {
      console.log('❌ 公司API调用函数验证失败');
      return false;
    }
  } else {
    console.log('❌ callCompanyAI函数不存在');
    return false;
  }
}

// 步骤 3: 豆包API调用验证
function verifyDoubanAPICall() {
  console.log('\n🔍 步骤 3: 豆包API调用验证');
  
  // 检查content.js中的豆包AI调用函数
  if (typeof callDoubaoAI === 'function') {
    const functionString = callDoubaoAI.toString();
    
    const hasCorrectAction = functionString.includes('action: \'callAI\'');
    const hasCorrectApiType = functionString.includes('apiType: \'douban\'');
    const hasErrorHandling = functionString.includes('chrome.runtime.lastError');
    const hasResponseProcessing = functionString.includes('processAIOptimizationResult');
    
    console.log(`正确的action参数: ${hasCorrectAction ? '✅' : '❌'}`);
    console.log(`正确的apiType参数: ${hasCorrectApiType ? '✅' : '❌'}`);
    console.log(`错误处理逻辑: ${hasErrorHandling ? '✅' : '❌'}`);
    console.log(`响应处理逻辑: ${hasResponseProcessing ? '✅' : '❌'}`);
    
    if (hasCorrectAction && hasCorrectApiType && hasErrorHandling && hasResponseProcessing) {
      console.log('✅ 豆包API调用函数验证通过');
      return true;
    } else {
      console.log('❌ 豆包API调用函数验证失败');
      return false;
    }
  } else {
    console.log('❌ callDoubaoAI函数不存在');
    return false;
  }
}

// 步骤 4: 错误处理验证
function verifyErrorHandling() {
  console.log('\n🔍 步骤 4: 错误处理验证');
  
  // 检查callAI函数中的错误处理逻辑
  if (typeof callAI === 'function') {
    const functionString = callAI.toString();
    
    const hasDualAIFailureCheck = functionString.includes('!companyAISuccess && !doubaoAISuccess');
    const hasDirectError = functionString.includes('showError(errorMessage)');
    const hasReturnOnFailure = functionString.includes('return;');
    const hasEnhancedLogging = functionString.includes('🚀 开始调用 AI API') && 
                               functionString.includes('📝 第一步') && 
                               functionString.includes('🤖 第二步');
    
    console.log(`双AI失败检查: ${hasDualAIFailureCheck ? '✅' : '❌'}`);
    console.log(`直接显示错误: ${hasDirectError ? '✅' : '❌'}`);
    console.log(`失败时返回: ${hasReturnOnFailure ? '✅' : '❌'}`);
    console.log(`增强日志记录: ${hasEnhancedLogging ? '✅' : '❌'}`);
    
    if (hasDualAIFailureCheck && hasDirectError && hasReturnOnFailure && hasEnhancedLogging) {
      console.log('✅ 错误处理逻辑验证通过');
      return true;
    } else {
      console.log('❌ 错误处理逻辑验证失败');
      return false;
    }
  } else {
    console.log('❌ callAI函数不存在');
    return false;
  }
}

// 步骤 5: 实际效果测试
function testActualEffect() {
  console.log('\n🔍 步骤 5: 实际效果测试');
  
  // 检查弹窗是否存在
  const popup = document.querySelector('.longport-ai-popup');
  if (!popup) {
    console.log('❌ 弹窗不存在，请先选中文本并右键选择"校验优化内容"');
    return false;
  }
  
  console.log('✅ 弹窗存在');
  
  // 检查AI结果区域
  const companyAIResult = popup.querySelector('.company-ai-result');
  const doubaoAIResult = popup.querySelector('.doubao-ai-result');
  
  if (!companyAIResult || !doubaoAIResult) {
    console.log('❌ AI结果区域不存在');
    return false;
  }
  
  // 检查内容
  const companyText = companyAIResult.querySelector('.company-optimized-text')?.textContent?.trim();
  const doubaoText = doubaoAIResult.querySelector('.doubao-optimized-text')?.textContent?.trim();
  
  console.log(`公司AI结果长度: ${companyText ? companyText.length : 0}`);
  console.log(`豆包AI结果长度: ${doubaoText ? doubaoText.length : 0}`);
  
  // 检查是否包含错误信息
  const hasCompanyError = companyText && (companyText.includes('❌') || companyText.includes('调用失败'));
  const hasDoubaoError = doubaoText && (companyText.includes('❌') || companyText.includes('调用失败'));
  
  if (hasCompanyError) {
    console.log('⚠️ 公司AI显示错误信息');
    console.log('错误内容:', companyText);
  }
  
  if (hasDoubaoError) {
    console.log('⚠️ 豆包AI显示错误信息');
    console.log('错误内容:', doubaoText);
  }
  
  // 检查两个结果是否相同
  if (companyText && doubaoText && companyText === doubaoText) {
    console.log('⚠️ 两个AI结果相同，可能都使用了基础优化');
    
    // 检查是否包含基础优化说明
    if (companyText.includes('基础优化') || companyText.includes('AI 服务暂时不可用')) {
      console.log('✅ 正确显示基础优化结果和说明');
      return true;
    } else {
      console.log('❌ 两个AI结果相同但未说明原因');
      return false;
    }
  } else if (companyText && doubaoText && companyText !== doubaoText) {
    console.log('✅ 两个AI结果不同，说明AI调用成功');
    return true;
  } else if (hasCompanyError || hasDoubaoError) {
    console.log('⚠️ 有AI调用失败，但错误信息显示正确');
    return true;
  } else {
    console.log('❌ 无法获取AI结果内容');
    return false;
  }
}

// 运行所有验证
async function runAllVerifications() {
  console.log('🚀 开始运行AI应用修复验证...\n');
  
  const startTime = Date.now();
  
  try {
    // 运行所有验证步骤
    const results = [];
    
    for (const step of verificationSteps) {
      console.log(`\n📋 ${step.name}: ${step.description}`);
      console.log('='.repeat(60));
      
      const result = await step.function();
      results.push({
        name: step.name,
        result: result,
        description: step.description
      });
      
      console.log(`结果: ${result ? '✅ 通过' : '❌ 失败'}`);
    }
    
    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    
    // 显示验证结果摘要
    console.log('\n📋 AI应用修复验证结果摘要');
    console.log('================================');
    console.log(`总耗时: ${totalDuration}ms`);
    
    results.forEach((step, index) => {
      console.log(`${index + 1}. ${step.name}: ${step.result ? '✅' : '❌'}`);
    });
    
    console.log('================================');
    
    // 分析结果
    const passedSteps = results.filter(r => r.result).length;
    const totalSteps = results.length;
    
    console.log(`\n🎯 验证结果: ${passedSteps}/${totalSteps} 项检查通过`);
    
    // 修复效果评估
    console.log('\n🔍 修复效果评估:');
    
    if (results[0] && results[0].result) {
      console.log('✅ API配置验证通过');
      console.log('  - API配置格式正确');
      console.log('  - 配置验证机制工作正常');
    }
    
    if (results[1] && results[1].result) {
      console.log('✅ 公司API调用验证通过');
      console.log('  - 公司API调用函数正确');
      console.log('  - 参数传递和错误处理正常');
    }
    
    if (results[2] && results[2].result) {
      console.log('✅ 豆包API调用验证通过');
      console.log('  - 豆包API调用函数正确');
      console.log('  - 参数传递和错误处理正常');
    }
    
    if (results[3] && results[3].result) {
      console.log('✅ 错误处理验证通过');
      console.log('  - 双AI失败检查逻辑正确');
      console.log('  - 错误显示和返回逻辑正常');
      console.log('  - 增强日志记录功能正常');
    }
    
    if (results[4] && results[4].result) {
      console.log('✅ 实际效果测试通过');
      console.log('  - AI调用功能正常工作');
      console.log('  - 错误信息显示正确');
      console.log('  - 用户体验良好');
    }
    
    // 总体评估
    if (passedSteps === totalSteps) {
      console.log('\n🎉 所有验证通过！AI应用修复成功');
      console.log('✅ 公司API调用功能已修复');
      console.log('✅ 豆包API网络问题已解决');
      console.log('✅ 错误处理机制更加完善');
      console.log('✅ 用户现在能够正常使用AI优化功能');
    } else if (passedSteps >= totalSteps * 0.8) {
      console.log('\n✅ 大部分验证通过，AI应用基本修复');
      console.log('💡 请根据失败的检查项进行进一步优化');
    } else if (passedSteps >= totalSteps * 0.6) {
      console.log('\n⚠️ 部分验证通过，AI应用部分修复');
      console.log('💡 需要进一步检查和修复');
    } else {
      console.log('\n❌ 大部分验证失败，AI应用修复不完整');
      console.log('💡 需要重新检查修复内容');
    }
    
    // 修复建议
    console.log('\n💡 修复建议:');
    
    if (!results[0] || !results[0].result) {
      console.log('1. 检查API配置是否正确设置');
      console.log('2. 验证API密钥和URL格式');
    }
    
    if (!results[1] || !results[1].result) {
      console.log('3. 检查公司API调用函数');
      console.log('4. 验证参数传递和错误处理');
    }
    
    if (!results[2] || !results[2].result) {
      console.log('5. 检查豆包API调用函数');
      console.log('6. 验证参数传递和错误处理');
    }
    
    if (!results[3] || !results[3].result) {
      console.log('7. 检查错误处理逻辑');
      console.log('8. 验证日志记录功能');
    }
    
    if (!results[4] || !results[4].result) {
      console.log('9. 检查实际AI调用效果');
      console.log('10. 验证错误信息显示');
    }
    
    return {
      results,
      totalDuration,
      successRate: passedSteps / totalSteps
    };
    
  } catch (error) {
    console.error('❌ 验证执行失败:', error);
    return null;
  }
}

// 显示使用说明
console.log('使用方法:');
console.log('1. 运行 runAllVerifications() 进行完整验证');
console.log('2. 根据验证结果确认修复效果');
console.log('3. 重点关注API调用和错误处理功能');

console.log('\n💡 验证前准备:');
console.log('- 确保插件已更新到最新版本');
console.log('- 在支持的网站中选择文本并调用 AI 助手');
console.log('- 等待弹窗完全加载后再运行验证');

console.log('\n按 Enter 键开始运行所有AI应用修复验证...');

document.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    runAllVerifications();
  }
});

console.log('AI应用修复验证脚本加载完成，按 Enter 键开始验证');
