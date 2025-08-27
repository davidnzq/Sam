// 上下文菜单模块
import { isSupportedSite, getSiteType } from '../background-main.js';
import { ensureContentScriptInjected, injectContentScripts } from './content-script-manager.js';

// 设置右键菜单
export function setupContextMenu() {
  try {
    chrome.contextMenus.create({
      id: "longport-ai-assistant",
      title: "优化文案",
      contexts: ["selection"],
      documentUrlPatterns: [
        "https://*.notion.so/*",
        "https://*.notion.site/*",
        "https://*.notion.com/*",
        "https://*.longportapp.com/*"
      ]
    });
    console.log('右键菜单创建成功');
  } catch (error) {
    console.error('创建右键菜单失败:', error);
  }
  
  // 处理右键菜单点击
  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    console.log('右键菜单被点击:', info.menuItemId, '标签页:', tab.id);
    
    if (info.menuItemId === "longport-ai-assistant") {
      console.log('处理优化文案请求，选中文本:', info.selectionText);
      console.log('网站类型:', getSiteType(tab.url));
      
      try {
        // 确保内容脚本已注入
        console.log('确保内容脚本已注入...');
        const injectionSuccess = await ensureContentScriptInjected(tab.id);
        
        if (!injectionSuccess) {
          console.error('无法注入内容脚本，将尝试强制重新注入');
          
          // 强制重新注入
          console.log('强制重新注入内容脚本...');
          const forceInjection = await injectContentScripts(tab.id);
          
          if (!forceInjection) {
            console.error('强制注入失败，无法继续');
            return;
          }
          
          // 等待内容脚本初始化
          console.log('等待内容脚本初始化...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        // 向内容脚本发送消息，显示 AI 弹窗
        console.log('向内容脚本发送showAIPopup消息...');
        try {
          const response = await chrome.tabs.sendMessage(tab.id, {
            action: "showAIPopup",
            selectedText: info.selectionText,
            siteType: getSiteType(tab.url),
            pageUrl: tab.url
          });
          
          console.log('消息发送成功，响应:', response);
        } catch (sendError) {
          console.error('发送消息失败:', sendError.message);
          
          // 最后一次尝试
          console.log('最后一次尝试重新注入并发送消息...');
          await injectContentScripts(tab.id);
          
          // 等待初始化后再次尝试
          setTimeout(async () => {
            try {
              await chrome.tabs.sendMessage(tab.id, {
                action: "showAIPopup",
                selectedText: info.selectionText,
                siteType: getSiteType(tab.url),
                pageUrl: tab.url
              });
              console.log('最后一次尝试发送消息成功');
            } catch (finalError) {
              console.error('最后一次尝试失败:', finalError.message);
              // 通知用户刷新页面
              try {
                await chrome.tabs.executeScript(tab.id, {
                  code: `alert('LongPort AI 助手无法加载，请刷新页面后重试。')`
                });
              } catch (alertError) {
                console.error('无法显示警告:', alertError);
              }
            }
          }, 2000);
        }
      } catch (error) {
        console.error('处理右键菜单请求失败:', error.message);
        
        // 尝试重新注入并重试
        try {
          console.log('尝试重新注入内容脚本...');
          await injectContentScripts(tab.id);
          
          // 等待初始化后再次尝试
          setTimeout(async () => {
            try {
              await chrome.tabs.sendMessage(tab.id, {
                action: "showAIPopup",
                selectedText: info.selectionText,
                siteType: getSiteType(tab.url),
                pageUrl: tab.url
              });
              console.log('重试发送消息成功');
            } catch (retryError) {
              console.error('重试失败:', retryError.message);
              // 通知用户刷新页面
              try {
                await chrome.tabs.executeScript(tab.id, {
                  code: `alert('LongPort AI 助手无法加载，请刷新页面后重试。')`
                });
              } catch (alertError) {
                console.error('无法显示警告:', alertError);
              }
            }
          }, 2000);
        } catch (retryError) {
          console.error('重试注入失败:', retryError);
        }
      }
    }
  });
}
