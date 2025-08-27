/**
 * API 统一接口合约
 * 提供统一的 API 调用接口，支持文本优化、连接测试等功能
 * 
 * @version 1.0.0
 * @author AI Assistant
 */

/**
 * 文本优化结果类型
 * @typedef {Object} OptimizeResult
 * @property {string} text - 优化后的文本
 * @property {string} [reason] - 优化原因或说明（可选）
 */

/**
 * 优化回调函数类型
 * @callback OptimizeCallback
 * @param {OptimizeResult} result - 优化结果
 */

/**
 * 优化文本
 * 将输入文本发送到 API 进行优化处理
 * 
 * @param {string} inputText - 需要优化的文本
 * @returns {Promise<OptimizeResult>} 优化结果
 */
async function optimizeText(inputText) {
  console.log('调用 optimizeText API', inputText.substring(0, 50) + (inputText.length > 50 ? '...' : ''));
  
  // Mock 实现：返回原文本加上 [MOCK] 标记
  return {
    text: inputText + ' [MOCK]',
    reason: '这是 Mock 实现的优化结果'
  };
}

/**
 * 测试 API 连接
 * 验证与 API 服务器的连接是否正常
 * 
 * @returns {Promise<boolean>} 连接是否成功
 */
async function ping() {
  console.log('测试 API 连接');
  
  // Mock 实现：始终返回成功
  return true;
}

/**
 * 订阅优化事件
 * 注册回调函数，在文本优化完成时触发
 * 
 * @param {OptimizeCallback} cb - 回调函数
 * @returns {Function} 取消订阅的函数
 */
function onOptimize(cb) {
  console.log('注册优化回调函数');
  
  // 存储回调函数（实际实现中会有一个回调函数数组）
  const callbackId = Date.now();
  
  // 返回取消订阅的函数
  return function unsubscribe() {
    console.log('取消订阅优化回调', callbackId);
    // 实际实现中会从回调数组中移除该回调
  };
}

// 导出 API 接口
module.exports = {
  optimizeText,
  ping,
  onOptimize
};
