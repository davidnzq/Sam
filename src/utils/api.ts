// src/utils/api.ts
import { getApiConfig } from './config';

// 优化文案的API接口
export async function optimize({ 
  text, 
  mode = 'optimize',
  scene = 'console',
  strict = true
}: { 
  text: string; 
  mode?: 'proofread' | 'optimize';
  scene?: 'console' | 'marketing' | 'notification';
  strict?: boolean;
}) {
  try {
    const config = await getApiConfig();
    const apiUrl = `${config.baseUrl}/v1/optimize`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({ text, mode, scene, strict })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API请求失败: ${response.status} ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('文案优化API调用失败:', error);
    throw error;
  }
}

// 获取可用场景列表
export async function getScenes() {
  try {
    const config = await getApiConfig();
    const apiUrl = `${config.baseUrl}/v1/scenes`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`获取场景列表失败: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('获取场景列表失败:', error);
    return { scenes: ['console', 'marketing', 'notification'] }; // 默认场景
  }
}
