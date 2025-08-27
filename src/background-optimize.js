// background-optimize.js
// 处理文案优化相关的后台逻辑

// 创建右键菜单
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'optimizeText',
    title: '文案优化',
    contexts: ['selection']
  });
  
  chrome.contextMenus.create({
    id: 'proofreadText',
    title: '语法校对',
    contexts: ['selection']
  });
});

// 处理右键菜单点击
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab.id) return;
  
  if (info.menuItemId === 'optimizeText' || info.menuItemId === 'proofreadText') {
    const mode = info.menuItemId === 'optimizeText' ? 'optimize' : 'proofread';
    
    // 打开优化面板
    chrome.windows.create({
      url: chrome.runtime.getURL('optimize-panel.html'),
      type: 'popup',
      width: 420,
      height: 600
    });
    
    // 存储当前选中的文本和模式
    chrome.storage.local.set({
      currentSelection: info.selectionText,
      currentMode: mode
    });
  }
});

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'textSelected') {
    // 更新右键菜单状态
    chrome.contextMenus.update('optimizeText', {
      enabled: Boolean(request.text)
    });
    chrome.contextMenus.update('proofreadText', {
      enabled: Boolean(request.text)
    });
  }
  
  if (request.action === 'optimize') {
    // 调用API进行文案优化
    fetch('https://api.example.com/v1/optimize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${request.apiKey || ''}`
      },
      body: JSON.stringify({
        text: request.text,
        mode: request.mode || 'optimize',
        scene: request.scene || 'console',
        strict: request.strict !== undefined ? request.strict : true
      })
    })
    .then(response => response.json())
    .then(data => {
      sendResponse({ success: true, data });
    })
    .catch(error => {
      console.error('文案优化API调用失败:', error);
      sendResponse({ success: false, error: error.message });
    });
    
    return true; // 异步响应
  }
});
