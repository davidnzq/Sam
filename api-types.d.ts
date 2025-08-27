/**
 * API 类型定义
 * 为 API 接口提供 TypeScript 类型定义
 * 
 * @version 1.0.0
 * @author AI Assistant
 */

/**
 * 文本优化结果
 * 包含优化后的文本和可选的优化原因
 */
export interface OptimizeResult {
  /**
   * 优化后的文本
   */
  text: string;
  
  /**
   * 优化原因或说明（可选）
   */
  reason?: string;
}

/**
 * 优化选项
 * 配置文本优化的参数
 */
export interface OptimizeOptions {
  /**
   * 网站类型，用于针对特定场景优化
   * - longport: 金融投资相关
   * - notion: 文档协作平台
   * - general: 通用场景
   */
  siteType?: 'longport' | 'notion' | 'general';
  
  /**
   * 优化类型
   * - professional: 专业化优化
   * - grammar: 语法优化
   * - clarity: 清晰度优化
   */
  optimizationType?: 'professional' | 'grammar' | 'clarity';
  
  /**
   * 语言
   */
  language?: 'zh-CN' | 'en-US';
}

/**
 * 优化回调函数
 * 在文本优化完成时触发
 */
export type OptimizeCallback = (result: OptimizeResult) => void;

/**
 * API 接口
 * 提供文本优化、连接测试等功能
 */
export interface ApiContract {
  /**
   * 优化文本
   * 将输入文本发送到 API 进行优化处理
   * 
   * @param inputText - 需要优化的文本
   * @param options - 优化选项（可选）
   * @returns 优化结果
   */
  optimizeText(inputText: string, options?: OptimizeOptions): Promise<OptimizeResult>;
  
  /**
   * 测试 API 连接
   * 验证与 API 服务器的连接是否正常
   * 
   * @returns 连接是否成功
   */
  ping(): Promise<boolean>;
  
  /**
   * 订阅优化事件
   * 注册回调函数，在文本优化完成时触发
   * 
   * @param cb - 回调函数
   * @returns 取消订阅的函数
   */
  onOptimize(cb: OptimizeCallback): () => void;
}
