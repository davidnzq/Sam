// 内容脚本管理模块

// 注入内容脚本和样式
export async function injectContentScripts(tabId) {
  try {
    console.log('开始注入内容脚本到标签页:', tabId);
    
    // 注入 CSS
    await chrome.scripting.insertCSS({
      target: { tabId: tabId },
      files: ['content.css']
    });
    console.log('CSS 注入成功');
    
    // 注入 JavaScript
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    });
    console.log('JavaScript 注入成功');
    
    return true;
  } catch (error) {
    console.error('内容脚本注入失败:', error);
    return false;
  }
}

// 检查内容脚本是否已注入
export async function checkContentScript(tabId) {
  try {
    console.log('检查内容脚本是否已注入到标签页:', tabId);
    const response = await chrome.tabs.sendMessage(tabId, { action: 'ping' });
    console.log('内容脚本响应:', response);
    return response && response.success;
  } catch (error) {
    console.log('检查内容脚本失败:', error.message);
    return false;
  }
}

// 确保内容脚本已注入
export async function ensureContentScriptInjected(tabId) {
  try {
    // 首先检查是否已注入
    const isInjected = await checkContentScript(tabId);
    
    if (!isInjected) {
      console.log('内容脚本未注入，开始注入...');
      
      // 尝试最多3次注入
      let injectionSuccess = false;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (!injectionSuccess && attempts < maxAttempts) {
        attempts++;
        console.log(`尝试注入内容脚本 (尝试 ${attempts}/${maxAttempts})...`);
        
        injectionSuccess = await injectContentScripts(tabId);
        
        if (!injectionSuccess) {
          console.log(`注入尝试 ${attempts} 失败，${attempts < maxAttempts ? '将重试' : '已达到最大尝试次数'}`);
          if (attempts < maxAttempts) {
            // 等待一段时间后重试
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }
      
      if (!injectionSuccess) {
        throw new Error(`内容脚本注入失败，已尝试 ${maxAttempts} 次`);
      }
      
      // 等待内容脚本初始化
      console.log('注入成功，等待内容脚本初始化...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 再次检查是否注入成功
      const isInjectedAfter = await checkContentScript(tabId);
      if (!isInjectedAfter) {
        // 尝试再次等待并检查
        console.log('内容脚本似乎未响应，再次等待...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const finalCheck = await checkContentScript(tabId);
        if (!finalCheck) {
          throw new Error('内容脚本注入后仍然无法连接');
        }
      }
    }
    
    console.log('内容脚本已就绪');
    return true;
    
  } catch (error) {
    console.error('确保内容脚本注入失败:', error);
    return false;
  }
}
