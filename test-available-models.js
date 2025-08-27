// 获取并测试可用的模型

console.log('🔍 获取可用模型列表...\n');

const config = {
    apiKey: 'sk-7jSHih7SXoQcjMekQyTd3urc2G2BdtVzrzzdI6MotEpfWhyM',
    baseUrl: 'https://lboneapi.longbridge-inc.com',
    testText: '投资有风险，请谨慎决策。'
};

// 获取模型列表
async function getAvailableModels() {
    const url = config.baseUrl + '/v1/models';
    console.log('📋 获取模型列表:', url);
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ 成功获取模型列表！\n');
            
            if (data.data && Array.isArray(data.data)) {
                console.log(`找到 ${data.data.length} 个可用模型:\n`);
                
                const models = [];
                data.data.forEach((model, index) => {
                    console.log(`${index + 1}. 模型ID: ${model.id}`);
                    console.log(`   所有者: ${model.owned_by}`);
                    console.log(`   支持的端点类型: ${model.supported_endpoint_types?.join(', ') || 'unknown'}`);
                    console.log('');
                    models.push(model.id);
                });
                
                return models;
            }
        } else {
            console.error('❌ 获取模型列表失败:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('❌ 请求失败:', error.message);
    }
    
    return [];
}

// 测试单个模型
async function testModel(modelId) {
    console.log(`\n📍 测试模型: ${modelId}`);
    
    // 测试 OpenAI 格式
    console.log('  1️⃣ 使用 OpenAI Chat 格式...');
    const openAIBody = {
        model: modelId,
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
        max_tokens: 2000
    };
    
    try {
        const response = await fetch(config.baseUrl + '/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify(openAIBody),
            signal: AbortSignal.timeout(30000) // 30秒超时
        });
        
        console.log(`  响应状态: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('  ✅ 成功！');
            
            if (data.choices && data.choices[0] && data.choices[0].message) {
                const optimizedText = data.choices[0].message.content;
                console.log('  📝 优化结果:', optimizedText.substring(0, 200) + '...');
                return {
                    model: modelId,
                    success: true,
                    result: optimizedText
                };
            }
        } else {
            const error = await response.json();
            console.log('  ❌ 错误:', error.error?.message || JSON.stringify(error));
        }
    } catch (error) {
        console.log('  ❌ 请求失败:', error.message);
    }
    
    // 如果OpenAI格式失败，尝试Anthropic格式
    if (modelId.includes('claude')) {
        console.log('  2️⃣ 使用 Anthropic 格式...');
        const anthropicBody = {
            model: modelId,
            messages: [
                {
                    role: 'user',
                    content: `请优化以下文本，使其更加专业、准确、清晰。保持原文的核心含义不变：\n\n${config.testText}`
                }
            ],
            max_tokens: 2000
        };
        
        try {
            const response = await fetch(config.baseUrl + '/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.apiKey}`,
                    'Accept': 'application/json',
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify(anthropicBody),
                signal: AbortSignal.timeout(30000)
            });
            
            console.log(`  响应状态: ${response.status} ${response.statusText}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log('  ✅ 成功！');
                console.log('  响应数据:', JSON.stringify(data, null, 2).substring(0, 500));
            } else {
                const error = await response.text();
                console.log('  ❌ 错误:', error.substring(0, 200));
            }
        } catch (error) {
            console.log('  ❌ 请求失败:', error.message);
        }
    }
    
    return null;
}

// 主函数
async function main() {
    // 获取模型列表
    const models = await getAvailableModels();
    
    if (models.length === 0) {
        console.log('❌ 未找到可用模型');
        return;
    }
    
    // 测试每个模型
    console.log('\n========== 开始测试模型 ==========');
    const successfulModels = [];
    
    for (const model of models) {
        const result = await testModel(model);
        if (result && result.success) {
            successfulModels.push(result);
        }
        
        // 避免请求过快
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // 汇总结果
    console.log('\n\n========== 测试结果汇总 ==========');
    if (successfulModels.length > 0) {
        console.log(`\n✅ 找到 ${successfulModels.length} 个可用模型:`);
        successfulModels.forEach((result, index) => {
            console.log(`\n${index + 1}. ${result.model}`);
            console.log('   优化结果:', result.result.substring(0, 150) + '...');
        });
        
        console.log('\n🎯 推荐使用:', successfulModels[0].model);
    } else {
        console.log('\n❌ 所有模型测试失败');
    }
}

// 运行测试
console.log('⏰ 开始测试...\n');
main().then(() => {
    console.log('\n✅ 测试完成！');
}).catch(error => {
    console.error('\n❌ 测试过程中出错:', error);
});
