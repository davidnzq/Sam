// API 调试脚本 - 诊断 API 调用问题
console.log('=== Notion AI 助手 API 调试脚本 ===');

// 公司 AI API 配置
const companyConfig = {
  apiKey: 'sk-7jSHih7SXoQcjMekQyTd3urc2G2BdtVzrzzdI6MotEpfWhyM',
  apiUrl: 'https://lboneapi.longbridge-inc.com/',
  testText: '这是一个测试文本，用于验证 API 连接。'
};

// 测试 API 连接
async function testAPIConnection() {
  console.log('开始测试 API 连接...');
  console.log('API 地址:', companyConfig.apiUrl);
  console.log('API 密钥:', companyConfig.apiKey.substring(0, 10) + '...');
  
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
    console.log('- 响应头:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      console.log('✅ HTTP 请求成功');
      
      // 尝试解析响应
      const contentType = response.headers.get('content-type');
      console.log('响应内容类型:', contentType);
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const result = await response.json();
          console.log('✅ JSON 解析成功');
          console.log('响应数据:', result);
          
          if (result.optimized_text || result.text) {
            console.log('✅ 响应格式正确');
            console.log('优化后的文本:', result.optimized_text || result.text);
          } else {
            console.log('⚠️ 响应格式不符合预期');
            console.log('建议检查 API 响应是否包含 optimized_text 或 text 字段');
          }
        } catch (jsonError) {
          console.error('❌ JSON 解析失败:', jsonError);
        }
      } else {
        const text = await response.text();
        console.log('⚠️ 响应不是 JSON 格式');
        console.log('响应内容预览:', text.substring(0, 500));
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

// 测试不同的 API 端点
async function testDifferentEndpoints() {
  console.log('\n=== 测试不同的 API 端点 ===');
  
  const endpoints = [
    '',
    'api',
    'v1',
    'v1/ai',
    'ai',
    'text',
    'optimize'
  ];

  for (const endpoint of endpoints) {
    const testUrl = companyConfig.apiUrl + endpoint;
    console.log(`\n测试端点: ${testUrl}`);
    
    try {
      const response = await fetch(testUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${companyConfig.apiKey}`
        },
        body: JSON.stringify({
          text: '测试文本',
          task: 'test'
        })
      });

      console.log(`状态: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        console.log('✅ 端点可用！');
        break;
      }
    } catch (error) {
      console.log(`❌ 端点不可用: ${error.message}`);
    }
  }
}

// 测试插件内部 API 调用
async function testPluginAPI() {
  console.log('\n=== 测试插件内部 API 调用 ===');
  
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    try {
      console.log('发送消息到插件...');
      
      const response = await chrome.runtime.sendMessage({
        action: 'callAI',
        text: '测试文本',
        apiType: 'company'
      });
      
      console.log('插件响应:', response);
      
      if (response && response.success) {
        console.log('✅ 插件 API 调用成功');
        console.log('结果:', response.data);
      } else {
        console.log('❌ 插件 API 调用失败');
        console.log('错误:', response.error);
      }
    } catch (error) {
      console.error('❌ 插件 API 调用异常:', error);
    }
  } else {
    console.log('❌ Chrome runtime 不可用');
  }
}

// 检查网络连接
async function checkNetworkConnection() {
  console.log('\n=== 检查网络连接 ===');
  
  try {
    // 测试基本网络连接
    const response = await fetch('https://httpbin.org/get');
    if (response.ok) {
      console.log('✅ 基本网络连接正常');
    } else {
      console.log('⚠️ 基本网络连接异常');
    }
  } catch (error) {
    console.log('❌ 基本网络连接失败:', error.message);
  }
  
  try {
    // 测试目标域名解析
    const response = await fetch('https://lboneapi.longbridge-inc.com/', {
      method: 'HEAD'
    });
    console.log('✅ 目标域名可访问');
  } catch (error) {
    console.log('❌ 目标域名不可访问:', error.message);
  }
}

// 运行所有测试
async function runAllTests() {
  console.log('开始运行所有诊断测试...\n');
  
  await checkNetworkConnection();
  await testAPIConnection();
  await testDifferentEndpoints();
  await testPluginAPI();
  
  console.log('\n=== 诊断测试完成 ===');
  console.log('请查看上述结果，找出问题所在');
}

// 显示使用说明
console.log('使用方法:');
console.log('1. 在控制台中运行 testAPIConnection() 测试 API 连接');
console.log('2. 运行 testDifferentEndpoints() 测试不同端点');
console.log('3. 运行 testPluginAPI() 测试插件内部调用');
console.log('4. 运行 runAllTests() 运行所有测试');
console.log('5. 运行 checkNetworkConnection() 检查网络连接');

console.log('\n按 Enter 键开始运行所有测试...');

document.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    runAllTests();
  }
});

console.log('API 调试脚本加载完成，按 Enter 键开始测试');
