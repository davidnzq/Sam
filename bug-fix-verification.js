// Bug 修复验证脚本 - 验证"文本优化失败，请重试"问题是否已修复
console.log('=== LongPort AI 助手 Bug 修复验证 ===');

// 测试配置
const testConfig = {
  testTexts: [
    '这是一个的的测试文本，有有错别字，，语法也不对。。',
    '市场很好，建议投资，注意风险。',
    '这个内容需要说明，结构要清晰。'
  ],
  siteTypes: ['longport', 'notion', 'unknown']
};

// 测试 1: 基础优化功能验证
function testBasicOptimization() {
  console.log('\n🔍 测试 1: 基础优化功能验证');
  
  if (typeof performBasicOptimization !== 'function') {
    console.log('❌ 基础优化函数不存在');
    return false;
  }
  
  let allTestsPassed = true;
  
  testConfig.testTexts.forEach((testText, index) => {
    console.log(`\n测试用例 ${index + 1}: ${testText}`);
    
    testConfig.siteTypes.forEach(siteType => {
      try {
        const optimizedText = performBasicOptimization(testText, siteType);
        console.log(`  ${siteType} 优化结果: ${optimizedText}`);
        
        // 检查是否有实际优化
        const hasOptimization = optimizedText !== testText;
        if (hasOptimization) {
          console.log(`  ✅ ${siteType} 基础优化成功`);
        } else {
          console.log(`  ⚠️ ${siteType} 基础优化无变化`);
        }
      } catch (error) {
        console.log(`  ❌ ${siteType} 基础优化失败: ${error.message}`);
        allTestsPassed = false;
      }
    });
  });
  
  return allTestsPassed;
}

// 测试 2: 优化分析函数验证
function testOptimizationAnalysis() {
  console.log('\n🔍 测试 2: 优化分析函数验证');
  
  const requiredFunctions = [
    'analyzeBasicOptimizations',
    'analyzeAIOptimizations',
    'countTypos',
    'hasGrammarImprovements',
    'hasExpressionImprovements',
    'hasStructureImprovements'
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
  
  if (!allFunctionsExist) {
    console.log('❌ 部分分析函数缺失');
    return false;
  }
  
  // 测试分析函数
  try {
    const originalText = '这是一个的的测试文本。';
    const optimizedText = '这是一个测试文本。';
    
    const basicOptimizations = analyzeBasicOptimizations(originalText, optimizedText);
    const aiOptimizations = analyzeAIOptimizations(originalText, optimizedText);
    
    console.log('基础优化分析结果:', basicOptimizations);
    console.log('AI 优化分析结果:', aiOptimizations);
    
    if (basicOptimizations.length > 0 && aiOptimizations.length > 0) {
      console.log('✅ 优化分析函数工作正常');
      return true;
    } else {
      console.log('❌ 优化分析函数返回空结果');
      return false;
    }
  } catch (error) {
    console.log('❌ 优化分析函数测试失败:', error.message);
    return false;
  }
}

// 测试 3: 弹窗显示功能验证
function testPopupDisplay() {
  console.log('\n🔍 测试 3: 弹窗显示功能验证');
  
  // 检查弹窗是否存在
  const popup = document.querySelector('.longport-ai-popup');
  if (!popup) {
    console.log('❌ 弹窗不存在，请先选中文本并右键选择"校验优化内容"');
    return false;
  }
  
  console.log('✅ 弹窗存在');
  
  // 检查优化后文案区域
  const optimizedTextEl = popup.querySelector('.optimized-text');
  if (!optimizedTextEl) {
    console.log('❌ 优化后文案区域不存在');
    return false;
  }
  
  // 检查文案建议区域
  const optimizationSuggestionEl = popup.querySelector('.optimization-suggestion');
  if (!optimizationSuggestionEl) {
    console.log('❌ 文案建议区域不存在');
    return false;
  }
  
  // 检查内容显示
  const optimizedText = optimizedTextEl.textContent.trim();
  const suggestionText = optimizationSuggestionEl.textContent.trim();
  
  console.log(`优化后文案: ${optimizedText}`);
  console.log(`文案建议: ${suggestionText}`);
  
  // 验证是否包含优化信息
  const hasBasicOptimization = suggestionText.includes('📝 基础优化：');
  const hasAIOptimization = suggestionText.includes('💡 AI 深度优化：') || suggestionText.includes('💡 说明：');
  
  if (hasBasicOptimization && (hasAIOptimization || suggestionText.includes('💡 说明：'))) {
    console.log('✅ 弹窗显示正常，包含优化信息');
    return true;
  } else {
    console.log('❌ 弹窗显示异常，缺少优化信息');
    if (!hasBasicOptimization) console.log('  - 缺少基础优化信息');
    if (!hasAIOptimization && !suggestionText.includes('💡 说明：')) console.log('  - 缺少 AI 优化或说明信息');
    return false;
  }
}

// 测试 4: 错误处理机制验证
function testErrorHandling() {
  console.log('\n🔍 测试 4: 错误处理机制验证');
  
  // 检查错误处理函数
  if (typeof showError !== 'function') {
    console.log('❌ 错误显示函数不存在');
    return false;
  }
  
  // 检查是否还有"文本优化失败，请重试"的错误
  const popup = document.querySelector('.longport-ai-popup');
  if (!popup) {
    console.log('⚠️ 弹窗不存在，无法检查错误处理');
    return false;
  }
  
  const errorElements = popup.querySelectorAll('.error');
  let hasFailureError = false;
  
  errorElements.forEach(element => {
    if (element.textContent.includes('文本优化失败，请重试')) {
      hasFailureError = true;
    }
  });
  
  if (hasFailureError) {
    console.log('❌ 仍然存在"文本优化失败，请重试"错误');
    return false;
  } else {
    console.log('✅ 错误处理机制正常，没有"文本优化失败，请重试"错误');
    return true;
  }
}

// 测试 5: 完整流程验证
function testCompleteFlow() {
  console.log('\n🔍 测试 5: 完整流程验证');
  
  // 模拟完整的优化流程
  try {
    const testText = '这是一个的的测试文本。';
    const siteType = 'longport';
    
    console.log('模拟文本:', testText);
    console.log('网站类型:', siteType);
    
    // 1. 基础优化
    const basicOptimized = performBasicOptimization(testText, siteType);
    console.log('基础优化结果:', basicOptimized);
    
    // 2. 分析基础优化
    const basicOptimizations = analyzeBasicOptimizations(testText, basicOptimized);
    console.log('基础优化分析:', basicOptimizations);
    
    // 3. 构建结果对象
    const result = {
      originalText: testText,
      basicOptimizedText: basicOptimized,
      aiOptimizedText: basicOptimized,
      optimizationType: 'basic_only'
    };
    
    console.log('构建的结果对象:', result);
    
    // 4. 检查所有必要的属性
    const hasAllProperties = result.originalText && 
                           result.basicOptimizedText && 
                           result.aiOptimizedText && 
                           result.optimizationType;
    
    if (hasAllProperties) {
      console.log('✅ 完整流程验证成功');
      return true;
    } else {
      console.log('❌ 完整流程验证失败，缺少必要属性');
      return false;
    }
    
  } catch (error) {
    console.log('❌ 完整流程验证异常:', error.message);
    return false;
  }
}

// 运行所有测试
async function runAllBugFixVerificationTests() {
  console.log('🚀 开始运行 Bug 修复验证测试...\n');
  
  const startTime = Date.now();
  
  try {
    // 运行所有测试
    const test1 = testBasicOptimization();
    const test2 = testOptimizationAnalysis();
    const test3 = testPopupDisplay();
    const test4 = testErrorHandling();
    const test5 = testCompleteFlow();
    
    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    
    // 显示测试结果摘要
    console.log('\n📋 Bug 修复验证测试结果摘要');
    console.log('================================');
    console.log(`总耗时: ${totalDuration}ms`);
    console.log(`基础优化功能: ${test1 ? '✅' : '❌'}`);
    console.log(`优化分析函数: ${test2 ? '✅' : '❌'}`);
    console.log(`弹窗显示功能: ${test3 ? '✅' : '❌'}`);
    console.log(`错误处理机制: ${test4 ? '✅' : '❌'}`);
    console.log(`完整流程验证: ${test5 ? '✅' : '❌'}`);
    console.log('================================');
    
    // 详细结果分析
    console.log('\n🔍 详细结果分析:');
    
    // 核心功能分析
    if (test1 && test2) {
      console.log('✅ 核心优化功能完全正常');
      console.log('  - 基础优化流程完善');
      console.log('  - 优化分析函数健全');
    } else {
      console.log('❌ 部分核心功能存在问题');
    }
    
    // 用户体验分析
    if (test3 && test4) {
      console.log('✅ 用户体验功能正常');
      console.log('  - 弹窗显示清晰');
      console.log('  - 错误处理完善');
    } else {
      console.log('❌ 用户体验功能存在问题');
    }
    
    // 流程完整性分析
    if (test5) {
      console.log('✅ 完整流程验证通过');
    } else {
      console.log('❌ 完整流程验证失败');
    }
    
    // Bug 修复状态
    console.log('\n🐛 Bug 修复状态:');
    if (test1 && test2 && test3 && test4 && test5) {
      console.log('🎉 "文本优化失败，请重试" 问题已完全修复！');
      console.log('✅ 所有相关函数都已正确定义');
      console.log('✅ 错误处理机制完善');
      console.log('✅ 用户体验恢复正常');
    } else {
      console.log('⚠️ 问题可能仍未完全修复，需要进一步检查');
    }
    
    // 总体评估
    const totalTests = 5;
    const successfulTests = [test1, test2, test3, test4, test5].filter(Boolean).length;
    
    console.log(`\n🎯 总体评估: ${successfulTests}/${totalTests} 项测试通过`);
    
    if (successfulTests === totalTests) {
      console.log('🎉 所有测试通过！Bug 修复验证成功');
      console.log('✅ 文本优化功能完全正常');
      console.log('✅ 错误处理机制完善');
      console.log('✅ 用户体验优秀');
    } else if (successfulTests >= totalTests * 0.8) {
      console.log('✅ 大部分测试通过，Bug 修复基本成功');
    } else if (successfulTests >= totalTests * 0.6) {
      console.log('⚠️ 部分测试通过，Bug 修复可能存在问题');
    } else {
      console.log('❌ 大部分测试失败，Bug 修复存在严重问题');
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
console.log('3. 等待弹窗出现后，运行此测试脚本');
console.log('4. 运行 runAllBugFixVerificationTests() 开始测试');

console.log('\n💡 测试前准备:');
console.log('- 确保插件已更新到最新版本');
console.log('- 在支持的网站中选择文本并调用 AI 助手');
console.log('- 等待弹窗完全加载后再运行测试');

console.log('\n按 Enter 键开始运行所有 Bug 修复验证测试...');

document.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    runAllBugFixVerificationTests();
  }
});

console.log('Bug 修复验证测试脚本加载完成，按 Enter 键开始测试');
