// 消息处理模块
import { handleAICall } from './ai-service.js';

// 设置消息处理器
export function setupMessageHandlers() {
  // 处理来自内容脚本的 API 调用请求
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('收到消息:', request, '来自:', sender);
    
    if (request.action === "callAI") {
      console.log('处理 AI 调用请求:', request);
      
      // 检查是否使用增强参数
      const useEnhancedParams = request.useEnhancedParams === true;
      console.log('是否使用增强参数:', useEnhancedParams);
      
      // 如果使用增强参数，则传递增强选项
      const options = useEnhancedParams ? {
        isEnhanced: true,
        temperature: 0.9,
        presence_penalty: 0.6,
        frequency_penalty: 0.6
      } : {};
      
      // 如果使用增强参数，修改文本以增加差异性
      let processedText = request.text;
      if (useEnhancedParams) {
        // 添加明确的优化指令，确保API生成不同的内容
        processedText = `请对以下文本进行显著优化，确保优化后的内容与原文有明显区别（至少30%的差异）。保持原文核心含义，但表达方式和用词必须有显著变化：\n\n${request.text}`;
        console.log('使用增强提示词:', processedText.substring(0, 100) + '...');
      }
      
      handleAICall(processedText, request.apiType, request.siteType, options)
        .then(result => {
          console.log('AI 调用成功，结果:', result);
          
          // 根据调用来源返回不同格式的响应
          if (sender.tab && sender.tab.url && sender.tab.url.includes('options.html')) {
            // 来自设置页面的调用，返回options期望的格式
            console.log('🎯 来自设置页面的调用，返回options期望的格式');
            console.log('📤 发送给options的响应:', { 
              success: true, 
              optimizedText: result,
              result: result,
              text: result,
              message: 'AI优化成功',
              isEnhanced: useEnhancedParams
            });
            
            sendResponse({ 
              success: true, 
              optimizedText: result,
              result: result,
              text: result,
              message: 'AI优化成功',
              isEnhanced: useEnhancedParams
            });
          } else {
            // 来自内容脚本的调用，返回原有格式
            console.log('🎯 来自内容脚本的调用，返回原有格式');
            console.log('📤 发送给内容脚本的响应:', { 
              success: true, 
              optimizedText: result,
              isEnhanced: useEnhancedParams 
            });
            
            sendResponse({ 
              success: true, 
              optimizedText: result,
              isEnhanced: useEnhancedParams
            });
          }
        })
        .catch(error => {
          console.error('AI 调用失败:', error);
          sendResponse({ 
            success: false, 
            error: error.message,
            isEnhanced: useEnhancedParams
          });
        });
      return true; // 保持消息通道开放
    }
    
    // 处理 OPTIMIZE 消息
    if (request.type === 'OPTIMIZE') {
      console.log('处理 OPTIMIZE 请求:', request);
      try {
        // 使用现有的 handleAICall 函数处理文本优化，增加重试逻辑
        const maxRetries = 2;
        let retryCount = 0;
        
        const attemptOptimize = () => {
          console.log(`OPTIMIZE 尝试 ${retryCount + 1}/${maxRetries + 1}`);
          
          // 根据重试次数调整参数
          const options = retryCount > 0 ? {
            temperature: 0.8 + (retryCount * 0.1), // 增加随机性
            presence_penalty: 0.5 + (retryCount * 0.1),
            frequency_penalty: 0.5 + (retryCount * 0.1),
            retry_attempt: retryCount
          } : {};
          
          handleAICall(request.text, 'company', request.siteType || 'general', options)
            .then(res => {
              console.log('OPTIMIZE 调用成功，结果:', res);
              sendResponse({ok: true, res: res});
            })
            .catch(e => {
              console.error(`OPTIMIZE 调用失败 (尝试 ${retryCount + 1}/${maxRetries + 1}):`, e);
              
              // 检查是否为超时错误
              const isTimeoutError = e.message && (
                e.message.includes('timed out') || 
                e.message.includes('timeout') || 
                e.message.includes('AbortError')
              );
              
              if (retryCount < maxRetries && (isTimeoutError || e.message.includes('API端点'))) {
                retryCount++;
                console.log(`OPTIMIZE 将重试 (${retryCount}/${maxRetries})...`);
                // 延迟一段时间后重试
                setTimeout(attemptOptimize, 1000 * retryCount);
              } else {
                // 所有重试都失败，返回错误
                console.error('OPTIMIZE 所有重试都失败:', e);
                sendResponse({ok: false, error: String(e)});
              }
            });
        };
        
        // 开始第一次尝试
        attemptOptimize();
        
        return true; // 保持消息通道开放
      } catch (e) {
        console.error('OPTIMIZE 处理异常:', e);
        sendResponse({ok: false, error: String(e)});
        return true;
      }
    }
    
    // 处理 ping 消息
    if (request.action === "ping") {
      console.log('收到 ping 消息');
      sendResponse({ success: true, message: "后台脚本正在运行" });
      return false;
    }
    
    // 处理内容脚本就绪消息
    if (request.action === "contentScriptReady") {
      console.log('内容脚本已就绪:', request);
      sendResponse({ success: true, message: "收到内容脚本就绪消息" });
      return false;
    }
    
    // 处理请求优化消息
    if (request.action === "requestOptimization") {
      // 优化文本
      handleAICall(request.text, 'company', request.siteType)
        .then(optimizedText => {
          // 注入脚本显示结果
          chrome.scripting.executeScript({
            target: { tabId: sender.tab.id },
            args: [{ original: request.text, optimized: optimizedText }],
            function: (args) => {
              const { original, optimized } = args;
              
              // 移除加载弹窗
              const oldPopup = document.querySelector('div[style*="z-index: 9999999"]');
              if (oldPopup) {
                oldPopup.remove();
              }
              
              // 创建结果弹窗
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
              
              // 添加键盘事件监听 - Space 键快速替换
              document.addEventListener('keydown', function spaceHandler(e) {
                if (e.key === ' ' || e.code === 'Space') {
                  e.preventDefault();
                  document.getElementById('ai-replace-btn').click();
                  document.removeEventListener('keydown', spaceHandler);
                }
              });
            }
          });
        })
        .catch(error => {
          console.error('优化失败:', error);
          chrome.scripting.executeScript({
            target: { tabId: sender.tab.id },
            function: () => {
              // 移除加载弹窗
              const oldPopup = document.querySelector('div[style*="z-index: 9999999"]');
              if (oldPopup) {
                oldPopup.remove();
              }
              alert('LongPort AI 助手：文本优化失败，请稍后重试');
            }
          });
        });
      
      return true; // 保持消息通道开放
    }
  });
}
