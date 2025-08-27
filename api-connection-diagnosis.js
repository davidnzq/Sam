// API连接诊断脚本
// 诊断为什么API平台没有发现请求次数增加

console.log('🔍 开始API连接诊断...');

// 1. 测试基本网络连接
async function testBasicConnectivity() {
  console.log('\n📡 1. 测试基本网络连接...');
  
  try {
    // 测试DNS解析
    const testUrl = 'https://lboneapi.longbridge-inc.com/';
    console.log('测试URL:', testUrl);
    
    const response = await fetch(testUrl, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'User-Agent': 'LongPort-AI-Assistant/1.3.1'
      }
    });
    
    console.log('✅ 基本连接成功，状态码:', response.status);
    console.log('响应头:', Object.fromEntries(response.headers.entries()));
    
    return true;
  } catch (error) {
    console.error('❌ 基本连接失败:', error.message);
    return false;
  }
}

// 2. 测试API端点可用性
async function testAPIEndpoints() {
  console.log('\n🔗 2. 测试API端点可用性...');
  
  const baseUrl = 'https://lboneapi.longbridge-inc.com/';
  const endpoints = [
    '',
    'api/',
    'v1/',
    'chat/',
    'completions/',
    'optimize/',
    'text/',
    'ai/',
    'optimize_text/',
    'text_optimization/',
    'professional_optimization/',
    'grammar_optimization/'
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    try {
      const url = baseUrl + endpoint;
      console.log(`测试端点: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'User-Agent': 'LongPort-AI-Assistant/1.3.1'
        }
      });
      
      const result = {
        endpoint: endpoint,
        url: url,
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        available: response.ok
      };
      
      results.push(result);
      
      if (response.ok) {
        console.log(`✅ ${endpoint} - 可用 (${response.status})`);
      } else {
        console.log(`⚠️ ${endpoint} - 不可用 (${response.status} ${response.statusText})`);
      }
      
    } catch (error) {
      console.log(`❌ ${endpoint} - 连接失败: ${error.message}`);
      results.push({
        endpoint: endpoint,
        url: baseUrl + endpoint,
        status: 'ERROR',
        statusText: error.message,
        contentType: null,
        available: false
      });
    }
    
    // 添加延迟避免请求过快
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return results;
}

// 3. 测试API密钥验证
async function testAPIKeyValidation() {
  console.log('\n🔑 3. 测试API密钥验证...');
  
  const testConfig = {
    apiUrl: 'https://lboneapi.longbridge-inc.com/',
    apiKey: 'sk-7jSHih7SXoQcjMekQyTd3urc2G2BdtVzrzzdI6MotEpfWhyM'
  };
  
  try {
    // 构建测试请求
    const testRequest = {
      text: '这是一个测试文本，用于验证API连接。',
      site_type: 'longport',
      optimization_type: 'professional_optimization',
      language: 'zh-CN',
      style: 'professional_financial',
      requirements: {
        preserve_semantics: true,
        grammar_check: true,
        style_optimization: true,
        length_similarity: true,
        professional_tone: true,
        clarity_enhancement: true
      }
    };
    
    console.log('测试请求参数:', testRequest);
    
    // 尝试不同的请求方法
    const methods = ['POST', 'PUT', 'PATCH'];
    
    for (const method of methods) {
      try {
        console.log(`\n尝试 ${method} 请求...`);
        
        const response = await fetch(testConfig.apiUrl, {
          method: method,
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${testConfig.apiKey}`,
            'Accept': 'application/json',
            'User-Agent': 'LongPort-AI-Assistant/1.3.1'
          },
          body: method !== 'GET' ? JSON.stringify(testRequest) : undefined
        });
        
        console.log(`${method} 请求状态:`, response.status, response.statusText);
        console.log('响应头:', Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
          console.log(`✅ ${method} 请求成功！`);
          
          // 尝试读取响应内容
          try {
            const responseText = await response.text();
            console.log('响应内容预览:', responseText.substring(0, 200));
          } catch (readError) {
            console.log('无法读取响应内容:', readError.message);
          }
          
          return { success: true, method: method, status: response.status };
        } else {
          console.log(`⚠️ ${method} 请求失败: ${response.status} ${response.statusText}`);
          
          // 尝试读取错误响应
          try {
            const errorText = await response.text();
            console.log('错误响应:', errorText.substring(0, 200));
          } catch (readError) {
            console.log('无法读取错误响应:', readError.message);
          }
        }
        
      } catch (error) {
        console.log(`❌ ${method} 请求异常:`, error.message);
      }
    }
    
    return { success: false, error: '所有请求方法都失败了' };
    
  } catch (error) {
    console.error('❌ API密钥验证测试失败:', error);
    return { success: false, error: error.message };
  }
}

// 4. 检查CORS和权限问题
async function checkCORSAndPermissions() {
  console.log('\n🚫 4. 检查CORS和权限问题...');
  
  try {
    // 测试预检请求
    const testUrl = 'https://lboneapi.longbridge-inc.com/';
    
    console.log('测试预检请求...');
    
    const preflightResponse = await fetch(testUrl, {
      method: 'OPTIONS',
      mode: 'cors',
      headers: {
        'Origin': window.location.origin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    
    console.log('预检请求状态:', preflightResponse.status);
    console.log('CORS相关响应头:');
    console.log('- Access-Control-Allow-Origin:', preflightResponse.headers.get('Access-Control-Allow-Origin'));
    console.log('- Access-Control-Allow-Methods:', preflightResponse.headers.get('Access-Control-Allow-Methods'));
    console.log('- Access-Control-Allow-Headers:', preflightResponse.headers.get('Access-Control-Allow-Headers'));
    
    return true;
  } catch (error) {
    console.error('❌ CORS检查失败:', error.message);
    return false;
  }
}

// 5. 模拟真实的API调用流程
async function simulateRealAPICall() {
  console.log('\n🎯 5. 模拟真实的API调用流程...');
  
  try {
    // 模拟background.js中的callCompanyAPI函数
    const mockText = '这是一个需要优化的金融文案，包含投资建议和风险提示。';
    const mockSiteType = 'longport';
    
    console.log('模拟文本:', mockText);
    console.log('网站类型:', mockSiteType);
    
    // 构建请求体
    const requestBody = {
      text: mockText,
      site_type: mockSiteType,
      optimization_type: 'professional_optimization',
      language: 'zh-CN',
      style: 'professional_financial',
      requirements: {
        preserve_semantics: true,
        grammar_check: true,
        style_optimization: true,
        length_similarity: true,
        professional_tone: true,
        clarity_enhancement: true
      }
    };
    
    console.log('请求体:', requestBody);
    
    // 尝试发送请求
    const response = await fetch('https://lboneapi.longbridge-inc.com/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-7jSHih7SXoQcjMekQyTd3urc2G2BdtVzrzzdI6MotEpfWhyM',
        'Accept': 'application/json',
        'User-Agent': 'LongPort-AI-Assistant/1.3.1'
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('模拟API调用状态:', response.status, response.statusText);
    console.log('响应头:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      console.log('✅ 模拟API调用成功！');
      
      try {
        const responseData = await response.json();
        console.log('响应数据:', responseData);
      } catch (jsonError) {
        const responseText = await response.text();
        console.log('响应文本:', responseText.substring(0, 200));
      }
      
      return true;
    } else {
      console.log('⚠️ 模拟API调用失败:', response.status, response.statusText);
      
      try {
        const errorText = await response.text();
        console.log('错误详情:', errorText.substring(0, 200));
      } catch (readError) {
        console.log('无法读取错误详情:', readError.message);
      }
      
      return false;
    }
    
  } catch (error) {
    console.error('❌ 模拟API调用失败:', error.message);
    return false;
  }
}

// 6. 生成诊断报告
function generateDiagnosisReport(results) {
  console.log('\n📊 6. 生成诊断报告...');
  
  const report = {
    timestamp: new Date().toISOString(),
    basicConnectivity: results.basicConnectivity,
    apiEndpoints: results.apiEndpoints,
    apiKeyValidation: results.apiKeyValidation,
    corsCheck: results.corsCheck,
    realAPICall: results.realAPICall,
    summary: '',
    recommendations: []
  };
  
  // 分析结果
  if (!results.basicConnectivity) {
    report.summary = '❌ 基本网络连接失败';
    report.recommendations.push('检查网络连接和DNS设置');
  } else if (!results.apiKeyValidation.success) {
    report.summary = '⚠️ 网络连接正常，但API调用失败';
    report.recommendations.push('检查API密钥是否有效');
    report.recommendations.push('验证API端点是否正确');
    report.recommendations.push('确认API权限设置');
  } else if (!results.realAPICall) {
    report.summary = '⚠️ API配置正确，但实际调用失败';
    report.recommendations.push('检查请求格式是否符合API要求');
    report.recommendations.push('验证API的请求参数');
  } else {
    report.summary = '✅ API连接正常，功能完整';
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
  console.log('🚀 开始执行API连接诊断...\n');
  
  const results = {};
  
  try {
    results.basicConnectivity = await testBasicConnectivity();
    results.apiEndpoints = await testAPIEndpoints();
    results.apiKeyValidation = await testAPIKeyValidation();
    results.corsCheck = await checkCORSAndPermissions();
    results.realAPICall = await simulateRealAPICall();
    
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

console.log('📝 API连接诊断脚本已加载，将在页面加载完成后执行诊断...');
