// 测试公司 AI API 连接
console.log('=== 测试公司 AI API 连接 ===');

const companyConfig = {
  apiKey: 'sk-7jSHih7SXoQcjMekQyTd3urc2G2BdtVzrzzdI6MotEpfWhyM',
  apiUrl: 'https://lboneapi.longbridge-inc.com/',
  testText: '这是一个测试文本，用于验证公司 AI API 的连接和功能。'
};

async function testCompanyAPI() {
  console.log('开始测试公司 AI API...');
  console.log('API 地址:', companyConfig.apiUrl);
  console.log('测试文本:', companyConfig.testText);
  
  try {
    // 测试 API 连接
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

    console.log('响应状态:', response.status, response.statusText);
    console.log('响应头:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // 尝试解析响应
    const contentType = response.headers.get('content-type');
    console.log('响应内容类型:', contentType);

    if (contentType && contentType.includes('application/json')) {
      const result = await response.json();
      console.log('✅ API 调用成功！');
      console.log('响应数据:', result);
      
      // 检查响应格式
      if (result.optimized_text || result.text) {
        console.log('✅ 响应格式正确');
        console.log('优化后的文本:', result.optimized_text || result.text);
      } else {
        console.log('⚠️ 响应格式不符合预期，但 API 连接成功');
        console.log('建议检查响应格式是否包含 optimized_text 或 text 字段');
      }
    } else {
      const text = await response.text();
      console.log('⚠️ API 返回非 JSON 响应');
      console.log('响应内容:', text.substring(0, 500));
      console.log('建议检查 API 是否返回正确的 JSON 格式');
    }

  } catch (error) {
    console.error('❌ API 测试失败:', error.message);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.log('可能的原因: 网络连接问题或 CORS 限制');
    } else if (error.message.includes('HTTP')) {
      console.log('可能的原因: API 地址错误或认证失败');
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

// 测试不同的请求格式
async function testDifferentFormats() {
  console.log('\n=== 测试不同的请求格式 ===');
  
  const formats = [
    {
      name: '标准格式',
      body: {
        text: companyConfig.testText,
        task: 'grammar_check_and_optimize'
      }
    },
    {
      name: '简化格式',
      body: {
        text: companyConfig.testText
      }
    },
    {
      name: '自定义格式',
      body: {
        content: companyConfig.testText,
        type: 'optimization'
      }
    }
  ];

  for (const format of formats) {
    console.log(`\n测试格式: ${format.name}`);
    console.log('请求体:', format.body);
    
    try {
      const response = await fetch(companyConfig.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${companyConfig.apiKey}`
        },
        body: JSON.stringify(format.body)
      });

      console.log(`状态: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const result = await response.text();
        console.log('✅ 格式可用！');
        console.log('响应预览:', result.substring(0, 200));
        break;
      }
    } catch (error) {
      console.log(`❌ 格式不可用: ${error.message}`);
    }
  }
}

// 运行测试
console.log('准备测试公司 AI API...');
console.log('配置信息:');
console.log('- API 地址:', companyConfig.apiUrl);
console.log('- API 密钥:', companyConfig.apiKey.substring(0, 10) + '...');
console.log('- 测试文本:', companyConfig.testText);

console.log('\n按 Enter 键开始测试...');

document.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    testCompanyAPI();
    setTimeout(() => testDifferentEndpoints(), 2000);
    setTimeout(() => testDifferentFormats(), 4000);
  }
});

console.log('测试脚本加载完成，按 Enter 键开始测试');
