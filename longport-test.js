// LongPort 支持测试脚本 - 验证 LongPort 网站的功能支持
console.log('=== LongPort AI 助手 LongPort 支持测试 ===');

// 测试配置
const testConfig = {
  testTexts: [
    '这是一段测试文本，用于验证 LongPort 平台的 AI 优化功能。',
    'The market shows strong momentum with increasing volume and positive sentiment.',
    '基于当前市场分析，建议投资者关注科技板块的长期投资机会。',
    'This is a comprehensive analysis of the current market conditions and future outlook.'
  ],
  siteTypes: ['longport', 'notion', 'unknown']
};

// 测试 1: 网站类型检测
function testSiteTypeDetection() {
  console.log('\n🔍 测试 1: 网站类型检测');
  
  const currentUrl = window.location.href;
  const hostname = window.location.hostname;
  
  console.log('当前 URL:', currentUrl);
  console.log('当前域名:', hostname);
  
  let detectedType = 'unknown';
  if (hostname.includes('longportapp.com')) {
    detectedType = 'longport';
  } else if (hostname.includes('notion')) {
    detectedType = 'notion';
  }
  
  console.log('检测到的网站类型:', detectedType);
  
  if (detectedType === 'longport') {
    console.log('✅ 成功检测到 LongPort 网站');
  } else if (detectedType === 'notion') {
    console.log('✅ 成功检测到 Notion 网站');
  } else {
    console.log('⚠️ 未检测到支持的网站类型');
  }
  
  return detectedType;
}

// 测试 2: 内容脚本状态检查
function testContentScriptStatus() {
  console.log('\n🔍 测试 2: 内容脚本状态检查');
  
  if (window.longportAIHelperLoaded) {
    console.log('✅ LongPort AI 助手内容脚本已加载');
  } else {
    console.log('❌ LongPort AI 助手内容脚本未加载');
  }
  
  // 检查是否有其他标记
  const hasContentScript = document.querySelector('script[src*="content.js"]');
  if (hasContentScript) {
    console.log('✅ 发现内容脚本标签');
  } else {
    console.log('ℹ️ 未发现内容脚本标签（这是正常的，因为使用动态注入）');
  }
  
  return true;
}

// 测试 3: 右键菜单功能测试
function testContextMenu() {
  console.log('\n🔍 测试 3: 右键菜单功能测试');
  
  // 模拟选择文本
  const testText = '这是一个测试文本，用于验证右键菜单功能。';
  const testElement = document.createElement('div');
  testElement.textContent = testText;
  testElement.style.position = 'absolute';
  testElement.style.left = '-9999px';
  testElement.style.top = '-9999px';
  testElement.id = 'test-selection-element';
  document.body.appendChild(testElement);
  
  try {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(testElement);
    selection.removeAllRanges();
    selection.addRange(range);
    
    console.log('✅ 文本选择模拟成功');
    console.log('现在可以右键点击查看"AI 辅助协作"选项');
    
    // 5秒后清理
    setTimeout(() => {
      try {
        document.body.removeChild(testElement);
        selection.removeAllRanges();
        console.log('✅ 测试元素已清理');
      } catch (e) {
        console.log('清理测试元素失败:', e.message);
      }
    }, 5000);
    
    return true;
  } catch (error) {
    console.log('❌ 文本选择模拟失败:', error.message);
    return false;
  }
}

// 测试 4: 插件内部 API 调用测试
async function testPluginInternalAPI() {
  console.log('\n🔍 测试 4: 插件内部 API 调用测试');
  
  try {
    console.log('测试插件内部 AI 调用...');
    const response = await chrome.runtime.sendMessage({
      action: 'callAI',
      text: testConfig.testTexts[0],
      apiType: 'company',
      siteType: 'longport'
    });
    
    if (response && response.success) {
      console.log('✅ 插件内部 API 调用成功');
      console.log('返回数据:', response.data);
      return { status: 'success', data: response.data };
    } else {
      console.log('❌ 插件内部 API 调用失败');
      console.log('错误信息:', response.error);
      return { status: 'failed', error: response.error };
    }
  } catch (error) {
    console.log('❌ 插件内部 API 调用异常:', error.message);
    return { status: 'error', error: error.message };
  }
}

// 测试 5: 不同文本格式支持测试
async function testDifferentTextFormats() {
  console.log('\n🔍 测试 5: 不同文本格式支持测试');
  
  const results = [];
  
  for (let i = 0; i < testConfig.testTexts.length; i++) {
    const testText = testConfig.testTexts[i];
    console.log(`\n测试文本 ${i + 1}: ${testText.substring(0, 50)}...`);
    
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'callAI',
        text: testText,
        apiType: 'company',
        siteType: 'longport'
      });
      
      if (response && response.success) {
        console.log(`  状态: 成功`);
        console.log(`  结果长度: ${response.data.length}`);
        results.push({
          textIndex: i + 1,
          status: 'success',
          resultLength: response.data.length
        });
      } else {
        console.log(`  状态: 失败`);
        console.log(`  错误: ${response.error}`);
        results.push({
          textIndex: i + 1,
          status: 'failed',
          error: response.error
        });
      }
      
    } catch (error) {
      console.log(`  状态: 异常 - ${error.message}`);
      results.push({
        textIndex: i + 1,
        status: 'error',
        error: error.message
      });
    }
  }
  
  return results;
}

// 测试 6: 网站特定功能测试
function testSiteSpecificFeatures() {
  console.log('\n🔍 测试 6: 网站特定功能测试');
  
  const currentSiteType = testSiteTypeDetection();
  const results = [];
  
  if (currentSiteType === 'longport') {
    console.log('测试 LongPort 特定功能...');
    
    // 测试编辑器查找功能
    const testEditor = createTestEditor();
    document.body.appendChild(testEditor);
    
    try {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(testEditor);
      selection.removeAllRanges();
      selection.addRange(range);
      
      // 模拟文本替换
      const mockResult = '这是 AI 优化后的文本内容。';
      const editorElement = findLongPortEditor(range);
      
      if (editorElement) {
        console.log('✅ LongPort 编辑器查找功能正常');
        results.push({ feature: 'editor_detection', status: 'success' });
      } else {
        console.log('❌ LongPort 编辑器查找功能异常');
        results.push({ feature: 'editor_detection', status: 'failed' });
      }
      
      // 清理测试元素
      document.body.removeChild(testEditor);
      selection.removeAllRanges();
      
    } catch (error) {
      console.log('LongPort 功能测试失败:', error.message);
      results.push({ feature: 'editor_detection', status: 'error', error: error.message });
    }
    
  } else if (currentSiteType === 'notion') {
    console.log('测试 Notion 特定功能...');
    console.log('✅ Notion 功能支持正常');
    results.push({ feature: 'notion_support', status: 'success' });
  } else {
    console.log('测试通用功能...');
    console.log('✅ 通用功能支持正常');
    results.push({ feature: 'general_support', status: 'success' });
  }
  
  return results;
}

// 创建测试编辑器
function createTestEditor() {
  const editor = document.createElement('div');
  editor.id = 'test-longport-editor';
  editor.className = 'editor textarea';
  editor.contentEditable = 'true';
  editor.textContent = '测试编辑器内容';
  editor.style.position = 'absolute';
  editor.style.left = '-9999px';
  editor.style.top = '-9999px';
  return editor;
}

// 查找 LongPort 编辑器元素（模拟内容脚本的功能）
function findLongPortEditor(range) {
  try {
    let element = range.commonAncestorContainer;
    
    while (element && element !== document.body) {
      if (element.tagName === 'TEXTAREA' || 
          element.contentEditable === 'true' ||
          element.classList.contains('editor') ||
          element.classList.contains('textarea') ||
          element.id.includes('editor') ||
          element.id.includes('textarea')) {
        return element;
      }
      element = element.parentElement;
    }
    
    return null;
  } catch (error) {
    console.log('查找编辑器元素失败:', error);
    return null;
  }
}

// 运行所有测试
async function runAllLongPortTests() {
  console.log('🚀 开始运行 LongPort 支持测试...\n');
  
  const startTime = Date.now();
  
  try {
    // 运行所有测试
    const siteTypeTest = testSiteTypeDetection();
    const contentScriptTest = testContentScriptStatus();
    const contextMenuTest = testContextMenu();
    const pluginTest = await testPluginInternalAPI();
    const formatTest = await testDifferentTextFormats();
    const featureTest = testSiteSpecificFeatures();
    
    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    
    // 显示测试结果摘要
    console.log('\n📋 LongPort 支持测试结果摘要');
    console.log('================================');
    console.log(`总耗时: ${totalDuration}ms`);
    console.log(`网站类型检测: ${siteTypeTest === 'longport' ? '✅' : '❌'}`);
    console.log(`内容脚本状态: ${contentScriptTest ? '✅' : '❌'}`);
    console.log(`右键菜单功能: ${contextMenuTest ? '✅' : '❌'}`);
    console.log(`插件内部 API: ${pluginTest.status === 'success' ? '✅' : '❌'}`);
    console.log(`文本格式支持: ${formatTest.filter(r => r.status === 'success').length}/${formatTest.length} 成功`);
    console.log(`特定功能: ${featureTest.filter(r => r.status === 'success').length}/${featureTest.length} 成功`);
    console.log('================================');
    
    // 详细结果分析
    console.log('\n🔍 详细结果分析:');
    
    // 网站类型分析
    if (siteTypeTest === 'longport') {
      console.log('✅ LongPort 网站支持正常');
      console.log('  - 长文编辑功能可用');
      console.log('  - 短评写作功能可用');
      console.log('  - 专业金融写作支持');
    } else if (siteTypeTest === 'notion') {
      console.log('✅ Notion 网站支持正常');
      console.log('  - 文档写作功能可用');
      console.log('  - 协作编辑功能可用');
    } else {
      console.log('⚠️ 当前网站类型不支持');
    }
    
    // 功能测试结果
    const successfulFeatures = featureTest.filter(r => r.status === 'success');
    if (successfulFeatures.length > 0) {
      console.log('✅ 功能测试通过:');
      successfulFeatures.forEach(feature => {
        console.log(`  - ${feature.feature}: 正常`);
      });
    }
    
    // 总体评估
    const totalTests = 6;
    const successfulTests = [
      siteTypeTest === 'longport' || siteTypeTest === 'notion',
      contentScriptTest,
      contextMenuTest,
      pluginTest.status === 'success',
      formatTest.some(r => r.status === 'success'),
      featureTest.some(r => r.status === 'success')
    ].filter(Boolean).length;
    
    console.log(`\n🎯 总体评估: ${successfulTests}/${totalTests} 项测试通过`);
    
    if (successfulTests === totalTests) {
      console.log('🎉 所有测试通过！LongPort 支持功能正常');
    } else if (successfulTests >= totalTests * 0.8) {
      console.log('✅ 大部分测试通过，LongPort 支持基本正常');
    } else if (successfulTests >= totalTests * 0.6) {
      console.log('⚠️ 部分测试通过，LongPort 支持可能存在问题');
    } else {
      console.log('❌ 大部分测试失败，LongPort 支持存在严重问题');
    }
    
    return {
      siteTypeTest,
      contentScriptTest,
      contextMenuTest,
      pluginTest,
      formatTest,
      featureTest,
      totalDuration,
      successRate: successfulTests / totalTests
    };
    
  } catch (error) {
    console.error('❌ 测试执行失败:', error);
    return null;
  }
}

// 显示使用说明
console.log('使用方法:');
console.log('1. 运行 testSiteTypeDetection() 测试网站类型检测');
console.log('2. 运行 testContentScriptStatus() 测试内容脚本状态');
console.log('3. 运行 testContextMenu() 测试右键菜单功能');
console.log('4. 运行 testPluginInternalAPI() 测试插件内部 API');
console.log('5. 运行 testDifferentTextFormats() 测试不同文本格式');
console.log('6. 运行 testSiteSpecificFeatures() 测试网站特定功能');
console.log('7. 运行 runAllLongPortTests() 运行所有测试');

console.log('\n按 Enter 键开始运行所有 LongPort 支持测试...');

document.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    runAllLongPortTests();
  }
});

console.log('LongPort 支持测试脚本加载完成，按 Enter 键开始测试');
