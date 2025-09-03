/**
 * LongPort AI 助手 - 文案优化测试页面脚本
 */

import '../test/test.css';

// 导入优化的API客户端
// 注意: 这里直接在代码中实现API客户端类，避免路径问题

// 定义接口
interface OptimizeTextResponse {
  success: boolean;
  optimizedText?: string;
  stats?: {
    originalLength: number;
    optimizedLength: number;
    lengthDifference?: number;
    percentageChange?: number;
    originalChineseChars?: number;
    optimizedChineseChars?: number;
    originalEnglishWords?: number;
    optimizedEnglishWords?: number;
  };
  error?: string;
  details?: string;
}

interface ApiSettings {
  apiEndpoint: string;
  apiKey: string;
  strictMode: boolean;
}

// 简化版的 LRU 缓存实现
class SimpleCache {
  private cache: Map<string, any>;
  private capacity: number;
  
  constructor(capacity: number = 50) {
    this.cache = new Map();
    this.capacity = capacity;
  }
  
  get(key: string): any {
    if (!this.cache.has(key)) return undefined;
    
    const value = this.cache.get(key);
    
    if (value !== undefined) {
      // 刷新键的位置
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    
    return value;
  }
  
  set(key: string, value: any): void {
    // 如果键已存在，先删除
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    // 如果缓存已满，删除最旧的项
    else if (this.cache.size >= this.capacity) {
      // 获取第一个键删除
      const keys = this.keys();
      if (keys.length > 0) {
        this.cache.delete(keys[0]);
      }
      // 已在上面处理
    }
    
    // 添加新项
    this.cache.set(key, value);
  }
  
  keys(): string[] {
    return Array.from(this.cache.keys());
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  size(): number {
    return this.cache.size;
  }
}

// 简化版的性能监控器
class SimplePerformanceMonitor {
  private metrics: any;
  
  constructor() {
    this.resetMetrics();
  }
  
  recordRequest(isCached: boolean = false): number {
    const timestamp = Date.now();
    this.metrics.totalRequests++;
    if (isCached) {
      this.metrics.cachedResponses++;
    }
    return timestamp;
  }
  
  recordResponse(startTime: number, success: boolean, responseTime: number): void {
    if (success) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
    }
    
    this.metrics.totalResponseTime += responseTime;
    this.metrics.maxResponseTime = Math.max(this.metrics.maxResponseTime, responseTime);
    this.metrics.minResponseTime = Math.min(this.metrics.minResponseTime, responseTime);
    
    if (this.metrics.successfulRequests + this.metrics.failedRequests > 0) {
      this.metrics.averageResponseTime = this.metrics.totalResponseTime / 
        (this.metrics.successfulRequests + this.metrics.failedRequests);
    }
  }
  
  getMetrics(): any {
    return {
      ...this.metrics,
      currentRequestRate: 0, // 添加默认值以避免 undefined 错误
      successRate: this.metrics.totalRequests > 0 
        ? (this.metrics.successfulRequests / this.metrics.totalRequests * 100).toFixed(2) + '%'
        : '0%',
      cacheHitRate: this.metrics.totalRequests > 0
        ? (this.metrics.cachedResponses / this.metrics.totalRequests * 100).toFixed(2) + '%'
        : '0%'
    };
  }
  
  resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      cachedResponses: 0,
      averageResponseTime: 0,
      totalResponseTime: 0,
      maxResponseTime: 0,
      minResponseTime: Number.MAX_VALUE
    };
  }
}

// 简化版的 API 客户端
class OptimizedApiClient {
  private cache: SimpleCache;
  private performanceMonitor: SimplePerformanceMonitor;
  private similarityThreshold: number;
  
  constructor(options: any = {}) {
    this.cache = new SimpleCache(options.cacheSize || 50);
    this.performanceMonitor = new SimplePerformanceMonitor();
    this.similarityThreshold = options.similarityThreshold || 0.85;
  }
  
  async optimizeText(
    text: string, 
    isStrictMode: boolean, 
    apiSettings: ApiSettings
  ): Promise<OptimizeTextResponse> {
    // 初始化返回值
    let result: OptimizeTextResponse = {
      success: false,
      error: "未知错误"
    };
    
    // 记录请求开始
    const requestStartTime = this.performanceMonitor.recordRequest();
    
    // 检查缓存
    const cacheKey = this.generateCacheKey(text, isStrictMode);
    const cachedResponse = this.cache.get(cacheKey);
    
    if (cachedResponse) {
      console.log(`[测试页面] 使用缓存响应，缓存键: ${cacheKey}`);
      
      // 记录缓存命中
      this.performanceMonitor.recordResponse(
        requestStartTime,
        true,
        Date.now() - requestStartTime
      );
      
      return cachedResponse;
    }
    
    // 检查相似文本缓存
    const similarKey = this.findSimilarTextCacheKey(text, isStrictMode);
    if (similarKey) {
      const similarResponse = this.cache.get(similarKey);
      if (similarResponse) {
        console.log(`[测试页面] 使用相似文本缓存响应，缓存键: ${similarKey}`);
        
        // 记录缓存命中
        this.performanceMonitor.recordResponse(
          requestStartTime,
          true,
          Date.now() - requestStartTime
        );
        
        return similarResponse;
      }
    }
    
    try {
      // 真实 API 调用
      const startCallTime = Date.now();
      
      // 检查 API 配置
      if (!apiSettings.apiEndpoint || !apiSettings.apiKey) {
        throw new Error('API 未配置');
      }
      
      console.log(`[测试页面] 发起API调用，端点: ${apiSettings.apiEndpoint}`);
      
      // 准备请求数据 - 使用OpenAI标准格式
      const baseUrl = apiSettings.apiEndpoint.endsWith('/') 
        ? apiSettings.apiEndpoint.slice(0, -1) 
        : apiSettings.apiEndpoint;
      
      // 使用OpenAI标准的chat/completions端点
      const openaiEndpoint = `${baseUrl}/v1/chat/completions`;
      
      console.log(`[测试页面] 使用OpenAI标准端点: ${openaiEndpoint}`);
      
      // 准备OpenAI标准的请求数据格式 - 按优先级排序
      const openaiRequestFormats = [
        // 格式1：GPT-4.1 (最高优先级) - 基础优化
        {
          model: "gpt-4.1",
          messages: [
            {
              role: "system",
              content: "你是一个专业的文案优化助手。请优化用户输入的文本，提升其专业性、清晰度和表达效果。保持原文语义不变，字数相当。"
            },
            {
              role: "user",
              content: `请优化以下文本：${text}`
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        },
        // 格式2：GPT-4o (第二优先级) - 严格模式
        {
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "你是一个严格的文案优化助手。请严格按照以下要求优化文本：1. 语法校正 2. 标点规范 3. 中英混排规则 4. 语言风格优化 5. 语调控制。保持原文语义一致，字数相当。"
            },
            {
              role: "user",
              content: `请严格优化以下文本：${text}`
            }
          ],
          max_tokens: 1000,
          temperature: 0.5
        },
        // 格式3：Claude-3.7-sonnet (第三优先级) - 基础优化
        {
          model: "claude-3-7-sonnet-20250219",
          messages: [
            {
              role: "system",
              content: "你是一个专业的文案优化助手。请优化用户输入的文本，提升其专业性、清晰度和表达效果。保持原文语义不变，字数相当。"
            },
            {
              role: "user",
              content: `请优化以下文本：${text}`
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        },
        // 格式4：GPT-4o-mini (第四优先级) - 简化格式
        {
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: `优化文本：${text}`
            }
          ]
        },
        // 格式5：GPT-5-mini (第五优先级) - 备用格式
        {
          model: "gpt-5-mini",
          messages: [
            {
              role: "system",
              content: "你是一个专业的文案优化助手。请优化用户输入的文本，提升其专业性、清晰度和表达效果。保持原文语义不变，字数相当。"
            },
            {
              role: "user",
              content: `请优化以下文本：${text}`
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        }
      ];
      
      // 记录请求数据
      console.log(`[测试页面] 将尝试 ${openaiRequestFormats.length} 种OpenAI标准请求格式`);
      
      // 创建 AbortController 用于超时控制
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时
      
      try {
        // 发送真实API请求
        console.log(`[测试页面] 发送请求到: ${openaiEndpoint}`);
        
        // 准备OpenAI标准的请求头
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        
        // 根据API密钥格式决定认证方式
        if (apiSettings.apiKey.startsWith('Bearer ')) {
          // 如果已经包含 Bearer 前缀，直接使用
          headers.append('Authorization', apiSettings.apiKey);
        } else {
          // 否则添加 Bearer 前缀
          headers.append('Authorization', `Bearer ${apiSettings.apiKey}`);
        }
        
        // 添加请求ID和客户端版本
        headers.append('X-Request-ID', `test-${Date.now()}`);
        headers.append('X-Client-Version', '1.0.0');
        headers.append('Accept', 'application/json');
        headers.append('User-Agent', 'LongPort-AI-Extension/1.0.0');
        
        // 记录请求头
        const headersObj: Record<string, string> = {};
        headers.forEach((value, key) => {
          headersObj[key] = value;
        });
        console.log(`[测试页面] 请求头:`, headersObj);
        
        // 尝试多种OpenAI标准请求格式
        let data: any = null;
        let successfulFormat = null;
        
        for (let i = 0; i < openaiRequestFormats.length; i++) {
          const currentFormat = openaiRequestFormats[i];
          console.log(`[测试页面] 尝试OpenAI格式 ${i + 1}:`, currentFormat);
          
          try {
            const response = await fetch(openaiEndpoint, {
              method: 'POST',
              headers,
              body: JSON.stringify(currentFormat),
              signal: controller.signal,
              mode: 'cors',
              cache: 'no-cache'
            });
            
            // 清除超时
            clearTimeout(timeoutId);
            
            // 检查响应状态
            if (!response.ok) {
              console.warn(`[测试页面] 格式 ${i + 1} 返回错误状态: ${response.status}`);
              continue; // 尝试下一个格式
            }
            
            // 验证响应内容类型
            const contentType = response.headers.get('content-type') || '';
            console.log(`[测试页面] 格式 ${i + 1} 响应内容类型: ${contentType}`);
            
            // 解析响应数据
            try {
              const responseText = await response.text();
              console.log(`[测试页面] 格式 ${i + 1} 响应原始内容:`, responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''));
              
              // 检查是否是HTML响应
              if (responseText.trim().toLowerCase().startsWith('<!doctype') || 
                  responseText.trim().toLowerCase().startsWith('<html')) {
                console.warn(`[测试页面] 格式 ${i + 1} 返回了HTML内容，跳过`);
                continue; // 尝试下一个格式
              }
              
              // 尝试将文本解析为JSON
              try {
                data = JSON.parse(responseText);
                console.log(`[测试页面] 格式 ${i + 1} 解析成功:`, data);
                
                // 检查OpenAI标准响应格式
                const hasValidOpenAIResponse = data && (
                  data.choices && Array.isArray(data.choices) && data.choices.length > 0 ||
                  data.usage ||
                  data.model ||
                  data.id ||
                  data.object === 'chat.completion'
                );
                
                if (hasValidOpenAIResponse) {
                  successfulFormat = i + 1;
                  console.log(`[测试页面] 格式 ${i + 1} 成功获取有效OpenAI响应，停止尝试`);
                  break; // 找到有效格式，停止尝试
                } else {
                  console.warn(`[测试页面] 格式 ${i + 1} 响应不符合OpenAI标准格式`);
                  continue; // 尝试下一个格式
                }
              } catch (jsonError) {
                console.error(`[测试页面] 格式 ${i + 1} 解析JSON失败:`, jsonError);
                continue; // 尝试下一个格式
              }
            } catch (parseError) {
              console.error(`[测试页面] 格式 ${i + 1} 解析响应失败:`, parseError);
              continue; // 尝试下一个格式
            }
          } catch (fetchError) {
            console.error(`[测试页面] 格式 ${i + 1} 请求失败:`, fetchError);
            continue; // 尝试下一个格式
          }
        }
        
        // 检查是否找到有效的响应格式
        if (!data || !successfulFormat) {
          throw new Error('所有OpenAI请求格式都失败了，请检查API配置和网络连接');
        }
        
        console.log(`[测试页面] 使用OpenAI格式 ${successfulFormat} 成功调用API`);
        
        // 使用API返回的优化文本 - 从OpenAI响应中提取
        const optimizedText = data.choices && data.choices[0] && data.choices[0].message 
          ? data.choices[0].message.content 
          : '无法获取优化文本';
        
        // 如果优化后的文本与原文相同，添加标记
        if (text === optimizedText) {
          console.warn('[测试页面] API返回的优化文本与原文相同');
        }
      
      // 如果是严格模式，添加额外的优化
      let finalText = optimizedText;
      if (isStrictMode) {
        finalText = finalText
          .replace(/\u53ef\u80fd/g, '\u6216\u8bb8')
          .replace(/\u5927\u6982/g, '\u5927\u7ea6')
          .replace(/\u5f88\u591a/g, '\u5927\u91cf')
          .replace(/\u5f88\u5927/g, '\u663e\u8457');
        
        // 添加严格模式标记
        finalText = `${finalText} [严格模式优化]`;
      }
      
      // 计算统计信息
      const originalLength = text.length;
      const optimizedLength = optimizedText.length;
      const lengthDifference = optimizedLength - originalLength;
      const percentageChange = originalLength > 0 
        ? Math.round((lengthDifference / originalLength) * 100) 
        : 0;
      
      // 分析中文字符数量
      const countChineseChars = (str: string) => {
        return (str.match(/[\u4e00-\u9fa5]/g) || []).length;
      };
      
      // 分析英文单词数量
      const countEnglishWords = (str: string) => {
        return str.split(/\s+/).filter(word => /[a-zA-Z]/.test(word)).length;
      };
      
      const originalChineseChars = countChineseChars(text);
      const optimizedChineseChars = countChineseChars(optimizedText);
      const originalEnglishWords = countEnglishWords(text);
      const optimizedEnglishWords = countEnglishWords(optimizedText);
      
      // 创建响应对象
      const apiResponse: OptimizeTextResponse = {
        success: true,
        optimizedText: finalText,
        stats: {
          originalLength,
          optimizedLength,
          lengthDifference,
          percentageChange,
          originalChineseChars,
          optimizedChineseChars,
          originalEnglishWords,
          optimizedEnglishWords
        }
      };
      
      // 计算响应时间
      const responseTime = Date.now() - startCallTime;
      
      // 缓存响应
      this.cache.set(cacheKey, apiResponse);
      
      // 记录响应完成
      this.performanceMonitor.recordResponse(
        requestStartTime,
        true,
        Date.now() - startCallTime
      );
      
      return apiResponse;
            } catch (apiError) {
        // 清除超时
        clearTimeout(timeoutId);
        
        console.error('[测试页面] API调用出错:', apiError);
        
        // 如果是超时错误
        if (apiError instanceof DOMException && apiError.name === 'AbortError') {
          throw new Error('请求超时，请检查网络连接或API服务器状态');
        }
        
        // 重新抛出错误，不使用备用方案
        throw apiError;
      }
    } catch (error) {
      // 记录错误响应
      this.performanceMonitor.recordResponse(
        requestStartTime,
        false,
        Date.now() - requestStartTime
      );
      
      console.error('[测试页面] 处理请求失败:', error);
      
      // 返回错误，不使用备用方案
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }
  
  private generateCacheKey(text: string, isStrictMode: boolean): string {
    return `${isStrictMode ? 'strict:' : 'basic:'}${text}`;
  }
  
  private findSimilarTextCacheKey(text: string, isStrictMode: boolean): string | null {
    const prefix = isStrictMode ? 'strict:' : 'basic:';
    const keys = this.cache.keys();
    
    for (const key of keys) {
      if (key.startsWith(prefix)) {
        const cachedText = key.substring(prefix.length);
        if (this.calculateSimilarity(text, cachedText) > this.similarityThreshold) {
          return key;
        }
      }
    }
    
    return null;
  }
  
  private calculateSimilarity(text1: string, text2: string): number {
    if (text1 === text2) return 1.0;
    if (!text1 || !text2) return 0.0;
    
    // 简单的长度比例作为相似度估算
    const maxLength = Math.max(text1.length, text2.length);
    const minLength = Math.min(text1.length, text2.length);
    
    // 基础相似度
    let similarity = minLength / maxLength;
    
    // 检查开头和结尾是否相似
    const prefixLength = Math.min(30, Math.floor(minLength / 2));
    if (text1.substring(0, prefixLength) === text2.substring(0, prefixLength)) {
      similarity += 0.1; // 开头相似加分
    }
    
    // 限制最大值为1.0
    return Math.min(similarity, 1.0);
  }
  
  /**
   * 本地备用处理方案
   * 当API调用失败时，使用本地文本优化逻辑
   */
  private handleFallbackProcessing(text: string, isStrictMode: boolean): OptimizeTextResponse {
    console.log(`[测试页面] 使用本地备用处理方案`);
    
    // 根据产品文档中的基础文本优化实现机制进行优化
    let optimizedText = text;
    
    // 1. 语法校正
    optimizedText = optimizedText
      .replace(/\s{2,}/g, ' ')  // 删除多余空格
      .replace(/[,.\uff0c\u3002;\uff1b]([^\s])/g, '$1 ')  // 标点符号后添加空格
      .replace(/([a-zA-Z])[,.\uff0c\u3002;\uff1b]([a-zA-Z])/g, '$1, $2');  // 修复英文标点
    
    // 2. 标点规范
    optimizedText = optimizedText
      .replace(/\uff0c\uff0c/g, ',')  // 删除重复逗号
      .replace(/\u3002\u3002/g, '.')  // 删除重复句号
      .replace(/\uff1b\uff1b/g, ';');  // 删除重复分号
    
    // 3. 中英混排规则
    optimizedText = optimizedText
      .replace(/([\u4e00-\u9fa5])([a-zA-Z])/g, '$1 $2')  // 中文后面的英文前添加空格
      .replace(/([a-zA-Z])([\u4e00-\u9fa5])/g, '$1 $2');  // 英文后面的中文前添加空格
    
    // 4. 语言风格
    optimizedText = optimizedText
      .replace(/\u6211\u8ba4\u4e3a/g, '\u6211\u4eec\u8ba4\u4e3a')  // 替换“我认为”为“我们认为”
      .replace(/\u6211\u89c9\u5f97/g, '\u6211\u4eec\u8ba4\u4e3a')  // 替换“我觉得”为“我们认为”
      .replace(/\u4e0d\u592a\u597d/g, '\u6709\u5f85\u6539\u8fdb')  // 替换“不太好”为“有待改\u8fdb”
      .replace(/\u5f88\u5f88/g, '\u975e\u5e38')  // 替换重复词
      .replace(/\u7684\u7684/g, '\u7684')
      .replace(/\u4e86\u4e86/g, '\u4e86');
    
    // 5. 语调控制
    optimizedText = optimizedText
      .replace(/\uff01\uff01+/g, '\uff01')  // 删除多余的感叹号
      .replace(/\uff1f\uff1f+/g, '\uff1f');  // 删除多余的问号
    
    // 如果文本仍然没有变化，添加一些额外的优化
    if (text === optimizedText) {
      // 尝试更多的替换
      optimizedText = optimizedText
        .replace(/\uff0c/g, ', ')  // 中文逗号改为英文逗号+空格
        .replace(/\u3002/g, '. ')  // 中文句号改为英文句号+空格
        .replace(/\uff1b/g, '; ');  // 中文分号改为英文分号+空格
    }
    
    // 如果仍然没有变化，添加一个标记
    if (text === optimizedText) {
      optimizedText = text + " (已使用本地优化)";
    }
    
    // 如果是严格模式，添加额外的优化
    if (isStrictMode) {
      optimizedText = optimizedText
        .replace(/\u53ef\u80fd/g, '\u6216\u8bb8')
        .replace(/\u5927\u6982/g, '\u5927\u7ea6')
        .replace(/\u5f88\u591a/g, '\u5927\u91cf')
        .replace(/\u5f88\u5927/g, '\u663e\u8457');
      
      optimizedText = `${optimizedText} [严格模式]`;
    }
    
    // 计算统计信息
    const originalLength = text.length;
    const optimizedLength = optimizedText.length;
    const lengthDifference = optimizedLength - originalLength;
    const percentageChange = originalLength > 0 
      ? Math.round((lengthDifference / originalLength) * 100) 
      : 0;
    
    // 分析中文字符数量
    const countChineseChars = (str: string) => {
      return (str.match(/[\u4e00-\u9fa5]/g) || []).length;
    };
    
    // 分析英文单词数量
    const countEnglishWords = (str: string) => {
      return str.split(/\s+/).filter(word => /[a-zA-Z]/.test(word)).length;
    };
    
    const originalChineseChars = countChineseChars(text);
    const optimizedChineseChars = countChineseChars(optimizedText);
    const originalEnglishWords = countEnglishWords(text);
    const optimizedEnglishWords = countEnglishWords(optimizedText);
    
    return {
      success: true,
      optimizedText,
      stats: {
        originalLength,
        optimizedLength,
        lengthDifference,
        percentageChange,
        originalChineseChars,
        optimizedChineseChars,
        originalEnglishWords,
        optimizedEnglishWords
      }
    };
  }
  
  getPerformanceMetrics(): any {
    return this.performanceMonitor.getMetrics();
  }
  
  getCacheStats(): any {
    return {
      size: this.cache.size(),
      capacity: 50, // 默认容量
      hitRate: this.performanceMonitor.getMetrics().cacheHitRate
    };
  }
  
  clearCache(): void {
    this.cache.clear();
    console.log('[测试页面] 缓存已清除');
  }
}

// 定义设置接口
interface Settings {
  apiEndpoint: string;
  apiKey: string;
  strictMode: boolean;
}

// 定义优化响应接口
interface OptimizeTextResponse {
  success: boolean;
  optimizedText?: string;
  stats?: {
    originalLength: number;
    optimizedLength: number;
    lengthDifference?: number;
    percentageChange?: number;
    originalChineseChars?: number;
    optimizedChineseChars?: number;
    originalEnglishWords?: number;
    optimizedEnglishWords?: number;
  };
  error?: string;
  details?: string;
}

// 创建API客户端实例
let apiClient: OptimizedApiClient | null = null;

// 当前设置
let currentSettings: Settings | null = null;

// 页面元素
let testTextArea: HTMLTextAreaElement;
let testModeSelect: HTMLSelectElement;
let useCacheModeCheckbox: HTMLInputElement;
let showPerformanceStatsCheckbox: HTMLInputElement;
let optimizeBtn: HTMLButtonElement;
let clearBtn: HTMLButtonElement;
let clearCacheBtn: HTMLButtonElement;
let loadingIndicator: HTMLElement;
let testResults: HTMLElement;
let originalTextElement: HTMLElement;
let optimizedTextElement: HTMLElement;
let processingTimeElement: HTMLElement;
let statsContainer: HTMLElement;
let copyResultBtn: HTMLButtonElement;
let performanceMetrics: HTMLElement;
let metricsContainer: HTMLElement;
let backBtn: HTMLButtonElement;

// 初始化函数
async function initialize(): Promise<void> {
  // 获取页面元素
  testTextArea = document.getElementById('testText') as HTMLTextAreaElement;
  testModeSelect = document.getElementById('testMode') as HTMLSelectElement;
  useCacheModeCheckbox = document.getElementById('useCacheMode') as HTMLInputElement;
  showPerformanceStatsCheckbox = document.getElementById('showPerformanceStats') as HTMLInputElement;
  optimizeBtn = document.getElementById('optimizeBtn') as HTMLButtonElement;
  clearBtn = document.getElementById('clearBtn') as HTMLButtonElement;
  clearCacheBtn = document.getElementById('clearCacheBtn') as HTMLButtonElement;
  loadingIndicator = document.getElementById('loadingIndicator') as HTMLElement;
  testResults = document.getElementById('testResults') as HTMLElement;
  originalTextElement = document.getElementById('originalText') as HTMLElement;
  optimizedTextElement = document.getElementById('optimizedText') as HTMLElement;
  processingTimeElement = document.getElementById('processingTime') as HTMLElement;
  statsContainer = document.getElementById('statsContainer') as HTMLElement;
  copyResultBtn = document.getElementById('copyResultBtn') as HTMLButtonElement;
  performanceMetrics = document.getElementById('performanceMetrics') as HTMLElement;
  metricsContainer = document.getElementById('metricsContainer') as HTMLElement;
  backBtn = document.getElementById('backBtn') as HTMLButtonElement;
  
  // 加载设置
  await loadSettings();
  
  // 初始化API客户端
  initializeApiClient();
  
  // 添加事件监听器
  setupEventListeners();
  
  // 填充示例文本
  fillExampleText();
  
  // 更新性能指标
  updatePerformanceMetrics();
}

// 加载设置
async function loadSettings(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['apiEndpoint', 'apiKey', 'strictMode'], (items) => {
      currentSettings = {
        apiEndpoint: items.apiEndpoint || '',
        apiKey: items.apiKey || '',
        strictMode: items.strictMode || false
      };
      
      // 设置严格模式选择
      if (currentSettings.strictMode) {
        testModeSelect.value = 'strict';
      } else {
        testModeSelect.value = 'basic';
      }
      
      resolve();
    });
  });
}

// 初始化API客户端
function initializeApiClient(): void {
  apiClient = new OptimizedApiClient({
    cacheSize: 50,
    tokensPerSecond: 5,
    maxTokens: 10,
    similarityThreshold: 0.85
  });
  
  console.log('API客户端已初始化');
}

// 设置事件监听器
function setupEventListeners(): void {
  // 执行优化按钮
  optimizeBtn.addEventListener('click', optimizeText);
  
  // 清空内容按钮
  clearBtn.addEventListener('click', clearContent);
  
  // 清除缓存按钮
  clearCacheBtn.addEventListener('click', clearCache);
  
  // 复制结果按钮
  copyResultBtn.addEventListener('click', copyResult);
  
  // 返回按钮
  backBtn.addEventListener('click', () => {
    window.location.href = 'options.html';
  });
  
  // 显示性能指标切换
  showPerformanceStatsCheckbox.addEventListener('change', () => {
    if (showPerformanceStatsCheckbox.checked) {
      performanceMetrics.classList.remove('hidden');
      updatePerformanceMetrics();
    } else {
      performanceMetrics.classList.add('hidden');
    }
  });
}

// 填充示例文本
function fillExampleText(): void {
  if (!testTextArea.value) {
    testTextArea.value = '这是一个文案优化测试示例。我认为这个功能很有用，但是还需要进行测试。通过这个测试，我们可以验证API的效果和性能，确保它能够正确的优化文案内容，提高文案的专业性和清晰度。';
  }
}

// 执行文本优化
async function optimizeText(): Promise<void> {
  if (!apiClient || !currentSettings) {
    alert('API客户端未初始化或设置未加载');
    return;
  }
  
  const text = testTextArea.value.trim();
  if (!text) {
    alert('请输入需要优化的文本');
    return;
  }
  
  // 显示加载指示器
  loadingIndicator.classList.add('active');
  optimizeBtn.disabled = true;
  
  // 隐藏结果区域
  testResults.classList.add('hidden');
  
  try {
    // 记录开始时间
    const startTime = performance.now();
    
    // 确定优化模式
    const isStrictMode = testModeSelect.value === 'strict';
    
    // 禁用缓存（如果需要）
    let textToOptimize = text;
    if (!useCacheModeCheckbox.checked) {
      // 生成随机字符串确保不命中缓存
      const randomSuffix = Math.random().toString(36).substring(2, 15);
      textToOptimize = text + ' ' + randomSuffix;
    }
    
    // 调用API优化文本
    const result = await apiClient.optimizeText(
      textToOptimize,
      isStrictMode,
      {
        apiEndpoint: currentSettings.apiEndpoint,
        apiKey: currentSettings.apiKey,
        strictMode: isStrictMode
      }
    );
    
    // 计算处理时间
    const processingTime = Math.round(performance.now() - startTime);
    
    // 显示结果
    displayResults(text, result, processingTime);
    
    // 更新性能指标
    updatePerformanceMetrics();
  } catch (error) {
    console.error('优化文本时出错:', error);
    alert(`优化失败: ${error instanceof Error ? error.message : '未知错误'}`);
  } finally {
    // 隐藏加载指示器
    loadingIndicator.classList.remove('active');
    optimizeBtn.disabled = false;
  }
}

// 显示优化结果
function displayResults(originalText: string, result: OptimizeTextResponse, processingTime: number): void {
  // 设置处理时间
  processingTimeElement.textContent = processingTime.toString();
  
  // 设置原始文本和优化文本
  originalTextElement.textContent = originalText;
  
  if (result.success && result.optimizedText) {
    optimizedTextElement.textContent = result.optimizedText;
    
    // 显示统计信息
    displayStats(result.stats);
  } else {
    optimizedTextElement.textContent = `优化失败: ${result.error || '未知错误'}`;
    statsContainer.innerHTML = '';
  }
  
  // 显示结果区域
  testResults.classList.remove('hidden');
}

// 显示统计信息
function displayStats(stats?: OptimizeTextResponse['stats']): void {
  if (!stats) {
    statsContainer.innerHTML = '<div class="stat-item">无统计数据</div>';
    return;
  }
  
  statsContainer.innerHTML = '';
  
  // 添加字数统计
  addStatItem('原始长度', stats.originalLength);
  addStatItem('优化长度', stats.optimizedLength);
  
  // 添加长度变化
  if (stats.lengthDifference !== undefined) {
    const changeClass = stats.lengthDifference > 0 ? 'positive' : (stats.lengthDifference < 0 ? 'negative' : '');
    const changePrefix = stats.lengthDifference > 0 ? '+' : '';
    addStatItem('长度变化', `${changePrefix}${stats.lengthDifference}`, changeClass);
  }
  
  // 添加百分比变化
  if (stats.percentageChange !== undefined) {
    const changeClass = stats.percentageChange > 0 ? 'positive' : (stats.percentageChange < 0 ? 'negative' : '');
    const changePrefix = stats.percentageChange > 0 ? '+' : '';
    addStatItem('百分比变化', `${changePrefix}${stats.percentageChange}%`, changeClass);
  }
  
  // 添加中文字符统计
  if (stats.originalChineseChars !== undefined && stats.optimizedChineseChars !== undefined) {
    addStatItem('原始中文字符', stats.originalChineseChars);
    addStatItem('优化中文字符', stats.optimizedChineseChars);
  }
  
  // 添加英文单词统计
  if (stats.originalEnglishWords !== undefined && stats.optimizedEnglishWords !== undefined) {
    addStatItem('原始英文单词', stats.originalEnglishWords);
    addStatItem('优化英文单词', stats.optimizedEnglishWords);
  }
}

// 添加统计项
function addStatItem(label: string, value: string | number, valueClass: string = ''): void {
  const statItem = document.createElement('div');
  statItem.className = 'stat-item';
  
  const statLabel = document.createElement('span');
  statLabel.className = 'stat-label';
  statLabel.textContent = label + ': ';
  
  const statValue = document.createElement('span');
  statValue.className = `stat-value ${valueClass}`;
  statValue.textContent = value.toString();
  
  statItem.appendChild(statLabel);
  statItem.appendChild(statValue);
  statsContainer.appendChild(statItem);
}

// 清空内容
function clearContent(): void {
  testTextArea.value = '';
  testResults.classList.add('hidden');
}

// 清除缓存
function clearCache(): void {
  if (apiClient) {
    apiClient.clearCache();
    alert('缓存已清除');
    
    // 更新性能指标
    updatePerformanceMetrics();
  }
}

// 复制结果
function copyResult(): void {
  if (optimizedTextElement.textContent) {
    navigator.clipboard.writeText(optimizedTextElement.textContent)
      .then(() => {
        alert('已复制到剪贴板');
      })
      .catch(err => {
        console.error('复制失败:', err);
        alert('复制失败');
      });
  }
}

// 更新性能指标
function updatePerformanceMetrics(): void {
  if (!apiClient || !showPerformanceStatsCheckbox.checked) {
    return;
  }
  
  const metrics = apiClient.getPerformanceMetrics();
  const cacheStats = apiClient.getCacheStats();
  
  metricsContainer.innerHTML = '';
  
  // 添加请求统计
  addMetricItem('总请求数', metrics.totalRequests);
  addMetricItem('成功请求', metrics.successfulRequests);
  addMetricItem('失败请求', metrics.failedRequests);
  addMetricItem('缓存命中', metrics.cachedResponses);
  
  // 添加响应时间统计
  addMetricItem('平均响应时间', `${Math.round(metrics.averageResponseTime)}ms`);
  addMetricItem('最长响应时间', `${metrics.maxResponseTime}ms`);
  addMetricItem('最短响应时间', metrics.minResponseTime === Number.MAX_VALUE ? 'N/A' : `${metrics.minResponseTime}ms`);
  
  // 添加缓存统计
  addMetricItem('缓存大小', `${cacheStats.size}/${cacheStats.capacity}`);
  addMetricItem('缓存命中率', cacheStats.hitRate);
  
  // 添加其他指标
  addMetricItem('当前请求速率', `${(metrics.currentRequestRate || 0).toFixed(2)}/秒`);
  addMetricItem('成功率', metrics.successRate);
  
  // 显示性能指标区域
  performanceMetrics.classList.remove('hidden');
}

// 添加指标项
function addMetricItem(label: string, value: string | number): void {
  const metricItem = document.createElement('div');
  metricItem.className = 'stat-item';
  
  const metricLabel = document.createElement('span');
  metricLabel.className = 'stat-label';
  metricLabel.textContent = label + ': ';
  
  const metricValue = document.createElement('span');
  metricValue.className = 'stat-value';
  metricValue.textContent = value.toString();
  
  metricItem.appendChild(metricLabel);
  metricItem.appendChild(metricValue);
  metricsContainer.appendChild(metricItem);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initialize);

// 导出一个空对象，确保这是一个有效的模块
export {};
