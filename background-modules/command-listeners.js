// 命令监听器模块
import { isSupportedSite, getSiteType } from '../background-main.js';
import { ensureContentScriptInjected, injectContentScripts } from './content-script-manager.js';
import { handleAICall } from './ai-service.js';

// 设置命令监听器
export function setupCommandListeners() {
  // 监听快捷键命令
  chrome.commands.onCommand.addListener(async (command) => {
    console.log('快捷键命令触发:', command);
    
    if (command === 'show-ai-popup') {
      console.log('处理唤起 AI 助手弹窗命令');
      
      try {
        // 获取当前活动标签页
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const activeTab = tabs[0];
        
        if (!activeTab) {
          console.error('未找到活动标签页');
          return;
        }
        
        console.log('活动标签页:', activeTab.id, activeTab.url);
        
        // 检查是否为支持的网站
        if (!isSupportedSite(activeTab.url)) {
          console.log('不支持的网站:', activeTab.url);
          
          // 注入临时脚本获取选中文本并显示提示
          await chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            function: () => {
              const selection = window.getSelection().toString().trim();
              if (!selection) {
                alert('LongPort AI 助手：请先选中要优化的文本');
              } else {
                alert('LongPort AI 助手：当前网站不支持文本优化功能');
              }
            }
          });
          
          return;
        }
        
        // 获取选中的文本
        const [{ result: selectedText }] = await chrome.scripting.executeScript({
          target: { tabId: activeTab.id },
          function: () => window.getSelection().toString().trim()
        });
        
        console.log('选中的文本:', selectedText ? selectedText.substring(0, 50) + '...' : '无');
        
        // 如果没有选中文本，提示用户
        if (!selectedText) {
          await chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            function: () => {
              alert('LongPort AI 助手：请先选中要优化的文本');
            }
          });
          return;
        }
        
        // 确保内容脚本已注入
        const injectionSuccess = await ensureContentScriptInjected(activeTab.id);
        
        if (!injectionSuccess) {
          console.log('内容脚本注入失败，尝试临时注入处理脚本');
          
          // 临时注入脚本显示弹窗
          await chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            args: [{ text: selectedText, siteType: getSiteType(activeTab.url) }],
            function: (args) => {
              const { text, siteType } = args;
              
              // 创建临时弹窗
              const popup = document.createElement('div');
              popup.style.position = 'fixed';
              popup.style.top = '50%';
              popup.style.left = '50%';
              popup.style.transform = 'translate(-50%, -50%)';
              popup.style.width = '80%';
              popup.style.maxWidth = '600px';
              popup.style.backgroundColor = 'white';
              popup.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.3)';
              popup.style.borderRadius = '8px';
              popup.style.padding = '20px';
              popup.style.zIndex = '9999999';
              popup.style.fontFamily = 'Arial, sans-serif';
              
              popup.innerHTML = `
                <h3 style="margin-top: 0; color: #333;">LongPort AI 助手</h3>
                <p style="margin-bottom: 15px; font-size: 14px;">正在优化文本...</p>
                <div style="display: flex; justify-content: center;">
                  <div style="width: 30px; height: 30px; border: 3px solid #f3f3f3; border-top: 3px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                </div>
                <style>
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                </style>
              `;
              
              document.body.appendChild(popup);
              
              // 发送消息到后台请求优化
              chrome.runtime.sendMessage({
                action: "requestOptimization",
                text: text,
                siteType: siteType
              });
            }
          });
          
          return;
        }
        
        // 向内容脚本发送显示弹窗的消息
        chrome.tabs.sendMessage(activeTab.id, {
          action: "showAIPopup",
          selectedText: selectedText,
          siteType: getSiteType(activeTab.url),
          pageUrl: activeTab.url,
          fromShortcut: true
        }).catch(error => {
          console.error('发送显示弹窗消息失败:', error);
        });
      } catch (error) {
        console.error('处理唤起 AI 助手弹窗命令失败:', error);
      }
    }
    else if (command === 'optimize-selection') {
      console.log('处理优化选中文本命令');
      
      try {
        // 获取当前活动标签页
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const activeTab = tabs[0];
        
        if (!activeTab) {
          console.error('未找到活动标签页');
          return;
        }
        
        console.log('活动标签页:', activeTab.id, activeTab.url);
        
        // 检查是否为支持的网站
        if (!isSupportedSite(activeTab.url)) {
          console.log('不支持的网站:', activeTab.url);
          
          // 注入临时脚本获取选中文本并显示提示
          await chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            function: () => {
              const selection = window.getSelection().toString().trim();
              if (!selection) {
                alert('LongPort AI 助手：请先选中要优化的文本');
              } else {
                alert('LongPort AI 助手：当前网站不支持文本优化功能');
              }
            }
          });
          
          return;
        }
        
        // 获取选中的文本
        const [{ result: selectedText }] = await chrome.scripting.executeScript({
          target: { tabId: activeTab.id },
          function: () => window.getSelection().toString().trim()
        });
        
        console.log('选中的文本:', selectedText ? selectedText.substring(0, 50) + '...' : '无');
        
        // 如果没有选中文本，提示用户
        if (!selectedText) {
          await chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            function: () => {
              alert('LongPort AI 助手：请先选中要优化的文本');
            }
          });
          return;
        }
        
        // 确保内容脚本已注入
        const injectionSuccess = await ensureContentScriptInjected(activeTab.id);
        
        if (!injectionSuccess) {
          console.log('内容脚本注入失败，尝试临时注入处理脚本');
          
          // 临时注入脚本处理优化
          await processOptimizationWithTempScript(activeTab.id, selectedText, getSiteType(activeTab.url));
          return;
        }
        
        // 调用 API 进行文本优化
        const optimizedText = await optimizeSelectedText(selectedText, getSiteType(activeTab.url));
        
        if (!optimizedText) {
          console.error('文本优化失败');
          return;
        }
        
        // 向内容脚本发送优化结果
        chrome.tabs.sendMessage(activeTab.id, {
          action: "optimizationResult",
          originalText: selectedText,
          optimizedText: optimizedText,
          siteType: getSiteType(activeTab.url)
        }).catch(error => {
          console.error('发送优化结果失败:', error);
          
          // 如果发送失败，尝试临时注入脚本显示结果
          chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            args: [{ text: optimizedText }],
            function: (args) => {
              const { text } = args;
              const result = confirm(`LongPort AI 助手优化结果:\n\n${text.substring(0, 150)}${text.length > 150 ? '...' : ''}\n\n点击确定复制到剪贴板`);
              if (result) {
                navigator.clipboard.writeText(text)
                  .then(() => alert('已复制到剪贴板'))
                  .catch(() => alert('复制失败，请手动复制'));
              }
            }
          });
        });
      } catch (error) {
        console.error('处理优化选中文本命令失败:', error);
      }
    }
  });
}

// 优化选中的文本
async function optimizeSelectedText(text, siteType) {
  console.log('优化选中的文本，网站类型:', siteType);
  
  if (!text || text.trim().length === 0) {
    console.log('没有要优化的文本');
    return null;
  }
  
  try {
    // 使用 handleAICall 函数进行优化
    const optimizedText = await handleAICall(text, 'company', siteType);
    console.log('优化结果:', optimizedText ? optimizedText.substring(0, 50) + '...' : '无');
    
    return optimizedText;
  } catch (error) {
    console.error('文本优化失败:', error);
    return null;
  }
}

// 使用临时脚本处理优化
async function processOptimizationWithTempScript(tabId, text, siteType) {
  console.log('使用临时脚本处理优化');
  
  try {
    // 优化文本
    const optimizedText = await handleAICall(text, 'company', siteType);
    
    if (!optimizedText) {
      console.error('优化失败，无结果');
      return;
    }
    
    // 注入临时脚本显示结果
    await chrome.scripting.executeScript({
      target: { tabId },
      args: [{ original: text, optimized: optimizedText }],
      function: (args) => {
        const { original, optimized } = args;
        
        // 创建弹窗显示结果
        const popup = document.createElement('div');
        popup.style.position = 'fixed';
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.width = '80%';
        popup.style.maxWidth = '600px';
        popup.style.maxHeight = '80%';
        popup.style.backgroundColor = 'white';
        popup.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.3)';
        popup.style.borderRadius = '8px';
        popup.style.padding = '20px';
        popup.style.zIndex = '9999999';
        popup.style.overflow = 'auto';
        popup.style.fontFamily = 'Arial, sans-serif';
        
        popup.innerHTML = `
          <h3 style="margin-top: 0; color: #333;">LongPort AI 助手</h3>
          <p style="margin-bottom: 15px; font-size: 14px;">文本优化结果：</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 15px; font-size: 14px; line-height: 1.5;">${optimized}</div>
          <div style="display: flex; justify-content: flex-end; gap: 10px;">
            <button id="ai-copy-btn" style="padding: 8px 15px; background: #f0f0f0; border: none; border-radius: 4px; cursor: pointer;">复制</button>
            <button id="ai-replace-btn" style="padding: 8px 15px; background: #4285f4; color: white; border: none; border-radius: 4px; cursor: pointer;">替换</button>
            <button id="ai-close-btn" style="padding: 8px 15px; background: #f0f0f0; border: none; border-radius: 4px; cursor: pointer;">关闭</button>
          </div>
        `;
        
        document.body.appendChild(popup);
        
        // 绑定按钮事件
        document.getElementById('ai-copy-btn').addEventListener('click', () => {
          navigator.clipboard.writeText(optimized)
            .then(() => alert('已复制到剪贴板'))
            .catch(() => alert('复制失败，请手动复制'));
        });
        
        document.getElementById('ai-replace-btn').addEventListener('click', () => {
          try {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              range.deleteContents();
              range.insertNode(document.createTextNode(optimized));
            } else {
              navigator.clipboard.writeText(optimized)
                .then(() => alert('无法直接替换，已复制到剪贴板'))
                .catch(() => alert('复制失败，请手动复制'));
            }
          } catch (e) {
            navigator.clipboard.writeText(optimized)
              .then(() => alert('替换失败，已复制到剪贴板'))
              .catch(() => alert('复制失败，请手动复制'));
          }
          popup.remove();
        });
        
        document.getElementById('ai-close-btn').addEventListener('click', () => {
          popup.remove();
        });
      }
    });
  } catch (error) {
    console.error('临时脚本处理优化失败:', error);
    
    // 显示错误提示
    await chrome.scripting.executeScript({
      target: { tabId },
      function: () => {
        alert('LongPort AI 助手：文本优化失败，请稍后重试');
      }
    });
  }
}
