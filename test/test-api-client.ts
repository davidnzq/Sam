/**
 * LongPort AI 助手 - API客户端测试
 * 测试优化的API客户端功能
 */

import { OptimizedApiClient } from './api-client';

// 模拟API设置
const mockApiSettings = {
  apiEndpoint: 'https://api.example.com/optimize',
  apiKey: 'test-api-key',
  strictMode: false
};

// 测试文本样本
const testTexts = {
  short: "这是一个简短的测试文本，用于验证API优化效果。",
  medium: "LongPort平台是一个专业的金融服务平台，提供全球市场的投资机会和分析工具。用户可以通过平台进行股票、基金、期权等多种金融产品的交易。平台还提供实时行情、财经新闻和研究报告，帮助投资者做出更明智的决策。",
  long: "金融科技的快速发展正在重塑全球金融服务行业。传统金融机构面临来自金融科技初创公司的激烈竞争，这些新兴公司利用创新技术提供更便捷、更个性化的服务。人工智能、区块链、云计算等技术的应用，使金融服务变得更加高效和普惠。同时，监管机构也在不断调整政策框架，以平衡创新与风险控制。在这个变革的时代，金融机构需要积极拥抱技术变革，重新定位自身角色，才能在新的竞争格局中保持竞争力。投资者也需要不断学习和适应这些变化，以把握新的投资机会并管理风险。未来，金融科技与传统金融的融合将进一步深化，共同构建更加开放、高效、普惠的金融生态系统。"
};

// 相似文本样本（与medium文本相似）
const similarText = "LongPort系统是一个专业化的金融服务平台，提供全球市场的投资机会和解析工具。用户可以通过平台进行股票、基金、期权等多种金融产品的交易。平台还提供实时行情、财经新闻和研究报告，帮助投资者做出更明智的决定。";

/**
 * 运行测试
 */
async function runTests() {
  console.log('=== LongPort AI 助手 - API客户端测试 ===');
  
  // 创建API客户端实例
  const apiClient = new OptimizedApiClient({
    cacheSize: 10,
    tokensPerSecond: 5,
    similarityThreshold: 0.8
  });
  
  console.log('1. 测试基本文本优化...');
  try {
    const result = await apiClient.optimizeText(
      testTexts.short,
      false,
      mockApiSettings
    );
    
    console.log('✅ 基本文本优化成功');
    console.log('优化结果:', result.optimizedText);
    console.log('统计信息:', result.stats);
  } catch (error) {
    console.error('❌ 基本文本优化失败:', error);
  }
  
  console.log('\n2. 测试缓存功能...');
  try {
    console.log('首次请求相同文本...');
    const start1 = Date.now();
    const result1 = await apiClient.optimizeText(
      testTexts.short,
      false,
      mockApiSettings
    );
    console.log(`耗时: ${Date.now() - start1}ms`);
    
    console.log('再次请求相同文本（应使用缓存）...');
    const start2 = Date.now();
    const result2 = await apiClient.optimizeText(
      testTexts.short,
      false,
      mockApiSettings
    );
    console.log(`耗时: ${Date.now() - start2}ms`);
    
    if (Date.now() - start2 < 50) {
      console.log('✅ 缓存功能正常工作');
    } else {
      console.log('⚠️ 缓存可能未正常工作，响应时间较长');
    }
  } catch (error) {
    console.error('❌ 缓存测试失败:', error);
  }
  
  console.log('\n3. 测试相似文本识别...');
  try {
    // 先请求medium文本
    console.log('请求原始文本...');
    await apiClient.optimizeText(
      testTexts.medium,
      false,
      mockApiSettings
    );
    
    // 再请求相似文本
    console.log('请求相似文本（应识别为相似）...');
    const start = Date.now();
    const result = await apiClient.optimizeText(
      similarText,
      false,
      mockApiSettings
    );
    
    if (Date.now() - start < 50) {
      console.log('✅ 相似文本识别功能正常工作');
    } else {
      console.log('⚠️ 相似文本识别可能未正常工作，响应时间较长');
    }
  } catch (error) {
    console.error('❌ 相似文本识别测试失败:', error);
  }
  
  console.log('\n4. 测试并发请求处理...');
  try {
    console.log('发送5个并发请求...');
    const startTime = Date.now();
    
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(
        apiClient.optimizeText(
          `${testTexts.short} (${i})`,
          false,
          mockApiSettings,
          i % 2 === 0 ? 2 : 1 // 交替设置优先级
        )
      );
    }
    
    await Promise.all(promises);
    
    const totalTime = Date.now() - startTime;
    console.log(`所有请求完成，总耗时: ${totalTime}ms`);
    console.log('✅ 并发请求处理测试成功');
  } catch (error) {
    console.error('❌ 并发请求处理测试失败:', error);
  }
  
  console.log('\n5. 测试严格模式...');
  try {
    const result = await apiClient.optimizeText(
      testTexts.medium,
      true, // 启用严格模式
      mockApiSettings
    );
    
    console.log('✅ 严格模式测试成功');
    console.log('优化结果:', result.optimizedText);
  } catch (error) {
    console.error('❌ 严格模式测试失败:', error);
  }
  
  console.log('\n6. 获取性能指标...');
  const metrics = apiClient.getPerformanceMetrics();
  console.log('性能指标:', metrics);
  
  console.log('\n7. 获取缓存统计...');
  const cacheStats = apiClient.getCacheStats();
  console.log('缓存统计:', cacheStats);
  
  console.log('\n=== 测试完成 ===');
}

// 运行测试
runTests().catch(error => {
  console.error('测试过程中出错:', error);
});
