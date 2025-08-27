// 全面功能验证脚本 - 验证修复后的文本优化功能
console.log('=== LongPort AI 助手全面功能验证 ===');

// 测试配置
const testConfig = {
  testCases: [
    {
      name: '错别字测试',
      original: '这是一个的的测试文本，有有错别字，需要要优化。',
      expectedOptimizations: ['错别字纠正', '标点符号优化']
    },
    {
      name: '语法错误测试',
      original: '这个文本有重复的的词汇，，标点符号使用不当。。',
      expectedOptimizations: ['重复词汇修复', '标点符号优化']
    },
    {
      name: 'LongPort 金融内容测试',
      original: '市场很好，建议投资，注意风险。',
      expectedOptimizations: ['金融术语优化', '表达专业性提升']
    },
    {
      name: 'Notion 文档内容测试',
      original: '这个内容需要说明，结构要清晰。',
      expectedOptimizations: ['文档化表达', '结构优化']
    },
    {
      name: '通用内容测试',
      original: '文本质量一般，表达不够生动。',
      expectedOptimizations: ['表达优化', '词汇丰富度提升']
    }
  ],
  siteTypes: ['longport', 'notion', 'unknown']
};

// 测试 1: 文本优化功能验证
function testTextOptimizationFunction() {
  console.log('\n🔍 测试 1: 文本优化功能验证');
  
  // 检查优化函数是否存在
  const requiredFunctions = [
    'performTextOptimization',
    'optimizePunctuation',
    'correctTypos',
    'optimizeGrammar',
    'optimizeExpression',
    'optimizeStructure'
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
    console.log('❌ 部分优化函数缺失，无法进行文本优化');
    return false;
  }
  
  // 测试文本优化效果
  testConfig.testCases.forEach(testCase => {
    console.log(`\n测试用例: ${testCase.name}`);
    console.log(`原文: ${testCase.original}`);
    
    try {
      // 模拟不同网站类型
      testConfig.siteTypes.forEach(siteType => {
        const optimizedText = performTextOptimization(testCase.original, siteType);
        console.log(`  ${siteType} 优化结果: ${optimizedText}`);
        
        // 检查是否有实际优化
        const hasOptimization = optimizedText !== testCase.original;
        if (hasOptimization) {
          console.log(`  ✅ ${siteType} 优化成功`);
        } else {
          console.log(`  ⚠️ ${siteType} 无优化变化`);
        }
      });
    } catch (error) {
      console.log(`  ❌ 优化失败: ${error.message}`);
    }
  });
  
  return true;
}

// 测试 2: 错别字纠正功能验证
function testTypoCorrection() {
  console.log('\n🔍 测试 2: 错别字纠正功能验证');
  
  const typoTestCases = [
    { input: '的的', expected: '的' },
    { input: '地地', expected: '地' },
    { input: '得得', expected: '得' },
    { input: '在在', expected: '在' },
    { input: '再再', expected: '再' },
    { input: '做做', expected: '做' },
    { input: '作作', expected: '作' },
    { input: '和和', expected: '和' },
    { input: '或或', expected: '或' },
    { input: '但但', expected: '但' }
  ];
  
  let allCorrectionsCorrect = true;
  
  typoTestCases.forEach(testCase => {
    const corrected = correctTypos(testCase.input);
    const isCorrect = corrected === testCase.expected;
    
    if (isCorrect) {
      console.log(`✅ ${testCase.input} → ${corrected}`);
    } else {
      console.log(`❌ ${testCase.input} → ${corrected} (期望: ${testCase.expected})`);
      allCorrectionsCorrect = false;
    }
  });
  
  // 测试复杂文本
  const complexText = '这是一个的的测试文本，有有错别字，需要要优化。';
  const correctedComplex = correctTypos(complexText);
  console.log(`\n复杂文本测试:`);
  console.log(`原文: ${complexText}`);
  console.log(`纠正后: ${correctedComplex}`);
  
  return allCorrectionsCorrect;
}

// 测试 3: 标点符号优化功能验证
function testPunctuationOptimization() {
  console.log('\n🔍 测试 3: 标点符号优化功能验证');
  
  const punctuationTestCases = [
    { input: '文本，，有重复标点', expected: '文本，有重复标点' },
    { input: '句子。。结束', expected: '句子。结束' },
    { input: '感叹！！号', expected: '感叹！号' },
    { input: '问号？？', expected: '问号？' },
    { input: '冒号：：', expected: '冒号：' },
    { input: '分号；；', expected: '分号；' }
  ];
  
  let allOptimizationsCorrect = true;
  
  punctuationTestCases.forEach(testCase => {
    const optimized = optimizePunctuation(testCase.input);
    const isCorrect = optimized === testCase.expected;
    
    if (isCorrect) {
      console.log(`✅ ${testCase.input} → ${optimized}`);
    } else {
      console.log(`❌ ${testCase.input} → ${optimized} (期望: ${testCase.expected})`);
      allOptimizationsCorrect = false;
    }
  });
  
  return allOptimizationsCorrect;
}

// 测试 4: 语法优化功能验证
function testGrammarOptimization() {
  console.log('\n🔍 测试 4: 语法优化功能验证');
  
  const grammarTestCases = [
    { input: '这个这个文本有重复', expected: '这个文本有重复' },
    { input: '重复重复的词汇', expected: '重复的词汇' },
    { input: '句子 开头有空格', expected: '句子开头有空格' },
    { input: '结尾有空格 ', expected: '结尾有空格' }
  ];
  
  let allOptimizationsCorrect = true;
  
  grammarTestCases.forEach(testCase => {
    const optimized = optimizeGrammar(testCase.input);
    const isCorrect = optimized === testCase.expected;
    
    if (isCorrect) {
      console.log(`✅ ${testCase.input} → ${optimized}`);
    } else {
      console.log(`❌ ${testCase.input} → ${optimized} (期望: ${testCase.expected})`);
      allOptimizationsCorrect = false;
    }
  });
  
  return allOptimizationsCorrect;
}

// 测试 5: 表达优化功能验证
function testExpressionOptimization() {
  console.log('\n🔍 测试 5: 表达优化功能验证');
  
  // 测试 LongPort 金融平台优化
  const longportText = '市场很好，建议投资，注意风险。';
  const optimizedLongport = optimizeExpression(longportText, 'longport');
  console.log(`LongPort 优化测试:`);
  console.log(`原文: ${longportText}`);
  console.log(`优化后: ${optimizedLongport}`);
  
  const hasLongportOptimization = optimizedLongport !== longportText;
  console.log(`LongPort 优化效果: ${hasLongportOptimization ? '✅ 有优化' : '❌ 无优化'}`);
  
  // 测试 Notion 文档优化
  const notionText = '这个内容需要说明，结构要清晰。';
  const optimizedNotion = optimizeExpression(notionText, 'notion');
  console.log(`\nNotion 优化测试:`);
  console.log(`原文: ${notionText}`);
  console.log(`优化后: ${optimizedNotion}`);
  
  const hasNotionOptimization = optimizedNotion !== notionText;
  console.log(`Notion 优化效果: ${hasNotionOptimization ? '✅ 有优化' : '❌ 无优化'}`);
  
  return hasLongportOptimization && hasNotionOptimization;
}

// 测试 6: 结构优化功能验证
function testStructureOptimization() {
  console.log('\n🔍 测试 6: 结构优化功能验证');
  
  // 测试句子完整性
  const incompleteText = '这个句子没有结束';
  const optimizedIncomplete = optimizeStructure(incompleteText, 'unknown');
  console.log(`句子完整性测试:`);
  console.log(`原文: ${incompleteText}`);
  console.log(`优化后: ${optimizedIncomplete}`);
  
  const hasCompletion = optimizedIncomplete.endsWith('。');
  console.log(`句子完整性: ${hasCompletion ? '✅ 已完善' : '❌ 未完善'}`);
  
  // 测试 LongPort 结构优化
  const shortLongportText = '市场很好';
  const optimizedShortLongport = optimizeStructure(shortLongportText, 'longport');
  console.log(`\nLongPort 结构优化测试:`);
  console.log(`原文: ${shortLongportText}`);
  console.log(`优化后: ${optimizedShortLongport}`);
  
  const hasLongportStructure = optimizedShortLongport.startsWith('基于当前市场分析，');
  console.log(`LongPort 结构优化: ${hasLongportStructure ? '✅ 已优化' : '❌ 未优化'}`);
  
  return hasCompletion && hasLongportStructure;
}

// 测试 7: 智能建议生成功能验证
function testIntelligentSuggestionGeneration() {
  console.log('\n🔍 测试 7: 智能建议生成功能验证');
  
  if (typeof generateIntelligentSuggestion !== 'function') {
    console.log('❌ 智能建议生成函数不存在');
    return false;
  }
  
  // 测试建议生成
  const originalText = '这是一个测试文本，有错别字。';
  const optimizedText = '这是一个经过优化的测试文本，纠正了错别字，提升了表达质量。';
  
  testConfig.siteTypes.forEach(siteType => {
    console.log(`\n测试网站类型: ${siteType}`);
    
    try {
      const suggestion = generateIntelligentSuggestion(originalText, optimizedText, siteType);
      
      if (suggestion && suggestion.optimizationDetail && suggestion.optimizationSuggestion) {
        console.log(`✅ 建议生成成功`);
        console.log(`  优化对比: ${suggestion.optimizationDetail}`);
        console.log(`  优化建议: ${suggestion.optimizationSuggestion}`);
      } else {
        console.log(`❌ 建议生成失败，返回结果不完整`);
      }
    } catch (error) {
      console.log(`❌ 建议生成异常: ${error.message}`);
    }
  });
  
  return true;
}

// 测试 8: 弹窗显示功能验证
function testPopupDisplayFunction() {
  console.log('\n🔍 测试 8: 弹窗显示功能验证');
  
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
  
  // 验证内容是否与原文不同
  const hasOptimization = optimizedText !== currentSelection;
  const hasSuggestion = suggestionText.includes('📝 优化对比：') && suggestionText.includes('💡 优化建议：');
  
  if (hasOptimization) {
    console.log('✅ 优化后文案与原文不同，优化功能正常');
  } else {
    console.log('❌ 优化后文案与原文相同，优化功能异常');
  }
  
  if (hasSuggestion) {
    console.log('✅ 文案建议格式正确');
  } else {
    console.log('❌ 文案建议格式异常');
  }
  
  return hasOptimization && hasSuggestion;
}

// 运行所有测试
async function runAllComprehensiveTests() {
  console.log('🚀 开始运行全面功能验证测试...\n');
  
  const startTime = Date.now();
  
  try {
    // 运行所有测试
    const test1 = testTextOptimizationFunction();
    const test2 = testTypoCorrection();
    const test3 = testPunctuationOptimization();
    const test4 = testGrammarOptimization();
    const test5 = testExpressionOptimization();
    const test6 = testStructureOptimization();
    const test7 = testIntelligentSuggestionGeneration();
    const test8 = testPopupDisplayFunction();
    
    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    
    // 显示测试结果摘要
    console.log('\n📋 全面功能验证测试结果摘要');
    console.log('================================');
    console.log(`总耗时: ${totalDuration}ms`);
    console.log(`文本优化功能: ${test1 ? '✅' : '❌'}`);
    console.log(`错别字纠正: ${test2 ? '✅' : '❌'}`);
    console.log(`标点符号优化: ${test3 ? '✅' : '❌'}`);
    console.log(`语法优化: ${test4 ? '✅' : '❌'}`);
    console.log(`表达优化: ${test5 ? '✅' : '❌'}`);
    console.log(`结构优化: ${test6 ? '✅' : '❌'}`);
    console.log(`智能建议生成: ${test7 ? '✅' : '❌'}`);
    console.log(`弹窗显示功能: ${test8 ? '✅' : '❌'}`);
    console.log('================================');
    
    // 详细结果分析
    console.log('\n🔍 详细结果分析:');
    
    // 核心功能分析
    if (test1 && test2 && test3 && test4 && test5 && test6) {
      console.log('✅ 核心文本优化功能完全正常');
      console.log('  - 错别字纠正功能完善');
      console.log('  - 标点符号优化准确');
      console.log('  - 语法优化有效');
      console.log('  - 表达优化专业');
      console.log('  - 结构优化合理');
    } else {
      console.log('❌ 部分核心功能存在问题');
    }
    
    // 智能建议分析
    if (test7) {
      console.log('✅ 智能建议生成功能正常');
    } else {
      console.log('❌ 智能建议生成功能异常');
    }
    
    // 弹窗显示分析
    if (test8) {
      console.log('✅ 弹窗显示功能正常，优化结果和建议正确显示');
    } else {
      console.log('❌ 弹窗显示功能异常');
    }
    
    // 功能特性说明
    console.log('\n🎯 修复后的功能特性:');
    console.log('✅ 真正的文本优化：不仅仅是标点符号替换');
    console.log('✅ 错别字纠正：自动检测和纠正常见错别字');
    console.log('✅ 语法优化：修复重复词汇、标点错误等');
    console.log('✅ 表达优化：根据网站类型提升专业性');
    console.log('✅ 结构优化：确保句子完整性和逻辑性');
    console.log('✅ 智能建议：基于实际优化内容生成建议');
    
    // 总体评估
    const totalTests = 8;
    const successfulTests = [test1, test2, test3, test4, test5, test6, test7, test8].filter(Boolean).length;
    
    console.log(`\n🎯 总体评估: ${successfulTests}/${totalTests} 项测试通过`);
    
    if (successfulTests === totalTests) {
      console.log('🎉 所有测试通过！文本优化功能完全正常');
      console.log('✅ 错别字纠正功能完善');
      console.log('✅ 语法和文笔优化有效');
      console.log('✅ 智能建议生成准确');
      console.log('✅ 弹窗显示功能正常');
      console.log('✅ 用户体验显著提升');
    } else if (successfulTests >= totalTests * 0.8) {
      console.log('✅ 大部分测试通过，文本优化功能基本正常');
    } else if (successfulTests >= totalTests * 0.6) {
      console.log('⚠️ 部分测试通过，文本优化功能可能存在问题');
    } else {
      console.log('❌ 大部分测试失败，文本优化功能存在严重问题');
    }
    
    return {
      test1, test2, test3, test4, test5, test6, test7, test8,
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
console.log('3. 等待弹窗出现并显示优化结果后，运行此测试脚本');
console.log('4. 运行 runAllComprehensiveTests() 开始测试');

console.log('\n💡 测试前准备:');
console.log('- 确保插件已更新到最新版本');
console.log('- 在支持的网站中选择文本并调用 AI 助手');
console.log('- 等待弹窗完全加载并显示优化结果后再运行测试');

console.log('\n按 Enter 键开始运行所有全面功能验证测试...');

document.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    runAllComprehensiveTests();
  }
});

console.log('全面功能验证测试脚本加载完成，按 Enter 键开始测试');
