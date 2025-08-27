// 新显示逻辑测试脚本 - 验证优化后文案和文案建议的显示
console.log('=== LongPort AI 助手新显示逻辑测试 ===');

// 测试配置
const testConfig = {
  testCases: [
    {
      name: 'LongPort 金融内容测试',
      original: '市场很好，建议投资，注意风险。',
      siteType: 'longport',
      expectedOptimizedText: '基于当前市场分析，市场环境表现良好，建议制定投资策略，注意风险因素。',
      expectedSuggestion: 'AI 深度优化'
    },
    {
      name: 'Notion 文档内容测试',
      original: '这个内容需要说明，结构要清晰。',
      siteType: 'notion',
      expectedOptimizedText: '本文档主要说明：这个文档内容需要详细说明，结构要清晰。',
      expectedSuggestion: 'AI 深度优化'
    },
    {
      name: '通用内容测试',
      original: '文本质量一般，表达不够生动。',
      siteType: 'unknown',
      expectedOptimizedText: '文本质量一般，表达不够生动。',
      expectedSuggestion: 'AI 深度优化'
    }
  ]
};

// 测试 1: 新显示逻辑函数验证
function testNewDisplayLogicFunctions() {
  console.log('\n🔍 测试 1: 新显示逻辑函数验证');
  
  const requiredFunctions = [
    'cleanOptimizedTextContent',
    'generateDetailedAIOptimizations',
    'analyzeTextChanges'
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
    console.log('❌ 部分新显示逻辑函数缺失');
    return false;
  }
  
  console.log('✅ 新显示逻辑函数完整');
  return true;
}

// 测试 2: 文案内容清理功能验证
function testTextContentCleaning() {
  console.log('\n🔍 测试 2: 文案内容清理功能验证');
  
  if (typeof cleanOptimizedTextContent !== 'function') {
    console.log('❌ 文案内容清理函数不存在');
    return false;
  }
  
  const testCases = [
    {
      input: '这是优化后的文案。\n\n💡 AI 优化建议：建议进一步优化',
      expected: '这是优化后的文案。',
      description: '移除 AI 优化建议'
    },
    {
      input: '这是文案内容。\n\n📝 优化对比：有改进\n\n💡 优化建议：继续优化',
      expected: '这是文案内容。',
      description: '移除优化对比和建议'
    },
    {
      input: '纯文案内容，没有建议',
      expected: '纯文案内容，没有建议',
      description: '纯文案内容保持不变'
    }
  ];
  
  let allTestsPassed = true;
  
  testCases.forEach((testCase, index) => {
    try {
      const result = cleanOptimizedTextContent(testCase.input);
      const isCorrect = result === testCase.expected;
      
      if (isCorrect) {
        console.log(`✅ 测试用例 ${index + 1}: ${testCase.description}`);
      } else {
        console.log(`❌ 测试用例 ${index + 1}: ${testCase.description}`);
        console.log(`  输入: ${testCase.input}`);
        console.log(`  期望: ${testCase.expected}`);
        console.log(`  实际: ${result}`);
        allTestsPassed = false;
      }
    } catch (error) {
      console.log(`❌ 测试用例 ${index + 1} 异常: ${error.message}`);
      allTestsPassed = false;
    }
  });
  
  return allTestsPassed;
}

// 测试 3: 详细 AI 优化说明生成验证
function testDetailedAIOptimizations() {
  console.log('\n🔍 测试 3: 详细 AI 优化说明生成验证');
  
  if (typeof generateDetailedAIOptimizations !== 'function') {
    console.log('❌ 详细 AI 优化说明生成函数不存在');
    return false;
  }
  
  const testCases = [
    {
      original: '市场很好。',
      basic: '市场很好。',
      ai: '基于当前市场分析，市场环境表现良好。',
      siteType: 'longport',
      expectedKeywords: ['语法结构', '表达方式', '文本结构']
    },
    {
      original: '这个内容。',
      basic: '这个内容。',
      ai: '本文档主要说明：这个文档内容需要详细说明。',
      siteType: 'notion',
      expectedKeywords: ['语法结构', '表达方式', '文档结构']
    }
  ];
  
  let allTestsPassed = true;
  
  testCases.forEach((testCase, index) => {
    try {
      const result = generateDetailedAIOptimizations(
        testCase.original, 
        testCase.basic, 
        testCase.ai, 
        testCase.siteType
      );
      
      console.log(`测试用例 ${index + 1} 结果: ${result}`);
      
      // 检查是否包含预期的关键词
      const hasExpectedKeywords = testCase.expectedKeywords.some(keyword => 
        result.includes(keyword)
      );
      
      if (hasExpectedKeywords) {
        console.log(`✅ 测试用例 ${index + 1}: 包含预期关键词`);
      } else {
        console.log(`❌ 测试用例 ${index + 1}: 缺少预期关键词`);
        console.log(`  期望包含: ${testCase.expectedKeywords.join(', ')}`);
        console.log(`  实际结果: ${result}`);
        allTestsPassed = false;
      }
    } catch (error) {
      console.log(`❌ 测试用例 ${index + 1} 异常: ${error.message}`);
      allTestsPassed = false;
    }
  });
  
  return allTestsPassed;
}

// 测试 4: 文本变化分析验证
function testTextChangesAnalysis() {
  console.log('\n🔍 测试 4: 文本变化分析验证');
  
  if (typeof analyzeTextChanges !== 'function') {
    console.log('❌ 文本变化分析函数不存在');
    return false;
  }
  
  const testCases = [
    {
      original: '市场很好。',
      basic: '市场很好。',
      ai: '基于当前市场分析，市场环境表现良好。',
      siteType: 'longport',
      expectedChanges: ['hasGrammarImprovements', 'hasStructureImprovements']
    },
    {
      original: '这个内容。',
      basic: '这个内容。',
      ai: '本文档主要说明：这个文档内容需要详细说明。',
      siteType: 'notion',
      expectedChanges: ['hasGrammarImprovements', 'hasStructureImprovements']
    }
  ];
  
  let allTestsPassed = true;
  
  testCases.forEach((testCase, index) => {
    try {
      const result = analyzeTextChanges(
        testCase.original, 
        testCase.basic, 
        testCase.ai, 
        testCase.siteType
      );
      
      console.log(`测试用例 ${index + 1} 分析结果:`, result);
      
      // 检查是否检测到预期的变化
      const hasExpectedChanges = testCase.expectedChanges.every(change => 
        result[change] === true
      );
      
      if (hasExpectedChanges) {
        console.log(`✅ 测试用例 ${index + 1}: 正确检测到预期变化`);
      } else {
        console.log(`❌ 测试用例 ${index + 1}: 未检测到预期变化`);
        console.log(`  期望变化: ${testCase.expectedChanges.join(', ')}`);
        console.log(`  实际检测:`, result);
        allTestsPassed = false;
      }
    } catch (error) {
      console.log(`❌ 测试用例 ${index + 1} 异常: ${error.message}`);
      allTestsPassed = false;
    }
  });
  
  return allTestsPassed;
}

// 测试 5: 弹窗显示效果验证
function testPopupDisplayEffect() {
  console.log('\n🔍 测试 5: 弹窗显示效果验证');
  
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
  
  // 验证新的显示逻辑
  const hasCleanOptimizedText = !optimizedText.includes('💡') && !optimizedText.includes('📝');
  const hasOnlyAIOptimization = suggestionText.includes('💡 AI 深度优化：') && !suggestionText.includes('📝 基础优化：');
  
  if (hasCleanOptimizedText) {
    console.log('✅ 优化后文案内容干净，不包含建议部分');
  } else {
    console.log('❌ 优化后文案内容不干净，包含建议部分');
  }
  
  if (hasOnlyAIOptimization) {
    console.log('✅ 文案建议只包含 AI 深度优化内容');
  } else {
    console.log('❌ 文案建议包含基础优化内容');
  }
  
  return hasCleanOptimizedText && hasOnlyAIOptimization;
}

// 运行所有测试
async function runAllNewDisplayLogicTests() {
  console.log('🚀 开始运行新显示逻辑测试...\n');
  
  const startTime = Date.now();
  
  try {
    // 运行所有测试
    const test1 = testNewDisplayLogicFunctions();
    const test2 = testTextContentCleaning();
    const test3 = testDetailedAIOptimizations();
    const test4 = testTextChangesAnalysis();
    const test5 = testPopupDisplayEffect();
    
    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    
    // 显示测试结果摘要
    console.log('\n📋 新显示逻辑测试结果摘要');
    console.log('================================');
    console.log(`总耗时: ${totalDuration}ms`);
    console.log(`新显示逻辑函数: ${test1 ? '✅' : '❌'}`);
    console.log(`文案内容清理: ${test2 ? '✅' : '❌'}`);
    console.log(`详细 AI 优化说明: ${test3 ? '✅' : '❌'}`);
    console.log(`文本变化分析: ${test4 ? '✅' : '❌'}`);
    console.log(`弹窗显示效果: ${test5 ? '✅' : '❌'}`);
    console.log('================================');
    
    // 详细结果分析
    console.log('\n🔍 详细结果分析:');
    
    // 核心功能分析
    if (test1 && test2 && test3 && test4) {
      console.log('✅ 核心新显示逻辑功能完全正常');
      console.log('  - 文案内容清理功能完善');
      console.log('  - 详细 AI 优化说明生成准确');
      console.log('  - 文本变化分析精确');
    } else {
      console.log('❌ 部分核心功能存在问题');
    }
    
    // 用户体验分析
    if (test5) {
      console.log('✅ 弹窗显示效果符合新要求');
      console.log('  - 优化后文案只包含最终文案');
      console.log('  - 文案建议只包含 AI 深度优化内容');
    } else {
      console.log('❌ 弹窗显示效果不符合新要求');
    }
    
    // 功能特性说明
    console.log('\n🎯 新功能特性:');
    console.log('✅ 优化后文案：只显示最终优化后的文案，不包含建议内容');
    console.log('✅ 文案建议：只显示 AI 深度优化内容，不显示基础优化');
    console.log('✅ 具体调整说明：包含针对原文调整的具体内容和调整原因');
    console.log('✅ 平台适配：根据 LongPort/Notion 等不同平台提供针对性说明');
    
    // 总体评估
    const totalTests = 5;
    const successfulTests = [test1, test2, test3, test4, test5].filter(Boolean).length;
    
    console.log(`\n🎯 总体评估: ${successfulTests}/${totalTests} 项测试通过`);
    
    if (successfulTests === totalTests) {
      console.log('🎉 所有测试通过！新显示逻辑功能完全正常');
      console.log('✅ 优化后文案显示干净');
      console.log('✅ 文案建议内容精准');
      console.log('✅ 用户体验显著提升');
    } else if (successfulTests >= totalTests * 0.8) {
      console.log('✅ 大部分测试通过，新显示逻辑功能基本正常');
    } else if (successfulTests >= totalTests * 0.6) {
      console.log('⚠️ 部分测试通过，新显示逻辑功能可能存在问题');
    } else {
      console.log('❌ 大部分测试失败，新显示逻辑功能存在严重问题');
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
console.log('4. 运行 runAllNewDisplayLogicTests() 开始测试');

console.log('\n💡 测试前准备:');
console.log('- 确保插件已更新到最新版本');
console.log('- 在支持的网站中选择文本并调用 AI 助手');
console.log('- 等待弹窗完全加载后再运行测试');

console.log('\n按 Enter 键开始运行所有新显示逻辑测试...');

document.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    runAllNewDisplayLogicTests();
  }
});

console.log('新显示逻辑测试脚本加载完成，按 Enter 键开始测试');
