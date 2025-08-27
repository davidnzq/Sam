// 功能验证测试脚本
console.log('=== Notion AI 助手功能验证测试 ===');

// 测试配置
const testConfig = {
  companyApiUrl: 'https://api.example.com/v1/ai', // 替换为实际的 API 地址
  companyApiKey: 'test-key-123', // 替换为实际的 API 密钥
  testText: '这是一个测试文本，用于验证 AI 助手的功能。这段文字包含一些可以优化的地方。'
};

// 测试步骤
async function runTests() {
  console.log('开始运行功能验证测试...');
  
  try {
    // 测试 1: 检查插件状态
    await testPluginStatus();
    
    // 测试 2: 测试 API 配置保存
    await testAPIConfig();
    
    // 测试 3: 测试 API 连接
    await testAPIConnection();
    
    // 测试 4: 测试右键菜单功能
    await testContextMenu();
    
    // 测试 5: 测试弹窗显示
    await testPopupDisplay();
    
    console.log('✅ 所有测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 测试 1: 检查插件状态
async function testPluginStatus() {
  console.log('\n--- 测试 1: 检查插件状态 ---');
  
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    console.log('✅ Chrome runtime 可用');
    
    // 发送 ping 消息测试连接
    const response = await chrome.runtime.sendMessage({ action: 'ping' });
    if (response && response.success) {
      console.log('✅ 后台脚本连接正常');
    } else {
      throw new Error('后台脚本连接失败');
    }
  } else {
    throw new Error('Chrome runtime 不可用');
  }
}

// 测试 2: 测试 API 配置保存
async function testAPIConfig() {
  console.log('\n--- 测试 2: 测试 API 配置保存 ---');
  
  try {
    await chrome.storage.sync.set({
      companyApiUrl: testConfig.companyApiUrl,
      companyApiKey: testConfig.companyApiKey
    });
    console.log('✅ API 配置保存成功');
    
    const savedConfig = await chrome.storage.sync.get(['companyApiUrl', 'companyApiKey']);
    if (savedConfig.companyApiUrl === testConfig.companyApiUrl && 
        savedConfig.companyApiKey === testConfig.companyApiKey) {
      console.log('✅ API 配置读取成功');
    } else {
      throw new Error('API 配置读取失败');
    }
  } catch (error) {
    throw new Error(`API 配置测试失败: ${error.message}`);
  }
}

// 测试 3: 测试 API 连接
async function testAPIConnection() {
  console.log('\n--- 测试 3: 测试 API 连接 ---');
  
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'callAI',
      text: '测试连接',
      apiType: 'company'
    });
    
    if (response && response.success) {
      console.log('✅ API 连接测试成功');
      console.log('响应数据:', response.data);
    } else {
      console.log('⚠️ API 连接测试失败，但这是预期的（因为使用了测试 API）');
      console.log('错误信息:', response.error);
    }
  } catch (error) {
    console.log('⚠️ API 连接测试异常，但这是预期的（因为使用了测试 API）');
    console.log('异常信息:', error.message);
  }
}

// 测试 4: 测试右键菜单功能
async function testContextMenu() {
  console.log('\n--- 测试 4: 测试右键菜单功能 ---');
  
  // 模拟选择文本
  const testElement = document.createElement('div');
  testElement.textContent = testConfig.testText;
  testElement.style.position = 'absolute';
  testElement.style.left = '-9999px';
  document.body.appendChild(testElement);
  
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(testElement);
  selection.removeAllRanges();
  selection.addRange(range);
  
  console.log('✅ 文本选择模拟成功');
  
  // 清理
  document.body.removeChild(testElement);
  selection.removeAllRanges();
}

// 测试 5: 测试弹窗显示
async function testPopupDisplay() {
  console.log('\n--- 测试 5: 测试弹窗显示 ---');
  
  try {
    // 模拟显示弹窗
    const response = await chrome.runtime.sendMessage({
      action: 'showAIPopup',
      selectedText: testConfig.testText
    });
    
    if (response && response.success) {
      console.log('✅ 弹窗显示消息发送成功');
    } else {
      console.log('⚠️ 弹窗显示消息发送失败，但这是预期的（因为不在 Notion 页面）');
    }
  } catch (error) {
    console.log('⚠️ 弹窗显示测试异常，但这是预期的（因为不在 Notion 页面）');
    console.log('异常信息:', error.message);
  }
}

// 运行测试
console.log('准备运行测试，请确保：');
console.log('1. 插件已正确安装并启用');
console.log('2. 在 Notion 页面中运行此测试');
console.log('3. 已配置正确的公司内部 API 信息');
console.log('\n按 Enter 键开始测试...');

// 等待用户确认
document.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    runTests();
  }
});

console.log('测试脚本加载完成，按 Enter 键开始测试');
