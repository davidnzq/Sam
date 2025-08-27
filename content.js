// LongPort AI 助手内容脚本
console.log('LongPort AI 助手内容脚本已加载');

// 全局变量
let aiPopup = null;
let currentSelection = null;
let currentSiteType = null;
let originalText = null;
let isProcessing = false;
let processingStartTime = 0;

// 全局变量和初始化在文件末尾

// 显示优化结果
function showOptimizationResult(originalText, optimizedText, siteType) {
  console.log('显示优化结果');
  
  // 移除已存在的弹窗
  if (aiPopup) {
    aiPopup.remove();
  }
  
  // 创建弹窗容器
  aiPopup = document.createElement('div');
  aiPopup.className = 'ai-popup';
  aiPopup.tabIndex = "-1"; // 使弹窗可以接收键盘事件
  
  // 弹窗内容
  aiPopup.innerHTML = `
    <div class="ai-popup-header">
      <h3 class="ai-popup-title">LongPort AI 助手</h3>
      <button class="ai-popup-close">&times;</button>
    </div>
    <div class="ai-popup-content">
      <div class="ai-result-container">
        <div class="ai-result-success">
          <p class="ai-result-text">${optimizedText}</p>
          <div class="ai-result-actions">
            <button class="ai-result-cancel">取消</button>
            <button class="ai-button ai-replace-btn">替换</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // 添加到页面
  document.body.appendChild(aiPopup);
  console.log('优化结果弹窗已添加到页面');
  
  // 延迟设置弹窗位置，确保弹窗已经渲染
  setTimeout(() => {
    positionPopupRelativeToSelection(aiPopup);
  }, 0);
  
  // 添加拖拽功能
  addDragFunctionality(aiPopup);
  
  // 绑定按钮事件
  bindButtonEvents();
  
  // 添加键盘事件监听
  addKeyboardEventListeners(aiPopup);
  
  // 添加处理时间和字数变化信息
  const charDiff = optimizedText.length - originalText.length;
  const diffText = charDiff > 0 ? `+${charDiff} 字` : `${charDiff} 字`;
  
  // 在结果底部添加处理信息
  const infoEl = document.createElement('div');
  infoEl.className = 'ai-result-info';
  infoEl.innerHTML = `
    <small>快捷键优化 | 字数变化: ${diffText}</small>
  `;
  
  // 添加信息元素
  const resultEl = aiPopup.querySelector('.ai-result-success');
  resultEl.insertBefore(infoEl, resultEl.querySelector('.ai-result-actions'));
  
  // 保存优化记录到历史
  saveOptimizationHistory(originalText, optimizedText);
}

// 检测站点类型
function detectSiteType() {
  const url = window.location.href;
  
  if (url.includes('notion.so') || url.includes('notion.site') || url.includes('notion.com')) {
    return 'notion';
  } else if (url.includes('longportapp.com')) {
    return 'longport';
  } else {
    return 'general';
  }
}

// 绑定全局事件
function bindGlobalEvents() {
  // 处理点击事件，如果点击在弹窗外部则关闭弹窗
  document.addEventListener('click', (e) => {
    if (aiPopup && !aiPopup.contains(e.target)) {
      aiPopup.remove();
      aiPopup = null;
    }
  });
}

// 显示 AI 弹窗
function showAIPopup(selectedText, siteType, fromShortcut = false) {
  console.log('开始显示 AI 弹窗');
  
  // 移除已存在的弹窗
  if (aiPopup) {
    aiPopup.remove();
  }
  
  // 保存当前选中文本和站点类型
  currentSelection = selectedText;
  currentSiteType = siteType || detectSiteType();
  originalText = selectedText;
  
  // 创建弹窗容器
  aiPopup = document.createElement('div');
  aiPopup.className = 'ai-popup';
  aiPopup.tabIndex = "-1"; // 使弹窗可以接收键盘事件
  
  // 标记是否来自快捷键
  aiPopup.dataset.fromShortcut = fromShortcut || false;
  
  // 弹窗内容
  aiPopup.innerHTML = `
    <div class="ai-popup-header">
      <h3 class="ai-popup-title">LongPort AI 助手</h3>
      <button class="ai-popup-close">&times;</button>
    </div>
    <div class="ai-popup-content">
      <div class="ai-result-container">
        <div class="ai-loading-state">
          <div class="ai-spinner"></div>
          <div class="ai-loading-text">正在优化文案...</div>
        </div>
        <div class="ai-result-success" style="display: none;">
          <p class="ai-result-text"></p>
          <div class="ai-result-actions">
            <button class="ai-result-cancel">取消</button>
            <button class="ai-button ai-replace-btn">替换</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // 添加到页面
  document.body.appendChild(aiPopup);
  console.log('弹窗已添加到页面');
  
  // 延迟设置弹窗位置，确保弹窗已经渲染
  setTimeout(() => {
    positionPopupRelativeToSelection(aiPopup);
  }, 0);
  
  // 添加拖拽功能
  addDragFunctionality(aiPopup);
  
  // 绑定按钮事件
  bindButtonEvents();
  
  // 添加键盘事件监听
  addKeyboardEventListeners(aiPopup);
  
  // 开始 AI 优化
  startAIOptimization(selectedText);
}

// 添加拖拽功能
function addDragFunctionality(popup) {
  const header = popup.querySelector('.ai-popup-header');
  let isDragging = false;
  let offsetX, offsetY;
  
  header.addEventListener('mousedown', (e) => {
    // 只有点击在标题区域而不是关闭按钮时才启用拖拽
    if (e.target.classList.contains('ai-popup-close')) return;
    
    isDragging = true;
    offsetX = e.clientX - popup.getBoundingClientRect().left;
    offsetY = e.clientY - popup.getBoundingClientRect().top;
    
    // 添加临时样式
    popup.style.transition = 'none';
    document.body.style.userSelect = 'none';
  });
  
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;
    
    // 确保弹窗不会被拖出视口
    const maxX = window.innerWidth - popup.offsetWidth;
    const maxY = window.innerHeight - popup.offsetHeight;
    
    popup.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
    popup.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
  });
  
  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      // 恢复样式
      popup.style.transition = '';
      document.body.style.userSelect = '';
    }
  });
}

// 绑定按钮事件
function bindButtonEvents() {
  const closeBtn = aiPopup.querySelector('.ai-popup-close');
  const replaceBtn = aiPopup.querySelector('.ai-replace-btn');
  const cancelBtn = aiPopup.querySelector('.ai-result-cancel');
  
  closeBtn.addEventListener('click', () => {
    aiPopup.remove();
    aiPopup = null;
  });
  
  if (replaceBtn) {
    replaceBtn.addEventListener('click', () => {
      applyOptimizedText();
    });
  }
  
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      // 关闭弹窗
      aiPopup.remove();
      aiPopup = null;
    });
  }
}

// 开始 AI 优化
function startAIOptimization(text) {
  console.log('开始 AI 优化:', text);
  isProcessing = true;
  processingStartTime = Date.now();
  
  // 显示加载状态
  const loadingEl = aiPopup.querySelector('.ai-loading-state');
  const resultEl = aiPopup.querySelector('.ai-result-success');
  
  loadingEl.style.display = 'flex';
  resultEl.style.display = 'none';
  
  // 调用 AI
  callAI(text);
}

// 调用 AI
function callAI(text) {
  console.log('调用 AI 优化文本');
  
  // 调用公司 AI API
  callCompanyAI(text)
    .then(result => {
      console.log('AI 调用结果:', result);
      
      if (result.success) {
        showAIResult(result);
      } else {
        showAIError(result.error || '未知错误');
      }
    })
    .catch(error => {
      console.error('AI 调用失败:', error);
      showAIError(error.message || '未知错误');
    });
}

// 调用公司 AI API
function callCompanyAI(text) {
  return new Promise((resolve, reject) => {
    console.log('调用公司 AI API');
    
    chrome.runtime.sendMessage(
      { action: "callAI", text: text, siteType: currentSiteType },
      response => {
        if (chrome.runtime.lastError) {
          console.error('消息发送错误:', chrome.runtime.lastError);
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        
        console.log('收到 AI API 响应:', response);
        
        if (!response) {
          reject(new Error('未收到响应'));
          return;
        }
        
        resolve(response);
      }
    );
  });
}

// 显示 AI 结果
function showAIResult(result) {
  console.log('显示 AI 结果');
  isProcessing = false;
  
  // 计算处理时间
  const processingTime = Date.now() - processingStartTime;
  const processingTimeSeconds = (processingTime / 1000).toFixed(2);
  
  // 更新 UI
  const loadingEl = aiPopup.querySelector('.ai-loading-state');
  const resultEl = aiPopup.querySelector('.ai-result-success');
  const resultTextEl = aiPopup.querySelector('.ai-result-text');
  
  // 获取优化后的文本
  const optimizedText = result.companyAIText || result.text || result.optimizedText || (result.error ? `错误详情: ${result.error}` : '无优化结果');
  
  // 隐藏加载状态，显示结果
  loadingEl.style.display = 'none';
  resultEl.style.display = 'block';
  resultTextEl.textContent = optimizedText;
  
  // 添加处理时间和字数变化信息
  const charDiff = optimizedText.length - originalText.length;
  const diffText = charDiff > 0 ? `+${charDiff} 字` : `${charDiff} 字`;
  
  // 在结果底部添加处理信息
  const infoEl = document.createElement('div');
  infoEl.className = 'ai-result-info';
  infoEl.innerHTML = `
    <small>处理时间: ${processingTimeSeconds}秒 | 字数变化: ${diffText}</small>
  `;
  
  // 如果已经有信息元素，则替换，否则添加
  const existingInfoEl = resultEl.querySelector('.ai-result-info');
  if (existingInfoEl) {
    resultEl.replaceChild(infoEl, existingInfoEl);
  } else {
    resultEl.insertBefore(infoEl, resultEl.querySelector('.ai-result-actions'));
  }
  
  // 弹窗内容变化后，重新调整位置
  setTimeout(() => {
    positionPopupRelativeToSelection(aiPopup);
  }, 0);
  
  // 保存优化记录到历史
  saveOptimizationHistory(originalText, optimizedText);
}

// 显示 AI 错误
function showAIError(error) {
  console.error('AI 错误:', error);
  isProcessing = false;
  
  // 更新 UI
  const loadingEl = aiPopup.querySelector('.ai-loading-state');
  const resultEl = aiPopup.querySelector('.ai-result-success');
  
  // 隐藏加载状态
  loadingEl.style.display = 'none';
  resultEl.style.display = 'none';
  
  // 获取更友好的错误信息和解决方案
  const errorInfo = getErrorInfo(error);
  
  // 创建错误状态元素
  const errorEl = document.createElement('div');
  errorEl.className = 'ai-error-state';
  errorEl.innerHTML = `
    <div class="ai-error-header">
      <span class="ai-error-icon">⚠️</span>
      <h4 class="ai-error-title">${errorInfo.title}</h4>
    </div>
    <p class="ai-error-message">${errorInfo.message}</p>
    <div class="ai-error-solution">
      <p><strong>解决方案：</strong></p>
      <ul>
        ${errorInfo.solutions.map(solution => `<li>${solution}</li>`).join('')}
      </ul>
    </div>
    <button class="ai-error-retry">重试</button>
  `;
  
  // 添加错误元素到结果容器
  const resultContainer = aiPopup.querySelector('.ai-result-container');
  
  // 移除之前的错误元素（如果有）
  const oldErrorEl = resultContainer.querySelector('.ai-error-state');
  if (oldErrorEl) {
    resultContainer.removeChild(oldErrorEl);
  }
  
  resultContainer.appendChild(errorEl);
  
  // 绑定重试按钮事件
  const retryBtn = errorEl.querySelector('.ai-error-retry');
  retryBtn.addEventListener('click', () => {
    // 移除错误元素
    resultContainer.removeChild(errorEl);
    // 重新开始优化
    startAIOptimization(originalText);
  });
  
  // 弹窗内容变化后，重新调整位置
  setTimeout(() => {
    positionPopupRelativeToSelection(aiPopup);
  }, 0);
}

// 根据错误类型获取友好的错误信息
function getErrorInfo(error) {
  // 默认错误信息
  let errorInfo = {
    title: '优化失败',
    message: `处理过程中出现错误：${error}`,
    shortSuggestion: '请重试或联系技术支持',
    solutions: [
      '刷新页面后重试',
      '检查网络连接',
      '联系技术支持'
    ]
  };
  
  // 根据错误内容匹配特定错误类型
  if (typeof error === 'string') {
    // API 密钥相关错误
    if (error.includes('API 密钥') || error.includes('API Key') || error.includes('apiKey')) {
      errorInfo = {
        title: 'API 密钥错误',
        message: '无法验证 API 密钥或密钥已过期',
        shortSuggestion: '请检查 API 设置',
        solutions: [
          '前往扩展设置页检查 API 密钥',
          '确认 API 密钥未过期',
          '联系管理员获取新的 API 密钥'
        ]
      };
    }
    // 网络连接错误
    else if (error.includes('网络') || error.includes('连接') || error.includes('connection') || error.includes('Failed to fetch')) {
      errorInfo = {
        title: '网络连接错误',
        message: '无法连接到 AI 服务',
        shortSuggestion: '请检查网络连接',
        solutions: [
          '检查您的网络连接',
          '确认 VPN 状态（如有使用）',
          '稍后重试'
        ]
      };
    }
    // 速率限制错误
    else if (error.includes('速率') || error.includes('频率') || error.includes('rate limit') || error.includes('too many requests')) {
      errorInfo = {
        title: '请求频率限制',
        message: '短时间内发送了太多请求',
        shortSuggestion: '请稍后再试',
        solutions: [
          '等待几分钟后再尝试',
          '减少请求频率',
          '联系管理员提升限制'
        ]
      };
    }
    // 服务器错误
    else if (error.includes('服务器') || error.includes('server') || error.includes('500')) {
      errorInfo = {
        title: '服务器错误',
        message: 'AI 服务器出现问题',
        shortSuggestion: '请稍后再试',
        solutions: [
          '稍后再尝试',
          '联系技术支持',
          '检查服务状态页'
        ]
      };
    }
    // 内容过长错误
    else if (error.includes('长度') || error.includes('过长') || error.includes('too long') || error.includes('length')) {
      errorInfo = {
        title: '内容过长',
        message: '选中的文本超出了处理限制',
        shortSuggestion: '请缩短文本内容',
        solutions: [
          '选择更短的文本段落',
          '将文本分成多个部分处理',
          '移除不必要的内容'
        ]
      };
    }
  }
  
  return errorInfo;
}

// 应用优化后的文本
function applyOptimizedText() {
  console.log('应用优化后的文本');
  
  const resultTextEl = aiPopup.querySelector('.ai-result-text');
  const optimizedText = resultTextEl.textContent;
  
  if (!optimizedText) {
    console.error('没有优化后的文本可应用');
    return;
  }
  
  // 根据站点类型应用文本
  switch (currentSiteType) {
    case 'notion':
      applyTextToNotion(optimizedText);
      break;
    case 'longport':
      applyTextToLongPort(optimizedText);
      break;
    default:
      applyTextToGeneral(optimizedText);
  }
  
  // 关闭弹窗
  aiPopup.remove();
  aiPopup = null;
}

// 应用文本到 Notion
function applyTextToNotion(text) {
  console.log('应用文本到 Notion');
  
  try {
    // 直接替换选中的文本
    replaceSelectedText(text);
  } catch (error) {
    console.error('应用文本到 Notion 失败:', error);
    // 回退到剪贴板
    navigator.clipboard.writeText(text)
      .then(() => alert('无法直接替换选中文本，已复制到剪贴板'));
  }
}

// 应用文本到 LongPort
function applyTextToLongPort(text) {
  console.log('应用文本到 LongPort');
  
  try {
    // 直接替换选中的文本
    replaceSelectedText(text);
  } catch (error) {
    console.error('应用文本到 LongPort 失败:', error);
    // 回退到剪贴板
    navigator.clipboard.writeText(text)
      .then(() => alert('无法直接替换选中文本，已复制到剪贴板'));
  }
}

// 应用文本到一般网站
function applyTextToGeneral(text) {
  console.log('应用文本到一般网站');
  
  try {
    // 直接替换选中的文本
    replaceSelectedText(text);
  } catch (error) {
    console.error('应用文本到一般网站失败:', error);
    // 回退到剪贴板
    navigator.clipboard.writeText(text)
      .then(() => alert('无法直接替换选中文本，已复制到剪贴板'));
  }
}

// 替换选中的文本
function replaceSelectedText(text) {
  console.log('直接替换选中的文本');
  
  // 获取当前活动的编辑器元素
  const activeElement = document.activeElement;
  
  if (activeElement && (activeElement.isContentEditable || activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT')) {
    // 如果是可编辑元素或文本区域
    if (activeElement.isContentEditable) {
      // 对于富文本编辑器
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(text));
        // 触发输入事件
        activeElement.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        // 如果没有选区，则替换整个内容
        activeElement.innerHTML = text;
        activeElement.dispatchEvent(new Event('input', { bubbles: true }));
      }
    } else {
      // 对于普通文本区域或输入框
      const start = activeElement.selectionStart;
      const end = activeElement.selectionEnd;
      
      if (start !== undefined && end !== undefined) {
        // 替换选中的文本
        const currentValue = activeElement.value;
        activeElement.value = currentValue.substring(0, start) + text + currentValue.substring(end);
        // 设置光标位置到替换文本的末尾
        activeElement.selectionStart = activeElement.selectionEnd = start + text.length;
      } else {
        // 如果没有选区，则替换整个内容
        activeElement.value = text;
      }
      
      // 触发输入事件
      activeElement.dispatchEvent(new Event('input', { bubbles: true }));
    }
  } else {
    // 如果没有活动的编辑元素，尝试使用 document.execCommand
    try {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        // 删除当前选中内容并插入新文本
        document.execCommand('insertText', false, text);
      } else {
        // 如果没有选区，则使用剪贴板
        throw new Error('没有选中文本');
      }
    } catch (error) {
      console.error('无法使用 execCommand 替换文本:', error);
      // 回退到剪贴板
      navigator.clipboard.writeText(text)
        .then(() => alert('无法直接替换选中文本，已复制到剪贴板'));
    }
  }
}

// 保存优化记录到历史
function saveOptimizationHistory(originalText, optimizedText) {
  if (!originalText || !optimizedText || originalText === optimizedText) {
    console.log('不保存历史记录：原文或优化文本为空，或两者相同');
    return;
  }
  
  console.log('保存优化记录到历史');
  
  // 创建优化记录
  const optimizationRecord = {
    originalText: originalText,
    optimizedText: optimizedText,
    timestamp: Date.now(),
    siteType: currentSiteType || detectSiteType(),
    url: window.location.href
  };
  
  // 获取现有历史记录
  chrome.storage.local.get(['optimizationHistory'], function(result) {
    let history = result.optimizationHistory || [];
    
    // 限制历史记录数量，最多保存50条
    const maxHistoryItems = 50;
    if (history.length >= maxHistoryItems) {
      history = history.slice(0, maxHistoryItems - 1);
    }
    
    // 添加新记录到历史开头
    history.unshift(optimizationRecord);
    
    // 保存更新后的历史记录
    chrome.storage.local.set({ optimizationHistory: history }, function() {
      console.log('历史记录已保存，当前共有', history.length, '条记录');
    });
  });
}

// 设置弹窗相对于选中文本的位置
function positionPopupRelativeToSelection(popup) {
  console.log('设置弹窗位置相对于选中文本');
  
  // 获取当前选区
  const selection = window.getSelection();
  
  if (!selection || selection.rangeCount === 0) {
    // 如果没有选区，则居中显示
    positionPopupCenter(popup);
    return;
  }
  
  // 获取选区范围
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  
  // 获取弹窗尺寸
  const popupWidth = popup.offsetWidth || 400; // 默认宽度
  const popupHeight = popup.offsetHeight || 300; // 默认高度
  
  // 获取视口尺寸
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // 计算选区的中心点
  const selectionCenterX = rect.left + rect.width / 2;
  const selectionBottom = rect.bottom;
  const selectionTop = rect.top;
  
  // 默认位置：选区下方，水平居中对齐
  let popupLeft = selectionCenterX - popupWidth / 2;
  let popupTop = selectionBottom + 10; // 与选区保持10px间距
  
  // 检查下方空间是否足够
  const spaceBelow = viewportHeight - selectionBottom;
  const spaceAbove = selectionTop;
  
  if (spaceBelow < popupHeight + 20) {
    // 下方空间不足，检查上方空间
    if (spaceAbove > popupHeight + 20) {
      // 上方空间足够，显示在选区上方
      popupTop = selectionTop - popupHeight - 10;
      console.log('弹窗显示在选区上方');
    } else {
      // 上下方空间都不足，居中显示
      positionPopupCenter(popup);
      return;
    }
  } else {
    console.log('弹窗显示在选区下方');
  }
  
  // 确保弹窗不会超出视口左右边界
  popupLeft = Math.max(10, Math.min(popupLeft, viewportWidth - popupWidth - 10));
  
  // 应用位置
  popup.style.position = 'fixed';
  popup.style.left = `${popupLeft}px`;
  popup.style.top = `${popupTop}px`;
  popup.style.transform = 'none'; // 覆盖默认的居中transform
}

// 将弹窗居中显示
function positionPopupCenter(popup) {
  console.log('弹窗居中显示');
  
  popup.style.position = 'fixed';
  popup.style.left = '50%';
  popup.style.top = '50%';
  popup.style.transform = 'translate(-50%, -50%)';
}

// 添加键盘事件监听
function addKeyboardEventListeners(popup) {
  console.log('添加键盘事件监听');
  
  // 为弹窗添加键盘事件
  popup.addEventListener('keydown', (e) => {
    console.log('弹窗键盘事件:', e.key);
    
    // Space 键执行替换功能
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault(); // 阻止默认的空格行为
      console.log('检测到 Space 键，执行替换');
      
      // 查找替换按钮并点击
      const replaceBtn = popup.querySelector('.ai-replace-btn');
      if (replaceBtn) {
        replaceBtn.click();
      }
    }
    
    // Esc 键关闭弹窗
    if (e.key === 'Escape') {
      e.preventDefault();
      console.log('检测到 Esc 键，关闭弹窗');
      popup.remove();
      aiPopup = null;
    }
  });
  
  // 让弹窗获得焦点，以便接收键盘事件
  setTimeout(() => {
    popup.focus();
  }, 100);
}

// 处理来自后台脚本的消息
function handleBackgroundMessages(request, sender, sendResponse) {
  console.log('收到消息:', request);
  
  // 处理ping消息，用于检测内容脚本是否已注入
  if (request.action === "ping") {
    console.log('收到ping消息，响应成功');
    sendResponse({ success: true });
    return true;
  }
  
  if (request.action === "showAIPopup") {
    console.log('显示 AI 弹窗，选中文本:', request.selectedText);
    showAIPopup(request.selectedText, request.siteType, request.fromShortcut);
    sendResponse({ success: true });
    return true;
  }
  
  // 处理快捷键优化结果
  if (request.action === "optimizationResult") {
    console.log('收到优化结果:', request.optimizedText ? request.optimizedText.substring(0, 50) + '...' : '无');
    
    // 保存原始文本和优化后的文本
    currentSelection = request.originalText;
    originalText = request.originalText;
    currentSiteType = request.siteType || detectSiteType();
    
    // 显示优化结果弹窗
    showOptimizationResult(request.originalText, request.optimizedText, request.siteType);
    sendResponse({ success: true });
    return true;
  }
  
  return false;
}

// 初始化
function initialize() {
  console.log('初始化 LongPort AI 助手...');
  // 监听来自后台脚本的消息
  chrome.runtime.onMessage.addListener(handleBackgroundMessages);
}

// 初始化
initialize();
bindGlobalEvents();

// 通知后台脚本内容脚本已加载
chrome.runtime.sendMessage({ action: "contentScriptLoaded" });