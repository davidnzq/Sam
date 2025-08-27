// API 响应调试脚本 - 检查 API 的实际返回格式
console.log('=== Notion AI 助手 API 响应调试 ===');

// 公司 AI API 配置
const companyConfig = {
  apiKey: 'sk-7jSHih7SXoQcjMekQyTd3urc2G2BdtVzrzzdI6MotEpfWhyM',
  apiUrl: 'https://lboneapi.longbridge-inc.com/',
  testText: '这是一个测试文本，用于验证 API 连接和响应格式。'
};

// 测试 1: 直接调用 API 并检查响应
async function testDirectAPI() {
  console.log('\n🔍 测试 1: 直接调用 API');
  console.log('API 地址:', companyConfig.apiUrl);
  console.log('API 密钥:', companyConfig.apiKey.substring(0, 10) + '...');
  console.log('测试文本:', companyConfig.testText);
  
  try {
    console.log('发送请求...');
    
    const response = await fetch(companyConfig.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${companyConfig.apiKey}`
      },
      body: JSON.stringify({
        text: companyConfig.testText,
        task: 'grammar_check_and_optimize'
      })
    });

    console.log('收到响应:');
    console.log('- 状态码:', response.status);
    console.log('- 状态文本:', response.statusText);
    console.log('- 响应头:');
    
    // 显示所有响应头
    for (const [key, value] of response.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }

    if (response.ok) {
      console.log('✅ HTTP 请求成功');
      
      // 获取响应内容类型
      const contentType = response.headers.get('content-type');
      console.log('响应内容类型:', contentType);
      
      // 尝试获取响应文本
      const responseText = await response.text();
      console.log('响应内容长度:', responseText.length);
      console.log('响应内容预览:');
      console.log(responseText.substring(0, 1000));
      
      // 检查是否为 JSON
      if (contentType && contentType.includes('application/json')) {
        try {
          const jsonData = JSON.parse(responseText);
          console.log('✅ JSON 解析成功');
          console.log('JSON 数据结构:', jsonData);
          
          // 检查是否有预期的字段
          if (jsonData.optimized_text || jsonData.text) {
            console.log('✅ 响应包含预期字段');
            console.log('优化文本:', jsonData.optimized_text || jsonData.text);
          } else {
            console.log('⚠️ 响应不包含预期字段');
            console.log('可用字段:', Object.keys(jsonData));
          }
        } catch (jsonError) {
          console.error('❌ JSON 解析失败:', jsonError.message);
          console.log('原始响应内容:', responseText);
        }
      } else {
        console.log('⚠️ 响应不是 JSON 格式');
        console.log('建议检查 API 端点是否正确');
        
        // 尝试不同的端点
        console.log('\n尝试不同的 API 端点...');
        await testDifferentEndpoints();
      }
    } else {
      console.error('❌ HTTP 请求失败');
      const errorText = await response.text();
      console.log('错误响应:', errorText);
    }
    
  } catch (error) {
    console.error('❌ 请求异常:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.log('可能的原因:');
      console.log('- 网络连接问题');
      console.log('- CORS 跨域限制');
      console.log('- API 地址不可访问');
    }
  }
}

// 测试 2: 尝试不同的 API 端点
async function testDifferentEndpoints() {
  console.log('\n🔍 测试 2: 尝试不同的 API 端点');
  
  const endpoints = [
    'https://lboneapi.longbridge-inc.com/api/',
    'https://lboneapi.longbridge-inc.com/v1/',
    'https://lboneapi.longbridge-inc.com/chat/',
    'https://lboneapi.longbridge-inc.com/completions/',
    'https://lboneapi.longbridge-inc.com/optimize/'
  ];
  
  for (const endpoint of endpoints) {
    console.log(`\n尝试端点: ${endpoint}`);
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${companyConfig.apiKey}`
        },
        body: JSON.stringify({
          text: companyConfig.testText,
          task: 'grammar_check_and_optimize'
        })
      });
      
      console.log(`状态码: ${response.status}`);
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        console.log(`内容类型: ${contentType}`);
        
        if (contentType && contentType.includes('application/json')) {
          console.log('✅ 找到有效的 JSON 端点');
          const jsonData = await response.json();
          console.log('响应数据:', jsonData);
          break;
        }
      }
    } catch (error) {
      console.log(`端点 ${endpoint} 测试失败:`, error.message);
    }
  }
}

// 测试 3: 检查网络连接
async function checkNetworkConnection() {
  console.log('\n🔍 测试 3: 网络连接检查');
  
  try {
    // 测试基本网络连接
    const testResponse = await fetch('https://httpbin.org/get');
    if (testResponse.ok) {
      console.log('✅ 基本网络连接正常');
    } else {
      console.log('❌ 基本网络连接异常');
    }
    
    // 测试目标域名解析
    try {
      const dnsTest = await fetch('https://lboneapi.longbridge-inc.com/', {
        method: 'HEAD'
      });
      console.log('✅ 目标域名可访问');
    } catch (dnsError) {
      console.log('❌ 目标域名无法访问:', dnsError.message);
    }
    
  } catch (error) {
    console.log('❌ 网络连接检查失败:', error.message);
  }
}

// 测试 4: 模拟插件内部的 API 调用
async function testPluginAPICall() {
  console.log('\n🔍 测试 4: 模拟插件内部 API 调用');
  
  try {
    // 模拟插件的 API 调用逻辑
    const response = await chrome.runtime.sendMessage({
      action: 'callAI',
      text: companyConfig.testText,
      apiType: 'company'
    });
    
    if (response && response.success) {
      console.log('✅ 插件内部 API 调用成功');
      console.log('结果:', response.data);
    } else {
      console.log('❌ 插件内部 API 调用失败');
      console.log('错误:', response.error);
    }
  } catch (error) {
    console.log('❌ 插件内部 API 调用异常:', error.message);
  }
}

// 运行所有测试
async function runAllAPITests() {
  console.log('🚀 开始运行所有 API 测试...\n');
  
  await checkNetworkConnection();
  await testDirectAPI();
  await testPluginAPICall();
  
  console.log('\n=== API 测试完成 ===');
  console.log('请查看上述结果，找出问题所在');
}

// 显示使用说明
console.log('使用方法:');
console.log('1. 运行 testDirectAPI() 测试直接 API 调用');
console.log('2. 运行 testDifferentEndpoints() 测试不同端点');
console.log('3. 运行 checkNetworkConnection() 检查网络连接');
console.log('4. 运行 testPluginAPICall() 测试插件内部调用');
console.log('5. 运行 runAllAPITests() 运行所有测试');

console.log('\n按 Enter 键开始运行所有测试...');

document.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    runAllAPITests();
  }
});

console.log('API 响应调试脚本加载完成，按 Enter 键开始测试');
