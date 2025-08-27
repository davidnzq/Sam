// 文案优化相关的后台处理逻辑

// 监听来自内容脚本的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // 处理文案优化请求
  if (request.action === 'optimizeText') {
    console.log('收到文案优化请求:', request.options);
    
    // 调用处理函数
    handleOptimizeRequest(request, sender, sendResponse);
    
    // 返回true以保持消息通道开放，允许异步响应
    return true;
  }
});

// 添加右键菜单
chrome.runtime.onInstalled.addListener(() => {
  // 创建文案优化菜单
  chrome.contextMenus.create({
    id: 'optimize-text',
    title: '优化文案',
    contexts: ['selection']
  });
  
  // 创建打开优化器菜单
  chrome.contextMenus.create({
    id: 'open-optimizer',
    title: '打开文案优化器',
    contexts: ['page']
  });
});

// 处理右键菜单点击
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab?.id) return;
  
  // 处理优化文案菜单
  if (info.menuItemId === 'optimize-text') {
    chrome.tabs.sendMessage(tab.id, {
      action: 'optimizeText',
      text: info.selectionText
    });
  }
  
  // 处理打开优化器菜单
  if (info.menuItemId === 'open-optimizer') {
    chrome.tabs.sendMessage(tab.id, {
      action: 'showOptimizer'
    });
  }
});

// 处理快捷键
chrome.commands.onCommand.addListener((command, tab) => {
  if (!tab?.id) return;
  
  // 处理优化选中文本快捷键
  if (command === 'optimize-selection') {
    chrome.tabs.sendMessage(tab.id, {
      action: 'optimizeSelection'
    });
  }
});
