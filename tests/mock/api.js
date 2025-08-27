// tests/mock/api.js
// API模块的CommonJS版本，用于测试

/**
 * 优化文案的API接口
 * @param {object} options 请求选项
 * @returns {Promise<object>} API响应
 */
async function optimize({ 
  text, 
  mode = 'optimize',
  scene = 'console',
  strict = true
}) {
  try {
    console.log(`模拟API调用: optimize(${scene}, ${mode}, strict=${strict})`);
    console.log(`输入文本: ${text.substring(0, 30)}${text.length > 30 ? '...' : ''}`);
    
    // 模拟API响应
    return {
      rewritten: text.replace(/,/g, "，").replace(/\./g, "。"),
      changes: [
        {
          type: "grammar",
          before: ",",
          after: "，",
          reason: "使用中文全角标点"
        }
      ],
      policy_hits: [
        {
          rule: "CN-PUNC",
          note: "建议使用中文全角逗号",
          severity: "warn"
        }
      ],
      confidence: 0.8,
      meta: {
        scene,
        policy_version: "1.0"
      }
    };
  } catch (error) {
    console.error('文案优化API调用失败:', error);
    throw error;
  }
}

/**
 * 获取可用场景列表
 * @returns {Promise<object>} 场景列表
 */
async function getScenes() {
  try {
    // 模拟API响应
    return {
      scenes: ['console', 'marketing', 'notification']
    };
  } catch (error) {
    console.error('获取场景列表失败:', error);
    return { scenes: ['console', 'marketing', 'notification'] };
  }
}

module.exports = { optimize, getScenes };
