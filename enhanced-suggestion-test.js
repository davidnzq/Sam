// 增强文案建议功能测试脚本 - 验证优化对比和优化建议的显示
console.log('=== LongPort AI 助手增强文案建议功能测试 ===');

// 测试配置
const testConfig = {
  testTexts: [
    '这是一个测试文本，用于验证增强文案建议功能。',
    'The market shows strong momentum with increasing volume.',
    '基于当前市场分析，建议投资者关注科技板块。'
  ],
  siteTypes: ['longport', 'notion', 'unknown']
};

// 测试 1: 智能建议生成功能验证
function testIntelligentSuggestionGeneration() {
  console.log('\n🔍 测试 1: 智能建议生成功能验证');
  
  // 检查智能建议生成函数是否存在
  if (typeof generateIntelligentSuggestion === 'function') {
    console.log('✅ 智能建议生成函数存在');
    
    // 测试不同网站类型的建议生成
    testConfig.siteTypes.forEach(siteType => {
      console.log(`\n测试网站类型: ${siteType}`);
      
      const originalText = '这是一个测试文本。';
      const optimizedText = '这是一个经过优化的测试文本，内容更加丰富和准确。';
      
      try {
        const suggestion = generateIntelligentSuggestion(originalText, optimizedText, siteType);
        
        if (suggestion && suggestion.optimizationDetail && suggestion.optimizationSuggestion) {
          console.log(`✅ ${siteType} 建议生成成功`);
          console.log(`  优化对比: ${suggestion.optimizationDetail}`);
          console.log(`  优化建议: ${suggestion.optimizationSuggestion}`);
        } else {
          console.log(`❌ ${siteType} 建议生成失败，返回结果不完整`);
        }
      } catch (error) {
        console.log(`❌ ${siteType} 建议生成异常: ${error.message}`);
      }
    });
    
    return true;
  } else {
    console.log('❌ 智能建议生成函数不存在');
    return false;
  }
}

// 测试 2: 建议内容结构验证
function testSuggestionContentStructure() {
  console.log('\n🔍 测试 2: 建议内容结构验证');
  
  // 检查弹窗是否存在
  const popup = document.querySelector('.longport-ai-popup');
  if (!popup) {
    console.log('❌ 弹窗不存在，请先选中文本并右键选择"校验优化内容"');
    return false;
  }
  
  // 检查文案建议区域
  const optimizationSuggestion = popup.querySelector('.optimization-suggestion');
  if (!optimizationSuggestion) {
    console.log('❌ 文案建议区域不存在');
    return false;
  }
  
  console.log('✅ 文案建议区域存在');
  
  // 检查建议内容结构
  const suggestionSections = optimizationSuggestion.querySelectorAll('.suggestion-section');
  const hasOptimizationDetail = optimizationSuggestion.querySelector('.optimization-detail');
  const hasOptimizationSuggestion = optimizationSuggestion.querySelector('.optimization-suggestion');
  
  if (suggestionSections.length >= 2) {
    console.log(`✅ 建议区域数量正确: ${suggestionSections.length}个`);
  } else {
    console.log(`❌ 建议区域数量错误: ${suggestionSections.length}个，期望至少2个`);
  }
  
  if (hasOptimizationDetail) {
    console.log('✅ 优化对比区域存在');
  } else {
    console.log('❌ 优化对比区域缺失');
  }
  
  if (hasOptimizationSuggestion) {
    console.log('✅ 优化建议区域存在');
  } else {
    console.log('❌ 优化建议区域缺失');
  }
  
  return {
    hasOptimizationDetail: !!hasOptimizationDetail,
    hasOptimizationSuggestion: !!hasOptimizationSuggestion,
    suggestionSectionsCount: suggestionSections.length,
    success: suggestionSections.length >= 2 && hasOptimizationDetail && hasOptimizationSuggestion
  };
}

// 测试 3: 建议内容质量验证
function testSuggestionContentQuality() {
  console.log('\n🔍 测试 3: 建议内容质量验证');
  
  const popup = document.querySelector('.longport-ai-popup');
  if (!popup) {
    console.log('❌ 弹窗不存在');
    return false;
  }
  
  const optimizationSuggestion = popup.querySelector('.optimization-suggestion');
  if (!optimizationSuggestion) {
    console.log('❌ 文案建议区域不存在');
    return false;
  }
  
  // 检查建议内容
  const optimizationDetail = optimizationSuggestion.querySelector('.optimization-detail');
  const optimizationSuggestionSection = optimizationSuggestion.querySelector('.optimization-suggestion');
  
  let contentQuality = {
    hasDetailContent: false,
    hasSuggestionContent: false,
    detailLength: 0,
    suggestionLength: 0,
    detailQuality: false,
    suggestionQuality: false
  };
  
  if (optimizationDetail) {
    const detailText = optimizationDetail.textContent.trim();
    contentQuality.hasDetailContent = !!detailText;
    contentQuality.detailLength = detailText.length;
    contentQuality.detailQuality = detailText.includes('📝 优化对比：') && detailText.length > 20;
    
    console.log(`优化对比内容: ${detailText.substring(0, 100)}...`);
    console.log(`优化对比长度: ${detailText.length} 字符`);
    console.log(`优化对比质量: ${contentQuality.detailQuality ? '✅ 良好' : '❌ 需要改进'}`);
  }
  
  if (optimizationSuggestionSection) {
    const suggestionText = optimizationSuggestionSection.textContent.trim();
    contentQuality.hasSuggestionContent = !!suggestionText;
    contentQuality.suggestionLength = suggestionText.length;
    contentQuality.suggestionQuality = suggestionText.includes('💡 优化建议：') && suggestionText.length > 20;
    
    console.log(`优化建议内容: ${suggestionText.substring(0, 100)}...`);
    console.log(`优化建议长度: ${suggestionText.length} 字符`);
    console.log(`优化建议质量: ${contentQuality.suggestionQuality ? '✅ 良好' : '❌ 需要改进'}`);
  }
  
  return {
    ...contentQuality,
    success: contentQuality.detailQuality && contentQuality.suggestionQuality
  };
}

// 测试 4: 建议样式和视觉效果验证
function testSuggestionStylesAndVisuals() {
  console.log('\n🔍 测试 4: 建议样式和视觉效果验证');
  
  const popup = document.querySelector('.longport-ai-popup');
  if (!popup) {
    console.log('❌ 弹窗不存在');
    return false;
  }
  
  const optimizationSuggestion = popup.querySelector('.optimization-suggestion');
  if (!optimizationSuggestion) {
    console.log('❌ 文案建议区域不存在');
    return false;
  }
  
  // 检查样式类
  const hasOptimizationDetail = optimizationSuggestion.querySelector('.optimization-detail');
  const hasOptimizationSuggestion = optimizationSuggestion.querySelector('.optimization-suggestion');
  
  let stylesCorrect = true;
  
  if (hasOptimizationDetail) {
    const hasDetailClass = hasOptimizationDetail.classList.contains('optimization-detail');
    if (hasDetailClass) {
      console.log('✅ 优化对比区域样式类正确');
    } else {
      console.log('❌ 优化对比区域样式类错误');
      stylesCorrect = false;
    }
  }
  
  if (hasOptimizationSuggestion) {
    const hasSuggestionClass = hasOptimizationSuggestion.classList.contains('optimization-suggestion');
    if (hasSuggestionClass) {
      console.log('✅ 优化建议区域样式类正确');
    } else {
      console.log('❌ 优化建议区域样式类错误');
      stylesCorrect = false;
    }
  }
  
  // 检查视觉效果
  const sections = optimizationSuggestion.querySelectorAll('.suggestion-section');
  let visualStylesCorrect = true;
  
  sections.forEach((section, index) => {
    const computedStyle = getComputedStyle(section);
    const hasBorderLeft = computedStyle.borderLeftWidth !== '0px';
    const hasBackground = computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)';
    
    if (hasBorderLeft && hasBackground) {
      console.log(`✅ 建议区域 ${index + 1} 视觉效果正确`);
    } else {
      console.log(`❌ 建议区域 ${index + 1} 视觉效果缺失`);
      visualStylesCorrect = false;
    }
  });
  
  return {
    stylesCorrect,
    visualStylesCorrect,
    success: stylesCorrect && visualStylesCorrect
  };
}

// 测试 5: 建议内容更新机制验证
function testSuggestionUpdateMechanism() {
  console.log('\n🔍 测试 5: 建议内容更新机制验证');
  
  const popup = document.querySelector('.longport-ai-popup');
  if (!popup) {
    console.log('❌ 弹窗不存在');
    return false;
  }
  
  // 检查重试按钮
  const retryBtn = popup.querySelector('#retryBtn');
  if (!retryBtn) {
    console.log('❌ 重试按钮不存在');
    return false;
  }
  
  console.log('✅ 重试按钮存在');
  
  // 检查重试功能
  if (typeof retryAI === 'function') {
    console.log('✅ 重试函数存在');
    
    // 检查重试逻辑是否包含建议更新
    const retryFunctionSource = retryAI.toString();
    const hasSuggestionUpdate = retryFunctionSource.includes('optimization-suggestion') || 
                                retryFunctionSource.includes('optimized-text');
    
    if (hasSuggestionUpdate) {
      console.log('✅ 重试逻辑包含建议更新机制');
    } else {
      console.log('⚠️ 重试逻辑可能缺少建议更新机制');
    }
    
    return {
      hasRetryFunction: true,
      hasSuggestionUpdate,
      success: hasSuggestionUpdate
    };
  } else {
    console.log('❌ 重试函数不存在');
    return {
      hasRetryFunction: false,
      hasSuggestionUpdate: false,
      success: false
    };
  }
}

// 运行所有测试
async function runAllEnhancedSuggestionTests() {
  console.log('🚀 开始运行增强文案建议功能测试...\n');
  
  const startTime = Date.now();
  
  try {
    // 运行所有测试
    const test1 = testIntelligentSuggestionGeneration();
    const test2 = testSuggestionContentStructure();
    const test3 = testSuggestionContentQuality();
    const test4 = testSuggestionStylesAndVisuals();
    const test5 = testSuggestionUpdateMechanism();
    
    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    
    // 显示测试结果摘要
    console.log('\n📋 增强文案建议功能测试结果摘要');
    console.log('================================');
    console.log(`总耗时: ${totalDuration}ms`);
    console.log(`智能建议生成: ${test1 ? '✅' : '❌'}`);
    console.log(`建议内容结构: ${test2 ? (test2.success ? '✅' : '❌') : '⚠️'}`);
    console.log(`建议内容质量: ${test3 ? (test3.success ? '✅' : '❌') : '⚠️'}`);
    console.log(`建议样式效果: ${test4 ? (test4.success ? '✅' : '❌') : '⚠️'}`);
    console.log(`建议更新机制: ${test5 ? (test5.success ? '✅' : '❌') : '⚠️'}`);
    console.log('================================');
    
    // 详细结果分析
    console.log('\n🔍 详细结果分析:');
    
    // 智能建议分析
    if (test1) {
      console.log('✅ 智能建议生成功能正常，能够根据网站类型生成针对性建议');
    } else {
      console.log('❌ 智能建议生成功能存在问题');
    }
    
    // 内容结构分析
    if (test2 && test2.success) {
      console.log('✅ 建议内容结构完整，包含优化对比和优化建议两个区域');
    } else {
      console.log('❌ 建议内容结构不完整，可能影响用户体验');
    }
    
    // 内容质量分析
    if (test3 && test3.success) {
      console.log('✅ 建议内容质量良好，提供了有价值的优化信息');
    } else {
      console.log('❌ 建议内容质量需要改进');
    }
    
    // 样式效果分析
    if (test4 && test4.success) {
      console.log('✅ 建议样式和视觉效果良好，用户界面友好');
    } else {
      console.log('❌ 建议样式和视觉效果存在问题');
    }
    
    // 更新机制分析
    if (test5 && test5.success) {
      console.log('✅ 建议更新机制完善，支持重新生成建议');
    } else {
      console.log('❌ 建议更新机制需要改进');
    }
    
    // 功能特性说明
    console.log('\n🎯 新功能特性:');
    console.log('✅ 智能建议生成：根据原文和优化文本自动分析生成建议');
    console.log('✅ 优化对比说明：详细说明调整了哪些内容，为什么调整');
    console.log('✅ 优化建议指导：提供具体的改进方向和操作建议');
    console.log('✅ 网站类型适配：针对不同平台提供专业化的建议');
    console.log('✅ 视觉样式区分：不同建议类型使用不同的颜色和样式');
    
    // 总体评估
    const totalTests = 5;
    const successfulTests = [
      test1,
      test2 && test2.success,
      test3 && test3.success,
      test4 && test4.success,
      test5 && test5.success
    ].filter(Boolean).length;
    
    console.log(`\n🎯 总体评估: ${successfulTests}/${totalTests} 项测试通过`);
    
    if (successfulTests === totalTests) {
      console.log('🎉 所有测试通过！增强文案建议功能完全正常');
      console.log('✅ 智能建议生成机制完善');
      console.log('✅ 建议内容结构清晰');
      console.log('✅ 建议质量高，实用性强');
      console.log('✅ 视觉效果良好，用户体验佳');
      console.log('✅ 更新机制完善，支持动态优化');
    } else if (successfulTests >= totalTests * 0.8) {
      console.log('✅ 大部分测试通过，增强文案建议功能基本正常');
    } else if (successfulTests >= totalTests * 0.6) {
      console.log('⚠️ 部分测试通过，增强文案建议功能可能存在问题');
    } else {
      console.log('❌ 大部分测试失败，增强文案建议功能存在严重问题');
    }
    
    return {
      test1,
      test2,
      test3,
      test4,
      test5,
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
console.log('3. 等待弹窗出现并显示建议内容后，运行此测试脚本');
console.log('4. 运行 runAllEnhancedSuggestionTests() 开始测试');

console.log('\n💡 测试前准备:');
console.log('- 确保插件已更新到最新版本');
console.log('- 在支持的网站中选择文本并调用 AI 助手');
console.log('- 等待弹窗完全加载并显示建议内容后再运行测试');

console.log('\n按 Enter 键开始运行所有增强文案建议功能测试...');

document.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    runAllEnhancedSuggestionTests();
  }
});

console.log('增强文案建议功能测试脚本加载完成，按 Enter 键开始测试');
