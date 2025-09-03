/**
 * LongPort AI 助手 - 弹出窗口脚本
 */

import './popup.css';

document.addEventListener('DOMContentLoaded', () => {
  // 获取设置按钮元素
  const optionsBtn = document.getElementById('optionsBtn');
  
  // 添加点击事件监听器
  if (optionsBtn) {
    optionsBtn.addEventListener('click', () => {
      // 打开选项页
      chrome.runtime.openOptionsPage();
    });
  }
  
  // 获取记录按钮元素
  const recordsBtn = document.getElementById('recordsBtn');
  
  // 添加点击事件监听器
  if (recordsBtn) {
    recordsBtn.addEventListener('click', () => {
      // 打开侧边栏面板
      chrome.sidePanel.open({ tabId: chrome.tabs.TAB_ID_NONE });
    });
  }
  
  // 获取当前标签页信息
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    
    // 这里可以根据当前页面判断是否显示某些功能
    if (currentTab.url) {
      // 例如检查是否在 Notion 或 LongPort 平台
      const isNotionOrLongPort = 
        currentTab.url.includes('notion.so') || 
        currentTab.url.includes('longport.com');
      
      // 根据页面类型调整界面
      if (isNotionOrLongPort) {
        // 可以在这里添加特定平台的功能
      }
    }
  });
});

// 导出一个空对象，确保这是一个有效的模块
export {};
