/**
 * longPort AI - 内容脚本
 * 在网页中注入并执行
 */

import './content.css';
import { recordManager, OptimizationMode } from '../utils/record-manager';

// 初始化日志
console.log('longPort AI 内容脚本已加载', window.location.href);

// 定义接口
interface OptimizeTextResponse {
  success: boolean;
  optimizedText?: string;
  stats?: {
    originalLength: number;
    optimizedLength: number;
    lengthDifference?: number;
    percentageChange?: number;
    originalChineseChars?: number;
    optimizedChineseChars?: number;
    originalEnglishWords?: number;
    optimizedEnglishWords?: number;
  };
  error?: string;
  details?: string;
}

// 声明全局变量
declare global {
  interface Window {
    longPortAIReplaceText?: (text: string) => void;
    tempRangeElement?: HTMLElement;
  }
}

// 保存当前选中的文本和范围
let currentSelection: {
  text: string;
  range: Range | null;
} | null = null;

// 创建弹窗元素
let popupElement: HTMLDivElement | null = null;
let shadowRoot: ShadowRoot | null = null;
let shadowHost: HTMLDivElement | null = null;

// 监听选中文本变化
document.addEventListener('selectionchange', () => {
  const selection = window.getSelection();
  if (selection && selection.toString().trim().length > 0) {
    currentSelection = {
      text: selection.toString(),
      range: selection.getRangeAt(0)
    };
  } else {
    currentSelection = null;
  }
});

// 保存快捷键配置
let optimizeShortcut = { altKey: true, ctrlKey: false, shiftKey: false, metaKey: false, key: 'o' };
let replaceShortcut = { altKey: false, ctrlKey: false, shiftKey: false, metaKey: false, key: ' ' };

// 加载快捷键配置
function loadShortcuts() {
  chrome.storage.sync.get(['settings'], (result) => {
    if (result.settings && result.settings.shortcuts) {
      optimizeShortcut = result.settings.shortcuts.optimize;
      replaceShortcut = result.settings.shortcuts.replace;
      console.log('LongPort AI: 已加载快捷键配置', optimizeShortcut, replaceShortcut);
    }
  });
}

// 初始加载快捷键配置
loadShortcuts();

// 保存当前弹窗中的优化文本
let currentOptimizedText: string | null = null;

// 监听快捷键
document.addEventListener('keydown', (event) => {
  // 检查是否匹配优化快捷键
  if (matchesShortcut(event, optimizeShortcut)) {
    const selectedText = window.getSelection()?.toString();
    if (selectedText && selectedText.trim().length > 0) {
      optimizeText(selectedText);
      event.preventDefault(); // 阻止默认行为
    }
  }
  
  // 检查是否匹配替换快捷键，且弹窗已显示
  // 特别处理空格键，因为它在某些网站上可能有特殊行为
  const isSpaceKey = event.key === ' ' || event.code === 'Space' || event.keyCode === 32;
  const isLongportApp = window.location.hostname.includes('longportapp.com');
  
  // 添加详细日志记录所有按键事件
  console.log('按键事件:', {
    key: event.key, 
    code: event.code, 
    keyCode: event.keyCode, 
    isSpaceKey, 
    hasPopup: !!popupElement,
    website: window.location.hostname,
    target: event.target,
    currentTarget: event.currentTarget
  });
  
  // 特别处理 longportapp.com 网站上的空格键
  if (isSpaceKey && isLongportApp && popupElement) {
    console.log('在 longportapp.com 网站上检测到空格键，弹窗已显示');
    
    // 立即阻止默认行为和事件传播
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    
    // 在 longportapp.com 上处理空格键替换
    handleLongportAppSpaceReplace();
    return false;
  }
  
  // 处理其他网站或非空格键的替换快捷键
  if ((isSpaceKey || matchesShortcut(event, replaceShortcut)) && popupElement) {
    console.log('检测到替换快捷键或空格键，当前网站:', window.location.hostname);
    
    // 检查弹窗是否显示且包含优化后的文本
    const optimizedTextElement = popupElement.querySelector('.longport-ai-optimized');
    if (optimizedTextElement && optimizedTextElement.textContent) {
      const optimizedText = optimizedTextElement.textContent;
      // 保存当前优化文本
      currentOptimizedText = optimizedText;
      
      console.log('触发替换操作，优化文本:', optimizedText.substring(0, 20) + '...');
      
      // 阻止默认行为并防止事件传播
      event.preventDefault();
      event.stopPropagation();
      
      // 执行替换操作
      replaceSelectedText(optimizedText);
      removePopup();
      return false;
    }
  }
});

// 为 longportapp.com 网站添加额外的空格键监听器
if (window.location.hostname.includes('longportapp.com')) {
  console.log('为 longportapp.com 网站添加额外的空格键监听器');
  
  // 捕获所有的键盘事件，包括捕获阶段
  window.addEventListener('keydown', (event) => {
    const isSpaceKey = event.key === ' ' || event.code === 'Space' || event.keyCode === 32;
    
    if (isSpaceKey && popupElement) {
      console.log('longportapp.com 特殊监听器捕获到空格键，弹窗已显示');
      
      // 立即阻止默认行为和事件传播
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      
      // 处理替换操作
      setTimeout(() => handleLongportAppSpaceReplace(), 0);
      return false;
    }
  }, true); // 捕获阶段监听
  
  // 添加全局点击监听器，当弹窗显示时保存优化文本
  document.addEventListener('click', () => {
    if (popupElement) {
      const optimizedTextElement = popupElement.querySelector('.longport-ai-optimized');
      if (optimizedTextElement && optimizedTextElement.textContent) {
        currentOptimizedText = optimizedTextElement.textContent;
        console.log('保存当前优化文本:', currentOptimizedText.substring(0, 20) + '...');
      }
    }
  }, true);
}

// 处理 longportapp.com 网站上的空格键替换
function handleLongportAppSpaceReplace(): void {
  console.log('处理 longportapp.com 网站上的空格键替换');
  
  // 检查弹窗是否存在
  if (!popupElement) {
    console.warn('longportapp.com 空格键替换失败: 弹窗不存在');
    return;
  }
  
  // 获取优化文本
  let optimizedText: string | null = null;
  
  // 先尝试从弹窗中获取
  const optimizedTextElement = popupElement.querySelector('.longport-ai-optimized');
  if (optimizedTextElement && optimizedTextElement.textContent) {
    optimizedText = optimizedTextElement.textContent;
    console.log('从弹窗中获取优化文本:', optimizedText.substring(0, 20) + '...');
  } 
  // 如果失败，尝试使用保存的文本
  else if (currentOptimizedText) {
    optimizedText = currentOptimizedText;
    console.log('使用保存的优化文本:', optimizedText.substring(0, 20) + '...');
  }
  
  // 如果没有优化文本，无法继续
  if (!optimizedText) {
    console.warn('longportapp.com 空格键替换失败: 未找到优化文本');
    return;
  }
  
  // 尝试模拟点击替换按钮
  const replaceButton = popupElement.querySelector('.longport-ai-btn-primary');
  if (replaceButton) {
    console.log('longportapp.com 空格键替换: 模拟点击替换按钮');
    try {
      (replaceButton as HTMLButtonElement).click();
      return;
    } catch (clickError) {
      console.error('模拟点击替换按钮失败:', clickError);
    }
  }
  
  // 如果模拟点击失败，尝试直接调用替换函数
  try {
    // 先尝试使用 execCommand
    console.log('longportapp.com 空格键替换: 尝试 execCommand');
    if (document.execCommand('insertText', false, optimizedText)) {
      console.log('execCommand 替换成功');
      removePopup();
      showToast('文本替换成功', 'success');
      return;
    }
  } catch (execError) {
    console.error('execCommand 替换失败:', execError);
  }
  
  // 如果 execCommand 失败，直接调用替换函数
  console.log('longportapp.com 空格键替换: 直接调用 replaceSelectedText');
  replaceSelectedText(optimizedText);
  removePopup();
}

// 检查事件是否匹配快捷键配置
function matchesShortcut(event: KeyboardEvent, shortcut: any): boolean {
  // 输出调试日志
  console.log('快捷键匹配检查:', {
    eventKey: event.key,
    eventCode: event.code,
    eventKeyCode: event.keyCode,
    shortcutKey: shortcut.key,
    isLongportApp: window.location.hostname.includes('longportapp.com')
  });
  
  // 增强快捷键匹配逻辑，处理特殊情况
  const keyMatches = 
    // 标准匹配
    event.key.toLowerCase() === shortcut.key.toLowerCase() || 
    // 特别处理空格键，它可能在不同浏览器中有不同表示
    (shortcut.key === ' ' && (
      event.key === ' ' || 
      event.key === 'Spacebar' || 
      event.code === 'Space' || 
      event.keyCode === 32
    ));
  
  const modifiersMatch = 
    event.altKey === shortcut.altKey && 
    event.ctrlKey === shortcut.ctrlKey && 
    event.shiftKey === shortcut.shiftKey && 
    event.metaKey === shortcut.metaKey;
  
  // 在 longportapp.com 网站上，对空格键进行特殊处理
  if (window.location.hostname.includes('longportapp.com') && 
      shortcut.key === ' ' && 
      (event.key === ' ' || event.code === 'Space' || event.keyCode === 32)) {
    console.log('longportapp.com 网站上的空格键匹配检查，修饰键匹配:', modifiersMatch);
    return modifiersMatch; // 在 longportapp.com 上，只要修饰键匹配就返回 true
  }
  
  const result = modifiersMatch && keyMatches;
  console.log('快捷键匹配结果:', result);
  return result;
}

// 监听设置变更
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.settings) {
    const newSettings = changes.settings.newValue;
    if (newSettings && newSettings.shortcuts) {
      optimizeShortcut = newSettings.shortcuts.optimize;
      replaceShortcut = newSettings.shortcuts.replace;
      console.log('LongPort AI: 快捷键配置已更新', optimizeShortcut, replaceShortcut);
    }
  }
});

// 监听来自后台脚本的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('longPort AI: 收到消息', message);
  
  try {
    // 处理PING消息，用于检查内容脚本是否已加载
    if (message.type === 'PING') {
      console.log('longPort AI: 收到PING消息，回复PONG');
      try {
        sendResponse({ pong: true });
        console.log('longPort AI: PONG响应已发送');
      } catch (pingError) {
        console.error('发送PING响应时出错:', pingError);
      }
      return true;
    }
    
    // 处理替换文本命令
    else if (message.type === 'REPLACE_TEXT') {
      console.log('longPort AI: 收到替换文本命令');
      
      try {
        // 立即回复，表示消息已收到
        try {
          sendResponse({ received: true });
        } catch (responseError) {
          console.error('发送接收确认响应时出错:', responseError);
        }
        
        // 如果弹窗已显示，模拟点击替换按钮
        if (popupElement) {
          const replaceButton = popupElement.querySelector('.longport-ai-btn-primary');
          if (replaceButton) {
            console.log('执行替换操作');
            (replaceButton as HTMLButtonElement).click();
          } else {
            console.warn('未找到替换按钮');
          }
        } else {
          console.warn('弹窗未显示，无法执行替换操作');
        }
      } catch (error) {
        console.error('处理替换文本命令时出错:', error);
      }
      return true;
    }
    
    // 处理优化文本消息
    else if (message.type === 'CONTEXT_MENU_OPTIMIZE' && message.text) {
      console.log('longPort AI: 收到右键菜单优化文本消息', message.text.substring(0, 20) + '...');
      
      try {
        // 立即回复，表示消息已收到
        try {
          sendResponse({ received: true });
          console.log('已发送接收确认响应');
        } catch (responseError) {
          console.error('发送接收确认响应时出错:', responseError);
        }
        
        // 保存选中文本和范围
        // 直接使用传入的文本，不再尝试获取选中区域
        // 这样可以避免在右键菜单点击后选中区域丢失的问题
        currentSelection = {
          text: message.text,
          range: null // 稍后在优化文本函数中处理
        };
        console.log('已保存选中文本:', message.text.substring(0, 20) + '...');
        
        // 然后异步处理优化文本，避免阻塞消息响应
        setTimeout(() => {
          try {
            console.log('开始异步处理优化文本...');
            optimizeText(message.text);
          } catch (error) {
            console.error('处理优化文本时出错:', error);
            showErrorPopup('处理文本时出错: ' + (error instanceof Error ? error.message : String(error)));
          }
        }, 100); // 增加延迟到100ms，给更多时间处理响应
      } catch (processingError) {
        console.error('处理优化文本消息时出错:', processingError);
        try {
          sendResponse({ error: String(processingError) });
        } catch (responseError) {
          console.error('发送错误响应时出错:', responseError);
        }
      }
      
      return true;
    }
    
    // 对于未知消息类型，也返回响应
    console.warn('收到未知类型的消息:', message.type);
    try {
      sendResponse({ received: true, unknown: true });
    } catch (unknownResponseError) {
      console.error('发送未知类型响应时出错:', unknownResponseError);
    }
    
    // 返回 true 表示将异步发送响应
    return true;
  } catch (error) {
    // 捕获所有异常，确保消息处理不会崩溃
    console.error('处理消息时出错:', error);
    try {
      sendResponse({ error: String(error) });
    } catch (responseError) {
      console.error('发送错误响应时出错:', responseError);
    }
    return true;
  }
});

// 文本优化函数
function optimizeText(text: string): void {
  console.log('开始优化文本:', text.substring(0, 20) + '...');
  
  // 如果currentSelection未设置或range为null，则尝试获取当前选中区域
  if (!currentSelection || currentSelection.range === null) {
    console.log('尝试获取选中区域或查找可编辑元素');
    
    // 尝试获取当前选中区域
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && selection.toString().trim().length > 0) {
      console.log('检测到有效的选中区域');
      if (!currentSelection) {
        currentSelection = {
          text,
          range: selection.getRangeAt(0).cloneRange()
        };
      } else {
        currentSelection.range = selection.getRangeAt(0).cloneRange();
      }
    } else {
      // 尝试查找 Notion 特定的编辑器元素
      console.log('尝试查找 Notion 特定的编辑器元素');
      
      // Notion 编辑器特定选择器
      const notionSelectors = [
        '.notion-page-content [contenteditable="true"]',
        '.notion-frame [contenteditable="true"]',
        '.notion-selectable [contenteditable="true"]',
        '.notranslate [contenteditable="true"]'
      ];
      
      let notionEditor = null;
      
      // 尝试每个 Notion 选择器
      for (const selector of notionSelectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          notionEditor = elements[0];
          console.log(`找到 Notion 编辑器元素: ${selector}`);
          break;
        }
      }
      
      if (notionEditor) {
        // 找到 Notion 编辑器元素
        const range = document.createRange();
        try {
          range.selectNodeContents(notionEditor);
          console.log('已选择 Notion 编辑器内容');
          
          if (!currentSelection) {
            currentSelection = { text, range };
          } else {
            currentSelection.range = range;
          }
        } catch (e) {
          console.warn('无法选择 Notion 编辑器内容，尝试其他方法', e);
          // 继续尝试其他方法
        }
      }
      
      // 如果仍未找到有效范围，尝试查找一般可编辑元素
      if (!currentSelection || !currentSelection.range) {
        console.log('尝试查找一般可编辑元素');
        
        // 查找常见的编辑器元素
        const editableElements = document.querySelectorAll('[contenteditable="true"], textarea, input[type="text"]');
        let targetElement = null;
        
        // 查找焦点元素
        Array.from(editableElements).forEach(el => {
          if (el === document.activeElement) {
            targetElement = el;
            console.log('找到焦点可编辑元素');
          }
        });
        
        // 如果没有找到焦点元素，使用第一个可编辑元素
        if (!targetElement && editableElements.length > 0) {
          targetElement = editableElements[0];
          console.log('使用第一个可编辑元素');
        }
        
        // 创建范围
        const range = document.createRange();
        
        if (targetElement) {
          try {
            range.selectNodeContents(targetElement);
            console.log('已选择可编辑元素内容');
            
            if (!currentSelection) {
              currentSelection = { text, range };
            } else {
              currentSelection.range = range;
            }
          } catch (e) {
            console.debug('无法选择可编辑元素内容，创建虚拟范围处理', e);
            createVirtualRange();
          }
        } else {
          console.debug('未找到可编辑元素，创建虚拟范围处理');
          createVirtualRange();
        }
      }
    }
  }
  
  // 创建虚拟范围的辅助函数
  function createVirtualRange() {
    // 创建一个临时元素作为范围的容器
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    tempDiv.textContent = text;
    document.body.appendChild(tempDiv);
    
    const range = document.createRange();
    range.selectNodeContents(tempDiv);
    
    console.log('已创建虚拟范围');
    
    if (!currentSelection) {
      currentSelection = { text, range };
    } else {
      currentSelection.range = range;
    }
    
    // 不立即移除临时元素，等待替换操作完成后再移除
    // 将引用存储在全局变量中
    window.tempRangeElement = tempDiv;
  }

  // 清除任何已存在的弹窗
  if (popupElement && popupElement.parentNode) {
    // 直接移除而不使用动画效果，避免闪现
    popupElement.parentNode.removeChild(popupElement);
    popupElement = null;
    shadowRoot = null;
    shadowHost = null;
  }
  
  // 显示加载中弹窗
  try {
    // 延迟一点显示弹窗，确保DOM已经准备好
    setTimeout(() => {
      showLoadingPopup();
      console.log('已显示加载中弹窗');
    }, 50);
  } catch (popupError) {
    console.error('显示加载中弹窗失败:', popupError);
    // 如果失败，再次延迟重试
    setTimeout(() => {
      try {
        showLoadingPopup();
        console.log('延迟重试显示加载中弹窗成功');
      } catch (retryError) {
        console.error('延迟重试显示加载中弹窗失败:', retryError);
        // 如果仍然失败，无法继续
      }
    }, 150);
  }

  // 添加超时处理
  const timeoutId = setTimeout(() => {
    console.warn('请求超时，显示错误弹窗');
    showErrorPopup('请求超时，请重试');
  }, 30000); // 30秒超时

  try {
    console.log('发送消息到后台脚本');
  // 发送消息到后台脚本
  chrome.runtime.sendMessage(
    {
      type: 'OPTIMIZE_TEXT',
      text
    },
      (response: OptimizeTextResponse | undefined) => {
        // 清除超时
        clearTimeout(timeoutId);
        console.log('收到后台响应:', response);
        
        // 检查runtime.lastError
        if (chrome.runtime.lastError) {
          console.error('消息响应错误:', chrome.runtime.lastError.message);
          showErrorPopup('通信错误: ' + chrome.runtime.lastError.message);
          return;
        }
        
        // 检查响应是否存在
        if (!response) {
          console.error('未收到有效响应');
          showErrorPopup('未收到有效响应，请重试');
          return;
        }
        
        if (response.success && response.optimizedText) {
          // 显示优化结果弹窗
          console.log('显示优化结果弹窗');
          
          // 清除任何已存在的弹窗
          if (popupElement && popupElement.parentNode) {
            // 直接移除而不使用动画效果，避免闪现
            popupElement.parentNode.removeChild(popupElement);
            popupElement = null;
            shadowRoot = null;
            shadowHost = null;
          }
          
          // 延迟一点显示结果弹窗，避免闪现
          setTimeout(() => {
            try {
              showResultPopup(text, response.optimizedText || "", response.stats);
              console.log('显示结果弹窗成功');
            } catch (resultError) {
              console.error('显示结果弹窗失败:', resultError);
              
              // 如果失败，再次延迟重试
              setTimeout(() => {
                try {
                  showResultPopup(text, response.optimizedText || "", response.stats);
                  console.log('延迟重试显示结果弹窗成功');
                } catch (retryError) {
                  console.error('延迟重试显示结果弹窗失败:', retryError);
                  alert('优化成功，但无法显示结果弹窗。请刷新页面后重试。');
                }
              }, 150);
            }
          }, 50);
        } else {
          // 显示错误弹窗，包含详细信息
          const errorMessage = response.error || '优化失败，请重试';
          const errorDetails = response.details ? `\n\n详细信息: ${response.details}` : '';
          console.error('优化失败:', errorMessage, errorDetails);
          
          // 如果是API配置错误，提供更具体的指导
          if (errorMessage.includes('API配置可能有误') || errorMessage.includes('API未配置')) {
            showApiConfigErrorPopup(errorMessage, errorDetails);
          } else {
            showErrorPopup(errorMessage + errorDetails);
          }
        }
      }
    );
  } catch (error) {
    // 清除超时
    clearTimeout(timeoutId);
    
    // 处理异常
    console.error('发送请求失败:', error);
    showErrorPopup('发送请求失败: ' + (error instanceof Error ? error.message : String(error)));
  }
}

// 显示加载中弹窗
function showLoadingPopup(): void {
  // 如果已有弹窗，先移除
  removePopup();

  // 创建弹窗元素
  popupElement = document.createElement('div');
  popupElement.className = 'longport-ai-popup';
  popupElement.style.zIndex = '2147483647'; // 最大z-index值
  
  // 弹窗头部
  const header = document.createElement('div');
  header.className = 'longport-ai-popup-header';
  
  const title = document.createElement('h3');
  title.className = 'longport-ai-popup-title';
  title.textContent = 'LongPort AI';
  
  const closeButton = document.createElement('button');
  closeButton.className = 'longport-ai-popup-close';
  closeButton.innerHTML = '';  // 使用CSS伪元素来添加X符号
  closeButton.addEventListener('click', removePopup);
  
  header.appendChild(title);
  header.appendChild(closeButton);
  
  // 弹窗内容
  const content = document.createElement('div');
  content.className = 'longport-ai-loading';
  
  const spinner = document.createElement('div');
  spinner.className = 'longport-ai-spinner';
  
  const loadingText = document.createElement('p');
  loadingText.className = 'longport-ai-loading-text';
  loadingText.textContent = '正在润色文本...';
  
  content.appendChild(spinner);
  content.appendChild(loadingText);
  
  // 组装弹窗
  popupElement.appendChild(header);
  popupElement.appendChild(content);
  
  // 添加到页面前设置初始样式
  popupElement.style.opacity = '0';
  
  // 智能定位弹窗
  positionPopupIntelligently();
  
  document.body.appendChild(popupElement);
  
  // 设置拖拽功能
  makeElementDraggable(popupElement, header);
  
  // 添加动画效果
  setTimeout(() => {
    if (popupElement) {
      popupElement.style.opacity = '1';
    }
  }, 10);
  
  console.log('弹窗已创建并添加到DOM');
}

// 智能定位弹窗
function positionPopupIntelligently(): void {
  if (!popupElement) {
    console.log('无法智能定位弹窗：缺少弹窗元素');
    return;
  }
  
  // 如果没有选中区域或范围，则居中显示
  if (!currentSelection || !currentSelection.range) {
    console.log('无选中区域，居中显示弹窗');
    popupElement.style.top = '50%';
    popupElement.style.left = '50%';
    popupElement.style.transform = 'translate(-50%, -50%)';
    return;
  }
  
  try {
    // 获取选中文本的范围
    const selectionRect = currentSelection.range.getBoundingClientRect();
    const popupWidth = 450; // 弹窗默认宽度
    const popupHeight = 300; // 弹窗默认高度估计值
    
    // 获取视口尺寸
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollY = window.scrollY || window.pageYOffset;
    
    // 默认尝试显示在选中文本下方
    let top = selectionRect.bottom + 10 + scrollY; // 选中文本底部加10px间距，考虑滚动位置
    let left = selectionRect.left + (selectionRect.width / 2); // 水平居中
    let transformValue = 'translate(-50%, 0)';
    
    // 检查下方空间是否足够
    if (selectionRect.bottom + popupHeight > viewportHeight) {
      // 下方空间不足，尝试显示在选中文本上方
      top = selectionRect.top - popupHeight - 10 + scrollY; // 选中文本顶部减去弹窗高度再减10px间距
      
      // 检查上方空间是否足够
      if (selectionRect.top - popupHeight < 0) {
        // 上下方都空间不足，居中显示
        console.log('上下方都空间不足，居中显示弹窗');
        popupElement.style.top = `${viewportHeight / 2 + scrollY}px`;
        popupElement.style.left = '50%';
        popupElement.style.transform = 'translate(-50%, -50%)';
        return;
      } else {
        console.log('在选中文本上方显示弹窗');
        transformValue = 'translate(-50%, 0)';
      }
    } else {
      console.log('在选中文本下方显示弹窗');
      transformValue = 'translate(-50%, 0)';
    }
    
    // 确保弹窗水平方向不超出视口
    if (left - (popupWidth / 2) < 20) {
      left = 20 + (popupWidth / 2); // 靠左对齐，保的20px边距
    } else if (left + (popupWidth / 2) > viewportWidth - 20) {
      left = viewportWidth - 20 - (popupWidth / 2); // 靠右对齐，保的20px边距
    }
    
    // 设置弹窗位置
    popupElement.style.top = `${top}px`;
    popupElement.style.left = `${left}px`;
    popupElement.style.transform = transformValue;
  } catch (error) {
    console.error('智能定位弹窗失败:', error);
    // 如果失败，回退到默认中心定位
    popupElement.style.top = '50%';
    popupElement.style.left = '50%';
    popupElement.style.transform = 'translate(-50%, -50%)';
  }
}

// 显示结果弹窗
function showResultPopup(originalText: string, optimizedText: string, stats?: { originalLength: number; optimizedLength: number }): void {
  // 保存当前优化文本，供空格键替换使用
  currentOptimizedText = optimizedText;
  console.log('显示结果弹窗，保存优化文本:', optimizedText.substring(0, 20) + '...');
  // 如果已有弹窗，先移除
  removePopup();

  // 创建弹窗元素
  popupElement = document.createElement('div');
  popupElement.className = 'longport-ai-popup';
  popupElement.style.zIndex = '2147483647'; // 最大z-index值
  popupElement.style.opacity = '0'; // 初始透明，等待动画效果
  
  // 弹窗头部
  const header = document.createElement('div');
  header.className = 'longport-ai-popup-header';
  
  const title = document.createElement('h3');
  title.className = 'longport-ai-popup-title';
  title.textContent = 'LongPort AI';
  
  const closeButton = document.createElement('button');
  closeButton.className = 'longport-ai-popup-close';
  closeButton.innerHTML = '';  // 使用CSS伪元素来添加X符号
  closeButton.addEventListener('click', removePopup);
  
  header.appendChild(title);
  header.appendChild(closeButton);
  
  // 弹窗内容
  const content = document.createElement('div');
  content.className = 'longport-ai-popup-content';
  
  // 创建文本容器
  const textContainer = document.createElement('div');
  textContainer.className = 'longport-ai-text-container';
  
  // 优化后文本部分
  const optimizedSection = document.createElement('div');
  optimizedSection.className = 'longport-ai-text-section';
  
  // 使用div而不是textarea来显示优化文案，避免边框和滚动条
  const optimizedContent = document.createElement('div');
  optimizedContent.className = 'longport-ai-text-area longport-ai-optimized';
  optimizedContent.textContent = optimizedText;
  
  optimizedSection.appendChild(optimizedContent);
  
  // 添加到文本容器
  textContainer.appendChild(optimizedSection);
  
  // 字数统计信息
  const statsElement = document.createElement('div');
  statsElement.className = 'longport-ai-stats';
  
  if (stats) {
    // 类型断言为扩展的统计类型
    const extendedStats = stats as {
      originalLength: number;
      optimizedLength: number;
      lengthDifference?: number;
      percentageChange?: number;
      originalChineseChars?: number;
      optimizedChineseChars?: number;
      originalEnglishWords?: number;
      optimizedEnglishWords?: number;
    };
    
    // 创建统计信息容器
    const statsContainer = document.createElement('div');
    statsContainer.className = 'longport-ai-stats-container';
    
    // 基本字数统计部分
    const basicStatsDiv = document.createElement('div');
    basicStatsDiv.className = 'longport-ai-stats-row';
    
    // 只显示字数变化
    const changeStats = document.createElement('div');
    changeStats.className = 'longport-ai-stats-item';
    
    // 使用API返回的变化量，如果没有则计算
    const changeAmount = extendedStats.lengthDifference !== undefined ? 
      extendedStats.lengthDifference : 
      stats.optimizedLength - stats.originalLength;
    
    // 只显示变化量，不显示百分比
    const changeText = changeAmount > 0 ? 
      `+${changeAmount}` : 
      `${changeAmount}`;
    
    // 将字数变化显示在一行
    changeStats.innerHTML = `<div style="width:100%;white-space:nowrap;overflow:hidden;"><span class="longport-ai-stats-label">字数变化：</span><span class="longport-ai-stats-change ${changeAmount >= 0 ? 'longport-ai-positive' : 'longport-ai-negative'}">${changeText}</span></div>`;
    
    // 添加字数变化到行
    basicStatsDiv.appendChild(changeStats);
    
    // 添加基本统计到容器
    statsContainer.appendChild(basicStatsDiv);
    
    // 不显示详细的中英文统计
    
    // 添加统计容器到主元素
    statsElement.appendChild(statsContainer);
    
    // 保存优化记录
    saveOptimizationRecord(originalText, optimizedText, stats);
  }
  
  content.appendChild(textContainer);
  content.appendChild(statsElement);
  
  // 弹窗底部
  const footer = document.createElement('div');
  footer.className = 'longport-ai-popup-footer';
  
  const cancelButton = document.createElement('button');
  cancelButton.className = 'longport-ai-btn longport-ai-btn-default';
  cancelButton.textContent = '取消';
  cancelButton.addEventListener('click', removePopup);
  
  const replaceButton = document.createElement('button');
  replaceButton.className = 'longport-ai-btn longport-ai-btn-primary';
  replaceButton.textContent = '替换';
  replaceButton.addEventListener('click', () => {
    console.log('点击替换按钮，执行替换操作');
    
    // 检查是否在 longportapp.com 网站上
    const isLongportApp = window.location.hostname.includes('longportapp.com');
    if (isLongportApp) {
      console.log('longportapp.com 网站上点击替换按钮');
      
      // 在 longportapp.com 网站上使用特殊处理
      try {
        // 先尝试 execCommand
        if (document.execCommand('insertText', false, optimizedText)) {
          console.log('longportapp.com: execCommand 替换成功');
          removePopup();
          showToast('文本替换成功', 'success');
          return;
        }
      } catch (e) {
        console.error('longportapp.com: execCommand 失败:', e);
      }
    }
    
    // 标准替换处理
    replaceSelectedText(optimizedText);
    removePopup();
  });
  
  footer.appendChild(cancelButton);
  footer.appendChild(replaceButton);
  
  // 组装弹窗
  popupElement.appendChild(header);
  popupElement.appendChild(content);
  popupElement.appendChild(footer);
  
  // 智能定位弹窗
  positionPopupIntelligently();
  
  // 添加到页面
  document.body.appendChild(popupElement);
  
  // 设置拖拽功能
  makeElementDraggable(popupElement, header);
  
  // 添加动画效果
  setTimeout(() => {
    if (popupElement) {
      popupElement.style.opacity = '1';
    }
  }, 10);
}

// 显示API配置错误弹窗
function showApiConfigErrorPopup(errorMessage: string, errorDetails: string): void {
  // 清除任何已存在的弹窗
  if (popupElement && popupElement.parentNode) {
    // 直接移除而不使用动画效果，避免闪现
    popupElement.parentNode.removeChild(popupElement);
    popupElement = null;
    shadowRoot = null;
    shadowHost = null;
  }
  
  // 调试日志
  console.log('显示API配置错误弹窗:', errorMessage);

  // 创建弹窗元素
  popupElement = document.createElement('div');
  popupElement.className = 'longport-ai-popup';
  popupElement.style.zIndex = '2147483647'; // 最大z-index值
  
  // 弹窗头部
  const header = document.createElement('div');
  header.className = 'longport-ai-popup-header';
  
  const title = document.createElement('h3');
  title.className = 'longport-ai-popup-title';
  title.textContent = 'longPort AI - API配置';
  
  const closeButton = document.createElement('button');
  closeButton.className = 'longport-ai-popup-close';
  closeButton.innerHTML = '';  // 使用CSS伪元素来添加X符号
  closeButton.addEventListener('click', removePopup);
  
  header.appendChild(title);
  header.appendChild(closeButton);
  
  // 弹窗内容
  const content = document.createElement('div');
  content.className = 'longport-ai-popup-content';
  
  const errorElement = document.createElement('div');
  errorElement.className = 'longport-ai-error';
  
  // 显示错误信息
  const errorTitle = document.createElement('div');
  errorTitle.className = 'longport-ai-error-title';
  errorTitle.textContent = '需要配置API或使用模拟API';
  errorElement.appendChild(errorTitle);
  
  // API配置错误详细信息
  const errorDetailsElement = document.createElement('div');
  errorDetailsElement.className = 'longport-ai-error-details';
  errorDetailsElement.innerHTML = `
    <p>您的API配置可能有误或未配置。您可以：</p>
    <ul>
      <li>配置正确的API地址和密钥</li>
      <li>或使用模拟API进行文本优化</li>
    </ul>
  `;
  errorElement.appendChild(errorDetailsElement);
  
  // 按钮容器
  const buttonsContainer = document.createElement('div');
  buttonsContainer.style.display = 'flex';
  buttonsContainer.style.justifyContent = 'space-between';
  buttonsContainer.style.marginTop = '16px';
  
  // 配置API按钮
  const configApiButton = document.createElement('button');
  configApiButton.className = 'longport-ai-btn longport-ai-btn-primary';
  configApiButton.textContent = '配置API';
  configApiButton.style.marginRight = '8px';
  configApiButton.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
    removePopup();
  });
  
  // 使用模拟API按钮
  const useMockApiButton = document.createElement('button');
  useMockApiButton.className = 'longport-ai-btn longport-ai-btn-default';
  useMockApiButton.textContent = '使用模拟API';
  useMockApiButton.addEventListener('click', () => {
    // 发送消息到后台脚本，使用模拟API
    chrome.runtime.sendMessage(
      {
        type: 'OPTIMIZE_TEXT',
        text: currentSelection?.text || '',
        useMockApi: true
    },
    (response) => {
        if (response && response.success && response.optimizedText) {
          removePopup();
          showResultPopup(currentSelection?.text || '', response.optimizedText, response.stats);
        } else {
          showErrorPopup('使用模拟API失败，请重试');
        }
      }
    );
  });
  
  buttonsContainer.appendChild(configApiButton);
  buttonsContainer.appendChild(useMockApiButton);
  errorElement.appendChild(buttonsContainer);
  
  content.appendChild(errorElement);
  
  // 弹窗底部
  const footer = document.createElement('div');
  footer.className = 'longport-ai-popup-footer';
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'longport-ai-btn longport-ai-btn-default';
  closeBtn.textContent = '关闭';
  closeBtn.addEventListener('click', removePopup);
  
  footer.appendChild(closeBtn);
  
  // 组装弹窗
  popupElement.appendChild(header);
  popupElement.appendChild(content);
  popupElement.appendChild(footer);
  
  // 智能定位弹窗
  positionPopupIntelligently();
  
  // 添加到页面
  document.body.appendChild(popupElement);
  
  // 设置拖拽功能
  makeElementDraggable(popupElement, header);
  
  // 添加动画效果
  setTimeout(() => {
    if (popupElement) {
      popupElement.style.opacity = '1';
    }
  }, 10);
}

// 显示错误弹窗
function showErrorPopup(errorMessage: string): void {
  // 清除任何已存在的弹窗
  if (popupElement && popupElement.parentNode) {
    // 直接移除而不使用动画效果，避免闪现
    popupElement.parentNode.removeChild(popupElement);
    popupElement = null;
    shadowRoot = null;
    shadowHost = null;
  }
  
  // 调试日志
  console.log('显示错误弹窗:', errorMessage);

  // 创建弹窗元素
  popupElement = document.createElement('div');
  popupElement.className = 'longport-ai-popup';
  popupElement.style.zIndex = '2147483647'; // 最大z-index值
  
  // 弹窗头部
  const header = document.createElement('div');
  header.className = 'longport-ai-popup-header';
  
  const title = document.createElement('h3');
  title.className = 'longport-ai-popup-title';
  title.textContent = 'LongPort AI - 错误';
  
  const closeButton = document.createElement('button');
  closeButton.className = 'longport-ai-popup-close';
  closeButton.innerHTML = '';  // 使用CSS伪元素来添加X符号
  closeButton.addEventListener('click', removePopup);
  
  header.appendChild(title);
  header.appendChild(closeButton);
  
  // 弹窗内容
  const content = document.createElement('div');
  content.className = 'longport-ai-popup-content';
  
  const errorElement = document.createElement('div');
  errorElement.className = 'longport-ai-error';
  
  // 显示错误信息
  const errorTitle = document.createElement('div');
  errorTitle.className = 'longport-ai-error-title';
  errorTitle.textContent = errorMessage;
  errorElement.appendChild(errorTitle);
  
  // 处理不同类型的错误
  if (errorMessage.includes('API 未配置') || errorMessage.includes('API_NOT_CONFIGURED')) {
    // API未配置错误
    const settingsButton = document.createElement('button');
    settingsButton.className = 'longport-ai-btn longport-ai-btn-primary';
    settingsButton.style.marginTop = '12px';
    settingsButton.textContent = '前往设置';
    settingsButton.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
      removePopup();
    });
    
    errorElement.appendChild(document.createElement('br'));
    errorElement.appendChild(settingsButton);
  } 
  else if (errorMessage.includes('网络') || errorMessage.includes('连接')) {
    // 网络连接错误
    const errorDetails = document.createElement('div');
    errorDetails.className = 'longport-ai-error-details';
    errorDetails.innerHTML = `
      <p>无法连接到API服务器，请检查：</p>
      <ul>
        <li>您的网络连接是否正常</li>
        <li>API服务器是否可用</li>
        <li>API地址是否正确</li>
      </ul>
    `;
    errorElement.appendChild(errorDetails);
    
    const retryButton = document.createElement('button');
    retryButton.className = 'longport-ai-btn longport-ai-btn-primary';
    retryButton.style.marginTop = '12px';
    retryButton.textContent = '重试';
    retryButton.addEventListener('click', () => {
      removePopup();
      // 如果有保存的文本，重试优化
      if (currentSelection && currentSelection.text) {
        const textToOptimize = currentSelection.text;
        setTimeout(() => optimizeText(textToOptimize), 100);
      }
    });
    
    errorElement.appendChild(retryButton);
  }
  
  content.appendChild(errorElement);
  
  // 弹窗底部
  const footer = document.createElement('div');
  footer.className = 'longport-ai-popup-footer';
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'longport-ai-btn longport-ai-btn-default';
  closeBtn.textContent = '关闭';
  closeBtn.addEventListener('click', removePopup);
  
  footer.appendChild(closeBtn);
  
  // 组装弹窗
  popupElement.appendChild(header);
  popupElement.appendChild(content);
  popupElement.appendChild(footer);
  
  // 智能定位弹窗
  positionPopupIntelligently();
  
  // 添加到页面
  document.body.appendChild(popupElement);
  
  // 设置拖拽功能
  makeElementDraggable(popupElement, header);
  
  // 添加动画效果
  setTimeout(() => {
    if (popupElement) {
      popupElement.style.opacity = '1';
    }
  }, 10);
}

// 移除弹窗
function removePopup(): void {
  if (popupElement && popupElement.parentNode) {
    // 添加淡出动画
    popupElement.style.opacity = '0';
    popupElement.style.transform = 'translate(-50%, -50%) scale(0.95)';
    
    // 等待动画完成后移除
    setTimeout(() => {
      if (popupElement && popupElement.parentNode) {
        popupElement.parentNode.removeChild(popupElement);
        popupElement = null;
      }
    }, 200);
  }
}

// 显示Toast消息
function showToast(message: string, type: 'success' | 'error' = 'success', duration: number = 3000): void {
  // 创建Toast元素
  const toast = document.createElement('div');
  toast.className = `longport-ai-toast longport-ai-toast-${type}`;
  
  // 创建内容
  const content = document.createElement('div');
  content.className = 'longport-ai-toast-content';
  content.textContent = message;
  
  toast.appendChild(content);
  
  // 添加到页面
  document.body.appendChild(toast);
  
  // 设置自动消失
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, duration);
}

// 使用剪贴板复制文本的辅助函数
function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text)
    .then(() => {
      showToast('文本已复制到剪贴板，请手动粘贴', 'success');
    })
    .catch(error => {
      console.error('复制到剪贴板失败:', error);
      showToast('无法复制到剪贴板: ' + (error instanceof Error ? error.message : String(error)), 'error');
      throw error; // 重新抛出错误以便调用者处理
    });
}

// 替换选中文本
function replaceSelectedText(newText: string): void {
  console.log('执行替换选中文本函数，新文本:', newText.substring(0, 20) + '...');
  
  // 检查是否在 longportapp.com 网站上
  const isLongportApp = window.location.hostname.includes('longportapp.com');
  
  if (isLongportApp) {
    console.log('longportapp.com 网站上的替换文本操作');
    
    // 在 longportapp.com 网站上使用特殊处理
    try {
      // 尝试直接使用 execCommand
      if (document.execCommand('insertText', false, newText)) {
        console.log('longportapp.com: execCommand 替换成功');
        showToast('文本替换成功', 'success');
        return;
      }
    } catch (e) {
      console.error('longportapp.com: execCommand 失败', e);
    }
    
    // 如果当前选中区域不存在，尝试使用剪贴板
    if (!currentSelection) {
      console.log('longportapp.com: 没有选中区域，尝试使用剪贴板');
      copyToClipboard(newText)
        .then(() => {
          showToast('文本已复制到剪贴板，请手动粘贴', 'success');
        })
        .catch((error) => {
          console.error('剪贴板操作失败:', error);
          showToast('替换失败，请手动复制粘贴', 'error');
        });
      return;
    }
  }
  
  if (!currentSelection) {
    console.error('没有可替换的文本');
    showToast('没有可替换的文本', 'error');
    return;
  }

  try {
    // 检查是否使用了虚拟范围（临时元素）
    if (window.tempRangeElement) {
      console.log('检测到虚拟范围，使用剪贴板替代');
      
      // 使用剪贴板 API
      copyToClipboard(newText)
        .then(() => {
          // 清理临时元素
          if (window.tempRangeElement && window.tempRangeElement.parentNode) {
            window.tempRangeElement.parentNode.removeChild(window.tempRangeElement);
            window.tempRangeElement = undefined;
          }
        })
        .catch(() => {
          // 错误已在 copyToClipboard 中处理
        });
      
      return;
    }
    
    // 确保有有效的范围
    if (!currentSelection.range) {
      console.error('没有有效的范围');
      showToast('没有有效的范围，无法替换文本', 'error');
      return;
    }

    // 检查目标元素是否是可编辑元素
    const containerElement = currentSelection.range.commonAncestorContainer;
    const isEditable = isEditableElement(containerElement);
    
    // 检查是否在 longportapp.com 网站上
    const isLongportApp = window.location.hostname.includes('longportapp.com');
    
    // 尝试检测 Notion 编辑器
    const isNotionEditor = containerElement && 
      (containerElement.parentElement?.className.includes('notion') || 
       containerElement.parentElement?.parentElement?.className.includes('notion'));
       
    if (isLongportApp) {
      console.log('检测到 longportapp.com 网站，使用增强特殊处理');
      
      // 在 longportapp.com 网站上使用增强特殊处理
      // 直接尝试所有可能的替换方法，直到成功
      
      // 方法 1: 尝试使用 execCommand
      try {
        console.log('longportapp.com: 尝试方法 1 - execCommand');
        const success = document.execCommand('insertText', false, newText);
        if (success) {
          console.log('execCommand 替换成功');
          showToast('文本替换成功', 'success');
          return;
        }
      } catch (execError) {
        console.error('execCommand 替换失败:', execError);
      }
      
      // 方法 2: 尝试使用标准 DOM API
      try {
        console.log('longportapp.com: 尝试方法 2 - 标准 DOM API');
        const textNode = document.createTextNode(newText);
        currentSelection.range.deleteContents();
        currentSelection.range.insertNode(textNode);
        
        // 创建新的范围选择插入的文本
        const selection = window.getSelection();
        if (selection && textNode.parentNode) {
          const range = document.createRange();
          range.selectNodeContents(textNode);
          selection.removeAllRanges();
          selection.addRange(range);
        }
        
        console.log('DOM API 替换成功');
        showToast('文本替换成功', 'success');
        return;
      } catch (domError) {
        console.error('DOM API 替换失败:', domError);
      }
      
      // 方法 3: 尝试使用文档片段
      try {
        console.log('longportapp.com: 尝试方法 3 - 文档片段');
        const range = currentSelection.range;
        range.deleteContents();
        
        // 使用文档片段插入文本
        const fragment = document.createDocumentFragment();
        const textNode = document.createTextNode(newText);
        fragment.appendChild(textNode);
        range.insertNode(fragment);
        
        console.log('文档片段方式替换成功');
        showToast('文本替换成功', 'success');
        return;
      } catch (fragmentError) {
        console.error('文档片段方式替换失败:', fragmentError);
      }
      
      // 方法 4: 尝试使用其他 DOM 操作方式
      try {
        console.log('longportapp.com: 尝试方法 4 - 其他 DOM 操作');
        // 获取当前选中区域的父元素
        const containerElement = currentSelection.range.commonAncestorContainer;
        const parentElement = containerElement.nodeType === Node.TEXT_NODE 
          ? containerElement.parentElement 
          : containerElement as HTMLElement;
          
        if (parentElement) {
          // 尝试设置 innerHTML 或 textContent
          const originalContent = parentElement.innerHTML || parentElement.textContent || '';
          const selectedText = currentSelection.text;
          
          if (originalContent.includes(selectedText)) {
            const newContent = originalContent.replace(selectedText, newText);
            if (parentElement.innerHTML !== undefined) {
              parentElement.innerHTML = newContent;
            } else {
              parentElement.textContent = newContent;
            }
            console.log('父元素内容替换成功');
            showToast('文本替换成功', 'success');
            return;
          }
        }
      } catch (otherDomError) {
        console.error('其他 DOM 操作替换失败:', otherDomError);
      }
      
      // 方法 5: 最后尝试使用剪贴板方式
      console.log('longportapp.com: 尝试方法 5 - 剪贴板');
      copyToClipboard(newText)
        .then(() => {
          console.log('文本已复制到剪贴板，请手动粘贴');
        })
        .catch((clipboardError) => {
          console.error('剪贴板方式失败:', clipboardError);
          showToast('无法替换文本，请尝试手动复制粘贴', 'error');
        });
    } else if (isNotionEditor) {
      console.log('检测到 Notion 编辑器，尝试特殊处理');
      
      // 尝试使用 Notion 特定的方法
      try {
        // 先尝试常规方法
        const textNode = document.createTextNode(newText);
        currentSelection.range.deleteContents();
        currentSelection.range.insertNode(textNode);
        
        // 创建新的范围选择插入的文本
        const selection = window.getSelection();
        if (selection && textNode.parentNode) {
          const range = document.createRange();
          range.selectNodeContents(textNode);
          selection.removeAllRanges();
          selection.addRange(range);
          
          // 延迟显示成功消息，确保替换和选中都已完成
          setTimeout(() => {
            showToast('文本替换成功', 'success');
          }, 100);
        } else {
          showToast('文本替换成功', 'success');
        }
      } catch (notionError) {
        console.error('Notion 编辑器替换失败:', notionError);
        
        // 尝试使用 execCommand 方法（对某些编辑器更有效）
        try {
          document.execCommand('insertText', false, newText);
          showToast('文本替换成功', 'success');
        } catch (execError) {
          console.error('execCommand 替换失败:', execError);
          
          // 回退到剪贴板方法
          copyToClipboard(newText).catch(() => {
            // 错误已在 copyToClipboard 中处理
            showToast('无法替换文本，也无法复制到剪贴板', 'error');
          });
        }
      }
    }
    else if (isEditable) {
      console.log('在可编辑元素中替换文本');
      
      // 尝试使用 execCommand 方法（对某些编辑器更有效）
      try {
        const success = document.execCommand('insertText', false, newText);
        if (success) {
          // 显示成功消息
          showToast('文本替换成功', 'success');
          return;
        }
      } catch (execError) {
        console.log('execCommand 方法失败，尝试使用 DOM API:', execError);
      }
      
      // 创建一个新的文本节点
      const textNode = document.createTextNode(newText);
      
      // 删除选中的内容
      currentSelection.range.deleteContents();
      
      // 插入新的文本节点
      currentSelection.range.insertNode(textNode);
      
      // 创建新的范围选择插入的文本
      const selection = window.getSelection();
      if (selection && textNode.parentNode) {
        const range = document.createRange();
        range.selectNodeContents(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      
      // 延迟显示成功消息，确保替换和选中都已完成
      setTimeout(() => {
        showToast('文本替换成功', 'success');
      }, 100);
    } else {
      // 对于不可编辑元素，尝试使用 clipboard API
      console.log('目标不是可编辑元素，尝试使用剪贴板');
      
      // 将优化后的文本复制到剪贴板
      copyToClipboard(newText).catch(() => {
        // 错误已在 copyToClipboard 中处理
      });
    }
  } catch (error) {
    console.error('替换文本失败:', error);
    
    // 尝试使用剪贴板作为备用方案
    copyToClipboard(newText).catch(() => {
      // 如果剪贴板也失败，显示原始错误
      showToast('替换文本失败: ' + (error instanceof Error ? error.message : String(error)), 'error');
    });
  } finally {
    // 清理临时元素（如果有）
    if (window.tempRangeElement && window.tempRangeElement.parentNode) {
      window.tempRangeElement.parentNode.removeChild(window.tempRangeElement);
      window.tempRangeElement = undefined;
    }
  }
}

// 检查元素是否可编辑
function isEditableElement(node: Node | null): boolean {
  // 首先检查是否在 longportapp.com 网站上
  // 对于 longportapp.com 网站，始终返回 true，以确保替换功能正常工作
  if (window.location.hostname.includes('longportapp.com')) {
    console.log('在 longportapp.com 网站上，元素被视为可编辑');
    return true;
  }
  
  if (!node) return false;
  
  // 如果是文本节点，检查其父元素
  if (node.nodeType === Node.TEXT_NODE) {
    return isEditableElement(node.parentNode);
  }
  
  // 如果是元素节点
  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as Element;
    
    // 检查是否是可编辑元素
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      return true;
    }
    
    // 检查是否有 contentEditable 属性
    if (element.getAttribute('contenteditable') === 'true') {
      return true;
    }
    
    // 递归检查父元素
    return isEditableElement(element.parentNode);
  }
  
  return false;
}

// 使元素可拖拽
function makeElementDraggable(element: HTMLElement, dragHandle: HTMLElement): void {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  
  dragHandle.onmousedown = dragMouseDown;
  
  function dragMouseDown(e: MouseEvent): void {
    e.preventDefault();
    // 获取鼠标初始位置
    pos3 = e.clientX;
    pos4 = e.clientY;
    // 添加拖拽中的视觉反馈
    element.classList.add('longport-ai-dragging');
    // 添加事件监听
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }
  
  function elementDrag(e: MouseEvent): void {
    e.preventDefault();
    // 计算新位置
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // 设置元素新位置
    element.style.top = (element.offsetTop - pos2) + "px";
    element.style.left = (element.offsetLeft - pos1) + "px";
    // 移除默认的 transform
    element.style.transform = 'none';
  }
  
  function closeDragElement(): void {
    // 移除拖拽中的视觉反馈
    element.classList.remove('longport-ai-dragging');
    // 移除事件监听
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

/**
 * 保存优化记录到本地存储
 */
async function saveOptimizationRecord(originalText: string, optimizedText: string, stats: { originalLength: number; optimizedLength: number }): Promise<void> {
  try {
    // 获取当前页面信息
    const sourceUrl = window.location.href;
    const sourceDomain = window.location.hostname;
    
    // 获取优化模式（默认为基础模式）
    const getOptimizationMode = async (): Promise<OptimizationMode> => {
      return new Promise((resolve) => {
        chrome.storage.sync.get(['strictMode'], (items) => {
          const isStrictMode = items.strictMode as boolean;
          resolve(isStrictMode ? OptimizationMode.STRICT : OptimizationMode.BASIC);
        });
      });
    };
    
    const mode = await getOptimizationMode();
    
    // 计算统计信息
    const changeAmount = stats.optimizedLength - stats.originalLength;
    const percentageChange = stats.originalLength > 0 
      ? Math.round((changeAmount / stats.originalLength) * 100) 
      : 0;
    
    // 创建优化统计信息对象
    const optimizationStats = {
      originalLength: stats.originalLength,
      optimizedLength: stats.optimizedLength,
      lengthDifference: changeAmount,
      percentageChange: percentageChange,
      processingTime: 0 // 不记录处理时间，因为这里无法获取
    };
    
    // 保存记录
    await recordManager.saveRecord({
      sourceUrl,
      sourceDomain,
      originalText,
      optimizedText,
      mode,
      stats: optimizationStats
    });
    
    console.log('优化记录已保存');
  } catch (error) {
    console.error('保存优化记录失败:', error);
    // 记录保存失败不影响主流程，所以不抛出异常
  }
}

// 导出一个空对象，确保这是一个有效的模块
export {};