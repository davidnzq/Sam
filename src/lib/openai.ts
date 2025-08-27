// src/lib/openai.ts
import OpenAI from 'openai';
import { getApiConfig } from '../utils/config';

// 创建一个默认的OpenAI客户端实例
let openaiInstance: OpenAI;

// 初始化OpenAI客户端
async function initOpenAI() {
  try {
    const config = await getApiConfig();
    
    openaiInstance = new OpenAI({
      apiKey: config.apiKey || process.env.OPENAI_API_KEY || '',
      baseURL: config.baseUrl || undefined,
      dangerouslyAllowBrowser: true // 允许在浏览器环境中使用
    });
    
    return openaiInstance;
  } catch (error) {
    console.error('初始化OpenAI客户端失败:', error);
    
    // 创建一个基本实例，可能会因为缺少API密钥而失败
    openaiInstance = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
      dangerouslyAllowBrowser: true
    });
    
    return openaiInstance;
  }
}

// 获取或初始化OpenAI客户端
export async function getOpenAI() {
  if (!openaiInstance) {
    return await initOpenAI();
  }
  return openaiInstance;
}

// 导出一个预初始化的实例，用于简单导入
// 注意：首次使用时可能没有正确的配置，应该先调用getOpenAI()
export const openai = new OpenAI({
  apiKey: 'dummy-key', // 将在实际使用前被替换
  dangerouslyAllowBrowser: true
});
