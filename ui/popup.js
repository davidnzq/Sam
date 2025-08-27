/**
 * AI 文本优化弹窗组件
 * 提供文本输入、优化处理和结果展示功能
 * 
 * @version 1.1.0
 */

// 导入 API 接口
import { optimizeText } from '../api-contract.js';

/**
 * 获取统一的类名前缀
 * @returns {string} 类名前缀
 */
function getClassPrefix() {
  // 使用统一的类名前缀，不再根据域名区分
  return 'ai-';
}

/**
 * 创建弹窗元素
 * @returns {HTMLElement} 弹窗DOM元素
 */
function createPopupElement() {
  const prefix = getClassPrefix();
  const popup = document.createElement('div');
  popup.className = `${prefix}popup`;
  popup.id = 'ai-optimization-popup';
  
  popup.innerHTML = `
    <div class="${prefix}popup-header">
      <h3 class="${prefix}popup-title">AI 文本优化</h3>
      <button class="${prefix}popup-close" id="ai-popup-close">&times;</button>
    </div>
    
    <div class="${prefix}popup-content">
      <div class="${prefix}input-group">
        <label class="${prefix}input-label" for="ai-input-text">输入需要优化的文本：</label>
        <textarea class="${prefix}input-field" id="ai-input-text" rows="4" placeholder="请输入需要优化的文本..."></textarea>
      </div>
      
      <div style="display: flex; gap: 10px;">
        <button class="${prefix}button" id="ai-optimize-button">优化文本</button>
        <button class="${prefix}button-cancel" id="ai-cancel-button">取消</button>
      </div>
    </div>
    
    <div class="${prefix}result-container" id="ai-result-container">
      <!-- 结果将在此处动态显示 -->
    </div>
  `;
  
  return popup;
}

/**
 * 显示加载状态
 * @param {HTMLElement} container - 结果容器元素
 */
function showLoadingState(container) {
  const prefix = getClassPrefix();
  container.innerHTML = `
    <div class="${prefix}loading-state">
      <div class="${prefix}spinner"></div>
      <p class="${prefix}loading-text">正在优化文本，请稍候...</p>
    </div>
  `;
}

/**
 * 显示空状态
 * @param {HTMLElement} container - 结果容器元素
 */
function showEmptyState(container) {
  const prefix = getClassPrefix();
  container.innerHTML = `
    <div class="${prefix}empty-state">
      <div class="${prefix}empty-icon">📝</div>
      <p class="${prefix}empty-text">请输入文本并点击"优化文本"按钮</p>
    </div>
  `;
}

/**
 * 显示错误状态
 * @param {HTMLElement} container - 结果容器元素
 * @param {string} message - 错误信息
 * @param {Function} retryCallback - 重试回调函数
 */
function showErrorState(container, message, retryCallback) {
  const prefix = getClassPrefix();
  container.innerHTML = `
    <div class="${prefix}error-state">
      <div class="${prefix}error-header">
        <span class="${prefix}error-icon">⚠️</span>
        <h4 class="${prefix}error-title">优化失败</h4>
      </div>
      <p class="${prefix}error-message">${message || '发生未知错误，请稍后重试'}</p>
      <button class="${prefix}error-retry" id="ai-error-retry">重试</button>
    </div>
  `;
  
  const retryButton = container.querySelector('#ai-error-retry');
  if (retryButton && typeof retryCallback === 'function') {
    retryButton.addEventListener('click', retryCallback);
  }
}

/**
 * 显示成功结果
 * @param {HTMLElement} container - 结果容器元素
 * @param {string} result - 优化后的文本
 */
function showSuccessResult(container, result) {
  const prefix = getClassPrefix();
  container.innerHTML = `
    <div class="${prefix}result-success">
      <p class="${prefix}result-text">${result}</p>
      <div class="${prefix}result-actions">
        <button class="${prefix}result-copy" id="ai-result-copy">复制结果</button>
      </div>
    </div>
  `;
  
  const copyButton = container.querySelector('#ai-result-copy');
  if (copyButton) {
    copyButton.addEventListener('click', () => {
      navigator.clipboard.writeText(result)
        .then(() => {
          copyButton.textContent = '已复制';
          setTimeout(() => {
            copyButton.textContent = '复制结果';
          }, 2000);
        })
        .catch(err => {
          console.error('复制失败:', err);
          copyButton.textContent = '复制失败';
          setTimeout(() => {
            copyButton.textContent = '复制结果';
          }, 2000);
        });
    });
  }
}

/**
 * 初始化弹窗
 * @returns {HTMLElement} 弹窗DOM元素
 */
function initPopup() {
  // 创建弹窗元素
  const popup = createPopupElement();
  document.body.appendChild(popup);
  
  // 获取元素引用
  const closeButton = popup.querySelector('#ai-popup-close');
  const optimizeButton = popup.querySelector('#ai-optimize-button');
  const cancelButton = popup.querySelector('#ai-cancel-button');
  const inputText = popup.querySelector('#ai-input-text');
  const resultContainer = popup.querySelector('#ai-result-container');
  
  // 初始显示空状态
  showEmptyState(resultContainer);
  
  // 关闭按钮事件
  closeButton.addEventListener('click', () => {
    document.body.removeChild(popup);
  });
  
  // 取消按钮事件
  cancelButton.addEventListener('click', () => {
    document.body.removeChild(popup);
  });
  
  // 优化按钮事件
  optimizeButton.addEventListener('click', async () => {
    const text = inputText.value.trim();
    
    if (!text) {
      showEmptyState(resultContainer);
      return;
    }
    
    // 显示加载状态
    showLoadingState(resultContainer);
    optimizeButton.disabled = true;
    
    try {
      // 调用优化API
      const result = await optimizeText(text);
      
      if (result && result.text) {
        // 显示成功结果
        showSuccessResult(resultContainer, result.text);
      } else {
        // 显示错误状态
        showErrorState(resultContainer, '优化结果无效', () => optimizeButton.click());
      }
    } catch (error) {
      // 显示错误状态
      showErrorState(resultContainer, error.message || '优化请求失败', () => optimizeButton.click());
    } finally {
      // 恢复按钮状态
      optimizeButton.disabled = false;
    }
  });
  
  return popup;
}

/**
 * 打开优化弹窗
 * @param {string} [initialText=''] - 初始文本
 */
export function openOptimizationPopup(initialText = '') {
  const popup = initPopup();
  
  // 如果提供了初始文本，则设置到输入框
  if (initialText) {
    const inputText = popup.querySelector('#ai-input-text');
    if (inputText) {
      inputText.value = initialText;
    }
  }
}

/**
 * 关闭优化弹窗
 */
export function closeOptimizationPopup() {
  const popup = document.getElementById('ai-optimization-popup');
  if (popup) {
    document.body.removeChild(popup);
  }
}

/**
 * 检测当前环境
 * @returns {Object} 环境信息
 */
export function detectEnvironment() {
  const hostname = window.location.hostname;
  
  // 仍然检测环境，但不再影响样式前缀
  let environment = 'unknown';
  if (hostname.includes('longportapp.com')) {
    environment = 'longport';
  } else if (hostname.includes('notion.so')) {
    environment = 'notion';
  }
  
  return {
    environment,
    hostname,
    // 始终返回统一的前缀
    prefix: 'ai-'
  };
}

// 导出模块
export default {
  openOptimizationPopup,
  closeOptimizationPopup,
  detectEnvironment
};