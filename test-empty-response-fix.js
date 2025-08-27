// 测试空响应修复的脚本

console.log('🧪 开始测试空响应修复...');

// 测试优化函数
function testOptimizationFunctions() {
    console.log('\n🔍 测试各个优化函数...\n');
    
    // 测试用例
    const testCases = [
        {
            name: 'LongPort - 普通文本',
            text: '这是一个测试文本',
            siteType: 'longport',
            expectedPattern: /测试文本/
        },
        {
            name: 'LongPort - 包含金融词汇',
            text: '投资有风险，收益不确定',
            siteType: 'longport',
            expectedPattern: /投资理财.*投资回报/
        },
        {
            name: 'Notion - 普通文本',
            text: '这是一个文档内容',
            siteType: 'notion',
            expectedPattern: /文档内容/
        },
        {
            name: 'Notion - 包含结构词',
            text: '首先要分析问题，其次要解决问题',
            siteType: 'notion',
            expectedPattern: /首先.*其次/
        },
        {
            name: '通用 - 普通文本',
            text: '这是通用文本内容',
            siteType: 'general',
            expectedPattern: /通用文本内容/
        },
        {
            name: '空文本测试',
            text: '',
            siteType: 'longport',
            expectedPattern: /请输入/
        },
        {
            name: '纯空格测试',
            text: '   ',
            siteType: 'notion',
            expectedPattern: /请输入/
        }
    ];
    
    // 模拟优化函数（需要与background.js中的函数保持一致）
    function performLongPortOptimization(text) {
        console.log('🏦 执行LongPort金融专业优化，输入文本:', text);
        
        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            console.warn('⚠️ 输入文本无效，返回默认优化文本');
            return '请输入需要优化的金融相关文案内容。';
        }
        
        let optimized = text.trim();
        console.log('📝 初始文本长度:', optimized.length);
        
        optimized = optimized.replace(/，/g, '， ').replace(/。/g, '。 ');
        optimized = optimized.replace(/：/g, '： ').replace(/；/g, '； ');
        optimized = optimized.replace(/投资/g, '投资理财').replace(/收益/g, '投资回报');
        optimized = optimized.replace(/风险/g, '投资风险').replace(/市场/g, '金融市场');
        
        if (optimized.length > 50) {
            optimized = optimized.replace(/。/g, '。\n');
        }
        
        if (!optimized.includes('专业') && !optimized.includes('权威')) {
            if (!optimized.endsWith('。') && !optimized.endsWith('！') && !optimized.endsWith('？')) {
                optimized += '。';
            }
            optimized += '\n\n注：以上内容基于专业金融分析，仅供参考。';
        }
        
        console.log('✅ LongPort优化完成，结果长度:', optimized.length);
        console.log('📊 优化结果预览:', optimized.substring(0, 100) + '...');
        
        if (!optimized || optimized.trim().length === 0) {
            console.warn('⚠️ 优化结果为空，返回原文');
            return text;
        }
        
        return optimized;
    }
    
    function performNotionOptimization(text) {
        console.log('📝 执行Notion文档协作优化，输入文本:', text);
        
        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            console.warn('⚠️ 输入文本无效，返回默认优化文本');
            return '请输入需要优化的文档内容。';
        }
        
        let optimized = text.trim();
        console.log('📝 初始文本长度:', optimized.length);
        
        optimized = optimized.replace(/，/g, '， ').replace(/。/g, '。 ');
        optimized = optimized.replace(/：/g, '： ').replace(/；/g, '； ');
        
        if (optimized.includes('首先') || optimized.includes('其次')) {
            optimized = optimized.replace(/。/g, '。\n');
        } else if (optimized.length > 80) {
            optimized = optimized.replace(/。/g, '。\n');
        }
        
        if (!optimized.includes('建议') && !optimized.includes('总结')) {
            if (!optimized.endsWith('。') && !optimized.endsWith('！') && !optimized.endsWith('？')) {
                optimized += '。';
            }
            optimized += '\n\n建议：请根据实际情况调整和完善以上内容。';
        }
        
        console.log('✅ Notion优化完成，结果长度:', optimized.length);
        console.log('📊 优化结果预览:', optimized.substring(0, 100) + '...');
        
        if (!optimized || optimized.trim().length === 0) {
            console.warn('⚠️ 优化结果为空，返回原文');
            return text;
        }
        
        return optimized;
    }
    
    function performGeneralOptimization(text) {
        console.log('🔧 执行通用文本优化，输入文本:', text);
        
        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            console.warn('⚠️ 输入文本无效，返回默认优化文本');
            return '请输入需要优化的文本内容。';
        }
        
        let optimized = text.trim();
        console.log('📝 初始文本长度:', optimized.length);
        
        optimized = optimized.replace(/，/g, '， ').replace(/。/g, '。 ');
        optimized = optimized.replace(/：/g, '： ').replace(/；/g, '； ');
        optimized = optimized.split('\n').map(line => line.replace(/\s+/g, ' ').trim()).join('\n');
        
        if (optimized.length > 20 && !optimized.includes('\n')) {
            optimized = optimized.replace(/。/g, '。\n');
        }
        
        if (!optimized.includes('优化') && !optimized.includes('改进')) {
            if (!optimized.endsWith('。') && !optimized.endsWith('！') && !optimized.endsWith('？')) {
                optimized += '。';
            }
            optimized += '\n\n注：以上内容已进行语言优化，提升了表达清晰度。';
        }
        
        console.log('✅ 通用优化完成，结果长度:', optimized.length);
        console.log('📊 优化结果预览:', optimized.substring(0, 100) + '...');
        
        if (!optimized || optimized.trim().length === 0) {
            console.warn('⚠️ 优化结果为空，返回原文');
            return text;
        }
        
        return optimized;
    }
    
    // 运行测试
    let passedTests = 0;
    let failedTests = 0;
    
    testCases.forEach((testCase, index) => {
        console.log(`\n--- 测试 ${index + 1}: ${testCase.name} ---`);
        console.log('输入文本:', testCase.text || '(空)');
        console.log('场景类型:', testCase.siteType);
        
        let result;
        try {
            switch (testCase.siteType) {
                case 'longport':
                    result = performLongPortOptimization(testCase.text);
                    break;
                case 'notion':
                    result = performNotionOptimization(testCase.text);
                    break;
                default:
                    result = performGeneralOptimization(testCase.text);
            }
            
            console.log('优化结果:', result);
            console.log('结果长度:', result.length);
            
            // 验证结果
            const isValid = result && result.length > 0 && testCase.expectedPattern.test(result);
            
            if (isValid) {
                console.log('✅ 测试通过');
                passedTests++;
            } else {
                console.log('❌ 测试失败 - 结果不符合预期');
                failedTests++;
            }
            
        } catch (error) {
            console.error('❌ 测试失败 - 发生错误:', error);
            failedTests++;
        }
    });
    
    // 汇总结果
    console.log('\n========== 测试汇总 ==========');
    console.log(`总测试数: ${testCases.length}`);
    console.log(`通过: ${passedTests}`);
    console.log(`失败: ${failedTests}`);
    console.log(`成功率: ${(passedTests / testCases.length * 100).toFixed(1)}%`);
    
    if (failedTests === 0) {
        console.log('\n🎉 所有测试通过！空响应问题已修复！');
    } else {
        console.log('\n⚠️ 存在失败的测试，请检查代码');
    }
}

// 运行测试
testOptimizationFunctions();
