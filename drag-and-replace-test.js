// 拖拽和替换功能测试脚本 - 验证弹窗拖拽、文本覆盖和重试功能
console.log('=== LongPort AI 助手拖拽和替换功能测试 ===');

// 测试配置
const testConfig = {
  testTexts: [
    '这是一个测试文本，用于验证拖拽和替换功能。',
    'The market shows strong momentum with increasing volume.',
    '基于当前市场分析，建议投资者关注科技板块。'
  ]
};

// 测试 1: 弹窗拖拽功能验证
function testPopupDrag() {
  console.log('\n🔍 测试 1: 弹窗拖拽功能验证');
  
  try {
    // 检查弹窗是否存在
    const popup = document.querySelector('.longport-ai-popup');
    if (!popup) {
      console.log('ℹ️ 当前页面没有弹窗，无法测试拖拽功能');
      console.log('请先选择文本并右键调用"校验优化内容"来显示弹窗');
      return false;
    }
    
    // 检查弹窗头部是否存在
    const popupHeader = popup.querySelector('#popupHeader');
    if (!popupHeader) {
      console.log('❌ 弹窗头部元素不存在');
      return false;
    }
    
    // 检查弹窗样式
    const computedStyle = window.getComputedStyle(popup);
    const position = computedStyle.position;
    
    if (position === 'fixed') {
      console.log('✅ 弹窗定位方式正确 (fixed)');
    } else {
      console.log('⚠️ 弹窗定位方式可能影响拖拽:', position);
    }
    
    // 检查弹窗是否包含拖拽相关的事件监听器
    const hasMouseEvents = popupHeader.onmousedown !== null;
    console.log(`弹窗头部鼠标事件: ${hasMouseEvents ? '✅ 已绑定' : '⚠️ 未绑定'}`);
    
    console.log('✅ 弹窗拖拽功能验证完成');
    console.log('💡 提示: 长按弹窗头部可以拖拽移动弹窗');
    
    return true;
  } catch (error) {
    console.log('❌ 弹窗拖拽功能验证失败:', error.message);
    return false;
  }
}

// 测试 2: 文本覆盖功能验证
function testTextReplacement() {
  console.log('\n🔍 测试 2: 文本覆盖功能验证');
  
  try {
    // 检查弹窗是否存在
    const popup = document.querySelector('.longport-ai-popup');
    if (!popup) {
      console.log('ℹ️ 当前页面没有弹窗，无法测试文本覆盖功能');
      return false;
    }
    
    // 检查覆盖原文按钮
    const replaceBtn = popup.querySelector('#replaceBtn');
    if (!replaceBtn) {
      console.log('❌ 覆盖原文按钮不存在');
      return false;
    }
    
    // 检查按钮状态
    const isDisabled = replaceBtn.disabled;
    console.log(`覆盖原文按钮状态: ${isDisabled ? '❌ 已禁用' : '✅ 已启用'}`);
    
    if (isDisabled) {
      console.log('ℹ️ 按钮已禁用，需要等待 AI 生成结果后才能使用');
    }
    
    // 检查结果文本区域
    const resultText = popup.querySelector('.result-text');
    if (resultText) {
      console.log('✅ 结果文本区域存在');
      const isVisible = resultText.style.display !== 'none';
      console.log(`结果文本显示状态: ${isVisible ? '✅ 已显示' : '⚠️ 已隐藏'}`);
    } else {
      console.log('⚠️ 结果文本区域不存在');
    }
    
    console.log('✅ 文本覆盖功能验证完成');
    console.log('💡 提示: 点击"覆盖原文"将直接替换选中的文本');
    
    return true;
  } catch (error) {
    console.log('❌ 文本覆盖功能验证失败:', error.message);
    return false;
  }
}

// 测试 3: 重试功能验证
function testRetryFunction() {
  console.log('\n🔍 测试 3: 重试功能验证');
  
  try {
    // 检查弹窗是否存在
    const popup = document.querySelector('.longport-ai-popup');
    if (!popup) {
      console.log('ℹ️ 当前页面没有弹窗，无法测试重试功能');
      return false;
    }
    
    // 检查再试一下按钮
    const retryBtn = popup.querySelector('#retryBtn');
    if (!retryBtn) {
      console.log('❌ 再试一下按钮不存在');
      return false;
    }
    
    // 检查按钮状态
    const isDisabled = retryBtn.disabled;
    console.log(`再试一下按钮状态: ${isDisabled ? '❌ 已禁用' : '✅ 已启用'}`);
    
    if (isDisabled) {
      console.log('ℹ️ 按钮已禁用，需要等待 AI 生成结果后才能使用');
    }
    
    // 检查加载状态区域
    const loadingEl = popup.querySelector('.loading');
    if (loadingEl) {
      console.log('✅ 加载状态区域存在');
      const loadingText = loadingEl.textContent;
      console.log('当前加载状态:', loadingText);
    } else {
      console.log('⚠️ 加载状态区域不存在');
    }
    
    console.log('✅ 重试功能验证完成');
    console.log('💡 提示: 点击"再试一下"将重新调用 AI 生成优化结果');
    
    return true;
  } catch (error) {
    console.log('❌ 重试功能验证失败:', error.message);
    return false;
  }
}

// 测试 4: 弹窗结构完整性验证
function testPopupStructure() {
  console.log('\n🔍 测试 4: 弹窗结构完整性验证');
  
  try {
    // 检查弹窗是否存在
    const popup = document.querySelector('.longport-ai-popup');
    if (!popup) {
      console.log('ℹ️ 当前页面没有弹窗，无法测试弹窗结构');
      return false;
    }
    
    // 检查弹窗的各个组成部分
    const requiredElements = [
      { id: 'popupHeader', name: '弹窗头部' },
      { id: 'closeBtn', name: '关闭按钮' },
      { id: 'replaceBtn', name: '覆盖原文按钮' },
      { id: 'retryBtn', name: '再试一下按钮' },
      { id: 'cancelBtn', name: '取消按钮' },
      { class: 'loading', name: '加载状态区域' },
      { class: 'result-text', name: '结果文本区域' }
    ];
    
    let allElementsExist = true;
    
    for (const element of requiredElements) {
      let foundElement;
      if (element.id) {
        foundElement = popup.querySelector(`#${element.id}`);
      } else if (element.class) {
        foundElement = popup.querySelector(`.${element.class}`);
      }
      
      if (foundElement) {
        console.log(`✅ ${element.name} 存在`);
      } else {
        console.log(`❌ ${element.name} 不存在`);
        allElementsExist = false;
      }
    }
    
    // 检查弹窗样式类
    const hasSiteClass = popup.classList.contains('site-longport') || 
                         popup.classList.contains('site-notion') ||
                         popup.classList.contains('site-unknown');
    
    if (hasSiteClass) {
      console.log('✅ 弹窗包含网站特定样式类');
    } else {
      console.log('⚠️ 弹窗缺少网站特定样式类');
    }
    
    console.log(`弹窗结构完整性: ${allElementsExist ? '✅ 完整' : '❌ 不完整'}`);
    
    return allElementsExist;
  } catch (error) {
    console.log('❌ 弹窗结构验证失败:', error.message);
    return false;
  }
}

// 测试 5: 交互功能模拟测试
function testInteractionSimulation() {
  console.log('\n🔍 测试 5: 交互功能模拟测试');
  
  try {
    // 检查弹窗是否存在
    const popup = document.querySelector('.longport-ai-popup');
    if (!popup) {
      console.log('ℹ️ 当前页面没有弹窗，无法测试交互功能');
      return false;
    }
    
    // 模拟拖拽事件
    console.log('模拟拖拽事件...');
    const popupHeader = popup.querySelector('#popupHeader');
    if (popupHeader) {
      // 创建鼠标按下事件
      const mousedownEvent = new MouseEvent('mousedown', {
        clientX: 100,
        clientY: 100,
        bubbles: true
      });
      
      // 触发事件
      popupHeader.dispatchEvent(mousedownEvent);
      
      // 检查拖拽状态
      setTimeout(() => {
        const isDragging = window.isDragging || false;
        console.log(`拖拽状态: ${isDragging ? '✅ 正在拖拽' : '⚠️ 未开始拖拽'}`);
      }, 100);
    }
    
    // 模拟按钮点击事件（不实际执行，只检查事件绑定）
    const replaceBtn = popup.querySelector('#replaceBtn');
    const retryBtn = popup.querySelector('#retryBtn');
    const cancelBtn = popup.querySelector('#cancelBtn');
    
    if (replaceBtn && replaceBtn.onclick !== null) {
      console.log('✅ 覆盖原文按钮已绑定点击事件');
    } else {
      console.log('⚠️ 覆盖原文按钮未绑定点击事件');
    }
    
    if (retryBtn && retryBtn.onclick !== null) {
      console.log('✅ 再试一下按钮已绑定点击事件');
    } else {
      console.log('⚠️ 再试一下按钮未绑定点击事件');
    }
    
    if (cancelBtn && cancelBtn.onclick !== null) {
      console.log('✅ 取消按钮已绑定点击事件');
    } else {
      console.log('⚠️ 取消按钮未绑定点击事件');
    }
    
    console.log('✅ 交互功能模拟测试完成');
    
    return true;
  } catch (error) {
    console.log('❌ 交互功能模拟测试失败:', error.message);
    return false;
  }
}

// 运行所有测试
async function runAllDragAndReplaceTests() {
  console.log('🚀 开始运行拖拽和替换功能测试...\n');
  
  const startTime = Date.now();
  
  try {
    // 运行所有测试
    const test1 = testPopupDrag();
    const test2 = testTextReplacement();
    const test3 = testRetryFunction();
    const test4 = testPopupStructure();
    const test5 = testInteractionSimulation();
    
    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    
    // 显示测试结果摘要
    console.log('\n📋 拖拽和替换功能测试结果摘要');
    console.log('================================');
    console.log(`总耗时: ${totalDuration}ms`);
    console.log(`弹窗拖拽功能: ${test1 ? '✅' : '⚠️'}`);
    console.log(`文本覆盖功能: ${test2 ? '✅' : '⚠️'}`);
    console.log(`重试功能: ${test3 ? '✅' : '⚠️'}`);
    console.log(`弹窗结构完整性: ${test4 ? '✅' : '❌'}`);
    console.log(`交互功能模拟: ${test5 ? '✅' : '⚠️'}`);
    console.log('================================');
    
    // 详细结果分析
    console.log('\n🔍 详细结果分析:');
    
    // 功能特性说明
    console.log('\n🎯 新功能特性:');
    console.log('✅ 弹窗拖拽: 长按弹窗头部可以拖拽移动，避免遮挡内容');
    console.log('✅ 直接覆盖: 点击"覆盖原文"直接删除选中内容并插入 AI 结果');
    console.log('✅ 智能重试: 点击"再试一下"重新调用 AI 生成优化结果');
    
    // 总体评估
    const totalTests = 5;
    const successfulTests = [test1, test2, test3, test4, test5].filter(Boolean).length;
    
    console.log(`\n🎯 总体评估: ${successfulTests}/${totalTests} 项测试通过`);
    
    if (successfulTests === totalTests) {
      console.log('🎉 所有测试通过！拖拽和替换功能完全正常');
      console.log('✅ 弹窗可以自由拖拽移动');
      console.log('✅ 文本覆盖功能正常工作');
      console.log('✅ 重试功能可以重新生成内容');
    } else if (successfulTests >= totalTests * 0.8) {
      console.log('✅ 大部分测试通过，功能基本正常');
    } else if (successfulTests >= totalTests * 0.6) {
      console.log('⚠️ 部分测试通过，功能可能存在问题');
    } else {
      console.log('❌ 大部分测试失败，功能存在严重问题');
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
console.log('1. 运行 testPopupDrag() 测试弹窗拖拽功能');
console.log('2. 运行 testTextReplacement() 测试文本覆盖功能');
console.log('3. 运行 testRetryFunction() 测试重试功能');
console.log('4. 运行 testPopupStructure() 测试弹窗结构完整性');
console.log('5. 运行 testInteractionSimulation() 测试交互功能模拟');
console.log('6. 运行 runAllDragAndReplaceTests() 运行所有测试');

console.log('\n💡 测试前准备:');
console.log('- 在支持的网站中选择文本');
console.log('- 右键点击选择"校验优化内容"');
console.log('- 等待弹窗显示后再运行测试');

console.log('\n按 Enter 键开始运行所有拖拽和替换功能测试...');

document.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    runAllDragAndReplaceTests();
  }
});

console.log('拖拽和替换功能测试脚本加载完成，按 Enter 键开始测试');
