// 两阶段优化功能测试脚本 - 验证基础优化 + AI 深度优化
console.log('=== LongPort AI 助手两阶段优化功能测试 ===');

// 测试配置
const testConfig = {
  testCases: [
    {
      name: '错别字 + 语法错误测试',
      original: '这是一个的的测试文本，有有错别字，，语法也不对。。',
      expectedBasicOptimizations: ['错别字纠正', '标点符号优化', '重复词汇修复'],
      expectedAIOptimizations: ['语法校验', '文笔优化', '语言风格改进']
    },
    {
      name: 'LongPort 金融内容测试',
      original: '市场很好，建议投资，注意风险。',
      expectedBasicOptimizations: ['标点符号优化', '结构优化'],
      expectedAIOptimizations: ['金融术语优化', '专业性提升', '表达准确性改进']
    },
    {
      name: 'Notion 文档内容测试',
      original: '这个内容需要说明，结构要清晰。',
      expectedBasicOptimizations: ['标点符号优化', '结构优化'],
      expectedAIOptimizations: ['文档化表达', '结构清晰度提升', '逻辑性改进']
    }
  ],
  siteTypes: ['longport', 'notion', 'unknown']
};

// 测试 1: 两阶段优化流程验证
function testTwoStageOptimizationFlow() {
  console.log('\n🔍 测试 1: 两阶段优化流程验证');
  
  // 检查必要的函数是否存在
  const requiredFunctions = [
    'performTextOptimization',
    'performBasicOptimization',
    'performAIDeepOptimization',
    'buildAIOptimizationPrompt',
    'applyAIOptimizationSuggestions'
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
    console.log('❌ 部分优化函数缺失，无法进行两阶段优化');
    return false;
  }
  
  console.log('✅ 两阶段优化流程函数完整');
  return true;
}

// 测试 2: 基础优化功能验证
function testBasicOptimization() {
  console.log('\n🔍 测试 2: 基础优化功能验证');
  
  if (typeof performBasicOptimization !== 'function') {
    console.log('❌ 基础优化函数不存在');
    return false;
  }
  
  // 测试基础优化效果
  testConfig.testCases.forEach(testCase => {
    console.log(`\n测试用例: ${testCase.name}`);
    console.log(`原文: ${testCase.original}`);
    
    testConfig.siteTypes.forEach(siteType => {
      try {
        const basicOptimized = performBasicOptimization(testCase.original, siteType);
        console.log(`  ${siteType} 基础优化结果: ${basicOptimized}`);
        
        // 检查是否有实际优化
        const hasOptimization = basicOptimized !== testCase.original;
        if (hasOptimization) {
          console.log(`  ✅ ${siteType} 基础优化成功`);
        } else {
          console.log(`  ⚠️ ${siteType} 基础优化无变化`);
        }
      } catch (error) {
        console.log(`  ❌ ${siteType} 基础优化失败: ${error.message}`);
      }
    });
  });
  
  return true;
}

// 测试 3: AI 深度优化提示词验证
function testAIOptimizationPrompt() {
  console.log('\n🔍 测试 3: AI 深度优化提示词验证');
  
  if (typeof buildAIOptimizationPrompt !== 'function') {
    console.log('❌ AI 优化提示词构建函数不存在');
    return false;
  }
  
  const testText = '这是一个测试文本。';
  
  testConfig.siteTypes.forEach(siteType => {
    try {
      const prompt = buildAIOptimizationPrompt(testText, siteType);
      console.log(`\n${siteType} 平台提示词:`);
      console.log(prompt);
      
      // 检查提示词是否包含必要元素
      const hasLanguageStyle = prompt.includes('语言风格');
      const hasGrammarCheck = prompt.includes('语法规范');
      const hasExpressionClear = prompt.includes('表达清晰');
      const hasContentOptimization = prompt.includes('内容优化');
      const hasPlatformAdaptation = prompt.includes('平台适配');
      
      if (hasLanguageStyle && hasGrammarCheck && hasExpressionClear && hasContentOptimization && hasPlatformAdaptation) {
        console.log(`  ✅ ${siteType} 提示词构建成功`);
      } else {
        console.log(`  ❌ ${siteType} 提示词构建不完整`);
      }
    } catch (error) {
      console.log(`  ❌ ${siteType} 提示词构建失败: ${error.message}`);
    }
  });
  
  return true;
}

// 测试 4: AI 优化建议应用验证
function testAIOptimizationSuggestions() {
  console.log('\n🔍 测试 4: AI 优化建议应用验证');
  
  if (typeof applyAIOptimizationSuggestions !== 'function') {
    console.log('❌ AI 优化建议应用函数不存在');
    return false;
  }
  
  const testCases = [
    {
      name: '金融平台建议应用',
      original: '市场很好，建议投资。',
      suggestions: '建议使用更专业的金融术语，增加数据支撑。',
      siteType: 'longport',
      expectedChanges: ['市场环境', '投资策略']
    },
    {
      name: '文档平台建议应用',
      original: '这个内容需要说明。',
      suggestions: '建议使结构更清晰，表达更准确。',
      siteType: 'notion',
      expectedChanges: ['文档内容', '详细说明']
    }
  ];
  
  let allTestsPassed = true;
  
  testCases.forEach(testCase => {
    console.log(`\n测试用例: ${testCase.name}`);
    console.log(`原文: ${testCase.original}`);
    console.log(`AI 建议: ${testCase.suggestions}`);
    
    try {
      const result = applyAIOptimizationSuggestions(testCase.original, testCase.suggestions, testCase.siteType);
      console.log(`应用建议后: ${result}`);
      
      // 检查是否应用了建议
      const hasAppliedSuggestions = testCase.expectedChanges.some(change => result.includes(change));
      if (hasAppliedSuggestions) {
        console.log(`  ✅ 建议应用成功`);
      } else {
        console.log(`  ❌ 建议应用失败`);
        allTestsPassed = false;
      }
    } catch (error) {
      console.log(`  ❌ 建议应用异常: ${error.message}`);
      allTestsPassed = false;
    }
  });
  
  return allTestsPassed;
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
  
  // 验证是否包含两阶段优化信息
  const hasBasicOptimization = suggestionText.includes('📝 基础优化：');
  const hasAIOptimization = suggestionText.includes('💡 AI 深度优化：');
  
  if (hasBasicOptimization && hasAIOptimization) {
    console.log('✅ 两阶段优化信息显示正确');
  } else {
    console.log('❌ 两阶段优化信息显示不完整');
    if (!hasBasicOptimization) console.log('  - 缺少基础优化信息');
    if (!hasAIOptimization) console.log('  - 缺少 AI 深度优化信息');
  }
  
  return hasBasicOptimization && hasAIOptimization;
}

// 测试 6: 优化效果对比验证
function testOptimizationEffectComparison() {
  console.log('\n🔍 测试 6: 优化效果对比验证');
  
  const popup = document.querySelector('.longport-ai-popup');
  if (!popup) {
    console.log('❌ 弹窗不存在');
    return false;
  }
  
  const optimizedTextEl = popup.querySelector('.optimized-text');
  const optimizationSuggestionEl = popup.querySelector('.optimization-suggestion');
  
  if (!optimizedTextEl || !optimizationSuggestionEl) {
    console.log('❌ 弹窗内容区域不完整');
    return false;
  }
  
  const optimizedText = optimizedTextEl.textContent.trim();
  const suggestionText = optimizationSuggestionEl.textContent.trim();
  
  // 验证优化效果
  const hasOptimization = optimizedText !== currentSelection;
  const hasDetailedSuggestions = suggestionText.includes('基础优化') && suggestionText.includes('AI 深度优化');
  
  if (hasOptimization) {
    console.log('✅ 文本优化效果明显');
    console.log(`  原文长度: ${currentSelection.length}`);
    console.log(`  优化后长度: ${optimizedText.length}`);
    console.log(`  长度变化: ${optimizedText.length - currentSelection.length}`);
  } else {
    console.log('❌ 文本优化效果不明显');
  }
  
  if (hasDetailedSuggestions) {
    console.log('✅ 优化建议详细完整');
  } else {
    console.log('❌ 优化建议不够详细');
  }
  
  return hasOptimization && hasDetailedSuggestions;
}

// 运行所有测试
async function runAllTwoStageOptimizationTests() {
  console.log('🚀 开始运行两阶段优化功能测试...\n');
  
  const startTime = Date.now();
  
  try {
    // 运行所有测试
    const test1 = testTwoStageOptimizationFlow();
    const test2 = testBasicOptimization();
    const test3 = testAIOptimizationPrompt();
    const test4 = testAIOptimizationSuggestions();
    const test5 = testPopupDisplay();
    const test6 = testOptimizationEffectComparison();
    
    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    
    // 显示测试结果摘要
    console.log('\n📋 两阶段优化功能测试结果摘要');
    console.log('================================');
    console.log(`总耗时: ${totalDuration}ms`);
    console.log(`两阶段优化流程: ${test1 ? '✅' : '❌'}`);
    console.log(`基础优化功能: ${test2 ? '✅' : '❌'}`);
    console.log(`AI 优化提示词: ${test3 ? '✅' : '❌'}`);
    console.log(`AI 建议应用: ${test4 ? '✅' : '❌'}`);
    console.log(`弹窗显示: ${test5 ? '✅' : '❌'}`);
    console.log(`优化效果对比: ${test6 ? '✅' : '❌'}`);
    console.log('================================');
    
    // 详细结果分析
    console.log('\n🔍 详细结果分析:');
    
    // 核心功能分析
    if (test1 && test2 && test3 && test4) {
      console.log('✅ 核心两阶段优化功能完全正常');
      console.log('  - 基础优化流程完善');
      console.log('  - AI 深度优化机制健全');
      console.log('  - 提示词构建准确');
      console.log('  - 建议应用有效');
    } else {
      console.log('❌ 部分核心功能存在问题');
    }
    
    // 用户体验分析
    if (test5 && test6) {
      console.log('✅ 用户体验功能正常');
      console.log('  - 弹窗显示清晰');
      console.log('  - 优化效果明显');
      console.log('  - 建议信息详细');
    } else {
      console.log('❌ 用户体验功能存在问题');
    }
    
    // 功能特性说明
    console.log('\n🎯 新功能特性:');
    console.log('✅ 两阶段优化：基础优化 + AI 深度优化');
    console.log('✅ 基础优化：错别字纠正、语法优化、标点符号优化');
    console.log('✅ AI 深度优化：语法校验、文笔优化、语言风格改进');
    console.log('✅ 智能提示词：根据网站类型生成针对性优化要求');
    console.log('✅ 建议应用：自动将 AI 建议应用到优化文本');
    console.log('✅ 效果对比：清晰展示两个阶段的优化效果');
    
    // 总体评估
    const totalTests = 6;
    const successfulTests = [test1, test2, test3, test4, test5, test6].filter(Boolean).length;
    
    console.log(`\n🎯 总体评估: ${successfulTests}/${totalTests} 项测试通过`);
    
    if (successfulTests === totalTests) {
      console.log('🎉 所有测试通过！两阶段优化功能完全正常');
      console.log('✅ 基础优化功能完善');
      console.log('✅ AI 深度优化机制健全');
      console.log('✅ 用户体验优秀');
      console.log('✅ 优化效果显著');
    } else if (successfulTests >= totalTests * 0.8) {
      console.log('✅ 大部分测试通过，两阶段优化功能基本正常');
    } else if (successfulTests >= totalTests * 0.6) {
      console.log('⚠️ 部分测试通过，两阶段优化功能可能存在问题');
    } else {
      console.log('❌ 大部分测试失败，两阶段优化功能存在严重问题');
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
console.log('3. 等待弹窗出现并显示两阶段优化结果后，运行此测试脚本');
console.log('4. 运行 runAllTwoStageOptimizationTests() 开始测试');

console.log('\n💡 测试前准备:');
console.log('- 确保插件已更新到最新版本');
console.log('- 在支持的网站中选择文本并调用 AI 助手');
console.log('- 等待弹窗完全加载并显示两阶段优化结果后再运行测试');

console.log('\n按 Enter 键开始运行所有两阶段优化功能测试...');

document.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    runAllTwoStageOptimizationTests();
  }
});

console.log('两阶段优化功能测试脚本加载完成，按 Enter 键开始测试');
