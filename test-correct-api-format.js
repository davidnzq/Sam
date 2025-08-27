// 测试正确的API格式

console.log('🔍 测试正确的API调用格式...\n');

const config = {
    apiKey: 'sk-7jSHih7SXoQcjMekQyTd3urc2G2BdtVzrzzdI6MotEpfWhyM',
    baseUrl: 'https://lboneapi.longbridge-inc.com/',
    endpoint: 'v1/chat/completions',
    testText: '投资有风险，请谨慎决策。'
};

// 可能的模型名称
const possibleModels = [
    'gpt-3.5-turbo',
    'gpt-4',
    'gpt-4-turbo',
    'text-davinci-003',
    'claude-2',
    'claude-instant',
    'default',
    'longport-ai',
    'lbone-ai',
    'ai-model',
    'optimization-model',
    'text-optimization',
    ''  // 空模型名
];

// 测试单个模型
async function testModel(model) {
    const fullUrl = config.baseUrl + config.endpoint;
    console.log(`\n📍 测试模型: "${model}"`);
    
    try {
        const requestBody = {
            model: model,
            messages: [
                {
                    role: 'system',
                    content: '你是一个专业的文案优化助手。请优化用户提供的文本，使其更加专业、准确、清晰。保持原文的核心含义不变。'
                },
                {
                    role: 'user',
                    content: `请优化以下文本：${config.testText}`
                }
            ],
            temperature: 0.7,
            max_tokens: 1000
        };
        
        console.log('  发送请求...');
        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`,
                'Accept': 'application/json',
                'User-Agent': 'LongPort-AI-Assistant/1.3.1'
            },
            body: JSON.stringify(requestBody),
            signal: AbortSignal.timeout(15000) // 15秒超时
        });
        
        console.log(`  响应状态: ${response.status} ${response.statusText}`);
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            
            if (response.ok) {
                console.log('  ✅ 成功响应！');
                console.log('  响应数据:', JSON.stringify(data, null, 2));
                
                // 检查是否有有效的返回内容
                if (data.choices && data.choices[0] && data.choices[0].message) {
                    console.log('  🎯 找到优化结果:', data.choices[0].message.content);
                    return {
                        success: true,
                        model: model,
                        result: data.choices[0].message.content
                    };
                }
            } else {
                console.log('  ❌ 错误响应:', JSON.stringify(data, null, 2));
                
                // 分析错误原因
                if (data.error && data.error.message) {
                    if (data.error.message.includes('无可用渠道')) {
                        console.log('  ⚠️ 模型不可用或名称错误');
                    } else if (data.error.message.includes('API密钥')) {
                        console.log('  ⚠️ API密钥问题');
                    } else {
                        console.log('  ⚠️ 其他错误:', data.error.message);
                    }
                }
            }
        } else {
            console.log('  ❌ 非JSON响应');
            const text = await response.text();
            console.log('  响应内容:', text.substring(0, 200));
        }
        
    } catch (error) {
        console.log(`  ❌ 请求失败: ${error.message}`);
        if (error.name === 'AbortError') {
            console.log('  ⏰ 请求超时');
        }
    }
    
    return null;
}

// 测试备选请求格式
async function testAlternativeFormats() {
    console.log('\n\n📋 测试备选请求格式...');
    
    const alternativeEndpoints = [
        {
            name: 'OpenAI Completions格式',
            endpoint: 'v1/completions',
            requestBody: {
                model: 'text-davinci-003',
                prompt: `请优化以下文本，使其更加专业、准确、清晰：${config.testText}`,
                max_tokens: 1000,
                temperature: 0.7
            }
        },
        {
            name: '自定义优化接口',
            endpoint: 'v1/text/optimize',
            requestBody: {
                text: config.testText,
                mode: 'professional',
                language: 'zh-CN'
            }
        },
        {
            name: '简单文本接口',
            endpoint: 'v1/text',
            requestBody: {
                input: config.testText,
                action: 'optimize'
            }
        }
    ];
    
    for (const alt of alternativeEndpoints) {
        console.log(`\n📍 测试: ${alt.name}`);
        console.log(`  端点: ${config.baseUrl}${alt.endpoint}`);
        
        try {
            const response = await fetch(config.baseUrl + alt.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.apiKey}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(alt.requestBody),
                signal: AbortSignal.timeout(10000)
            });
            
            console.log(`  响应状态: ${response.status} ${response.statusText}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log('  响应:', JSON.stringify(data, null, 2));
            } else {
                const error = await response.text();
                console.log('  错误:', error.substring(0, 200));
            }
            
        } catch (error) {
            console.log(`  ❌ 请求失败: ${error.message}`);
        }
    }
}

// 主函数
async function main() {
    console.log('配置信息:');
    console.log('- API地址:', config.baseUrl + config.endpoint);
    console.log('- API密钥:', config.apiKey.substring(0, 20) + '...');
    console.log('- 测试文本:', config.testText);
    
    const successfulModels = [];
    
    // 测试所有可能的模型名称
    console.log('\n🔍 测试不同的模型名称...');
    for (const model of possibleModels) {
        const result = await testModel(model);
        if (result) {
            successfulModels.push(result);
        }
        
        // 避免请求过快
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // 测试备选格式
    await testAlternativeFormats();
    
    // 汇总结果
    console.log('\n\n========== 测试结果汇总 ==========');
    
    if (successfulModels.length > 0) {
        console.log('\n✅ 找到可用的模型:');
        successfulModels.forEach((result, index) => {
            console.log(`\n${index + 1}. 模型名称: "${result.model}"`);
            console.log('   优化结果:', result.result);
        });
        
        console.log('\n🎯 建议使用的配置:');
        console.log('   端点:', config.baseUrl + config.endpoint);
        console.log('   模型:', successfulModels[0].model);
        console.log('   请求格式: OpenAI Chat Completions');
    } else {
        console.log('\n❌ 未找到可用的模型');
        console.log('\n可能的原因:');
        console.log('1. API服务需要特定的模型名称，但我们未找到');
        console.log('2. API密钥可能没有访问某些模型的权限');
        console.log('3. API服务可能暂时不可用');
        console.log('4. 可能需要使用完全不同的API格式');
        
        console.log('\n建议:');
        console.log('1. 联系API提供方获取正确的模型名称和调用格式');
        console.log('2. 查看API文档了解支持的模型列表');
        console.log('3. 确认API密钥的权限和配额');
    }
}

// 运行测试
console.log('⏰ 开始测试...\n');
main().then(() => {
    console.log('\n✅ 测试完成！');
}).catch(error => {
    console.error('\n❌ 测试过程中出错:', error);
});
