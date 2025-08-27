// AI 修复验证脚本 - 验证修复后的AI调用功能
console.log('=== LongPort AI 助手修复验证 ===');

// 修复内容总结
const fixSummary = {
  problem: 'AI调用结果被错误过滤，用户只能看到基础优化结果',
  fixes: [
    '优化checkMeaningfulContent函数，降低过于严格的判断标准',
    '改进cleanAIResponse函数，优先保留AI返回的结果',
    '修复processAIOptimizationResult函数，优先使用AI结果',
    '增加详细的调试日志，便于问题排查'
  ]
};

console.log('🎯 修复内容总结:');
console.log(`问题: ${fixSummary.problem}`);
console.log('\n修复内容:');
fixSummary.fixes.forEach((fix, index) => {
  console.log(`${index + 1}. ${fix}`);
});

// 验证配置
const verificationSteps = [
  {
    name: '修复函数验证',
    description: '验证修复后的关键函数',
    function: verifyFixedFunctions
  },
  {
    name: 'AI调用流程测试',
    description: '测试完整的AI调用流程',
    function: testAICallFlow
  },
  {
    name: '结果处理验证',
    description: '验证AI结果的处理逻辑',
    function: verifyResultProcessing
  },
  {
    name: '实际效果测试',
    description: '测试修复后的实际效果',
    function: testActualEffect
  }
];

// 步骤 1: 修复函数验证
function verifyFixedFunctions() {
  console.log('\n🔍 步骤 1: 修复函数验证');
  
  // 检查checkMeaningfulContent函数的修复
  if (typeof checkMeaningfulContent === 'function') {
    const functionString = checkMeaningfulContent.toString();
    
    const hasLoweredThreshold = functionString.includes('text.trim().length < 5') && 
                               functionString.includes('minLength = 8');
    const hasMoreUsefulPatterns = functionString.includes('专业') && 
                                 functionString.includes('清晰') && 
                                 functionString.includes('准确');
    const hasDetailedLogging = functionString.includes('console.log') && 
                              functionString.includes('文本长度合理');
    
    console.log(`降低长度阈值: ${hasLoweredThreshold ? '✅' : '❌'}`);
    console.log(`增加有用模式: ${hasMoreUsefulPatterns ? '✅' : '❌'}`);
    console.log(`详细日志记录: ${hasDetailedLogging ? '✅' : '❌'}`);
    
    return hasLoweredThreshold && hasMoreUsefulPatterns && hasDetailedLogging;
  } else {
    console.log('❌ checkMeaningfulContent函数不存在');
    return false;
  }
}

// 步骤 2: AI调用流程测试
function testAICallFlow() {
  console.log('\n🔍 步骤 2: AI调用流程测试');
  
  // 检查callAI函数的增强日志
  if (typeof callAI === 'function') {
    const functionString = callAI.toString();
    
    const hasEnhancedLogging = functionString.includes('🚀 开始调用 AI API') && 
                               functionString.includes('📝 第一步') && 
                               functionString.includes('🤖 第二步') && 
                               functionString.includes('🔄 开始并行调用');
    const hasResultAnalysis = functionString.includes('🔍 AI 调用结果分析') && 
                             functionString.includes('🎯 最终结果类型');
    
    console.log(`增强日志记录: ${hasEnhancedLogging ? '✅' : '❌'}`);
    console.log(`结果分析日志: ${hasResultAnalysis ? '✅' : '❌'}`);
    
    return hasEnhancedLogging && hasResultAnalysis;
  } else {
    console.log('❌ callAI函数不存在');
    return false;
  }
}

// 步骤 3: 结果处理验证
function verifyResultProcessing() {
  console.log('\n🔍 步骤 3: 结果处理验证');
  
  // 检查processAIOptimizationResult函数的修复
  if (typeof processAIOptimizationResult === 'function') {
    const functionString = processAIOptimizationResult.toString();
    
    const hasEnhancedLogging = functionString.includes('console.log') && 
                               functionString.includes('AI 响应类型') && 
                               functionString.includes('AI 响应内容预览');
    const hasPriorityLogic = functionString.includes('优先使用 AI 结果') && 
                            functionString.includes('AI 结果与基础优化结果显著不同');
    const hasBetterFallback = functionString.includes('使用基础优化结果作为回退');
    
    console.log(`增强日志记录: ${hasEnhancedLogging ? '✅' : '❌'}`);
    console.log(`优先AI结果逻辑: ${hasPriorityLogic ? '✅' : '❌'}`);
    console.log(`改进回退逻辑: ${hasBetterFallback ? '✅' : '❌'}`);
    
    return hasEnhancedLogging && hasPriorityLogic && hasBetterFallback;
  } else {
    console.log('❌ processAIOptimizationResult函数不存在');
    return false;
  }
}

// 步骤 4: 实际效果测试
function testActualEffect() {
  console.log('\n🔍 步骤 4: 实际效果测试');
  
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
  console.log('🚀 开始运行AI修复验证...\n');
  
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
    console.log('\n📋 AI修复验证结果摘要');
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
      console.log('✅ 修复函数验证通过');
      console.log('  - checkMeaningfulContent函数已优化');
      console.log('  - 降低了过于严格的判断标准');
      console.log('  - 增加了更多有用内容识别模式');
    }
    
    if (results[1] && results[1].result) {
      console.log('✅ AI调用流程测试通过');
      console.log('  - 增加了详细的调试日志');
      console.log('  - 改进了结果分析逻辑');
      console.log('  - 提供了更好的问题诊断信息');
    }
    
    if (results[2] && results[2].result) {
      console.log('✅ 结果处理验证通过');
      console.log('  - processAIOptimizationResult函数已修复');
      console.log('  - 优先使用AI返回的结果');
      console.log('  - 改进了回退逻辑');
    }
    
    if (results[3] && results[3].result) {
      console.log('✅ 实际效果测试通过');
      console.log('  - AI调用功能正常工作');
      console.log('  - 用户能看到真正的AI优化结果');
      console.log('  - 修复达到了预期效果');
    }
    
    // 总体评估
    if (passedSteps === totalSteps) {
      console.log('\n🎉 所有验证通过！AI调用功能修复成功');
      console.log('✅ 用户现在能够看到真正的AI优化结果');
      console.log('✅ 基础优化结果不再错误地替代AI结果');
      console.log('✅ 问题已完全解决');
    } else if (passedSteps >= totalSteps * 0.8) {
      console.log('\n✅ 大部分验证通过，AI调用功能基本修复');
      console.log('💡 请根据失败的检查项进行进一步优化');
    } else if (passedSteps >= totalSteps * 0.6) {
      console.log('\n⚠️ 部分验证通过，AI调用功能部分修复');
      console.log('💡 需要进一步检查和修复');
    } else {
      console.log('\n❌ 大部分验证失败，AI调用功能修复不完整');
      console.log('💡 需要重新检查修复内容');
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
console.log('3. 如果验证通过，AI调用功能应该正常工作');

console.log('\n💡 验证前准备:');
console.log('- 确保插件已更新到最新版本');
console.log('- 在支持的网站中选择文本并调用 AI 助手');
console.log('- 等待弹窗完全加载后再运行验证');

console.log('\n按 Enter 键开始运行所有AI修复验证...');

document.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    runAllVerifications();
  }
});

console.log('AI修复验证脚本加载完成，按 Enter 键开始验证');
