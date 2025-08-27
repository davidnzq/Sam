// 标签页监听器模块
import { isSupportedSite, getSiteType } from '../background-main.js';
import { checkContentScript, injectContentScripts } from './content-script-manager.js';

// 设置标签页监听器
export function setupTabListeners() {
  // 标签页更新时检查是否需要注入内容脚本
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && isSupportedSite(tab.url)) {
      console.log('支持的网站页面加载完成，检查内容脚本:', tab.url);
      console.log('网站类型:', getSiteType(tab.url));
      
      // 延迟检查，确保页面完全加载
      setTimeout(async () => {
        try {
          const isInjected = await checkContentScript(tabId);
          if (!isInjected) {
            console.log('页面加载完成后内容脚本未注入，自动注入...');
            await injectContentScripts(tabId);
          }
        } catch (error) {
          console.log('自动注入检查失败:', error.message);
        }
      }, 2000);
    }
  });
}
