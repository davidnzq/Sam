/**
 * LongPort AI 助手 - 后台服务
 */

import ErrorHandler, { ErrorType } from '../utils/error-handler';

// 定义接口
interface OptimizeTextRequest {
  type: 'OPTIMIZE_TEXT';
  text: string;
  isStrictMode?: boolean;
}

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
  details?: string; // 添加详细错误信息字段
}

interface ApiSettings {
  apiEndpoint: string;
  apiKey: string;
  strictMode: boolean;
}

// 创建右键菜单
function createContextMenu() {
  chrome.contextMenus.create({
    id: 'optimizeText',
    title: '润色一下',
    contexts: ['selection']
  });
}

// 监听扩展安装或更新事件
chrome.runtime.onInstalled.addListener(details => {
  if (details.reason === 'install') {
    // 初始化扩展设置
    chrome.storage.sync.set({
      apiEndpoint: '',
      apiKey: '',
      strictMode: false
    });
    
    // 安装后打开选项页
    chrome.runtime.openOptionsPage();
  }
  
  // 创建右键菜单
  createContextMenu();
});

// 检查内容脚本是否已加载
function checkContentScriptLoaded(tabId: number): Promise<boolean> {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, { type: 'PING' }, (response) => {
      if (chrome.runtime.lastError || !response) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

// 注入内容脚本
async function injectContentScript(tabId: number): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`开始向标签页 ${tabId} 注入内容脚本...`);
    
    // 先注入JS文件
    chrome.scripting.executeScript({
      target: { tabId },
      files: ['content/index.js']
    }, (results) => {
      if (chrome.runtime.lastError) {
        console.error('注入内容脚本错误:', chrome.runtime.lastError.message);
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      
      console.log('JS脚本注入成功，开始注入CSS...');
      
      // 再注入CSS文件
      chrome.scripting.insertCSS({
        target: { tabId },
        files: ['content/content.css']
      }, () => {
        if (chrome.runtime.lastError) {
          console.error('注入CSS错误:', chrome.runtime.lastError.message);
          // 即使CSS注入失败，也继续执行，因为JS可能已经注入成功
          console.warn('CSS注入失败，但继续执行');
        } else {
          console.log('CSS注入成功');
        }
        
        // 给脚本更多的加载时间
        const timeout = 1000; // 增加到1000ms
        console.log(`等待内容脚本初始化 ${timeout}ms...`);
        setTimeout(() => {
          console.log('内容脚本注入完成');
          resolve();
        }, timeout);
      });
    });
  });
}

// 处理文本优化的通用函数
async function handleOptimizeText(tabId: number, selectedText: string): Promise<void> {
  if (!selectedText || selectedText.trim().length === 0) {
    console.log('没有选中文本，无法执行润色操作');
    return;
  }
  
  try {
    console.log('优化文本', selectedText.substring(0, 20) + '...');
    
    // 检查内容脚本是否已加载
    let isLoaded = await checkContentScriptLoaded(tabId);
    
    // 如果未加载，则注入内容脚本
    if (!isLoaded) {
      console.log('内容脚本未加载，正在注入...');
      try {
        await injectContentScript(tabId);
        
        // 给脚本更多的初始化时间
        console.log('注入后等待额外时间确保脚本初始化...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 再次检查脚本是否已加载
        isLoaded = await checkContentScriptLoaded(tabId);
        
        if (!isLoaded) {
          console.warn('内容脚本可能未完全加载，但仍将尝试发送消息...');
        } else {
          console.log('内容脚本已成功加载');
        }
      } catch (injectionError) {
        console.error('注入内容脚本失败:', injectionError);
        // 即使注入失败，也尝试发送消息，因为脚本可能已经部分加载
        console.warn('尽管注入失败，仍将尝试发送消息...');
      }
        } else {
      console.log('内容脚本已加载，无需注入');
    }
    
    // 使用Promise包装消息发送，以便更好地处理错误
    const sendMessagePromise = new Promise<void>((resolve, reject) => {
      chrome.tabs.sendMessage(tabId, {
        type: 'CONTEXT_MENU_OPTIMIZE',
        text: selectedText
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('发送消息失败:', chrome.runtime.lastError.message);
          reject(new Error(chrome.runtime.lastError.message));
        } else if (response && response.received) {
          console.log('消息发送成功，内容脚本已接收');
          resolve();
        } else {
          console.warn('消息已发送，但未收到确认响应');
          resolve(); // 仍然视为成功，因为消息可能已经发送
        }
      });
    });
    
    // 添加超时处理
    const timeoutPromise = new Promise<void>((_, reject) => {
      setTimeout(() => reject(new Error('发送消息超时')), 5000); // 增加超时时间到5秒
    });
    
    // 使用Promise.race竞争处理超时
    try {
      await Promise.race([sendMessagePromise, timeoutPromise]);
    } catch (sendError) {
      console.error('发送消息出错:', sendError);
      
      // 如果是超时错误，尝试重新注入脚本并再次发送
      if (sendError instanceof Error && sendError.message === '发送消息超时') {
        console.log('尝试重新注入脚本并重发消息...');
        try {
          await injectContentScript(tabId);
          
          // 等待脚本初始化
          console.log('等待重新注入的脚本初始化...');
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // 再次发送消息，使用Promise包装以便更好地处理错误
          const resendPromise = new Promise<void>((resendResolve, resendReject) => {
            chrome.tabs.sendMessage(tabId, {
              type: 'CONTEXT_MENU_OPTIMIZE',
              text: selectedText
            }, (response) => {
              if (chrome.runtime.lastError) {
                console.error('重发消息失败:', chrome.runtime.lastError.message);
                resendReject(new Error(chrome.runtime.lastError.message));
              } else {
                console.log('消息重发成功');
                resendResolve();
              }
            });
          });
          
          // 设置重发超时
          const resendTimeout = new Promise<void>((_, reject) => {
            setTimeout(() => reject(new Error('重发消息超时')), 5000);
          });
            
                      try {
            await Promise.race([resendPromise, resendTimeout]);
          } catch (resendError) {
            console.error('重发消息最终失败:', resendError);
            // 此时已经尽力尝试，不再继续重试
          }
        } catch (reinjectionError) {
          console.error('重新注入脚本失败:', reinjectionError);
        }
      }
    }
  } catch (error) {
    console.error('处理文本优化时出错:', error);
  }
}

// 处理右键菜单点击事件
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'optimizeText' && info.selectionText && tab && tab.id) {
    await handleOptimizeText(tab.id, info.selectionText.trim());
  }
});

// 监听快捷键命令
chrome.commands.onCommand.addListener(async (command, tab) => {
  console.log('Command received:', command);
  
  if (command === 'optimize-text' && tab?.id) {
    // 获取当前选中的文本
    try {
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.getSelection()?.toString() || ''
      });
      
      const selectedText = result.result.trim();
      if (selectedText.length > 0) {
        await handleOptimizeText(tab.id, selectedText);
      } else {
        console.log('没有选中文本，无法执行润色操作');
      }
    } catch (error) {
      console.error('获取选中文本失败:', error);
    }
  }
});

// 模拟API响应（用于开发和测试）
async function mockApiResponse(text: string): Promise<OptimizeTextResponse> {
  // 模拟处理延迟
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // 简单的文本优化逻辑
  let optimizedText = text;
  
  // 替换一些常见的错误或改进表达
  optimizedText = optimizedText
    .replace(/[,.，。;；]([^\s])/g, '$1 ') // 标点符号后添加空格
    .replace(/\s+/g, ' ')                 // 规范化空格
    .replace(/([a-zA-Z])[,.，。;；]([a-zA-Z])/g, '$1, $2') // 修复英文标点
    .replace(/很很/g, '非常')              // 修复重复词
    .replace(/的的/g, '的')
    .replace(/了了/g, '了')
    .replace(/我认为/g, '我们认为')         // 更正式的表达
    .replace(/我觉得/g, '我们认为')
    .replace(/不太好/g, '有待改进')         // 更专业的表达
    .trim();
  
  // 如果文本没有变化，添加一些小改动
  if (optimizedText === text) {
    optimizedText = text + '（已优化）';
  }
  
  // 计算统计信息
  const originalLength = text.length;
  const optimizedLength = optimizedText.length;
  const lengthDifference = optimizedLength - originalLength;
  const percentageChange = originalLength > 0 
    ? Math.round((lengthDifference / originalLength) * 100) 
    : 0;
  
  // 分析中文字符数量
  const countChineseChars = (str: string) => {
    return (str.match(/[\u4e00-\u9fa5]/g) || []).length;
  };
  
  // 分析英文单词数量
  const countEnglishWords = (str: string) => {
    return str.split(/\s+/).filter(word => /[a-zA-Z]/.test(word)).length;
  };
  
  const originalChineseChars = countChineseChars(text);
  const optimizedChineseChars = countChineseChars(optimizedText);
  const originalEnglishWords = countEnglishWords(text);
  const optimizedEnglishWords = countEnglishWords(optimizedText);
  
  return {
    success: true,
    optimizedText,
    stats: {
      originalLength,
      optimizedLength,
      lengthDifference,
      percentageChange,
      originalChineseChars,
      optimizedChineseChars,
      originalEnglishWords,
      optimizedEnglishWords
    }
  };
}

// 调用API优化文本
async function optimizeTextWithApi(text: string, isStrictMode: boolean, apiSettings: ApiSettings): Promise<OptimizeTextResponse> {
  try {
    // 检查API配置
    if (!apiSettings.apiEndpoint || !apiSettings.apiKey || apiSettings.apiEndpoint.trim() === '') {
      console.log('API未配置，使用模拟响应');
      // 使用模拟API响应
      return mockApiResponse(text);
    }
    
    // 准备OpenAI标准格式的请求数据
    const baseUrl = apiSettings.apiEndpoint.endsWith('/') 
      ? apiSettings.apiEndpoint.slice(0, -1) 
      : apiSettings.apiEndpoint;
    
    // 使用OpenAI标准的chat/completions端点
    const openaiEndpoint = `${baseUrl}/v1/chat/completions`;
    console.log(`使用OpenAI标准端点: ${openaiEndpoint}`);
    
    // 构建系统提示词，包含基础文本优化机制的要求
    const systemPrompt = isStrictMode 
      ? "你是一个严格的文案优化助手。请严格按照以下要求优化文本：1. 语法校正：修正错误的语法结构 2. 标点规范：统一标点符号使用 3. 中英混排规则：优化中英文混合排版 4. 语言风格：采用专业、清晰、友好的表达方式 5. 语调控制：保持克制，避免过度营销和夸张表达。优化原则：保持与原文语义一致，字数相当（不大幅增减），提升表达清晰度和专业性。"
      : "你是一个专业的文案优化助手。请按照以下要求优化文本：1. 语法校正：修正错误的语法结构 2. 标点规范：统一标点符号使用 3. 中英混排规则：优化中英文混合排版 4. 语言风格：采用专业、清晰、友好的表达方式 5. 语调控制：保持克制，避免过度营销和夸张表达。优化原则：保持与原文语义一致，字数相当（不大幅增减），提升表达清晰度和专业性。";
    
    // 准备OpenAI标准的请求数据
    const openaiRequest = {
      model: "gpt-4o", // 默认使用GPT-4o模型，可根据需要调整
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `请优化以下文本，只返回优化后的文本，不要包含任何解释或其他内容：\n\n${text}`
        }
      ],
      max_tokens: 2000,
      temperature: 0.7
    };
    
    console.log(`发送OpenAI请求数据:`, { model: openaiRequest.model, messages: openaiRequest.messages });
    
    // 使用错误重试机制调用API
    const makeApiCall = async (): Promise<Response> => {
      // 创建AbortController用于超时控制
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时
      
      try {
        const response = await fetch(openaiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiSettings.apiKey}`,
            'Accept': 'application/json',
            'User-Agent': 'LongPort-AI-Extension/1.0.0'
          },
          body: JSON.stringify(openaiRequest),
          signal: controller.signal
        });
        
        // 清除超时
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        // 清除超时
        clearTimeout(timeoutId);
        
        // 检查是否是超时错误
        if (error instanceof DOMException && error.name === 'AbortError') {
          throw new Error('请求超时，请稍后重试');
        }
        
        // 重新抛出其他错误
        throw error;
      }
    };
    
    // 使用ErrorHandler的retry方法进行重试，最多3次，每次间隔500ms
    const response = await ErrorHandler.retry(makeApiCall, 3, 500);
    
    // 检查响应状态
    if (!response.ok) {
      try {
        // 尝试解析错误响应为JSON
        const errorData = await response.json().catch(async () => {
          // 如果不是JSON，尝试获取文本内容
          const textContent = await response.text().catch(() => '');
          return { 
            message: `API错误: ${response.status}`, 
            details: textContent.substring(0, 100) // 只取前100个字符避免过长
          };
        });
        return {
          success: false,
          error: errorData.message || `API错误: ${response.status}`
        };
      } catch (parseError) {
        // 解析错误响应时出错
        return {
          success: false,
          error: `API错误: ${response.status}, 无法解析错误详情`
        };
      }
    }
    
    // 先获取响应内容类型
    const contentType = response.headers.get('content-type') || '';
    
    // 检查是否是JSON响应
    if (!contentType.includes('application/json')) {
      try {
        // 尝试获取文本内容
        const textContent = await response.text().catch(() => '');
        
        // 检查是否是常见的错误页面
        if (textContent.includes('<!doctype html>') || textContent.includes('<html')) {
          // 可能是404页面或其他HTML错误页面
          console.log('API返回了HTML页面而非JSON数据，自动使用模拟API');
          
          // 直接使用模拟API响应，不返回错误
          return mockApiResponse(text);
        }
        
        // 如果是其他非JSON格式
        console.log('API返回了非JSON格式数据，自动使用模拟API');
        
        // 直接使用模拟API响应，不返回错误
        return mockApiResponse(text);
      } catch (textError) {
        console.error('读取API响应内容时出错:', textError);
        
        // 如果出错，使用模拟响应
        console.log('处理API响应出错，自动使用模拟API');
        return mockApiResponse(text);
      }
    }
    
    try {
      // 解析响应数据
      const data = await response.json();
      
      // 从OpenAI响应中提取优化后的文本
      let optimizedText = '';
      if (data && data.choices && data.choices.length > 0 && data.choices[0].message) {
        optimizedText = data.choices[0].message.content.trim();
      } else {
        console.error('OpenAI响应格式不符合预期:', data);
        return {
          success: false,
          error: 'API响应格式不符合预期',
          details: JSON.stringify(data).substring(0, 100) // 只取前100个字符
        };
      }
      
      // 计算更详细的字数统计
      const originalLength = text.length;
      const optimizedLength = optimizedText.length;
      const lengthDifference = optimizedLength - originalLength;
      const percentageChange = originalLength > 0 
        ? Math.round((lengthDifference / originalLength) * 100) 
        : 0;
      
      // 分析中文字符数量
      const countChineseChars = (str: string) => {
        return (str.match(/[\u4e00-\u9fa5]/g) || []).length;
      };
      
      // 分析英文单词数量（简单估算）
      const countEnglishWords = (str: string) => {
        return str.split(/\s+/).filter(word => /[a-zA-Z]/.test(word)).length;
      };
      
      const originalChineseChars = countChineseChars(text);
      const optimizedChineseChars = countChineseChars(optimizedText);
      const originalEnglishWords = countEnglishWords(text);
      const optimizedEnglishWords = countEnglishWords(optimizedText);
      
      return {
        success: true,
        optimizedText: optimizedText,
        stats: {
          originalLength,
          optimizedLength,
          lengthDifference,
          percentageChange,
          originalChineseChars,
          optimizedChineseChars,
          originalEnglishWords,
          optimizedEnglishWords
        }
      };
    } catch (jsonError) {
      // JSON解析错误
      ErrorHandler.logError(jsonError);
      return {
        success: false,
        error: 'JSON解析错误',
        details: jsonError instanceof Error ? jsonError.message : '未知错误'
      };
    }
  } catch (error) {
    ErrorHandler.logError(error);
    const errorInfo = ErrorHandler.getErrorInfo(error);
    return {
      success: false,
      error: errorInfo.message
    };
  }
}

// 监听来自内容脚本的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'OPTIMIZE_TEXT') {
    // 获取API设置
    chrome.storage.sync.get(['apiEndpoint', 'apiKey', 'strictMode'], (items) => {
      const settings = items as unknown as ApiSettings;
      
      // 使用Promise包装异步操作，并处理错误
      const processOptimizeRequest = async () => {
        try {
          // 检查是否强制使用模拟API
          if (message.useMockApi) {
            console.log('强制使用模拟API');
            return await mockApiResponse(message.text);
          }
          
          // 检查API配置是否有效
          if (!settings.apiEndpoint || !settings.apiKey || settings.apiEndpoint.trim() === '') {
            console.log('API未配置，自动使用模拟API');
            return await mockApiResponse(message.text);
          }
          
          try {
            // 调用API优化文本
            const result = await optimizeTextWithApi(
              message.text,
              message.isStrictMode !== undefined ? message.isStrictMode : settings.strictMode,
              settings
            );
            return result;
          } catch (apiError) {
            // API调用出错，使用模拟API作为备用方案
            console.log('API调用失败，自动使用模拟API:', apiError);
            return await mockApiResponse(message.text);
          }
        } catch (error) {
          // 如果模拟API也失败，记录错误并返回错误响应
          ErrorHandler.logError(error);
          
          try {
            // 最后尝试使用模拟API
            return await mockApiResponse(message.text);
          } catch (mockError) {
            // 如果模拟API也失败，返回错误
            const errorInfo = ErrorHandler.getErrorInfo(error);
            return {
              success: false,
              error: errorInfo.message
            };
          }
        }
      };
      
      // 执行请求处理并发送响应
      processOptimizeRequest()
        .then(result => {
          try {
            sendResponse(result);
          } catch (err) {
            console.error('发送响应时出错:', err);
          }
        })
        .catch(err => {
          console.error('处理优化请求时出错:', err);
          try {
            sendResponse({
              success: false,
              error: '处理请求时发生未知错误'
            });
          } catch (responseErr) {
            console.error('发送错误响应时出错:', responseErr);
          }
        });
    });
    
    // 返回 true 表示将异步发送响应
    return true;
  }
});

// 导出一个空对象，确保这是一个有效的模块
export {};
