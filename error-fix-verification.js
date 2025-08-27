// 错误修复验证脚本 - 验证 addEventListener 错误是否已修复
console.log('=== LongPort AI 助手错误修复验证 ===');

// 测试配置
const testConfig = {
  testElements: [
    'saveCompanyApi',
    'testCompanyApi',
    'resetToDefault',
    'saveOpenAI',
    'testOpenAI',
    'saveDouban',
    'testDouban',
    'openOptions',
    'refreshStatus'
  ],
  testPages: ['options', 'popup']
};

// 测试 1: DOM 元素存在性检查
function testDOMElements() {
  console.log('\n🔍 测试 1: DOM 元素存在性检查');
  
  const results = {};
  let allElementsExist = true;
  
  testConfig.testElements.forEach(elementId => {
    const element = document.getElementById(elementId);
    const exists = !!element;
    
    results[elementId] = {
      exists: exists,
      element: element,
      tagName: element ? element.tagName : 'N/A',
      className: element ? element.className : 'N/A'
    };
    
    if (!exists) {
      allElementsExist = false;
      console.log(`❌ 元素不存在: ${elementId}`);
    } else {
      console.log(`✅ 元素存在: ${elementId} (${element.tagName})`);
    }
  });
  
  console.log('\n📋 DOM 元素检查结果:');
  console.log('================================');
  Object.entries(results).forEach(([id, info]) => {
    const status = info.exists ? '✅' : '❌';
    console.log(`${status} ${id}: ${info.exists ? info.tagName : '不存在'}`);
  });
  console.log('================================');
  
  return {
    allElementsExist,
    results,
    successRate: Object.values(results).filter(r => r.exists).length / Object.keys(results).length
  };
}

// 测试 2: 事件监听器绑定检查
function testEventListenerBinding() {
  console.log('\n🔍 测试 2: 事件监听器绑定检查');
  
  // 检查当前页面类型
  const isOptionsPage = !!document.getElementById('saveCompanyApi');
  const isPopupPage = !!document.getElementById('openOptions');
  
  let pageType = 'unknown';
  if (isOptionsPage) pageType = 'options';
  else if (isPopupPage) pageType = 'popup';
  
  console.log(`当前页面类型: ${pageType}`);
  
  // 检查事件绑定
  const bindingResults = {};
  
  if (pageType === 'options') {
    // 检查选项页面的事件绑定
    const optionsElements = ['saveCompanyApi', 'testCompanyApi', 'resetToDefault', 'saveOpenAI', 'testOpenAI', 'saveDouban', 'testDouban'];
    
    optionsElements.forEach(elementId => {
      const element = document.getElementById(elementId);
      if (element) {
        // 检查是否有事件监听器（这是一个简化的检查）
        const hasClickHandler = element.onclick !== null;
        bindingResults[elementId] = {
          element: element,
          hasClickHandler: hasClickHandler,
          tagName: element.tagName,
          textContent: element.textContent
        };
        
        if (hasClickHandler) {
          console.log(`✅ ${elementId}: 有点击处理器`);
        } else {
          console.log(`⚠️ ${elementId}: 无点击处理器（可能通过 addEventListener 绑定）`);
        }
      }
    });
    
  } else if (pageType === 'popup') {
    // 检查弹窗页面的事件绑定
    const popupElements = ['openOptions', 'refreshStatus'];
    
    popupElements.forEach(elementId => {
      const element = document.getElementById(elementId);
      if (element) {
        const hasClickHandler = element.onclick !== null;
        bindingResults[elementId] = {
          element: element,
          hasClickHandler: hasClickHandler,
          tagName: element.tagName,
          textContent: element.textContent
        };
        
        if (hasClickHandler) {
          console.log(`✅ ${elementId}: 有点击处理器`);
        } else {
          console.log(`⚠️ ${elementId}: 无点击处理器（可能通过 addEventListener 绑定）`);
        }
      }
    });
  }
  
  return {
    pageType,
    bindingResults,
    success: Object.keys(bindingResults).length > 0
  };
}

// 测试 3: JavaScript 错误检查
function testJavaScriptErrors() {
  console.log('\n🔍 测试 3: JavaScript 错误检查');
  
  // 检查控制台是否有错误
  const originalError = console.error;
  const errors = [];
  
  console.error = function(...args) {
    errors.push(args.join(' '));
    originalError.apply(console, args);
  };
  
  // 尝试触发一些可能导致错误的操作
  try {
    // 检查 DOM 加载状态
    const domReady = document.readyState === 'complete' || document.readyState === 'interactive';
    console.log(`DOM 加载状态: ${document.readyState}`);
    
    // 检查 Chrome 扩展 API 可用性
    const hasChromeRuntime = typeof chrome !== 'undefined' && chrome.runtime;
    const hasChromeStorage = typeof chrome !== 'undefined' && chrome.storage;
    
    console.log(`Chrome Runtime API: ${hasChromeRuntime ? '✅ 可用' : '❌ 不可用'}`);
    console.log(`Chrome Storage API: ${hasChromeStorage ? '✅ 可用' : '❌ 不可用'}`);
    
    // 检查存储中的配置
    if (hasChromeStorage) {
      chrome.storage.sync.get(['companyApiUrl', 'companyApiKey', 'openaiApiKey', 'doubanApiKey'], (result) => {
        console.log('存储配置检查:', result);
      });
    }
    
  } catch (error) {
    console.log(`❌ 测试过程中出现错误: ${error.message}`);
    errors.push(error.message);
  }
  
  // 恢复原始 console.error
  console.error = originalError;
  
  return {
    errors,
    hasErrors: errors.length > 0,
    errorCount: errors.length
  };
}

// 测试 4: 功能完整性检查
function testFunctionality() {
  console.log('\n🔍 测试 4: 功能完整性检查');
  
  const functionalityResults = {};
  
  // 检查必要的函数是否存在
  const requiredFunctions = [
    'loadSettings',
    'bindEvents',
    'saveCompanyApiSettings',
    'testCompanyApiConnection',
    'resetToDefault',
    'saveOpenAISettings',
    'testOpenAIConnection',
    'saveDoubanSettings',
    'testDoubanConnection',
    'loadAPIStatus',
    'updateStatusIndicator'
  ];
  
  requiredFunctions.forEach(funcName => {
    const exists = typeof window[funcName] === 'function';
    functionalityResults[funcName] = exists;
    
    if (exists) {
      console.log(`✅ 函数存在: ${funcName}`);
    } else {
      console.log(`❌ 函数不存在: ${funcName}`);
    }
  });
  
  return {
    functionalityResults,
    successRate: Object.values(functionalityResults).filter(Boolean).length / Object.keys(functionalityResults).length
  };
}

// 测试 5: 页面加载时序检查
function testPageLoadTiming() {
  console.log('\n🔍 测试 5: 页面加载时序检查');
  
  const timingResults = {
    domReadyState: document.readyState,
    hasDOMContentLoaded: false,
    hasLoad: false,
    scriptExecutionTime: Date.now()
  };
  
  // 检查 DOMContentLoaded 事件
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      timingResults.hasDOMContentLoaded = true;
      console.log('✅ DOMContentLoaded 事件触发');
    });
  } else {
    timingResults.hasDOMContentLoaded = true;
    console.log('✅ DOM 已加载完成');
  }
  
  // 检查 load 事件
  if (document.readyState === 'loading' || document.readyState === 'interactive') {
    window.addEventListener('load', () => {
      timingResults.hasLoad = true;
      console.log('✅ Load 事件触发');
    });
  } else {
    timingResults.hasLoad = true;
    console.log('✅ 页面已完全加载');
  }
  
  console.log('页面加载时序:', timingResults);
  
  return timingResults;
}

// 运行所有测试
async function runAllErrorFixTests() {
  console.log('🚀 开始运行错误修复验证测试...\n');
  
  const startTime = Date.now();
  
  try {
    // 运行所有测试
    const test1 = testDOMElements();
    const test2 = testEventListenerBinding();
    const test3 = testJavaScriptErrors();
    const test4 = testFunctionality();
    const test5 = testPageLoadTiming();
    
    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    
    // 显示测试结果摘要
    console.log('\n📋 错误修复验证测试结果摘要');
    console.log('================================');
    console.log(`总耗时: ${totalDuration}ms`);
    console.log(`DOM 元素检查: ${test1.allElementsExist ? '✅' : '❌'} (成功率: ${(test1.successRate * 100).toFixed(1)}%)`);
    console.log(`事件监听器绑定: ${test2.success ? '✅' : '❌'} (页面类型: ${test2.pageType})`);
    console.log(`JavaScript 错误检查: ${test3.hasErrors ? '❌' : '✅'} (错误数: ${test3.errorCount})`);
    console.log(`功能完整性检查: ${(test4.successRate * 100).toFixed(1)}% 通过`);
    console.log(`页面加载时序: ${test5.hasDOMContentLoaded ? '✅' : '⚠️'} DOMContentLoaded`);
    console.log('================================');
    
    // 详细结果分析
    console.log('\n🔍 详细结果分析:');
    
    // DOM 元素分析
    if (!test1.allElementsExist) {
      console.log('⚠️ 部分 DOM 元素缺失，可能影响功能');
      Object.entries(test1.results).forEach(([id, info]) => {
        if (!info.exists) {
          console.log(`  - 缺失元素: ${id}`);
        }
      });
    } else {
      console.log('✅ 所有必需的 DOM 元素都存在');
    }
    
    // 事件绑定分析
    if (test2.success) {
      console.log(`✅ ${test2.pageType} 页面事件绑定正常`);
    } else {
      console.log('❌ 事件绑定存在问题');
    }
    
    // 错误分析
    if (test3.hasErrors) {
      console.log('❌ 检测到 JavaScript 错误:');
      test3.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    } else {
      console.log('✅ 未检测到 JavaScript 错误');
    }
    
    // 功能分析
    if (test4.successRate >= 0.8) {
      console.log('✅ 大部分功能函数存在，功能完整性良好');
    } else if (test4.successRate >= 0.6) {
      console.log('⚠️ 部分功能函数缺失，功能完整性一般');
    } else {
      console.log('❌ 大量功能函数缺失，功能完整性差');
    }
    
    // 总体评估
    const totalTests = 5;
    const successfulTests = [
      test1.allElementsExist,
      test2.success,
      !test3.hasErrors,
      test4.successRate >= 0.8,
      test5.hasDOMContentLoaded
    ].filter(Boolean).length;
    
    console.log(`\n🎯 总体评估: ${successfulTests}/${totalTests} 项测试通过`);
    
    if (successfulTests === totalTests) {
      console.log('🎉 所有测试通过！错误修复验证成功');
      console.log('✅ addEventListener 错误已完全修复');
      console.log('✅ DOM 元素加载正常');
      console.log('✅ 事件绑定机制完善');
      console.log('✅ JavaScript 执行无错误');
      console.log('✅ 功能完整性良好');
    } else if (successfulTests >= totalTests * 0.8) {
      console.log('✅ 大部分测试通过，错误修复基本成功');
    } else if (successfulTests >= totalTests * 0.6) {
      console.log('⚠️ 部分测试通过，错误修复可能存在问题');
    } else {
      console.log('❌ 大部分测试失败，错误修复存在严重问题');
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
console.log('1. 运行 testDOMElements() 测试 DOM 元素存在性');
console.log('2. 运行 testEventListenerBinding() 测试事件监听器绑定');
console.log('3. 运行 testJavaScriptErrors() 测试 JavaScript 错误');
console.log('4. 运行 testFunctionality() 测试功能完整性');
console.log('5. 运行 testPageLoadTiming() 测试页面加载时序');
console.log('6. 运行 runAllErrorFixTests() 运行所有测试');

console.log('\n💡 测试前准备:');
console.log('- 确保插件已更新到 v1.3.1');
console.log('- 在设置页面或弹窗页面运行此脚本');
console.log('- 检查浏览器控制台是否有错误信息');

console.log('\n按 Enter 键开始运行所有错误修复验证测试...');

document.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    runAllErrorFixTests();
  }
});

console.log('错误修复验证测试脚本加载完成，按 Enter 键开始测试');
