// LongPort AI 助手 - 最小化后台脚本
console.log('LongPort AI 助手后台脚本加载中...');

// 全局错误处理
self.onerror = function(message, source, lineno, colno, error) {
  console.error('全局错误:', message, 'at', source, lineno, colno, error);
  return true;
};

// 未捕获的 Promise 拒绝处理
self.onunhandledrejection = function(event) {
  console.error('未处理的 Promise 拒绝:', event.reason);
  event.preventDefault();
};

// 安全地执行函数
function safeExecute(fn, errorMessage, ...args) {
  try {
    return fn(...args);
  } catch (error) {
    console.error(errorMessage, error);
    return null;
  }
}

// 监听扩展安装事件
chrome.runtime.onInstalled.addListener(() => {
  console.log('LongPort AI 助手插件已安装');
  
  // 设置默认的公司内部 API 配置
  safeExecute(
    () => {
      chrome.storage.sync.set({
        companyApiUrl: 'https://lboneapi.longbridge-inc.com/',
        companyApiKey: 'sk-7jSHih7SXoQcjMekQyTd3urc2G2BdtVzrzzdI6MotEpfWhyM'
      }, () => {
        if (chrome.runtime.lastError) {
          console.error('设置 API 配置失败:', chrome.runtime.lastError);
        } else {
          console.log('API 配置已设置');
        }
      });
    },
    '设置 API 配置时出错:'
  );
  
  // 创建上下文菜单项
  safeExecute(
    () => {
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
      }, () => {
        if (chrome.runtime.lastError) {
          console.error('创建上下文菜单失败:', chrome.runtime.lastError);
        }
      });
    },
    '创建上下文菜单失败:'
  );
});

// 基本消息处理
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    console.log('收到消息:', request);
    
    if (request.action === 'getSiteInfo') {
      const url = sender.tab ? sender.tab.url : '';
      sendResponse({
        supported: isSupportedSite(url),
        siteType: getSiteType(url)
      });
    } else {
      sendResponse({success: true});
    }
  } catch (error) {
    console.error('处理消息时出错:', error);
    sendResponse({success: false, error: error.message});
  }
  return true;
});

// 监听上下文菜单点击事件
chrome.contextMenus.onClicked.addListener((info, tab) => {
  safeExecute(
    () => {
      if (info.menuItemId === 'optimize-selection' && info.selectionText) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'optimizeSelection',
          text: info.selectionText
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('发送消息失败:', chrome.runtime.lastError);
          }
        });
      }
    },
    '处理上下文菜单点击时出错:'
  );
});

// 监听键盘快捷键命令
chrome.commands.onCommand.addListener((command, tab) => {
  safeExecute(
    () => {
      if (command === 'optimize-selection') {
        chrome.tabs.sendMessage(tab.id, { action: 'triggerOptimizeSelection' }, () => {
          if (chrome.runtime.lastError) {
            console.error('发送优化选择消息失败:', chrome.runtime.lastError);
          }
        });
      } else if (command === 'show-ai-popup') {
        chrome.tabs.sendMessage(tab.id, { action: 'showAiPopup' }, () => {
          if (chrome.runtime.lastError) {
            console.error('发送显示弹窗消息失败:', chrome.runtime.lastError);
          }
        });
      }
    },
    '处理键盘命令时出错:'
  );
});

// 监听扩展图标点击事件
chrome.action.onClicked.addListener((tab) => {
  safeExecute(
    () => {
      const url = tab.url || '';
      if (isSupportedSite(url)) {
        chrome.sidePanel.open({ tabId: tab.id }).catch(error => {
          console.error('打开侧边栏失败:', error);
          // 备选方案
          chrome.tabs.create({ url: 'options.html' });
        });
      } else {
        chrome.tabs.create({ url: 'options.html' }).catch(error => {
          console.error('创建选项页标签失败:', error);
        });
      }
    },
    '处理扩展图标点击时出错:'
  );
});

// 辅助函数
function isSupportedSite(url) {
  try {
    return url && (
      url.includes('notion.so') || 
      url.includes('notion.site') || 
      url.includes('notion.com') ||
      url.includes('longportapp.com')
    );
  } catch (error) {
    console.error('检查站点支持时出错:', error);
    return false;
  }
}

function getSiteType(url) {
  try {
    if (url.includes('longportapp.com')) {
      return 'longport';
    } else if (url.includes('notion')) {
      return 'notion';
    }
    return 'unknown';
  } catch (error) {
    console.error('获取站点类型时出错:', error);
    return 'unknown';
  }
}
