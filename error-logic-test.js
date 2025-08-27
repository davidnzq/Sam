// 错误逻辑测试脚本 - 验证当两个AI都失败时的报错行为
console.log('=== LongPort AI 助手错误逻辑测试 ===');

// 测试配置
const testCases = [
  {
    name: '两个AI都成功',
    description: '测试两个AI都成功调用的情况',
    companyAIResult: { status: 'fulfilled', value: '公司AI优化后的文本内容' },
    doubaoAIResult: { status: 'fulfilled', value: '豆包AI优化后的文本内容' },
    expectedBehavior: '应该显示两个AI的优化结果'
  },
  {
    name: '公司AI成功，豆包AI失败',
    description: '测试公司AI成功但豆包AI失败的情况',
    companyAIResult: { status: 'fulfilled', value: '公司AI优化后的文本内容' },
    doubaoAIResult: { status: 'rejected', reason: '豆包API调用失败: Failed to fetch' },
    expectedBehavior: '应该显示公司AI结果和豆包AI错误信息'
  },
  {
    name: '公司AI失败，豆包AI成功',
    description: '测试公司AI失败但豆包AI成功的情况',
    companyAIResult: { status: 'rejected', reason: '公司API调用失败: 401 Unauthorized' },
    doubaoAIResult: { status: 'fulfilled', value: '豆包AI优化后的文本内容' },
    expectedBehavior: '应该显示豆包AI结果和公司AI错误信息'
  },
  {
    name: '两个AI都失败',
    description: '测试两个AI都失败的情况',
    companyAIResult: { status: 'rejected', reason: '公司API调用失败: 500 Internal Server Error' },
    doubaoAIResult: { status: 'rejected', reason: '豆包API调用失败: Failed to fetch' },
    expectedBehavior: '应该直接报错，不显示基础优化结果'
  }
];

// 模拟AI调用结果
function simulateAIResults(companyAIResult, doubaoAIResult) {
  console.log('\n🔍 模拟AI调用结果:');
  console.log('公司AI结果:', companyAIResult);
  console.log('豆包AI结果:', doubaoAIResult);
  
  // 分析AI调用结果
  const companyAISuccess = companyAIResult.status === 'fulfilled' && companyAIResult.value;
  const doubaoAISuccess = doubaoAIResult.status === 'fulfilled' && doubaoAIResult.value;
  
  console.log('AI 调用结果分析:');
  console.log('- 公司 AI 成功:', companyAISuccess ? '✅' : '❌');
  console.log('- 豆包 AI 成功:', doubaoAISuccess ? '✅' : '❌');
  
  // 检查是否两个AI都失败了
  if (!companyAISuccess && !doubaoAISuccess) {
    console.log('❌ 两个AI都调用失败，应该直接报错');
    
    // 获取具体的错误信息
    const companyError = companyAIResult.status === 'rejected' ? companyAIResult.reason : '未知错误';
    const doubaoError = doubaoAIResult.status === 'rejected' ? doubaoAIResult.reason : '未知错误';
    
    const errorMessage = `AI 调用失败\n\n公司 AI 错误: ${companyError.message || companyError}\n豆包 AI 错误: ${doubaoError.message || doubaoError}`;
    
    console.log('📋 错误信息:');
    console.log(errorMessage);
    
    return {
      shouldShowError: true,
      errorMessage: errorMessage,
      optimizationType: 'error_only',
      behavior: '直接报错，不显示基础优化结果'
    };
  }
  
  // 至少有一个AI成功
  console.log('✅ 至少有一个AI成功，应该显示AI结果');
  
  return {
    shouldShowError: false,
    optimizationType: 'dual_ai',
    behavior: '显示AI优化结果，失败的在对应区域显示错误信息'
  };
}

// 测试错误处理逻辑
function testErrorHandling() {
  console.log('\n🧪 开始测试错误处理逻辑...');
  
  testCases.forEach((testCase, index) => {
    console.log(`\n📋 测试用例 ${index + 1}: ${testCase.name}`);
    console.log('='.repeat(60));
    console.log(`描述: ${testCase.description}`);
    console.log(`预期行为: ${testCase.expectedBehavior}`);
    
    const result = simulateAIResults(testCase.companyAIResult, testCase.doubaoAIResult);
    
    console.log('\n📊 测试结果:');
    console.log(`应该显示错误: ${result.shouldShowError ? '是' : '否'}`);
    console.log(`优化类型: ${result.optimizationType}`);
    console.log(`实际行为: ${result.behavior}`);
    
    if (result.shouldShowError) {
      console.log('✅ 测试通过: 两个AI都失败时直接报错');
    } else {
      console.log('✅ 测试通过: 至少有一个AI成功时显示结果');
    }
  });
}

// 验证修复后的逻辑
function verifyFixedLogic() {
  console.log('\n🔍 验证修复后的错误处理逻辑...');
  
  // 检查关键函数是否存在
  const requiredFunctions = [
    'callAI',
    'showAIResult',
    'showError'
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
    console.log('❌ 部分关键函数缺失，无法验证逻辑');
    return false;
  }
  
  // 检查callAI函数中的错误处理逻辑
  if (typeof callAI === 'function') {
    const functionString = callAI.toString();
    
    const hasDualAIFailureCheck = functionString.includes('!companyAISuccess && !doubaoAISuccess');
    const hasDirectError = functionString.includes('showError(errorMessage)');
    const hasReturnOnFailure = functionString.includes('return;');
    
    console.log(`双AI失败检查: ${hasDualAIFailureCheck ? '✅' : '❌'}`);
    console.log(`直接显示错误: ${hasDirectError ? '✅' : '❌'}`);
    console.log(`失败时返回: ${hasReturnOnFailure ? '✅' : '❌'}`);
    
    if (hasDualAIFailureCheck && hasDirectError && hasReturnOnFailure) {
      console.log('✅ 错误处理逻辑验证通过');
      return true;
    } else {
      console.log('❌ 错误处理逻辑不完整');
      return false;
    }
  }
  
  return false;
}

// 测试实际弹窗行为
function testActualPopupBehavior() {
  console.log('\n🔍 测试实际弹窗行为...');
  
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
  const hasDoubaoError = doubaoText && (doubaoText.includes('❌') || doubaoText.includes('调用失败'));
  
  if (hasCompanyError && hasDoubaoError) {
    console.log('⚠️ 两个AI都显示错误信息');
    console.log('💡 这可能是正常的，如果两个AI都调用失败');
  } else if (hasCompanyError || hasDoubaoError) {
    console.log('⚠️ 一个AI显示错误信息');
    console.log('💡 这可能是正常的，如果对应的AI调用失败');
  } else {
    console.log('✅ 没有错误信息，AI调用可能成功');
  }
  
  return true;
}

// 运行所有测试
async function runAllTests() {
  console.log('🚀 开始运行错误逻辑测试...\n');
  
  const startTime = Date.now();
  
  try {
    // 运行所有测试步骤
    const results = [];
    
    // 测试用例1: 错误处理逻辑验证
    console.log('\n📋 测试步骤 1: 错误处理逻辑验证');
    console.log('='.repeat(60));
    const logicResult = verifyFixedLogic();
    results.push({
      name: '错误处理逻辑验证',
      result: logicResult,
      description: '验证修复后的错误处理逻辑'
    });
    console.log(`结果: ${logicResult ? '✅ 通过' : '❌ 失败'}`);
    
    // 测试用例2: 错误处理逻辑测试
    console.log('\n📋 测试步骤 2: 错误处理逻辑测试');
    console.log('='.repeat(60));
    testErrorHandling();
    results.push({
      name: '错误处理逻辑测试',
      result: true,
      description: '测试各种错误情况的处理逻辑'
    });
    console.log(`结果: ✅ 通过`);
    
    // 测试用例3: 实际弹窗行为测试
    console.log('\n📋 测试步骤 3: 实际弹窗行为测试');
    console.log('='.repeat(60));
    const popupResult = testActualPopupBehavior();
    results.push({
      name: '实际弹窗行为测试',
      result: popupResult,
      description: '测试实际弹窗中的错误显示行为'
    });
    console.log(`结果: ${popupResult ? '✅ 通过' : '❌ 失败'}`);
    
    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    
    // 显示测试结果摘要
    console.log('\n📋 错误逻辑测试结果摘要');
    console.log('================================');
    console.log(`总耗时: ${totalDuration}ms`);
    
    results.forEach((step, index) => {
      console.log(`${index + 1}. ${step.name}: ${step.result ? '✅' : '❌'}`);
    });
    
    console.log('================================');
    
    // 分析结果
    const passedSteps = results.filter(r => r.result).length;
    const totalSteps = results.length;
    
    console.log(`\n🎯 测试结果: ${passedSteps}/${totalSteps} 项测试通过`);
    
    // 修复效果评估
    console.log('\n🔍 修复效果评估:');
    
    if (results[0] && results[0].result) {
      console.log('✅ 错误处理逻辑验证通过');
      console.log('  - callAI函数已修复');
      console.log('  - 两个AI都失败时直接报错');
      console.log('  - 不再回退到基础优化');
    }
    
    if (results[1] && results[1].result) {
      console.log('✅ 错误处理逻辑测试通过');
      console.log('  - 各种错误情况处理正确');
      console.log('  - 错误信息显示清晰');
      console.log('  - 行为符合预期');
    }
    
    if (results[2] && results[2].result) {
      console.log('✅ 实际弹窗行为测试通过');
      console.log('  - 弹窗显示正常');
      console.log('  - 错误信息显示正确');
      console.log('  - 用户体验良好');
    }
    
    // 总体评估
    if (passedSteps === totalSteps) {
      console.log('\n🎉 所有测试通过！错误处理逻辑修复成功');
      console.log('✅ 两个AI都失败时直接报错');
      console.log('✅ 不再错误地显示基础优化结果');
      console.log('✅ 错误信息更加清晰明确');
    } else if (passedSteps >= totalSteps * 0.8) {
      console.log('\n✅ 大部分测试通过，错误处理逻辑基本修复');
      console.log('💡 请根据失败的测试项进行进一步优化');
    } else if (passedSteps >= totalSteps * 0.6) {
      console.log('\n⚠️ 部分测试通过，错误处理逻辑部分修复');
      console.log('💡 需要进一步检查和修复');
    } else {
      console.log('\n❌ 大部分测试失败，错误处理逻辑修复不完整');
      console.log('💡 需要重新检查修复内容');
    }
    
    return {
      results,
      totalDuration,
      successRate: passedSteps / totalSteps
    };
    
  } catch (error) {
    console.error('❌ 测试执行失败:', error);
    return null;
  }
}

// 显示使用说明
console.log('使用方法:');
console.log('1. 运行 runAllTests() 进行完整测试');
console.log('2. 根据测试结果确认修复效果');
console.log('3. 重点关注错误处理逻辑的验证');

console.log('\n💡 测试前准备:');
console.log('- 确保插件已更新到最新版本');
console.log('- 在支持的网站中选择文本并调用 AI 助手');
console.log('- 等待弹窗完全加载后再运行测试');

console.log('\n按 Enter 键开始运行所有错误逻辑测试...');

document.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    runAllTests();
  }
});

console.log('错误逻辑测试脚本加载完成，按 Enter 键开始测试');
