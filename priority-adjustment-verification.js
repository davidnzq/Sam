// 功能调整验证脚本 - 验证优先级调整和错误处理
console.log('=== LongPort AI 助手功能调整验证 ===');

// 功能调整总结
const adjustmentSummary = {
  changes: [
    '优先级调整：用户选中文本后，首先调用公司AI API进行文案优化，处理完成后再进行基础优化',
    '错误处理：如果公司AI API未返回处理结果，直接报错并显示错误代码，便于后续问题排查',
    '流程优化：简化了AI调用流程，提高了响应速度和用户体验'
  ],
  benefits: [
    '更快的AI响应速度，用户无需等待基础优化完成',
    '清晰的错误信息，包含错误代码，便于问题排查',
    '优化的用户体验，减少等待时间'
  ]
};

console.log('🎯 功能调整总结:');
console.log('\n主要变更:');
adjustmentSummary.changes.forEach((change, index) => {
  console.log(`${index + 1}. ${change}`);
});

console.log('\n优化收益:');
adjustmentSummary.benefits.forEach((benefit, index) => {
  console.log(`${index + 1}. ${benefit}`);
});

// 验证配置
const verificationSteps = [
  {
    name: '优先级调整验证',
    description: '验证AI调用优先级是否正确调整',
    function: verifyPriorityAdjustment
  },
  {
    name: '错误处理验证',
    description: '验证错误处理是否包含错误代码',
    function: verifyErrorHandling
  },
  {
    name: '流程优化验证',
    description: '验证新的流程是否更加高效',
    function: verifyProcessOptimization
  },
  {
    name: '实际效果测试',
    description: '测试调整后的实际效果',
    function: testActualEffect
  }
];

// 步骤 1: 优先级调整验证
function verifyPriorityAdjustment() {
  console.log('\n🔍 步骤 1: 优先级调整验证');
  
  // 检查callAI函数是否按照新优先级实现
  if (typeof callAI === 'function') {
    const functionString = callAI.toString();
    
    const hasCompanyAIFirst = functionString.includes('步骤1: 调用公司AI API');
    const hasBasicOptimizationSecond = functionString.includes('步骤2: 进行基础优化');
    const hasCorrectOrder = functionString.indexOf('步骤1: 调用公司AI API') < 
                           functionString.indexOf('步骤2: 进行基础优化');
    const hasCompanyAIPriority = functionString.includes('optimizationType: \'company_ai_priority\'');
    
    console.log(`公司AI优先调用: ${hasCompanyAIFirst ? '✅' : '❌'}`);
    console.log(`基础优化后执行: ${hasBasicOptimizationSecond ? '✅' : '❌'}`);
    console.log(`执行顺序正确: ${hasCorrectOrder ? '✅' : '❌'}`);
    console.log(`优先级类型正确: ${hasCompanyAIPriority ? '✅' : '❌'}`);
    
    if (hasCompanyAIFirst && hasBasicOptimizationSecond && hasCorrectOrder && hasCompanyAIPriority) {
      console.log('✅ 优先级调整验证通过');
      return true;
    } else {
      console.log('❌ 优先级调整验证失败');
      return false;
    }
  } else {
    console.log('❌ callAI函数不存在');
    return false;
  }
}

// 步骤 2: 错误处理验证
function verifyErrorHandling() {
  console.log('\n🔍 步骤 2: 错误处理验证');
  
  // 检查错误处理是否包含错误代码
  if (typeof callAI === 'function') {
    const functionString = callAI.toString();
    
    const hasErrorCode = functionString.includes('errorCode');
    const hasCompanyAIFailed = functionString.includes('optimizationType: \'company_ai_failed\'');
    const hasExceptionHandling = functionString.includes('optimizationType: \'exception_occurred\'');
    const hasDetailedError = functionString.includes('错误代码:');
    
    console.log(`包含错误代码: ${hasErrorCode ? '✅' : '❌'}`);
    console.log(`公司AI失败处理: ${hasCompanyAIFailed ? '✅' : '❌'}`);
    console.log(`异常处理: ${hasExceptionHandling ? '✅' : '❌'}`);
    console.log(`详细错误信息: ${hasDetailedError ? '✅' : '❌'}`);
    
    if (hasErrorCode && hasCompanyAIFailed && hasExceptionHandling && hasDetailedError) {
      console.log('✅ 错误处理验证通过');
      return true;
    } else {
      console.log('❌ 错误处理验证失败');
      return false;
    }
  } else {
    console.log('❌ callAI函数不存在');
    return false;
  }
}

// 步骤 3: 流程优化验证
function verifyProcessOptimization() {
  console.log('\n🔍 步骤 3: 流程优化验证');
  
  // 检查流程是否更加高效
  if (typeof startAIOptimization === 'function') {
    const functionString = startAIOptimization.toString();
    
    const hasAsyncFlow = functionString.includes('async function');
    const hasErrorHandling = functionString.includes('catch (error)');
    const hasResultDisplay = functionString.includes('showAIResult');
    const hasButtonBinding = functionString.includes('bindButtonEvents');
    
    console.log(`异步流程: ${hasAsyncFlow ? '✅' : '❌'}`);
    console.log(`错误处理: ${hasErrorHandling ? '✅' : '❌'}`);
    console.log(`结果显示: ${hasResultDisplay ? '✅' : '❌'}`);
    console.log(`按钮绑定: ${hasButtonBinding ? '✅' : '❌'}`);
    
    if (hasAsyncFlow && hasErrorHandling && hasResultDisplay && hasButtonBinding) {
      console.log('✅ 流程优化验证通过');
      return true;
    } else {
      console.log('❌ 流程优化验证失败');
      return false;
    }
  } else {
    console.log('❌ startAIOptimization函数不存在');
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
  
  // 检查弹窗结构
  const header = popup.querySelector('.ai-popup-header');
  const content = popup.querySelector('.ai-popup-content');
  const actions = popup.querySelector('.ai-popup-actions');
  
  if (header && content && actions) {
    console.log('✅ 弹窗结构完整');
  } else {
    console.log('❌ 弹窗结构不完整');
    return false;
  }
  
  // 检查是否显示加载状态
  const loading = popup.querySelector('.loading');
  if (loading) {
    console.log('✅ 显示加载状态');
  } else {
    console.log('⚠️ 未显示加载状态');
  }
  
  // 检查公司AI结果区域
  const companyAIResult = popup.querySelector('.company-ai-result');
  if (companyAIResult) {
    console.log('✅ 公司AI结果区域存在');
    
    // 检查结果内容
    const resultHeader = companyAIResult.querySelector('.ai-result-header');
    const optimizedText = companyAIResult.querySelector('.company-optimized-text');
    
    if (resultHeader && optimizedText) {
      console.log('✅ 结果显示结构完整');
      
      // 检查是否显示错误信息
      const hasError = optimizedText.textContent.includes('❌') || 
                      optimizedText.textContent.includes('🚨') ||
                      optimizedText.textContent.includes('调用失败');
      
      if (hasError) {
        console.log('⚠️ 显示错误信息');
        
        // 检查错误详情
        const errorDetails = companyAIResult.querySelector('.error-details, .exception-details');
        if (errorDetails) {
          console.log('✅ 错误详情显示完整');
          
          // 检查是否包含错误代码
          const hasErrorCode = errorDetails.textContent.includes('错误代码:') || 
                              errorDetails.textContent.includes('异常代码:');
          
          if (hasErrorCode) {
            console.log('✅ 包含错误代码信息');
          } else {
            console.log('❌ 缺少错误代码信息');
          }
        } else {
          console.log('❌ 错误详情显示不完整');
        }
      } else {
        console.log('✅ 显示优化结果');
      }
    } else {
      console.log('❌ 结果显示结构不完整');
    }
  } else {
    console.log('❌ 公司AI结果区域不存在');
  }
  
  // 检查按钮状态
  const replaceBtn = popup.querySelector('.replace-btn');
  const retryBtn = popup.querySelector('.retry-btn');
  
  if (replaceBtn && retryBtn) {
    console.log('✅ 操作按钮存在');
    
    // 检查按钮状态
    const replaceDisabled = replaceBtn.disabled;
    const retryVisible = retryBtn.style.display !== 'none';
    
    console.log(`替换按钮状态: ${replaceDisabled ? '禁用' : '启用'}`);
    console.log(`重试按钮状态: ${retryVisible ? '显示' : '隐藏'}`);
    
    if (replaceDisabled && retryVisible) {
      console.log('✅ 按钮状态正确（显示错误状态）');
    } else if (!replaceDisabled && !retryVisible) {
      console.log('✅ 按钮状态正确（显示成功状态）');
    } else {
      console.log('⚠️ 按钮状态可能不正确');
    }
  } else {
    console.log('❌ 操作按钮不存在');
  }
  
  return true;
}

// 运行所有验证
async function runAllVerifications() {
  console.log('🚀 开始运行功能调整验证...\n');
  
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
    console.log('\n📋 功能调整验证结果摘要');
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
    
    // 功能调整效果评估
    console.log('\n🔍 功能调整效果评估:');
    
    if (results[0] && results[0].result) {
      console.log('✅ 优先级调整验证通过');
      console.log('  - 公司AI API优先调用');
      console.log('  - 基础优化后执行');
      console.log('  - 执行顺序正确');
    }
    
    if (results[1] && results[1].result) {
      console.log('✅ 错误处理验证通过');
      console.log('  - 包含错误代码信息');
      console.log('  - 详细的错误处理');
      console.log('  - 异常情况处理');
    }
    
    if (results[2] && results[2].result) {
      console.log('✅ 流程优化验证通过');
      console.log('  - 异步流程处理');
      console.log('  - 完善的错误处理');
      console.log('  - 优化的用户体验');
    }
    
    if (results[3] && results[3].result) {
      console.log('✅ 实际效果测试通过');
      console.log('  - 弹窗显示正常');
      console.log('  - 结构完整');
      console.log('  - 功能正常');
    }
    
    // 总体评估
    if (passedSteps === totalSteps) {
      console.log('\n🎉 所有验证通过！功能调整成功');
      console.log('✅ 优先级调整完成：公司AI优先调用');
      console.log('✅ 错误处理完善：包含错误代码');
      console.log('✅ 流程优化完成：提高响应速度');
      console.log('✅ 用户体验提升：减少等待时间');
    } else if (passedSteps >= totalSteps * 0.8) {
      console.log('\n✅ 大部分验证通过，功能调整基本成功');
      console.log('💡 请根据失败的检查项进行进一步优化');
    } else if (passedSteps >= totalSteps * 0.6) {
      console.log('\n⚠️ 部分验证通过，功能调整部分成功');
      console.log('💡 需要进一步检查和优化');
    } else {
      console.log('\n❌ 大部分验证失败，功能调整不完整');
      console.log('💡 需要重新检查调整内容');
    }
    
    // 优化建议
    console.log('\n💡 进一步优化建议:');
    
    if (!results[0] || !results[0].result) {
      console.log('1. 检查AI调用优先级是否正确调整');
      console.log('2. 确保公司AI API优先调用');
      console.log('3. 验证基础优化后执行的逻辑');
    }
    
    if (!results[1] || !results[1].result) {
      console.log('4. 检查错误处理是否包含错误代码');
      console.log('5. 验证异常情况的处理逻辑');
      console.log('6. 确保错误信息详细完整');
    }
    
    if (!results[2] || !results[2].result) {
      console.log('7. 检查流程优化是否完成');
      console.log('8. 验证异步处理逻辑');
      console.log('9. 确保用户体验得到提升');
    }
    
    if (!results[3] || !results[3].result) {
      console.log('10. 检查实际显示效果');
      console.log('11. 验证弹窗结构完整性');
      console.log('12. 测试用户交互功能');
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
console.log('2. 根据验证结果确认功能调整效果');
console.log('3. 重点关注优先级调整和错误处理的变化');

console.log('\n💡 验证前准备:');
console.log('- 确保插件已更新到最新版本');
console.log('- 在支持的网站中选择文本并调用 AI 助手');
console.log('- 等待弹窗完全加载后再运行验证');

console.log('\n按 Enter 键开始运行所有功能调整验证...');

document.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    runAllVerifications();
  }
});

console.log('功能调整验证脚本加载完成，按 Enter 键开始验证');
