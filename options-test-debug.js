// Options页面测试调试脚本
// 诊断为什么返回"AI 返回的优化结果为空或格式无效"

console.log('🔍 开始诊断Options页面测试问题...');

// 1. 检查Chrome扩展API是否可用
function checkChromeExtensionAPI() {
  console.log('\n📋 1. 检查Chrome扩展API...');
  
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      console.log('✅ Chrome扩展API可用');
      console.log('✅ chrome.runtime.sendMessage 可用');
      return true;
    } else {
      console.error('❌ Chrome扩展API不可用');
      return false;
    }
  } catch (error) {
    console.error('❌ Chrome扩展API检查失败:', error);
    return false;
  }
}

// 2. 测试消息发送功能
async function testMessageSending() {
  console.log('\n📋 2. 测试消息发送功能...');
  
  try {
    const testMessage = {
      action: 'callAI',
      text: '这是一个测试文本，用于验证API调用功能。',
      apiType: 'company',
      siteType: 'general',
      optimizationType: 'deep_optimization'
    };
    
    console.log('发送测试消息:', testMessage);
    
    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(testMessage, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });
    
    console.log('✅ 收到响应:', response);
    
    // 分析响应格式
    if (response) {
      console.log('响应类型:', typeof response);
      console.log('响应键:', Object.keys(response));
      
      if (response.success) {
        console.log('✅ 响应成功');
        
        // 检查优化文本字段
        const optimizedText = response.optimizedText || response.result || response.text || response.optimized_text;
        console.log('优化文本字段:', optimizedText);
        console.log('优化文本类型:', typeof optimizedText);
        console.log('优化文本长度:', optimizedText ? optimizedText.length : 0);
        
        if (optimizedText && typeof optimizedText === 'string' && optimizedText.trim().length > 0) {
          console.log('✅ 优化文本有效');
          return { success: true, optimizedText: optimizedText };
        } else {
          console.log('❌ 优化文本无效');
          return { success: false, error: '优化文本为空或格式无效' };
        }
      } else {
        console.log('❌ 响应失败:', response.error);
        return { success: false, error: response.error };
      }
    } else {
      console.log('❌ 未收到响应');
      return { success: false, error: '未收到响应' };
    }
    
  } catch (error) {
    console.error('❌ 消息发送测试失败:', error);
    return { success: false, error: error.message };
  }
}

// 3. 检查存储的API配置
async function checkStoredAPIConfig() {
  console.log('\n📋 3. 检查存储的API配置...');
  
  try {
    const config = await chrome.storage.sync.get([
      'companyApiKey', 'companyApiUrl'
    ]);
    
    console.log('存储的API配置:', config);
    
    if (config.companyApiKey && config.companyApiUrl) {
      console.log('✅ API配置已存储');
      console.log('API密钥长度:', config.companyApiKey.length);
      console.log('API URL:', config.companyApiUrl);
      return true;
    } else {
      console.log('⚠️ API配置不完整');
      console.log('公司API密钥:', config.companyApiKey ? '已配置' : '未配置');
      console.log('公司API URL:', config.companyApiUrl ? '已配置' : '未配置');
      return false;
    }
  } catch (error) {
    console.error('❌ 检查API配置失败:', error);
    return false;
  }
}

// 4. 测试ping功能
async function testPingFunction() {
  console.log('\n📋 4. 测试ping功能...');
  
  try {
    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: 'ping' }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });
    
    console.log('✅ Ping响应:', response);
    return true;
  } catch (error) {
    console.error('❌ Ping测试失败:', error);
    return false;
  }
}

// 5. 模拟完整的测试流程
async function simulateFullTestFlow() {
  console.log('\n📋 5. 模拟完整的测试流程...');
  
  try {
    // 步骤1: 检查API配置
    const hasConfig = await checkStoredAPIConfig();
    if (!hasConfig) {
      console.log('⚠️ API配置不完整，可能影响测试结果');
    }
    
    // 步骤2: 测试ping
    const pingSuccess = await testPingFunction();
    if (!pingSuccess) {
      console.log('❌ Ping测试失败，后台脚本可能有问题');
      return false;
    }
    
    // 步骤3: 测试API调用
    const apiTestResult = await testMessageSending();
    
    // 步骤4: 分析结果
    if (apiTestResult.success) {
      console.log('🎉 完整测试流程成功！');
      console.log('优化结果:', apiTestResult.optimizedText);
      return true;
    } else {
      console.log('❌ 完整测试流程失败:', apiTestResult.error);
      return false;
    }
    
  } catch (error) {
    console.error('❌ 完整测试流程异常:', error);
    return false;
  }
}

// 6. 生成诊断报告
function generateDiagnosisReport(results) {
  console.log('\n📊 6. 生成诊断报告...');
  
  const report = {
    timestamp: new Date().toISOString(),
    chromeExtensionAPI: results.chromeExtensionAPI,
    messageSending: results.messageSending,
    storedAPIConfig: results.storedAPIConfig,
    pingFunction: results.pingFunction,
    fullTestFlow: results.fullTestFlow,
    summary: '',
    recommendations: []
  };
  
  // 分析结果
  if (!results.chromeExtensionAPI) {
    report.summary = '❌ Chrome扩展API不可用';
    report.recommendations.push('检查扩展是否正确安装和启用');
  } else if (!results.pingFunction) {
    report.summary = '❌ 后台脚本无法连接';
    report.recommendations.push('重新加载扩展');
    report.recommendations.push('检查background.js是否有语法错误');
  } else if (!results.storedAPIConfig) {
    report.summary = '⚠️ API配置不完整';
    report.recommendations.push('在设置页面配置API密钥和URL');
  } else if (!results.messageSending) {
    report.summary = '❌ API调用失败';
    report.recommendations.push('检查API端点是否正确');
    report.recommendations.push('验证API密钥是否有效');
  } else if (!results.fullTestFlow) {
    report.summary = '⚠️ 部分功能异常';
    report.recommendations.push('查看控制台错误信息');
  } else {
    report.summary = '✅ 所有功能正常';
  }
  
  console.log('\n🔍 诊断报告:');
  console.log('时间:', report.timestamp);
  console.log('总结:', report.summary);
  console.log('\n建议:');
  report.recommendations.forEach((rec, index) => {
    console.log(`${index + 1}. ${rec}`);
  });
  
  return report;
}

// 执行所有诊断
async function runAllDiagnostics() {
  console.log('🚀 开始执行Options页面测试诊断...\n');
  
  const results = {};
  
  try {
    results.chromeExtensionAPI = checkChromeExtensionAPI();
    results.messageSending = await testMessageSending();
    results.storedAPIConfig = await checkStoredAPIConfig();
    results.pingFunction = await testPingFunction();
    results.fullTestFlow = await simulateFullTestFlow();
    
    const report = generateDiagnosisReport(results);
    
    console.log('\n🎯 诊断完成！');
    return report;
    
  } catch (error) {
    console.error('❌ 诊断过程中发生错误:', error);
    return null;
  }
}

// 自动运行诊断
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      runAllDiagnostics();
    }, 1000);
  });
} else {
  runAllDiagnostics();
}

console.log('📝 Options页面测试诊断脚本已加载，将在页面加载完成后执行诊断...');
