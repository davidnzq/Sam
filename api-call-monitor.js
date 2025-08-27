// API调用监控工具
// 用于监控和记录API调用过程，帮助诊断问题

// 配置
const config = {
    apiKey: 'sk-7jSHih7SXoQcjMekQyTd3urc2G2BdtVzrzzdI6MotEpfWhyM',
    baseUrl: 'https://lboneapi.longbridge-inc.com/',
    // 可用模型列表（按优先级排序）
    availableModels: ['gpt-4o-mini', 'gpt-4o', 'gpt-5-chat', 'DeepSeek-R1', 'o3-mini', 'o3'],
    // 测试文本
    testTexts: {
        longport: '投资有风险，请谨慎决策。在进行任何投资前，请充分了解相关产品的特性和风险。市场波动可能影响投资收益，建议根据自身风险承受能力合理配置资产。',
        notion: '项目计划需要进一步完善，包括时间安排、资源分配和风险评估。团队成员需要明确各自的职责分工，确保项目按时完成。建议定期召开会议讨论进展。',
        general: '这段文字包含一些可以优化的地方，比如表达可以更加清晰，用词可以更加准确。通过优化可以提升文本的可读性和专业性。'
    },
    // 端点列表
    endpoints: [
        'v1/chat/completions',
        'v1/completions',
        'api/v1/chat/completions',
        'api/chat/completions'
    ],
    // 超时设置（毫秒）
    timeout: 30000
};

// 日志记录
const logger = {
    logs: [],
    
    info: function(message) {
        const log = `[INFO] [${new Date().toISOString()}] ${message}`;
        console.log(log);
        this.logs.push(log);
    },
    
    warn: function(message) {
        const log = `[WARN] [${new Date().toISOString()}] ${message}`;
        console.warn(log);
        this.logs.push(log);
    },
    
    error: function(message) {
        const log = `[ERROR] [${new Date().toISOString()}] ${message}`;
        console.error(log);
        this.logs.push(log);
    },
    
    debug: function(message) {
        const log = `[DEBUG] [${new Date().toISOString()}] ${message}`;
        console.debug(log);
        this.logs.push(log);
    },
    
    getReport: function() {
        return this.logs.join('\n');
    },
    
    clear: function() {
        this.logs = [];
    }
};

// API调用监控
class ApiCallMonitor {
    constructor(config, logger) {
        this.config = config;
        this.logger = logger;
        this.results = {
            successful: [],
            failed: []
        };
    }
    
    // 测试所有场景
    async testAllScenarios() {
        this.logger.info('开始测试所有场景...');
        
        for (const [siteType, text] of Object.entries(this.config.testTexts)) {
            await this.testScenario(siteType, text);
        }
        
        this.logger.info('所有场景测试完成');
        return this.generateReport();
    }
    
    // 测试单个场景
    async testScenario(siteType, text) {
        this.logger.info(`开始测试场景: ${siteType}`);
        this.logger.info(`测试文本: ${text.substring(0, 50)}...`);
        
        // 测试模拟API
        await this.testMockApi(siteType, text);
        
        // 测试真实API
        await this.testRealApi(siteType, text);
        
        this.logger.info(`场景测试完成: ${siteType}`);
    }
    
    // 测试模拟API
    async testMockApi(siteType, text) {
        this.logger.info(`测试模拟API (${siteType})...`);
        
        try {
            const startTime = Date.now();
            
            // 模拟API调用
            let optimizedText = text;
            
            // 根据网站类型进行不同的优化
            if (siteType === 'longport') {
                optimizedText = this.performLongPortOptimization(text);
            } else if (siteType === 'notion') {
                optimizedText = this.performNotionOptimization(text);
            } else {
                optimizedText = this.performGeneralOptimization(text);
            }
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            // 验证结果
            const isValid = this.validateResult(text, optimizedText);
            
            if (isValid) {
                this.logger.info(`模拟API调用成功 (${duration}ms)`);
                this.results.successful.push({
                    type: 'mock',
                    siteType,
                    duration,
                    originalLength: text.length,
                    optimizedLength: optimizedText.length,
                    preview: optimizedText.substring(0, 100)
                });
            } else {
                this.logger.error(`模拟API调用失败: 结果无效`);
                this.results.failed.push({
                    type: 'mock',
                    siteType,
                    reason: '结果无效',
                    duration
                });
            }
        } catch (error) {
            this.logger.error(`模拟API调用异常: ${error.message}`);
            this.results.failed.push({
                type: 'mock',
                siteType,
                reason: error.message
            });
        }
    }
    
    // 测试真实API
    async testRealApi(siteType, text) {
        this.logger.info(`测试真实API (${siteType})...`);
        
        // 遍历所有模型
        for (const model of this.config.availableModels) {
            await this.testModel(model, siteType, text);
        }
    }
    
    // 测试单个模型
    async testModel(model, siteType, text) {
        this.logger.info(`测试模型: ${model}`);
        
        // 遍历所有端点
        for (const endpoint of this.config.endpoints) {
            await this.testEndpoint(endpoint, model, siteType, text);
        }
    }
    
    // 测试单个端点
    async testEndpoint(endpoint, model, siteType, text) {
        const fullEndpoint = `${this.config.baseUrl}${endpoint}`;
        this.logger.info(`测试端点: ${fullEndpoint}`);
        
        // 准备请求体
        let requestBody;
        
        if (endpoint.includes('chat/completions')) {
            // OpenAI Chat格式
            requestBody = {
                model: model,
                messages: [
                    {
                        role: 'system',
                        content: this.getSystemPrompt(siteType)
                    },
                    {
                        role: 'user',
                        content: `请优化以下文本：\n\n${text}`
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000
            };
            this.logger.debug('使用OpenAI Chat格式');
        } else if (endpoint.includes('completions')) {
            // OpenAI Completions格式
            requestBody = {
                model: model,
                prompt: `请优化以下文本，使其更加专业、准确、清晰：\n\n${text}`,
                max_tokens: 2000,
                temperature: 0.7
            };
            this.logger.debug('使用OpenAI Completions格式');
        } else {
            // 自定义格式
            requestBody = {
                text: text,
                site_type: siteType,
                optimization_type: 'professional_optimization',
                language: 'zh-CN',
                style: siteType === 'longport' ? 'professional_financial' : 'clear_logical'
            };
            this.logger.debug('使用自定义格式');
        }
        
        try {
            const startTime = Date.now();
            
            // 发送请求
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
            
            const response = await fetch(fullEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Accept': 'application/json',
                    'User-Agent': 'LongPort-AI-Assistant/1.3.1',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Cache-Control': 'no-cache'
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            this.logger.info(`响应状态: ${response.status} ${response.statusText}`);
            
            // 处理响应
            if (response.ok) {
                const contentType = response.headers.get('content-type');
                this.logger.debug(`响应内容类型: ${contentType}`);
                
                if (contentType && contentType.includes('application/json')) {
                    // JSON响应
                    const data = await response.json();
                    this.logger.debug(`JSON响应: ${JSON.stringify(data).substring(0, 200)}...`);
                    
                    // 提取优化文本
                    const optimizedText = this.extractOptimizedText(data);
                    
                    if (optimizedText) {
                        // 验证结果
                        const isValid = this.validateResult(text, optimizedText);
                        
                        if (isValid) {
                            this.logger.info(`API调用成功 (${duration}ms)`);
                            this.results.successful.push({
                                type: 'real',
                                model,
                                endpoint,
                                siteType,
                                duration,
                                originalLength: text.length,
                                optimizedLength: optimizedText.length,
                                preview: optimizedText.substring(0, 100)
                            });
                            
                            // 找到成功的调用，不再测试其他端点
                            return;
                        } else {
                            this.logger.error(`API调用失败: 结果无效`);
                            this.results.failed.push({
                                type: 'real',
                                model,
                                endpoint,
                                siteType,
                                reason: '结果无效',
                                duration
                            });
                        }
                    } else {
                        this.logger.error(`API调用失败: 无法提取优化文本`);
                        this.results.failed.push({
                            type: 'real',
                            model,
                            endpoint,
                            siteType,
                            reason: '无法提取优化文本',
                            duration
                        });
                    }
                } else {
                    // 非JSON响应
                    const textResponse = await response.text();
                    this.logger.debug(`文本响应: ${textResponse.substring(0, 200)}...`);
                    
                    // 检查是否为HTML
                    if (textResponse.includes('<!DOCTYPE html>') || textResponse.includes('<html>')) {
                        this.logger.error(`API调用失败: 返回HTML页面`);
                        this.results.failed.push({
                            type: 'real',
                            model,
                            endpoint,
                            siteType,
                            reason: '返回HTML页面',
                            duration
                        });
                    } else {
                        // 验证结果
                        const isValid = this.validateResult(text, textResponse);
                        
                        if (isValid) {
                            this.logger.info(`API调用成功 (${duration}ms)`);
                            this.results.successful.push({
                                type: 'real',
                                model,
                                endpoint,
                                siteType,
                                duration,
                                originalLength: text.length,
                                optimizedLength: textResponse.length,
                                preview: textResponse.substring(0, 100)
                            });
                            
                            // 找到成功的调用，不再测试其他端点
                            return;
                        } else {
                            this.logger.error(`API调用失败: 结果无效`);
                            this.results.failed.push({
                                type: 'real',
                                model,
                                endpoint,
                                siteType,
                                reason: '结果无效',
                                duration
                            });
                        }
                    }
                }
            } else {
                // 错误响应
                try {
                    const errorData = await response.json();
                    this.logger.error(`API调用失败: ${response.status} ${response.statusText}`);
                    this.logger.error(`错误详情: ${JSON.stringify(errorData)}`);
                    
                    this.results.failed.push({
                        type: 'real',
                        model,
                        endpoint,
                        siteType,
                        reason: `${response.status} ${response.statusText}: ${JSON.stringify(errorData)}`,
                        duration
                    });
                } catch (e) {
                    const errorText = await response.text();
                    this.logger.error(`API调用失败: ${response.status} ${response.statusText}`);
                    this.logger.error(`错误详情: ${errorText}`);
                    
                    this.results.failed.push({
                        type: 'real',
                        model,
                        endpoint,
                        siteType,
                        reason: `${response.status} ${response.statusText}: ${errorText}`,
                        duration
                    });
                }
            }
        } catch (error) {
            this.logger.error(`API调用异常: ${error.message}`);
            this.results.failed.push({
                type: 'real',
                model,
                endpoint,
                siteType,
                reason: error.message
            });
        }
    }
    
    // 提取优化文本
    extractOptimizedText(data) {
        // 检查OpenAI格式
        if (data.choices && Array.isArray(data.choices) && data.choices.length > 0) {
            const choice = data.choices[0];
            if (choice.message && choice.message.content) {
                return choice.message.content;
            } else if (choice.text) {
                return choice.text;
            }
        }
        
        // 检查其他可能的字段
        const possibleFields = ['optimized_text', 'text', 'content', 'response', 'result', 'message', 'data'];
        for (const field of possibleFields) {
            if (data[field] && typeof data[field] === 'string' && data[field].trim().length > 0) {
                return data[field];
            }
        }
        
        return null;
    }
    
    // 验证结果
    validateResult(originalText, optimizedText) {
        // 检查是否为空
        if (!optimizedText || optimizedText.trim().length === 0) {
            return false;
        }
        
        // 检查是否与原文相同
        if (optimizedText === originalText) {
            return false;
        }
        
        // 检查长度变化
        const originalLength = originalText.trim().length;
        const optimizedLength = optimizedText.trim().length;
        const lengthRatio = optimizedLength / originalLength;
        
        // 长度变化不应该太大
        if (lengthRatio < 0.5 || lengthRatio > 2) {
            return false;
        }
        
        return true;
    }
    
    // 获取系统提示词
    getSystemPrompt(siteType) {
        let systemPrompt = '你是一个专业的文案优化助手。请优化用户提供的文本，使其更加专业、准确、清晰。';
        
        if (siteType === 'longport') {
            systemPrompt += '这是金融投资相关的内容，请使用专业的金融术语，确保内容权威可信。';
        } else if (siteType === 'notion') {
            systemPrompt += '这是文档协作平台的内容，请优化文档结构和逻辑，提升可读性。';
        }
        
        systemPrompt += '要求：1.保持原文核心含义不变 2.修正语法错误 3.优化表达方式 4.文本长度与原文相近';
        
        return systemPrompt;
    }
    
    // 生成报告
    generateReport() {
        const report = {
            summary: {
                totalTests: this.results.successful.length + this.results.failed.length,
                successfulTests: this.results.successful.length,
                failedTests: this.results.failed.length,
                successRate: 0
            },
            successful: this.results.successful,
            failed: this.results.failed,
            logs: this.logger.getReport()
        };
        
        // 计算成功率
        if (report.summary.totalTests > 0) {
            report.summary.successRate = (report.summary.successfulTests / report.summary.totalTests * 100).toFixed(1) + '%';
        }
        
        // 分析结果
        report.analysis = this.analyzeResults();
        
        return report;
    }
    
    // 分析结果
    analyzeResults() {
        const analysis = {
            bestModel: null,
            bestEndpoint: null,
            averageDuration: 0,
            recommendations: []
        };
        
        // 统计模型和端点
        const modelStats = {};
        const endpointStats = {};
        let totalDuration = 0;
        let durationCount = 0;
        
        // 统计成功的调用
        for (const result of this.results.successful) {
            if (result.type === 'real') {
                // 统计模型
                if (!modelStats[result.model]) {
                    modelStats[result.model] = 0;
                }
                modelStats[result.model]++;
                
                // 统计端点
                if (!endpointStats[result.endpoint]) {
                    endpointStats[result.endpoint] = 0;
                }
                endpointStats[result.endpoint]++;
                
                // 统计耗时
                if (result.duration) {
                    totalDuration += result.duration;
                    durationCount++;
                }
            }
        }
        
        // 找出最佳模型
        let maxModelCount = 0;
        for (const [model, count] of Object.entries(modelStats)) {
            if (count > maxModelCount) {
                maxModelCount = count;
                analysis.bestModel = model;
            }
        }
        
        // 找出最佳端点
        let maxEndpointCount = 0;
        for (const [endpoint, count] of Object.entries(endpointStats)) {
            if (count > maxEndpointCount) {
                maxEndpointCount = count;
                analysis.bestEndpoint = endpoint;
            }
        }
        
        // 计算平均耗时
        if (durationCount > 0) {
            analysis.averageDuration = Math.round(totalDuration / durationCount);
        }
        
        // 生成建议
        if (this.results.successful.length === 0) {
            // 所有调用都失败
            analysis.recommendations.push('所有API调用都失败，建议检查API配置和网络连接');
            
            // 分析失败原因
            const reasonCounts = {};
            for (const result of this.results.failed) {
                if (result.type === 'real') {
                    const reason = result.reason || '未知原因';
                    if (!reasonCounts[reason]) {
                        reasonCounts[reason] = 0;
                    }
                    reasonCounts[reason]++;
                }
            }
            
            // 找出最常见的失败原因
            let maxReasonCount = 0;
            let mostCommonReason = '';
            for (const [reason, count] of Object.entries(reasonCounts)) {
                if (count > maxReasonCount) {
                    maxReasonCount = count;
                    mostCommonReason = reason;
                }
            }
            
            if (mostCommonReason) {
                analysis.recommendations.push(`最常见的失败原因是: ${mostCommonReason}`);
            }
            
            // 建议使用模拟API
            analysis.recommendations.push('建议使用模拟API作为备用方案');
        } else {
            // 有成功的调用
            if (analysis.bestModel) {
                analysis.recommendations.push(`推荐使用模型: ${analysis.bestModel}`);
            }
            
            if (analysis.bestEndpoint) {
                analysis.recommendations.push(`推荐使用端点: ${analysis.bestEndpoint}`);
            }
            
            // 检查是否有特定场景的成功调用
            const scenarioSuccess = {};
            for (const result of this.results.successful) {
                if (result.type === 'real') {
                    scenarioSuccess[result.siteType] = true;
                }
            }
            
            for (const siteType of Object.keys(this.config.testTexts)) {
                if (!scenarioSuccess[siteType]) {
                    analysis.recommendations.push(`${siteType}场景的API调用失败，建议使用模拟API作为备用方案`);
                }
            }
        }
        
        return analysis;
    }
    
    // 模拟API优化函数
    performLongPortOptimization(text) {
        // 确保输入文本有效
        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            return '请输入需要优化的金融相关文案内容。';
        }
        
        // 金融内容的专业优化
        let optimized = text.trim();
        
        // 优化标点符号和格式
        optimized = optimized.replace(/，/g, '， ').replace(/。/g, '。 ');
        optimized = optimized.replace(/：/g, '： ').replace(/；/g, '； ');
        
        // 优化金融术语表达
        optimized = optimized.replace(/投资/g, '投资理财').replace(/收益/g, '投资回报');
        optimized = optimized.replace(/风险/g, '投资风险').replace(/市场/g, '金融市场');
        
        // 优化句式结构
        if (optimized.length > 50) {
            optimized = optimized.replace(/。/g, '。\n');
        }
        
        // 添加金融专业性
        if (!optimized.includes('专业') && !optimized.includes('权威')) {
            // 确保有句号结尾
            if (!optimized.endsWith('。') && !optimized.endsWith('！') && !optimized.endsWith('？')) {
                optimized += '。';
            }
            optimized += '\n\n注：以上内容基于专业金融分析，仅供参考。';
        }
        
        return optimized;
    }
    
    performNotionOptimization(text) {
        // 确保输入文本有效
        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            return '请输入需要优化的文档内容。';
        }
        
        // 文档内容的逻辑优化
        let optimized = text.trim();
        
        // 优化标点符号和格式
        optimized = optimized.replace(/，/g, '， ').replace(/。/g, '。 ');
        optimized = optimized.replace(/：/g, '： ').replace(/；/g, '； ');
        
        // 优化文档结构
        if (optimized.includes('首先') || optimized.includes('其次')) {
            optimized = optimized.replace(/。/g, '。\n');
        } else if (optimized.length > 80) {
            // 如果文本较长但没有明显的结构词，也适当添加换行
            optimized = optimized.replace(/。/g, '。\n');
        }
        
        // 添加文档专业性
        if (!optimized.includes('建议') && !optimized.includes('总结')) {
            // 确保有句号结尾
            if (!optimized.endsWith('。') && !optimized.endsWith('！') && !optimized.endsWith('？')) {
                optimized += '。';
            }
            optimized += '\n\n建议：请根据实际情况调整和完善以上内容。';
        }
        
        return optimized;
    }
    
    performGeneralOptimization(text) {
        // 确保输入文本有效
        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            return '请输入需要优化的文本内容。';
        }
        
        // 通用文本优化
        let optimized = text.trim();
        
        // 优化标点符号和格式
        optimized = optimized.replace(/，/g, '， ').replace(/。/g, '。 ');
        optimized = optimized.replace(/：/g, '： ').replace(/；/g, '； ');
        
        // 优化空格（但要小心不要破坏换行）
        optimized = optimized.split('\n').map(line => line.replace(/\s+/g, ' ').trim()).join('\n');
        
        // 添加通用改进
        if (optimized.length > 20 && !optimized.includes('\n')) {
            // 只有在没有换行的情况下才添加换行
            optimized = optimized.replace(/。/g, '。\n');
        }
        
        // 添加优化说明
        if (!optimized.includes('优化') && !optimized.includes('改进')) {
            // 确保有句号结尾
            if (!optimized.endsWith('。') && !optimized.endsWith('！') && !optimized.endsWith('？')) {
                optimized += '。';
            }
            optimized += '\n\n注：以上内容已进行语言优化，提升了表达清晰度。';
        }
        
        return optimized;
    }
}

// 创建监控实例
const monitor = new ApiCallMonitor(config, logger);

// 运行测试
console.log('🔍 开始API调用监控...');
monitor.testAllScenarios().then(report => {
    console.log('📊 测试报告:');
    console.log(JSON.stringify(report.summary, null, 2));
    
    console.log('\n✅ 成功的调用:');
    report.successful.forEach((result, index) => {
        console.log(`${index + 1}. ${result.type === 'real' ? `${result.model} (${result.endpoint})` : '模拟API'} - ${result.siteType} (${result.duration}ms)`);
    });
    
    console.log('\n❌ 失败的调用:');
    report.failed.forEach((result, index) => {
        console.log(`${index + 1}. ${result.type === 'real' ? `${result.model} (${result.endpoint})` : '模拟API'} - ${result.siteType}: ${result.reason}`);
    });
    
    console.log('\n💡 分析和建议:');
    if (report.analysis.bestModel) {
        console.log(`最佳模型: ${report.analysis.bestModel}`);
    }
    if (report.analysis.bestEndpoint) {
        console.log(`最佳端点: ${report.analysis.bestEndpoint}`);
    }
    if (report.analysis.averageDuration) {
        console.log(`平均响应时间: ${report.analysis.averageDuration}ms`);
    }
    
    report.analysis.recommendations.forEach((recommendation, index) => {
        console.log(`建议 ${index + 1}: ${recommendation}`);
    });
    
    // 保存详细日志到文件（如果在Node.js环境中）
    if (typeof require !== 'undefined') {
        const fs = require('fs');
        fs.writeFileSync('api-call-monitor-report.json', JSON.stringify(report, null, 2));
        console.log('\n📝 详细报告已保存到 api-call-monitor-report.json');
    }
}).catch(error => {
    console.error('❌ 测试过程中出错:', error);
});

// 导出模块
if (typeof module !== 'undefined') {
    module.exports = {
        ApiCallMonitor,
        config,
        logger
    };
}
