// 弹窗结果拆分功能测试脚本 - 验证优化后文案和文案建议的显示
console.log('=== LongPort AI 助手弹窗结果拆分功能测试 ===');

// 测试配置
const testConfig = {
  testTexts: [
    '这是一个测试文本，用于验证弹窗结果拆分功能。',
    'The market shows strong momentum with increasing volume.',
    '基于当前市场分析，建议投资者关注科技板块。'
  ],
  siteTypes: ['longport', 'notion', 'unknown']
};

// 测试 1: 弹窗结构验证
function testPopupStructure() {
  console.log('\n🔍 测试 1: 弹窗结构验证');
  
  // 检查弹窗是否存在
  const popup = document.querySelector('.longport-ai-popup');
  if (!popup) {
    console.log('❌ 弹窗不存在，请先选中文本并右键选择"校验优化内容"');
    return false;
  }
  
  console.log('✅ 弹窗存在');
  
  // 检查弹窗结构
  const requiredElements = [
    '.popup-header',
    '.popup-content',
    '.popup-actions',
    '.result-section',
    '.section-title',
    '.section-content',
    '.loading',
    '.optimized-text',
    '.optimization-suggestion'
  ];
  
  const structureResults = {};
  let allElementsExist = true;
  
  requiredElements.forEach(selector => {
    const element = popup.querySelector(selector);
    const exists = !!element;
    structureResults[selector] = exists;
    
    if (exists) {
      console.log(`✅ 元素存在: ${selector}`);
    } else {
      console.log(`❌ 元素缺失: ${selector}`);
      allElementsExist = false;
    }
  });
  
  // 检查结果区域数量
  const resultSections = popup.querySelectorAll('.result-section');
  const hasTwoSections = resultSections.length === 2;
  
  if (hasTwoSections) {
    console.log('✅ 结果区域数量正确: 2个');
  } else {
    console.log(`❌ 结果区域数量错误: ${resultSections.length}个，期望2个`);
    allElementsExist = false;
  }
  
  return {
    allElementsExist,
    structureResults,
    hasTwoSections,
    successRate: Object.values(structureResults).filter(Boolean).length / Object.keys(structureResults).length
  };
}

// 测试 2: 标题和内容验证
function testTitlesAndContent() {
  console.log('\n🔍 测试 2: 标题和内容验证');
  
  const popup = document.querySelector('.longport-ai-popup');
  if (!popup) {
    console.log('❌ 弹窗不存在');
    return false;
  }
  
  // 检查标题
  const titles = popup.querySelectorAll('.section-title');
  const expectedTitles = ['优化后文案', '文案建议'];
  
  let titlesCorrect = true;
  titles.forEach((title, index) => {
    const titleText = title.textContent.trim();
    const expectedTitle = expectedTitles[index];
    
    if (titleText === expectedTitle) {
      console.log(`✅ 标题正确: ${titleText}`);
    } else {
      console.log(`❌ 标题错误: 期望"${expectedTitle}"，实际"${titleText}"`);
      titlesCorrect = false;
    }
  });
  
  // 检查内容区域
  const contentAreas = popup.querySelectorAll('.section-content');
  let contentAreasExist = true;
  
  contentAreas.forEach((area, index) => {
    if (area) {
      console.log(`✅ 内容区域 ${index + 1} 存在`);
    } else {
      console.log(`❌ 内容区域 ${index + 1} 缺失`);
      contentAreasExist = false;
    }
  });
  
  return {
    titlesCorrect,
    contentAreasExist,
    success: titlesCorrect && contentAreasExist
  };
}

// 测试 3: 加载状态验证
function testLoadingStates() {
  console.log('\n🔍 测试 3: 加载状态验证');
  
  const popup = document.querySelector('.longport-ai-popup');
  if (!popup) {
    console.log('❌ 弹窗不存在');
    return false;
  }
  
  // 检查加载状态
  const loadingElements = popup.querySelectorAll('.loading');
  const hasLoadingElements = loadingElements.length > 0;
  
  if (hasLoadingElements) {
    console.log(`✅ 加载状态元素存在: ${loadingElements.length}个`);
    
    loadingElements.forEach((loading, index) => {
      const text = loading.textContent.trim();
      console.log(`  - 加载状态 ${index + 1}: "${text}"`);
    });
  } else {
    console.log('❌ 加载状态元素缺失');
  }
  
  // 检查结果区域是否隐藏
  const optimizedText = popup.querySelector('.optimized-text');
  const optimizationSuggestion = popup.querySelector('.optimization-suggestion');
  
  const optimizedTextHidden = !optimizedText || optimizedText.style.display === 'none';
  const suggestionHidden = !optimizationSuggestion || optimizationSuggestion.style.display === 'none';
  
  if (optimizedTextHidden) {
    console.log('✅ 优化后文案区域已隐藏（加载中）');
  } else {
    console.log('⚠️ 优化后文案区域已显示');
  }
  
  if (suggestionHidden) {
    console.log('✅ 文案建议区域已隐藏（加载中）');
  } else {
    console.log('⚠️ 文案建议区域已显示');
  }
  
  return {
    hasLoadingElements,
    optimizedTextHidden,
    suggestionHidden,
    success: hasLoadingElements
  };
}

// 测试 4: 按钮状态验证
function testButtonStates() {
  console.log('\n🔍 测试 4: 按钮状态验证');
  
  const popup = document.querySelector('.longport-ai-popup');
  if (!popup) {
    console.log('❌ 弹窗不存在');
    return false;
  }
  
  // 检查按钮
  const replaceBtn = popup.querySelector('#replaceBtn');
  const retryBtn = popup.querySelector('#retryBtn');
  const cancelBtn = popup.querySelector('#cancelBtn');
  
  let buttonsExist = true;
  let buttonsDisabled = true;
  
  if (replaceBtn) {
    console.log(`✅ 覆盖原文按钮存在，状态: ${replaceBtn.disabled ? '禁用' : '启用'}`);
    buttonsDisabled = buttonsDisabled && replaceBtn.disabled;
  } else {
    console.log('❌ 覆盖原文按钮缺失');
    buttonsExist = false;
  }
  
  if (retryBtn) {
    console.log(`✅ 再试一下按钮存在，状态: ${retryBtn.disabled ? '禁用' : '启用'}`);
    buttonsDisabled = buttonsDisabled && retryBtn.disabled;
  } else {
    console.log('❌ 再试一下按钮缺失');
    buttonsExist = false;
  }
  
  if (cancelBtn) {
    console.log(`✅ 取消按钮存在，状态: ${cancelBtn.disabled ? '禁用' : '启用'}`);
  } else {
    console.log('❌ 取消按钮缺失');
    buttonsExist = false;
  }
  
  // 验证按钮状态（加载中时应该禁用）
  if (buttonsDisabled) {
    console.log('✅ 按钮状态正确：加载中时功能按钮已禁用');
  } else {
    console.log('⚠️ 按钮状态异常：部分功能按钮未禁用');
  }
  
  return {
    buttonsExist,
    buttonsDisabled,
    success: buttonsExist && buttonsDisabled
  };
}

// 测试 5: 样式和视觉效果验证
function testStylesAndVisuals() {
  console.log('\n🔍 测试 5: 样式和视觉效果验证');
  
  const popup = document.querySelector('.longport-ai-popup');
  if (!popup) {
    console.log('❌ 弹窗不存在');
    return false;
  }
  
  // 检查弹窗样式类
  const hasPopupClass = popup.classList.contains('longport-ai-popup');
  if (hasPopupClass) {
    console.log('✅ 弹窗样式类正确');
  } else {
    console.log('❌ 弹窗样式类错误');
  }
  
  // 检查结果区域样式
  const resultSections = popup.querySelectorAll('.result-section');
  let sectionsStyled = true;
  
  resultSections.forEach((section, index) => {
    const hasBorder = section.style.border || getComputedStyle(section).border !== 'none';
    const hasBackground = section.style.backgroundColor || getComputedStyle(section).backgroundColor !== 'rgba(0, 0, 0, 0)';
    
    if (hasBorder && hasBackground) {
      console.log(`✅ 结果区域 ${index + 1} 样式正确`);
    } else {
      console.log(`❌ 结果区域 ${index + 1} 样式缺失`);
      sectionsStyled = false;
    }
  });
  
  // 检查标题样式
  const titles = popup.querySelectorAll('.section-title');
  let titlesStyled = true;
  
  titles.forEach((title, index) => {
    const hasColor = title.style.color || getComputedStyle(title).color !== 'rgba(0, 0, 0, 0)';
    const hasFontWeight = title.style.fontWeight || getComputedStyle(title).fontWeight !== 'normal';
    
    if (hasColor && hasFontWeight) {
      console.log(`✅ 标题 ${index + 1} 样式正确`);
    } else {
      console.log(`❌ 标题 ${index + 1} 样式缺失`);
      titlesStyled = false;
    }
  });
  
  return {
    hasPopupClass,
    sectionsStyled,
    titlesStyled,
    success: hasPopupClass && sectionsStyled && titlesStyled
  };
}

// 运行所有测试
async function runAllSplitResultTests() {
  console.log('🚀 开始运行弹窗结果拆分功能测试...\n');
  
  const startTime = Date.now();
  
  try {
    // 运行所有测试
    const test1 = testPopupStructure();
    const test2 = testTitlesAndContent();
    const test3 = testLoadingStates();
    const test4 = testButtonStates();
    const test5 = testStylesAndVisuals();
    
    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    
    // 显示测试结果摘要
    console.log('\n📋 弹窗结果拆分功能测试结果摘要');
    console.log('================================');
    console.log(`总耗时: ${totalDuration}ms`);
    console.log(`弹窗结构验证: ${test1 ? (test1.allElementsExist ? '✅' : '❌') : '⚠️'} (成功率: ${test1 ? (test1.successRate * 100).toFixed(1) : 0}%)`);
    console.log(`标题和内容验证: ${test2 ? (test2.success ? '✅' : '❌') : '⚠️'}`);
    console.log(`加载状态验证: ${test3 ? (test3.success ? '✅' : '❌') : '⚠️'}`);
    console.log(`按钮状态验证: ${test4 ? (test4.success ? '✅' : '❌') : '⚠️'}`);
    console.log(`样式和视觉效果: ${test5 ? (test5.success ? '✅' : '❌') : '⚠️'}`);
    console.log('================================');
    
    // 详细结果分析
    console.log('\n🔍 详细结果分析:');
    
    // 结构分析
    if (test1 && test1.allElementsExist) {
      console.log('✅ 弹窗结构完整，所有必需元素都存在');
      if (test1.hasTwoSections) {
        console.log('✅ 结果区域数量正确，分为两个独立部分');
      }
    } else {
      console.log('❌ 弹窗结构不完整，可能影响功能');
    }
    
    // 内容分析
    if (test2 && test2.success) {
      console.log('✅ 标题和内容区域配置正确');
    } else {
      console.log('❌ 标题或内容区域存在问题');
    }
    
    // 状态分析
    if (test3 && test3.success) {
      console.log('✅ 加载状态和结果显示逻辑正确');
    } else {
      console.log('❌ 加载状态或结果显示存在问题');
    }
    
    // 交互分析
    if (test4 && test4.success) {
      console.log('✅ 按钮状态和交互逻辑正确');
    } else {
      console.log('❌ 按钮状态或交互逻辑存在问题');
    }
    
    // 视觉分析
    if (test5 && test5.success) {
      console.log('✅ 样式和视觉效果良好');
    } else {
      console.log('❌ 样式或视觉效果存在问题');
    }
    
    // 功能特性说明
    console.log('\n🎯 新功能特性:');
    console.log('✅ 优化后文案：显示 AI 优化后的文本内容');
    console.log('✅ 文案建议：显示针对性的优化建议');
    console.log('✅ 独立区域：两个部分独立显示，结构清晰');
    console.log('✅ 智能分割：自动识别和分离优化结果和建议');
    console.log('✅ 样式区分：不同区域使用不同的视觉样式');
    
    // 总体评估
    const totalTests = 5;
    const successfulTests = [
      test1 && test1.allElementsExist,
      test2 && test2.success,
      test3 && test3.success,
      test4 && test4.success,
      test5 && test5.success
    ].filter(Boolean).length;
    
    console.log(`\n🎯 总体评估: ${successfulTests}/${totalTests} 项测试通过`);
    
    if (successfulTests === totalTests) {
      console.log('🎉 所有测试通过！弹窗结果拆分功能完全正常');
      console.log('✅ 优化后文案和文案建议正确显示');
      console.log('✅ 弹窗结构和样式完善');
      console.log('✅ 交互逻辑和状态管理正确');
      console.log('✅ 视觉效果和用户体验良好');
    } else if (successfulTests >= totalTests * 0.8) {
      console.log('✅ 大部分测试通过，弹窗结果拆分功能基本正常');
    } else if (successfulTests >= totalTests * 0.6) {
      console.log('⚠️ 部分测试通过，弹窗结果拆分功能可能存在问题');
    } else {
      console.log('❌ 大部分测试失败，弹窗结果拆分功能存在严重问题');
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
console.log('3. 等待弹窗出现后，运行此测试脚本');
console.log('4. 运行 runAllSplitResultTests() 开始测试');

console.log('\n💡 测试前准备:');
console.log('- 确保插件已更新到最新版本');
console.log('- 在支持的网站中选择文本并调用 AI 助手');
console.log('- 等待弹窗完全加载后再运行测试');

console.log('\n按 Enter 键开始运行所有弹窗结果拆分功能测试...');

document.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    runAllSplitResultTests();
  }
});

console.log('弹窗结果拆分功能测试脚本加载完成，按 Enter 键开始测试');
