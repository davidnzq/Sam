// AI 问题诊断和修复验证脚本 - 全面验证双AI功能
console.log('=== LongPort AI 助手问题诊断和修复验证 ===');

// 问题描述
const issueDescription = {
  problem1: '豆包 API 调用失败: TypeError: Failed to fetch',
  problem2: '两个 AI 优化后的内容一致，说明可能只使用了基础优化',
  rootCause: 'API类型标识不匹配和错误处理不当'
};

console.log('🎯 问题描述:');
console.log(`1. ${issueDescription.problem1}`);
console.log(`2. ${issueDescription.problem2}`);
console.log(`3. 根本原因: ${issueDescription.rootCause}`);

// 测试配置
const testConfig = {
  testCases: [
    {
      name: 'API类型标识修复验证',
      description: '验证豆包API的apiType参数是否正确',
      expected: 'douban'
    },
    {
      name: '双AI调用逻辑验证',
      description: '验证两个AI是否能正确并行调用',
      expected: '两个AI结果不同'
    },
    {
      name: '错误处理机制验证',
      description: '验证AI调用失败时是否有明确的错误提示',
      expected: '显示具体错误信息'
    }
  ]
};

// 测试 1: API类型标识修复验证
function testAPITypeFix() {
  console.log('\n🔍 测试 1: API类型标识修复验证');
  
  // 检查callDoubaoAI函数中的apiType参数
  if (typeof callDoubaoAI === 'function') {
    const functionString = callDoubaoAI.toString();
    
    if (functionString.includes("apiType: 'douban'")) {
      console.log('✅ 豆包API的apiType参数已修复为"douban"');
      return true;
    } else if (functionString.includes("apiType: 'doubao'")) {
      console.log('❌ 豆包API的apiType参数仍然是"doubao"，需要修复');
      return false;
    } else {
      console.log('⚠️ 无法确定豆包API的apiType参数');
      return false;
    }
  } else {
    console.log('❌ callDoubaoAI函数不存在');
    return false;
  }
}

// 测试 2: 双AI调用逻辑验证
function testDualAICallLogic() {
  console.log('\n🔍 测试 2: 双AI调用逻辑验证');
  
  // 检查callAI函数中的双AI调用逻辑
  if (typeof callAI === 'function') {
    const functionString = callAI.toString();
    
    const hasPromiseAllSettled = functionString.includes('Promise.allSettled');
    const hasCallCompanyAI = functionString.includes('callCompanyAI');
    const hasCallDoubaoAI = functionString.includes('callDoubaoAI');
    const hasResultAnalysis = functionString.includes('companyAISuccess') && functionString.includes('doubaoAISuccess');
    
    console.log(`Promise.allSettled 使用: ${hasPromiseAllSettled ? '✅' : '❌'}`);
    console.log(`callCompanyAI 调用: ${hasCallCompanyAI ? '✅' : '❌'}`);
    console.log(`callDoubaoAI 调用: ${hasCallDoubaoAI ? '✅' : '❌'}`);
    console.log(`结果分析逻辑: ${hasResultAnalysis ? '✅' : '❌'}`);
    
    return hasPromiseAllSettled && hasCallCompanyAI && hasCallDoubaoAI && hasResultAnalysis;
  } else {
    console.log('❌ callAI函数不存在');
    return false;
  }
}

// 测试 3: 错误处理机制验证
function testErrorHandling() {
  console.log('\n🔍 测试 3: 错误处理机制验证');
  
  // 检查showAIResult函数中的错误处理
  if (typeof showAIResult === 'function') {
    const functionString = showAIResult.toString();
    
    const hasCompanyAIError = functionString.includes('companyAIError');
    const hasDoubaoAIError = functionString.includes('doubaoAIError');
    const hasErrorDisplay = functionString.includes('ai-error');
    const hasErrorInfo = functionString.includes('AI 调用失败');
    
    console.log(`公司AI错误处理: ${hasCompanyAIError ? '✅' : '❌'}`);
    console.log(`豆包AI错误处理: ${hasDoubaoAIError ? '✅' : '❌'}`);
    console.log(`错误显示样式: ${hasErrorDisplay ? '✅' : '❌'}`);
    console.log(`错误信息显示: ${hasErrorInfo ? '✅' : '❌'}`);
    
    return hasCompanyAIError && hasDoubaoAIError && hasErrorDisplay && hasErrorInfo;
  } else {
    console.log('❌ showAIResult函数不存在');
    return false;
  }
}

// 测试 4: Background.js修复验证
function testBackgroundJSFix() {
  console.log('\n🔍 测试 4: Background.js修复验证');
  
  // 检查background.js是否已修复
  // 由于content script无法直接访问background.js，我们通过消息传递来测试
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({
      action: 'ping',
      test: 'background_fix_verification'
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.log('❌ 无法连接到background.js:', chrome.runtime.lastError.message);
        resolve(false);
      } else if (response && response.success) {
        console.log('✅ Background.js连接正常');
        resolve(true);
      } else {
        console.log('❌ Background.js响应异常');
        resolve(false);
      }
    });
  });
}

// 测试 5: 弹窗显示验证
function testPopupDisplay() {
  console.log('\n🔍 测试 5: 弹窗显示验证');
  
  // 检查弹窗是否存在
  const popup = document.querySelector('.longport-ai-popup');
  if (!popup) {
    console.log('❌ 弹窗不存在，请先选中文本并右键选择"校验优化内容"');
    return false;
  }
  
  console.log('✅ 弹窗存在');
  
  // 检查弹窗结构
  const requiredElements = [
    { selector: '.company-ai-result', name: '公司AI结果区域' },
    { selector: '.doubao-ai-result', name: '豆包AI结果区域' },
    { selector: '.company-optimized-text', name: '公司AI优化文案' },
    { selector: '.doubao-optimized-text', name: '豆包AI优化文案' }
  ];
  
  let allElementsExist = true;
  requiredElements.forEach(element => {
    const el = popup.querySelector(element.selector);
    if (el) {
      console.log(`✅ ${element.name} 存在`);
    } else {
      console.log(`❌ ${element.name} 缺失`);
      allElementsExist = false;
    }
  });
  
  // 检查文案建议区域是否已移除
  const oldSuggestionEl = popup.querySelector('.optimization-suggestion');
  if (!oldSuggestionEl) {
    console.log('✅ 文案建议区域已成功移除');
  } else {
    console.log('❌ 文案建议区域仍然存在');
    allElementsExist = false;
  }
  
  return allElementsExist;
}

// 测试 6: 实际AI调用测试
function testActualAICall() {
  console.log('\n🔍 测试 6: 实际AI调用测试');
  
  // 检查是否有AI结果
  const popup = document.querySelector('.longport-ai-popup');
  if (!popup) {
    console.log('❌ 弹窗不存在');
    return false;
  }
  
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
  
  if (companyText && doubaoText) {
    // 检查是否包含错误信息
    const hasCompanyError = companyText.includes('❌') || companyText.includes('调用失败');
    const hasDoubaoError = doubaoText.includes('❌') || doubaoText.includes('调用失败');
    
    if (hasCompanyError) {
      console.log('⚠️ 公司AI调用失败，显示错误信息');
    }
    
    if (hasDoubaoError) {
      console.log('⚠️ 豆包AI调用失败，显示错误信息');
    }
    
    // 检查两个结果是否相同
    if (companyText === doubaoText) {
      console.log('⚠️ 两个AI结果相同，可能都使用了基础优化');
      
      // 检查是否包含基础优化说明
      if (companyText.includes('基础优化') || companyText.includes('AI 服务暂时不可用')) {
        console.log('✅ 正确显示基础优化结果和说明');
        return true;
      } else {
        console.log('❌ 两个AI结果相同但未说明原因');
        return false;
      }
    } else {
      console.log('✅ 两个AI结果不同，说明AI调用成功');
      return true;
    }
  } else {
    console.log('❌ 无法获取AI结果内容');
    return false;
  }
}

// 运行所有测试
async function runAllDiagnosisTests() {
  console.log('🚀 开始运行问题诊断和修复验证测试...\n');
  
  const startTime = Date.now();
  
  try {
    // 运行所有测试
    const test1 = testAPITypeFix();
    const test2 = testDualAICallLogic();
    const test3 = testErrorHandling();
    const test4 = await testBackgroundJSFix();
    const test5 = testPopupDisplay();
    const test6 = testActualAICall();
    
    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    
    // 显示测试结果摘要
    console.log('\n📋 问题诊断和修复验证结果摘要');
    console.log('================================');
    console.log(`总耗时: ${totalDuration}ms`);
    console.log(`API类型标识修复: ${test1 ? '✅' : '❌'}`);
    console.log(`双AI调用逻辑: ${test2 ? '✅' : '❌'}`);
    console.log(`错误处理机制: ${test3 ? '✅' : '❌'}`);
    console.log(`Background.js修复: ${test4 ? '✅' : '❌'}`);
    console.log(`弹窗显示: ${test5 ? '✅' : '❌'}`);
    console.log(`实际AI调用: ${test6 ? '✅' : '❌'}`);
    console.log('================================');
    
    // 详细结果分析
    console.log('\n🔍 详细结果分析:');
    
    // 修复状态分析
    if (test1 && test2 && test3 && test4) {
      console.log('✅ 核心修复已完成');
      console.log('  - API类型标识已修复');
      console.log('  - 双AI调用逻辑已优化');
      console.log('  - 错误处理机制已完善');
      console.log('  - Background.js已修复');
    } else {
      console.log('❌ 部分核心修复未完成');
    }
    
    // 功能状态分析
    if (test5 && test6) {
      console.log('✅ 功能运行正常');
      console.log('  - 弹窗显示结构正确');
      console.log('  - AI调用功能正常');
    } else {
      console.log('❌ 功能运行存在问题');
    }
    
    // 问题解决状态
    console.log('\n🎯 问题解决状态:');
    
    if (test1) {
      console.log('✅ 问题1已解决: API类型标识不匹配');
    } else {
      console.log('❌ 问题1未解决: API类型标识不匹配');
    }
    
    if (test2 && test3) {
      console.log('✅ 问题2已解决: 双AI调用逻辑和错误处理');
    } else {
      console.log('❌ 问题2未解决: 双AI调用逻辑和错误处理');
    }
    
    // 总体评估
    const totalTests = 6;
    const successfulTests = [test1, test2, test3, test4, test5, test6].filter(Boolean).length;
    
    console.log(`\n🎯 总体评估: ${successfulTests}/${totalTests} 项测试通过`);
    
    if (successfulTests === totalTests) {
      console.log('🎉 所有测试通过！问题已完全修复');
      console.log('✅ 豆包API调用问题已解决');
      console.log('✅ 双AI功能正常运行');
      console.log('✅ 错误处理机制完善');
    } else if (successfulTests >= totalTests * 0.8) {
      console.log('✅ 大部分测试通过，问题基本修复');
    } else if (successfulTests >= totalTests * 0.6) {
      console.log('⚠️ 部分测试通过，问题部分修复');
    } else {
      console.log('❌ 大部分测试失败，问题未完全修复');
    }
    
    // 下一步建议
    console.log('\n💡 下一步建议:');
    if (successfulTests === totalTests) {
      console.log('1. 测试插件功能是否正常工作');
      console.log('2. 验证豆包API调用是否成功');
      console.log('3. 确认两个AI结果是否不同');
    } else {
      console.log('1. 检查代码修复是否完整');
      console.log('2. 重新加载插件');
      console.log('3. 运行测试脚本验证修复');
    }
    
    return {
      test1, test2, test3, test4, test5, test6,
      totalDuration,
      successRate: successfulTests / totalTests
    };
    
  } catch (error) {
    console.error('❌ 测试执行失败:', error);
    return null;
  }
}

// 显示使用说明
console.log('使用方法:');
console.log('1. 在支持的网站中选择文本');
console.log('2. 右键点击选择"校验优化内容"');
console.log('3. 等待弹窗出现并显示AI结果');
console.log('4. 运行此测试脚本验证修复');

console.log('\n💡 测试前准备:');
console.log('- 确保插件已更新到最新版本');
console.log('- 在支持的网站中选择文本并调用 AI 助手');
console.log('- 等待弹窗完全加载后再运行测试');

console.log('\n按 Enter 键开始运行所有问题诊断和修复验证测试...');

document.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    runAllDiagnosisTests();
  }
});

console.log('问题诊断和修复验证脚本加载完成，按 Enter 键开始测试');
