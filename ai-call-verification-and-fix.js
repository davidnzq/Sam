// AI 调用验证和修复脚本 - 全面检查AI调用能力是否生效
console.log('=== LongPort AI 助手 AI 调用验证和修复 ===');

// 问题描述
const issueDescription = {
  problem: '选中文本的文案都没有给公司API和豆包的AI进行优化，整体返回的优化后的文本内容，跟原文基本没有变化，仅仅进行了一些规则处理',
  rootCause: 'AI调用结果处理逻辑存在问题，导致AI优化结果被过滤或替换为基础优化结果',
  impact: '用户无法获得真正的AI优化效果，体验大打折扣'
};

console.log('🎯 问题描述:');
console.log(`问题: ${issueDescription.problem}`);
console.log(`根本原因: ${issueDescription.rootCause}`);
console.log(`影响: ${issueDescription.impact}`);

// 验证配置
const verificationSteps = [
  {
    name: 'AI调用流程验证',
    description: '验证从content.js到background.js的AI调用流程',
    function: verifyAICallFlow
  },
  {
    name: 'AI响应处理验证',
    description: '验证AI返回结果的处理逻辑',
    function: verifyAIResponseProcessing
  },
  {
    name: '结果过滤逻辑验证',
    description: '验证AI结果是否被错误过滤',
    function: verifyResultFiltering
  },
  {
    name: '内容清理函数验证',
    description: '验证cleanAIResponse函数的处理逻辑',
    function: verifyContentCleaning
  },
  {
    name: '有意义内容检查验证',
    description: '验证checkMeaningfulContent函数的判断逻辑',
    function: verifyMeaningfulContentCheck
  },
  {
    name: '实际AI调用测试',
    description: '测试真实的AI调用过程',
    function: testActualAICall
  }
];

// 步骤 1: AI调用流程验证
function verifyAICallFlow() {
  console.log('\n🔍 步骤 1: AI调用流程验证');
  
  // 检查关键函数是否存在
  const requiredFunctions = [
    'callAI',
    'callCompanyAI', 
    'callDoubaoAI',
    'processAIOptimizationResult'
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
    console.log('❌ 部分关键函数缺失，AI调用流程不完整');
    return false;
  }
  
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
    
    if (!hasPromiseAllSettled || !hasCallCompanyAI || !hasCallDoubaoAI || !hasResultAnalysis) {
      console.log('❌ AI调用流程逻辑不完整');
      return false;
    }
  }
  
  console.log('✅ AI调用流程验证通过');
  return true;
}

// 步骤 2: AI响应处理验证
function verifyAIResponseProcessing() {
  console.log('\n🔍 步骤 2: AI响应处理验证');
  
  // 检查processAIOptimizationResult函数
  if (typeof processAIOptimizationResult === 'function') {
    const functionString = processAIOptimizationResult.toString();
    
    const hasCleanAIResponse = functionString.includes('cleanAIResponse');
    const hasLengthCheck = functionString.includes('length > basicOptimizedText.length * 0.8');
    const hasApplySuggestions = functionString.includes('applyAIOptimizationSuggestions');
    const hasFallback = functionString.includes('return basicOptimizedText');
    
    console.log(`cleanAIResponse 调用: ${hasCleanAIResponse ? '✅' : '❌'}`);
    console.log(`长度检查逻辑: ${hasLengthCheck ? '✅' : '❌'}`);
    console.log(`应用建议逻辑: ${hasApplySuggestions ? '✅' : '❌'}`);
    console.log(`回退逻辑: ${hasFallback ? '✅' : '❌'}`);
    
    if (!hasCleanAIResponse || !hasLengthCheck || !hasApplySuggestions || !hasFallback) {
      console.log('❌ AI响应处理逻辑不完整');
      return false;
    }
  } else {
    console.log('❌ processAIOptimizationResult函数不存在');
    return false;
  }
  
  console.log('✅ AI响应处理验证通过');
  return true;
}

// 步骤 3: 结果过滤逻辑验证
function verifyResultFiltering() {
  console.log('\n🔍 步骤 3: 结果过滤逻辑验证');
  
  // 检查showAIResult函数中的结果处理逻辑
  if (typeof showAIResult === 'function') {
    const functionString = showAIResult.toString();
    
    const hasDualAIHandling = functionString.includes('optimizationType === \'dual_ai\'');
    const hasCompanyAIHandling = functionString.includes('result.companyAIText');
    const hasDoubaoAIHandling = functionString.includes('result.doubaoAIText');
    const hasErrorHandling = functionString.includes('result.companyAIError') && functionString.includes('result.doubaoAIError');
    
    console.log(`双AI处理逻辑: ${hasDualAIHandling ? '✅' : '❌'}`);
    console.log(`公司AI处理: ${hasCompanyAIHandling ? '✅' : '❌'}`);
    console.log(`豆包AI处理: ${hasDoubaoAIHandling ? '✅' : '❌'}`);
    console.log(`错误处理: ${hasErrorHandling ? '✅' : '❌'}`);
    
    if (!hasDualAIHandling || !hasCompanyAIHandling || !hasDoubaoAIHandling || !hasErrorHandling) {
      console.log('❌ 结果过滤逻辑不完整');
      return false;
    }
  } else {
    console.log('❌ showAIResult函数不存在');
    return false;
  }
  
  console.log('✅ 结果过滤逻辑验证通过');
  return true;
}

// 步骤 4: 内容清理函数验证
function verifyContentCleaning() {
  console.log('\n🔍 步骤 4: 内容清理函数验证');
  
  // 检查cleanAIResponse函数
  if (typeof cleanAIResponse === 'function') {
    const functionString = cleanAIResponse.toString();
    
    const hasHTMLCheck = functionString.includes('response.includes(\'<\')');
    const hasDOMParsing = functionString.includes('createElement(\'div\')');
    const hasRegexCleaning = functionString.includes('replace(/<[^>]*>/g');
    const hasMeaningfulCheck = functionString.includes('checkMeaningfulContent');
    const hasFallback = functionString.includes('generateOptimizedTextFromSelection');
    
    console.log(`HTML检查: ${hasHTMLCheck ? '✅' : '❌'}`);
    console.log(`DOM解析: ${hasDOMParsing ? '✅' : '❌'}`);
    console.log(`正则清理: ${hasRegexCleaning ? '✅' : '❌'}`);
    console.log(`有意义检查: ${hasMeaningfulCheck ? '✅' : '❌'}`);
    console.log(`回退处理: ${hasFallback ? '✅' : '❌'}`);
    
    // 检查是否有问题：当AI返回结果被认为无意义时，会回退到基础优化
    if (hasFallback) {
      console.log('⚠️ 警告: 发现潜在问题 - AI结果可能被错误回退');
      console.log('💡 问题分析: 当checkMeaningfulContent返回false时，会调用generateOptimizedTextFromSelection');
      console.log('💡 这可能导致AI优化结果被替换为基础优化结果');
    }
    
    return true;
  } else {
    console.log('❌ cleanAIResponse函数不存在');
    return false;
  }
}

// 步骤 5: 有意义内容检查验证
function verifyMeaningfulContentCheck() {
  console.log('\n🔍 步骤 5: 有意义内容检查验证');
  
  // 检查checkMeaningfulContent函数
  if (typeof checkMeaningfulContent === 'function') {
    const functionString = checkMeaningfulContent.toString();
    
    const hasLengthCheck = functionString.includes('text.trim().length < 10');
    const hasMeaninglessPatterns = functionString.includes('meaninglessPatterns');
    const hasUsefulPatterns = functionString.includes('usefulPatterns');
    const hasFinalCheck = functionString.includes('text.trim().length > 20');
    
    console.log(`长度检查: ${hasLengthCheck ? '✅' : '❌'}`);
    console.log(`无意义模式检查: ${hasMeaninglessPatterns ? '✅' : '❌'}`);
    console.log(`有用模式检查: ${hasUsefulPatterns ? '✅' : '❌'}`);
    console.log(`最终长度检查: ${hasFinalCheck ? '✅' : '❌'}`);
    
    // 分析判断逻辑
    console.log('\n🔍 有意义内容判断逻辑分析:');
    console.log('- 最小长度要求: 10个字符');
    console.log('- 最终长度要求: 20个字符');
    console.log('- 无意义模式: HTML标签、JavaScript相关等');
    console.log('- 有用模式: 优化、建议、改进、语法、文笔等');
    
    // 检查是否有过于严格的判断
    if (hasFinalCheck) {
      console.log('⚠️ 警告: 发现潜在问题 - 长度要求可能过于严格');
      console.log('💡 问题分析: 如果AI返回的优化结果少于20个字符，会被认为无意义');
      console.log('💡 这可能导致有效的AI优化结果被过滤掉');
    }
    
    return true;
  } else {
    console.log('❌ checkMeaningfulContent函数不存在');
    return false;
  }
}

// 步骤 6: 实际AI调用测试
function testActualAICall() {
  console.log('\n🔍 步骤 6: 实际AI调用测试');
  
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

// 运行所有验证
async function runAllVerifications() {
  console.log('🚀 开始运行AI调用验证...\n');
  
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
    console.log('\n📋 AI调用验证结果摘要');
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
    
    // 问题分析
    console.log('\n🔍 问题分析:');
    
    if (results[4] && !results[4].result) {
      console.log('❌ 有意义内容检查存在问题');
      console.log('💡 问题: checkMeaningfulContent函数可能过于严格');
      console.log('💡 影响: 有效的AI优化结果可能被错误过滤');
    }
    
    if (results[3] && results[3].result) {
      console.log('⚠️ 内容清理函数存在潜在问题');
      console.log('💡 问题: 当AI结果被认为无意义时，会回退到基础优化');
      console.log('💡 影响: 用户看到的可能是基础优化结果，而不是AI优化结果');
    }
    
    if (results[5] && !results[5].result) {
      console.log('❌ 实际AI调用测试失败');
      console.log('💡 问题: AI调用可能没有真正生效');
      console.log('💡 影响: 用户无法获得AI优化效果');
    }
    
    // 总体评估
    if (passedSteps === totalSteps) {
      console.log('\n🎉 所有验证通过！AI调用功能正常');
    } else if (passedSteps >= totalSteps * 0.8) {
      console.log('\n✅ 大部分验证通过，AI调用功能基本正常');
    } else if (passedSteps >= totalSteps * 0.6) {
      console.log('\n⚠️ 部分验证通过，AI调用功能可能存在问题');
    } else {
      console.log('\n❌ 大部分验证失败，AI调用功能存在严重问题');
    }
    
    // 修复建议
    console.log('\n💡 修复建议:');
    
    if (results[4] && !results[4].result) {
      console.log('1. 优化checkMeaningfulContent函数的判断逻辑');
      console.log('2. 降低长度要求，避免误判有效的AI结果');
      console.log('3. 增加更多有用内容的识别模式');
    }
    
    if (results[3] && results[3].result) {
      console.log('4. 改进cleanAIResponse函数的回退逻辑');
      console.log('5. 优先保留AI返回的结果，即使被认为"无意义"');
      console.log('6. 添加AI结果的调试日志，便于问题排查');
    }
    
    if (results[5] && !results[5].result) {
      console.log('7. 检查AI API的配置和调用状态');
      console.log('8. 验证网络连接和API密钥');
      console.log('9. 查看控制台错误日志');
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
console.log('2. 根据验证结果进行相应修复');
console.log('3. 重点关注有意义内容检查和内容清理函数');

console.log('\n💡 验证前准备:');
console.log('- 确保插件已加载');
console.log('- 在支持的网站中选择文本并调用 AI 助手');
console.log('- 等待弹窗完全加载后再运行验证');

console.log('\n按 Enter 键开始运行所有AI调用验证...');

document.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    runAllVerifications();
  }
});

console.log('AI调用验证和修复脚本加载完成，按 Enter 键开始验证');
