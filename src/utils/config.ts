// src/utils/config.ts
import { browser } from "webextension-polyfill-ts";

export interface ApiConfig {
  apiKey: string;
  baseUrl: string;
  provider: string;
}

const DEFAULT_CONFIG: ApiConfig = {
  apiKey: '',
  baseUrl: 'https://api.example.com', // 替换为你的实际API地址
  provider: 'default'
};

// 从存储中获取API配置
export async function getApiConfig(): Promise<ApiConfig> {
  try {
    const result = await browser.storage.sync.get(['apiConfig']);
    return result.apiConfig || DEFAULT_CONFIG;
  } catch (error) {
    console.error('获取API配置失败:', error);
    return DEFAULT_CONFIG;
  }
}

// 保存API配置到存储
export async function saveApiConfig(config: ApiConfig): Promise<void> {
  try {
    await browser.storage.sync.set({ apiConfig: config });
  } catch (error) {
    console.error('保存API配置失败:', error);
    throw error;
  }
}

// 获取文案优化设置
export async function getOptimizeSettings() {
  try {
    const result = await browser.storage.sync.get(['optimizeSettings']);
    return result.optimizeSettings || {
      defaultMode: 'optimize',
      defaultScene: 'console',
      strictBoundary: true
    };
  } catch (error) {
    console.error('获取文案优化设置失败:', error);
    return {
      defaultMode: 'optimize',
      defaultScene: 'console',
      strictBoundary: true
    };
  }
}

// 保存文案优化设置
export async function saveOptimizeSettings(settings: {
  defaultMode: string;
  defaultScene: string;
  strictBoundary: boolean;
}): Promise<void> {
  try {
    await browser.storage.sync.set({ optimizeSettings: settings });
  } catch (error) {
    console.error('保存文案优化设置失败:', error);
    throw error;
  }
}
