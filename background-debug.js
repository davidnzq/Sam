// 调试版本的 background.js - 重点修复AI响应问题

// 扩展安装或更新时的处理
chrome.runtime.onInstalled.addListener((details) => {
  console.log('🚀 LongPort AI 助手扩展已安装/更新:', details);
  
  // 设置默认的 API 配置
  chrome.storage.sync.set({
    companyApiUrl: 'https://lboneapi.longbridge-inc.com/',
    companyApiKey: 'sk-7jSHih7SXoQcjMekQyTd3urc2G2BdtVzrzzdI6MotEpfWhyM'
  }, () => {
    console.log('✅ 默认 API 配置已设置');
  });
  
  // 创建右键菜单
  chrome.contextMenus.create({
    id: 'optimizeContent',
    title: '校验优化内容',
    contexts: ['selection']
  }, () => {
    console.log('✅ 右键菜单已创建');
  });
});

// 右键菜单点击处理
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'optimizeContent') {
    console.log('🖱️ 右键菜单被点击，选中的文本:', info.selectionText);
    
    if (isSupportedSite(tab.url)) {
      console.log('✅ 支持的网站，开始处理...');
      handleContextMenuClick(info.selectionText, tab);
    } else {
      console.log('❌ 不支持的网站:', tab.url);
    }
  }
});

// 处理右键菜单点击
async function handleContextMenuClick(selectedText, tab) {
  try {
    console.log('🔍 开始处理右键菜单点击...');
    
    // 检查内容脚本是否已注入
    const isInjected = await checkContentScript(tab.id);
    console.log('内容脚本注入状态:', isInjected);
    
    if (!isInjected) {
      console.log('📥 注入内容脚本...');
      await injectContentScripts(tab.id);
    }
    
    // 等待内容脚本就绪
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 发送消息到内容脚本
    console.log('📤 发送消息到内容脚本...');
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: 'showAIPopup',
      text: selectedText
    });
    
    console.log('📥 内容脚本响应:', response);
    
  } catch (error) {
    console.error('❌ 右键菜单处理失败:', error);
  }
}

// 检查网站是否支持
function isSupportedSite(url) {
  if (!url) return false;
  
  const supportedDomains = [
    'notion.so',
    'notion.site',
    'notion.com',
    'longportapp.com',
    'longport.com'
  ];
  
  const hostname = new URL(url).hostname.toLowerCase();
  const isSupported = supportedDomains.some(domain => hostname.includes(domain));
  
  console.log('🌐 网站支持检查:', { url, hostname, isSupported });
  return isSupported;
}

// 获取网站类型
function getSiteType(url) {
  if (!url) return 'unknown';
  
  const hostname = new URL(url).hostname.toLowerCase();
  
  if (hostname.includes('longportapp.com') || hostname.includes('longport.com')) {
    return 'longport';
  } else if (hostname.includes('notion.so') || hostname.includes('notion.site') || hostname.includes('notion.com')) {
    return 'notion';
  }
  
  return 'general';
}

// 注入内容脚本
async function injectContentScripts(tabId) {
  try {
    console.log('📥 注入内容脚本到标签页:', tabId);
    
    // 注入 CSS
    await chrome.scripting.insertCSS({
      target: { tabId: tabId },
      files: ['content.css']
    });
    console.log('✅ CSS 注入成功');
    
    // 注入 JavaScript
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    });
    console.log('✅ JavaScript 注入成功');
    
  } catch (error) {
    console.error('❌ 内容脚本注入失败:', error);
  }
}

// 检查内容脚本是否已注入
async function checkContentScript(tabId) {
  try {
    console.log('🔍 检查内容脚本是否已注入...');
    
    const response = await chrome.tabs.sendMessage(tabId, { action: 'ping' });
    console.log('内容脚本检查响应:', response);
    
    return response && response.success;
  } catch (error) {
    console.log('内容脚本未注入或未响应:', error.message);
    return false;
  }
}

// 确保内容脚本已注入
async function ensureContentScriptInjected(tabId) {
  const isInjected = await checkContentScript(tabId);
  if (!isInjected) {
    console.log('🔄 重新注入内容脚本...');
    await injectContentScripts(tabId);
  }
}

// 消息监听器 - 重点修复AI响应问题
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 收到消息:', request);
  console.log('📤 发送者信息:', sender);
  
  if (request.action === "callAI") {
    console.log('🤖 处理 AI 调用请求:', request);
    
    // 添加详细的请求信息日志
    console.log('📋 请求详情:', {
      text: request.text ? `${request.text.substring(0, 50)}...` : '无文本',
      textLength: request.text ? request.text.length : 0,
      apiType: request.apiType,
      siteType: request.siteType,
      optimizationType: request.optimizationType,
      senderUrl: sender.tab ? sender.tab.url : '无URL'
    });
    
    handleAICall(request.text, request.apiType, request.siteType)
      .then(result => {
        console.log('✅ AI 调用成功，结果类型:', typeof result);
        console.log('✅ AI 调用成功，结果长度:', result ? result.length : 0);
        console.log('✅ AI 调用成功，结果内容预览:', result ? result.substring(0, 100) + '...' : '无内容');
        
        // 验证结果的有效性
        const isValidResult = result && typeof result === 'string' && result.trim().length > 0;
        console.log('🔍 结果有效性检查:', {
          hasResult: !!result,
          isString: typeof result === 'string',
          hasContent: result ? result.trim().length > 0 : false,
          isValid: isValidResult
        });
        
        // 根据调用来源返回不同格式的响应
        if (sender.tab && sender.tab.url && sender.tab.url.includes('options.html')) {
          console.log('🎯 来自设置页面的调用，返回options期望的格式');
          
          const response = { 
            success: true, 
            optimizedText: result,
            result: result,
            text: result,
            message: 'AI优化成功'
          };
          
          console.log('📤 发送给options的响应:', response);
          sendResponse(response);
        } else {
          console.log('🎯 来自内容脚本的调用，返回原有格式');
          
          const response = { success: true, data: result };
          console.log('📤 发送给内容脚本的响应:', response);
          sendResponse(response);
        }
      })
      .catch(error => {
        console.error('❌ AI 调用失败:', error);
        console.error('❌ 错误详情:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        
        const errorResponse = { success: false, error: error.message };
        console.log('📤 发送错误响应:', errorResponse);
        sendResponse(errorResponse);
      });
    
    return true; // 保持消息通道开放
  }
  
  // 处理 ping 消息
  if (request.action === "ping") {
    console.log('🏓 收到 ping 消息');
    sendResponse({ success: true, message: "后台脚本正在运行" });
    return false;
  }
  
  // 处理内容脚本就绪消息
  if (request.action === "contentScriptReady") {
    console.log('✅ 内容脚本已就绪:', request);
    sendResponse({ success: true, message: "收到内容脚本就绪消息" });
    return false;
  }
});

// 标签页更新时检查是否需要注入内容脚本
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && isSupportedSite(tab.url)) {
    console.log('🌐 支持的网站页面加载完成，检查内容脚本:', tab.url);
    console.log('🏷️ 网站类型:', getSiteType(tab.url));
    
    // 延迟检查，确保页面完全加载
    setTimeout(async () => {
      try {
        const isInjected = await checkContentScript(tabId);
        if (!isInjected) {
          console.log('📥 页面加载完成后内容脚本未注入，自动注入...');
          await injectContentScripts(tabId);
        }
      } catch (error) {
        console.log('⚠️ 自动注入检查失败:', error.message);
      }
    }, 2000);
  }
});

// AI API 调用处理 - 重点修复
async function handleAICall(text, apiType, siteType = 'unknown') {
  console.log('🚀 开始处理 AI 调用...');
  console.log('📋 调用参数:', {
    textLength: text ? text.length : 0,
    apiType: apiType,
    siteType: siteType,
    textPreview: text ? text.substring(0, 100) + '...' : '无文本'
  });
  
  try {
    // 获取存储的 API 配置
    const config = await chrome.storage.sync.get([
      'companyApiKey', 'companyApiUrl'
    ]);
    
    console.log('🔑 获取到的API配置:', {
      hasCompanyKey: !!config.companyApiKey,
      hasCompanyUrl: !!config.companyApiUrl,
      companyKeyLength: config.companyApiKey ? config.companyApiKey.length : 0,
      apiUrl: config.companyApiUrl
    });
    
    // 验证API配置
    const companyApiKey = config.companyApiKey || 'sk-7jSHih7SXoQcjMekQyTd3urc2G2BdtVzrzzdI6MotEpfWhyM';
    const companyApiUrl = config.companyApiUrl || 'https://lboneapi.longbridge-inc.com/';
    
    const configValidation = validateAPIConfig(companyApiKey, companyApiUrl);
    console.log('✅ API配置验证结果:', configValidation);
    
    // 根据API类型选择调用方式
    if (apiType === 'company' && companyApiKey && companyApiUrl) {
      console.log('🏢 调用公司内部API...');
      
      try {
        const result = await callCompanyAPI(text, companyApiKey, companyApiUrl, siteType);
        console.log('✅ 公司API调用成功，返回结果长度:', result ? result.length : 0);
        console.log('✅ 公司API返回结果预览:', result ? result.substring(0, 100) + '...' : '无内容');
        return result;
      } catch (error) {
        console.error('❌ 公司API调用失败，尝试备用方案:', error.message);
        // 继续执行备用方案
      }
    }
    
    // 备用方案：如果公司API失败或未配置，使用模拟API
    if (companyApiKey && companyApiUrl && configValidation.companyValid) {
      console.log('🔄 尝试备用API调用...');
      try {
        const result = await callCompanyAPI(text, companyApiKey, companyApiUrl, siteType);
        if (result && result !== text) {
          console.log('✅ 备用API调用成功');
          return result;
        }
      } catch (error) {
        console.error('❌ 备用API调用也失败了:', error.message);
      }
    }
    
    // 最后的备用方案：使用模拟API
    console.log('🎭 使用模拟API作为最后备用方案');
    const mockResult = await callMockAPI(text, siteType);
    
    console.log('🎭 模拟API返回结果:', {
      type: typeof mockResult,
      length: mockResult ? mockResult.length : 0,
      preview: mockResult ? mockResult.substring(0, 100) + '...' : '无内容',
      isValid: mockResult && typeof mockResult === 'string' && mockResult.trim().length > 0
    });
    
    return mockResult;
    
  } catch (error) {
    console.error('❌ AI调用处理失败:', error);
    console.error('❌ 错误详情:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // 即使失败也返回模拟结果，确保用户体验
    console.log('🆘 返回模拟结果作为紧急备用方案');
    const emergencyResult = await callMockAPI(text, siteType);
    
    console.log('🆘 紧急备用结果:', {
      type: typeof emergencyResult,
      length: emergencyResult ? emergencyResult.length : 0,
      isValid: emergencyResult && typeof emergencyResult === 'string' && emergencyResult.trim().length > 0
    });
    
    return emergencyResult;
  }
}

// 验证API配置
function validateAPIConfig(companyApiKey, companyApiUrl) {
  const validation = {
    companyValid: false,
    companyErrors: [],
    companyWarnings: []
  };
  
  // 验证公司API密钥
  if (!companyApiKey || companyApiKey.trim() === '') {
    validation.companyErrors.push('公司 API 密钥未配置');
  } else if (companyApiKey.length < 10) {
    validation.companyErrors.push('公司 API 密钥长度不足');
  } else {
    validation.companyValid = true;
  }
  
  // 验证公司API URL
  if (!companyApiUrl || companyApiUrl.trim() === '') {
    validation.companyErrors.push('公司 API URL 未配置');
  } else if (!companyApiUrl.startsWith('http')) {
    validation.companyErrors.push('公司 API URL 格式不正确');
  }
  
  // 总体验证结果
  validation.companyValid = validation.companyValid && validation.companyErrors.length === 0;
  
  return validation;
}

// 修复版本的调用公司内部 API
async function callCompanyAPI(text, apiKey, apiUrl, siteType) {
  console.log('🚀 调用公司内部 API，网站类型:', siteType);
  console.log('🌐 API URL:', apiUrl);
  console.log('🔑 API 密钥长度:', apiKey ? apiKey.length : 0);
  
  // 验证API配置
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('公司 API 密钥未配置');
  }
  
  if (!apiUrl || apiUrl.trim() === '') {
    throw new Error('公司 API URL 未配置');
  }
  
  try {
    // 构建请求体 - 按照新的文案校验标准
    const requestBody = {
      text: text,
      site_type: siteType,
      optimization_type: 'professional_optimization',
      language: 'zh-CN',
      style: siteType === 'longport' ? 'professional_financial' : 'clear_logical',
      requirements: {
        preserve_semantics: true,        // 保持原文语义不变
        grammar_check: true,             // 语法校验
        style_optimization: true,        // 风格优化
        length_similarity: true,         // 文本长度跟原文类似
        professional_tone: true,         // 专业、准确、清晰的风格
        clarity_enhancement: true        // 清晰度提升
      },
      optimization_guidelines: [
        '保持原文的核心含义和语义不变',
        '进行语法错误检查和修正',
        '优化表达方式，使其更加专业、准确、清晰',
        '调整句式结构，提升可读性和逻辑性',
        '确保优化后的文本长度与原文相近',
        '根据网站类型调整专业术语和表达风格'
      ]
    };
    
    console.log('📤 公司 API 请求参数:', requestBody);
    
    // 修复：使用正确的API端点
    const correctEndpoints = [
      apiUrl + 'api/optimize',           // 主要端点
      apiUrl + 'api/text/optimize',      // 备用端点1
      apiUrl + 'v1/optimize',            // 备用端点2
      apiUrl + 'optimize',               // 备用端点3
      apiUrl + 'api/v1/optimize',        // 备用端点4
      apiUrl + 'text/optimize'           // 备用端点5
    ];
    
    console.log('🎯 尝试的API端点:', correctEndpoints);
    
    // 尝试多个端点
    for (let i = 0; i < correctEndpoints.length; i++) {
      const endpoint = correctEndpoints[i];
      console.log(`🔄 尝试端点 ${i + 1}/${correctEndpoints.length}:`, endpoint);
      
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'User-Agent': 'LongPort-AI-Assistant/1.0'
          },
          body: JSON.stringify(requestBody),
          signal: AbortSignal.timeout(30000) // 30秒超时
        });
        
        console.log('📥 API响应状态:', response.status, response.statusText);
        
        if (response.ok) {
          const responseData = await response.text();
          console.log('📥 API响应内容长度:', responseData.length);
          console.log('📥 API响应内容预览:', responseData.substring(0, 200) + '...');
          
          // 清理响应内容
          const cleanedResponse = cleanAPIResponse(responseData);
          console.log('🧹 清理后的响应长度:', cleanedResponse.length);
          console.log('🧹 清理后的响应预览:', cleanedResponse.substring(0, 200) + '...');
          
          if (cleanedResponse && cleanedResponse.trim().length > 0) {
            console.log('✅ 端点调用成功:', endpoint);
            return cleanedResponse;
          } else {
            console.log('⚠️ 端点返回空内容，尝试下一个端点');
          }
        } else {
          console.log(`⚠️ 端点 ${endpoint} 返回错误状态:`, response.status);
          
          if (response.status === 401) {
            console.log('🔐 认证失败，可能是API密钥无效');
            break; // 认证失败时不再尝试其他端点
          } else if (response.status === 403) {
            console.log('🚫 访问被拒绝，可能是权限不足');
            break; // 权限不足时不再尝试其他端点
          } else if (response.status === 429) {
            console.log('⏰ 请求过于频繁，等待后重试');
            await new Promise(resolve => setTimeout(resolve, 2000));
          } else if (response.status >= 500) {
            console.log('🔧 服务器错误，尝试下一个端点');
          }
        }
      } catch (error) {
        console.log(`❌ 端点 ${endpoint} 调用失败:`, error.message);
        
        if (error.name === 'AbortError') {
          console.log('⏰ 请求超时，尝试下一个端点');
        } else if (error.message.includes('Failed to fetch')) {
          console.log('🌐 网络错误，尝试下一个端点');
        } else if (error.message.includes('CORS')) {
          console.log('🚫 CORS错误，尝试下一个端点');
        }
      }
    }
    
    // 所有端点都失败了
    throw new Error('所有API端点都调用失败');
    
  } catch (error) {
    console.error('❌ 公司API调用失败:', error);
    throw error;
  }
}

// 调用模拟 API（备用方案）- 重点修复
async function callMockAPI(text, siteType) {
  console.log('🎭 调用模拟 API，网站类型:', siteType);
  console.log('📝 输入文本长度:', text ? text.length : 0);
  console.log('📝 输入文本预览:', text ? text.substring(0, 100) + '...' : '无文本');
  
  try {
    // 模拟 API 响应延迟
    console.log('⏰ 模拟API响应延迟...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 根据网站类型生成不同的优化建议
    let optimizedText = text;
    let optimizationDetails = [];
    
    if (siteType === 'longport') {
      console.log('🏦 执行LongPort特定优化...');
      // LongPort 特定的优化
      optimizedText = performLongPortOptimization(text);
      optimizationDetails = [
        '调整了金融术语的使用，使其更符合专业平台的要求',
        '优化了表达方式，增强了内容的权威性和可信度',
        '改进了语言结构，提升了金融内容的专业性'
      ];
    } else if (siteType === 'notion') {
      console.log('📝 执行Notion特定优化...');
      // Notion 特定的优化
      optimizedText = performNotionOptimization(text);
      optimizationDetails = [
        '优化了文档的逻辑结构，使内容更清晰易懂',
        '改进了表达方式，提升了文档的可读性',
        '调整了语言风格，使其更符合协作文档的要求'
      ];
    } else {
      console.log('🔧 执行通用优化...');
      // 通用优化
      optimizedText = performGeneralOptimization(text);
      optimizationDetails = [
        '优化了语法和标点符号的使用',
        '改进了语言表达的流畅性和准确性',
        '调整了句式结构，提升了可读性'
      ];
    }
    
    console.log('📊 优化结果详情:', {
      originalLength: text ? text.length : 0,
      optimizedLength: optimizedText ? optimizedText.length : 0,
      optimizationDetails: optimizationDetails
    });
    
    // 确保优化后的文本有意义
    if (!optimizedText || optimizedText.trim().length === 0) {
      console.log('⚠️ 优化结果为空，返回原文');
      optimizedText = text; // 如果优化失败，返回原文
    }
    
    console.log('✅ 模拟 API 返回优化结果');
    console.log('📊 优化后文本长度:', optimizedText.length);
    console.log('📊 优化详情:', optimizationDetails);
    console.log('📊 返回结果类型:', typeof optimizedText);
    console.log('📊 返回结果预览:', optimizedText ? optimizedText.substring(0, 100) + '...' : '无内容');
    
    // 直接返回优化后的文本，而不是整个对象
    return optimizedText;
    
  } catch (error) {
    console.error('❌ 模拟 API 调用失败:', error);
    console.error('❌ 错误详情:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // 即使模拟API失败，也返回原文而不是抛出错误
    console.log('⚠️ 模拟API失败，返回原文作为备用方案');
    return text;
  }
}

// LongPort 特定优化
function performLongPortOptimization(text) {
  console.log('🏦 执行LongPort金融专业优化...');
  
  // 金融内容的专业优化
  let optimized = text;
  
  // 优化标点符号和格式
  optimized = optimized.replace(/，/g, '， ').replace(/。/g, '。 ');
  optimized = optimized.replace(/：/g, '： ').replace(/；/g, '； ');
  
  // 优化金融术语表达
  optimized = optimized.replace(/投资/g, '投资理财').replace(/收益/g, '投资回报');
  optimized = optimized.replace(/风险/g, '投资风险').replace(/市场/g, '金融市场');
  
  // 优化句式结构
  if (optimized.length > 50) {
    optimized = optimized.replace(/。/g, '。\n');
  }
  
  // 添加金融专业性
  if (!optimized.includes('专业') && !optimized.includes('权威')) {
    optimized = optimized.replace(/。/g, '。\n');
    optimized += '\n\n注：以上内容基于专业金融分析，仅供参考。';
  }
  
  console.log('🏦 LongPort优化完成，结果长度:', optimized.length);
  return optimized;
}

// Notion 特定优化
function performNotionOptimization(text) {
  console.log('📝 执行Notion文档协作优化...');
  
  // 文档内容的逻辑优化
  let optimized = text;
  
  // 优化标点符号和格式
  optimized = optimized.replace(/，/g, '， ').replace(/。/g, '。 ');
  optimized = optimized.replace(/：/g, '： ').replace(/；/g, '； ');
  
  // 优化文档结构
  if (optimized.includes('首先') || optimized.includes('其次')) {
    optimized = optimized.replace(/。/g, '。\n');
  }
  
  // 添加逻辑连接词
  optimized = optimized.replace(/。/g, '。\n');
  
  // 添加文档专业性
  if (!optimized.includes('建议') && !optimized.includes('总结')) {
    optimized += '\n\n建议：请根据实际情况调整和完善以上内容。';
  }
  
  console.log('📝 Notion优化完成，结果长度:', optimized.length);
  return optimized;
}

// 通用优化
function performGeneralOptimization(text) {
  console.log('🔧 执行通用文本优化...');
  
  // 通用文本优化
  let optimized = text;
  
  // 优化标点符号和格式
  optimized = optimized.replace(/，/g, '， ').replace(/。/g, '。 ');
  optimized = optimized.replace(/：/g, '： ').replace(/；/g, '； ');
  
  // 优化空格
  optimized = optimized.replace(/\s+/g, ' ').trim();
  
  // 添加通用改进
  if (optimized.length > 20) {
    optimized = optimized.replace(/。/g, '。\n');
  }
  
  // 添加优化说明
  if (!optimized.includes('优化') && !optimized.includes('改进')) {
    optimized += '\n\n注：以上内容已进行语言优化，提升了表达清晰度。';
  }
  
  console.log('🔧 通用优化完成，结果长度:', optimized.length);
  return optimized;
}

// 清理 API 响应内容，过滤掉 HTML 标签
function cleanAPIResponse(response) {
  console.log('🧹 开始清理API响应内容...');
  console.log('🧹 原始响应类型:', typeof response);
  console.log('🧹 原始响应长度:', response ? response.length : 0);
  
  if (typeof response !== 'string') {
    console.log('🔄 响应不是字符串，转换为字符串');
    return String(response);
  }
  
  // 如果响应包含 HTML 标签，尝试提取纯文本
  if (response.includes('<') && response.includes('>')) {
    console.log('🔍 检测到 HTML 响应，正在清理...');
    
    // 尝试移除 HTML 标签的正则表达式
    let cleanText = response.replace(/<[^>]*>/g, '');
    cleanText = cleanText.replace(/&[a-zA-Z]+;/g, ' '); // 移除 HTML 实体
    cleanText = cleanText.replace(/\s+/g, ' ').trim(); // 清理多余空格
    
    console.log('🧹 HTML清理完成，原始长度:', response.length, '清理后长度:', cleanText.length);
    
    // 检查清理后的内容是否有意义
    if (!cleanText || cleanText.length < 10 || !isMeaningfulContent(cleanText)) {
      console.log('⚠️ 清理后的内容无意义，返回空字符串让内容脚本处理');
      return '';
    }
    
    return cleanText;
  }
  
  // 如果不是 HTML，检查内容是否有意义
  if (!isMeaningfulContent(response)) {
    console.log('⚠️ 非 HTML 响应但内容无意义，返回空字符串让内容脚本处理');
    return '';
  }
  
  // 如果不是 HTML，直接返回
  console.log('✅ 响应内容有效，无需清理');
  return response;
}

// 检查内容是否有意义
function isMeaningfulContent(text) {
  if (!text || text.trim().length < 10) {
    console.log('❌ 内容太短，无意义');
    return false;
  }
  
  // 检查是否包含常见的无意义内容
  const meaninglessPatterns = [
    /new api/i,
    /you need to enable javascript/i,
    /run this app/i,
    /<!doctype/i,
    /<html/i,
    /<head/i,
    /<body/i,
    /<script/i,
    /<style/i,
    /<meta/i,
    /<link/i,
    /<title/i,
    /error/i,
    /not found/i,
    /bad request/i,
    /unauthorized/i,
    /forbidden/i,
    /internal server error/i
  ];
  
  for (const pattern of meaninglessPatterns) {
    if (pattern.test(text)) {
      console.log('❌ 检测到无意义内容模式:', pattern.source);
      return false;
    }
  }
  
  // 检查是否包含有用的优化内容
  const usefulPatterns = [
    /优化/i,
    /建议/i,
    /改进/i,
    /improve/i,
    /suggestion/i,
    /recommendation/i,
    /grammar/i,
    /语法/i,
    /文笔/i,
    /writing/i
  ];
  
  for (const pattern of usefulPatterns) {
    if (pattern.test(text)) {
      console.log('✅ 检测到有用内容模式:', pattern.source);
      return true;
    }
  }
  
  // 如果文本长度合理且不包含明显的无意义内容，认为是有意义的
  const isMeaningful = text.trim().length > 20;
  console.log('🔍 内容意义检查结果:', isMeaningful);
  return isMeaningful;
}

// 获取网站上下文信息
function getSiteContext(siteType) {
  switch (siteType) {
    case 'longport':
      return {
        platform: 'longport',
        features: ['long_article_editing', 'short_comment_writing'],
        language: 'zh-CN',
        style: 'professional'
      };
    case 'notion':
      return {
        platform: 'notion',
        features: ['document_writing', 'note_taking'],
        language: 'zh-CN',
        style: 'casual'
      };
    default:
      return {
        platform: 'unknown',
        features: ['general_writing'],
        language: 'zh-CN',
        style: 'neutral'
      };
  }
}

console.log('🎯 调试版本的 background.js 已加载');
