// 根据公司API文档测试API

console.log('🔍 根据公司文档测试API...\n');

const config = {
    apiKey: 'sk-7jSHih7SXoQcjMekQyTd3urc2G2BdtVzrzzdI6MotEpfWhyM',
    baseUrl: 'https://lboneapi.longbridge-inc.com',
    testText: '投资有风险，请谨慎决策。'
};

console.log('📋 API配置:');
console.log('- Base URL:', config.baseUrl);
console.log('- API Key:', config.apiKey.substring(0, 20) + '...');
console.log('- 测试文本:', config.testText);
console.log('\n');

// 测试不同的可能配置
async function testAPIVariations() {
    // 1. 测试根路径
    console.log('1️⃣ 测试根路径调用...');
    await testRequest('', {
        text: config.testText,
        optimization_type: 'professional'
    });
    
    // 2. 测试可能的端点（不带v1前缀）
    const endpointsWithoutV1 = [
        '/chat/completions',
        '/completions',
        '/optimize',
        '/text/optimize',
        '/api/optimize'
    ];
    
    for (const endpoint of endpointsWithoutV1) {
        console.log(`\n2️⃣ 测试端点: ${endpoint}`);
        
        // 测试简单格式
        await testRequest(endpoint, {
            text: config.testText
        });
        
        // 测试详细格式
        await testRequest(endpoint, {
            text: config.testText,
            optimization_type: 'professional',
            language: 'zh-CN'
        });
    }
    
    // 3. 测试不同的认证方式
    console.log('\n3️⃣ 测试不同的认证header...');
    
    // 测试 X-API-Key
    await testRequestWithCustomAuth('', {
        text: config.testText
    }, {
        'X-API-Key': config.apiKey
    });
    
    // 测试 apikey
    await testRequestWithCustomAuth('', {
        text: config.testText
    }, {
        'apikey': config.apiKey
    });
    
    // 测试 api-key
    await testRequestWithCustomAuth('', {
        text: config.testText
    }, {
        'api-key': config.apiKey
    });
    
    // 4. 测试GET请求
    console.log('\n4️⃣ 测试GET请求获取API信息...');
    await testGetRequest('/');
    await testGetRequest('/v1');
    await testGetRequest('/api');
    await testGetRequest('/models');
    await testGetRequest('/v1/models');
}

// 通用测试请求函数
async function testRequest(endpoint, body) {
    const url = config.baseUrl + endpoint;
    console.log(`  📍 URL: ${url}`);
    console.log(`  📤 请求体:`, JSON.stringify(body, null, 2));
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(10000)
        });
        
        console.log(`  📥 响应状态: ${response.status} ${response.statusText}`);
        
        const contentType = response.headers.get('content-type');
        console.log(`  📄 内容类型: ${contentType}`);
        
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            console.log(`  📊 响应数据:`, JSON.stringify(data, null, 2).substring(0, 500) + '...');
            
            // 检查是否有优化结果
            if (response.ok) {
                console.log('  ✅ 请求成功！');
                analyzeResponse(data);
            }
        } else {
            const text = await response.text();
            console.log(`  📝 文本响应:`, text.substring(0, 200) + '...');
        }
        
    } catch (error) {
        console.log(`  ❌ 请求失败: ${error.message}`);
    }
}

// 使用自定义认证header的测试
async function testRequestWithCustomAuth(endpoint, body, customHeaders) {
    const url = config.baseUrl + endpoint;
    console.log(`  📍 URL: ${url}`);
    console.log(`  🔑 认证方式:`, Object.keys(customHeaders));
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...customHeaders
            },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(10000)
        });
        
        console.log(`  📥 响应状态: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('  ✅ 认证成功！');
            console.log(`  📊 响应:`, JSON.stringify(data, null, 2).substring(0, 300) + '...');
        }
        
    } catch (error) {
        console.log(`  ❌ 请求失败: ${error.message}`);
    }
}

// GET请求测试
async function testGetRequest(endpoint) {
    const url = config.baseUrl + endpoint;
    console.log(`  📍 GET ${url}`);
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Accept': 'application/json'
            },
            signal: AbortSignal.timeout(5000)
        });
        
        console.log(`  📥 响应状态: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                console.log(`  📊 响应:`, JSON.stringify(data, null, 2).substring(0, 300) + '...');
            }
        }
        
    } catch (error) {
        console.log(`  ❌ 请求失败: ${error.message}`);
    }
}

// 分析响应数据
function analyzeResponse(data) {
    console.log('  🔍 分析响应结构...');
    
    // 检查各种可能的字段
    const fields = ['text', 'result', 'optimized_text', 'output', 'response', 'content', 'message', 'data'];
    
    for (const field of fields) {
        if (data[field]) {
            console.log(`    ✅ 找到字段 "${field}":`, 
                typeof data[field] === 'string' 
                    ? data[field].substring(0, 100) + '...' 
                    : typeof data[field]
            );
        }
    }
    
    // 检查嵌套结构
    if (data.choices && Array.isArray(data.choices)) {
        console.log('    ✅ 找到OpenAI格式的choices数组');
    }
    
    if (data.error) {
        console.log('    ⚠️ 包含错误信息:', data.error);
    }
}

// 运行测试
console.log('⏰ 开始全面测试...\n');
testAPIVariations().then(() => {
    console.log('\n✅ 测试完成！');
}).catch(error => {
    console.error('\n❌ 测试过程中出错:', error);
});
