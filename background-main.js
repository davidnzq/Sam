// LongPort AI 助手 - 后台主脚本
console.log('LongPort AI 助手后台脚本加载中...');

// Service Worker 中不能直接使用 import 语句，使用 self.importScripts 加载模块
self.addEventListener('install', (event) => {
  console.log('Service Worker 安装中...');
  self.skipWaiting(); // 确保新的 Service Worker 立即激活
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker 已激活');
  // 确保 Service Worker 立即控制所有客户端
  event.waitUntil(clients.claim());
});

// 初始化扩展
function initializeExtension() {
  try {
    console.log('正在初始化 LongPort AI 助手...');
    
    // 设置默认的公司内部 API 配置
    chrome.storage.sync.set({
      companyApiUrl: 'https://lboneapi.longbridge-inc.com/',
      companyApiKey: 'sk-7jSHih7SXoQcjMekQyTd3urc2G2BdtVzrzzdI6MotEpfWhyM'
    }, () => {
      console.log('默认 API 配置已设置');
    });
    
    // 初始化各个模块 - 使用函数调用而非导入
    setupContextMenu();
    setupMessageHandlers();
    setupTabListeners();
    setupCommandListeners();
    setupActionListeners();
    
    console.log('LongPort AI 助手初始化完成');
  } catch (error) {
    console.error('LongPort AI 助手初始化失败:', error);
  }
}

// 监听扩展安装事件
chrome.runtime.onInstalled.addListener(() => {
  console.log('LongPort AI 助手插件已安装');
  initializeExtension();
});

// 公共函数和变量
const isSupportedSite = (url) => {
  return url && (
    url.includes('notion.so') || 
    url.includes('notion.site') || 
    url.includes('notion.com') ||
    url.includes('longportapp.com')
  );
};

const getSiteType = (url) => {
  if (url.includes('longportapp.com')) {
    return 'longport';
  } else if (url.includes('notion')) {
    return 'notion';
  }
  return 'unknown';
};

// 定义模块函数
function setupContextMenu() {
  console.log('设置上下文菜单...');
  
  // 创建上下文菜单项
  chrome.contextMenus.create({
    id: 'optimize-selection',
    title: '优化选中文本',
    contexts: ['selection'],
    documentUrlPatterns: [
      'https://*.notion.so/*',
      'https://*.notion.site/*',
      'https://*.notion.com/*',
      'https://*.longportapp.com/*'
    ]
  });

  // 监听上下文菜单点击事件
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'optimize-selection' && info.selectionText) {
      chrome.tabs.sendMessage(tab.id, {
        action: 'optimizeSelection',
        text: info.selectionText
      });
    }
  });
}

function setupMessageHandlers() {
  console.log('设置消息处理程序...');
  
  // 监听来自内容脚本的消息
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'optimizeText') {
      // 处理文本优化请求
      processOptimizationRequest(request.text, request.options)
        .then(result => sendResponse({ success: true, result }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true; // 异步响应
    }
    
    if (request.action === 'getSiteInfo') {
      const url = sender.tab ? sender.tab.url : '';
      sendResponse({
        supported: isSupportedSite(url),
        siteType: getSiteType(url)
      });
    }
  });
}

// 处理优化请求
async function processOptimizationRequest(text, options) {
  try {
    // 从存储中获取 API 配置
    const config = await new Promise((resolve) => {
      chrome.storage.sync.get(['companyApiUrl', 'companyApiKey'], (result) => {
        resolve(result);
      });
    });
    
    // 构建 API 请求
    const response = await fetch(`${config.companyApiUrl}api/optimize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.companyApiKey}`
      },
      body: JSON.stringify({
        text,
        options
      })
    });
    
    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status}`);
    }
    
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('文本优化请求处理失败:', error);
    throw error;
  }
}

function setupTabListeners() {
  console.log('设置标签页监听器...');
  
  // 监听标签页更新事件
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && isSupportedSite(tab.url)) {
      // 向内容脚本发送标签页已加载完成的消息
      chrome.tabs.sendMessage(tabId, { action: 'tabLoaded' }).catch(() => {
        // 忽略内容脚本未准备好的错误
      });
    }
  });
}

function setupCommandListeners() {
  console.log('设置命令监听器...');
  
  // 监听键盘快捷键命令
  chrome.commands.onCommand.addListener((command, tab) => {
    if (command === 'optimize-selection') {
      chrome.tabs.sendMessage(tab.id, { action: 'triggerOptimizeSelection' });
    } else if (command === 'show-ai-popup') {
      chrome.tabs.sendMessage(tab.id, { action: 'showAiPopup' });
    }
  });
}

function setupActionListeners() {
  console.log('设置操作按钮监听器...');
  
  // 监听扩展图标点击事件
  chrome.action.onClicked.addListener((tab) => {
    if (isSupportedSite(tab.url)) {
      chrome.sidePanel.open({ tabId: tab.id });
    } else {
      chrome.tabs.create({ url: 'options.html' });
    }
  });
}