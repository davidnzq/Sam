// AI 调用调试脚本 - 诊断 AI 调用失败问题
console.log('=== LongPort AI 助手 AI 调用调试 ===');

// 调试配置
const debugConfig = {
  testText: '这是一个测试文本，用于调试 AI 调用问题。',
  siteType: 'longport'
};

// 调试 1: 检查 Chrome 扩展 API 可用性
function debugChromeExtensionAPI() {
  console.log('\n🔍 调试 1: Chrome 扩展 API 可用性检查');
  
  const apiChecks = {
    chromeRuntime: typeof chrome !== 'undefined' && chrome.runtime,
    chromeStorage: typeof chrome !== 'undefined' && chrome.storage,
    chromeTabs: typeof chrome !== 'undefined' && chrome.tabs,
    chromeScripting: typeof chrome !== 'undefined' && chrome.scripting
  };
  
  Object.entries(apiChecks).forEach(([api, available]) => {
    if (available) {
      console.log(`✅ ${api}: 可用`);
    } else {
      console.log(`❌ ${api}: 不可用`);
    }
  });
  
  return Object.values(apiChecks).every(Boolean);
}

// 调试 2: 检查消息传递机制
function debugMessagePassing() {
  console.log('\n🔍 调试 2: 消息传递机制检查');
  
  return new Promise((resolve) => {
    try {
      console.log('发送 ping 消息到 background script...');
      
      chrome.runtime.sendMessage({ action: 'ping' }, (response) => {
        if (chrome.runtime.lastError) {
          console.log('❌ 消息传递失败:', chrome.runtime.lastError.message);
          resolve(false);
        } else if (response && response.success) {
          console.log('✅ 消息传递成功:', response);
          resolve(true);
        } else {
          console.log('❌ 消息传递异常，响应:', response);
          resolve(false);
        }
      });
    } catch (error) {
      console.log('❌ 消息传递异常:', error.message);
      resolve(false);
    }
  });
}

// 调试 3: 检查 background script 状态
function debugBackgroundScriptStatus() {
  console.log('\n🔍 调试 3: Background Script 状态检查');
  
  return new Promise((resolve) => {
    try {
      console.log('检查 background script 是否响应...');
      
      chrome.runtime.sendMessage({ action: 'contentScriptReady', siteType: debugConfig.siteType }, (response) => {
        if (chrome.runtime.lastError) {
          console.log('❌ Background script 无响应:', chrome.runtime.lastError.message);
          resolve(false);
        } else if (response && response.success) {
          console.log('✅ Background script 响应正常:', response);
          resolve(true);
        } else {
          console.log('❌ Background script 响应异常:', response);
          resolve(false);
        }
      });
    } catch (error) {
      console.log('❌ Background script 状态检查异常:', error.message);
      resolve(false);
    }
  });
}

// 调试 4: 模拟 AI 调用
function debugAICall() {
  console.log('\n🔍 调试 4: 模拟 AI 调用');
  
  return new Promise((resolve) => {
    try {
      console.log('模拟 AI 调用请求...');
      console.log('请求参数:', {
        action: 'callAI',
        text: debugConfig.testText,
        apiType: 'company',
        siteType: debugConfig.siteType,
        optimizationType: 'deep_optimization'
      });
      
      chrome.runtime.sendMessage({
        action: 'callAI',
        text: debugConfig.testText,
        apiType: 'company',
        siteType: debugConfig.siteType,
        optimizationType: 'deep_optimization'
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.log('❌ AI 调用失败:', chrome.runtime.lastError.message);
          resolve({ success: false, error: chrome.runtime.lastError.message });
        } else if (response) {
          console.log('✅ AI 调用响应:', response);
          resolve({ success: true, response: response });
        } else {
          console.log('❌ AI 调用无响应');
          resolve({ success: false, error: '无响应' });
        }
      });
    } catch (error) {
      console.log('❌ AI 调用异常:', error.message);
      resolve({ success: false, error: error.message });
    }
  });
}

// 调试 5: 检查存储配置
function debugStorageConfiguration() {
  console.log('\n🔍 调试 5: 存储配置检查');
  
  return new Promise((resolve) => {
    try {
      console.log('检查存储的 API 配置...');
      
      chrome.storage.sync.get([
        'companyApiKey', 'companyApiUrl', 'openaiApiKey', 'doubanApiKey'
      ], (result) => {
        if (chrome.runtime.lastError) {
          console.log('❌ 存储访问失败:', chrome.runtime.lastError.message);
          resolve(false);
        } else {
          console.log('✅ 存储配置:', result);
          
          const hasCompanyConfig = result.companyApiKey && result.companyApiUrl;
          const hasOpenAIConfig = result.openaiApiKey;
          const hasDoubanConfig = result.doubanApiKey;
          
          console.log(`公司内部 API 配置: ${hasCompanyConfig ? '✅ 完整' : '❌ 缺失'}`);
          console.log(`OpenAI API 配置: ${hasOpenAIConfig ? '✅ 已配置' : '❌ 未配置'}`);
          console.log(`豆包 API 配置: ${hasDoubanConfig ? '✅ 已配置' : '❌ 未配置'}`);
          
          resolve(hasCompanyConfig || hasOpenAIConfig || hasDoubanConfig);
        }
      });
    } catch (error) {
      console.log('❌ 存储配置检查异常:', error.message);
      resolve(false);
    }
  });
}

// 调试 6: 检查网络连接
function debugNetworkConnection() {
  console.log('\n🔍 调试 6: 网络连接检查');
  
  return new Promise((resolve) => {
    try {
      console.log('检查网络连接状态...');
      
      // 尝试访问一个简单的 API 端点来测试网络连接
      fetch('https://httpbin.org/get', { method: 'GET' })
        .then(response => {
          if (response.ok) {
            console.log('✅ 网络连接正常');
            resolve(true);
          } else {
            console.log('❌ 网络连接异常，状态码:', response.status);
            resolve(false);
          }
        })
        .catch(error => {
          console.log('❌ 网络连接失败:', error.message);
          resolve(false);
        });
    } catch (error) {
      console.log('❌ 网络连接检查异常:', error.message);
      resolve(false);
    }
  });
}

// 运行所有调试
async function runAllAICallDebug() {
  console.log('🚀 开始运行 AI 调用调试...\n');
  
  const startTime = Date.now();
  
  try {
    // 运行所有调试
    const debug1 = debugChromeExtensionAPI();
    const debug2 = await debugMessagePassing();
    const debug3 = await debugBackgroundScriptStatus();
    const debug4 = await debugAICall();
    const debug5 = await debugStorageConfiguration();
    const debug6 = await debugNetworkConnection();
    
    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    
    // 显示调试结果摘要
    console.log('\n📋 AI 调用调试结果摘要');
    console.log('================================');
    console.log(`总耗时: ${totalDuration}ms`);
    console.log(`Chrome 扩展 API: ${debug1 ? '✅ 可用' : '❌ 不可用'}`);
    console.log(`消息传递机制: ${debug2 ? '✅ 正常' : '❌ 异常'}`);
    console.log(`Background Script: ${debug3 ? '✅ 正常' : '❌ 异常'}`);
    console.log(`AI 调用测试: ${debug4.success ? '✅ 成功' : '❌ 失败'}`);
    console.log(`存储配置: ${debug5 ? '✅ 完整' : '❌ 缺失'}`);
    console.log(`网络连接: ${debug6 ? '✅ 正常' : '❌ 异常'}`);
    console.log('================================');
    
    // 详细结果分析
    console.log('\n🔍 详细结果分析:');
    
    // API 可用性分析
    if (debug1) {
      console.log('✅ Chrome 扩展 API 完全可用');
    } else {
      console.log('❌ Chrome 扩展 API 存在问题，可能影响插件功能');
    }
    
    // 消息传递分析
    if (debug2) {
      console.log('✅ 消息传递机制正常，content script 和 background script 可以通信');
    } else {
      console.log('❌ 消息传递机制异常，content script 无法与 background script 通信');
    }
    
    // Background Script 分析
    if (debug3) {
      console.log('✅ Background Script 运行正常，能够处理消息');
    } else {
      console.log('❌ Background Script 无响应，可能未启动或存在错误');
    }
    
    // AI 调用分析
    if (debug4.success) {
      console.log('✅ AI 调用测试成功，API 调用机制正常');
      console.log('  响应详情:', debug4.response);
    } else {
      console.log('❌ AI 调用测试失败:', debug4.error);
    }
    
    // 配置分析
    if (debug5) {
      console.log('✅ API 配置完整，至少有一个可用的 API 配置');
    } else {
      console.log('❌ API 配置缺失，需要配置至少一个 API');
    }
    
    // 网络分析
    if (debug6) {
      console.log('✅ 网络连接正常，可以访问外部 API');
    } else {
      console.log('❌ 网络连接异常，可能影响 API 调用');
    }
    
    // 问题诊断
    console.log('\n🔧 问题诊断:');
    
    if (!debug1) {
      console.log('❌ 主要问题：Chrome 扩展 API 不可用');
      console.log('  解决方案：检查插件是否正确安装和启用');
    } else if (!debug2) {
      console.log('❌ 主要问题：消息传递机制异常');
      console.log('  解决方案：检查 content script 和 background script 是否正确注入');
    } else if (!debug3) {
      console.log('❌ 主要问题：Background Script 无响应');
      console.log('  解决方案：检查 background script 是否正确启动');
    } else if (!debug4.success) {
      console.log('❌ 主要问题：AI 调用失败');
      console.log('  解决方案：检查 API 配置和网络连接');
    } else if (!debug5) {
      console.log('❌ 主要问题：API 配置缺失');
      console.log('  解决方案：在插件设置中配置至少一个 API');
    } else if (!debug6) {
      console.log('❌ 主要问题：网络连接异常');
      console.log('  解决方案：检查网络连接和防火墙设置');
    } else {
      console.log('✅ 所有检查都通过，AI 调用应该正常工作');
    }
    
    // 总体评估
    const totalChecks = 6;
    const successfulChecks = [debug1, debug2, debug3, debug4.success, debug5, debug6].filter(Boolean).length;
    
    console.log(`\n🎯 总体评估: ${successfulChecks}/${totalChecks} 项检查通过`);
    
    if (successfulChecks === totalChecks) {
      console.log('🎉 所有检查通过！AI 调用功能应该正常');
    } else if (successfulChecks >= totalChecks * 0.8) {
      console.log('✅ 大部分检查通过，AI 调用功能基本正常');
    } else if (successfulChecks >= totalChecks * 0.6) {
      console.log('⚠️ 部分检查通过，AI 调用功能可能存在问题');
    } else {
      console.log('❌ 大部分检查失败，AI 调用功能存在严重问题');
    }
    
    return {
      debug1, debug2, debug3, debug4, debug5, debug6,
      totalDuration,
      successRate: successfulChecks / totalChecks
    };
    
  } catch (error) {
    console.error('❌ 调试执行失败:', error);
    return null;
  }
}

// 显示使用说明
console.log('使用方法:');
console.log('1. 在支持的网站中运行此脚本');
console.log('2. 运行 runAllAICallDebug() 开始调试');
console.log('3. 查看控制台输出的详细调试信息');

console.log('\n💡 调试前准备:');
console.log('- 确保插件已正确安装和启用');
console.log('- 检查浏览器控制台是否有错误信息');
console.log('- 确认网络连接正常');

console.log('\n按 Enter 键开始运行所有 AI 调用调试...');

document.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    runAllAICallDebug();
  }
});

console.log('AI 调用调试脚本加载完成，按 Enter 键开始调试');
