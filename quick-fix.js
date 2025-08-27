// 快速修复脚本 - 解决 Notion AI 助手的常见问题
console.log('Notion AI 助手快速修复脚本已加载');

// 检查并修复内容脚本加载问题
function checkAndFixContentScript() {
  console.log('检查内容脚本状态...');
  
  // 检查是否已经加载
  if (window.notionAIHelperLoaded) {
    console.log('内容脚本已加载，无需修复');
    return;
  }
  
  console.log('内容脚本未加载，尝试修复...');
  
  // 手动标记为已加载
  window.notionAIHelperLoaded = true;
  
  // 重新初始化功能
  initializeAIFeatures();
}

// 初始化 AI 功能
function initializeAIFeatures() {
  console.log('初始化 AI 功能...');
  
  // 创建全局变量
  window.aiPopup = null;
  window.currentSelection = null;
  
  // 添加消息监听器
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log('收到消息:', request);
      
      if (request.action === "showAIPopup") {
        console.log('显示 AI 弹窗，选中文本:', request.selectedText);
        showAIPopup(request.selectedText);
        sendResponse({ success: true });
        return true;
      }
      
      if (request.action === "ping") {
        sendResponse({ success: true, message: "内容脚本已修复并运行" });
        return false;
      }
      
      return false;
    });
    
    console.log('消息监听器已设置');
  } else {
    console.error('Chrome runtime 不可用');
  }
}

// 显示 AI 弹窗（修复版本）
function showAIPopup(selectedText) {
  console.log('开始显示 AI 弹窗');
  
  // 移除已存在的弹窗
  if (window.aiPopup) {
    window.aiPopup.remove();
  }

  window.currentSelection = selectedText;
  
  // 创建弹窗容器
  window.aiPopup = document.createElement('div');
  window.aiPopup.className = 'notion-ai-popup';
  window.aiPopup.innerHTML = `
    <div class="popup-header">
      <h3>AI 辅助协作</h3>
      <button class="close-btn" id="closeBtn">×</button>
    </div>
    <div class="popup-content">
      <div class="original-text">
        <h4>原文：</h4>
        <p>${escapeHtml(selectedText)}</p>
      </div>
      <div class="ai-result">
        <h4>AI 优化结果：</h4>
        <div class="loading">正在生成优化内容...</div>
        <div class="result-text" style="display: none;"></div>
      </div>
    </div>
    <div class="popup-actions">
      <button class="btn btn-primary" id="replaceBtn" disabled>覆盖原文</button>
      <button class="btn btn-secondary" id="retryBtn" disabled>再试一下</button>
      <button class="btn btn-cancel" id="cancelBtn">取消</button>
    </div>
  `;

  // 添加样式
  addPopupStyles();

  // 添加到页面
  document.body.appendChild(window.aiPopup);
  console.log('弹窗已添加到页面');

  // 定位弹窗
  positionPopup();

  // 绑定事件
  bindEvents();

  // 调用 AI API
  callAI(selectedText);
}

// 添加弹窗样式
function addPopupStyles() {
  if (document.getElementById('notion-ai-fix-styles')) {
    return; // 样式已存在
  }
  
  const style = document.createElement('style');
  style.id = 'notion-ai-fix-styles';
  style.textContent = `
    .notion-ai-popup {
      position: fixed;
      width: 500px;
      max-width: 90vw;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      border: 1px solid #e5e7eb;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .popup-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px 16px;
      border-bottom: 1px solid #f3f4f6;
    }
    
    .popup-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #111827;
    }
    
    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      color: #6b7280;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: all 0.2s;
    }
    
    .close-btn:hover {
      background: #f3f4f6;
      color: #374151;
    }
    
    .popup-content {
      padding: 20px 24px;
    }
    
    .original-text, .ai-result {
      margin-bottom: 20px;
    }
    
    .original-text h4, .ai-result h4 {
      margin: 0 0 8px 0;
      font-size: 14px;
      font-weight: 600;
      color: #374151;
    }
    
    .original-text p {
      margin: 0;
      padding: 12px;
      background: #f9fafb;
      border-radius: 6px;
      border-left: 3px solid #3b82f6;
      font-size: 14px;
      line-height: 1.5;
      color: #374151;
    }
    
    .ai-result .loading {
      padding: 12px;
      background: #f0f9ff;
      border-radius: 6px;
      border-left: 3px solid #0ea5e9;
      color: #0369a1;
      font-size: 14px;
    }
    
    .ai-result .result-text {
      padding: 12px;
      background: #f0fdf4;
      border-radius: 6px;
      border-left: 3px solid #22c55e;
      font-size: 14px;
      line-height: 1.5;
      color: #166534;
    }
    
    .popup-actions {
      display: flex;
      gap: 12px;
      padding: 16px 24px 20px;
      border-top: 1px solid #f3f4f6;
    }
    
    .btn {
      padding: 10px 16px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      flex: 1;
    }
    
    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .btn-primary {
      background: #3b82f6;
      color: white;
    }
    
    .btn-primary:hover:not(:disabled) {
      background: #2563eb;
    }
    
    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
    }
    
    .btn-secondary:hover:not(:disabled) {
      background: #e5e7eb;
    }
    
    .btn-cancel {
      background: #fef2f2;
      color: #dc2626;
    }
    
    .btn-cancel:hover:not(:disabled) {
      background: #fee2e2;
    }
  `;
  
  document.head.appendChild(style);
  console.log('弹窗样式已添加');
}

// 定位弹窗
function positionPopup() {
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    window.aiPopup.style.position = 'fixed';
    window.aiPopup.style.top = `${rect.bottom + window.scrollY + 10}px`;
    window.aiPopup.style.left = `${rect.left + window.scrollX}px`;
    window.aiPopup.style.zIndex = '10000';
    console.log('弹窗定位到选择范围:', rect);
  } else {
    window.aiPopup.style.position = 'fixed';
    window.aiPopup.style.top = '50%';
    window.aiPopup.style.left = '50%';
    window.aiPopup.style.transform = 'translate(-50%, -50%)';
    window.aiPopup.style.zIndex = '10000';
    console.log('弹窗定位到页面中心');
  }
}

// 绑定事件
function bindEvents() {
  console.log('绑定弹窗事件');
  
  const closeBtn = window.aiPopup.querySelector('#closeBtn');
  const replaceBtn = window.aiPopup.querySelector('#replaceBtn');
  const retryBtn = window.aiPopup.querySelector('#retryBtn');
  const cancelBtn = window.aiPopup.querySelector('#cancelBtn');

  closeBtn.addEventListener('click', () => {
    console.log('关闭弹窗');
    window.aiPopup.remove();
    window.aiPopup = null;
  });

  cancelBtn.addEventListener('click', () => {
    console.log('取消操作');
    window.aiPopup.remove();
    window.aiPopup = null;
  });

  replaceBtn.addEventListener('click', replaceOriginalText);
  retryBtn.addEventListener('click', retryAI);
}

// 调用 AI API
async function callAI(text) {
  console.log('开始调用 AI API，文本长度:', text.length);
  
  try {
    // 优先尝试公司内部 API
    console.log('尝试调用公司内部 API...');
    const response = await chrome.runtime.sendMessage({
      action: 'callAI',
      text: text,
      apiType: 'company'
    });

    console.log('公司 API 响应:', response);

    if (response.success) {
      showAIResult(response.data);
    } else {
      console.log('公司 API 失败，尝试 OpenAI...');
      const openaiResponse = await chrome.runtime.sendMessage({
        action: 'callAI',
        text: text,
        apiType: 'openai'
      });

      console.log('OpenAI API 响应:', openaiResponse);

      if (openaiResponse.success) {
        showAIResult(openaiResponse.data);
      } else {
        showError('AI 服务暂时不可用，请稍后重试');
      }
    }
  } catch (error) {
    console.error('AI 调用失败:', error);
    showError('AI 服务调用失败，请检查网络连接');
  }
}

// 显示 AI 结果
function showAIResult(result) {
  console.log('显示 AI 结果:', result);
  
  const loadingEl = window.aiPopup.querySelector('.loading');
  const resultEl = window.aiPopup.querySelector('.result-text');
  const replaceBtn = window.aiPopup.querySelector('#replaceBtn');
  const retryBtn = window.aiPopup.querySelector('#retryBtn');

  loadingEl.style.display = 'none';
  resultEl.innerHTML = `<p>${escapeHtml(result)}</p>`;
  resultEl.style.display = 'block';

  replaceBtn.disabled = false;
  retryBtn.disabled = false;
}

// 显示错误信息
function showError(message) {
  console.log('显示错误信息:', message);
  
  const loadingEl = window.aiPopup.querySelector('.loading');
  loadingEl.innerHTML = `<p class="error">${message}</p>`;
  loadingEl.style.display = 'block';
}

// 覆盖原文
function replaceOriginalText() {
  console.log('开始替换原文');
  
  try {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const resultText = window.aiPopup.querySelector('.result-text p').textContent;
      
      console.log('替换文本:', resultText);
      
      range.deleteContents();
      range.insertNode(document.createTextNode(resultText));
      
      selection.removeAllRanges();
      
      window.aiPopup.remove();
      window.aiPopup = null;
      
      console.log('文本替换完成');
    } else {
      console.warn('没有选择范围');
      alert('没有选择范围，无法替换文本');
    }
  } catch (error) {
    console.error('替换文本失败:', error);
    alert('替换文本失败，请手动操作');
  }
}

// 重试 AI
function retryAI() {
  console.log('重试 AI 调用');
  
  if (window.currentSelection) {
    const loadingEl = window.aiPopup.querySelector('.loading');
    const resultEl = window.aiPopup.querySelector('.result-text');
    const replaceBtn = window.aiPopup.querySelector('#replaceBtn');
    const retryBtn = window.aiPopup.querySelector('#retryBtn');

    loadingEl.innerHTML = '正在重新生成优化内容...';
    loadingEl.style.display = 'block';
    resultEl.style.display = 'none';
    replaceBtn.disabled = true;
    retryBtn.disabled = true;

    callAI(window.currentSelection);
  }
}

// HTML 转义
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 点击弹窗外部关闭弹窗
document.addEventListener('click', (event) => {
  if (window.aiPopup && !window.aiPopup.contains(event.target)) {
    console.log('点击弹窗外部，关闭弹窗');
    window.aiPopup.remove();
    window.aiPopup = null;
  }
});

// 自动运行修复
setTimeout(() => {
  checkAndFixContentScript();
}, 1000);

console.log('快速修复脚本加载完成，将在 1 秒后自动运行');
