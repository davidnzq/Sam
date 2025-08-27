// 弹窗页面脚本 - LongPort AI 助手 v1.3.1
document.addEventListener('DOMContentLoaded', function() {
  console.log('LongPort AI 助手弹窗页面加载完成');
  
  // 加载 API 状态
  loadAPIStatus();
  
  // 绑定事件
  bindEvents();
});

// 绑定事件
function bindEvents() {
  console.log('绑定弹窗事件监听器...');
  
  // 打开设置页面
  const openOptionsBtn = document.getElementById('openOptions');
  if (openOptionsBtn) {
    openOptionsBtn.addEventListener('click', function() {
      chrome.runtime.openOptionsPage();
    });
    console.log('✅ 绑定打开设置按钮');
  }
  
  // 刷新状态
  const refreshStatusBtn = document.getElementById('refreshStatus');
  if (refreshStatusBtn) {
    refreshStatusBtn.addEventListener('click', function() {
      loadAPIStatus();
    });
    console.log('✅ 绑定刷新状态按钮');
  }
  
  console.log('弹窗事件绑定完成');
}

// 加载 API 状态
async function loadAPIStatus() {
  console.log('加载 API 状态...');
  
  try {
    const result = await chrome.storage.sync.get([
      'companyApiKey', 'companyApiUrl', 'openaiApiKey', 'doubanApiKey'
    ]);
    
    console.log('从存储中获取的配置:', result);
    
    // 更新公司内部 API 状态
    updateCompanyStatus(result);
    
    // 更新 OpenAI API 状态
    updateOpenAIStatus(result);
    
    // 更新豆包 API 状态
    updateDoubanStatus(result);
    
    console.log('API 状态加载完成');
    
  } catch (error) {
    console.error('加载状态失败:', error);
    updateStatusIndicator('companyStatus', false, '加载失败');
    updateStatusIndicator('openaiStatus', false, '加载失败');
    updateStatusIndicator('doubanStatus', false, '加载失败');
  }
}

// 更新公司内部 API 状态
function updateCompanyStatus(result) {
  const hasCustomConfig = result.companyApiKey && result.companyApiUrl;
  const hasDefaultConfig = true; // 默认配置总是可用的
  
  if (hasCustomConfig) {
    updateStatusIndicator('companyStatus', true, '自定义配置');
  } else {
    updateStatusIndicator('companyStatus', true, '默认配置');
  }
}

// 更新 OpenAI API 状态
function updateOpenAIStatus(result) {
  const hasConfig = result.openaiApiKey;
  
  if (hasConfig) {
    updateStatusIndicator('openaiStatus', true, '已配置');
  } else {
    updateStatusIndicator('openaiStatus', false, '未配置');
  }
}

// 更新豆包 API 状态
function updateDoubanStatus(result) {
  const hasConfig = result.doubanApiKey;
  
  if (hasConfig) {
    updateStatusIndicator('doubanStatus', true, '已配置');
  } else {
    updateStatusIndicator('doubanStatus', false, '未配置');
  }
}

// 更新状态指示器
function updateStatusIndicator(elementId, isConfigured, configType = '') {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`状态指示器元素不存在: ${elementId}`);
    return;
  }
  
  const statusText = element.querySelector('.status-indicator') || element;
  
  if (isConfigured) {
    statusText.textContent = configType || '已配置';
    statusText.className = 'status-indicator configured';
  } else {
    statusText.textContent = '未配置';
    statusText.className = 'status-indicator not-configured';
  }
  
  console.log(`状态更新 [${elementId}]: ${isConfigured ? '已配置' : '未配置'} - ${configType}`);
}

// 测试 API 连接状态
async function testAPIStatus() {
  console.log('开始测试 API 连接状态...');
  
  // 测试公司内部 API
  await testCompanyAPI();
  
  // 测试 OpenAI API
  await testOpenAIAPI();
  
  // 测试豆包 API
  await testDoubanAPI();
  
  console.log('API 连接状态测试完成');
}

// 测试公司内部 API
async function testCompanyAPI() {
  const companyStatus = document.getElementById('companyStatus');
  if (!companyStatus) return;
  
  if (companyStatus.textContent.includes('配置')) {
    companyStatus.textContent = '测试中...';
    companyStatus.className = 'status-indicator working';
    
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'callAI',
        text: '测试连接',
        apiType: 'company',
        siteType: 'notion'
      });
      
      if (response && response.success) {
        companyStatus.textContent = '正常';
        companyStatus.className = 'status-indicator configured';
      } else {
        companyStatus.textContent = '错误';
        companyStatus.className = 'status-indicator error';
      }
    } catch (error) {
      console.error('公司内部 API 测试失败:', error);
      companyStatus.textContent = '错误';
      companyStatus.className = 'status-indicator error';
    }
  }
}

// 测试 OpenAI API
async function testOpenAIAPI() {
  const openaiStatus = document.getElementById('openaiStatus');
  if (!openaiStatus) return;
  
  if (openaiStatus.textContent.includes('已配置')) {
    openaiStatus.textContent = '测试中...';
    openaiStatus.className = 'status-indicator working';
    
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'callAI',
        text: '测试连接',
        apiType: 'openai',
        siteType: 'notion'
      });
      
      if (response && response.success) {
        openaiStatus.textContent = '正常';
        openaiStatus.className = 'status-indicator configured';
      } else {
        openaiStatus.textContent = '错误';
        openaiStatus.className = 'status-indicator error';
      }
    } catch (error) {
      console.error('OpenAI API 测试失败:', error);
      openaiStatus.textContent = '错误';
      openaiStatus.className = 'status-indicator error';
    }
  }
}

// 测试豆包 API
async function testDoubanAPI() {
  const doubanStatus = document.getElementById('doubanStatus');
  if (!doubanStatus) return;
  
  if (doubanStatus.textContent.includes('已配置')) {
    doubanStatus.textContent = '测试中...';
    doubanStatus.className = 'status-indicator working';
    
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'callAI',
        text: '测试连接',
        apiType: 'douban',
        siteType: 'notion'
      });
      
      if (response && response.success) {
        doubanStatus.textContent = '正常';
        doubanStatus.className = 'status-indicator configured';
      } else {
        doubanStatus.textContent = '错误';
        doubanStatus.className = 'status-indicator error';
      }
    } catch (error) {
      console.error('豆包 API 测试失败:', error);
      doubanStatus.textContent = '错误';
      doubanStatus.className = 'status-indicator error';
    }
  }
}

// 页面加载完成后的初始化
console.log('LongPort AI 助手弹窗页面脚本加载完成');
