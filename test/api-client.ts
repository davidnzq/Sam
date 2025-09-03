/**
 * LongPort AI 助手 - 优化的API客户端
 * 实现了缓存、限流、请求合并、错误处理等高级功能
 */

// 导入错误处理工具
import ErrorHandler, { ErrorType } from '../src/utils/error-handler';

// 接口定义
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

interface ApiRequest {
  id: string;
  text: string;
  isStrictMode: boolean;
  apiSettings: ApiSettings;
  priority: number;
  timestamp: number;
  retryCount?: number;
  resolve?: (value: OptimizeTextResponse) => void;
  reject?: (reason: any) => void;
}

// 模拟API响应（用于开发和测试）
function mockApiResponse(text: string): Promise<OptimizeTextResponse> {
  // 模拟处理延迟
  return new Promise<OptimizeTextResponse>(resolve => {
    setTimeout(() => {
      // 简单的文本优化逻辑
      let optimizedText = text;
      
      // 替换一些常见的错误或改进表达
      optimizedText = optimizedText
        .replace(/[,.，。;；]([^\s])/g, '$1 ') // 标点符号后添加空格
        .replace(/\s+/g, ' ')                 // 规范化空格
        .replace(/([a-zA-Z])[,.，。;；]([a-zA-Z])/g, '$1, $2') // 修复英文标点
        .replace(/很很/g, '非常')              // 修复重复词
        .replace(/的的/g, '的')
        .replace(/了了/g, '了')
        .replace(/我认为/g, '我们认为')         // 更正式的表达
        .replace(/我觉得/g, '我们认为')
        .replace(/不太好/g, '有待改进')         // 更专业的表达
        .trim();
      
      // 如果文本没有变化，添加一些小改动
      if (optimizedText === text) {
        optimizedText = text + '（已优化）';
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
      
      resolve({
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
      });
    }, 300); // 模拟300ms延迟
  });
}

/**
 * LRU缓存实现
 * 使用Map保持插入顺序，实现最近最少使用淘汰策略
 */
class LRUCache<K, V> {
  private capacity: number;
  private cache: Map<K, V>;
  
  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
  }
  
  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;
    
    // 获取值
    const value = this.cache.get(key);
    
    if (value !== undefined) {
      // 刷新键的位置（删除并重新添加到末尾）
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    
    return value;
  }
  
  set(key: K, value: V): void {
    // 如果键已存在，先删除
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    // 如果缓存已满，删除最旧的项
    else if (this.cache.size >= this.capacity) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    // 添加新项
    this.cache.set(key, value);
  }
  
  keys(): IterableIterator<K> {
    return this.cache.keys();
  }
  
  has(key: K): boolean {
    return this.cache.has(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  size(): number {
    return this.cache.size;
  }
}

/**
 * 令牌桶限流器
 * 控制API请求速率，防止过载
 */
class TokenBucket {
  private tokens: number;
  private maxTokens: number;
  private refillRate: number; // 每秒补充的令牌数
  private lastRefill: number;
  
  constructor(maxTokens: number, refillRate: number) {
    this.tokens = maxTokens;
    this.maxTokens = maxTokens;
    this.refillRate = refillRate;
    this.lastRefill = Date.now();
  }
  
  consumeToken(): boolean {
    this.refill();
    
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }
    
    return false;
  }
  
  refill(): void {
    const now = Date.now();
    const elapsedSeconds = (now - this.lastRefill) / 1000;
    
    // 根据时间流逝补充令牌
    this.tokens = Math.min(
      this.maxTokens,
      this.tokens + elapsedSeconds * this.refillRate
    );
    
    this.lastRefill = now;
  }
  
  getTokens(): number {
    return this.tokens;
  }
}

/**
 * 优先级队列
 * 根据请求优先级排序处理
 */
class PriorityQueue<T extends { priority: number }> {
  private items: T[] = [];
  
  enqueue(item: T): void {
    // 添加项
    this.items.push(item);
    
    // 按优先级排序（优先级高的在前）
    this.items.sort((a, b) => b.priority - a.priority);
  }
  
  dequeue(): T | undefined {
    return this.items.shift();
  }
  
  isEmpty(): boolean {
    return this.items.length === 0;
  }
  
  size(): number {
    return this.items.length;
  }
  
  peek(): T | undefined {
    return this.items[0];
  }
}

/**
 * 性能监控器
 * 收集API调用性能指标
 */
class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    cachedResponses: number;
    averageResponseTime: number;
    totalResponseTime: number;
    maxResponseTime: number;
    minResponseTime: number;
    requestTimestamps: number[];
  };
  
  private constructor() {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      cachedResponses: 0,
      averageResponseTime: 0,
      totalResponseTime: 0,
      maxResponseTime: 0,
      minResponseTime: Number.MAX_VALUE,
      requestTimestamps: []
    };
  }
  
  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
  
  recordRequest(isCached: boolean = false): number {
    const timestamp = Date.now();
    this.metrics.totalRequests++;
    if (isCached) {
      this.metrics.cachedResponses++;
    }
    this.metrics.requestTimestamps.push(timestamp);
    
    // 保留最近100个请求的时间戳
    if (this.metrics.requestTimestamps.length > 100) {
      this.metrics.requestTimestamps.shift();
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
    this.metrics.averageResponseTime = this.metrics.totalResponseTime / 
      (this.metrics.successfulRequests + this.metrics.failedRequests);
  }
  
  getCurrentRequestRate(): number {
    const now = Date.now();
    const recentRequests = this.metrics.requestTimestamps.filter(
      timestamp => now - timestamp < 60000 // 过去1分钟
    );
    return recentRequests.length / 60; // 每秒请求数
  }
  
  getMetrics(): any {
    return {
      ...this.metrics,
      currentRequestRate: this.getCurrentRequestRate(),
      successRate: this.metrics.totalRequests > 0 
        ? (this.metrics.successfulRequests / this.metrics.totalRequests * 100).toFixed(2) + '%'
        : '0%',
      cacheHitRate: this.metrics.totalRequests > 0
        ? (this.metrics.cachedResponses / this.metrics.totalRequests * 100).toFixed(2) + '%'
        : '0%'
    };
  }
  
  reset(): void {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      cachedResponses: 0,
      averageResponseTime: 0,
      totalResponseTime: 0,
      maxResponseTime: 0,
      minResponseTime: Number.MAX_VALUE,
      requestTimestamps: []
    };
  }
}

/**
 * 优化的API客户端
 * 整合缓存、限流、请求合并等高级功能
 */
export class OptimizedApiClient {
  private cache: LRUCache<string, OptimizeTextResponse>;
  private tokenBucket: TokenBucket;
  private requestQueue: PriorityQueue<ApiRequest>;
  private performanceMonitor: PerformanceMonitor;
  private processingQueue: boolean = false;
  private similarityThreshold: number = 0.85;
  
  constructor(options: {
    cacheSize?: number;
    tokensPerSecond?: number;
    maxTokens?: number;
    similarityThreshold?: number;
  } = {}) {
    // 初始化LRU缓存
    this.cache = new LRUCache(options.cacheSize || 50);
    
    // 初始化令牌桶
    this.tokenBucket = new TokenBucket(
      options.maxTokens || 10,
      options.tokensPerSecond || 5
    );
    
    // 初始化优先级队列
    this.requestQueue = new PriorityQueue();
    
    // 获取性能监控器实例
    this.performanceMonitor = PerformanceMonitor.getInstance();
    
    // 设置相似度阈值
    if (options.similarityThreshold) {
      this.similarityThreshold = options.similarityThreshold;
    }
    
    // 启动请求处理器
    this.startRequestProcessor();
  }
  
  /**
   * 优化文本
   * 公开的主要方法，处理文本优化请求
   */
  public async optimizeText(
    text: string,
    isStrictMode: boolean,
    apiSettings: ApiSettings,
    priority: number = 1
  ): Promise<OptimizeTextResponse> {
    // 记录请求开始
    const requestStartTime = this.performanceMonitor.recordRequest();
    
    // 生成请求ID
    const requestId = this.generateRequestId();
    
    // 检查缓存
    const cacheKey = this.generateCacheKey(text, isStrictMode);
    const cachedResponse = this.cache.get(cacheKey);
    
    if (cachedResponse) {
      console.log(`[API客户端] 使用缓存响应，请求ID: ${requestId}`);
      
      // 记录缓存命中
      this.performanceMonitor.recordResponse(
        requestStartTime,
        true,
        Date.now() - requestStartTime
      );
      
      return cachedResponse;
    }
    
    // 检查相似文本缓存
    const similarCacheKey = this.findSimilarTextCacheKey(text, isStrictMode);
    if (similarCacheKey) {
      const similarResponse = this.cache.get(similarCacheKey);
      if (similarResponse) {
        console.log(`[API客户端] 使用相似文本缓存响应，请求ID: ${requestId}`);
        
        // 记录缓存命中（相似文本）
        this.performanceMonitor.recordResponse(
          requestStartTime,
          true,
          Date.now() - requestStartTime
        );
        
        return similarResponse;
      }
    }
    
    // 创建请求对象
    const request: ApiRequest = {
      id: requestId,
      text,
      isStrictMode,
      apiSettings,
      priority,
      timestamp: Date.now()
    };
    
    // 返回Promise，在请求处理完成后解析
    return new Promise((resolve, reject) => {
      request.resolve = (response) => {
        // 记录响应完成
        this.performanceMonitor.recordResponse(
          requestStartTime,
          response.success,
          Date.now() - requestStartTime
        );
        
        resolve(response);
      };
      request.reject = reject;
      
      // 将请求添加到队列
      this.requestQueue.enqueue(request);
      console.log(`[API客户端] 请求已加入队列，ID: ${requestId}, 优先级: ${priority}`);
      
      // 尝试立即处理队列
      this.processQueue();
    });
  }
  
  /**
   * 启动请求处理器
   * 定期检查队列并处理请求
   */
  private startRequestProcessor() {
    // 每200ms检查一次队列
    setInterval(() => this.processQueue(), 200);
  }
  
  /**
   * 处理请求队列
   * 根据令牌可用性和优先级处理请求
   */
  private async processQueue() {
    // 如果已经在处理队列或队列为空，直接返回
    if (this.processingQueue || this.requestQueue.isEmpty()) {
      return;
    }
    
    // 检查是否有可用令牌
    if (!this.tokenBucket.consumeToken()) {
      console.log('[API客户端] 无可用令牌，等待下次处理');
      return;
    }
    
    // 标记为正在处理
    this.processingQueue = true;
    
    try {
      // 获取下一个请求
      const request = this.requestQueue.dequeue();
      if (!request) {
        this.processingQueue = false;
        return;
      }
      
      console.log(`[API客户端] 处理请求，ID: ${request.id}`);
      
      try {
        // 执行API调用
        const response = await this.executeApiCall(request);
        
        // 缓存响应
        const cacheKey = this.generateCacheKey(request.text, request.isStrictMode);
        this.cache.set(cacheKey, response);
        
        console.log(`[API客户端] 请求成功，ID: ${request.id}, 已缓存`);
        
        // 解析Promise
        if (request.resolve) {
          request.resolve(response);
        }
      } catch (error) {
        console.error(`[API客户端] 处理请求 ${request.id} 失败:`, error);
        
        // 如果是可重试的错误，重新入队
        if (this.isRetryableError(error) && (request.retryCount || 0) < 3) {
          request.retryCount = (request.retryCount || 0) + 1;
          request.priority = 0; // 提高重试请求的优先级
          this.requestQueue.enqueue(request);
          console.log(`[API客户端] 请求 ${request.id} 已重新入队，重试次数: ${request.retryCount}`);
        } else {
          // 达到最大重试次数或不可重试的错误
          const errorResponse = this.createErrorResponse(error);
          
          if (request.resolve) {
            request.resolve(errorResponse);
          }
        }
      }
    } finally {
      // 完成处理
      this.processingQueue = false;
      
      // 如果队列不为空且有可用令牌，继续处理
      if (!this.requestQueue.isEmpty() && this.tokenBucket.getTokens() >= 1) {
        this.processQueue();
      }
    }
  }
  
  /**
   * 执行API调用
   * 处理实际的网络请求和响应
   */
  private async executeApiCall(request: ApiRequest): Promise<OptimizeTextResponse> {
    const { text, isStrictMode, apiSettings, id } = request;
    
    // 检查API配置
    if (!apiSettings.apiEndpoint || !apiSettings.apiKey || apiSettings.apiEndpoint.trim() === '') {
      console.log(`[API客户端] API未配置，使用模拟响应，请求ID: ${id}`);
      return await mockApiResponse(text);
    }
    
    // 准备请求数据
    const requestData = {
      text,
      isStrictMode,
      requestId: id,
      optimizationDimensions: {
        grammarCorrection: true,      // 语法校正
        punctuationNormalization: true, // 标点规范
        mixedTextFormatting: true,    // 中英混排规则
        styleRefinement: true,        // 语言风格
        toneControl: true             // 语调控制
      },
      optimizationPrinciples: {
        maintainSemantics: true,      // 保持与原文语义一致
        preserveLength: true,         // 字数相当（不大幅增减）
        enhanceClarity: true,         // 提升表达清晰度
        increaseProfessionalism: true // 提升专业性
      }
    };
    
    // 创建AbortController用于超时控制
    const controller = new AbortController();
    const timeoutMs = 30000; // 30秒超时
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
      console.log(`[API客户端] 发送API请求，ID: ${id}`);
      
      const response = await fetch(apiSettings.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiSettings.apiKey}`,
          'X-Request-ID': id,
          'X-Client-Version': '1.0.0'
        },
        body: JSON.stringify(requestData),
        signal: controller.signal
      });
      
      // 清除超时
      clearTimeout(timeoutId);
      
      // 处理响应
      if (!response.ok) {
        throw new Error(`API错误: ${response.status}`);
      }
      
      // 验证响应内容类型
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('API返回了非JSON格式数据');
      }
      
      // 解析响应数据
      const data = await response.json();
      
      // 验证必要字段
      if (!data.optimizedText) {
        throw new Error('API响应缺少必要字段');
      }
      
      // 构建响应对象
      return this.buildSuccessResponse(text, data.optimizedText);
    } catch (error) {
      // 清除超时
      clearTimeout(timeoutId);
      
      // 如果是超时错误
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('请求超时，请稍后重试');
      }
      
      // 重新抛出错误
      throw error;
    }
  }
  
  /**
   * 构建成功响应
   * 计算并添加统计信息
   */
  private buildSuccessResponse(originalText: string, optimizedText: string): OptimizeTextResponse {
    // 计算统计信息
    const originalLength = originalText.length;
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
    
    const originalChineseChars = countChineseChars(originalText);
    const optimizedChineseChars = countChineseChars(optimizedText);
    const originalEnglishWords = countEnglishWords(originalText);
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
  
  /**
   * 创建错误响应
   */
  private createErrorResponse(error: any): OptimizeTextResponse {
    const errorInfo = ErrorHandler.getErrorInfo(error);
    
    return {
      success: false,
      error: errorInfo.message,
      details: errorInfo.details
    };
  }
  
  /**
   * 生成请求ID
   */
  private generateRequestId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
  
  /**
   * 生成缓存键
   */
  private generateCacheKey(text: string, isStrictMode: boolean): string {
    return `${isStrictMode ? 'strict:' : 'basic:'}${text}`;
  }
  
  /**
   * 查找相似文本的缓存键
   */
  private findSimilarTextCacheKey(text: string, isStrictMode: boolean): string | null {
    const prefix = isStrictMode ? 'strict:' : 'basic:';
    
    // 将迭代器转换为数组
    const keys = Array.from(this.cache.keys());
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
  
  /**
   * 计算文本相似度
   * 使用简化的算法，实际项目中应使用更精确的算法
   */
  private calculateSimilarity(text1: string, text2: string): number {
    if (text1 === text2) return 1.0;
    if (!text1 || !text2) return 0.0;
    
    // 简单的长度比例作为相似度估算
    const maxLength = Math.max(text1.length, text2.length);
    const minLength = Math.min(text1.length, text2.length);
    
    // 基础相似度
    let similarity = minLength / maxLength;
    
    // 检查开头和结尾是否相似
    const prefixLength = Math.min(50, Math.floor(minLength / 2));
    if (text1.substring(0, prefixLength) === text2.substring(0, prefixLength)) {
      similarity += 0.1; // 开头相似加分
    }
    
    // 限制最大值为1.0
    return Math.min(similarity, 1.0);
  }
  
  /**
   * 判断错误是否可重试
   */
  private isRetryableError(error: any): boolean {
    if (!(error instanceof Error)) return false;
    
    // 网络错误、超时错误和服务器错误可以重试
    return error.message.includes('network') || 
           error.message.includes('timeout') || 
           error.message.includes('500') || 
           error.message.includes('503');
  }
  
  /**
   * 获取性能指标
   */
  public getPerformanceMetrics(): any {
    return this.performanceMonitor.getMetrics();
  }
  
  /**
   * 获取缓存统计
   */
  public getCacheStats(): any {
    return {
      size: this.cache.size(),
      capacity: 50, // 默认容量
      hitRate: this.performanceMonitor.getMetrics().cacheHitRate
    };
  }
  
  /**
   * 清除缓存
   */
  public clearCache(): void {
    this.cache.clear();
    console.log('[API客户端] 缓存已清除');
  }
}

// 导出默认实例
export default OptimizedApiClient;
