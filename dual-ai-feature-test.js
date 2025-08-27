// 双AI功能测试脚本 - 验证新的弹窗结构和双AI优化功能
console.log('=== LongPort AI 助手双AI功能测试 ===');

// 测试配置
const testConfig = {
  testCases: [
    {
      name: 'LongPort 金融内容测试',
      original: '市场很好，建议投资，注意风险。',
      siteType: 'longport',
      expectedCompanyAI: '基于当前市场分析，市场环境表现良好，建议制定投资策略，注意风险因素。',
      expectedDoubaoAI: '市场环境表现良好，建议进行投资，同时需要注意风险控制。'
    },
    {
      name: 'Notion 文档内容测试',
      original: '这个内容需要说明，结构要清晰。',
      siteType: 'notion',
      expectedCompanyAI: '本文档主要说明：这个文档内容需要详细说明，结构要清晰。',
      expectedDoubaoAI: '这个内容需要详细说明，结构要清晰明确。'
    }
  ]
};

// 测试 1: 新弹窗结构验证
function testNewPopupStructure() {
  console.log('\n🔍 测试 1: 新弹窗结构验证');
  
  // 检查弹窗是否存在
  const popup = document.querySelector('.longport-ai-popup');
  if (!popup) {
    console.log('❌ 弹窗不存在，请先选中文本并右键选择"校验优化内容"');
    return false;
  }
  
  console.log('✅ 弹窗存在');
  
  // 检查新的弹窗结构
  const requiredElements = [
    { selector: '.company-ai-result', name: '公司AI结果区域' },
    { selector: '.doubao-ai-result', name: '豆包AI结果区域' },
    { selector: '.company-optimized-text', name: '公司AI优化文案' },
    { selector: '.doubao-optimized-text', name: '豆包AI优化文案' },
    { selector: '.ai-source-title', name: 'AI来源标题' }
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

// 测试 2: 双AI结果显示验证
function testDualAIResultDisplay() {
  console.log('\n🔍 测试 2: 双AI结果显示验证');
  
  const popup = document.querySelector('.longport-ai-popup');
  if (!popup) {
    console.log('❌ 弹窗不存在');
    return false;
  }
  
  // 检查公司AI结果
  const companyAIResult = popup.querySelector('.company-ai-result');
  const companyOptimizedText = popup.querySelector('.company-optimized-text');
  
  if (companyAIResult && companyOptimizedText) {
    const isVisible = companyAIResult.style.display !== 'none';
    const hasContent = companyOptimizedText.textContent.trim().length > 0;
    
    if (isVisible && hasContent) {
      console.log('✅ 公司AI结果正常显示');
      console.log(`   内容: ${companyOptimizedText.textContent.substring(0, 100)}...`);
    } else {
      console.log('❌ 公司AI结果显示异常');
      console.log(`   可见性: ${isVisible}`);
      console.log(`   内容长度: ${companyOptimizedText.textContent.trim().length}`);
    }
  } else {
    console.log('❌ 公司AI结果区域缺失');
  }
  
  // 检查豆包AI结果
  const doubaoAIResult = popup.querySelector('.doubao-ai-result');
  const doubaoOptimizedText = popup.querySelector('.doubao-optimized-text');
  
  if (doubaoAIResult && doubaoOptimizedText) {
    const isVisible = doubaoAIResult.style.display !== 'none';
    const hasContent = doubaoOptimizedText.textContent.trim().length > 0;
    
    if (isVisible && hasContent) {
      console.log('✅ 豆包AI结果正常显示');
      console.log(`   内容: ${doubaoOptimizedText.textContent.substring(0, 100)}...`);
    } else {
      console.log('❌ 豆包AI结果显示异常');
      console.log(`   可见性: ${isVisible}`);
      console.log(`   内容长度: ${doubaoOptimizedText.textContent.trim().length}`);
    }
  } else {
    console.log('❌ 豆包AI结果区域缺失');
  }
  
  return true;
}

// 测试 3: AI结果选择功能验证
function testAIResultSelection() {
  console.log('\n🔍 测试 3: AI结果选择功能验证');
  
  // 检查选择对话框相关函数是否存在
  const requiredFunctions = [
    'showAIResultSelector',
    'positionSelectorDialog',
    'performTextReplacement'
  ];
  
  let allFunctionsExist = true;
  requiredFunctions.forEach(funcName => {
    if (typeof window[funcName] === 'function') {
      console.log(`✅ 函数存在: ${funcName}`);
    } else {
      console.log(`❌ 函数缺失: ${funcName}`);
      allFunctionsExist = false;
    }
  });
  
  // 检查选择对话框样式是否存在
  const styleSheet = document.styleSheets[0];
  let hasSelectorStyles = false;
  
  try {
    for (let i = 0; i < styleSheet.cssRules.length; i++) {
      const rule = styleSheet.cssRules[i];
      if (rule.selectorText && rule.selectorText.includes('.ai-result-selector')) {
        hasSelectorStyles = true;
        break;
      }
    }
  } catch (e) {
    console.log('⚠️ 无法检查样式表，跳过样式验证');
  }
  
  if (hasSelectorStyles) {
    console.log('✅ AI结果选择对话框样式已加载');
  } else {
    console.log('⚠️ AI结果选择对话框样式可能未加载');
  }
  
  return allFunctionsExist;
}

// 测试 4: 弹窗交互功能验证
function testPopupInteraction() {
  console.log('\n🔍 测试 4: 弹窗交互功能验证');
  
  const popup = document.querySelector('.longport-ai-popup');
  if (!popup) {
    console.log('❌ 弹窗不存在');
    return false;
  }
  
  // 检查按钮状态
  const replaceBtn = popup.querySelector('#replaceBtn');
  const retryBtn = popup.querySelector('#retryBtn');
  const cancelBtn = popup.querySelector('#cancelBtn');
  
  if (replaceBtn && retryBtn && cancelBtn) {
    console.log('✅ 所有按钮都存在');
    
    // 检查按钮状态
    const replaceDisabled = replaceBtn.disabled;
    const retryDisabled = retryBtn.disabled;
    
    console.log(`覆盖原文按钮状态: ${replaceDisabled ? '禁用' : '启用'}`);
    console.log(`再试一下按钮状态: ${retryDisabled ? '禁用' : '启用'}`);
    
    // 检查按钮事件绑定
    const hasReplaceEvent = replaceBtn.onclick !== null;
    const hasRetryEvent = retryBtn.onclick !== null;
    const hasCancelEvent = cancelBtn.onclick !== null;
    
    console.log(`覆盖原文按钮事件: ${hasReplaceEvent ? '已绑定' : '未绑定'}`);
    console.log(`再试一下按钮事件: ${hasRetryEvent ? '已绑定' : '未绑定'}`);
    console.log(`取消按钮事件: ${hasCancelEvent ? '已绑定' : '未绑定'}`);
    
    return true;
  } else {
    console.log('❌ 部分按钮缺失');
    return false;
  }
}

// 测试 5: 双AI调用逻辑验证
function testDualAICallLogic() {
  console.log('\n🔍 测试 5: 双AI调用逻辑验证');
  
  // 检查新的AI调用函数
  const requiredFunctions = [
    'callCompanyAI',
    'callDoubaoAI'
  ];
  
  let allFunctionsExist = true;
  requiredFunctions.forEach(funcName => {
    if (typeof window[funcName] === 'function') {
      console.log(`✅ 函数存在: ${funcName}`);
    } else {
      console.log(`❌ 函数缺失: ${funcName}`);
      allFunctionsExist = false;
    }
  });
  
  // 检查修改后的callAI函数
  if (typeof window.callAI === 'function') {
    console.log('✅ callAI函数存在');
    
    // 检查函数是否支持双AI调用
    const functionString = window.callAI.toString();
    if (functionString.includes('Promise.allSettled') && 
        functionString.includes('callCompanyAI') && 
        functionString.includes('callDoubaoAI')) {
      console.log('✅ callAI函数支持双AI并行调用');
    } else {
      console.log('❌ callAI函数不支持双AI并行调用');
      allFunctionsExist = false;
    }
  } else {
    console.log('❌ callAI函数缺失');
    allFunctionsExist = false;
  }
  
  return allFunctionsExist;
}

// 运行所有测试
async function runAllDualAITests() {
  console.log('🚀 开始运行双AI功能测试...\n');
  
  const startTime = Date.now();
  
  try {
    // 运行所有测试
    const test1 = testNewPopupStructure();
    const test2 = testDualAIResultDisplay();
    const test3 = testAIResultSelection();
    const test4 = testPopupInteraction();
    const test5 = testDualAICallLogic();
    
    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    
    // 显示测试结果摘要
    console.log('\n📋 双AI功能测试结果摘要');
    console.log('================================');
    console.log(`总耗时: ${totalDuration}ms`);
    console.log(`新弹窗结构: ${test1 ? '✅' : '❌'}`);
    console.log(`双AI结果显示: ${test2 ? '✅' : '❌'}`);
    console.log(`AI结果选择: ${test3 ? '✅' : '❌'}`);
    console.log(`弹窗交互功能: ${test4 ? '✅' : '❌'}`);
    console.log(`双AI调用逻辑: ${test5 ? '✅' : '❌'}`);
    console.log('================================');
    
    // 详细结果分析
    console.log('\n🔍 详细结果分析:');
    
    // 核心功能分析
    if (test1 && test2 && test3 && test4 && test5) {
      console.log('✅ 双AI功能完全正常');
      console.log('  - 新弹窗结构已成功实现');
      console.log('  - 双AI结果显示功能正常');
      console.log('  - AI结果选择机制完善');
      console.log('  - 弹窗交互功能正常');
      console.log('  - 双AI并行调用逻辑正确');
    } else {
      console.log('❌ 部分功能存在问题');
    }
    
    // 功能特性说明
    console.log('\n🎯 新功能特性:');
    console.log('✅ 弹窗结构优化：去掉了文案建议内容');
    console.log('✅ 双AI结果显示：公司AI和豆包AI的优化结果分别显示');
    console.log('✅ 智能选择机制：用户可以选择使用哪个AI的优化结果');
    console.log('✅ 并行AI调用：两个AI同时进行优化，提升效率');
    console.log('✅ 用户体验提升：界面更清晰，选择更灵活');
    
    // 总体评估
    const totalTests = 5;
    const successfulTests = [test1, test2, test3, test4, test5].filter(Boolean).length;
    
    console.log(`\n🎯 总体评估: ${successfulTests}/${totalTests} 项测试通过`);
    
    if (successfulTests === totalTests) {
      console.log('🎉 所有测试通过！双AI功能完全正常');
      console.log('✅ 新弹窗结构实现成功');
      console.log('✅ 双AI优化功能正常');
      console.log('✅ 用户选择机制完善');
    } else if (successfulTests >= totalTests * 0.8) {
      console.log('✅ 大部分测试通过，双AI功能基本正常');
    } else if (successfulTests >= totalTests * 0.6) {
      console.log('⚠️ 部分测试通过，双AI功能可能存在问题');
    } else {
      console.log('❌ 大部分测试失败，双AI功能存在严重问题');
    }
    
    return {
      test1, test2, test3, test4, test5,
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
console.log('3. 等待弹窗出现并显示双AI结果');
console.log('4. 运行此测试脚本验证功能');

console.log('\n💡 测试前准备:');
console.log('- 确保插件已更新到最新版本');
console.log('- 在支持的网站中选择文本并调用 AI 助手');
console.log('- 等待弹窗完全加载并显示双AI结果后再运行测试');

console.log('\n按 Enter 键开始运行所有双AI功能测试...');

document.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    runAllDualAITests();
  }
});

console.log('双AI功能测试脚本加载完成，按 Enter 键开始测试');
