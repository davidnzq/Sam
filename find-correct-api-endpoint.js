// 寻找正确的API端点

console.log('🔍 开始寻找正确的公司AI API端点...\n');

const config = {
    apiKey: 'sk-7jSHih7SXoQcjMekQyTd3urc2G2BdtVzrzzdI6MotEpfWhyM',
    baseUrl: 'https://lboneapi.longbridge-inc.com/',
    testText: '投资有风险，请谨慎决策。'
};

// 可能的API端点组合
const possibleEndpoints = [
    // 最常见的格式
    'api/v1/text/optimize',
    'api/v1/optimize',
    'api/v1/chat/completions',
    'api/v1/completions',
    'api/v1/text-optimization',
    'api/v1/text-optimize',
    
    // v2版本
    'api/v2/text/optimize',
    'api/v2/optimize',
    'api/v2/chat/completions',
    
    // 无版本号
    'api/text/optimize',
    'api/optimize',
    'api/text-optimization',
    'api/chat/completions',
    'api/completions',
    
    // 简单格式
    'v1/optimize',
    'v1/text/optimize',
    'v1/chat/completions',
    
    // 直接路径
    'optimize',
    'text/optimize',
    'text-optimization',
    'chat/completions',
    'completions',
    
    // AI相关
    'ai/optimize',
    'ai/text/optimize',
    'ai/v1/optimize',
    
    // GPT风格
    'gpt/optimize',
    'gpt/completions',
    'gpt/chat',
    
    // 其他可能
    'text',
    'api',
    ''  // 根路径
];

// 测试单个端点
async function testEndpoint(endpoint) {
    const fullUrl = config.baseUrl + endpoint;
    console.log(`\n📍 测试端点: ${fullUrl}`);
    
    try {
        // 构建请求体 - 尝试多种格式
        const requestBodies = [
            // 格式1：标准优化格式
            {
                text: config.testText,
                optimization_type: 'professional_optimization',
                language: 'zh-CN'
            },
            // 格式2：GPT风格
            {
                model: 'gpt-3.5-turbo',
                messages: [{
                    role: 'user',
                    content: `请优化以下文本：${config.testText}`
                }]
            },
            // 格式3：简单格式
            {
                text: config.testText,
                task: 'optimize'
            },
            // 格式4：更简单的格式
            {
                text: config.testText
            },
            // 格式5：原始格式
            {
                prompt: config.testText,
                max_tokens: 1000
            }
        ];
        
        for (let i = 0; i < requestBodies.length; i++) {
            console.log(`  尝试请求格式 ${i + 1}/${requestBodies.length}...`);
            
            const response = await fetch(fullUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.apiKey}`,
                    'Accept': 'application/json',
                    'User-Agent': 'LongPort-AI-Assistant/1.3.1'
                },
                body: JSON.stringify(requestBodies[i]),
                signal: AbortSignal.timeout(10000) // 10秒超时
            });
            
            console.log(`  响应状态: ${response.status} ${response.statusText}`);
            
            if (response.ok) {
                console.log('  ✅ 成功响应！');
                
                const contentType = response.headers.get('content-type');
                console.log(`  内容类型: ${contentType}`);
                
                try {
                    if (contentType && contentType.includes('application/json')) {
                        const data = await response.json();
                        console.log('  响应数据:', JSON.stringify(data, null, 2));
                        
                        // 检查是否有有效的返回内容
                        const possibleFields = ['optimized_text', 'text', 'content', 'response', 'result', 'message', 'choices', 'data'];
                        for (const field of possibleFields) {
                            if (data[field]) {
                                console.log(`  🎯 找到有效字段: ${field}`);
                                if (field === 'choices' && Array.isArray(data[field]) && data[field][0]) {
                                    console.log('  🎯 GPT格式响应，内容:', data[field][0]);
                                }
                                break;
                            }
                        }
                        
                        return {
                            success: true,
                            endpoint: fullUrl,
                            requestFormat: i + 1,
                            requestBody: requestBodies[i],
                            response: data
                        };
                    } else {
                        const text = await response.text();
                        console.log('  文本响应:', text.substring(0, 200) + '...');
                        
                        if (text && text.length > 10) {
                            return {
                                success: true,
                                endpoint: fullUrl,
                                requestFormat: i + 1,
                                requestBody: requestBodies[i],
                                response: text
                            };
                        }
                    }
                } catch (parseError) {
                    console.log('  ⚠️ 解析响应失败:', parseError.message);
                }
            } else if (response.status === 404) {
                console.log('  ❌ 端点不存在');
                break; // 如果是404，不用尝试其他请求格式
            } else if (response.status === 401) {
                console.log('  ❌ 认证失败 - API密钥可能无效');
                break;
            } else if (response.status === 400) {
                console.log('  ⚠️ 请求格式错误，尝试下一个格式...');
                // 继续尝试其他格式
            } else {
                console.log(`  ❌ 其他错误: ${response.status}`);
                try {
                    const errorText = await response.text();
                    console.log('  错误详情:', errorText.substring(0, 200));
                } catch (e) {
                    // 忽略错误读取失败
                }
            }
        }
        
    } catch (error) {
        console.log(`  ❌ 请求失败: ${error.message}`);
        if (error.name === 'AbortError') {
            console.log('  ⏰ 请求超时');
        }
    }
    
    return null;
}

// 主函数
async function findCorrectEndpoint() {
    console.log('配置信息:');
    console.log('- 基础URL:', config.baseUrl);
    console.log('- API密钥:', config.apiKey.substring(0, 20) + '...');
    console.log('- 测试文本:', config.testText);
    
    const successfulEndpoints = [];
    
    // 测试所有可能的端点
    for (const endpoint of possibleEndpoints) {
        const result = await testEndpoint(endpoint);
        if (result) {
            successfulEndpoints.push(result);
        }
        
        // 避免请求过快
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // 汇总结果
    console.log('\n\n========== 测试结果汇总 ==========');
    console.log(`测试端点总数: ${possibleEndpoints.length}`);
    console.log(`成功端点数: ${successfulEndpoints.length}`);
    
    if (successfulEndpoints.length > 0) {
        console.log('\n✅ 找到有效的API端点:');
        successfulEndpoints.forEach((result, index) => {
            console.log(`\n${index + 1}. ${result.endpoint}`);
            console.log('   请求格式:', JSON.stringify(result.requestBody, null, 2));
            console.log('   响应预览:', typeof result.response === 'string' 
                ? result.response.substring(0, 100) + '...' 
                : JSON.stringify(result.response, null, 2).substring(0, 200) + '...');
        });
        
        console.log('\n🎯 建议使用第一个成功的端点:', successfulEndpoints[0].endpoint);
        console.log('📝 建议的请求格式:', JSON.stringify(successfulEndpoints[0].requestBody, null, 2));
    } else {
        console.log('\n❌ 未找到有效的API端点');
        console.log('\n可能的原因:');
        console.log('1. API密钥无效或已过期');
        console.log('2. API服务暂时不可用');
        console.log('3. 需要特殊的请求头或参数');
        console.log('4. API端点已更改');
        console.log('\n建议:');
        console.log('1. 联系API提供方确认正确的端点URL');
        console.log('2. 检查API密钥是否有效');
        console.log('3. 查看API文档了解正确的请求格式');
    }
}

// 运行测试
console.log('⏰ 开始测试，预计需要几分钟时间...\n');
findCorrectEndpoint().then(() => {
    console.log('\n✅ 测试完成！');
}).catch(error => {
    console.error('\n❌ 测试过程中出错:', error);
});
