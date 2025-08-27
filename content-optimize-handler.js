// 文案优化处理器 - 内容脚本部分

// 监听来自后台脚本的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 显示优化器
  if (message.action === 'showOptimizer') {
    showOptimizer();
    return true;
  }
  
  // 隐藏优化器
  if (message.action === 'hideOptimizer') {
    hideOptimizer();
    return true;
  }
  
  // 优化选中文本
  if (message.action === 'optimizeSelection') {
    optimizeSelection();
    return true;
  }
  
  // 优化指定文本
  if (message.action === 'optimizeText' && message.text) {
    optimizeText(message.text);
    return true;
  }
});

// 显示优化器
function showOptimizer() {
  // 通过事件通知content-optimize.js显示优化器
  const event = new CustomEvent('showOptimizer');
  document.dispatchEvent(event);
}

// 隐藏优化器
function hideOptimizer() {
  // 通过事件通知content-optimize.js隐藏优化器
  const event = new CustomEvent('hideOptimizer');
  document.dispatchEvent(event);
}

// 优化选中文本
function optimizeSelection() {
  // 获取选中的文本
  const selection = window.getSelection();
  const text = selection ? selection.toString().trim() : '';
  
  if (!text) {
    showMessage('请先选择要优化的文本', 'error');
    return;
  }
  
  // 优化选中的文本
  optimizeText(text);
}

// 优化指定文本
function optimizeText(text) {
  // 通过事件通知content-optimize.js优化文本
  const event = new CustomEvent('optimizeText', { detail: { text } });
  document.dispatchEvent(event);
}

// 显示消息
function showMessage(message, type) {
  const messageEl = document.createElement('div');
  messageEl.className = `optimizer-message optimizer-message-${type}`;
  messageEl.textContent = message;
  messageEl.style.position = 'fixed';
  messageEl.style.top = '20px';
  messageEl.style.right = '20px';
  messageEl.style.padding = '12px 20px';
  messageEl.style.borderRadius = '6px';
  messageEl.style.color = 'white';
  messageEl.style.fontWeight = '500';
  messageEl.style.zIndex = '999999';
  messageEl.style.animation = 'slideIn 0.3s ease';
  
  if (type === 'success') {
    messageEl.style.background = '#4caf50';
  } else {
    messageEl.style.background = '#f44336';
  }
  
  document.body.appendChild(messageEl);
  
  setTimeout(() => {
    messageEl.remove();
  }, 3000);
}

// 添加事件监听器，处理来自content-optimize.js的事件
document.addEventListener('DOMContentLoaded', () => {
  // 添加键盘快捷键
  document.addEventListener('keydown', (e) => {
    // Alt+O: 优化选中文本
    if (e.altKey && e.key === 'o') {
      e.preventDefault();
      optimizeSelection();
    }
  });
});
